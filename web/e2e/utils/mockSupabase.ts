import type { Page, Route } from '@playwright/test';

/**
 * Options du seed de session authentifiée (cf. `installAuthenticatedSession`).
 * Tous les champs sont optionnels — un default raisonnable est appliqué pour
 * chacun afin de garder les call-sites minimaux côté specs.
 */
export interface AuthenticatedSessionOptions {
  /** id auth.users.id du stub (default `stub-authenticated-user-id`). */
  userId?: string;
  /** email du stub (default `stub@example.org`). */
  email?: string;
  /** display_name du stub (default `Stub User`). */
  displayName?: string;
}

/**
 * Pré-remplit la session Supabase authentifiée dans `localStorage` AVANT
 * le `page.goto(...)` afin que `useAuth().status` passe directement à
 * `'authenticated'` au boot, sans hit réseau `/auth/v1/token`.
 *
 * Pourquoi ce helper : 4 call-sites de `petition-signature.spec.ts` (étapes
 * 26 → 29) dupliquaient exactement la même séquence — fabriquer un objet
 * `stubSession`, calculer `expires_at = now + 24h`, appeler `addInitScript`
 * pour poser `sb-127-auth-token`. Un 5e call-site (poll vote/unvote, étape
 * 31) aurait dupliqué une 5e fois. Centraliser ferme la dette
 * `L8-arch-authsession` notée à l'étape 28 (refacto isolé aux fichiers
 * `e2e/`, zéro impact runtime).
 *
 * **Détail dérivation storageKey** : supabase-js v2 calcule
 * `storageKey = sb-${hostname.split('.')[0]}-auth-token` depuis
 * `VITE_SUPABASE_URL`. En CI/E2E (`.github/workflows/ci.yml:22`) c'est
 * `http://127.0.0.1:54321`, donc la clé est `sb-127-auth-token`. Si un
 * jour l'env CI bouge (ex. `http://supabase-stub:54321`), il faudra
 * mettre à jour cette constante en miroir.
 *
 * **Marge expires_at** : 24h dans le futur, large vs la durée d'un run
 * E2E (<30 s). Aucun signal d'expiration ne devrait se déclencher avant
 * la fin du test.
 */
export async function installAuthenticatedSession(
  page: Page,
  options: AuthenticatedSessionOptions = {},
): Promise<void> {
  const userId = options.userId ?? 'stub-authenticated-user-id';
  const email = options.email ?? 'stub@example.org';
  const displayName = options.displayName ?? 'Stub User';
  const expiresIn = 86_400;
  const stubSession = {
    access_token: 'stub-access-token',
    token_type: 'bearer',
    expires_in: expiresIn,
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
    refresh_token: 'stub-refresh-token',
    user: {
      id: userId,
      aud: 'authenticated',
      email,
      user_metadata: { display_name: displayName },
      app_metadata: { provider: 'email' },
    },
  };
  await page.addInitScript((session) => {
    window.localStorage.setItem('sb-127-auth-token', JSON.stringify(session));
  }, stubSession);
}

/**
 * Réponse REST customisable par table. Permet aux specs E2E qui veulent
 * tester l'affichage avec données non-vides (ex. transparence avec
 * compteurs non-nuls) de remplacer la réponse par défaut sans toucher
 * aux autres tables.
 *
 * - `count` : pour les requêtes `head: true, count: 'exact'`, valeur
 *   utilisée pour fabriquer le header `content-range: 0-N/<count>`.
 * - `rows` : pour les requêtes non-`head`, body JSON renvoyé.
 *
 * Les clés `rest` correspondent au nom de la table PostgREST (segment
 * juste après `/rest/v1/`, avant `?`). Les clés `rpc` correspondent au
 * nom de la fonction (segment juste après `/rest/v1/rpc/`, avant `?`).
 *
 * **Limites volontaires** (E2E only, pas un vrai PostgREST) :
 * - Si la même table reçoit DEUX requêtes différentes (ex. `users` :
 *   un `head: true, count` pour le compteur + un `select('created_at')`
 *   pour le graphique mensuel), la même override est servie aux deux.
 *   Le client supabase-js lit `count` depuis le header sur la requête
 *   head (body ignoré) et `rows` depuis le body sur la requête non-head
 *   (header content-range non utilisé). Heureux hasard fonctionnel :
 *   pour le test transparence c'est exactement ce qu'on veut.
 * - Le mock n'applique PAS les filtres PostgREST (`.eq()`, `.gte()`,
 *   `.order()`, `.limit()`, `.range()`) ni les arguments RPC : `rows`
 *   est renvoyé tel quel au client, qui filtre/agrège côté JS si
 *   nécessaire. Pour les tests qui dépendent du filtrage SQL réel,
 *   utiliser un projet Supabase de test seedé (cf. PROD-RUNBOOK §6).
 */
