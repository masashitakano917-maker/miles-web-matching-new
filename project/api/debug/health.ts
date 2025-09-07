import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../_supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('professionals')
      .select('id', { head: true, count: 'exact' });

    return res.status(200).json({
      ok: !error,
      env: {
        appUrl: process.env.APP_URL || '',
        supabaseUrl:
          process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
        anon: !!process.env.VITE_SUPABASE_ANON_KEY,
        serviceRole: !!process.env.SUPABASE_SERVICE_ROLE,
        resend: !!process.env.RESEND_API_KEY,
      },
      db: { ok: !error, error: error?.message || null },
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}
