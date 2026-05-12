// =====================================================================================
// stripe-webhook — Edge Function (Deno) — bootstrap
//
// Réception des évènements Stripe en production. La logique pure du handler
// vit dans `./handler.ts` (testable depuis vitest côté `web/`). Ce fichier
// se contente d'instancier les dépendances Deno-only (Stripe SDK, supabase-js)
// et d'appeler `handle(req, deps)`.
//
// Variables d'environnement attendues :
//   STRIPE_SECRET_KEY            — clé secrète (pour la lib stripe)
//   STRIPE_WEBHOOK_SECRET        — secret du webhook (signature)
//   SUPABASE_URL                 — base URL du projet
//   SUPABASE_SERVICE_ROLE_KEY    — clé service-role (server-only)
// =====================================================================================

import {
  handle,
  type StripeEvent,
  type StripeWebhookDeps,
} from './handler.ts';

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
    creditT99cp: async ({ userId, amount, reason, sourceEventId }) => {
      // sourceEventId est passé à la RPC `credit_t99cp` comme
      // `p_source_event_id` (étape 20). Côté DB, un index unique partiel
      // sur `t99cp_transactions.source_event_id` garantit qu'un même
      // event.id Stripe ne créditera pas le wallet deux fois, même si la
      // ligne `stripe_events` a été manuellement supprimée.
      const { error } = await admin.rpc('credit_t99cp', {
        p_user: userId,
        p_amount: amount,
        p_reason: reason,
        p_source_event_id: sourceEventId ?? null,
      });
      if (error) throw new Error(error.message);
    },
    monthlyT99cpBonus: () => 60,
    recordEventStart: async (event) => {
      // Insert ON CONFLICT DO NOTHING + select : si rien n'est inséré, l'event
      // a déjà été enregistré. On distingue via le retour `data` (null si
      // conflit, l'objet inséré sinon). `ignoreDuplicates` côté supabase-js
      // utilise ON CONFLICT DO NOTHING en arrière-plan.
      const { data, error } = await admin
        .from('stripe_events')
        .upsert(
          { id: event.id, type: event.type, payload: event as unknown as Record<string, unknown> },
          { onConflict: 'id', ignoreDuplicates: true },
        )
        .select('id');
      if (error) throw new Error(error.message);
      return Array.isArray(data) && data.length > 0;
    },
    recordEventProcessed: async (eventId) => {
      const { error } = await admin
        .from('stripe_events')
        .update({ processed_at: new Date().toISOString() })
        .eq('id', eventId);
      if (error) throw new Error(error.message);
    },
  };

  // @ts-expect-error — Deno.serve runtime
  Deno.serve((req: Request) => handle(req, deps));
}

if (typeof Deno !== 'undefined' && Deno.serve && import.meta.main) {
  denoBootstrap();
}
