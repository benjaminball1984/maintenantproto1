import type { Page, Route } from '@playwright/test';

/**
 * Intercepteur réseau Playwright pour stubber les appels Supabase
 * (REST PostgREST + Auth v1 + RPC) afin de pouvoir exécuter les flows
 * critiques en E2E sans dépendre d'un vrai projet Supabase.
 *
 * En CI on injecte `VITE_SUPABASE_URL=http://127.0.0.1:54321` et un
 * anon key factice via `e2e/utils/env.ts`. Toutes les requêtes réseau
 * sont ensuite interceptées ici.
 */
export async function installSupabaseStubs(page: Page) {
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
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'content-range': '0-0/0' },
      body: '[]',
    });
  });
}
