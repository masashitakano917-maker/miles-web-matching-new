// project/api/debug/health.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const env = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE: !!process.env.SUPABASE_SERVICE_ROLE,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    MAIL_FROM: !!process.env.MAIL_FROM,
    APP_BASE_URL: process.env.APP_BASE_URL || 'not-set',
    VERCEL_ENV: process.env.VERCEL_ENV || 'unknown',
  };

  // Supabase 接続テスト（件数だけ head で取得）
  let db = { ok: false, error: '' as string | null, total: null as number | null };
  try {
    const { count, error } = await supabaseAdmin
      .from('professionals')
      .select('id', { head: true, count: 'exact' });
    if (error) throw error;
    db = { ok: true, error: null, total: count ?? 0 };
  } catch (e: any) {
    db = { ok: false, error: e?.message || 'db error', total: null };
  }

  res.status(200).json({ ok: true, env, db });
}
