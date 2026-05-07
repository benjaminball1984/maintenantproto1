import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const RESEND_API_KEY = process.env.RESEND_API_KEY ?? '';
const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? 'campagne@pasdepesticidespournosenfants.fr';
const SITE_URL = process.env.VITE_SITE_URL ?? 'https://pasdepesticidespournosenfants.fr';

const json = (status: number, body: unknown) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'method_not_allowed' });

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY) {
    return json(500, { error: 'missing_env' });
  }

  let signatureId: string | undefined;
  try {
    const body = JSON.parse(event.body ?? '{}') as { signatureId?: string };
    signatureId = body.signatureId;
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  if (!signatureId) return json(400, { error: 'missing_signature_id' });

  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const { data: signature, error } = await sb
    .from('signatures')
    .select('id, first_name, email, consent_newsletter')
    .eq('id', signatureId)
    .single();

  if (error || !signature) return json(404, { error: 'signature_not_found' });

  const html = renderEmail({
    firstName: signature.first_name as string,
    materialUrl: `${SITE_URL}/commander`,
    organizeUrl: `${SITE_URL}/organiser`,
    siteUrl: SITE_URL,
    unsubscribeUrl: `${SITE_URL}/contact?subject=desinscription&email=${encodeURIComponent(
      signature.email as string,
    )}`,
  });

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Bio Consom'acteurs <${RESEND_FROM_EMAIL}>`,
      to: [signature.email],
      subject: "Merci d'avoir signé — voilà comment aller plus loin",
      html,
      reply_to: 'contact@bioconsomacteurs.org',
    }),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    console.error('[resend] error', resp.status, txt);
    return json(502, { error: 'resend_failed' });
  }

  return json(200, { ok: true });
};

function renderEmail(opts: {
  firstName: string;
  materialUrl: string;
  organizeUrl: string;
  siteUrl: string;
  unsubscribeUrl: string;
}) {
  const { firstName, materialUrl, organizeUrl, siteUrl, unsubscribeUrl } = opts;
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Merci de votre signature</title>
</head>
<body style="margin:0;background:#FAF7F0;font-family:Inter,Arial,sans-serif;color:#1A1A1A;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F0;padding:24px 0;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
      <tr><td style="background:#1F3F2C;padding:24px 28px;color:#FAF7F0;">
        <div style="font-size:24px;font-weight:700;line-height:1.1;">PAS DE PESTICIDES</div>
        <div style="font-size:24px;font-weight:700;color:#F2C53D;line-height:1.1;">POUR NOS ENFANTS&nbsp;!</div>
      </td></tr>
      <tr><td style="padding:28px;">
        <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">Bonjour ${escapeHtml(firstName)},</p>
        <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">
          Merci d'avoir signé la pétition <strong>« Pas de pesticides pour nos enfants »</strong>.
          Vous venez de rejoindre un mouvement qui rassemble parents, citoyennes et citoyens, partout
          en France, autour d'un objectif simple : que nos enfants mangent sain dans toutes les cantines.
        </p>
        <p style="font-size:16px;line-height:1.6;margin:0 0 24px;">
          Mais une signature, seule, ne change pas grand-chose. Ce qui fait bouger les élu·es,
          c'est l'ampleur de la mobilisation sur le terrain. Voilà comment aller plus loin :
        </p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
          <tr><td>
            <a href="${materialUrl}" style="display:block;background:#F2C53D;color:#1F3F2C;text-decoration:none;font-weight:700;font-size:16px;padding:14px 18px;border-radius:12px;text-align:center;">
              Commander du matériel — c'est gratuit →
            </a>
          </td></tr>
        </table>
        <p style="font-size:14px;color:#666;margin:0 0 24px;">
          Recevez chez vous des flyers et des pétitions papier à diffuser à la sortie des écoles,
          des collèges, des lycées, dans votre quartier, à votre marché.
        </p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
          <tr><td>
            <a href="${organizeUrl}" style="display:block;background:#1F3F2C;color:#FAF7F0;text-decoration:none;font-weight:700;font-size:16px;padding:14px 18px;border-radius:12px;text-align:center;">
              Organiser une distribution →
            </a>
          </td></tr>
        </table>
        <p style="font-size:14px;color:#666;margin:0 0 24px;">
          Tenez une table de signature devant un établissement scolaire ou lors d'un événement local.
          On vous accompagne pas à pas, vous n'êtes pas seul·e.
        </p>

        <p style="font-size:16px;line-height:1.6;margin:24px 0 0;">
          Chaque signature de plus, c'est une voix qui pèse. Et vous, vous pouvez en récolter dix,
          cent, mille de plus. Merci de ce que vous faites.
        </p>
        <p style="font-size:16px;line-height:1.6;margin:8px 0 0;">— L'équipe Bio Consom'acteurs</p>
      </td></tr>
      <tr><td style="background:#F4F0E6;padding:18px 28px;font-size:12px;color:#666;line-height:1.6;">
        Bio Consom'acteurs — 10 rue Beaumarchais, 93100 Montreuil —
        <a href="${siteUrl}" style="color:#1F3F2C;">${siteUrl.replace(/^https?:\/\//, '')}</a><br/>
        Vous recevez ce message parce que vous avez signé notre pétition.
        <a href="${unsubscribeUrl}" style="color:#1F3F2C;">Se désinscrire</a>.
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
