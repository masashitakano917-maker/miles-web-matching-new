import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../../_supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const supabase = getSupabaseAdmin();

  const q = String(req.query.q ?? '').trim();
  const label = String(req.query.label ?? '').trim();
  const prefecture = String(req.query.prefecture ?? '').trim();

  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize ?? '10'), 10) || 10));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // 必要カラムのみ取得
  let query = supabase
    .from('professionals')
    .select('id,name,email,phone,postal,prefecture,city,labels,updated_at', { count: 'exact' });

  if (q) query = query.ilike('name', `%${q}%`);
  if (label && label !== 'すべて') {
    // labels は text[] を想定
    query = query.contains('labels', [label]);
  }
  if (prefecture && prefecture !== 'すべて') {
    query = query.eq('prefecture', prefecture);
  }

  // 新しい順でページング
  query = query.order('updated_at', { ascending: false }).range(from, to);

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ ok: false, error: error.message });

  return res.status(200).json({ ok: true, items: data ?? [], total: count ?? 0 });
}
