// project/api/my-requests.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || '';
const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  const client_email = String(req.query.client_email || '');
  if (!client_email) {
    return res.status(400).json({ ok: false, error: 'missing client_email' });
  }

  const { data, error } = await sb
    .from('orders') // 顧客用一覧は orders を参照
    .select('id, address, note, created_at')
    .eq('client_email', client_email)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ ok: false, error: error.message });
  return res.status(200).json({ ok: true, items: data ?? [] });
}
