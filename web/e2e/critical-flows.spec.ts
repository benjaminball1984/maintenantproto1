import { test, expect } from '@playwright/test';

import { expectNoCriticalAxeViolations } from './utils/axe';
import { installSupabaseStubs } from './utils/mockSupabase';

test.describe('Flows critiques — smoke a11y sur les pages d\'écriture protégées', () => {
  test.beforeEach(async ({ page }) => {
    await installSupabaseStubs(page);
  });

  test('La page Rejoindre (adhésion Stripe) charge sans violations a11y', async ({ page }) => {
    await page.goto('/join');
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10_000 });
    await expectNoCriticalAxeViolations(page);
  });

  test('Les routes de création protégées redirigent vers /?auth=login', async ({ page }) => {
    for (const path of ['/petitions/new', '/mobilizations/new', '/polls/new']) {
      await page.goto(path);
      await page.waitForURL(/\?auth=login/i, { timeout: 10_000 });
    }
  });

  test('La route admin est protégée (redirige vers /?auth=login)', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForURL(/\?auth=login/i, { timeout: 10_000 });
  });
});
