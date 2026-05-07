import { SPEC, type Cart, type MaterialKey } from './materials';

const KEYS: MaterialKey[] = ['flyer_a6', 'flyer_a5', 'poster_a3', 'petition_paper'];

export type OrderEmailData = {
  firstName: string;
  cart: Cart;
  shippingEur: number;
  shippingAddress: {
    street: string;
    complement: string | null;
    city: string;
    postalCode: string;
  };
  organizeUrl: string;
  siteUrl: string;
};

export function renderOrderEmail(data: OrderEmailData) {
  const { firstName, cart, shippingEur, shippingAddress, organizeUrl, siteUrl } = data;

  const lines = KEYS
    .filter((k) => cart[k] > 0)
    .map(
      (k) =>
        `<tr><td style="padding:6px 0;color:#1A1A1A;">${SPEC[k].label}</td><td style="padding:6px 0;text-align:right;font-weight:600;">${cart[k]} ex.</td></tr>`,
    )
    .join('');

  const totalEur = shippingEur.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"/><title>Votre commande est confirmée</title></head>
<body style="margin:0;background:#FAF7F0;font-family:Inter,Arial,sans-serif;color:#1A1A1A;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
      <tr><td style="background:#1F3F2C;padding:24px 28px;color:#FAF7F0;">
        <div style="font-size:22px;font-weight:700;line-height:1.1;">Votre commande est confirmée</div>
        <div style="font-size:14px;color:#9DBE6F;margin-top:6px;">Pas de pesticides pour nos enfants</div>
      </td></tr>
      <tr><td style="padding:28px;">
        <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">Bonjour ${escapeHtml(firstName)},</p>
        <p style="font-size:16px;line-height:1.6;margin:0 0 20px;">
          Merci, votre commande de matériel est bien enregistrée. Vous le recevrez sous
          <strong>5 à 7 jours ouvrés</strong>.
        </p>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-top:1px solid #eee;border-bottom:1px solid #eee;margin:0 0 20px;">
          ${lines}
          <tr><td style="padding:10px 0;border-top:1px solid #eee;">Frais d'envoi (La Poste)</td>
              <td style="padding:10px 0;text-align:right;border-top:1px solid #eee;font-weight:700;color:#1F3F2C;">${totalEur}</td></tr>
        </table>

        <p style="font-size:14px;line-height:1.6;margin:0 0 20px;">
          <strong>Adresse de livraison :</strong><br/>
          ${escapeHtml(shippingAddress.street)}<br/>
          ${shippingAddress.complement ? `${escapeHtml(shippingAddress.complement)}<br/>` : ''}
          ${escapeHtml(shippingAddress.postalCode)} ${escapeHtml(shippingAddress.city)}
        </p>

        <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">
          Maintenant, le plus important : <strong>où</strong> allez-vous le distribuer ?
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr><td>
            <a href="${organizeUrl}" style="display:block;background:#F2C53D;color:#1F3F2C;text-decoration:none;font-weight:700;font-size:16px;padding:14px 18px;border-radius:12px;text-align:center;">
              Organiser ma distribution maintenant →
            </a>
          </td></tr>
        </table>
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

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
