import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const json = (status: number, body: unknown) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'method_not_allowed' });
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return json(500, { error: 'missing_env' });

  const sessionId = event.queryStringParameters?.session_id;
  if (!sessionId) return json(400, { error: 'missing_session_id' });

  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const { data: order, error } = await sb
    .from('material_orders')
    .select(
      'id, status, flyer_a6, flyer_a5, poster_a3, petition_paper, shipping_cost_eur, shipping_address, shipping_city, shipping_postal_code, signature_id',
    )
    .eq('stripe_session_id', sessionId)
    .single();

  if (error || !order) return json(404, { error: 'order_not_found' });

  let firstName: string | null = null;
  if (order.signature_id) {
    const { data: sig } = await sb
      .from('signatures')
      .select('first_name')
      .eq('id', order.signature_id)
      .single();
    firstName = (sig?.first_name as string) ?? null;
  }

  const totalUnits =
    (order.flyer_a6 as number) +
    (order.flyer_a5 as number) +
    (order.poster_a3 as number) +
    (order.petition_paper as number);

  return json(200, {
    status: order.status,
    firstName,
    totalUnits,
    shippingEur: Number(order.shipping_cost_eur),
    shippingCity: order.shipping_city,
  });
};
