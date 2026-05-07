import type { Handler } from '@netlify/functions';

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? '';
const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? 'campagne@pasdepesticidespournosenfants.fr';
const CONTACT_TO = process.env.CONTACT_TO_EMAIL ?? 'contact@bioconsomacteurs.org';

const json = (status: number, body: unknown) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'method_not_allowed' });
  if (!RESEND_API_KEY) return json(500, { error: 'missing_env' });

  let payload: { name?: string; email?: string; subject?: string; message?: string; hp?: string };
  try {
    payload = JSON.parse(event.body ?? '{}');
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  if (payload.hp) return json(200, { ok: true }); // honeypot

  const { name, email, subject, message } = payload;
  if (!name || !email || !subject || !message) {
    return json(400, { error: 'missing_fields' });
  }
  if (message.length > 5000) return json(400, { error: 'message_too_long' });

  const html = `<p><strong>De :</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
<p><strong>Sujet :</strong> ${escapeHtml(subject)}</p>
<hr/>
<p style="white-space:pre-wrap;font-family:Inter,Arial,sans-serif;">${escapeHtml(message)}</p>`;

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Pas de pesticides — Contact <${RESEND_FROM_EMAIL}>`,
      to: [CONTACT_TO],
      subject: `[Contact site] ${subject}`,
      html,
      reply_to: email,
    }),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    console.error('[resend] contact error', resp.status, txt);
    return json(502, { error: 'resend_failed' });
  }

  return json(200, { ok: true });
};
