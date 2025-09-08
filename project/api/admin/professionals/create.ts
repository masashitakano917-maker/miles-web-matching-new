import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../_supabaseAdmin';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.MAIL_FROM || 'Miles <onboarding@resend.dev>';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  try {
    const p = req.body || {};
    if (!p?.name || !p?.email || !p?.initPassword || String(p.initPassword).length < 8) {
      return res.status(400).json({ ok: false, error: 'invalid payload' });
    }

    const supabase = getSupabaseAdmin();

    // 1. Authユーザー作成
    const { data: auth, error: eAuth } = await supabase.auth.admin.createUser({
      email: p.email,
      password: p.initPassword,
      email_confirm: true,
      user_metadata: { role: 'professional', name: p.name },
    });

    if (eAuth) {
      console.error('Auth createUser failed:', eAuth.message);
      return res.status(500).json({ ok: false, error: eAuth.message });
    }

    const user_id = auth.user?.id || null;

    // 2. professionals テーブルに登録
    const { error: eDb } = await supabase.from('professionals').insert({
      user_id,
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
      updated_at: new Date(), // 明示的に updated_at を追加
    });

    if (eDb) {
      console.error('DB insert failed:', eDb.message);
      return res.status(500).json({ ok: false, error: eDb.message });
    }

    // 3. メール送信（失敗しても無視せずログに出す）
    if (resend) {
      try {
        await resend.emails.send({
          from: FROM,
          to: p.email,
          subject: '【Miles】プロフェッショナル登録が完了しました',
          html: `
            <p>${p.name} 様</p>
            <p>Miles にプロフェッショナルとして登録されました。</p>
            <p>ログイン用メール: <b>${p.email}</b></p>
            <p>初期パスワード: <b>${p.initPassword}</b></p>
            <p>初回ログイン後にパスワード変更をお願いします。</p>
          `,
          text: `${p.name} 様\n\nMiles への登録が完了しました。\nメール: ${p.email}\n初期PW: ${p.initPassword}\n`,
        });
      } catch (e) {
        console.error('Resend email failed:', e);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('Unexpected error in create handler:', e?.message || e);
    return res.status(500).json({ ok: false, error: e?.message || 'internal error' });
  }
}
