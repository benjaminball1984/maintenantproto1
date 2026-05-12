// =====================================================================================
// stripe-webhook — Pure handler (testable depuis vitest)
//
// Ce fichier ne contient que la logique pure du webhook Stripe (types + handle).
// Le bootstrap Deno + les implémentations DI (Stripe SDK, supabase-js) vivent
// dans `index.ts` qui importe `handle` d'ici. Cette séparation permet aux tests
// vitest côté `web/` d'importer ce fichier sans tirer d'imports Deno-only.
//
// Évènements gérés :
//   checkout.session.completed       → upsert adhesion (status='active')
//   customer.subscription.deleted    → adhesions.status='cancelled'
//   customer.subscription.updated    → status='cancelled' si Stripe status
//                                      ∈ { canceled, unpaid, incomplete_expired }
//                                      sinon synchronise current_period_end
//   invoice.payment_succeeded        → credit_t99cp(user, 60, 'adhesion_renewal',
//                                                   source_event_id=event.id)
//
// Idempotence à deux niveaux (étape 19 + étape 20) :
//   1. `stripe_events.id` PK (étape 19) : court-circuit en amont si l'event
//      a déjà été reçu (réponse 200 `{ idempotent: true }`).
//   2. `t99cp_transactions.source_event_id` UNIQUE (étape 20, défense en
//      profondeur) : la RPC `credit_t99cp` refuse un doublon même si la
//      ligne `stripe_events` a été supprimée manuellement.
// =====================================================================================

export interface AdhesionUpsert {
  userId: string;
  // `'gratuit'` (cf. enum DB `public.adhesion_tier`) est volontairement
  // exclu : il n'y a pas de subscription Stripe pour l'adhésion gratuite.
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
  /**
   * ID de l'évènement Stripe (event.id) qui déclenche le crédit. Sert de clé
   * d'idempotence côté DB (`t99cp_transactions.source_event_id` UNIQUE). Si
   * deux invocations du webhook arrivent avec le même event.id, seule la
   * première créditera réellement le wallet.
   */
  sourceEventId?: string;
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
  /**
   * Insère l'évènement dans `stripe_events` (PK = id). Renvoie `false` si la
   * PK est déjà présente (évènement déjà traité, on répond 200 idempotent).
   * Renvoie `true` si la ligne vient d'être créée.
   */
  recordEventStart: (event: StripeEvent) => Promise<boolean>;
  /** Marque la ligne stripe_events.processed_at = now() après exécution. */
  recordEventProcessed: (eventId: string) => Promise<void>;
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
  parent?: { subscription_details?: { metadata?: Record<string, string> | null } } | null;
}

const CANCEL_STATUSES = new Set(['canceled', 'unpaid', 'incomplete_expired']);

function readTier(metadata: Record<string, string> | null | undefined): AdhesionUpsert['tier'] {
  const tier = metadata?.tier;
  if (tier === 'soutien' || tier === 'engage') return tier;
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

  let isNewEvent: boolean;
  try {
    isNewEvent = await deps.recordEventStart(event);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'idempotency_store_error';
    return new Response(`idempotency_store_error: ${message}`, { status: 500 });
  }
  if (!isNewEvent) {
    return new Response(JSON.stringify({ received: true, idempotent: true, id: event.id }), {
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
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
          sourceEventId: event.id,
        });
        break;
      }
      default:
        // Évènement non géré : on accuse réception (200) pour que Stripe ne
        // retente pas indéfiniment. C'est explicite et documenté. On marque
        // tout de même la ligne `processed_at` pour distinguer « non géré »
        // de « jamais traité ». Si le marquage échoue, on log et on
        // répond quand même 200 (cohérent avec la branche success en
        // bas du try/catch principal).
        try {
          await deps.recordEventProcessed(event.id);
        } catch (err) {
          // On log uniquement `err.message` (et pas l'objet brut) : la lib
          // supabase-js peut embarquer `error.details` contenant un extrait
          // de payload PostgREST — défense en profondeur côté logs Edge.
          const message = err instanceof Error ? err.message : 'unknown';
          console.warn('stripe-webhook: recordEventProcessed (default case) failed:', message);
        }
        return new Response(JSON.stringify({ received: true, ignored: event.type }), {
          status: 200,
          headers: { 'content-type': 'application/json; charset=utf-8' },
        });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'handler_error';
    // Note : on ne marque PAS processed_at en cas d'erreur. La ligne reste
    // avec processed_at=null pour audit. Stripe retentera (jusqu'à 3 jours).
    return new Response(`handler_error: ${message}`, { status: 500 });
  }

  try {
    await deps.recordEventProcessed(event.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.warn('stripe-webhook: recordEventProcessed failed:', message);
  }

  return new Response(JSON.stringify({ received: true, id: event.id }), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
