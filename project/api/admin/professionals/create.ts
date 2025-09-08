// project/api/admin/professionals/create.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../../_supabaseAdmin.js';

const FROM = process.env.MAIL_FROM || 'Miles <onboarding@resend.dev>';
const APP_URL = process.env.APP_URL || 'https://miles-web-matching-new.vercel.app';

function normalizePostal(v: string | null | undefined) {
  const d = String(v || '').replace(/\D/g, '').slice(0, 7);
  return d.length >= 4 ? `${d.slice(0, 3)}-${d.slice(3)}` : d;
}
const toArr = (v: any) =>
  Array.isArray(v) ? v : v ? String(v).split('|').map(s => s.trim()).filter(Boolean) : [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const p = req.body || {};
    if (!p?.name || !p?.email || !p?.initPassword || String(p.initPassword).length < 8) {
      return res.status(400).json({ ok: false, error: 'invalid payload' });
    }

    const supabase = getSupabaseAdmin();

    // ユーザー作成（既存メールは既存IDを拾う）
    let userId: string | null = null;
    const created = await supabase.auth.admin.createUser({
      email: p.email,
      password: p.initPassword,
      email_confirm: true,
      user_metadata: { role: 'professional', name: p.name },
    });

    if (!created.error && created.data?.user?.id) {
      userId = created.data.user.id;
    } else {
      const msg = created.error?.message?.toLowerCase() || '';
      if (!(msg.includes('already') || msg.includes('registered') || msg.includes('exists'))) {
        return res.status(500).json({ ok: false, error: `Auth createUser failed: ${created.error?.message || 'unknown'}` });
      }
      // 既存ユーザーのIDを検索
      const perPage = 100;
      let page = 1;
      while (!userId) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
        if (error) break;
        const found = data.users.find(u => (u.email || '').toLowerCase() === String(p.email).toLowerCase());
        if (found?.id) { userId = found.id; break; }
        if (data.users.length < perPage || page++ > 20) break;
      }
      if (!userId) return res.status(409).json({ ok: false, error: 'email is already registered but user id not found' });
    }

    // DB upsert
    const row = {
      id: userId!,
      name: p.name,
      email: p.email,
      phone: p.phone || null,
      postal: normalizePostal(p.postal),
      prefecture: p.prefecture || null,
      city: p.city || null,
      address2: p.address2 || null,
      bio: p.bio || null,
      camera_gear: p.camera_gear || null,
      labels: toArr(p.labels),
      updated_at: new Date().toISOString(),
    };
    const { error: upErr } = await supabase.from('professionals').upsert(row, { onConflict: 'id' });
    if (upErr) return res.status(500).json({ ok: false, error: `DB upsert failed: ${upErr.message}` });

    // メール送信（resend が無ければスキップ、あっても失敗は握りつぶす）
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend'); // ← 動的 import（未インストール時もクラッシュしない）
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: FROM,
          to: [p.email],
          subject: '【Miles】アカウント作成が完了しました',
          text: [
            `${p.name} 様`,
            '',
            'Miles への登録が完了しました。',
            `ログインURL：${APP_URL}/login`,
            `メール：${p.email}`,
            `初期パスワード：${p.initPassword}`,
            '',
            '※初回ログイン後のパスワード変更をおすすめします。',
          ].join('\n'),
        });
      } catch (e) {
        console.error('Resend send skipped or failed:', e);
      }
    }

    return res.status(200).json({ ok: true, id: userId });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
