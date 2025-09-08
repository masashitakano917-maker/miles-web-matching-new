// project/api/match/next.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

const WAIT_MINUTES = 7;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

    const { request_id, radius_km = 50 } = req.body || {};
    if (!request_id) return res.status(400).json({ ok: false, error: 'request_id required' });

    // リクエスト取得
    const { data: request, error: reqErr } = await supabase
      .from('requests')
      .select('*')
      .eq('id', request_id)
      .single();
    if (reqErr) throw reqErr;
    if (!request || request.status !== 'pending') {
      return res.status(200).json({ ok: false, reason: 'already_completed_or_missing' });
    }

    // 既に通知したプロを取得
    const { data: notified } = await supabase
      .from('matches')
      .select('professional_id')
      .eq('request_id', request_id);

    const notifiedIds = new Set((notified || []).map((r: any) => r.professional_id));

    // 半径内の候補を距離順で取得（RPC）
    const { data: pros, error: prosErr } = await supabase.rpc('find_nearby_pros', {
      lat: request.lat,
      lng: request.lng,
      radius_km,
    });
    if (prosErr) throw prosErr;

    const next = (pros || []).find((p: any) => !notifiedIds.has(p.id));
    if (!next) return res.status(200).json({ ok: false, reason: 'no_more_candidates' });

    const expires_at = new Date(Date.now() + WAIT_MINUTES * 60 * 1000).toISOString();

    // matches に waiting を作成
    const { data: match, error: mErr } = await supabase
      .from('matches')
      .insert([{ request_id, professional_id: next.id, expires_at }])
      .select('*')
      .single();
    if (mErr) throw mErr;

    // 通知（LINE + メール）
    const linkAccept = `${process.env.APP_BASE_URL}/api/match/respond?id=${match.id}&status=accept`;
    const linkReject = `${process.env.APP_BASE_URL}/api/match/respond?id=${match.id}&status=reject`;
    await Promise.all([
      sendLine(next.line_user_id, request, linkAccept, linkReject).catch(() => null),
      sendEmail(next.email, request, linkAccept, linkReject).catch(() => null),
    ]);

    return res.status(200).json({ ok: true, match_id: match.id });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'internal_error' });
  }
}

async function sendEmail(
  to: string,
  request: any,
  acceptUrl: string,
  rejectUrl: string
) {
  if (!to) return;
  const apiKey = process.env.RESEND_API_KEY!;
  const from = process.env.MAIL_FROM || 'no-reply@miles.example';
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from,
      to,
      subject: '【Miles】新規撮影リクエストのご案内',
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

async function sendLine(
  lineUserId: string | null,
  request: any,
  acceptUrl: string,
  rejectUrl: string
) {
  if (!lineUserId) return;
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN!;
  const body = {
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
  };
  const resp = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error('line_failed');
}
