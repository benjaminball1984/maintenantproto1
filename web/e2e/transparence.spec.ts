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
  // Trois inscriptions de mai 2026 (mois courant, étape 19 GO_LIVE_DATE_ISO),
  // une de mars 2026, une de novembre 2025. Le bucketing UTC est confirmé
  // par le test unitaire transparency.test.ts ; ici on vérifie le rendu UI.
  const usersRows = [
    { created_at: '2026-05-12T10:00:00Z' },
    { created_at: '2026-05-08T15:30:00Z' },
    { created_at: '2026-05-01T09:00:00Z' },
    { created_at: '2026-03-15T12:00:00Z' },
    { created_at: '2025-11-04T18:45:00Z' },
  ];

  test.beforeEach(async ({ page }) => {
    await installSupabaseStubs(page, {
      rest: {
        users: { count: 42, rows: usersRows },
        petitions: { count: 7 },
        mobilizations: { count: 3 },
        campaigns: { count: 2 },
        communes: { count: 5 },
        signatures: { count: 128 },
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
