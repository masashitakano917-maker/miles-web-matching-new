import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { email, newPassword } = req.body;
    // email から Auth user を取得 → パス更新
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const user = users?.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(404).json({ ok:false, error:'user not found' });

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password: newPassword });
    if (error) throw error;

    return res.status(200).json({ ok: true });
  } catch (e:any) {
    return res.status(400).json({ ok:false, error: e.message });
  }
}
