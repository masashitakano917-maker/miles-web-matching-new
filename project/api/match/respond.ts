// project/api/match/respond.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const id = String(req.query.id || '');
    const status = String(req.query.status || '');

    if (!id || !['accept', 'reject'].includes(status)) {
      return res.status(400).send('Bad Request');
    }

    const { data: match, error: mErr } = await supabase
      .from('matches')
      .select('*')
      .eq('id', id)
      .single();
    if (mErr || !match) return res.status(404).send('Not Found');

    // リクエストが既に確定済みか確認
    const { data: request } = await supabase
      .from('requests')
      .select('*')
      .eq('id', match.request_id)
      .single();
    if (!request || request.status !== 'pending') {
      return res.status(200).send('この依頼はすでに締切済みです。');
    }

    // 期限切れは無効
    if (match.status !== 'waiting' || (match.expires_at && new Date(match.expires_at) < new Date())) {
      return res.status(200).send('このリンクは有効期限切れです。');
    }

    if (status === 'accept') {
      // 成立
      await supabase.from('matches').update({ status: 'accepted' }).eq('id', id);
      await supabase.from('requests').update({ status: 'matched' }).eq('id', match.request_id);
      await supabase
        .from('matches')
        .update({ status: 'expired' })
        .eq('request_id', match.request_id)
        .neq('id', id);
      return res.status(200).send('ありがとうございます。マッチが成立しました。');
    } else {
      // 辞退 → 次の候補へ
      await supabase.from('matches').update({ status: 'rejected' }).eq('id', id);
      await fetch(`${process.env.APP_BASE_URL}/api/match/next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: match.request_id }),
      });
      return res.status(200).send('辞退を受け付けました。次の候補へ連絡します。');
    }
  } catch (e: any) {
    return res.status(500).send('Internal Error');
  }
}
