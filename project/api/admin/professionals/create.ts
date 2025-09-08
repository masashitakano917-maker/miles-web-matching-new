import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../../_supabaseAdmin';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.MAIL_FROM || 'Miles <onboarding@resend.dev>';
const APP_URL = process.env.APP_URL || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const p = req.body || {};
    if (!p?.name || !p?.email || !p?.initPassword || String(p.initPassword).length < 8) {
      return res.status(400).json({ ok: false, error: 'invalid payload' });
    }

    const supabase = getSupabaseAdmin();

    // 1) 認証ユーザー作成
    const { data: auth, error: authErr } = await supabase.auth.admin.createUser({
      email: p.email,
      password: p.initPassword,
      email_confirm: true,
      user_metadata: { role: 'professional', name: p.name },
    });
    if (authErr) {
      return res.status(500).json({ ok: false, error: `Auth createUser failed: ${authErr.message}` });
    }
    const userId = auth.user?.id || null;
    if (!userId) {
      return res.status(500).json({ ok: false, error: 'Auth user id missing' });
    }

    // 2) プロフィール行 upsert（id = 認証ユーザーID）
    const row = {
      id: userId,
      name: p.name,
      email: p.email,
      phone: p.phone || null,
      postal: p.postal || null,
      prefecture: p.prefecture || null,
      city: p.city || null,
      address2: p.address2 || null,
      bio: p.bio || null,
      camera_gear: p.camera_gear || null,
      labels: Array.isArray(p.labels) ? p.labels : [],
      updated_at: new Date().toISOString(),
    };

    const { error: upsertErr } = await supabase
      .from('professionals')
      .upsert(row, { onConflict: 'id' });

    if (upsertErr) {
      return res.status(500).json({ ok: false, error: `DB upsert failed: ${upsertErr.message}` });
    }

    // 3) メール（任意）
    if (resend) {
      try {
        await resend.emails.send({
          from: FROM,
          to: [p.email],
          subject: '【Miles】アカウント作成が完了しました',
          text: [
            `${p.name} 様`,
            '',
            'Miles への登録が完了しました。',
            `ログインURL：${APP_URL || 'https://miles-web-matching-new.vercel.app'}/login`,
            `メール：${p.email}`,
            `初期パスワード：${p.initPassword}`,
            '',
            '※初回ログイン後のパスワード変更をおすすめします。'
          ].join('\n'),
        });
      } catch (e:any) {
        // メール失敗はエラーにしない（登録は成功させる）
        console.error('Resend send error:', e?.message || e);
      }
    }

    return res.status(200).json({ ok: true, id: userId });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
