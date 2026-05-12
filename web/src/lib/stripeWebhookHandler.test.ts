import { describe, it, expect, vi } from 'vitest';

import {
  handle,
  type CreditInput,
  type StripeEvent,
  type StripeWebhookDeps,
} from './stripeWebhookHandler';

// =====================================================================================
// Tests vitest pour `handle(req, deps)` — handler pur du webhook Stripe.
//
// Le handler vit dans `./stripeWebhookHandler.ts` (étape 23). Le bootstrap
// Deno côté `supabase/functions/stripe-webhook/index.ts` réutilise le même
// module via un thin re-export (`./handler.ts`) — on teste donc la même
// logique que celle déployée en production.
//
// Ces tests couvrent :
//   - Cas nominal `invoice.payment_succeeded` (passe `source_event_id = event.id`
//     à `creditT99cp` — propriété testée en priorité 1 de l'étape 20).
//   - Idempotence applicative : 2 requêtes avec le même event.id → un seul crédit.
//   - Court-circuit `recordEventStart` renvoyant `false` → réponse 200 idempotent
//     sans appel aux deps métier.
//   - Erreurs métier (creditT99cp throw) → réponse 500 + ligne stripe_events
//     non marquée processed (Stripe retentera).
//   - Méthodes / signatures invalides → 4xx.
// =====================================================================================

function buildDeps(overrides: Partial<StripeWebhookDeps> = {}): StripeWebhookDeps {
  return {
    verifyEvent: vi.fn(async () => ({
      id: 'evt_default',
      type: 'invoice.payment_succeeded',
      data: { object: { metadata: { user_id: 'user_1' } } },
    })),
    upsertAdhesion: vi.fn(async () => undefined),
    updateAdhesionStatus: vi.fn(async () => undefined),
    creditT99cp: vi.fn(async () => undefined),
    monthlyT99cpBonus: () => 60,
    recordEventStart: vi.fn(async () => true),
    recordEventProcessed: vi.fn(async () => undefined),
    ...overrides,
  };
}

function buildRequest(body = '{}', headers: Record<string, string> = {}): Request {
  return new Request('https://example.test/webhook', {
    method: 'POST',
    headers: { 'stripe-signature': 'sig_default', ...headers },
    body,
  });
}

describe('stripe-webhook handle() — invoice.payment_succeeded', () => {
  it('passe `sourceEventId = event.id` à creditT99cp (idempotence DB)', async () => {
    const event: StripeEvent = {
      id: 'evt_inv_001',
      type: 'invoice.payment_succeeded',
      data: { object: { metadata: { user_id: 'user_42' } } },
    };
    const creditT99cp = vi.fn<(input: CreditInput) => Promise<void>>(async () => undefined);
    const deps = buildDeps({
      verifyEvent: vi.fn(async () => event),
      creditT99cp,
    });

    const res = await handle(buildRequest(), deps);

    expect(res.status).toBe(200);
    expect(creditT99cp).toHaveBeenCalledTimes(1);
    expect(creditT99cp).toHaveBeenCalledWith({
      userId: 'user_42',
      amount: 60,
      reason: 'adhesion_renewal',
      sourceEventId: 'evt_inv_001',
    });
  });

  it('lit user_id sur parent.subscription_details.metadata (invoice)', async () => {
    const event: StripeEvent = {
      id: 'evt_inv_002',
      type: 'invoice.payment_succeeded',
      data: {
        object: {
          parent: {
            subscription_details: { metadata: { user_id: 'user_from_subscription' } },
          },
        },
      },
    };
    const creditT99cp = vi.fn<(input: CreditInput) => Promise<void>>(async () => undefined);
    const deps = buildDeps({
      verifyEvent: vi.fn(async () => event),
      creditT99cp,
    });

    const res = await handle(buildRequest(), deps);

    expect(res.status).toBe(200);
    expect(creditT99cp).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user_from_subscription',
        sourceEventId: 'evt_inv_002',
      }),
    );
  });

  it('renvoie 400 si user_id est manquant', async () => {
    const event: StripeEvent = {
      id: 'evt_inv_003',
      type: 'invoice.payment_succeeded',
      data: { object: { metadata: {} } },
    };
    const creditT99cp = vi.fn<(input: CreditInput) => Promise<void>>(async () => undefined);
    const deps = buildDeps({
      verifyEvent: vi.fn(async () => event),
      creditT99cp,
    });

    const res = await handle(buildRequest(), deps);

    expect(res.status).toBe(400);
    expect(creditT99cp).not.toHaveBeenCalled();
  });

  it('idempotence applicative : 2 livraisons du même event.id → un seul crédit', async () => {
    const event: StripeEvent = {
      id: 'evt_inv_dup',
      type: 'invoice.payment_succeeded',
      data: { object: { metadata: { user_id: 'user_dup' } } },
    };
    const seenIds = new Set<string>();
    const creditT99cp = vi.fn<(input: CreditInput) => Promise<void>>(async () => undefined);
    const deps = buildDeps({
      verifyEvent: vi.fn(async () => event),
      recordEventStart: vi.fn(async (e) => {
        if (seenIds.has(e.id)) return false;
        seenIds.add(e.id);
        return true;
      }),
      creditT99cp,
    });

    const res1 = await handle(buildRequest(), deps);
    const res2 = await handle(buildRequest(), deps);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    const body2 = (await res2.json()) as { idempotent?: boolean };
    expect(body2.idempotent).toBe(true);
    expect(creditT99cp).toHaveBeenCalledTimes(1);
  });
});

