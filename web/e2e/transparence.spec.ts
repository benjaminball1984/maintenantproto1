import { test, expect } from '@playwright/test';

import { expectNoCriticalAxeViolations } from './utils/axe';
import { installSupabaseStubs } from './utils/mockSupabase';

// =====================================================================================
// E2E UI-only sur /transparence : Supabase est stubbé (cf. mockSupabase.ts) donc
// toutes les requêtes REST renvoient une collection vide / count = 0. On
// valide ici uniquement le routing + le rendu de la page (compteurs à zéro
// + état vide du graphique + lien footer fonctionnel + a11y axe-core).
// Le « happy path réel » (Supabase de test seedé, signature anonyme) reste
// listé dans le runbook PROD-RUNBOOK.md §6 — étape ultérieure quand un
// projet Supabase de test sera provisionné.
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
