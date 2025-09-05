// project/api/admin/professionals/list.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../_supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  const { q = '', label = '', pref = '', page = '1', size = '20' } = req.query as Record<string, string>;
  const p = Math.max(1, parseInt(page || '1', 10));
  const s = Math.max(1, Math.min(100, parseInt(size || '20', 10)));
  const from = (p - 1) * s;
  const to = from + s - 1;

  try {
    let qy = supabaseAdmin.from('professionals').select('*', { count: 'exact' });

    if (q) qy = qy.ilike('name', `%${q}%`);
    if (pref) qy = qy.eq('prefecture', pref);
    if (label) qy = qy.contains('labels', [label]); // text[] に対する部分一致

    const { data, error, count } = await qy.order('created_at', { ascending: false }).range(from, to);
    if (error) throw error;

    return res.status(200).json({ ok: true, items: data || [], total: count || 0, page: p, size: s });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'internal error' });
  }
}
