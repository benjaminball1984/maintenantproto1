import { test, expect, type Route } from '@playwright/test';

import { installAuthenticatedSession, installSupabaseStubs } from './utils/mockSupabase';

// Étape 32 — 9e itération du pattern « +1 test mock E2E ciblé » (suggérée
// explicitement par le prompt étape 32 §2 : « mobilization-detail attend/leave,
// symétrique poll vote/unvote, exerce `useMobilization` + `rsvpMobilization
// /cancelRsvp` »). 7e et 8e call-sites de `installAuthenticatedSession`
// (helper extrait étape 31).
//
// Couvre la fiche `/mobilizations/:slug` (`MobilizationDetailPage.tsx:243-264
// handleRsvp`) :
// - `useMobilization(slug, userId)` enchaîne `getMobilization` (GET
//   `/rest/v1/mobilizations?slug=eq.<slug>`) puis `hasUserRsvp` (GET
//   `/rest/v1/participations?mobilization_id=eq.<id>&user_id=eq.<userId>`).
// - Clic « Je participe » → `rsvpMobilization` (POST `/rest/v1/participations`).
// - Clic « Inscrit·e — me désinscrire » → `cancelRsvp` (DELETE).
// - Après chaque action, la page appelle `refresh()` qui rejoue les deux
//   GET — c'est sur ce 2e GET que la bascule du CTA s'observe côté UI.
//
// **Date `starts_at`** dans le futur (2030) pour éviter la branche
// `isPast && !rsvp` qui rend le CTA disabled (cf. MobilizationDetailPage.tsx:354).
const mobilizationFixture = {
  id: 'mob-stub-1',
  organizer_id: 'stub-organizer',
  slug: 'marche-climat-2030',
  title: 'Marche pour le climat',
  summary: 'Mobilisation pacifique inter-collectifs pour le climat.',
  body: 'Programme détaillé de la marche.',
  starts_at: '2030-06-01T14:00:00Z',
  ends_at: null,
  city: 'Paris',
  address: 'Place de la République',
  cover_url: null,
  status: 'published' as const,
  participation_count: 42,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

test.describe('Mobilisations — flow RSVP / cancel stubé', () => {
  test.beforeEach(async ({ page }) => {
    await installSupabaseStubs(page);
    // Fiche mobilisation (`/rest/v1/mobilizations?slug=eq.<slug>`) renvoyée
    // identique à chaque hit (initial + refresh après action). Playwright
    // n'a pas besoin d'incrémenter `participation_count` côté serveur pour
    // ce test : ce qu'on vérifie c'est la bascule du CTA `Je participe` ↔
    // `Inscrit·e — me désinscrire`, pilotée par `rsvp` (alimenté par le
    // mock stateful de `participations`).
    await page.route('**/rest/v1/mobilizations**', async (route: Route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mobilizationFixture]),
      });
    });
  });

  test('rsvp: clic « Je participe » → POST intercepté → bascule vers « Inscrit·e — me désinscrire »', async ({
    page,
  }) => {
    // Couvre la transition `rsvp: false → true` côté UI : clic CTA →
    // `handleRsvp()` branche `!rsvp` → `rsvpMobilization()` POST intercepté
    // → `refresh()` → re-GET `/participations` qui renvoie maintenant un
    // row → `hasUserRsvp` répond `rsvp: true` → CTA bascule sur « Inscrit·e
    // — me désinscrire » avec `aria-pressed="true"`.
    const stubUserId = 'stub-active-participant-id';
    await installAuthenticatedSession(page, {
      userId: stubUserId,
      email: 'participant@example.org',
      displayName: 'Participant Stub',
    });

    // Mock stateful pour `/rest/v1/participations` :
    // - GET (`hasUserRsvp`) : renvoie `[]` avant POST, `[{ id }]` après.
    // - POST (`rsvpMobilization .insert(...).select('*').maybeSingle()`) :
    //   renvoie 201 + ligne insérée, bascule le flag interne `hasRsvp`.
    //
    // **Séquencement applicatif** : `handleRsvp` côté
    // MobilizationDetailPage.tsx:256 chaîne `await rsvpMobilization(...)`
    // PUIS `await refresh()` (qui rejoue lui-même `await
    // getMobilization` puis `await hasUserRsvp`). Le GET de refresh est
    // donc garanti d'arriver APRÈS le flip du flag.
    const newParticipationRow = {
      id: 'participation-stub-new',
      mobilization_id: mobilizationFixture.id,
      user_id: stubUserId,
      created_at: new Date().toISOString(),
    };
    let hasRsvp = false;
    await page.route('**/rest/v1/participations**', async (route: Route) => {
      const method = route.request().method();
      if (method === 'POST') {
        hasRsvp = true;
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify([newParticipationRow]),
        });
      }
      // GET (`hasUserRsvp .select('id').maybeSingle()`) — body vide tant
      // que `hasRsvp` est `false`, sinon un row contenant `id`.
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(hasRsvp ? [{ id: newParticipationRow.id }] : []),
      });
    });

    await page.goto(`/mobilizations/${mobilizationFixture.slug}`);

    // État initial : authentifié, pas encore inscrit → CTA « Je participe »
    // visible avec aria-pressed="false" (cf. MobilizationDetailPage.tsx:355
    // `aria-pressed={rsvp}` quand `rsvp = false`).
    const joinButton = page.getByRole('button', { name: /Je participe/i });
    await expect(joinButton).toBeVisible({ timeout: 10_000 });
    await expect(joinButton).toHaveAttribute('aria-pressed', 'false');

    // Clic réel sur « Je participe » → handleRsvp() branche `!rsvp` →
    // rsvpMobilization() POST intercepté → refresh() → re-GET
    // `/participations` renvoie un row non vide → `rsvp = true` côté
    // useMobilization.
    await joinButton.click();

    // État final : « Inscrit·e — me désinscrire » visible,
    // aria-pressed="true" (cf. MobilizationDetailPage.tsx:355
    // `aria-pressed={rsvp}` quand `rsvp = true`).
    const signedButton = page.getByRole('button', {
      name: /Inscrit·e — me désinscrire/i,
    });
    await expect(signedButton).toBeVisible({ timeout: 10_000 });
    await expect(signedButton).toHaveAttribute('aria-pressed', 'true');
    // Le CTA initial « Je participe » ne doit plus être rendu (le rendu
    // conditionnel JSX bascule sur la branche `rsvp`).
    await expect(page.getByRole('button', { name: /Je participe/i })).toHaveCount(0);
  });

  test('cancel: clic « Inscrit·e — me désinscrire » → DELETE intercepté → bascule retour vers « Je participe »', async ({
    page,
  }) => {
    // Flow symétrique du test précédent. Couvre la branche `rsvp === true`
    // de `handleRsvp` (MobilizationDetailPage.tsx:248-254) : clic sur
    // « Inscrit·e — me désinscrire » → cancelRsvp() DELETE intercepté →
    // refresh() → re-GET `/participations` renvoie un body vide → `rsvp =
    // false` → CTA bascule retour sur « Je participe ».
    const stubUserId = 'stub-active-canceler-id';
    await installAuthenticatedSession(page, {
      userId: stubUserId,
      email: 'canceler@example.org',
      displayName: 'Canceler Stub',
    });

    // Mock stateful pour `/rest/v1/participations` (symétrique du test
    // rsvp) :
    // - GET (`hasUserRsvp`) : renvoie `[{ id }]` tant que `hasRsvp` est
    //   `true`, `[]` après DELETE.
    // - DELETE (`cancelRsvp .delete().eq(...).eq(...)`) : renvoie 204 No
    //   Content (comportement PostgREST par défaut sans `.select()`, cf.
    //   mobilizations.ts:271 qui ne chaîne pas `.select()`) et bascule
    //   `hasRsvp = false`.
    const existingParticipationRow = {
      id: 'participation-stub-existing',
      mobilization_id: mobilizationFixture.id,
      user_id: stubUserId,
      created_at: new Date().toISOString(),
    };
    let hasRsvp = true;
    await page.route('**/rest/v1/participations**', async (route: Route) => {
      const method = route.request().method();
      if (method === 'DELETE') {
        hasRsvp = false;
        return route.fulfill({
          status: 204,
          contentType: 'application/json',
          body: '',
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(hasRsvp ? [{ id: existingParticipationRow.id }] : []),
      });
    });

    await page.goto(`/mobilizations/${mobilizationFixture.slug}`);

    // État initial : authentifié, a déjà participé → CTA « Inscrit·e —
    // me désinscrire » avec aria-pressed="true".
    const signedButton = page.getByRole('button', {
      name: /Inscrit·e — me désinscrire/i,
    });
    await expect(signedButton).toBeVisible({ timeout: 10_000 });
    await expect(signedButton).toHaveAttribute('aria-pressed', 'true');

    // Clic réel → handleRsvp() branche `rsvp` → cancelRsvp() DELETE
    // intercepté → refresh() → re-GET `/participations` renvoie body vide
    // → `rsvp = false` côté useMobilization.
    await signedButton.click();

    // État final : « Je participe » visible, aria-pressed="false". Le
    // bouton initial ne doit plus être rendu (rendu conditionnel JSX
    // bascule sur la branche `!rsvp`).
    const joinButton = page.getByRole('button', { name: /Je participe/i });
    await expect(joinButton).toBeVisible({ timeout: 10_000 });
    await expect(joinButton).toHaveAttribute('aria-pressed', 'false');
    await expect(
      page.getByRole('button', { name: /Inscrit·e — me désinscrire/i }),
    ).toHaveCount(0);
  });
});