export interface SupabaseStubOverrides {
  rest?: Record<string, { count?: number; rows?: unknown[] }>;
  rpc?: Record<string, { rows?: unknown[] }>;
}

/**
 * Intercepteur réseau Playwright pour stubber les appels Supabase
 * (REST PostgREST + Auth v1 + RPC) afin de pouvoir exécuter les flows
 * critiques en E2E sans dépendre d'un vrai projet Supabase.
 *
 * En CI on injecte `VITE_SUPABASE_URL=http://127.0.0.1:54321` et un
 * anon key factice via `e2e/utils/env.ts`. Toutes les requêtes réseau
 * sont ensuite interceptées ici.
 *
 * Par défaut, toutes les requêtes REST retournent `[]` avec
 * `content-range: 0-0/0`. Pour customiser table par table, passer
 * un `overrides.rest` (cf. `SupabaseStubOverrides`).
 */
export async function installSupabaseStubs(
  page: Page,
  overrides: SupabaseStubOverrides = {},
) {
  await page.route('**/auth/v1/**', async (route: Route) => {
    const url = route.request().url();
    if (url.includes('/auth/v1/token')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'stub-access-token',
          refresh_token: 'stub-refresh-token',
          token_type: 'bearer',
          expires_in: 3600,
          user: {
            id: 'stub-user-id',
            email: 'stub@example.org',
            user_metadata: { display_name: 'Stub User' },
          },
        }),
      });
    }
    if (url.includes('/auth/v1/user')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'stub-user-id',
          email: 'stub@example.org',
          user_metadata: { display_name: 'Stub User' },
        }),
      });
    }
    if (url.includes('/auth/v1/signup')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: null, session: null }),
      });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  await page.route('**/rest/v1/**', async (route: Route) => {
    const restOverrides = overrides.rest ?? {};
    const rpcOverrides = overrides.rpc ?? {};
    const url = route.request().url();
    // Distingue les appels RPC (`/rest/v1/rpc/<fn>`) des appels REST
    // table (`/rest/v1/<table>`). Pour les RPC, supabase-js POSTe les
    // arguments dans le body — on les ignore et on renvoie le `rows`
    // override tel quel.
    const rpcMatch = /\/rest\/v1\/rpc\/([^/?]+)/.exec(url);
    if (rpcMatch) {
      const fn = rpcMatch[1] ?? '';
      const override = rpcOverrides[fn];
      const rows = override?.rows ?? [];
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(rows),
      });
    }
    // Extrait la table PostgREST : `/rest/v1/<table>?...`. Si la regex
    // ne matche pas (URL malformée — ne devrait jamais arriver vu le
    // wildcard `**/rest/v1/**` qui filtre déjà), `table` reste `''`,
    // aucune override ne matche et on retombe sur la réponse par défaut
    // `[]` / `content-range: 0-0/0`.
    //
    // **CORS expose-headers** : la page est servie sur le port 4173
    // (vite preview), l'API mockée sur le port 54321 → cross-origin.
    // Par défaut, le browser ne donne accès qu'aux headers safelist
    // (Content-Type, Content-Length, etc.) à JavaScript. Le header
    // `content-range` n'y est PAS — il faut le déclarer explicitement
    // via `access-control-expose-headers` pour que supabase-js puisse
    // le lire et parser le `count: 'exact'` côté
    // `fetchTransparencyCounts`. Sans ça, `res.headers.get("content-range")`
    // renvoie `null` côté postgrest-js et tous les compteurs tombent à 0.
    const match = /\/rest\/v1\/([^/?]+)/.exec(url);
    const table = match?.[1] ?? '';
    const override = restOverrides[table];
    if (override) {
      const rows = override.rows ?? [];
      const count = override.count ?? rows.length;
      const endIdx = rows.length === 0 ? 0 : rows.length - 1;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'content-range': `0-${endIdx}/${count}`,
          'access-control-expose-headers': 'content-range',
        },
        body: JSON.stringify(rows),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'content-range': '0-0/0',
        'access-control-expose-headers': 'content-range',
      },
      body: '[]',
    });
  });
}
