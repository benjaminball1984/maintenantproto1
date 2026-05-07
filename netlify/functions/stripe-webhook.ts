import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import type { Cart } from './_shared/materials';
import { renderOrderEmail } from './_shared/email-order';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? '';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const RESEND_API_KEY = process.env.RESEND_API_KEY ?? '';
const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? 'campagne@pasdepesticidespournosenfants.fr';
const SITE_URL = process.env.VITE_SITE_URL ?? 'https://pasdepesticidespournosenfants.fr';

const text = (status: number, body: string) => ({
  statusCode: status,
  headers: { 'Content-Type': 'text/plain' },
  body,
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return text(405, 'method_not_allowed');
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) return text(500, 'missing_env');

  const sig = event.headers['stripe-signature'] ?? event.headers['Stripe-Signature'];
  if (!sig || !event.body) return text(400, 'missing_signature');

  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' });

  let stripeEvent: Stripe.Event;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error('[stripe-webhook] signature failed', err);
    return text(400, 'invalid_signature');
  }

  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        if (!orderId) {
          console.warn('[stripe-webhook] session without order_id');
          break;
        }

        const { data: order, error } = await sb
          .from('material_orders')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            stripe_payment_intent_id:
              typeof session.payment_intent === 'string'
                ? session.payment_intent
                : session.payment_intent?.id ?? null,
          })
          .eq('id', orderId)
          .select(
            'id, signature_id, flyer_a6, flyer_a5, poster_a3, petition_paper, shipping_cost_eur, shipping_address, shipping_complement, shipping_city, shipping_postal_code',
          )
          .single();

        if (error || !order) {
          console.error('[stripe-webhook] order update failed', error);
          break;
        }

        if (order.signature_id) {
          const { data: sigRow } = await sb
            .from('signatures')
            .select('first_name, email')
            .eq('id', order.signature_id)
            .single();

          if (sigRow && RESEND_API_KEY) {
            const cart: Cart = {
              flyer_a6: order.flyer_a6 as number,
              flyer_a5: order.flyer_a5 as number,
              poster_a3: order.poster_a3 as number,
              petition_paper: order.petition_paper as number,
            };

            const html = renderOrderEmail({
              firstName: sigRow.first_name as string,
              cart,
              shippingEur: Number(order.shipping_cost_eur),
              shippingAddress: {
                street: order.shipping_address as string,
                complement: order.shipping_complement as string | null,
                city: order.shipping_city as string,
                postalCode: order.shipping_postal_code as string,
              },
              organizeUrl: `${SITE_URL}/organiser`,
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
                to: [sigRow.email],
                subject: 'Ta commande de matériel est confirmée',
                html,
                reply_to: 'contact@bioconsomacteurs.org',
              }),
            });
            if (!resp.ok) {
              console.error('[stripe-webhook] resend failed', resp.status, await resp.text());
            }
          }
        }
        break;
      }

      case 'checkout.session.expired':
      case 'payment_intent.payment_failed': {
        const obj = stripeEvent.data.object as { metadata?: Record<string, string> };
        const orderId = obj.metadata?.order_id;
        if (orderId) {
          await sb
            .from('material_orders')
            .update({ status: 'cancelled' })
            .eq('id', orderId);
        }
        break;
      }

      default:
        // ignore les autres événements
        break;
    }
  } catch (err) {
    console.error('[stripe-webhook] processing error', err);
    return text(500, 'processing_error');
  }

  return text(200, 'ok');
};

// IMPORTANT : Stripe doit recevoir le body brut (raw) pour vérifier la signature.
// Configuration dans netlify.toml + le handler reçoit déjà le body en string.
