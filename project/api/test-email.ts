// project/api/test-email.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || '');
const FROM = process.env.MAIL_FROM || 'Miles <onboarding@resend.dev>';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const to = String(req.query.to || '');
    if (!to) return res.status(400).json({ ok: false, error: 'missing ?to=' });

    const r = await resend.emails.send({
      from: FROM,
      to,
      subject: 'Miles test',
      text: 'Hello from Miles test endpoint.',
    });

    return res.status(200).json({ ok: true, id: r?.data?.id || null });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'send_failed' });
  }
}
