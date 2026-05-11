// =====================================================================================
// stripe-webhook — Edge Function (Deno)
//
// Reçoit les évènements Stripe et synchronise `public.adhesions` + crédite
// le wallet T99CP via la RPC `credit_t99cp`. Cette fonction tourne avec la
// service-role (cf. `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')`) afin de
// pouvoir bypasser les policies RLS et écrire le ledger T99CP.
//
// Variables d'environnement attendues :
//   STRIPE_SECRET_KEY            — clé secrète (pour la lib stripe)
//   STRIPE_WEBHOOK_SECRET        — secret du webhook (signature)
//   SUPABASE_URL                 — base URL du projet
//   SUPABASE_SERVICE_ROLE_KEY    — clé service-role (server-only)
//
// Évènements gérés :
//   checkout.session.completed       → upsert adhesion (status='active')
//   customer.subscription.deleted    → adhesions.status='cancelled'
//   customer.subscription.updated    → status='cancelled' si Stripe status
//                                      ∈ { canceled, unpaid, incomplete_expired }
//                                      sinon synchronise current_period_end
//   invoice.payment_succeeded        → credit_t99cp(user, 60, 'adhesion_renewal')
//
// La fonction est testable en isolation via `handle(req, deps)` (DI). Le
// guard `import.meta.main` empêche l'exécution du bootstrap Deno côté Node.
// =====================================================================================

export interface AdhesionUpsert {
  userId: string;
  tier: 'soutien' | 'engage';
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  stripeSubscriptionId: string;
  endsOn: string | null;
}

export interface AdhesionStatusUpdate {
  stripeSubscriptionId: string;
  status: 'active' | 'cancelled' | 'expired';
  endsOn: string | null;
}

export interface CreditInput {
  userId: string;
  amount: number;
  reason: string;
}

export interface StripeWebhookDeps {
  /** Vérifie la signature Stripe et renvoie l'évènement parsé. */
  verifyEvent: (payload: string, signature: string) => Promise<StripeEvent>;
  /** Upsert d'une adhésion (clé : stripe_subscription_id). */
  upsertAdhesion: (input: AdhesionUpsert) => Promise<void>;
  /** Met à jour le statut d'une adhésion. */
  updateAdhesionStatus: (input: AdhesionStatusUpdate) => Promise<void>;
  /** Appelle la RPC credit_t99cp. */
  creditT99cp: (input: CreditInput) => Promise<void>;
  /** Bonus mensuel en T99CP crédité à chaque paiement réussi. */
  monthlyT99cpBonus: () => number;
}

// Sous-ensemble minimal des types Stripe utilisé ici. On reste laxiste sur les
// champs facultatifs : la lib stripe-node renvoie déjà ces formes. Pour rester
// compatible avec un mock simple côté tests, on n'utilise pas les types natifs.
export interface StripeEvent {
  id: string;
  type: string;
  data: { object: StripeEventObject };
}

export interface StripeEventObject {
  id?: string;
  client_reference_id?: string | null;
  subscription?: string | null;
  customer?: string | null;
  customer_email?: string | null;
  status?: string;
  current_period_end?: number | null;
  metadata?: Record<string, string> | null;
  // Spécifique aux invoices : ref vers la subscription + customer.
  parent?: { subscription_details?: { metadata?: Record<string, string> | null } } | null;
}

const CANCEL_STATUSES = new Set(['canceled', 'unpaid', 'incomplete_expired']);

function readTier(metadata: Record<string, string> | null | undefined): AdhesionUpsert['tier'] {
  const tier = metadata?.tier;
  if (tier === 'soutien' || tier === 'engage') return tier;
  // Fallback prudent : on traite comme 'soutien' (et on logge).
  console.warn('stripe-webhook: missing tier metadata, defaulting to soutien');
  return 'soutien';
}

function readUserId(metadata: Record<string, string> | null | undefined): string | null {
  return metadata?.user_id ?? null;
}

function epochToIso(seconds: number | null | undefined): string | null {
  if (!seconds) return null;
  return new Date(seconds * 1000).toISOString();
}

