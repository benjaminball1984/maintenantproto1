import type { Page, Route } from '@playwright/test';

// =====================================================================================
// `installStatefulToggleRoute` — étape 38, clôt la dette `L9-arch-stateful-mock`.
//
// Helper E2E pour stubber les routes PostgREST de type « toggle »
// (POST = activer, DELETE = désactiver, GET = lire l'état). Le pattern
// a été dupliqué 10× depuis l'étape 28 (sign/unsign, vote/unvote,
// rsvp/cancel, campaign-action, ×N variantes) — cf. dette
// `L9-arch-stateful-mock` documentée à l'étape 31.
//
// Conception :
//
//   - Le state interne `toggled` vit dans la closure du handler
//     `page.route` — Playwright sérialise les handlers de route par
//     requête, donc pas de race condition même si plusieurs requêtes
//     concurrentes hit le même handler (le state flip est atomique
//     d'un appel `route.fulfill` à l'autre).
//
//   - GET retourne `[insertedRow]` ou `[]` selon `toggled`. Pour les
//     cas où GET projette des colonnes (ex. `getUserVote` qui
//     `.select('option_id')`), le caller peut passer `projection`
//     pour retourner une forme plus étroite.
//
//   - POST 201 (PostgREST insert default). DELETE 204 (PostgREST
//     delete sans `.select()`). Codes calqués sur les 10 sites
//     existants pour rester drop-in.
//
//   - Le helper ne refactorise PAS les 10 sites existants à
//     l'étape 38 (risque medium d'ouvrir un edge case sur l'ordre
//     LIFO des routes Playwright ou la closure du flag) — il est
//     utilisé uniquement pour le 11e site (follow/unfollow). Les
//     refactos existants sont reportés en dette
//     `L11-e2e-refacto-stateful-callsites`. La dette
//     `L9-arch-stateful-mock` est désormais close au sens « helper
//     extrait + 1 nouveau call-site qui l'utilise ».
// =====================================================================================

export interface StatefulToggleRouteOptions<TRow> {
  /** URL pattern Playwright (ex. <code>**&#47;rest/v1/follows**</code>). */
  matchUrl: string;
  /** Ligne PostgREST renvoyée par POST et listée par GET quand toggled. */
  insertedRow: TRow;
  /** True si l'état initial est déjà toggled (ex. user déjà signataire). */
  initiallyToggled?: boolean;
  /**
   * Projection optionnelle appliquée à `insertedRow` pour les GET. Utile
   * quand la query côté front utilise `.select('id')` ou `.select('option_id')`
   * (cf. `getUserVote`). Si omis, le row entier est retourné.
   */
  projection?: (row: TRow) => unknown;
}

export interface StatefulToggleRouteHandle {
  /** Lit l'état courant — utile pour assertions cross-test. */
  isToggled: () => boolean;
}

/**
 * Pose un handler de route stateful (POST/DELETE/GET) sur `matchUrl`.
 * Retourne un handle pour inspecter l'état depuis le test.
 */
export async function installStatefulToggleRoute<TRow>(
  page: Page,
  options: StatefulToggleRouteOptions<TRow>,
): Promise<StatefulToggleRouteHandle> {
  let toggled = options.initiallyToggled ?? false;
  const project = options.projection ?? ((row: TRow) => row);

  await page.route(options.matchUrl, async (route: Route) => {
    const method = route.request().method();
    if (method === 'POST') {
      toggled = true;
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify([options.insertedRow]),
      });
    }
    if (method === 'DELETE') {
      toggled = false;
      return route.fulfill({
        status: 204,
        contentType: 'application/json',
        body: '',
      });
    }
    // GET (ou autre) : reflète l'état courant.
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(toggled ? [project(options.insertedRow)] : []),
    });
  });

  return {
    isToggled: () => toggled,
  };
}
