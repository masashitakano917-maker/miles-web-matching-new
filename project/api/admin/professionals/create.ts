import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../../_supabaseAdmin.js';
import { Resend } from 'resend';

function formatPostal(v: string) {
  const digits = (v || '').replace(/\D/g, '').slice(0, 7);
  return digits.length >= 4 ? `${digits.slice(0, 3)}-${digits.slice(3)}` : digits;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const supabase = getSupabaseAdmin();

    const {
      name = '',
      email = '',
      phone = '',
      initPassword = '',
      postal = '',
      prefecture = '',
      city = '',
      address2 = '',
      bio = '',
      camera_gear = '',
      labels = [],
    } = (req.body ?? {}) as Record<string, any>;

    if (!name.trim()) return res.status(400).json({ ok: false, error: 'name is required' });
    if (!email.trim()) return res.status(400).json({ ok: false, error: 'email is required' });
    if ((initPassword || '').length < 8) {
      return res.status(400).json({ ok: false, error: 'initPassword must be >= 8 chars' });
    }

    // 1) 認証ユーザー作成（ロール: professional）
    const { data: created, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password: initPassword,
      email_confirm: true,
      user_metadata: { role: 'professional' },
    });
    if (authErr) throw authErr;
    const userId = created?.user?.id;
    if (!userId) throw new Error('failed to create auth user');

    // 2) プロフィール行を作成
    const { error: insErr } = await supabase.from('professionals').insert({
      user_id: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || null,
      postal: formatPostal(postal || ''),
      prefecture: prefecture || null,
      city: city || null,
      address2: address2 || null,
      bio: bio || null,
      camera_gear: camera_gear || null,
      labels: Array.isArray(labels) ? labels : [],
    });
    if (insErr) throw insErr;

    // 3) メール送信（Resend）
    const resendKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM; // 例: 'Miles <noreply@yourdomain.com>'
    const appUrl =
      process.env.APP_URL ||
      (req.headers.origin as string) ||
      'https://miles-web-matching-new.vercel.app';

    if (resendKey && from) {
      const resend = new Resend(resendKey);
      const loginUrl = `${appUrl}/login`;
      await resend.emails.send({
        from,
        to: email,
        subject: '【Miles】アカウントのご案内',
        html: `
          <p>${name} 様</p>
          <p>Miles にプロフェッショナルアカウントが作成されました。</p>
          <p>ログインURL：<a href="${loginUrl}">${loginUrl}</a></p>
          <p>メール：${email}<br/>初期パスワード：${initPassword}</p>
          <p>初回ログイン後にパスワードの変更をおすすめします。</p>
        `,
        text: [
          `${name} 様`,
          `Miles にプロフェッショナルアカウントが作成されました。`,
          `ログインURL：${loginUrl}`,
          `メール：${email}`,
          `初期パスワード：${initPassword}`,
          `初回ログイン後にパスワードの変更をおすすめします。`,
        ].join('\n'),
      });
    }

    return res.status(200).json({ ok: true, userId });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
