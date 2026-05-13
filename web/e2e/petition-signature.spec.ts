import { test, expect, type Route } from '@playwright/test';

import { installAuthenticatedSession, installSupabaseStubs } from './utils/mockSupabase';

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
    // Seed de la session authentifiée via `installAuthenticatedSession`
    // (cf. `e2e/utils/mockSupabase.ts`) : pose `sb-127-auth-token` dans
    // localStorage avant le `goto` pour que `useAuth().status` passe
    // directement à `'authenticated'` au boot.
    const stubUserId = 'stub-signed-user-id';
    await installAuthenticatedSession(page, {
      userId: stubUserId,
      email: 'signataire@example.org',
      displayName: 'Signataire Stub',
    });

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
    // Seed de session via `installAuthenticatedSession` — seul le
    // `user_id` change vs l'étape 26 pour rester distinct du test
    // précédent et faciliter le debug en cas de fuite cross-test
    // improbable.
    const stubUserId = 'stub-unsigned-user-id';
    await installAuthenticatedSession(page, {
      userId: stubUserId,
      email: 'curieux@example.org',
      displayName: 'Curieux Stub',
    });

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
    // Seed de session via `installAuthenticatedSession` — user id
    // distinct pour faciliter le debug en cas de fuite cross-test
    // improbable.
    const stubUserId = 'stub-active-signer-id';
    await installAuthenticatedSession(page, {
      userId: stubUserId,
      email: 'actif@example.org',
      displayName: 'Actif Stub',
    });

    // Mock stateful pour `/rest/v1/signatures` :
    // - GET (hasUserSigned) : renvoie `[]` avant signature, `[{...}]` après.
    // - POST (signPetition `.insert(...).select('*').maybeSingle()`) :
    //   renvoie 201 + ligne insérée, bascule le flag interne
    //   `hasSignedRow`.
    //
    // **Séquencement applicatif, pas Playwright** : la non-race entre
    // POST et GET subséquent vient de `handleSign` côté
    // `PetitionDetailPage.tsx:214-237` qui chaîne `await signPetition(...)`
    // PUIS `await refresh()` (lui-même fait `getPetition()` puis
    // `hasUserSigned()`). Playwright sérialise les handlers de route par
    // requête mais ne sérialise PAS plusieurs requêtes concurrentes ;
    // c'est le `await` côté UI qui garantit que le GET arrive APRÈS le
    // flip du flag. Sans ce séquencement, un GET en vol avant le POST
    // pourrait lire `hasSignedRow=false`.
    const newSignatureRow = {
      id: 'sig-stub-new',
      petition_id: petitionFixture.id,
      user_id: stubUserId,
      created_at: new Date().toISOString(),
    };
    let hasSignedRow = false;
    await page.route('**/rest/v1/signatures**', async (route: Route) => {
      const method = route.request().method();
      if (method === 'POST') {
        hasSignedRow = true;
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify([newSignatureRow]),
        });
      }
      // GET (`hasUserSigned`) — body vide ou non selon l'état du flag.
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(hasSignedRow ? [newSignatureRow] : []),
      });
    });

    await page.goto(`/petitions/${petitionFixture.slug}`);

    // État initial : « Signer cette pétition » visible, aria-pressed="false".
    // Regex non ancré (cohérence avec étape 27) — le filtre `role: 'button'`
    // exclut déjà la string « Connectez-vous pour signer cette pétition »
    // qui vit dans un `<div role="note">` (PetitionDetailPage.tsx:281).
    const signButton = page.getByRole('button', { name: /Signer cette pétition/i });
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
      page.getByRole('button', { name: /Signer cette pétition/i }),
    ).toHaveCount(0);
  });

  test('retire la signature: clic → DELETE intercepté → bascule retour vers « Signer cette pétition »', async ({
    page,
  }) => {
    // Étape 29 — 6e itération du pattern « +1 test mock E2E » : flow
    // unsign reverse-flow suggéré explicitement par le prompt étape 29
    // §2 (premier exemple : « flow unsign reverse-flow (clic sur Signée —
    // retirer ma signature → DELETE intercepté → bascule retour vers
    // Signer cette pétition) »). Symétrique du test étape 28 : la matrice
    // du `handleSign` côté `PetitionDetailPage.tsx:214-237` est désormais
    // entièrement couverte en E2E (sign branch ET unsign branch).
    //
    // Seed de session via `installAuthenticatedSession` — user id
    // distinct (`stub-active-unsigner-id`) pour faciliter le debug en
    // cas de fuite cross-test improbable.
    const stubUserId = 'stub-active-unsigner-id';
    await installAuthenticatedSession(page, {
      userId: stubUserId,
      email: 'actif-unsigner@example.org',
      displayName: 'Actif Unsigner Stub',
    });

    // Mock stateful pour `/rest/v1/signatures` (symétrique étape 28) :
    // - GET (hasUserSigned) : renvoie `[{...}]` tant que `hasSignedRow`
    //   est `true`, `[]` après DELETE.
    // - DELETE (unsignPetition `.delete().eq(...).eq(...)`) : renvoie
    //   204 No Content (comportement PostgREST par défaut sans `.select()`,
    //   cf. `web/src/lib/petitions.ts:251-258` qui ne chaîne pas `.select()`)
    //   et bascule le flag interne `hasSignedRow = false`.
    //
    // **Séquencement applicatif, pas Playwright** : la non-race entre
    // DELETE et GET subséquent vient de `handleSign` côté
    // `PetitionDetailPage.tsx:221-227` qui chaîne `await unsignPetition(...)`
    // PUIS `await refresh()` (lui-même fait `getPetition()` puis
    // `hasUserSigned()`). Playwright sérialise les handlers de route par
    // requête mais ne sérialise PAS plusieurs requêtes concurrentes ;
    // c'est le `await` côté UI qui garantit que le GET arrive APRÈS le
    // flip du flag.
    const existingSignatureRow = {
      id: 'sig-stub-existing',
      petition_id: petitionFixture.id,
      user_id: stubUserId,
      created_at: new Date().toISOString(),
    };
    let hasSignedRow = true;
    await page.route('**/rest/v1/signatures**', async (route: Route) => {
      const method = route.request().method();
      if (method === 'DELETE') {
        hasSignedRow = false;
        // PostgREST renvoie 204 No Content sur DELETE sans .select() ; le
        // helper `unsignPetition` ne lit que `error`, jamais `data`.
        return route.fulfill({
          status: 204,
          contentType: 'application/json',
          body: '',
        });
      }
      // GET (`hasUserSigned`) — body non vide tant que `hasSignedRow` est
      // `true`, vide après le DELETE.
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(hasSignedRow ? [existingSignatureRow] : []),
      });
    });

    await page.goto(`/petitions/${petitionFixture.slug}`);

    // État initial : « Signée — retirer ma signature » visible,
    // aria-pressed="true" (l'utilisateur a déjà signé au boot).
    const signedButton = page.getByRole('button', { name: /Signée — retirer ma signature/i });
    await expect(signedButton).toBeVisible({ timeout: 10_000 });
    await expect(signedButton).toHaveAttribute('aria-pressed', 'true');

    // Clic réel sur le bouton → handleSign() (branche `signed === true`)
    // → unsignPetition() DELETE intercepté → refresh() → re-GET sur
    // `/signatures` qui renvoie maintenant un body vide → `signed = false`
    // côté usePetition.
    await signedButton.click();

    // État final : « Signer cette pétition » visible, aria-pressed="false".
    // Le bouton signé initial ne doit plus être rendu (le rendu conditionnel
    // JSX bascule sur la branche `signed === false`).
    const signButton = page.getByRole('button', { name: /Signer cette pétition/i });
    await expect(signButton).toBeVisible({ timeout: 10_000 });
    await expect(signButton).toHaveAttribute('aria-pressed', 'false');
    await expect(
      page.getByRole('button', { name: /Signée — retirer ma signature/i }),
    ).toHaveCount(0);
  });
});
