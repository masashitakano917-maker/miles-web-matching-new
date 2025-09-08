import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../../_supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }
  try {
    const p = req.body || {};
    if (!p?.id) return res.status(400).json({ ok: false, error: 'id required' });

    const supabase = getSupabaseAdmin();
    const payload = {
      name: p.name ?? null,
      email: p.email ?? null,
      phone: p.phone ?? null,
      postal: p.postal ?? null,
      prefecture: p.prefecture ?? null,
      city: p.city ?? null,
      address2: p.address2 ?? null,
      bio: p.bio ?? null,
      camera_gear: p.camera_gear ?? null,
      labels: Array.isArray(p.labels) ? p.labels : [],
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('professionals').update(payload).eq('id', p.id);
    if (error) return res.status(500).json({ ok: false, error: error.message });

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
