import { test, expect } from '@playwright/test';

import { expectNoCriticalAxeViolations } from './utils/axe';
import { installSupabaseStubs } from './utils/mockSupabase';

// =====================================================================================
// E2E UI-only sur /transparence : Supabase est stubbé (cf. mockSupabase.ts) donc
// toutes les requêtes REST renvoient une collection vide / count = 0 par
// défaut. Certains tests passent un `overrides.rest` pour simuler des
// compteurs non-nuls ou un graphique avec inscriptions.
//
// On valide ici uniquement le routing + le rendu de la page (compteurs +
// état vide ou non du graphique + lien footer fonctionnel + a11y
// axe-core). Le « happy path réel » (Supabase de test seedé, signature
// anonyme) reste listé dans le runbook PROD-RUNBOOK.md §6 — étape
// ultérieure quand un projet Supabase de test sera provisionné.
// =====================================================================================

test.describe('Page /transparence — smoke UI', () => {
  test.beforeEach(async ({ page }) => {
    await installSupabaseStubs(page);
  });

  test('charge la page et rend les compteurs à zéro', async ({ page }) => {
    await page.goto('/transparence');
    await expect(
      page.getByRole('heading', { level: 1, name: /Transparence/i }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/12 mai 2026/)).toBeVisible();
    await expect(page.getByRole('list', { name: /Compteurs publics/i })).toBeVisible();
    await expectNoCriticalAxeViolations(page);
  });

  test('affiche l\'état vide du graphique quand 0 inscription', async ({ page }) => {
    await page.goto('/transparence');
    // Le mock supabase renvoie `[]` côté REST → buckets[].count tous à 0
    // → état vide « Aucune inscription enregistrée… »
    await expect(page.getByText(/Aucune inscription enregistrée/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test('est accessible depuis le footer (lien « Transparence »)', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    const link = footer.getByRole('link', { name: /Transparence/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/transparence$/);
  });
});

test.describe('Page /transparence — compteurs et graphique non-nuls', () => {
  // Buckets RPC users_signups_monthly : 12 mois UTC croissants, certains
  // avec count > 0 pour vérifier que le SVG s'affiche bien. Le bucketing
  // est désormais fait côté DB (étape 23, dette H1-rob clôturée), donc
  // on stube directement la réponse de la RPC plutôt que des rows brutes
  // de `users`.
  const monthlySignupsRows = [
    { month_iso: '2025-06-01', count: 0 },
    { month_iso: '2025-07-01', count: 0 },
    { month_iso: '2025-08-01', count: 0 },
    { month_iso: '2025-09-01', count: 0 },
    { month_iso: '2025-10-01', count: 0 },
    { month_iso: '2025-11-01', count: 1 },
    { month_iso: '2025-12-01', count: 0 },
    { month_iso: '2026-01-01', count: 0 },
    { month_iso: '2026-02-01', count: 0 },
    { month_iso: '2026-03-01', count: 1 },
    { month_iso: '2026-04-01', count: 0 },
    { month_iso: '2026-05-01', count: 3 },
  ];

  test.beforeEach(async ({ page }) => {
    await installSupabaseStubs(page, {
      rest: {
        users: { count: 42 },
        petitions: { count: 7 },
        mobilizations: { count: 3 },
        campaigns: { count: 2 },
        communes: { count: 5 },
        signatures: { count: 128 },
      },
      rpc: {
        users_signups_monthly: { rows: monthlySignupsRows },
      },
    });
  });

  test('affiche les compteurs publics avec des valeurs non-nulles', async ({ page }) => {
    await page.goto('/transparence');
    const list = page.getByRole('list', { name: /Compteurs publics/i });
    await expect(list).toBeVisible({ timeout: 10_000 });
    // Format français : séparateur d'espace insécable entre milliers
    // (1 234 → « 1 234 ») — Intl.NumberFormat('fr-FR'). Les nombres < 1000
    // restent inchangés. On vérifie quelques cards par leur label visible.
    await expect(list.getByText('42', { exact: true })).toBeVisible();
    await expect(list.getByText('Comptes créés', { exact: true })).toBeVisible();
    await expect(list.getByText('7', { exact: true })).toBeVisible();
    await expect(list.getByText('Pétitions publiées', { exact: true })).toBeVisible();
    await expect(list.getByText('128', { exact: true })).toBeVisible();
    await expect(list.getByText('Signatures cumulées', { exact: true })).toBeVisible();
    await expectNoCriticalAxeViolations(page);
  });

  test('rend le graphique SVG quand au moins un mois a des inscriptions', async ({
    page,
  }) => {
    await page.goto('/transparence');
    const chart = page.getByRole('img', {
      name: /Inscriptions par mois sur les 12 derniers mois/i,
    });
    await expect(chart).toBeVisible({ timeout: 10_000 });
    // Le SVG contient exactement 12 buckets (12 barres) — règle stable
    // côté MonthlySignupsChart, indépendante du contenu.
    await expect(chart.locator('rect')).toHaveCount(12);
    // Le message « Aucune inscription enregistrée » doit avoir disparu
    // (au moins un bucket > 0 → rendu SVG, pas l'état vide).
    await expect(page.getByText(/Aucune inscription enregistrée/i)).toHaveCount(0);
  });
});

// Étape 30 : carte T99CP cumulée. La RPC `transparency_t99cp_total`
// retourne un scalaire bigint sérialisé en JSON. Le mock supabase
// renvoie la valeur brute via `rpc.<fn>.rows` — supabase-js JSON-parse
// le body et postgrest-js retourne `data` tel quel. On valide que la
// carte s'affiche avec la valeur formatée fr-FR (séparateur insécable
// au-dessus de 999).
test.describe('Page /transparence — carte T99CP cumulée (étape 30)', () => {
  test('affiche la carte T99CP avec la valeur retournée par la RPC', async ({ page }) => {
    await installSupabaseStubs(page, {
      rpc: {
        // PostgREST renvoie un scalaire en JSON (number ou string pour
        // bigint). On envoie un number ici — `fetchT99cpTotal` accepte
        // les deux formes.
        transparency_t99cp_total: { rows: [3600] as unknown[] },
      },
    });
    // `installSupabaseStubs` fulfill avec `JSON.stringify(rows)` →
    // body = `[3600]`. supabase-js sur un `rpc()` scalaire attend un
    // body brut (le scalaire seul, pas un tableau). On gère ça via
    // une route plus spécifique qui prend le pas sur celle posée par
    // `installSupabaseStubs`.
    await page.route('**/rest/v1/rpc/transparency_t99cp_total*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '3600',
      });
    });
    await page.goto('/transparence');
    const card = page.getByTestId('t99cp-total-card');
    await expect(card).toBeVisible({ timeout: 10_000 });
    await expect(card).toContainText(/T99CP émis \(cumulé\)/);
    // Match large : Intl.NumberFormat fr-FR utilise un narrow no-break
    // space (U+202F) au-dessus de 999. On tolère espace ou caractère
    // unicode quelconque entre les digits.
    await expect(card.getByText(/^3\s?600$/)).toBeVisible();
    await expectNoCriticalAxeViolations(page);
  });

  test('masque la carte T99CP en cas d\'erreur RPC (RPC manquante)', async ({ page }) => {
    await installSupabaseStubs(page);
    // Override : la RPC renvoie une erreur PostgREST « function not
    // found » — comme ce serait le cas en staging tant que la migration
    // étape 30 n'est pas appliquée. La carte doit être silencieusement
    // masquée sans casser l'affichage des autres compteurs.
    await page.route('**/rest/v1/rpc/transparency_t99cp_total*', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'PGRST202',
          message: 'function not found',
        }),
      });
    });
    await page.goto('/transparence');
    // On attend que la liste des compteurs soit rendue (cycle de fetch
    // terminé), puis on vérifie que la carte T99CP n'est PAS dans le DOM.
    await expect(
      page.getByRole('list', { name: /Compteurs publics/i }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('t99cp-total-card')).toHaveCount(0);
    await expect(page.getByText('T99CP émis (cumulé)')).toHaveCount(0);
  });
});

