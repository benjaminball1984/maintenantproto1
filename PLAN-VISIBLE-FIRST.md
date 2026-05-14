# Plan révisé Maintenant! — étapes 34 → 42 (visible-first)

> À coller dans le prompt de la nouvelle session Claude Code pour
> redémarrer le projet avec un focus **livrables visuels prioritaires**.
> Plan condensé de 17 étapes (34→50) en **9 étapes (34→42)** —
> regroupement de la dette technique invisible en blocs dédiés,
> front-loading du visuel.

---

## Contexte & contraintes

- Repo : `benjaminball1984/maintenantproto1` (Vite + React + TS + Supabase).
- Migration entamée étape 0, à fin **étape 33** : pile prod-ready,
  883 vitest verts + 43 E2E Playwright en CI, déployé sur
  `https://maintenant-le-mouvement.netlify.app/`.
- Lire impérativement avant de coder : `CLAUDE.md`, `HANDOFF.md`,
  `HANDOFF-PROGRESS.md`, `docs/PROD-RUNBOOK.md`.
- **Règles non-négociables** : TS strict no `any`, tokens `T.*`
  intouchables sans validation designer, SVG via `ICONS.*` (pas
  d'emojis), RLS Supabase stricte, axe-core ≥ 95, Lighthouse ≥ 95,
  `prefers-reduced-motion` respecté.
- **Workflow PR** : `CLAUDE.md § Politique de PR` autorise
  auto-merge + janitor jusqu'à session 50.

## Objectif du nouveau plan

Maximiser les **changements visibles côté UI prod** entre maintenant
et la fin de la migration. La dette technique invisible (Lighthouse,
Sentry, monitoring, M2-sec-policy, M1-RGPD, Stripe reconciliation,
backups DB) est regroupée en **1 seule étape consolidée** (étape 41)
au lieu de saupoudrer 5 sessions.

---

## Plan condensé — 9 étapes

### Étape 34 — Home page renouvelée (impact n°1)

**Livrable visuel** :
- Hero refondu : H1 fort, sub-headline, **dual CTA** « Adhérer » + « Découvrir ».
- 4 **compteurs live** au-dessus du fold (signataires, mobilisations,
  communes, T99CP) tirés via `fetchTransparencyCounts`.
- 3 sections « Ce que tu peux faire » (cards illustrées ICONS.*) :
  Pétitions / Mobilisations / Services entraide.
- Bandeau « Notre mission » + lien vers `/decouvrir` (créée étape 36).
- Footer enrichi 3 colonnes (mission / outils / légal).

**Risque** : 0 backend touché. Tokens `T.*` réutilisés (pas modifiés).
**Tests** : maintenir 883 vitest. Ajouter ≥ 4 tests HomePage.

---

### Étape 35 — Empty states + Cards polish (impact n°2)

**Livrable visuel** :
- Composant `<EmptyState>` réutilisable : icon ICONS.* + heading +
  microcopie + CTA « Créer la première » (selon page).
- Appliqué à **toutes les pages listing vides** : petitions,
  mobilizations, polls, campaigns, communes, media, services
  (housing/carpooling/marketplace/lending/garden/sel/crowdfunding) =
  **13 pages**.
- Polish uniforme des cards listings (hover state, spacing,
  transitions douces ≤ 200 ms — respect `prefers-reduced-motion`).

**Risque** : aucun (CSS-in-JS local, pas de tokens touchés).
**Tests** : ≥ 5 tests `<EmptyState>` + maintenir le reste vert.

---

### Étape 36 — Page `/decouvrir` éditoriale (nouvelle page)

**Livrable visuel** :
- Nouvelle route `/decouvrir` (ajoutée au router + lien depuis Home + Footer).
- 5 sections : Mission / Comment ça marche / Les outils / Notre
  vision / Roadmap.
- 3 témoignages **marqués démo** (placeholders explicites « Témoignage
  fictif — démo »).
- Mise en page éditoriale large (max-width 880, padding aéré).

**Risque** : 0. Page entièrement statique.
**Tests** : ≥ 4 tests page + 1 E2E mock.

---

### Étape 37 — `/transparence` polish + Profil enrichi

**Livrable visuel** :
- **/transparence** : carte T99CP mise en avant (déjà étape 30),
  microcopie « comment c'est calculé » sur chaque compteur,
  graphique inscriptions agrandi, lien vers `/decouvrir`.
- **/profile** (utilisateur connecté) : avatar + bio +
  **badges contribution** (pétitions signées, mobilisations rsvp,
  votes, posts) — comptés via queries Supabase légères.
- Historique des 10 dernières actions.

**Risque** : 0 backend nouveau. Queries lecture seule.
**Tests** : ≥ 6 tests (3 transparence + 3 profil).

---

### Étape 38 — Communauté + Navigation polish

**Livrable visuel** :
- **/reseau** refondue : timeline visible (déjà en lib `social.ts`
  via `useFeed`), cards posts polish.
- Câbler `followUser` / `unfollowUser` (déjà en lib) sur un
  composant `<FollowButton>` réutilisable.
- **Header sticky** avec recherche globale (placeholder UI).
- **Breadcrumbs** sur toutes les sous-pages.

**Risque** : `followUser`/`unfollowUser` non encore exposés UI —
faire valider RLS `follows` côté policies avant.
**Tests** : ≥ 8 tests + 1 E2E mock follow/unfollow (11e itération
du pattern stateful POST/DELETE — close enfin la dette
`L9-arch-stateful-mock` en extrayant `installStatefulToggleRoute`).

---

### Étape 39 — Pages éditoriales (FAQ + À propos + Roadmap)

**Livrable visuel** :
- **/faq** : accordion 15-20 questions (account, RGPD, T99CP, Stripe…).
- **/about** : équipe (placeholders), valeurs, historique mouvement.
- **/roadmap** : timeline visuelle 2026-2028 (jalons publics).

**Risque** : 0. Pages statiques.
**Tests** : ≥ 6 tests.

---

### Étape 40 — Animations & onboarding première visite

**Livrable visuel** :
- **Loading skeletons** sur listings (remplacent « Chargement… » texte).
- **Toast notifications** (`<Toast>` réutilisable) pour confirmation
  actions (signature, vote, RSVP).
- **Onboarding modal** première visite (localStorage flag
  `mn-onboarding-seen`) : 3-4 étapes pour découvrir le produit, CTA
  « S'inscrire » final.
- Toutes transitions ≤ 200 ms, respect `prefers-reduced-motion`.

**Risque** : flag localStorage = pas de RGPD (technique pure).
**Tests** : ≥ 5 tests onboarding + skeleton + toast.

---

### Étape 41 — Bloc technique pré-launch (invisible mais critique)

**Livrable invisible mais bloquant pour le launch** :
- Audit **Lighthouse réel** sur 6 pages clés + corrections jusqu'à ≥ 95.
- Configuration **Sentry runtime** (DSN, source maps, sample rate).
- **Backups DB** automatiques Supabase (point-in-time).
- **M2-sec-policy** : durcissement `signatures_select_public`
  (confirmation par PR car RLS visible).
- **M1-RGPD** : purge auto `stripe_events.payload` TTL 90 j
  (confirmation par PR car table critique).
- **Job réconciliation Stripe** : edge function périodique.
- **Tests de charge k6** : 100 utilisateurs concurrent sur 5 minutes.
- **E2E happy path** réel (si projet Supabase test seedé).
- **Documentation tech finale** : runbook ops, post-mortem template,
  procédure incident.

**Risque** : touche RLS + tables critiques → confirmer chaque PR.
**Tests** : suite complète verte, charge tenue, Lighthouse ≥ 95.

---

### Étape 42 — Lancement public + dette résiduelle

**Livrable visuel + comm** :
- Article blog **« On lance Maintenant! »** sur `/media/<slug>`.
- **Bannière annonce** sur home (dismissible localStorage).
- Liens **réseaux sociaux** dans footer (Mastodon, BlueSky, RSS).
- Page **« Contribuer »** (`/contribuer`) : appel à dons + bénévolat.
- Fermeture **toutes les dettes** restantes triées critical/high.

**Risque** : 0. Contenu éditorial + dette technique de fin.
**Tests** : full suite verte.

---

## Récap effort & livrables visuels par étape

| # | Étape | Effort | Visuel | Page(s) impactée(s) |
|---|---|:-:|:-:|---|
| 34 | Home renouvelée | 4 h | ⭐⭐⭐⭐⭐ | `/` |
| 35 | Empty states + cards polish | 3 h | ⭐⭐⭐⭐ | 13 pages listing |
| 36 | `/decouvrir` | 3 h | ⭐⭐⭐⭐⭐ | `/decouvrir` (nouvelle) |
| 37 | Transparence + profil | 3 h | ⭐⭐⭐ | `/transparence`, `/profile` |
| 38 | Communauté + navigation | 4 h | ⭐⭐⭐⭐ | `/reseau` + nav global |
| 39 | FAQ + about + roadmap | 3 h | ⭐⭐⭐⭐ | 3 nouvelles pages |
| 40 | Animations + onboarding | 3 h | ⭐⭐⭐⭐ | global + modal |
| 41 | Bloc technique pré-launch | 8 h | invisible | infra / monitoring |
| 42 | Lancement public | 3 h | ⭐⭐⭐⭐⭐ | home + media + footer |

Total : ~34 h vs ~50 h dans le plan initial 17 étapes.

---

## Workflow par étape (toujours respecter)

1. Lire `CLAUDE.md` + `HANDOFF.md` + dernière entrée `HANDOFF-PROGRESS.md`.
2. Branche imposée par harness (typiquement `claude/<auto>`).
3. Travailler page par page, **ne jamais casser** le proto
   `app/Maintenant.html`.
4. 4 checks locaux verts AVANT push : typecheck + lint + vitest + build.
5. PR vers `main` + Test plan + auto-merge si CI verte.
6. Janitor post-step (audit 2-3 subagents + fixes safe-first +
   PR séparée).
7. Recopier le prompt étape suivante dans `HANDOFF-PROGRESS.md` ET
   en fin de chat.

## Conditions d'arrêt malgré l'autorisation auto-merge

- Migration DB risquée non listée explicitement dans le prompt.
- Changement RGPD non listé.
- Breaking change visible utilisateur (URL changée, suppression de
  page).
- Modification des tokens `T.*` sans validation designer.
- Review humaine ou commentaire GitHub avant le merge.

---

## Prompt d'amorçage à coller dans la nouvelle session

> Repo : `/home/user/maintenantproto1` (branche imposée par
> l'harness).
>
> **Plan révisé** : voir `PLAN-VISIBLE-FIRST.md` à la racine. Tu
> suis ce plan condensé 34→42 (9 étapes vs 17 initiales) avec
> focus sur les **livrables visuels prioritaires**.
>
> **État au démarrage** : étape 33 mergée (PR #47 — 10e itération
> pattern E2E mock sur `/campaigns/:slug`). 883 vitest + 43 E2E
> Playwright verts en CI.
>
> **Étape à exécuter** : **étape 34 — Home page renouvelée** (cf.
> `PLAN-VISIBLE-FIRST.md §Étape 34`).
>
> Workflow standard : 4 checks locaux verts → commit + push →
> PR draft → CI verte → merge → janitor post-step → recopie prompt
> étape 35.
