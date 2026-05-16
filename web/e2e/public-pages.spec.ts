import { test, expect } from '@playwright/test';

import { expectNoCriticalAxeViolations } from './utils/axe';
import { installSupabaseStubs } from './utils/mockSupabase';

// La page `/transparence` n'est intentionnellement PAS dans cette liste —
// elle est couverte par son spec dédié `transparence.spec.ts` qui ajoute
// des assertions spécifiques (graphique, lien footer, état vide).
const PUBLIC_ROUTES: { path: string; heading: RegExp }[] = [
  // D-016 : `/decouvrir` supprimée intégralement (revue Phase 1).
  { path: '/', heading: /Maintenant !/i },
  { path: '/faq', heading: /Questions fréquentes/i },
  { path: '/about', heading: /À propos de Maintenant/i },
  { path: '/roadmap', heading: /Là où on va/i },
  { path: '/petitions', heading: /Pétitions/i },
  { path: '/mobilizations', heading: /Mobilisations/i },
  { path: '/campaigns', heading: /Campagnes/i },
  { path: '/services', heading: /Services/i },
  { path: '/media', heading: /Média/i },
  { path: '/communes', heading: /Communes/i },
  { path: '/polls', heading: /Sondages/i },
  { path: '/legal/privacy', heading: /Confidentialité|RGPD|données/i },
  { path: '/legal/notice', heading: /Mentions/i },
  { path: '/legal/cookies', heading: /Cookies/i },
  { path: '/legal/contact', heading: /Contact/i },
];

test.describe('Pages publiques — smoke + a11y', () => {
  test.beforeEach(async ({ page }) => {
    await installSupabaseStubs(page);
  });

  for (const { path, heading } of PUBLIC_ROUTES) {
    test(`charge ${path} et n'a pas de violation a11y bloquante`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible({
        timeout: 10_000,
      });
      await expectNoCriticalAxeViolations(page);
    });
  }

  test('le footer expose les liens RGPD', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByRole('link', { name: /Confidentialité|RGPD/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /Mentions/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /Cookies/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /Contact/i })).toBeVisible();
  });

  test('la nav principale offre les liens clés', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: /Navigation principale/i });
    await expect(nav).toBeVisible();
    for (const label of ['Accueil', 'Pétitions', 'Mobilisations', 'Communes', 'Rejoindre']) {
      await expect(nav.getByRole('link', { name: label })).toBeVisible();
    }
  });
});
