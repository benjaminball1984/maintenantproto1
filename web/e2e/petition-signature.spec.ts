import { test, expect, type Route } from '@playwright/test';

import { installSupabaseStubs } from './utils/mockSupabase';

const petitionFixture = {
  id: 'pet-stub-1',
  slug: 'stop-pesticides',
  title: 'Stop aux pesticides',
  description: 'Une pétition pour interdire les pesticides nocifs.',
  body: 'Texte long de la pétition…',
  target_count: 1000,
  signature_count: 42,
  category: 'environnement',
  city: 'Paris',
  is_published: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  author_id: 'stub-author',
};

test.describe('Pétitions — flow consultation + signature stubée', () => {
  test.beforeEach(async ({ page }) => {
    await installSupabaseStubs(page);
    await page.route('**/rest/v1/petitions**', async (route: Route) => {
      const url = route.request().url();
      if (url.includes(`slug=eq.${petitionFixture.slug}`)) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([petitionFixture]),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([petitionFixture]),
      });
    });
    await page.route('**/rest/v1/petition_signatures**', async (route: Route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify([
            { petition_id: petitionFixture.id, user_id: 'stub-user', created_at: new Date().toISOString() },
          ]),
        });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
  });

  test('la liste des pétitions s\'affiche', async ({ page }) => {
    await page.goto('/petitions');
    await expect(page.getByRole('heading', { name: /Pétitions/i })).toBeVisible();
    await expect(page.getByText(/Stop aux pesticides/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('ouvre la fiche pétition par slug', async ({ page }) => {
    await page.goto(`/petitions/${petitionFixture.slug}`);
    await expect(page.getByRole('heading', { name: /Stop aux pesticides/i })).toBeVisible({
      timeout: 10_000,
    });
  });
});
