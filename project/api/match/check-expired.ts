// project/api/match/check-expired.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

    const nowIso = new Date().toISOString();

    // 期限切れの waiting を拾い、expired にして次へ回す
    const { data: waiting, error } = await supabase
      .from('matches')
      .select('id, request_id, expires_at, status')
      .eq('status', 'waiting')
      .lt('expires_at', nowIso);

    if (error) throw error;

    const byRequest = new Map<string, any[]>();
    for (const m of waiting || []) {
      await supabase.from('matches').update({ status: 'expired' }).eq('id', m.id);
      const arr = byRequest.get(m.request_id) || [];
      arr.push(m);
      byRequest.set(m.request_id, arr);
    }

    // 依頼がまだ pending のものだけ次に進める
    for (const [request_id] of byRequest) {
      const { data: reqRow } = await supabase
        .from('requests')
        .select('status')
        .eq('id', request_id)
        .single();
      if (reqRow?.status === 'pending') {
        await fetch(`${process.env.APP_BASE_URL}/api/match/next`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id }),
        });
      }
    }

    return res.status(200).json({ ok: true, expired: (waiting || []).length });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'internal_error' });
  }
}
