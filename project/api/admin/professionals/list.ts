// project/api/admin/professionals/list.ts
// GET /api/admin/professionals/list?name=...&label=...&prefecture=...&limit=50&offset=0
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, label, prefecture, limit = '50', offset = '0' } = req.query as Record<string, string>;

    let query = supabaseAdmin
      .from('professionals')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (name && name.trim()) {
      query = query.ilike('name', `%${name.trim()}%`);
    }

    if (label && label.trim()) {
      // 配列カラム labels に label が含まれる
      query = query.contains('labels', [label.trim()]);
    }

    if (prefecture && prefecture.trim()) {
      query = query.eq('prefecture', prefecture.trim());
    }

    const l = Math.max(1, Math.min(200, Number(limit) || 50));
    const o = Math.max(0, Number(offset) || 0);
    query = query.range(o, o + l - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return res.status(200).json({ data, count });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
