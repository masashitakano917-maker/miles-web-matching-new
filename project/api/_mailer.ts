// project/api/_mailer.ts
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const MAIL_FROM = process.env.MAIL_FROM || 'Miles <no-reply@example.com>';

type MailInput = { to: string; subject: string; html: string };
export type MailResult = { ok: boolean; delivered: boolean; reason?: string; dryRun?: boolean };

export async function sendMail({ to, subject, html }: MailInput): Promise<MailResult> {
  if (!RESEND_API_KEY) {
    console.log('[MAIL:DRYRUN]', { to, subject });
    return { ok: true, delivered: false, dryRun: true, reason: 'RESEND_API_KEY not set' };
  }
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: MAIL_FROM, to, subject, html }),
  });
  if (!r.ok) {
    const txt = await r.text();
    return { ok: false, delivered: false, reason: txt };
  }
  return { ok: true, delivered: true };
}
