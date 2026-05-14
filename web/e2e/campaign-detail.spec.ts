import { test, expect, type Route } from '@playwright/test';

import { installSupabaseStubs } from './utils/mockSupabase';

// Étape 33 — 10e itération du pattern « +1 test mock E2E ciblé ». Cible :
// `/campaigns/:slug` (CampaignDetailPage.tsx) qui n'a JAMAIS été couvert
// E2E jusqu'ici (seul `/campaigns` apparaissait dans
// `public-pages.spec.ts:13`).
//
// **Pourquoi pas un flow stateful POST/DELETE-flag-flip** (symétrique de
// petition sign/unsign, poll vote/unvote, mobilization rsvp/cancel) : il
// n'existe PAS de `supportCampaign` / `withdrawSupport` côté backend
// (cf. `src/lib/campaigns.ts` — aucune fonction de support utilisateur,
// les actions de la campagne sont des liens vers d'autres entités). Le
// prompt étape 33 §2 mentionnait cette possibilité « si symétrique » mais
// autorisait explicitement le fallback sur un autre flow mock non-vide.
// La dette `L9-arch-stateful-mock` reste donc à 4 call-sites duplicateurs
// (petition x2 + poll x1 + mobilization x1 spec), aucune nouvelle
// duplication ici.
//
// Couvre :
// - `useCampaign(slug)` → `getCampaign(slug)` enchaîne deux GETs :
//   1. GET `/rest/v1/campaigns?slug=eq.<slug>&select=*` (.maybeSingle)
//   2. GET `/rest/v1/campaign_actions?campaign_id=eq.<id>&select=*&order=position.asc`
// - `resolveAction(action)` (CampaignDetailPage.tsx:198-237) qui mappe
//   chaque action sur la route correspondante (`/petitions/<id>`,
//   `/mobilizations/<id>`, `/polls/<id>`, `/services/crowdfunding/<id>`)
//   ou sur la fallback `unknown` (action orpheline → carte sans lien
//   avec `aria-label="Action sans cible (lien rompu)"`).

