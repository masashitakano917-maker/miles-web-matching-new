// project/api/admin/professionals/update.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../_supabaseAdmin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  try {
    const { id, ...payload } = req.body || {};
    if (!id) return res.status(400).json({ ok: false, error: 'id is required' });

    if (payload.labels && !Array.isArray(payload.labels)) {
      payload.labels = String(payload.labels).split(',').map((s) => s.trim()).filter(Boolean);
    }

    const { error } = await supabaseAdmin.from('professionals').update(payload).eq('id', id);
    if (error) throw error;

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'internal error' });
  }
}
