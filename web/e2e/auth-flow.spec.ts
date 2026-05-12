import { test, expect } from '@playwright/test';

import { installSupabaseStubs } from './utils/mockSupabase';

test.describe('Modale d\'authentification', () => {
  test.beforeEach(async ({ page }) => {
    await installSupabaseStubs(page);
  });

  test('ouvre la modale via le bouton "Se connecter"', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Se connecter/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByLabel(/E-?mail|Adresse mail/i)).toBeVisible();
  });

  test('ouvre la modale via le query param ?auth=login', async ({ page }) => {
    await page.goto('/?auth=login');
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('peut basculer entre connexion et inscription', async ({ page }) => {
    await page.goto('/?auth=login');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const signupLink = dialog.getByRole('button', { name: /Créer un compte|S'inscrire|inscription/i });
    if ((await signupLink.count()) > 0) {
      await signupLink.first().click();
      await expect(dialog.getByLabel(/Nom|Pseudo|Display name/i).first()).toBeVisible({
        timeout: 5_000,
      });
    }
  });

  test('redirige vers /?auth=login depuis une page protégée', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForURL(/\?auth=login/i, { timeout: 10_000 });
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
