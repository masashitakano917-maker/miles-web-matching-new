// project/api/admin/professionals/create.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_supabaseAdmin';
import { sendMail } from '../_mailer';

const APP_BASE_URL = process.env.APP_BASE_URL || 'https://miles-web.vercel.app';

function normalizePostal(v?: string) {
  const d = String(v || '').replace(/\D/g, '').slice(0, 7);
  if (d.length === 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return d;
}
const clean = (v: any) => (v === '' || v === undefined ? null : v);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const {
      name, email, phone, initPassword,
      postal, prefecture, city, address2,
      bio, camera_gear, labels,
    } = body || {};

    if (!name || !email) return res.status(400).json({ ok: false, error: 'name/email is required' });
    if (!initPassword || String(initPassword).length < 8) {
      return res.status(400).json({ ok: false, error: 'initPassword must be >= 8 chars' });
    }

    const emailLower = String(email).toLowerCase();

    // 既存チェック（メール重複）: professionals 側
    {
      const { data: exists, error: existsErr } = await supabaseAdmin
        .from('professionals')
        .select('id')
        .eq('email', emailLower)
        .maybeSingle();
      if (existsErr) {
        return res.status(400).json({ ok: false, error: existsErr.message });
      }
      if (exists) {
        return res.status(409).json({ ok: false, error: 'このメールは既に登録されています' });
      }
    }

    // 1) Supabase Auth にユーザー作成（メール確認済みで登録）
    const { data: created, error: createUserErr } = await supabaseAdmin.auth.admin.createUser({
      email: emailLower,
      password: initPassword,
      email_confirm: true,
      user_metadata: { role: 'professional' },
    });
    if (createUserErr || !created?.user?.id) {
      return res.status(400).json({ ok: false, error: createUserErr?.message || 'auth user create failed' });
    }
    const userId = created.user.id;

    // 2) professionals にプロフィール作成
    const labelArr: string[] = Array.isArray(labels) ? labels.filter(Boolean) : [];
    const insertPayload = {
      user_id: userId,
      name,
      email: emailLower,
      phone: clean(phone),
      postal: normalizePostal(postal),
      prefecture: clean(prefecture),
      city: clean(city),
      address2: clean(address2),
      bio: clean(bio),
      camera_gear: clean(camera_gear),
      labels: labelArr,
    };

    const { data: pro, error: proErr } = await supabaseAdmin
      .from('professionals')
      .insert([insertPayload])
      .select('*')
      .single();

    if (proErr) {
      // DB失敗時は作成したAuthユーザーを掃除
      await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
      return res.status(400).json({ ok: false, error: proErr.message });
    }

    // 3) メール送信（失敗しても登録自体は成功とする）
    try {
      const loginUrl = `${APP_BASE_URL}/login`;
      await sendMail({
        to: emailLower,
        subject: '【Miles】プロフェッショナル登録が完了しました',
        html: `
          <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">
            <p>${name} 様</p>
            <p>Miles へのご登録ありがとうございます。以下の情報でログインできます。</p>
            <ul>
              <li>ログインURL：<a href="${loginUrl}">${loginUrl}</a></li>
              <li>メール：${emailLower}</li>
              <li>初期パスワード：<code>${initPassword}</code></li>
            </ul>
            <p>ログイン後、パスワードの変更をおすすめします。</p>
            <p>今後ともよろしくお願いいたします。</p>
          </div>
        `,
      });
    } catch (mailErr: any) {
      console.error('[MAIL] failed:', mailErr?.message || mailErr);
      // メール失敗は200で返す（UI上は登録OK）
    }

    return res.status(200).json({ ok: true, item: pro });
  } catch (e: any) {
    console.error('[create professional] error', e);
    return res.status(500).json({ ok: false, error: e?.message || 'internal error' });
  }
}
