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

  test('affiche le compteur de signatures (signature_count / target_count)', async ({
    page,
  }) => {
    // Étape 23 — test mock supplémentaire : vérifie que la fiche pétition
    // rend bien la jauge signature_count / target_count formatée en français
    // (espace insécable étroit entre milliers). Lecture-only, pas d'écriture.
    await page.goto(`/petitions/${petitionFixture.slug}`);
    // signature_count = 42, target_count = 1000 → "42" puis "/ 1 000 signatures"
    // Le format fr-FR insère un narrow no-break space (U+202F) ; on matche
    // avec un \s flexible pour rester robuste aux variations ICU.
    await expect(page.getByText(/^42$/)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/\/\s*1\s?000\s*signatures/)).toBeVisible();
  });

  test('affiche le pourcentage de progression vers l\'objectif', async ({ page }) => {
    // Étape 25 — test mock supplémentaire : vérifie le rendu du ratio
    // arrondi côté UI. signature_count = 42 / target_count = 1000 →
    // ratio = round(42 / 1000 * 100) = 4 → "4% de l'objectif".
    // L'apostrophe est rendue en HTML entity (&apos;) côté JSX, qui sort
    // l'apostrophe typographique U+2019 dans le DOM. On matche large pour
    // rester robuste aux variations.
    await page.goto(`/petitions/${petitionFixture.slug}`);
    await expect(page.getByText(/4\s*%\s*de\s+l['’]objectif/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test('expose le CTA « Se connecter pour signer » pour un visiteur anonyme', async ({
    page,
  }) => {
    // Étape 25 — test mock supplémentaire : couvre la branche
    // `isAnonymous === true` de PetitionDetailPage. Le visiteur anonyme
    // ne doit PAS voir le bouton « Signer cette pétition » (réservé
    // aux comptes authentifiés via aria-pressed). À la place : un lien
    // qui pointe vers `/?auth=login&next=<pathname>` pour ouvrir la
    // modale d'authentification avec retour sur la fiche après login.
    //
    // installSupabaseStubs renvoie un body vide sur `/auth/v1/**` →
    // la session reste null → useAuth().status passe à 'anonymous' une
    // fois le `getSession()` résolu. C'est exactement l'état couvert ici.
    await page.goto(`/petitions/${petitionFixture.slug}`);
    const signupCta = page.getByRole('link', { name: /Se connecter pour signer/i });
    await expect(signupCta).toBeVisible({ timeout: 10_000 });
    // Le href doit ouvrir la modale d'authentification (`auth=login`) et
    // mémoriser la fiche pétition pour y revenir après login (`next=<pathname>`).
    // On parse via URL + URLSearchParams plutôt qu'un regex ordonné, pour
    // rester robuste aux refactos qui changeraient l'ordre des paramètres
    // ou en ajouteraient (J25-A3 / R2).
    const href = await signupCta.getAttribute('href');
    expect(href).not.toBeNull();
    const parsed = new URL(href ?? '', 'http://localhost');
    expect(parsed.searchParams.get('auth')).toBe('login');
    expect(parsed.searchParams.get('next')).toBe(`/petitions/${petitionFixture.slug}`);
    // Le bouton « Signer cette pétition » ne doit PAS être rendu en
    // parallèle (sinon le CTA anonyme serait dupliqué côté UI).
    await expect(
      page.getByRole('button', { name: /Signer cette pétition/i }),
    ).toHaveCount(0);
  });
});