// Étape 33 — 10e itération du pattern « +1 test mock E2E ciblé » (suggérée
// explicitement par le prompt étape 33 §2 : « un état transparence non
// encore couvert »). Couvre les deux branches d'erreur du composant
// `TransparencePage.tsx` jusqu'ici testées uniquement en unit
// (cf. `TransparencePage.test.tsx`) :
// - `chartState.kind === 'error'` (TransparencePage.tsx:240-244) — la RPC
//   `users_signups_monthly` échoue (RLS, rate limit, RPC manquante en
//   staging tant que la migration étape 23 n'est pas appliquée).
// - `state.kind === 'error'` (TransparencePage.tsx:206-210) —
//   `fetchTransparencyCounts` voit un `error` sur l'un des 6 counts
//   parallèles (`countTable` users / petitions / mobilizations /
//   campaigns / communes / signatures).
//
// Aucun call-site `installAuthenticatedSession` ici : la page
// /transparence est publique (anonymous), aucune session à seeder.
test.describe('Page /transparence — états d\'erreur (étape 33)', () => {
  test('affiche l\'état d\'erreur du graphique quand la RPC users_signups_monthly échoue', async ({
    page,
  }) => {
    // Stub global anonyme + override ciblé : la RPC users_signups_monthly
    // renvoie 500 (« permission denied » côté DB simulé). Le useEffect
    // dédié au chartState (TransparencePage.tsx:149-167) bascule sur
    // `kind: 'error'`, qui rend un <div role="alert"> avec « Graphique
    // indisponible pour le moment. ». Les autres états (compteurs,
    // T99CP) restent indépendants du chartState — couverts par les
    // autres specs.
    await installSupabaseStubs(page);
    await page.route(
      '**/rest/v1/rpc/users_signups_monthly*',
      async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            code: '42501',
            message: 'permission denied for relation users',
          }),
        });
      },
    );
    await page.goto('/transparence');
    // Le message d'erreur du graphique doit apparaître.
    await expect(
      page.getByText(/Graphique indisponible pour le moment/i),
    ).toBeVisible({ timeout: 10_000 });
    // Le SVG (`role="img"` avec name « Inscriptions par mois… ») NE doit
    // PAS être rendu (état error ≠ état success).
    await expect(
      page.getByRole('img', { name: /Inscriptions par mois/i }),
    ).toHaveCount(0);
    // L'état vide « Aucune inscription enregistrée… » NE doit pas non
    // plus apparaître — c'est l'état success avec buckets[].count tous
    // à 0, distinct de l'état error.
    await expect(
      page.getByText(/Aucune inscription enregistrée/i),
    ).toHaveCount(0);
    await expectNoCriticalAxeViolations(page);
  });

  test('affiche l\'état d\'erreur des compteurs quand un count REST échoue', async ({
    page,
  }) => {
    // Stub global anonyme + override ciblé sur `/rest/v1/users` qui
    // renvoie 500. `fetchTransparencyCounts` lance les 6 counts en
    // parallèle (Promise.all), trouve `firstError` non null, retourne
    // `{ data: null, error }`. Le useEffect bascule sur `state.kind:
    // 'error'`, qui rend `<div role="alert">` avec « Impossible de
    // charger les compteurs (…). Réessayez plus tard. ».
    //
    // Le chart fait une RPC séparée (`users_signups_monthly`) qui passe
    // par le stub par défaut → buckets[].count = 0 → état vide rendu en
    // parallèle. C'est le comportement attendu : les états des 3 cards
    // (compteurs, chart, T99CP) sont indépendants côté UI.
    await installSupabaseStubs(page);
    await page.route('**/rest/v1/users**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          code: '42501',
          message: 'permission denied for relation users',
        }),
      });
    });
    await page.goto('/transparence');
    // Le message d'erreur des compteurs doit apparaître.
    await expect(
      page.getByText(/Impossible de charger les compteurs/i),
    ).toBeVisible({ timeout: 10_000 });
    // La liste « Compteurs publics » NE doit PAS être rendue (branche
    // `state.kind === 'success'` mutuellement exclusive de la branche
    // `error`).
    await expect(
      page.getByRole('list', { name: /Compteurs publics/i }),
    ).toHaveCount(0);
    // La carte T99CP n'apparaît pas non plus (elle vit DANS la liste
    // des compteurs, conditionnée à `state.kind === 'success'`).
    await expect(page.getByTestId('t99cp-total-card')).toHaveCount(0);
  });
});
