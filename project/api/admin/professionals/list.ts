import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../../_supabaseAdmin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const supabase = getSupabaseAdmin();

    const q = (req.query.q as string) || '';
    const label = (req.query.label as string) || '';
    const prefecture = (req.query.prefecture as string) || '';
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt((req.query.pageSize as string) || '10', 10)));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('professionals')
      .select('id, name, email, phone, postal, prefecture, city, labels, updated_at', { count: 'exact' })
      .order('updated_at', { ascending: false });

    if (q.trim()) query = query.ilike('name', `%${q.trim()}%`);
    if (label && label !== 'すべて') query = query.contains('labels', [label]);
    if (prefecture && prefecture !== 'すべて') query = query.eq('prefecture', prefecture);

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    return res.status(200).json({ ok: true, items: data || [], total: count || 0 });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
