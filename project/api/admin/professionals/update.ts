import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { id, patch } = req.body; // patch に {phone, postal, ...} 等
    const { error } = await supabaseAdmin.from('professionals').update(patch).eq('id', id);
    if (error) throw error;
    return res.status(200).json({ ok: true });
  } catch (e:any) {
    return res.status(400).json({ ok: false, error: e.message });
  }
}
