import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../../_supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  const supabase = getSupabaseAdmin();
  const {
    q = '', label = '', prefecture = '',
    page = '1', pageSize = '10',
  } = (req.query || {}) as Record<string, string>;

  const p = Math.max(1, Number(page));
  const size = Math.max(1, Number(pageSize));
  const from = (p - 1) * size;
  const to = from + size - 1;

  let query = supabase
    .from('professionals')
    .select('id,name,email,phone,postal,prefecture,city,labels,updated_at', { count: 'exact' });

  if (q) query = query.ilike('name', `%${q}%`);
  if (prefecture && prefecture !== 'すべて') query = query.eq('prefecture', prefecture);
  if (label && label !== 'すべて') query = query.contains('labels', [label]); // labels は text[] を想定

  query = query.order('updated_at', { ascending: false, nullsFirst: false }).range(from, to);

  const { data, count, error } = await query;
  if (error) return res.status(500).json({ ok: false, error: error.message });

  return res.status(200).json({ ok: true, items: data ?? [], total: count ?? 0 });
}
