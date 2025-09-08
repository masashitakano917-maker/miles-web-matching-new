// project/api/admin/professionals/create.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../_supabaseAdmin';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.MAIL_FROM || 'Miles <onboarding@resend.dev>';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  try {
    const payload = req.body || {};
    const { name, email, initPassword } = payload;
    if (!name || !email || !initPassword || String(initPassword).length < 8) {
      return res.status(400).json({ ok: false, error: 'invalid payload' });
    }

    const supabase = getSupabaseAdmin();

    // 1) Authユーザー作成
    const { data: userCreated, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password: initPassword,
      email_confirm: true,
      user_metadata: { role: 'professional', name },
    });
    if (authErr) return res.status(500).json({ ok: false, error: authErr.message });

    const user_id = userCreated.user?.id;

    // 2) professionalsレコード作成（user_idを必ず保存）
    const { error: dbErr } = await supabase.from('professionals').insert({
      user_id,
      name,
      email,
      phone: payload.phone || null,
      postal: payload.postal || null,
      prefecture: payload.prefecture || null,
      city: payload.city || null,
      address2: payload.address2 || null,
      bio: payload.bio || null,
      camera_gear: payload.camera_gear || null,
      labels: Array.isArray(payload.labels) ? payload.labels : [],
    });
    if (dbErr) return res.status(500).json({ ok: false, error: dbErr.message });

    // 3) ウェルカムメール（RESENDが設定されていれば送信）
    if (resend) {
      await resend.emails.send({
        from: FROM,
        to: email,
        subject: '【Miles】アカウントが作成されました',
        html: `
          <p>${name} 様</p>
          <p>Miles にプロフェッショナル登録されました。</p>
          <p>ログイン用メール: <b>${email}</b></p>
          <p>初期パスワード: <b>${initPassword}</b></p>
          <p>初回ログイン後のパスワード変更をおすすめします。</p>
        `,
      }).catch(() => { /* メール失敗は致命ではないので握りつぶし */ });
    }

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'internal error' });
  }
}