describe('stripe-webhook handle() — sécurité / signature', () => {
  it('refuse les requêtes non-POST avec 405', async () => {
    const req = new Request('https://example.test/webhook', { method: 'GET' });
    const res = await handle(req, buildDeps());
    expect(res.status).toBe(405);
  });

  it('refuse les requêtes sans header stripe-signature avec 400', async () => {
    const req = new Request('https://example.test/webhook', { method: 'POST', body: '{}' });
    const res = await handle(req, buildDeps());
    expect(res.status).toBe(400);
    expect(await res.text()).toBe('missing_signature');
  });

  it('refuse les signatures invalides avec 400 + propage le message', async () => {
    const deps = buildDeps({
      verifyEvent: vi.fn(async () => {
        throw new Error('bad_sig');
      }),
    });
    const res = await handle(buildRequest(), deps);
    expect(res.status).toBe(400);
    expect(await res.text()).toContain('invalid_signature: bad_sig');
  });
});

describe('stripe-webhook handle() — robustesse', () => {
  it('renvoie 500 si recordEventStart throw (store idempotence indispo)', async () => {
    const deps = buildDeps({
      recordEventStart: vi.fn(async () => {
        throw new Error('connection refused');
      }),
    });
    const res = await handle(buildRequest(), deps);
    expect(res.status).toBe(500);
    expect(await res.text()).toContain('idempotency_store_error');
  });

  it('renvoie 500 si creditT99cp throw et ne marque pas processed_at', async () => {
    const event: StripeEvent = {
      id: 'evt_err',
      type: 'invoice.payment_succeeded',
      data: { object: { metadata: { user_id: 'user_err' } } },
    };
    const recordEventProcessed = vi.fn<(eventId: string) => Promise<void>>(async () => undefined);
    const deps = buildDeps({
      verifyEvent: vi.fn(async () => event),
      creditT99cp: vi.fn(async () => {
        throw new Error('rpc_failed');
      }),
      recordEventProcessed,
    });
    const res = await handle(buildRequest(), deps);
    expect(res.status).toBe(500);
    expect(recordEventProcessed).not.toHaveBeenCalled();
  });

  it('continue (200) si recordEventProcessed throw après une exécution réussie', async () => {
    const event: StripeEvent = {
      id: 'evt_post_err',
      type: 'invoice.payment_succeeded',
      data: { object: { metadata: { user_id: 'user_post' } } },
    };
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const deps = buildDeps({
      verifyEvent: vi.fn(async () => event),
      recordEventProcessed: vi.fn(async () => {
        throw new Error('flag_update_failed');
      }),
    });
    const res = await handle(buildRequest(), deps);
    expect(res.status).toBe(200);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('ignore les évènements non gérés (200 + processed_at marqué)', async () => {
    const event: StripeEvent = {
      id: 'evt_ignored',
      type: 'charge.refunded',
      data: { object: {} },
    };
    const recordEventProcessed = vi.fn<(eventId: string) => Promise<void>>(async () => undefined);
    const deps = buildDeps({
      verifyEvent: vi.fn(async () => event),
      recordEventProcessed,
    });
    const res = await handle(buildRequest(), deps);
    expect(res.status).toBe(200);
    expect(recordEventProcessed).toHaveBeenCalledWith('evt_ignored');
    const body = (await res.json()) as { ignored?: string };
    expect(body.ignored).toBe('charge.refunded');
  });
});

describe('stripe-webhook handle() — checkout + subscription', () => {
  it('upsert l\'adhésion sur checkout.session.completed (active)', async () => {
    const event: StripeEvent = {
      id: 'evt_chk',
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { user_id: 'user_chk', tier: 'engage' },
          subscription: 'sub_123',
          current_period_end: 1_730_000_000,
        },
      },
    };
    const upsertAdhesion = vi.fn<(input: never) => Promise<void>>(async () => undefined);
    const deps = buildDeps({
      verifyEvent: vi.fn(async () => event),
      upsertAdhesion: upsertAdhesion as unknown as StripeWebhookDeps['upsertAdhesion'],
    });
    const res = await handle(buildRequest(), deps);
    expect(res.status).toBe(200);
    expect(upsertAdhesion).toHaveBeenCalledWith({
      userId: 'user_chk',
      tier: 'engage',
      status: 'active',
      stripeSubscriptionId: 'sub_123',
      endsOn: new Date(1_730_000_000 * 1000).toISOString(),
    });
  });

  it('passe le statut adhesion à cancelled si Stripe envoie canceled', async () => {
    const event: StripeEvent = {
      id: 'evt_upd',
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_456',
          status: 'canceled',
          current_period_end: 1_730_000_000,
        },
      },
    };
    const updateAdhesionStatus = vi.fn<(input: never) => Promise<void>>(async () => undefined);
    const deps = buildDeps({
      verifyEvent: vi.fn(async () => event),
      updateAdhesionStatus: updateAdhesionStatus as unknown as StripeWebhookDeps['updateAdhesionStatus'],
    });
    const res = await handle(buildRequest(), deps);
    expect(res.status).toBe(200);
    expect(updateAdhesionStatus).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'cancelled', stripeSubscriptionId: 'sub_456' }),
    );
  });
});
