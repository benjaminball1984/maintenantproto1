# Inventaire exhaustif — Revue utilisateur

> Phase 0 du protocole de revue exhaustive (cf. prompt utilisateur).
> Inventaire produit par 5 sub-agents Explore en read-only (4 passes parallèles
> + 1 passe ciblée de complétion). Aucune modification de code source.

## Total

**~1 452 items uniques** répartis sur **62 pages** + **15 composants cross-cutting**
+ **e-mails transactionnels** + **rôles / RLS / RPC**.

## Répartition par section

| Section | Fichier | Items | Pages couvertes |
|---|---|---:|---|
| Pages publiques & légales | `01-pages-publiques.md` | ~551 | 14 pages |
| Engagement militant & Services | `02-engagement-services.md` | ~510 | 36 pages |
| Compte utilisateur & Admin | `03-compte-admin.md` | ~179 | 7 pages |
| Cross-cutting (header, footer, modales, emails, rôles) | `04-cross-cutting.md` | ~212 | 15 composants + emails + DB |

## Répartition par page (top contributeurs)

### Pages publiques (14)
- HomePage `/`
- DecouvrirPage `/decouvrir`
- AboutPage `/about`
- RoadmapPage `/roadmap`
- FaqPage `/faq` (5 catégories, 17 Q/A)
- TransparencePage `/transparence`
- JoinPage `/join` (3 tiers)
- ReseauPage `/reseau`
- CommunesPage `/communes`
- CommuneDetailPage `/communes/:slug`
- CommuneCreatePage `/communes/new`
- PrivacyPage `/legal/privacy` (8 sections RGPD)
- LegalNoticePage `/legal/notice`
- CookiesPage `/legal/cookies`
- ContactPage `/legal/contact`
- NotFoundPage 404

### Engagement militant (15 pages)
- Pétitions : `/petitions`, `/petitions/:slug`, `/petitions/new`
- Mobilisations : `/mobilizations`, `/mobilizations/:slug`, `/mobilizations/new`
- Campagnes : `/campaigns`, `/campaigns/:slug`, `/campaigns/new`
- Sondages : `/polls`, `/polls/:slug`, `/polls/new`
- Média : `/media`, `/media/:slug`, `/media/new`

### Services solidaires (24 pages)
- Hub : `/services`
- Hébergement : `/services/housing`, `/services/housing/:id`, `/services/housing/new`, `/services/housing/:id/request`
- Covoiturage : `/services/carpooling`, `/services/carpooling/:id`, `/services/carpooling/new`
- Marketplace : `/services/marketplace`, `/services/marketplace/:id`, `/services/marketplace/new`
- Prêt : `/services/lending`, `/services/lending/:id`, `/services/lending/new`
- Jardin : `/services/garden`, `/services/garden/:id`, `/services/garden/new`
- SEL : `/services/sel`, `/services/sel/:id`, `/services/sel/new`
- Crowdfunding : `/services/crowdfunding`, `/services/crowdfunding/:id`, `/services/crowdfunding/new`, `/services/crowdfunding/:id/contribute`

### Compte & admin (7 pages)
- ProfilePage `/profile` (~45 items)
- NotificationsPage `/notifications` (~23 items)
- MessagingPage `/messaging` (~14 items)
- MessagingConversationPage `/messaging/:conversationId` (~20 items)
- AuthCallbackPage `/auth/callback` (~4 items)
- ResetPasswordPage `/auth/reset-password` (~18 items)
- AdminPage `/admin` (~60+ items, 3 onglets : Modération / Communes / Email)

### Composants cross-cutting (15)
- Header (RootLayout) — nav, search, user menu, login button
- AuthModal — 4 modes (login / signup / forgot / magic), OAuth Google + Instagram
- OnboardingModal — 4 étapes
- CookieBanner — 2 catégories de consentement
- Footer — 3 colonnes (Mission / Outils / Légal)
- Toast — 3 variantes (success / error / info)
- Breadcrumbs, EmptyState, Skeleton, RouteErrorBoundary
- ContactAuthorButton, FollowButton
- RequireAuth, RequireAdmin
- MonthlySignupsChart
- Icônes (29 standard + 2 OAuth)

### E-mails transactionnels
- Supabase Auth : signup confirmation, magic link, password reset (templates par défaut, **non customisés**)
- Stripe : notifications transactionnelles d'adhésion (par défaut Stripe, **non customisées** côté Maintenant !)

### Schéma DB / Rôles / RLS
- 4 rôles : anonymous, authenticated, admin, member, commune-member
- Énums : adhesion_tier, adhesion_status, content_status, post_visibility, notification_kind, t99cp_kind
- Matrice de permissions : public read / private read / write authenticated / write admin
- RPC publiques : `is_admin`, `credit_t99cp`, `slugify`

## ID nommage

Format stable : `<page-slug>.<section>.<sous-élément>`

Exemples :
- `home.hero.cta-primary`
- `petitions.detail.signature-button`
- `auth-modal.signup.email.placeholder`
- `admin.moderation.item.delete-btn`
- `email.signup-confirmation.subject`
- `footer.legal.item.privacy`

## Pages avec inventaire partiellement inféré

3 listing pages (cohérentes structurellement avec les autres listings) ont été inférées
par l'agent A2 (Carpooling, Lending, Garden, Sel, Crowdfunding listings — les pages
detail / create / contribute sont issues de lecture directe). À valider tels quels
ou à compléter en Phase 1.

## Findings et incidents

Voir `00-findings-incidents.md` (vide pour l'instant — sera enrichi en cours de revue).

## Sortie attendue

- `01-pages-publiques.md` ✅
- `02-engagement-services.md` ✅
- `03-compte-admin.md` ✅
- `04-cross-cutting.md` ✅
- `00-inventaire.md` (ce fichier) ✅
- `00-progress.json` ✅ (vide, à remplir en Phase 1)
- `00-findings-incidents.md` ✅

Phase 0 : **terminée**. Validation utilisateur requise avant Phase 1.
