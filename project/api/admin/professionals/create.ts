import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const {
      name, email, phone, postal, prefecture, city, address2, bio,
      labels, camera_gear, initPassword,
    } = payload || {};

    if (!name || !email) return res.status(400).json({ ok: false, error: 'name/email is required' });

    // null/型整形
    const clean = (v: any) => (v === '' || v === undefined ? null : v);
    const labelArr: string[] = Array.isArray(labels) ? labels.filter(Boolean) : [];

    // DB insert
    const { data, error } = await supabaseAdmin
      .from('professionals')
      .insert([{
        name,
        email: String(email).toLowerCase(),
        phone: clean(phone),
        postal: clean(postal),
        prefecture: clean(prefecture),
        city: clean(city),
        address2: clean(address2),
        bio: clean(bio),
        camera_gear: clean(camera_gear),
        labels: labelArr,
      }])
      .select('*')
      .single();

    if (error) return res.status(400).json({ ok: false, error: error.message });

    // ここでユーザー作成/初期PWなどをやる場合は追加（任意）

    return res.status(200).json({ ok: true, item: data });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'internal error' });
  }
}
