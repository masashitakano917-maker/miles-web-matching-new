// project/api/admin/professionals/list.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_supabaseAdmin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  try {
    const q = (req.query.q as string) || '';
    const label = (req.query.label as string) || '';
    const prefecture = (req.query.prefecture as string) || '';
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const pageSize = Math.max(1, Math.min(100, parseInt((req.query.pageSize as string) || '10', 10)));

    let query = supabaseAdmin
      .from('professionals')
      .select('id,name,email,phone,postal,prefecture,city,labels,updated_at', { count: 'exact' });

    if (q) query = query.ilike('name', `%${q}%`);
    if (label) query = query.contains('labels', [label]);
    if (prefecture && prefecture !== 'すべて') query = query.eq('prefecture', prefecture);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query.order('updated_at', { ascending: false }).range(from, to);
    if (error) return res.status(400).json({ ok: false, error: error.message });

    return res.status(200).json({ ok: true, items: data ?? [], total: count ?? 0 });
  } catch (e: any) {
    console.error('[list professionals] error', e);
    return res.status(500).json({ ok: false, error: e?.message || 'internal error' });
  }
}
