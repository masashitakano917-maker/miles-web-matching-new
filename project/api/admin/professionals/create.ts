import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_supabaseAdmin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);
const MAIL_FROM = process.env.MAIL_FROM!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).end();
    const { name, email, password, phone, postal, prefecture, city, address2, bio, labels } = req.body;

    // 1) Authユーザー作成（初期パス設定＋招待メール送信可）
    const { data: userCreated, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,                   // Adminが設定
      email_confirm: true,        // すぐ使える
      user_metadata: { role: 'professional', name }
    });
    if (authErr || !userCreated?.user) throw authErr;

    // 2) professionals にプロフィール行を作成（user_id ひも付け）
    const { error: upsertErr } = await supabaseAdmin
      .from('professionals')
      .upsert({
        user_id: userCreated.user.id,
        name, email, phone, postal, prefecture, city, address2, bio,
        labels: Array.isArray(labels) ? labels : []
      }, { onConflict: 'email' });

    if (upsertErr) throw upsertErr;

    // 3) 登録通知メール（Resend）
    await resend.emails.send({
      from: MAIL_FROM,
      to: email,
      subject: 'Miles｜プロフェッショナル登録が完了しました',
      html: `
        <p>${name} 様</p>
        <p>Milesへのご登録ありがとうございます。ログイン情報は以下です。</p>
        <ul>
          <li>Email: ${email}</li>
          <li>Password: （管理者が設定した初期パスワード）</li>
        </ul>
        <p>ログイン後、パスワードの変更をお願いします。</p>
      `
    });

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(400).json({ ok: false, error: e?.message || 'error' });
  }
}