export async function handle(req: Request, deps: StripeWebhookDeps): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('method_not_allowed', { status: 405 });
  }
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('missing_signature', { status: 400 });
  }
  const body = await req.text();

  let event: StripeEvent;
  try {
    event = await deps.verifyEvent(body, signature);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'invalid_signature';
    return new Response(`invalid_signature: ${message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const obj = event.data.object;
        const userId = readUserId(obj.metadata) ?? obj.client_reference_id ?? null;
        const subscriptionId =
          typeof obj.subscription === 'string' ? obj.subscription : (obj.subscription ?? '');
        if (!userId || !subscriptionId) {
          return new Response('missing_user_or_subscription', { status: 400 });
        }
        await deps.upsertAdhesion({
          userId,
          tier: readTier(obj.metadata),
          status: 'active',
          stripeSubscriptionId: subscriptionId,
          endsOn: epochToIso(obj.current_period_end ?? null),
        });
        break;
      }
      case 'customer.subscription.deleted': {
        const obj = event.data.object;
        if (!obj.id) return new Response('missing_subscription_id', { status: 400 });
        await deps.updateAdhesionStatus({
          stripeSubscriptionId: obj.id,
          status: 'cancelled',
          endsOn: epochToIso(obj.current_period_end ?? null),
        });
        break;
      }
      case 'customer.subscription.updated': {
        const obj = event.data.object;
        if (!obj.id) return new Response('missing_subscription_id', { status: 400 });
        const stripeStatus = obj.status ?? '';
        const nextStatus: AdhesionStatusUpdate['status'] = CANCEL_STATUSES.has(stripeStatus)
          ? 'cancelled'
          : 'active';
        await deps.updateAdhesionStatus({
          stripeSubscriptionId: obj.id,
          status: nextStatus,
          endsOn: epochToIso(obj.current_period_end ?? null),
        });
        break;
      }
      case 'invoice.payment_succeeded': {
        const obj = event.data.object;
        // Sur les invoices Stripe, l'user_id est porté par la subscription parente
        // (cf. subscription_data.metadata au moment du checkout).
        const userId =
          readUserId(obj.metadata) ??
          readUserId(obj.parent?.subscription_details?.metadata ?? null);
        if (!userId) {
          return new Response('missing_user_metadata', { status: 400 });
        }
        await deps.creditT99cp({
          userId,
          amount: deps.monthlyT99cpBonus(),
          reason: 'adhesion_renewal',
        });
        break;
      }
      default:
        // Évènement non géré : on accuse réception (200) pour que Stripe ne
        // retente pas indéfiniment. C'est explicite et documenté.
        return new Response(JSON.stringify({ received: true, ignored: event.type }), {
          status: 200,
          headers: { 'content-type': 'application/json; charset=utf-8' },
        });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'handler_error';
    return new Response(`handler_error: ${message}`, { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

// =====================================================================================
// Bootstrap Deno
// =====================================================================================
declare const Deno: { env: { get: (name: string) => string | undefined }; serve?: unknown };

async function denoBootstrap(): Promise<void> {
  // @ts-expect-error — Deno-only dynamic import
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.49.4');
  // @ts-expect-error — Stripe Deno build
  const Stripe = (await import('https://esm.sh/stripe@17.5.0?target=deno')).default;

  const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const deps: StripeWebhookDeps = {
    verifyEvent: async (payload, signature) => {
      return (await stripe.webhooks.constructEventAsync(
        payload,
        signature,
        webhookSecret,
      )) as StripeEvent;
    },
    upsertAdhesion: async ({ userId, tier, status, stripeSubscriptionId, endsOn }) => {
      const { error } = await admin.from('adhesions').upsert(
        {
          user_id: userId,
          tier,
          status,
          stripe_subscription_id: stripeSubscriptionId,
          ends_on: endsOn,
        },
        { onConflict: 'stripe_subscription_id' },
      );
      if (error) throw new Error(error.message);
    },
    updateAdhesionStatus: async ({ stripeSubscriptionId, status, endsOn }) => {
      const { error } = await admin
        .from('adhesions')
        .update({ status, ends_on: endsOn })
        .eq('stripe_subscription_id', stripeSubscriptionId);
      if (error) throw new Error(error.message);
    },
    creditT99cp: async ({ userId, amount, reason }) => {
      const { error } = await admin.rpc('credit_t99cp', {
        p_user: userId,
        p_amount: amount,
        p_reason: reason,
      });
      if (error) throw new Error(error.message);
    },
    monthlyT99cpBonus: () => 60,
  };

  // @ts-expect-error — Deno.serve runtime
  Deno.serve((req: Request) => handle(req, deps));
}

if (typeof Deno !== 'undefined' && Deno.serve && import.meta.main) {
  denoBootstrap();
}
