import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../../_supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const id = String(req.query.id || '');
    if (!id) return res.status(400).json({ ok: false, error: 'id required' });

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return res.status(500).json({ ok: false, error: error.message });
    if (!data) return res.status(404).json({ ok: false, error: 'not found' });

    return res.status(200).json({ ok: true, item: data });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
