import { test, expect, type Route } from '@playwright/test';

import { installAuthenticatedSession, installSupabaseStubs } from './utils/mockSupabase';

const pollFixture = {
  id: 'poll-stub-1',
  author_id: 'stub-author',
  slug: 'climat-2026',
  question: 'Quel objectif climat pour 2030 ?',
  description: 'Consultation interne aux adhérent·es.',
  members_only: false,
  closes_at: null,
  status: 'published' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const optionFixtures = [
  {
    id: 'opt-stub-low',
    poll_id: pollFixture.id,
    label: '−40% CO2',
    position: 0,
    vote_count: 10,
    created_at: new Date().toISOString(),
  },
  {
    id: 'opt-stub-high',
    poll_id: pollFixture.id,
    label: '−60% CO2',
    position: 1,
    vote_count: 25,
    created_at: new Date().toISOString(),
  },
];

test.describe('Sondages — flow vote / unvote stubé', () => {
  test.beforeEach(async ({ page }) => {
    await installSupabaseStubs(page);
    // Fiche sondage (`/rest/v1/polls?slug=eq.<slug>`) + ses options
    // (`/rest/v1/poll_options?poll_id=eq.<pollId>`). Les deux endpoints
    // sont sollicités à chaque rendu initial + à chaque `refresh()` après
    // un vote (cf. `usePoll.fetchPoll`). Le mock renvoie le même payload
    // à chaque hit — Playwright n'a pas besoin d'incrémenter `vote_count`
    // côté serveur pour ce test : ce qu'on vérifie c'est la bascule du
    // CTA `Valider mon vote` ↔ `Vote enregistré — retirer mon vote`,
    // pilotée par `userOptionId` (alimenté par le mock `votes`).
    await page.route('**/rest/v1/polls**', async (route: Route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([pollFixture]),
      });
    });
    await page.route('**/rest/v1/poll_options**', async (route: Route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(optionFixtures),
      });
    });
  });

  test('vote: clic option + valider → POST intercepté → bascule vers « Vote enregistré — retirer mon vote »', async ({
    page,
  }) => {
    // Étape 31 — 7e itération du pattern « +1 test mock E2E » (suggérée
    // explicitement par le prompt étape 31 §2 : « flow vote/unvote sur
    // poll-detail-page, symétrique sign/unsign de l'étape 28/29, exerce
    // `usePoll` + `votePoll/unvotePoll` »). 5e call-site de
    // `installAuthenticatedSession` (helper extrait à cette étape),
    // ferme la dette `L8-arch-authsession` notée étape 28.
    //
    // Couvre la transition `userOptionId: null → 'opt-stub-high'` côté
    // UI : sélection d'option (`pendingOption`), clic « Valider mon
    // vote » → handleVote() → votePoll() POST intercepté → refresh() →
    // re-GET sur `/votes` qui renvoie maintenant le vote enregistré →
    // `userOptionId` non nul → CTA bascule sur « Vote enregistré —
    // retirer mon vote » avec aria-pressed="true".
    const stubUserId = 'stub-active-voter-id';
    await installAuthenticatedSession(page, {
      userId: stubUserId,
      email: 'votant@example.org',
      displayName: 'Votant Stub',
    });

    // Mock stateful pour `/rest/v1/votes` :
    // - GET (`getUserVote`) : renvoie `[]` avant POST, `[{ option_id }]`
    //   après le flip.
    // - POST (`votePoll .insert(...).select('*').maybeSingle()`) :
    //   renvoie 201 + ligne insérée, bascule le flag interne
    //   `hasVoted` + mémorise `votedOptionId`.
    //
    // **Séquencement applicatif** : `handleVote` côté PollDetailPage:300
    // chaîne `await votePoll(...)` PUIS `await refresh()`. Le GET de
    // refresh est garanti d'arriver APRÈS le flip du flag. Playwright
    // sérialise les handlers par requête mais pas plusieurs requêtes
    // concurrentes — c'est le `await` côté UI qui assure le séquencement.
    const newVoteRow = {
      id: 'vote-stub-new',
      poll_id: pollFixture.id,
      option_id: optionFixtures[1]!.id,
      user_id: stubUserId,
      created_at: new Date().toISOString(),
    };
    let hasVoted = false;
    let votedOptionId: string | null = null;
    await page.route('**/rest/v1/votes**', async (route: Route) => {
      const method = route.request().method();
      if (method === 'POST') {
        hasVoted = true;
        votedOptionId = newVoteRow.option_id;
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify([newVoteRow]),
        });
      }
      // GET (`getUserVote .select('option_id').maybeSingle()`) — body
      // vide tant que `hasVoted` est `false`, sinon un row contenant
      // `option_id`.
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(hasVoted ? [{ option_id: votedOptionId }] : []),
      });
    });

    await page.goto(`/polls/${pollFixture.slug}`);

    // État initial : authentifié, pas encore voté → CTA « Valider mon
    // vote » est rendu mais disabled tant qu'aucune option n'est
    // sélectionnée (cf. PollDetailPage.tsx:296 `setActionError` si pas
    // de pendingOption). On commence par cliquer une option pour
    // basculer `pendingOption`.
    const optionButton = page.getByRole('button', { name: /−60% CO2/ });
    await expect(optionButton).toBeVisible({ timeout: 10_000 });
    await optionButton.click();
    // L'option sélectionnée a aria-pressed="true" (cf. PollDetailPage.tsx:359
    // `aria-pressed={isUserChoice || isPending}`).
    await expect(optionButton).toHaveAttribute('aria-pressed', 'true');

    // Clic réel sur « Valider mon vote » → handleVote() → votePoll() POST
    // intercepté → refresh() → re-GET `/votes` renvoie un row non vide →
    // `userOptionId = 'opt-stub-high'` côté usePoll.
    const validateButton = page.getByRole('button', { name: /Valider mon vote/i });
    await expect(validateButton).toBeVisible();
    await validateButton.click();

    // État final : « Vote enregistré — retirer mon vote » visible,
    // aria-pressed="true" (cf. PollDetailPage.tsx:434
    // `aria-pressed={Boolean(userOptionId)}`).
    const votedButton = page.getByRole('button', {
      name: /Vote enregistré — retirer mon vote/i,
    });
    await expect(votedButton).toBeVisible({ timeout: 10_000 });
    await expect(votedButton).toHaveAttribute('aria-pressed', 'true');
    // Le CTA initial « Valider mon vote » ne doit plus être rendu (le
    // rendu conditionnel JSX bascule sur la branche `userOptionId`).
    await expect(
      page.getByRole('button', { name: /Valider mon vote/i }),
    ).toHaveCount(0);
  });

  test('unvote: clic → DELETE intercepté → bascule retour vers « Valider mon vote »', async ({
    page,
  }) => {
    // Étape 31 — 8e itération du pattern « +1 test mock E2E », flow
    // symétrique du test précédent. Couvre la branche `userOptionId !==
    // null` de `handleVote` (PollDetailPage.tsx:285-294) : clic sur
    // « Vote enregistré — retirer mon vote » → unvotePoll() DELETE
    // intercepté → refresh() → re-GET `/votes` renvoie un body vide →
    // `userOptionId = null` → CTA bascule retour sur « Valider mon vote »
    // (disabled puisque aucune option n'est sélectionnée après refresh).
    const stubUserId = 'stub-active-unvoter-id';
    await installAuthenticatedSession(page, {
      userId: stubUserId,
      email: 'devotant@example.org',
      displayName: 'Devotant Stub',
    });

    // Mock stateful pour `/rest/v1/votes` (symétrique du test vote) :
    // - GET (`getUserVote`) : renvoie `[{ option_id }]` tant que
    //   `hasVoted` est `true`, `[]` après DELETE.
    // - DELETE (`unvotePoll .delete().eq(...).eq(...)`) : renvoie 204
    //   No Content (comportement PostgREST par défaut sans `.select()`,
    //   cf. polls.ts:299 qui ne chaîne pas `.select()`) et bascule
    //   `hasVoted = false`.
    const existingVoteRow = {
      id: 'vote-stub-existing',
      poll_id: pollFixture.id,
      option_id: optionFixtures[1]!.id,
      user_id: stubUserId,
      created_at: new Date().toISOString(),
    };
    let hasVoted = true;
    await page.route('**/rest/v1/votes**', async (route: Route) => {
      const method = route.request().method();
      if (method === 'DELETE') {
        hasVoted = false;
        return route.fulfill({
          status: 204,
          contentType: 'application/json',
          body: '',
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(hasVoted ? [{ option_id: existingVoteRow.option_id }] : []),
      });
    });

    await page.goto(`/polls/${pollFixture.slug}`);

    // État initial : authentifié, a déjà voté pour `opt-stub-high` →
    // CTA « Vote enregistré — retirer mon vote » avec aria-pressed="true".
    const votedButton = page.getByRole('button', {
      name: /Vote enregistré — retirer mon vote/i,
    });
    await expect(votedButton).toBeVisible({ timeout: 10_000 });
    await expect(votedButton).toHaveAttribute('aria-pressed', 'true');

    // Clic réel → handleVote() branche `userOptionId !== null` →
    // unvotePoll() DELETE intercepté → refresh() → re-GET `/votes`
    // renvoie body vide → `userOptionId = null` côté usePoll.
    await votedButton.click();

    // État final : « Valider mon vote » visible, aria-pressed="false"
    // (Boolean(null) === false). Le bouton voté initial ne doit plus
    // être rendu (rendu conditionnel JSX bascule sur la branche
    // `!userOptionId`).
    const validateButton = page.getByRole('button', { name: /Valider mon vote/i });
    await expect(validateButton).toBeVisible({ timeout: 10_000 });
    await expect(validateButton).toHaveAttribute('aria-pressed', 'false');
    await expect(
      page.getByRole('button', { name: /Vote enregistré — retirer mon vote/i }),
    ).toHaveCount(0);
  });
});
