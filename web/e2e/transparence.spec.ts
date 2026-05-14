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
    // Pré-seed du consentement cookies pour cacher la bannière (position:
    // fixed; bottom:0; z-index:900) qui chevaucherait sinon la colonne
    // « Légal » du footer 3-colonnes (étape 34) et intercepterait le clic
    // sur le lien Transparence. Simule un utilisateur revenant sur le site
    // après avoir déjà choisi « essentiel uniquement ».
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'mn:cookie-consent',
        JSON.stringify({
          version: 1,
          choice: 'essential',
          categories: { analytics: false },
          at: new Date().toISOString(),
        }),
      );
    });
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
