// project/api/matching.ts
// @ts-nocheck
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE!;
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function geocode(address: string) {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('GOOGLE_MAPS_API_KEY is missing');
  }
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${GOOGLE_MAPS_API_KEY}&language=ja`;
  const r = await fetch(url);
  const j = await r.json();
  if (j.status !== 'OK' || !j.results?.length) {
    throw new Error(`geocoding failed: ${j.status || 'UNKNOWN'}`);
  }
  const loc = j.results[0].geometry.location;
  return { lat: loc.lat, lng: loc.lng };
}

export default async function handler(req, res) {
  try {
    const action = String(req.query.action || '').toLowerCase();

    if (action !== 'create_request' || req.method !== 'POST') {
      return res.status(400).json({ ok: false, error: 'unknown route' });
    }

    const {
      client_name,
      client_email,
      client_phone, // あっても DB に無ければ挿入しない
      address,
      note,
      service,   // 任意: 'photo' | 'clean' | 'staff'
      plan_key,  // 任意: '20' | '1ldk' など
    } = req.body || {};

    if (!client_name || !client_email || !address) {
      return res.status(400).json({ ok: false, error: 'missing fields' });
    }

    // 1) 住所→緯度経度
    const { lat, lng } = await geocode(address);

    // 2) requests へ保存（存在が確実な最小カラムのみ）
    //   → client_phone / status など「無いかもしれないカラム」は書かない
    const baseInsert: any = {
      client_name,
      client_email,
      address,
      note: note || null,
      lat,
      lng,
    };
    // client_phone カラムがある場合だけ追加（情報スキーマで確認）
    try {
      const { data: col } = await supabase
        .from('information_schema.columns' as any)
        .select('column_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'requests')
        .eq('column_name', 'client_phone')
        .maybeSingle();
      if ((col as any)?.column_name === 'client_phone') {
        baseInsert.client_phone = client_phone || null;
      }
    } catch {
      // 取れなくても無視（最小カラムで挿入する）
    }

    const { data: created, error: iErr } = await supabase
      .from('requests')
      .insert([baseInsert])
      .select('id')
      .single();

    if (iErr) {
      // DB エラー内容を前面に返してデバッグしやすく
      return res.status(500).json({ ok: false, error: `db insert error: ${iErr.message}` });
    }

    // 3) 近隣プロ（半径 80km 固定）
    let pros: any[] = [];
    try {
      const { data: nearby, error: nErr } = await supabase.rpc('find_nearby_pros', {
        lat,
        lng,
        radius_km: 80,
      });
      if (nErr) throw nErr;
      pros = nearby || [];
    } catch (e: any) {
      // RPC が無くても依頼は成功させる
      pros = [];
    }

    // 3.5) ラベル要件フィルタ（service & plan_key があれば）
    if (service && plan_key && pros.length) {
      const { data: reqLabels } = await supabase
        .from('plan_requirements')
        .select('required_labels')
        .eq('service', service)
        .eq('plan_key', plan_key)
        .maybeSingle();

      if (reqLabels?.required_labels?.length) {
        pros = pros.filter(
          (p: any) =>
            Array.isArray(p.labels) &&
            reqLabels.required_labels.every((lbl: string) => p.labels.includes(lbl))
        );
      }
    }

    // 4) メール通知（Resend 任意・失敗しても成功として返す）
    try {
      const apiKey = process.env.RESEND_API_KEY;
      const from = process.env.MAIL_FROM || 'noreply@example.com';
      if (apiKey && pros.length) {
        const toList = pros.map((p: any) => p.email).filter(Boolean).slice(0, 20);
        if (toList.length) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from,
              to: toList,
              subject: 'Miles に新しい依頼が届きました',
              text: `住所: ${address}\n依頼者: ${client_name} (${client_email})\n\n${note || ''}\n\n※このメールに返信しないでください。`,
            }),
          });
        }
      }
    } catch {
      // 通知失敗は握りつぶす（依頼は作成済み）
    }

    return res.status(200).json({ ok: true, request_id: created.id, matched: pros.length });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'server error' });
  }
}
