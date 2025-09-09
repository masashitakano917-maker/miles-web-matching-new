// project/api/matching.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || ''
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || ''
const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const MAIL_FROM = process.env.MAIL_FROM || 'noreply@example.com'

// 80km固定
const RADIUS_KM = 80

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false },
})

type CreatePayload = {
  user_id?: string
  client_name: string
  client_email: string
  phone?: string
  postal?: string
  prefecture?: string
  city?: string
  address2?: string
  note?: string
  service: 'photo' | 'clean' | 'staff'
  plan_key: string // '20' | '30' | など
  plan_title?: string
  first_pref_at?: string
  second_pref_at?: string
  third_pref_at?: string
}

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (v: number) => (v * Math.PI) / 180
  const R = 6371
  const dLat = toRad(bLat - aLat)
  const dLng = toRad(bLng - aLng)
  const la1 = toRad(aLat)
  const la2 = toRad(bLat)
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

async function geocode(addr: string) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    addr,
  )}&key=${GOOGLE_MAPS_API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Geocoding failed')
  const json = (await res.json()) as any
  const loc = json?.results?.[0]?.geometry?.location
  if (!loc) throw new Error('Geocoding: zero_results')
  return { lat: loc.lat as number, lng: loc.lng as number }
}

async function getRequiredLabels(service: string, plan_key: string) {
  const { data, error } = await sb
    .from('plan_requirements')
    .select('required_labels,title')
    .eq('service', service)
    .eq('plan_key', plan_key)
    .single()
  if (error) throw error
  return {
    labels: (data?.required_labels || []) as string[],
    title: (data?.title as string) || '',
  }
}

async function notifyByEmail(to: string, subject: string, text: string) {
  if (!RESEND_API_KEY) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: MAIL_FROM,
      to: [to],
      subject,
      text,
    }),
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const action = String(req.query.action || '')

    // ========== 依頼作成 ==========
    if (req.method === 'POST' && action === 'create_request') {
      const b = req.body as CreatePayload

      // 住所テキストを一体化してジオコーディング
      const addressText = [b.postal, b.prefecture, b.city, b.address2]
        .filter(Boolean)
        .join(' ')
      const { lat, lng } = await geocode(addressText)

      // 必要ラベルの取得
      const { labels: required_labels, title: prTitle } = await getRequiredLabels(
        b.service,
        b.plan_key,
      )

      // 依頼を保存（存在しないカラムは無視せず落ちるので“安全に”揃えてあります）
      const { data: inserted, error: insErr } = await sb
        .from('requests')
        .insert([
          {
            user_id: b.user_id || null,
            client_name: b.client_name,
            client_email: b.client_email,
            phone: b.phone || null,
            postal: b.postal || null,
            prefecture: b.prefecture || null,
            city: b.city || null,
            address2: b.address2 || null,
            note: b.note || null,
            service: b.service,
            plan_key: b.plan_key,
            plan_title: b.plan_title || prTitle,
            first_pref_at: b.first_pref_at ? new Date(b.first_pref_at) : null,
            second_pref_at: b.second_pref_at ? new Date(b.second_pref_at) : null,
            third_pref_at: b.third_pref_at ? new Date(b.third_pref_at) : null,
            lat,
            lng,
            status: 'open',
          },
        ])
        .select('id,plan_title,service,plan_key,client_name,client_email,lat,lng')
        .single()
      if (insErr) throw insErr

      // プロ候補を絞り込み（必要ラベル ⊆ labels & 80km以内）
      const { data: pros, error: prosErr } = await sb
        .from('professionals')
        .select('id,name,email,lat,lng,labels')
        .contains('labels', required_labels)
      if (prosErr) throw prosErr

      const ranked =
        pros
          ?.map((p: any) => ({
            ...p,
            km: haversineKm(lat, lng, p.lat, p.lng),
          }))
          .filter((p) => p.km <= RADIUS_KM)
          .sort((a, b) => a.km - b.km) ?? []

      // 上位にメール通知（Resend）
      const subject = `【Miles】新着依頼: ${inserted.plan_title}（近い順に通知）`
      const body = [
        `依頼者: ${inserted.client_name} (${inserted.client_email})`,
        `サービス: ${inserted.service} / プラン: ${inserted.plan_key} (${inserted.plan_title})`,
        `住所: ${addressText}`,
        b.first_pref_at ? `第一希望: ${b.first_pref_at}` : '',
        b.second_pref_at ? `第二希望: ${b.second_pref_at}` : '',
        b.third_pref_at ? `第三希望: ${b.third_pref_at}` : '',
        b.note ? `メモ: ${b.note}` : '',
        `検索半径: ${RADIUS_KM}km`,
      ]
        .filter(Boolean)
        .join('\n')

      await Promise.all(
        ranked.slice(0, 10).map((p: any) => notifyByEmail(p.email, subject, body)),
      )

      return res.status(200).json({
        ok: true,
        request: inserted,
        notified: ranked.slice(0, 10).map((p: any) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          km: Math.round(p.km * 10) / 10,
        })),
      })
    }

    // ========== 顧客の依頼一覧 ==========
    if (req.method === 'GET' && action === 'customer_requests') {
      const email = String(req.query.email || '')
      if (!email) return res.status(400).json({ ok: false, error: 'email required' })
      const { data, error } = await sb
        .from('requests')
        .select(
          'id,created_at,status,service,plan_key,plan_title,first_pref_at,second_pref_at,third_pref_at,postal,prefecture,city,address2,note',
        )
        .eq('client_email', email)
        .order('created_at', { ascending: false })
      if (error) throw error
      return res.status(200).json({ ok: true, items: data })
    }

    // ========== 全依頼（Admin向け・簡易） ==========
    if (req.method === 'GET' && action === 'admin_requests') {
      const { data, error } = await sb
        .from('requests')
        .select(
          'id,created_at,status,service,plan_key,plan_title,client_name,client_email,postal,prefecture,city,address2',
        )
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) throw error
      return res.status(200).json({ ok: true, items: data })
    }

    return res.status(404).json({ ok: false, error: 'unknown route' })
  } catch (e: any) {
    console.error(e)
    return res.status(500).json({ ok: false, error: e?.message || 'server error' })
  }
}
