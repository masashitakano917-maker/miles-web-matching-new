import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../../_supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  const id = (req.query?.id as string) || '';
  if (!id) return res.status(400).json({ ok: false, error: 'id required' });

  const { data, error } = await getSupabaseAdmin()
    .from('professionals')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return res.status(404).json({ ok: false, error: error.message });
  return res.status(200).json({ ok: true, item: data });
}
