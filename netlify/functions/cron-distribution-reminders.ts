/**
 * Scheduled Function — exécution quotidienne (cron `0 9 * * *` dans netlify.toml).
 * Envoie un rappel J-1 puis un rappel J-0 aux organisateur·rices de distributions.
 */
import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const RESEND_API_KEY = process.env.RESEND_API_KEY ?? '';
const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? 'campagne@pasdepesticidespournosenfants.fr';
const SITE_URL = process.env.VITE_SITE_URL ?? 'https://pasdepesticidespournosenfants.fr';

const formatDateFr = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const isoDay = (offsetDays: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

export const handler: Handler = async () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY) {
    return { statusCode: 500, body: 'missing_env' };
  }

  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const tomorrow = isoDay(1); // J-1
  const todayIso = isoDay(0); // J-0

  const sent = { J_1: 0, J_0: 0, errors: 0 };

  for (const [day, label] of [
    [tomorrow, 'J-1'],
    [todayIso, 'J-0'],
  ] as const) {
    const { data, error } = await sb
      .from('distributions')
      .select(
        'id, date, start_time, end_time, organizer_first_name, organizer_email, custom_location, custom_postal_code, custom_city, establishment_uai',
      )
      .eq('date', day);

    if (error) {
      console.error(`[cron] query failed for ${label}`, error);
      sent.errors++;
      continue;
    }

    for (const d of data ?? []) {
      let locationName =
        ((d.custom_location as string | null) ?? '') || 'Lieu à confirmer';
      if (d.establishment_uai) {
        const { data: est } = await sb
          .from('establishments')
          .select('name')
          .eq('uai', d.establishment_uai)
          .maybeSingle();
        if (est?.name) locationName = est.name as string;
      }

      const isToday = label === 'J-0';
      const subject = isToday
        ? `C'est aujourd'hui — ta distribution à ${locationName}`
        : `Demain, ta distribution à ${locationName}`;

      const html = renderReminder({
        firstName: d.organizer_first_name as string,
        isToday,
        dateFr: formatDateFr(d.date as string),
        startTime: (d.start_time as string).slice(0, 5),
        endTime: (d.end_time as string).slice(0, 5),
        locationName,
        practicalUrl: `${SITE_URL}/comment-distribuer`,
        siteUrl: SITE_URL,
      });

      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Bio Consom'acteurs <${RESEND_FROM_EMAIL}>`,
          to: [d.organizer_email],
          subject,
          html,
          reply_to: 'contact@bioconsomacteurs.org',
        }),
      });
      if (resp.ok) {
        if (isToday) sent.J_0++;
        else sent.J_1++;
      } else {
        console.error(`[cron] resend failed`, resp.status, await resp.text());
        sent.errors++;
      }
    }
  }

  console.log('[cron] reminders sent', sent);
  return { statusCode: 200, body: JSON.stringify(sent) };
};

function renderReminder(opts: {
  firstName: string;
  isToday: boolean;
  dateFr: string;
  startTime: string;
  endTime: string;
  locationName: string;
  practicalUrl: string;
  siteUrl: string;
}) {
  const { firstName, isToday, dateFr, startTime, endTime, locationName, practicalUrl, siteUrl } = opts;
  const headline = isToday ? "C'est aujourd'hui !" : 'Rappel : c\'est demain';
  const body = isToday
    ? `<strong>${escapeHtml(dateFr)}</strong>, de ${escapeHtml(startTime)} à ${escapeHtml(endTime)}, à <strong>${escapeHtml(locationName)}</strong>. On compte sur toi !`
    : `Demain <strong>${escapeHtml(dateFr)}</strong>, de ${escapeHtml(startTime)} à ${escapeHtml(endTime)}, tu animes une distribution à <strong>${escapeHtml(locationName)}</strong>.`;
  const checklist = isToday
    ? `<ul style="font-size:15px;line-height:1.7;margin:12px 0 0;padding-left:20px;">
        <li>QR code visible, affiche A3 si possible</li>
        <li>De l'eau, un sac pour ranger les signatures papier</li>
        <li>Tu n'es pas seul·e — d'autres mobilisé·es peuvent te rejoindre</li>
       </ul>`
    : `<ul style="font-size:15px;line-height:1.7;margin:12px 0 0;padding-left:20px;">
        <li>Imprime tes pétitions papier (ou QR code à coller)</li>
        <li>Préviens un·e ami·e — c'est plus chaleureux à deux</li>
        <li>Vérifie la météo</li>
       </ul>`;
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"/></head>
<body style="margin:0;background:#FAF7F0;font-family:Inter,Arial,sans-serif;color:#1A1A1A;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
      <tr><td style="background:#1F3F2C;padding:24px 28px;color:#FAF7F0;">
        <div style="font-size:22px;font-weight:700;line-height:1.1;">${escapeHtml(headline)}</div>
        <div style="font-size:14px;color:#F2C53D;margin-top:6px;">Pas de pesticides pour nos enfants</div>
      </td></tr>
      <tr><td style="padding:28px;">
        <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">Bonjour ${escapeHtml(firstName)},</p>
        <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">${body}</p>
        <p style="font-size:15px;line-height:1.6;margin:0;font-weight:600;">À ne pas oublier :</p>
        ${checklist}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 0;">
          <tr><td>
            <a href="${practicalUrl}" style="display:block;background:#F2C53D;color:#1F3F2C;text-decoration:none;font-weight:700;font-size:15px;padding:12px 18px;border-radius:12px;text-align:center;">
              Relire la fiche pratique →
            </a>
          </td></tr>
        </table>
      </td></tr>
      <tr><td style="background:#F4F0E6;padding:18px 28px;font-size:12px;color:#666;line-height:1.6;">
        Bio Consom'acteurs — <a href="${siteUrl}" style="color:#1F3F2C;">${siteUrl.replace(/^https?:\/\//, '')}</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}
