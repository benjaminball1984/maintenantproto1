import { test, expect, type Route } from '@playwright/test';

import { installAuthenticatedSession, installSupabaseStubs } from './utils/mockSupabase';
import { installStatefulToggleRoute } from './utils/statefulRoute';

// =====================================================================================
// Étape 38 — 11e itération du pattern E2E mock stateful POST/DELETE.
//
// Premier call-site du helper `installStatefulToggleRoute` (extrait dans
// `e2e/utils/statefulRoute.ts`) — clôture de la dette
// `L9-arch-stateful-mock` au sens « helper extrait + 1 nouveau call-site
// qui l'utilise ». Les 10 sites existants (signatures, votes,
// participations, campaign_actions) sont conservés tels quels — leur
// refacto vers le helper est reportée en dette
// `L11-e2e-refacto-stateful-callsites` (risque medium d'ouvrir un edge
// case sur l'ordre LIFO des routes Playwright).
//
// Scénario : utilisateur authentifié `viewer-id` visite `/reseau`, voit
// le post d'un autre user `author-id` avec un bouton `<FollowButton>`.
// Au clic : POST `/rest/v1/follows` intercepté → bascule UI vers
// `aria-pressed="true"` + libellé « Suivi·e ». Re-clic : DELETE → retour
// à `aria-pressed="false"` + libellé « Suivre ».
// =====================================================================================

const viewerId = 'stub-viewer-follower';
const authorId = 'stub-author-followee';

const postFixture = {
  id: 'post-stub-1',
  author_id: authorId,
  body: 'Premier post de l\'autre user — visible depuis /reseau.',
  media_urls: [],
  visibility: 'public' as const,
  is_flagged: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

test.describe('Réseau — follow / unfollow stubé', () => {
  test.beforeEach(async ({ page }) => {
    await installSupabaseStubs(page);

    // Feed `/rest/v1/posts` : renvoie un post d'un autre user (pour que
    // le bouton Follow apparaisse — il est conditionnel à `viewerId !== authorId`).
    await page.route('**/rest/v1/posts**', async (route: Route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([postFixture]),
      });
    });
  });

  test('clic « Suivre » → POST intercepté → bascule vers « Suivi·e » (aria-pressed=true), puis clic « Suivi·e » → DELETE → retour « Suivre »', async ({
    page,
  }) => {
    // Seed session via `installAuthenticatedSession` (helper extrait
    // étape 31, ferme la dette `L8-arch-authsession`).
    await installAuthenticatedSession(page, {
      userId: viewerId,
      email: 'viewer@example.org',
      displayName: 'Viewer Stub',
    });

    // Initial state : `useFollowing(viewerId)` GET `/follows?follower_id=eq.<viewerId>`
    // renvoie `[]` → followingSet vide → `initiallyFollowing=false` côté
    // PostCard → bouton « Suivre » rendu (aria-pressed="false").
    //
    // POST `/follows` (clic « Suivre ») → 201 + ligne insérée → state
    // local FollowButton bascule à `following=true` (UI optimiste, pas
    // de refetch nécessaire ici car le bouton est self-contained).
    //
    // DELETE `/follows` (clic « Suivi·e ») → 204 → state local bascule
    // à `following=false`.
    //
    // Le helper `installStatefulToggleRoute` encapsule ce pattern
    // (POST→toggled=true, DELETE→toggled=false, GET→[] ou [row]).
    await installStatefulToggleRoute(page, {
      matchUrl: '**/rest/v1/follows**',
      insertedRow: {
        id: 'follow-stub-new',
        follower_id: viewerId,
        followee_id: authorId,
        created_at: new Date().toISOString(),
      },
    });

    await page.goto('/reseau');

    // Bouton « Suivre » initial (aria-pressed="false").
    // Regex non ancré : le bouton vit dans une `<article>` post,
    // `getByRole('button', { name: /Suivre/i })` cible le seul match
    // (le composer « Publier » n'utilise pas le mot Suivre).
    const followButton = page.getByRole('button', { name: /^Suivre$/i });
    await expect(followButton).toBeVisible({ timeout: 10_000 });
    await expect(followButton).toHaveAttribute('aria-pressed', 'false');

    // Clic → POST intercepté → state local FollowButton flippe.
    await followButton.click();

    // Bouton « Suivi·e » (aria-pressed="true"). React rend les booléens
    // ARIA en string `"true"`/`"false"`.
    const followingButton = page.getByRole('button', { name: /Ne plus suivre/i });
    await expect(followingButton).toBeVisible({ timeout: 10_000 });
    await expect(followingButton).toHaveAttribute('aria-pressed', 'true');

    // Re-clic → DELETE intercepté → retour à l'état initial.
    await followingButton.click();
    await expect(followButton).toBeVisible({ timeout: 10_000 });
    await expect(followButton).toHaveAttribute('aria-pressed', 'false');
  });
});
