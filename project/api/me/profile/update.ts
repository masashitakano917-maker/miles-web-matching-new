// project/api/me/profile/update.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../_supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  const email = req.headers['x-user-email'] as string | undefined;
  if (!email) return res.status(401).json({ ok: false, error: 'unauthorized' });

  const payload = req.body || {};
  delete payload.id; delete payload.user_id; delete payload.email; // email等は固定

  const { data, error } = await supabaseAdmin.from('professionals').update(payload).eq('email', email).select('*').single();
  if (error) return res.status(500).json({ ok: false, error: error.message });
  return res.status(200).json({ ok: true, item: data });
}
