// project/api/admin/professionals/create.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../_supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  try {
    const {
      name, email, password,
      phone, postal, prefecture, city, address2, bio, labels = []
    } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ ok: false, error: 'name,email,password は必須です' });
    }

    // 1) Authユーザー作成（role=professional）
    const { data: userRes, error: userErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // 招待メール送るので false
      user_metadata: { role: 'professional', name }
    });
    if (userErr || !userRes.user) throw userErr || new Error('createUser failed');

    // 2) ディレクトリにプロフィール登録
    const { error: insertErr } = await supabaseAdmin
      .from('professionals')
      .insert([{
        user_id: userRes.user.id,
        name, email, phone, postal, prefecture, city, address2, bio,
        labels: Array.isArray(labels) ? labels : String(labels || '').split(',').map((s) => s.trim()).filter(Boolean)
      }]);

    if (insertErr) throw insertErr;

    // 3) 招待メール（Supabaseの招待機能を利用）
    const { error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: process.env.APP_URL ? `${process.env.APP_URL}/login` : undefined
    });
    if (inviteErr) {
      // 失敗しても作成自体はOKにする。必要ならログだけ。
      // console.warn('invite failed', inviteErr);
    }

    return res.status(200).json({ ok: true, id: userRes.user.id });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'internal error' });
  }
}
