// project/api/admin/plan-requirements.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || '';
const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

/**
 * GET  : 一覧
 * POST : upsert({ service, plan_key, required_labels: string[] })
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method === 'GET') {
      const { data, error } = await sb
        .from('plan_requirements')
        .select('service, plan_key, required_labels')
        .order('service', { ascending: true })
        .order('plan_key', { ascending: true });
      if (error) throw error;
      return res.status(200).json({ ok: true, items: data || [] });
    }

    if (req.method === 'POST') {
      const { service, plan_key, required_labels } = req.body || {};
      if (!service || !plan_key || !Array.isArray(required_labels)) {
        return res.status(400).json({ ok: false, error: 'invalid payload' });
      }
      const { error } = await sb
        .from('plan_requirements')
        .upsert({ service, plan_key, required_labels }, { onConflict: 'service,plan_key' });
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: 'method not allowed' });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'server error' });
  }
}
