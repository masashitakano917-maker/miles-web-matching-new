// project/api/admin/orders.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || '';
const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

function extractPlanTitle(note?: string | null): string | null {
  if (!note) return null;
  const line = note.split('\n').find((l) => l.startsWith('[サービス]'));
  return line ? line.replace(/^\[サービス\]\s*/, '').trim() : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'method not allowed' });
  }

  const { data, error } = await sb
    .from('orders')
    .select('id, created_at, client_name, client_email, address, note')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) return res.status(500).json({ ok: false, error: error.message });

  const items = (data || []).map((r) => ({
    id: r.id,
    created_at: r.created_at,
    client_name: r.client_name,
    client_email: r.client_email,
    address: r.address,
    plan_title: extractPlanTitle(r.note) || '',
  }));

  return res.status(200).json({ ok: true, items });
}
