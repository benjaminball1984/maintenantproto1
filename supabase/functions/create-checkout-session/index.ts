// =====================================================================================
// create-checkout-session — Edge Function (Deno)
//
// Crée une session Stripe Checkout en mode `subscription` pour un tier payant
// (« soutien » ou « engage ») et retourne l'URL hébergée par Stripe.
//
// Authentification : le client front appelle la fonction via
// `supabase.functions.invoke('create-checkout-session', { body: { tier } })`,
// ce qui ajoute automatiquement l'en-tête `Authorization: Bearer <jwt>`. On
// reconstruit un client Supabase server-side avec la clé anon + le JWT du
// caller pour récupérer son user.id via `auth.getUser()`. Aucune confiance
// n'est accordée au body : le tier est validé contre une allow-list.
//
// Variables d'environnement attendues (Deno.env) :
//   STRIPE_SECRET_KEY        — clé secrète Stripe (sk_test_... ou sk_live_...)
//   STRIPE_PRICE_SOUTIEN     — id du Price récurrent pour le tier « soutien »
//   STRIPE_PRICE_ENGAGE      — id du Price récurrent pour le tier « engage »
//   SUPABASE_URL             — base URL du projet Supabase
//   SUPABASE_ANON_KEY        — clé anon (utilisée avec le JWT du caller)
//   PUBLIC_SITE_URL          — URL publique du front (success_url / cancel_url)
//
// Cette fonction est testable en isolation via `verifyAndCreate(req, deps)`
// (injection de dépendances). Le harness Node minimaliste dans
// `index.test.ts` valide la logique sans Deno ni Stripe réels.
// =====================================================================================

// Imports Deno-only protégés par un guard `import.meta.main` pour rester
// compatibles avec un harness de test Node qui n'embarque pas le runtime Deno.
// (Le sandbox CI n'exécute pas cette fonction — c'est `supabase functions
// deploy` qui le fera plus tard.)

export type Tier = 'soutien' | 'engage';

export interface CreateCheckoutDeps {
  /** Récupère l'utilisateur à partir d'un Bearer JWT. */
  getUserFromJwt: (jwt: string) => Promise<{ id: string; email: string | null } | null>;
  /** Crée la session Stripe Checkout — retour : l'URL hébergée. */
  createStripeSession: (input: {
    priceId: string;
    customerEmail: string | null;
    clientReferenceId: string;
    successUrl: string;
    cancelUrl: string;
    metadata: Record<string, string>;
  }) => Promise<{ url: string }>;
  /** Résout l'id Stripe Price pour un tier donné. */
  resolvePriceId: (tier: Tier) => string;
  /** URL publique du front. */
  siteUrl: () => string;
}

const ALLOWED_TIERS: readonly Tier[] = ['soutien', 'engage'];

function isTier(value: unknown): value is Tier {
  return typeof value === 'string' && (ALLOWED_TIERS as readonly string[]).includes(value);
}

export async function handle(req: Request, deps: CreateCheckoutDeps): Promise<Response> {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsFor(origin) });
  }
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405, origin);
  }

  const auth = req.headers.get('authorization') ?? '';
  const jwt = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : '';
  if (!jwt) {
    return json({ error: 'missing_authorization' }, 401, origin);
  }

  let parsedBody: unknown;
  try {
    parsedBody = await req.json();
  } catch {
    return json({ error: 'invalid_body' }, 400, origin);
  }
  const tier =
    parsedBody && typeof parsedBody === 'object' && 'tier' in parsedBody
      ? (parsedBody as { tier?: unknown }).tier
      : undefined;
  if (!isTier(tier)) {
    return json({ error: 'invalid_tier' }, 400, origin);
  }

  const user = await deps.getUserFromJwt(jwt);
  if (!user) {
    return json({ error: 'unauthenticated' }, 401, origin);
  }

  const priceId = deps.resolvePriceId(tier);
  if (!priceId) {
    return json({ error: 'price_not_configured' }, 500, origin);
  }

  const siteUrl = deps.siteUrl().replace(/\/$/, '');
  const successUrl = `${siteUrl}/profile?adhesion=ok`;
  const cancelUrl = `${siteUrl}/join?canceled=1`;

  try {
    const session = await deps.createStripeSession({
      priceId,
      customerEmail: user.email,
      clientReferenceId: user.id,
      successUrl,
      cancelUrl,
      metadata: { user_id: user.id, tier },
    });
    return json({ url: session.url }, 200, origin);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'stripe_error';
    return json({ error: 'stripe_error', detail: message }, 502, origin);
  }
}

// ---- helpers locaux (CORS inline pour éviter une dépendance entre fichiers
//      qui complique le test isolé) ------------------------------------------
const ALLOWED_ORIGINS: readonly string[] = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

function corsFor(origin: string | null): Record<string, string> {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'access-control-allow-origin': allow,
    'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
    'access-control-allow-methods': 'POST, OPTIONS',
    vary: 'origin',
  };
}

function json(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...corsFor(origin) },
  });
}

// =====================================================================================
// Bootstrap Deno (production). Ignoré côté Node : le guard `import.meta.main`
// n'est vrai que lorsque le fichier est exécuté directement par `deno run`.
// =====================================================================================
declare const Deno: { env: { get: (name: string) => string | undefined }; serve?: unknown };

async function denoBootstrap(): Promise<void> {
  // @ts-expect-error — import dynamique Deno-only (URL résolue par Deno deno-deploy)
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.49.4');
  // @ts-expect-error — Stripe Deno build
  const Stripe = (await import('https://esm.sh/stripe@17.5.0?target=deno')).default;

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
  const priceSoutien = Deno.env.get('STRIPE_PRICE_SOUTIEN') ?? '';
  const priceEngage = Deno.env.get('STRIPE_PRICE_ENGAGE') ?? '';
  const siteUrl = Deno.env.get('PUBLIC_SITE_URL') ?? 'http://localhost:5173';

  const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });

  const deps: CreateCheckoutDeps = {
    getUserFromJwt: async (jwt) => {
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${jwt}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await client.auth.getUser(jwt);
      if (error || !data?.user) return null;
      return { id: data.user.id, email: data.user.email ?? null };
    },
    createStripeSession: async (input) => {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: input.priceId, quantity: 1 }],
        customer_email: input.customerEmail ?? undefined,
        client_reference_id: input.clientReferenceId,
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        metadata: input.metadata,
        subscription_data: { metadata: input.metadata },
      });
      if (!session.url) {
        throw new Error('stripe_returned_no_url');
      }
      return { url: session.url };
    },
    resolvePriceId: (tier) => (tier === 'soutien' ? priceSoutien : priceEngage),
    siteUrl: () => siteUrl,
  };

  // @ts-expect-error — Deno.serve global runtime
  Deno.serve((req: Request) => handle(req, deps));
}

if (typeof Deno !== 'undefined' && Deno.serve && import.meta.main) {
  denoBootstrap();
}
