import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import {
  KEYS,
  SPEC,
  calculateShippingEur,
  totalWeightGrams,
  validateCart,
} from './_shared/materials';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? '';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const SITE_URL = process.env.VITE_SITE_URL ?? 'https://pasdepesticidespournosenfants.fr';

const json = (status: number, body: unknown) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'method_not_allowed' });
  if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(500, { error: 'missing_env' });
  }

  let payload: {
    signatureId?: string;
    cart?: unknown;
    shipping_address?: string;
    shipping_complement?: string | null;
    shipping_city?: string;
    shipping_postal_code?: string;
  };
  try {
    payload = JSON.parse(event.body ?? '{}');
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  if (!payload.signatureId) return json(400, { error: 'missing_signature_id' });

  const cartCheck = validateCart(payload.cart);
  if (!cartCheck.ok) return json(400, { error: cartCheck.error });
  const { cart } = cartCheck;

  const street = (payload.shipping_address ?? '').trim();
  const city = (payload.shipping_city ?? '').trim();
  const postal = (payload.shipping_postal_code ?? '').trim();
  if (street.length < 4 || city.length < 2 || !/^\d{5}$/.test(postal)) {
    return json(400, { error: 'invalid_address' });
  }

  const weight = totalWeightGrams(cart);
  const shippingEur = calculateShippingEur(weight);
  const shippingCents = Math.round(shippingEur * 100);

  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // Vérifier que la signature existe
  const { data: signature, error: sigErr } = await sb
    .from('signatures')
    .select('id, first_name, last_name, email')
    .eq('id', payload.signatureId)
    .single();
  if (sigErr || !signature) return json(404, { error: 'signature_not_found' });

  // Brouillon de commande
  const { data: order, error: orderErr } = await sb
    .from('material_orders')
    .insert({
      signature_id: signature.id,
      flyer_a6: cart.flyer_a6,
      flyer_a5: cart.flyer_a5,
      poster_a3: cart.poster_a3,
      petition_paper: cart.petition_paper,
      total_weight_g: weight,
      shipping_cost_eur: shippingEur,
      shipping_address: street,
      shipping_complement: payload.shipping_complement ?? null,
      shipping_city: city,
      shipping_postal_code: postal,
      status: 'pending',
    })
    .select('id')
    .single();
  if (orderErr || !order) {
    console.error('[order] insert failed', orderErr);
    return json(500, { error: 'order_creation_failed' });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' });

  const description =
    KEYS.filter((k) => cart[k] > 0)
      .map((k) => `${cart[k]} × ${SPEC[k].label}`)
      .join(', ') || 'Matériel offert';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      locale: 'fr',
      customer_email: signature.email as string,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: shippingCents,
            product_data: {
              name: 'Frais d\'envoi — Pas de pesticides pour nos enfants',
              description,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        order_id: order.id as string,
        signature_id: signature.id as string,
      },
      success_url: `${SITE_URL}/commander/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/commander`,
    });

    if (!session.url) {
      return json(500, { error: 'stripe_no_url' });
    }

    await sb
      .from('material_orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id);

    return json(200, { url: session.url });
  } catch (err) {
    console.error('[stripe] session creation failed', err);
    return json(502, { error: 'stripe_failed' });
  }
};