const campaignFixture = {
  id: 'campaign-stub-1',
  author_id: 'stub-author',
  slug: 'transition-energie-2030',
  title: 'Transition énergie 2030',
  summary: 'Une campagne citoyenne pour accélérer la sortie des énergies fossiles.',
  body: 'Détails de la campagne : trois actions complémentaires à mener en parallèle.',
  cover_url: null,
  status: 'published' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const petitionActionFixture = {
  id: 'campaign-action-petition-1',
  campaign_id: campaignFixture.id,
  petition_id: 'petition-stub-1',
  mobilization_id: null,
  poll_id: null,
  crowdfunding_id: null,
  label: 'Pétition : sortir du charbon',
  position: 0,
  created_at: new Date().toISOString(),
};

const mobilizationActionFixture = {
  id: 'campaign-action-mobilization-1',
  campaign_id: campaignFixture.id,
  petition_id: null,
  mobilization_id: 'mobilization-stub-1',
  poll_id: null,
  crowdfunding_id: null,
  label: 'Mobilisation : marche pour le climat',
  position: 1,
  created_at: new Date().toISOString(),
};

const pollActionFixture = {
  id: 'campaign-action-poll-1',
  campaign_id: campaignFixture.id,
  petition_id: null,
  mobilization_id: null,
  poll_id: 'poll-stub-1',
  crowdfunding_id: null,
  label: 'Sondage : objectif CO2',
  position: 2,
  created_at: new Date().toISOString(),
};

test.describe('Campagnes — fiche /campaigns/:slug stubée', () => {
  test.beforeEach(async ({ page }) => {
    await installSupabaseStubs(page);
    // Fiche campagne (`/rest/v1/campaigns?slug=eq.<slug>`) — un seul row
    // wrappé dans un tableau ; supabase-js avec `.maybeSingle()` accepte
    // un body `[row]` (PostgREST renvoie un tableau tant qu'on n'utilise
    // pas le header `Accept: application/vnd.pgrst.object+json`).
    await page.route('**/rest/v1/campaigns**', async (route: Route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([campaignFixture]),
      });
    });
  });

  test('rend l\'entête (titre + résumé + corps) et les 3 cartes d\'action typées avec leurs liens', async ({
    page,
  }) => {
    // Override `/rest/v1/campaign_actions` avec 3 actions typées
    // (petition + mobilization + poll). On vérifie que `resolveAction`
    // mappe correctement chacune sur la route attendue côté UI.
    await page.route('**/rest/v1/campaign_actions**', async (route: Route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          petitionActionFixture,
          mobilizationActionFixture,
          pollActionFixture,
        ]),
      });
    });

    await page.goto(`/campaigns/${campaignFixture.slug}`);

    // En-tête : titre h1 + résumé + corps. Le tag « Campagne citoyenne »
    // est rendu inconditionnellement (CampaignDetailPage.tsx:288).
    await expect(
      page.getByRole('heading', { level: 1, name: campaignFixture.title }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(campaignFixture.summary)).toBeVisible();
    await expect(page.getByText(campaignFixture.body)).toBeVisible();
    // `exact: true` indispensable : le résumé du fixture contient
    // « Une campagne citoyenne pour accélérer… » qui matcherait aussi
    // une regex /Campagne citoyenne/i. Le tag span contient exactement
    // « Campagne citoyenne » (l'IconMegaphone SVG n'ajoute pas de texte).
    await expect(page.getByText('Campagne citoyenne', { exact: true })).toBeVisible();

    // Heading de la section actions : compteur dynamique « 3 actions … ».
    // Le pluriel est ajouté quand `actions.length > 1` (CampaignDetailPage.tsx:317).
    await expect(
      page.getByRole('heading', { level: 2, name: /3 actions dans cette campagne/i }),
    ).toBeVisible();

    // Liste accessible « Actions de la campagne ». Les liens sont des
    // `<a>` via `<Link to={route.href}>` (react-router rend un anchor).
    const actionsList = page.getByRole('list', { name: /Actions de la campagne/i });
    await expect(actionsList).toBeVisible();

    // 3 cartes typées → 3 liens (router-link rendu en `<a href>`). Pour
    // chaque kind, vérifier le label (badge majuscules) + l'URL cible.
    const petitionLink = actionsList.getByRole('link', {
      name: new RegExp(petitionActionFixture.label, 'i'),
    });
    await expect(petitionLink).toBeVisible();
    await expect(petitionLink).toHaveAttribute(
      'href',
      `/petitions/${petitionActionFixture.petition_id}`,
    );

    const mobilizationLink = actionsList.getByRole('link', {
      name: new RegExp(mobilizationActionFixture.label, 'i'),
    });
    await expect(mobilizationLink).toBeVisible();
    await expect(mobilizationLink).toHaveAttribute(
      'href',
      `/mobilizations/${mobilizationActionFixture.mobilization_id}`,
    );

    const pollLink = actionsList.getByRole('link', {
      name: new RegExp(pollActionFixture.label, 'i'),
    });
    await expect(pollLink).toBeVisible();
    await expect(pollLink).toHaveAttribute(
      'href',
      `/polls/${pollActionFixture.poll_id}`,
    );

    // Lien retour vers /campaigns rendu en haut de page (back-link).
    const backLink = page.getByRole('link', { name: /Toutes les campagnes/i });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute('href', '/campaigns');
  });

  test('rend la fallback « Action sans cible (lien rompu) » pour une action orpheline (tous ids null)', async ({
    page,
  }) => {
    // Action orpheline : ni petition_id, ni mobilization_id, ni poll_id,
    // ni crowdfunding_id. `resolveAction` (CampaignDetailPage.tsx:228-235)
    // retombe sur `kind: 'unknown'` + `href: null` → rendu en `<div>` non
    // cliquable avec aria-label « Action sans cible (lien rompu) »
    // (CampaignDetailPage.tsx:340).
    const orphanActionFixture = {
      id: 'campaign-action-orphan-1',
      campaign_id: campaignFixture.id,
      petition_id: null,
      mobilization_id: null,
      poll_id: null,
      crowdfunding_id: null,
      label: 'Action externe non-typée',
      position: 0,
      created_at: new Date().toISOString(),
    };
    await page.route('**/rest/v1/campaign_actions**', async (route: Route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([orphanActionFixture]),
      });
    });

    await page.goto(`/campaigns/${campaignFixture.slug}`);

    // Compteur singulier « 1 action … » (pas de `s`).
    await expect(
      page.getByRole('heading', { level: 2, name: /1 action dans cette campagne/i }),
    ).toBeVisible({ timeout: 10_000 });

    // L'action orpheline est rendue en `<div role="generic">` avec
    // aria-label dédié — donc pas en `<a>`. On vérifie que :
    // 1. l'élément avec aria-label « Action sans cible (lien rompu) »
    //    est présent et visible
    // 2. AUCUN `<a>` (link role) n'est rendu dans la liste — la branche
    //    `route.href === null` rend un `<div>` non cliquable.
    const orphanCard = page.getByLabel(/Action sans cible \(lien rompu\)/i);
    await expect(orphanCard).toBeVisible();
    await expect(orphanCard).toContainText(orphanActionFixture.label);
    const actionsList = page.getByRole('list', { name: /Actions de la campagne/i });
    await expect(actionsList.getByRole('link')).toHaveCount(0);
  });
});
