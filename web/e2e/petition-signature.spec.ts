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

  test('affiche « Signée — retirer ma signature » pour un signataire authentifié', async ({
    page,
  }) => {
    // Étape 26 — 3e itération du pattern « +1 test mock E2E » : couvre
    // l'état `authStatus === 'authenticated' && signed === true` de
    // PetitionDetailPage, jusqu'ici testé uniquement en unit (vitest).
    // Le bouton doit afficher « Signée — retirer ma signature » avec
    // `aria-pressed="true"` (toggle accessibilité), et le CTA anonyme
    // « Se connecter pour signer » NE doit PAS être rendu en parallèle.
    //
    // Seed de la session authentifiée :
    // supabase-js v2 dérive `storageKey = sb-${hostname.split('.')[0]}-auth-token`
    // de `VITE_SUPABASE_URL`. En CI/E2E l'URL est `http://127.0.0.1:54321`
    // (cf. `.github/workflows/ci.yml`), donc la clé localStorage est
    // `sb-127-auth-token`. On pré-remplit la session via `addInitScript`
    // AVANT le `goto` : au boot, `useAuth` appelle `getSession()` qui
    // lit la session depuis localStorage → `setSession(...)` → `status`
    // passe directement à `'authenticated'` sans hit réseau /auth/v1/token.
    //
    // Pas de signal d'expiration : `expires_at` est calé à ~24h dans
    // le futur, large marge vs la durée d'un run E2E (<30s).
    const stubUserId = 'stub-signed-user-id';
    const stubSession = {
      access_token: 'stub-access-token',
      token_type: 'bearer',
      expires_in: 86_400,
      expires_at: Math.floor(Date.now() / 1000) + 86_400,
      refresh_token: 'stub-refresh-token',
      user: {
        id: stubUserId,
        aud: 'authenticated',
        email: 'signataire@example.org',
        user_metadata: { display_name: 'Signataire Stub' },
        app_metadata: { provider: 'email' },
      },
    };
    await page.addInitScript((session) => {
      window.localStorage.setItem('sb-127-auth-token', JSON.stringify(session));
    }, stubSession);

    // Mock du hit `hasUserSigned(petition.id, user.id)` : renvoie une
    // ligne `signatures` non vide → `signed = true` côté usePetition.
    // Le client supabase-js sur `.maybeSingle()` accepte indifféremment
    // un body `[{...}]` ou `{...}` (singular row mode). On reste sur
    // un array pour cohérence avec les autres mocks REST de la suite.
    await page.route('**/rest/v1/signatures**', async (route: Route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'sig-stub-1',
            petition_id: petitionFixture.id,
            user_id: stubUserId,
            created_at: new Date().toISOString(),
          },
        ]),
      });
    });

    await page.goto(`/petitions/${petitionFixture.slug}`);
    const signedButton = page.getByRole('button', { name: /Signée — retirer ma signature/i });
    await expect(signedButton).toBeVisible({ timeout: 10_000 });
    // aria-pressed="true" reflète l'état toggle pour les screen readers.
    await expect(signedButton).toHaveAttribute('aria-pressed', 'true');
    // Le CTA anonyme « Se connecter pour signer » NE doit PAS être rendu
    // en parallèle (sinon l'UI est ambiguë : qui signe ?).
    await expect(
      page.getByRole('link', { name: /Se connecter pour signer/i }),
    ).toHaveCount(0);
  });

  test('affiche « Signer cette pétition » pour un signataire authentifié non encore signé', async ({
    page,
  }) => {
    // Étape 27 — 4e itération du pattern « +1 test mock E2E » : couvre
    // le complément symétrique de l'état testé étape 26. Ici
    // `authStatus === 'authenticated' && signed === false` — l'utilisateur
    // est connecté mais n'a pas encore signé cette pétition. Le bouton
    // doit afficher « Signer cette pétition » avec `aria-pressed="false"`
    // (état toggle initial), et le CTA anonyme « Se connecter pour
    // signer » NE doit PAS être rendu en parallèle.
    //
    // Seed de session identique à l'étape 26 (cf. commentaire 124-148) —
    // même formule storage key `sb-127-auth-token` côté CI/E2E, même
    // pattern `addInitScript`. Seul le `user_id` change (pour rester
    // distinct du test précédent et faciliter le debug en cas de fuite
    // cross-test improbable).
    const stubUserId = 'stub-unsigned-user-id';
    const stubSession = {
      access_token: 'stub-access-token',
      token_type: 'bearer',
      expires_in: 86_400,
      expires_at: Math.floor(Date.now() / 1000) + 86_400,
      refresh_token: 'stub-refresh-token',
      user: {
        id: stubUserId,
        aud: 'authenticated',
        email: 'curieux@example.org',
        user_metadata: { display_name: 'Curieux Stub' },
        app_metadata: { provider: 'email' },
      },
    };
    await page.addInitScript((session) => {
      window.localStorage.setItem('sb-127-auth-token', JSON.stringify(session));
    }, stubSession);

    // Mock du hit `hasUserSigned(petition.id, user.id)` : renvoie un body
    // vide → `Boolean(data) === false` → `signed = false` côté usePetition
    // (cf. `web/src/lib/petitions.ts:268`). `.maybeSingle()` accepte un
    // array vide comme « zero row » sans throw.
    await page.route('**/rest/v1/signatures**', async (route: Route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto(`/petitions/${petitionFixture.slug}`);
    const signButton = page.getByRole('button', { name: /Signer cette pétition/i });
    await expect(signButton).toBeVisible({ timeout: 10_000 });
    // aria-pressed="false" reflète l'état toggle initial (non signé).
    // React rend les booléens ARIA en string "true"/"false" dans le DOM
    // (contrairement aux attributs HTML booléens classiques type `disabled`).
    await expect(signButton).toHaveAttribute('aria-pressed', 'false');
    // Le CTA anonyme « Se connecter pour signer » NE doit PAS être rendu
    // en parallèle.
    await expect(
      page.getByRole('link', { name: /Se connecter pour signer/i }),
    ).toHaveCount(0);
  });

  test('signe la pétition: clic → POST intercepté → bascule vers « Signée — retirer ma signature »', async ({
    page,
  }) => {
    // Étape 28 — 5e itération du pattern « +1 test mock E2E » : exécute
    // le flow de signature actif suggéré explicitement par le prompt
    // étape 28 §2. États statiques déjà couverts (étapes 25/26/27) :
    // anonyme, authentifié signé, authentifié non signé. Ce test couvre
    // la transition `signed: false → true` côté UI via le clic réel sur
    // le bouton, l'interception du POST `signatures`, et le rafraîchissement
    // déclenché par `usePetition.refresh()` (cf. `web/src/hooks/usePetition.ts`).
    //
    // Seed de session : même pattern que les étapes 26/27 (clé localStorage
    // `sb-127-auth-token`, dérivée de `VITE_SUPABASE_URL=http://127.0.0.1:54321`
    // en CI). User id distinct pour faciliter le debug en cas de fuite
    // cross-test improbable.
    const stubUserId = 'stub-active-signer-id';
    const stubSession = {
      access_token: 'stub-access-token',
      token_type: 'bearer',
      expires_in: 86_400,
      expires_at: Math.floor(Date.now() / 1000) + 86_400,
      refresh_token: 'stub-refresh-token',
      user: {
        id: stubUserId,
        aud: 'authenticated',
        email: 'actif@example.org',
        user_metadata: { display_name: 'Actif Stub' },
        app_metadata: { provider: 'email' },
      },
    };
    await page.addInitScript((session) => {
      window.localStorage.setItem('sb-127-auth-token', JSON.stringify(session));
    }, stubSession);

    // Mock stateful pour `/rest/v1/signatures` :
    // - GET (hasUserSigned) : renvoie `[]` avant signature, `[{...}]` après.
    // - POST (signPetition `.insert(...).select('*').maybeSingle()`) :
    //   renvoie 201 + ligne insérée, bascule le flag interne `signed`.
    //
    // L'ordre est garanti par `handleSign` côté PetitionDetailPage :
    // `await signPetition(...)` → `await refresh()` → re-issue GET. Pas
    // de race observable côté Playwright qui sérialise les handlers de
    // route par requête.
    let signed = false;
    await page.route('**/rest/v1/signatures**', async (route: Route) => {
      const method = route.request().method();
      if (method === 'POST') {
        signed = true;
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'sig-stub-new',
              petition_id: petitionFixture.id,
              user_id: stubUserId,
              created_at: new Date().toISOString(),
            },
          ]),
        });
      }
      // GET (`hasUserSigned`) — body vide ou non selon l'état du flag.
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          signed
            ? [
                {
                  id: 'sig-stub-new',
                  petition_id: petitionFixture.id,
                  user_id: stubUserId,
                  created_at: new Date().toISOString(),
                },
              ]
            : [],
        ),
      });
    });

    await page.goto(`/petitions/${petitionFixture.slug}`);

    // État initial : « Signer cette pétition » visible, aria-pressed="false".
    const signButton = page.getByRole('button', { name: /^Signer cette pétition$/i });
    await expect(signButton).toBeVisible({ timeout: 10_000 });
    await expect(signButton).toHaveAttribute('aria-pressed', 'false');

    // Clic réel sur le bouton → handleSign() → signPetition() POST
    // intercepté → refresh() → re-GET sur `/signatures` qui renvoie
    // maintenant une ligne non vide → `signed = true` côté usePetition.
    await signButton.click();

    // État final : « Signée — retirer ma signature » visible,
    // aria-pressed="true". Le bouton initial ne doit plus être rendu
    // (le rendu conditionnel JSX bascule sur la branche `signed`).
    const signedButton = page.getByRole('button', { name: /Signée — retirer ma signature/i });
    await expect(signedButton).toBeVisible({ timeout: 10_000 });
    await expect(signedButton).toHaveAttribute('aria-pressed', 'true');
    await expect(
      page.getByRole('button', { name: /^Signer cette pétition$/i }),
    ).toHaveCount(0);
  });
});
