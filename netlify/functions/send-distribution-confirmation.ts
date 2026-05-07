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

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const formatDateFr = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'method_not_allowed' });
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY) {
    return json(500, { error: 'missing_env' });
  }

  let distributionId: string | undefined;
  try {
    const body = JSON.parse(event.body ?? '{}') as { distributionId?: string };
    distributionId = body.distributionId;
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  if (!distributionId) return json(400, { error: 'missing_distribution_id' });

  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // Récup distribution + nom de l'établissement éventuel
  const { data: dist, error } = await sb
    .from('distributions')
    .select(
      'id, date, start_time, end_time, organizer_first_name, organizer_email, custom_location, custom_postal_code, custom_city, establishment_uai',
    )
    .eq('id', distributionId)
    .single();

  if (error || !dist) return json(404, { error: 'distribution_not_found' });

  let locationName = (dist.custom_location as string | null) ?? null;
  let locationAddress = (dist.custom_postal_code as string | null) ?? null;
  if (dist.establishment_uai) {
    const { data: est } = await sb
      .from('establishments')
      .select('name, postal_code, city, address')
      .eq('uai', dist.establishment_uai)
      .maybeSingle();
    if (est) {
      locationName = est.name as string;
      locationAddress = `${est.postal_code ?? ''} ${est.city ?? ''}${
        est.address ? ` — ${est.address}` : ''
      }`.trim();
    }
  } else if (dist.custom_city) {
    locationAddress = `${dist.custom_postal_code ?? ''} ${dist.custom_city}`.trim();
  }

  const html = renderEmail({
    firstName: dist.organizer_first_name as string,
    dateFr: formatDateFr(dist.date as string),
    startTime: (dist.start_time as string).slice(0, 5),
    endTime: (dist.end_time as string).slice(0, 5),
    locationName: locationName ?? 'Lieu à confirmer',
    locationAddress: locationAddress ?? '',
    siteUrl: SITE_URL,
    practicalUrl: `${SITE_URL}/comment-distribuer`,
    mapUrl: `${SITE_URL}/carte?focus=${distributionId}`,
  });

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Bio Consom'acteurs <${RESEND_FROM_EMAIL}>`,
      to: [dist.organizer_email],
      subject: `Ta distribution du ${formatDateFr(dist.date as string)} est enregistrée`,
      html,
      reply_to: 'contact@bioconsomacteurs.org',
    }),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    console.error('[resend] dist conf error', resp.status, txt);
    return json(502, { error: 'resend_failed' });
  }

  return json(200, { ok: true });
};

function renderEmail(opts: {
  firstName: string;
  dateFr: string;
  startTime: string;
  endTime: string;
  locationName: string;
  locationAddress: string;
  siteUrl: string;
  practicalUrl: string;
  mapUrl: string;
}) {
  const {
    firstName,
    dateFr,
    startTime,
    endTime,
    locationName,
    locationAddress,
    siteUrl,
    practicalUrl,
    mapUrl,
  } = opts;
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"/><title>Distribution enregistrée</title></head>
<body style="margin:0;background:#FAF7F0;font-family:Inter,Arial,sans-serif;color:#1A1A1A;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
      <tr><td style="background:#1F3F2C;padding:24px 28px;color:#FAF7F0;">
        <div style="font-size:22px;font-weight:700;line-height:1.1;">Ta distribution est enregistrée</div>
        <div style="font-size:14px;color:#9DBE6F;margin-top:6px;">Pas de pesticides pour nos enfants</div>
      </td></tr>
      <tr><td style="padding:28px;">
        <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">Bonjour ${escapeHtml(firstName)},</p>
        <p style="font-size:16px;line-height:1.6;margin:0 0 20px;">
          Merci pour ton engagement. Voici le récapitulatif de ta distribution :
        </p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F0;border-radius:12px;padding:0;margin:0 0 24px;">
          <tr><td style="padding:16px;">
            <p style="margin:0 0 4px;font-size:13px;color:#666;">📅 Quand</p>
            <p style="margin:0 0 12px;font-size:15px;font-weight:600;">${escapeHtml(dateFr)} — ${escapeHtml(startTime)} → ${escapeHtml(endTime)}</p>
            <p style="margin:0 0 4px;font-size:13px;color:#666;">📍 Où</p>
            <p style="margin:0;font-size:15px;font-weight:600;">${escapeHtml(locationName)}</p>
            ${locationAddress ? `<p style="margin:2px 0 0;font-size:13px;color:#666;">${escapeHtml(locationAddress)}</p>` : ''}
          </td></tr>
        </table>

        <p style="font-size:16px;line-height:1.6;margin:0 0 12px;font-weight:600;">
          Pour réussir ta distribution :
        </p>
        <ul style="font-size:15px;line-height:1.7;margin:0 0 20px;padding-left:20px;">
          <li>Reste sur le <strong>trottoir public</strong>, jamais à l'intérieur.</li>
          <li>Sourire, message court, on s'adresse aux <strong>adultes</strong>.</li>
          <li>Idéalement à <strong>plusieurs</strong>, avec QR code et affiche A3 visibles.</li>
          <li>Si on te demande de partir : courtoisie, et déplacement de quelques mètres.</li>
        </ul>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr><td>
            <a href="${practicalUrl}" style="display:block;background:#F2C53D;color:#1F3F2C;text-decoration:none;font-weight:700;font-size:16px;padding:14px 18px;border-radius:12px;text-align:center;">
              Voir la fiche pratique complète →
            </a>
          </td></tr>
        </table>

        <p style="font-size:14px;color:#666;margin:20px 0 0;text-align:center;">
          <a href="${mapUrl}" style="color:#1F3F2C;">Voir ma distribution sur la carte</a>
        </p>

        <p style="font-size:16px;line-height:1.6;margin:24px 0 0;">
          On te renverra un rappel la veille puis le jour J.
        </p>
        <p style="font-size:16px;line-height:1.6;margin:8px 0 0;">— L'équipe Bio Consom'acteurs</p>
      </td></tr>
      <tr><td style="background:#F4F0E6;padding:18px 28px;font-size:12px;color:#666;line-height:1.6;">
        Bio Consom'acteurs — 10 rue Beaumarchais, 93100 Montreuil —
        <a href="${siteUrl}" style="color:#1F3F2C;">${siteUrl.replace(/^https?:\/\//, '')}</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}
