// project/api/matching.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

const RADIUS_KM_DEFAULT = 50;
const WAIT_MINUTES = 7;

export default async function handler(req: any, res: any) {
  try {
    const action = String(req.query.action || '').toLowerCase();

    if (req.method === 'POST' && action === 'create_request') {
      // ===== ① 発注作成（住所→緯度経度→requests作成→最初の候補に通知） =====
      const { client_name, client_email, address, note, radius_km } = req.body || {};
      if (!client_name || !client_email || !address) {
        return res.status(400).json({ ok: false, error: 'client_name, client_email, address are required' });
      }
      const { lat, lng } = await geocode(address);

      const { data: request, error: reqErr } = await supabase
        .from('requests')
        .insert([{ client_name, client_email, address, lat, lng, note }])
        .select('*')
        .single();
      if (reqErr) throw reqErr;

      await matchNext(request.id, radius_km ?? RADIUS_KM_DEFAULT);
      return res.status(200).json({ ok: true, request });
    }

    if (req.method === 'POST' && action === 'match_next') {
      // ===== ② 次の候補に通知（手動/内部呼び出し） =====
      const { request_id, radius_km } = req.body || {};
      if (!request_id) return res.status(400).json({ ok: false, error: 'request_id required' });
      const ok = await matchNext(request_id, radius_km ?? RADIUS_KM_DEFAULT);
      return res.status(200).json({ ok });
    }

    if (req.method === 'GET' && action === 'respond') {
      // ===== ③ プロの応答（accept / reject） =====
      const id = String(req.query.id || '');
      const status = String(req.query.status || '').toLowerCase(); // accept | reject
      if (!id || !['accept', 'reject'].includes(status)) {
        return res.status(400).send('Bad Request');
      }

      const { data: match } = await supabase.from('matches').select('*').eq('id', id).single();
      if (!match) return res.status(404).send('Not Found');

      const { data: request } = await supabase.from('requests').select('*').eq('id', match.request_id).single();
      if (!request || request.status !== 'pending') {
        return res.status(200).send('この依頼はすでに締切済みです。');
      }

      // 有効期限チェック
      if (match.status !== 'waiting' || (match.expires_at && new Date(match.expires_at) < new Date())) {
        return res.status(200).send('このリンクは有効期限切れです。');
      }

      if (status === 'accept') {
        await supabase.from('matches').update({ status: 'accepted' }).eq('id', id);
        await supabase.from('requests').update({ status: 'matched' }).eq('id', match.request_id);
        await supabase.from('matches')
          .update({ status: 'expired' })
          .eq('request_id', match.request_id)
          .neq('id', id);

        return res.status(200).send('ありがとうございます。マッチが成立しました。');
      } else {
        await supabase.from('matches').update({ status: 'rejected' }).eq('id', id);
        await matchNext(match.request_id, RADIUS_KM_DEFAULT);
        return res.status(200).send('辞退を受け付けました。次の候補へ連絡します。');
      }
    }

    if (req.method === 'POST' && action === 'check_expired') {
      // ===== ④ 期限切れチェック（Cron想定） =====
      const nowIso = new Date().toISOString();
      const { data: waiting, error } = await supabase
        .from('matches')
        .select('id, request_id, expires_at, status')
        .eq('status', 'waiting')
        .lt('expires_at', nowIso);
      if (error) throw error;

      const targetReq = new Set<string>();
      for (const m of waiting || []) {
        await supabase.from('matches').update({ status: 'expired' }).eq('id', m.id);
        targetReq.add(m.request_id);
      }
      for (const request_id of targetReq) {
        const { data: reqRow } = await supabase.from('requests').select('status').eq('id', request_id).single();
        if (reqRow?.status === 'pending') {
          await matchNext(request_id, RADIUS_KM_DEFAULT);
        }
      }
      return res.status(200).json({ ok: true, expired: (waiting || []).length });
    }

    return res.status(404).json({ ok: false, error: 'Not Found' });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'internal_error' });
  }
}

/** 住所 → 緯度経度 */
async function geocode(address: string): Promise<{ lat: number; lng: number }> {
  const key = process.env.GOOGLE_MAPS_API_KEY!;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`;
  const r = await fetch(url);
  const j: any = await r.json();
  if (j.status !== 'OK' || !j.results?.[0]) throw new Error(`Geocoding failed: ${j.status}`);
  const { lat, lng } = j.results[0].geometry.location;
  return { lat, lng };
}

/** 次の候補に通知して waiting を作る */
async function matchNext(request_id: string, radius_km: number): Promise<boolean> {
  // リクエスト確認
  const { data: request } = await supabase.from('requests').select('*').eq('id', request_id).single();
  if (!request || request.status !== 'pending') return false;

  // 既に通知済みのプロ一覧
  const { data: notified } = await supabase
    .from('matches')
    .select('professional_id')
    .eq('request_id', request_id);
  const notifiedIds = new Set((notified || []).map((r: any) => r.professional_id));

  // 半径内候補を距離順で取得
  const { data: pros, error: prosErr } = await supabase.rpc('find_nearby_pros', {
    lat: request.lat,
    lng: request.lng,
    radius_km,
  });
  if (prosErr) throw prosErr;

  const next = (pros || []).find((p: any) => !notifiedIds.has(p.id));
  if (!next) return false;

  const expires_at = new Date(Date.now() + WAIT_MINUTES * 60 * 1000).toISOString();
  const { data: match, error: mErr } = await supabase
    .from('matches')
    .insert([{ request_id, professional_id: next.id, expires_at }])
    .select('*')
    .single();
  if (mErr) throw mErr;

  const linkAccept = `${process.env.APP_BASE_URL}/api/matching?action=respond&id=${match.id}&status=accept`;
  const linkReject = `${process.env.APP_BASE_URL}/api/matching?action=respond&id=${match.id}&status=reject`;

  await Promise.all([
    sendLine(next.line_user_id, request, linkAccept, linkReject).catch(() => null),
    sendEmail(next.email, request, linkAccept, linkReject).catch(() => null),
  ]);

  return true;
}

/** メール送信（Resend） */
async function sendEmail(to: string | null, request: any, acceptUrl: string, rejectUrl: string) {
  if (!to) return;
  const apiKey = process.env.RESEND_API_KEY!;
  const from = process.env.MAIL_FROM || 'no-reply@miles.example';
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from,
      to,
      subject: '【Miles】新規撮影依頼のご案内',
      html: `
        <p>近くで新しい撮影依頼が届きました。</p>
        <p><b>住所:</b> ${request.address}</p>
        <p>
          <a href="${acceptUrl}">✅ 受ける</a>　
          <a href="${rejectUrl}">❌ 見送る</a>
        </p>
        <p>※このリンクは他の方が確定すると無効になります。</p>
      `,
    }),
  });
  if (!resp.ok) throw new Error('email_failed');
}

/** LINE送信 */
async function sendLine(lineUserId: string | null, request: any, acceptUrl: string, rejectUrl: string) {
  if (!lineUserId) return;
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN!;
  const resp = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      to: lineUserId,
      messages: [
        {
          type: 'text',
          text:
            `【Miles】近くで新規撮影依頼\n` +
            `住所: ${request.address}\n\n` +
            `受ける: ${acceptUrl}\n` +
            `見送る: ${rejectUrl}\n\n` +
            `※他の方が確定するとリンクは無効になります。`,
        },
      ],
    }),
  });
  if (!resp.ok) throw new Error('line_failed');
}
