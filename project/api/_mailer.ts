// project/api/_mailer.ts
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const MAIL_FROM = process.env.MAIL_FROM || 'Miles <no-reply@miles.example>';

type MailInput = { to: string; subject: string; html: string };

export async function sendMail({ to, subject, html }: MailInput) {
  // APIキー未設定ならドライラン（ログだけ）
  if (!RESEND_API_KEY) {
    console.log('[MAIL:DRYRUN]', { to, subject });
    return { ok: true, dryRun: true };
  }

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: MAIL_FROM, to, subject, html }),
  });

  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Resend error: ${txt}`);
  }
  return { ok: true };
}
