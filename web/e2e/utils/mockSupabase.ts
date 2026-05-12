import type { Page, Route } from '@playwright/test';

/**
 * Réponse REST customisable par table. Permet aux specs E2E qui veulent
 * tester l'affichage avec données non-vides (ex. transparence avec
 * compteurs non-nuls) de remplacer la réponse par défaut sans toucher
 * aux autres tables.
 *
 * - `count` : pour les requêtes `head: true, count: 'exact'`, valeur
 *   utilisée pour fabriquer le header `content-range: 0-0/<count>`.
 * - `rows` : pour les requêtes non-`head`, body JSON renvoyé.
 *
 * Les clés correspondent au nom de la table PostgREST (segment juste
 * après `/rest/v1/`, avant `?`).
 */
export interface SupabaseStubOverrides {
  rest?: Record<string, { count?: number; rows?: unknown[] }>;
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
    const url = route.request().url();
    // Extrait la table PostgREST : `/rest/v1/<table>?...`
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
        headers: { 'content-range': `0-${endIdx}/${count}` },
        body: JSON.stringify(rows),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'content-range': '0-0/0' },
      body: '[]',
    });
  });
}
