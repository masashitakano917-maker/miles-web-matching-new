import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../../_supabaseAdmin';
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

    // 1) 認証ユーザー作成
    const { data: auth, error: authErr } = await supabase.auth.admin.createUser({
      email: p.email,
      password: p.initPassword,
      email_confirm: true,
      user_metadata: { role: 'professional', name: p.name },
    });
    if (authErr) return res.status(500).json({ ok: false, error: authErr.message });

    const userId = auth?.user?.id || null;
    if (!userId) return res.status(500).json({ ok: false, error: 'user id missing' });

    // 2) プロフィール行 upsert
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

    const { error: upsertErr } = await supabase.from('professionals').upsert(row, { onConflict: 'id' });
    if (upsertErr) return res.status(500).json({ ok: false, error: upsertErr.message });

    // 3) ウェルカムメール（Resend が使えれば送る／失敗しても処理は続行）
    if (resend) {
      try {
        await resend.emails.send({
          from: FROM,
          to: [p.email],
          subject: '【Miles】アカウントが作成されました',
          text:
            `こんにちは ${p.name} 様\n\n` +
            `Miles への登録が完了しました。\n` +
            `ログイン用メール: ${p.email}\n` +
            `初期パスワード: ${p.initPassword}\n\n` +
            `ログイン後、プロフィールを編集できます。\n`,
        });
      } catch (e) {
        console.error('resend error:', e);
      }
    }

    return res.status(200).json({ ok: true, id: userId });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'internal error' });
  }
}
