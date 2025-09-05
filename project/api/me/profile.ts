// project/api/me/profile.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ※ 本番はCookie/JWTから user.id を取り出すのが理想だが簡易化して email をクエリから受けるなどに変更可
  // ここではデモとして header 'x-user-email' で受け取る設計にします（AuthContext側で付与orVercel Middlewareで付与）
  const email = req.headers['x-user-email'] as string | undefined;
  if (!email) return res.status(401).json({ ok: false, error: 'unauthorized' });

  const { data, error } = await supabaseAdmin.from('professionals').select('*').eq('email', email).single();
  if (error) return res.status(500).json({ ok: false, error: error.message });
  return res.status(200).json({ ok: true, item: data });
}
