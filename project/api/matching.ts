// project/api/matching.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import { Resend } from 'resend';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || '';
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const MAIL_FROM = process.env.MAIL_FROM || 'no-reply@example.com';

// 80km は仕様固定
const RADIUS_KM = 80;

// サーバー側は Service Role を使う
const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

type CreateRequestBody = {
  service: string;          // 'photo' | 'clean' | 'staff' など
  plan_key: string;         // '20' | '30' | '1ldk' など
  plan_title: string;       // 表示用タイトル
  price: number;

  prefer_datetime_1?: string; // ISO (例: '2025-09-30T10:00:00+09:00')
  prefer_datetime_2?: string;
  prefer_datetime_3?: string;

  postal?: string;
  prefecture?: string;
  city?: string;
  address2?: string;

  client_name: string;
  client_email: string;
  client_phone?: string;
  meetup?: string;
  note?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    const action = String(req.query.action || '');

    if (req.method === 'GET' && action === 'health') {
      return res.status(200).json({ ok: true });
    }

    if (req.method !== 'POST' || action !== 'create_request') {
      return res.status(404).json({ ok: false, error: 'unknown route' });
    }

    const body = req.body as CreateRequestBody;
    // 必須チェック（最低限）
    if (!body?.client_name || !body?.client_email) {
      return res.status(400).json({ ok: false, error: 'missing client info' });
    }

    // 住所合成（空は除外）
    const fullAddress = [body.prefecture, body.city, body.address2]
      .filter(Boolean)
      .join('');

    // --- ジオコーディング（緯度経度取得） ---
    let lat: number | null = null;
    let lng: number | null = null;

    if (fullAddress && GOOGLE_MAPS_API_KEY) {
      const url =
        'https://maps.googleapis.com/maps/api/geocode/json?address=' +
        encodeURIComponent(fullAddress) +
        '&key=' +
        GOOGLE_MAPS_API_KEY;

      const g = await fetch(url);
      const gj = (await g.json()) as any;

      if (gj?.status === 'OK' && gj?.results?.[0]?.geometry?.location) {
        lat = gj.results[0].geometry.location.lat;
        lng = gj.results[0].geometry.location.lng;
      } else {
        // 住所が曖昧でも依頼は受け付ける（lat/lngは null のまま）
      }
    }

    // --- DB保存 ---
    // 1) 顧客ダッシュボード用の軽量レコード（orders）
    //   -> 既存の一覧表示は orders を参照している想定
    await sb.from('orders').insert({
      client_name: body.client_name,
      client_email: body.client_email,
      address: fullAddress || null,
      note: [
        `[サービス] ${body.service} / ${body.plan_title}（${body.price?.toLocaleString?.() ?? body.price}円）`,
        `[希望日時] ${body.prefer_datetime_1 || '-'} / ${body.prefer_datetime_2 || '-'} / ${body.prefer_datetime_3 || '-'}`,
        body.meetup ? `[集合場所] ${body.meetup}` : '',
        body.client_phone ? `[電話] ${body.client_phone}` : '',
        body.note ? `[特記事項] ${body.note}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
      lat,
      lng,
    });

    // 2) マッチング用に requests へも詳細保存（存在する列だけが入る想定）
    //    列が存在しない場合に失敗させたくないので、無関係キーは set しない。
    const requestRow: Record<string, any> = {
      service: body.service,
      plan_key: body.plan_key,
      plan_title: body.plan_title,
      plan_price: body.price ?? null,
      first_pref_at: body.prefer_datetime_1 || null,
      second_pref_at: body.prefer_datetime_2 || null,
      third_pref_at: body.prefer_datetime_3 || null,
      postal: body.postal || null,
      prefecture: body.prefecture || null,
      city: body.city || null,
      address2: body.address2 || null,
      address: fullAddress || null,
      client_name: body.client_name,
      client_email: body.client_email,
      client_phone: body.client_phone || null,
      meetup: body.meetup || null,
      note: body.note || null,
      lat,
      lng,
      radius_km: RADIUS_KM,
      status: 'open',
    };

    // 存在しない列名があると失敗するので、まずテーブルのカラム一覧を取得してフィルタ
    const { data: cols } = await sb.rpc('pg_list_columns', { table_name: 'requests' }).catch(() => ({ data: null as any[] | null }));
    let filtered = requestRow;
    if (Array.isArray(cols)) {
      const allowed = new Set(cols.map((c: any) => c.column_name));
      filtered = Object.fromEntries(
        Object.entries(requestRow).filter(([k]) => allowed.has(k))
      );
    }

    const { data: inserted, error: insertErr } = await sb
      .from('requests')
      .insert(filtered)
      .select('id')
      .single();

    if (insertErr) {
      // requests への保存が失敗しても orders には入っているので「エラーにせず継続」
      // ただし後続のマッチングは lat/lng などが無いとスキップされる
      console.warn('requests insert error:', insertErr.message);
    }

    const requestId: string | null = inserted?.id ?? null;

    // --- マッチング（必要ラベル → 近い順） ---
    // 必要ラベルをプランから取得
    let required: string[] = [];
    const { data: reqDef } = await sb
      .from('plan_requirements')
      .select('required_labels')
      .eq('service', body.service)
      .eq('plan_key', body.plan_key)
      .maybeSingle();

    if (reqDef?.required_labels) required = reqDef.required_labels;

    // ラベルを満たすプロだけ取得
    const { data: pros } = await sb
      .from('professionals')
      .select('id,name,email,lat,lng,labels')
      .contains('labels', required);

    // 距離計算（サーバー側で単純ハバースイン）
    function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
      const toRad = (d: number) => (d * Math.PI) / 180;
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    let candidates =
      lat != null && lng != null && Array.isArray(pros)
        ? pros
            .filter((p) => p.lat != null && p.lng != null)
            .map((p) => ({
              ...p,
              km: haversineKm(lat!, lng!, p.lat as number, p.lng as number),
            }))
            .filter((p) => p.km <= RADIUS_KM)
            .sort((a, b) => a.km - b.km)
        : [];

    // メール送信（上位10人まで）
    if (candidates.length && RESEND_API_KEY && MAIL_FROM) {
      const resend = new Resend(RESEND_API_KEY);
      const top = candidates.slice(0, 10);

      await Promise.all(
        top.map((p) =>
          resend.emails.send({
            from: MAIL_FROM,
            to: p.email || MAIL_FROM,
            subject: `[Miles] 新規依頼: ${body.plan_title}（${body.price?.toLocaleString?.() ?? body.price}円）`,
            text: [
              `依頼ID: ${requestId ?? '-'}`,
              `依頼者: ${body.client_name} (${body.client_email})`,
              `サービス: ${body.service}`,
              `プラン: ${body.plan_title} / ¥${body.price}`,
              `希望日時: ${body.prefer_datetime_1 || '-'} / ${body.prefer_datetime_2 || '-'} / ${body.prefer_datetime_3 || '-'}`,
              `住所: ${fullAddress || '-'}`,
              body.meetup ? `集合場所: ${body.meetup}` : '',
              body.client_phone ? `電話: ${body.client_phone}` : '',
              body.note ? `メモ: ${body.note}` : '',
              '',
              `あなたからの距離: 約${Math.round(p.km)}km`,
            ]
              .filter(Boolean)
              .join('\n'),
          })
        )
      );
    }

    return res.status(200).json({ ok: true, request_id: requestId });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ ok: false, error: e?.message || 'server_error' });
  }
}

/**
 * 補助 RPC:
 *   下の SQL を一度だけ実行しておくと、requests のカラム一覧を安全に取れます（無くても動きます）。
 *
 * create or replace function pg_list_columns(table_name text)
 * returns table(column_name text)
 * language sql stable as $$
 *   select attname::text from pg_attribute
 *   where attrelid = (quote_ident('public')||'.'||quote_ident(table_name))::regclass
 *     and attnum > 0 and not attisdropped
 * $$;
 */
