import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../../_supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const q = String(req.query.q || '').trim();
    const label = String(req.query.label || '').trim();
    const pref = String(req.query.prefecture || '').trim();

    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 10)));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = getSupabaseAdmin();
    let query = supabase.from('professionals').select('*', { count: 'exact' });

    if (q) query = query.ilike('name', `%${q}%`);
    if (label) query = query.contains('labels', [label]); // text[] 想定
    if (pref) query = query.eq('prefecture', pref);

    query = query.order('updated_at', { ascending: false }).range(from, to);

    const { data, count, error } = await query;
    if (error) return res.status(500).json({ ok: false, error: error.message });

    return res.status(200).json({ ok: true, items: data || [], total: count || 0 });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
