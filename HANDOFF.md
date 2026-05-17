# HANDOFF — Reset 2026-05-17

## TL;DR

Le repo a été remis à zéro le **2026-05-17** sur décision utilisateur.

Tout le code applicatif (auth, Stripe, pétitions, mobilisations, services
solidaires, communes, réseau social, admin, DB, tests…) a été supprimé.
Seuls la **charte graphique** et la **tuyauterie minimale Vite + React +
TypeScript** sont conservées.

**Récupération possible à tout moment** :

```bash
git fetch origin backup-pre-reset-2026-05-17
git checkout backup-pre-reset-2026-05-17
```

Cette branche contient l'intégralité du projet pré-reset (~44 étapes de
dev, ~1000 tests, schéma DB complet avec RLS, intégration Stripe, etc.).

---

## Ce qui reste dans le repo

### Charte graphique (à préserver)

- `web/src/index.css` — tokens CSS `--mn-*` (brand, gradient, text-1/2/3,
  surface, border, success/warning/danger, radius). Police Sora.
- `web/src/components/icons.tsx` — 33 icônes SVG (auth, navigation,
  actions, sociales, services). Pack complet réutilisable.
- `project/` — prototype HTML/JSX d'origine. Sources :
  - `project/app/Maintenant.html` — prototype HTML autonome.
  - `project/app/Theme.jsx` — design system source.
  - `project/app/Pages_*.jsx` — pages prototype (Home, Services, Media,
    Profile, Reseau, Polls, Commerce, Campaign, JoinMovement…).
  - `project/app/AdminEmailsAPI.jsx`, `AdminMessagingNotifs.jsx`,
    `AppData.jsx`, `Compat.jsx` — fragments admin & data layer.
  - `project/colors_and_type.css` — palette + typographie tabulaires.
- `colors_and_type.css` (racine, doublon historique du fichier
  `project/`).
- `Theme.jsx`, `Pages_*.jsx`, `CommunesLibres.jsx`, `ReseauPage.jsx`
  (racine, vestiges du prototype) — gardés comme références visuelles.
- `maintenant-design.zip`, `maintenant-prototype-export.tar.gz` —
  archives prototype.
- `chats/` — exports des conversations initiales avec l'équipe (chat1,
  chat2, chat3).

### Tuyauterie minimale

- `web/package.json` — React 19 + React-DOM uniquement (deps). TS,
  Vite, ESLint, Prettier en devDeps.
- `web/tsconfig*.json`, `web/vite.config.ts`, `web/eslint.config.js` —
  config strict TS + ESLint.
- `web/index.html`, `web/src/main.tsx`, `web/src/vite-env.d.ts`.
- `web/src/App.tsx` — **placeholder** qui rend uniquement un titre
  « Maintenant ! » avec la charte appliquée. Sert à valider que Vite
  + tokens CSS fonctionnent. À remplacer dès la première étape de redev.
- `.github/workflows/ci.yml` — CI minimale (typecheck + lint + build).
  Plus de vitest/Playwright tant qu'on n'a rien à tester.
- `.env.example`, `.gitignore`, `.devcontainer/`, `netlify.toml`,
  `README.md`.

### Ce qui a été supprimé

Tout le code applicatif : pages, composants (sauf `icons.tsx`), hooks,
lib, layouts, types, tests unitaires, tests E2E, schéma DB, Edge
Functions Supabase, documentation projet, historique
`HANDOFF-PROGRESS.md`.

---

## Workflow de la prochaine session (et de toutes les suivantes)

L'utilisateur veut **piloter le redev** sans coder, et sans laisser
Claude partir dans tous les sens. Les **6 règles dures** sont dans
`CLAUDE.md`. Résumé du déroulé d'une session type :

### Étape A — Description en langage naturel (utilisateur parle, Claude écoute)

L'utilisateur décrit, en français courant, **le site qu'il a en tête** :

- Quelles sont les **personnes** qui visitent le site ? (citoyen·ne
  curieux, militant·e local·e, journaliste, donateur…).
- Que viennent-elles **faire** ? (s'informer, signer une pétition,
  s'inscrire à la newsletter, adhérer, organiser un événement, échanger
  un service d'entraide, etc.).
- Quelles sont les **pages indispensables** ? (Home, Adhérer, Pétitions,
  À propos, Contact, etc.).
- Quel **ton éditorial** ? (militant, sobre, joyeux, combatif,
  pédagogique…).
- Quelles **valeurs** doivent ressortir visuellement ? (transparence,
  inclusion, indépendance, ouverture…).
- **Quels modules ne sont PAS dans le scope** initial ? (ex. : pas de
  Stripe pour l'instant, pas de messagerie, pas de réseau social
  interne…).

**Claude ne propose pas de solution technique à ce stade.** Claude pose
uniquement des questions de clarification quand un point est ambigu.
Claude résume en fin d'étape ce qu'il a compris en français, et
l'utilisateur valide ou corrige.

### Étape B — Options expliquées (Claude propose, utilisateur choisit)

À partir de la description validée à l'étape A, Claude présente
**2 à 4 options** sur chaque grand point d'architecture :

- Comment organiser les pages (arborescence à plat ? sections
  thématiques ? une seule longue page ?).
- Quel backend utiliser (rien pour l'instant ? Supabase ? Notion comme
  CMS ? Airtable ? un Google Sheet ?).
- Comment gérer l'adhésion (un simple formulaire qui envoie un mail ?
  Stripe ? HelloAsso ? un formulaire papier scanné ?).
- Etc.

Chaque option arrive avec :

- Un **nom court** compréhensible.
- Une **explication en français courant** (pas de jargon, et si un mot
  technique est utilisé il est défini en une phrase juste après).
- Les **conséquences concrètes** pour l'utilisateur.
- Une **recommandation** de Claude avec le pourquoi.

**L'utilisateur n'est pas censé connaître les termes techniques.**

### Étape C — Maquettes / captures avant code

Une fois les options choisies à l'étape B, Claude produit des
**maquettes visuelles** (capture d'écran d'un prototype HTML statique,
mockup Figma, ou schéma ASCII détaillé) pour chaque page-clé.

L'utilisateur valide ou rejette **sur la maquette uniquement**. Jamais
sur du code React déjà branché. On itère sur la maquette tant qu'elle
ne convient pas.

### Étape D — Mémorisation + plan de code

Une fois la maquette validée, Claude :

1. **Mémorise la décision** dans la section
   « Décisions validées » de ce `HANDOFF.md` (date, contexte, lien
   capture).
2. **Propose un plan de code par étapes atomiques**, où chaque étape :
   - correspond à **une seule fonctionnalité observable** ;
   - tient dans **une seule PR** ;
   - inclut un **critère de validation visuel** (capture-avant-merge) ;
   - liste explicitement ce qu'elle **N'inclut PAS** (anti-scope-creep).
3. L'utilisateur valide le plan d'ensemble.

### Étape E — Codage (uniquement après tout ce qui précède)

Et seulement ensuite, Claude commence à coder l'étape 1 du plan, en
respectant les conventions de `CLAUDE.md §Conventions code`.

### Étape F — Clôture de session (récursive)

À la **fin de chaque session**, Claude **écrit le prompt pour la
session suivante** :

- Dans `HANDOFF.md`, section « Prompt pour la session N+X ».
- Et dans la **dernière réponse de chat** de la session.
- Le prompt généré contient lui-même la même consigne de récursivité
  pour la session N+X+1.

Cette consigne s'auto-réplique : une fois posée, chaque session la
perpétue toute seule (cf. `CLAUDE.md §Règle 6`).

---

## Décisions validées

> Cette section grandit au fil des sessions. Chaque décision validée
> par l'utilisateur (après maquette OK) atterrit ici, datée. Pas
> d'historique d'hésitations, juste l'état décidé.

*(Aucune décision validée pour l'instant — première session de redev
à venir.)*

---

## Restaurer l'ancien projet (si l'utilisateur change d'avis)

```bash
# Récupérer la version d'avant le reset
git fetch origin backup-pre-reset-2026-05-17
git checkout backup-pre-reset-2026-05-17

# Si on veut la pousser sur main (annule le reset complet)
git checkout main
git reset --hard backup-pre-reset-2026-05-17
git push --force-with-lease origin main   # /!\ requiert confirmation explicite utilisateur
```

La branche `backup-pre-reset-2026-05-17` reste protégée tant que
l'utilisateur ne la supprime pas explicitement.

---

## Prompt pour la session suivante (session 1 — première session de redev)

> ## Contexte
>
> Repo : `/home/user/maintenantproto1` (ou ton clone local). Branche
> `main`, juste après le reset complet du 2026-05-17. Le repo contient
> uniquement la charte graphique (tokens CSS, icônes SVG) + un
> scaffold Vite/React/TS minimal. Tout le reste a été supprimé. La
> version pré-reset est récupérable via la branche
> `backup-pre-reset-2026-05-17`.
>
> **Lire intégralement, dans cet ordre, avant toute action** :
> 1. `CLAUDE.md` — les 6 règles dures (ne pas inventer de wording,
>    toujours demander avant de coder, options expliquées sans
>    jargon, validation par capture avant code, mémorisation +
>    plan de code, récursivité de session).
> 2. `HANDOFF.md` — workflow complet de session (étapes A → F),
>    section « Décisions validées », état du repo.
>
> ## Objectif de cette session
>
> **Étape A du workflow uniquement** : recueillir, en langage
> naturel, la description du site que l'utilisateur a en tête.
>
> - Aucune ligne de code applicatif n'est écrite.
> - Aucune architecture technique n'est proposée à ce stade.
> - Aucun choix de backend / framework / library n'est fait.
> - Aucune dépendance NPM n'est ajoutée.
>
> Claude pose des questions ouvertes, courtes, une à la fois (ou en
> petit lot via `AskUserQuestion`). Chaque question vise à clarifier
> un des 6 axes :
>
> 1. **Personae** — qui visite le site ? (curieux·se, militant·e,
>    journaliste, adhérent·e, donateur·rice…).
> 2. **Intentions** — que viennent-ils faire ? (s'informer, signer,
>    adhérer, organiser, échanger un service, etc.).
> 3. **Pages indispensables** — la liste minimale pour la v1.
> 4. **Ton éditorial** — militant, sobre, joyeux, combatif…
> 5. **Valeurs visuelles** — transparence, inclusion, indépendance…
> 6. **Hors-scope explicite** — modules qu'on N'inclut PAS dans la v1.
>
> En fin de session, Claude résume en français ce qu'il a compris
> (sans inventer ni étoffer), l'utilisateur valide ou corrige, puis
> Claude écrit dans `HANDOFF.md` la description validée sous une
> section dédiée « Description site v1 — validée le YYYY-MM-DD ».
>
> ## Process
>
> - Branche imposée par l'harness (ou `feat/session-1-description`
>   si pas d'imposition).
> - Aucun code applicatif. Modifications de `HANDOFF.md`
>   uniquement (pour mémoriser les réponses validées).
> - Commit Conventional Commits : `docs(handoff): session 1 —
>   description site v1 validée`.
> - PR vers `main`, draft. **Pas d'auto-merge** : l'utilisateur
>   merge lui-même quand le résumé lui convient.
>
> ## Règles dures à respecter
>
> Voir `CLAUDE.md §Les 6 règles dures`. En particulier pour cette
> session :
>
> - **Ne pas inventer de wording.** Si l'utilisateur n'a pas dit
>   « notre slogan c'est X », Claude ne propose pas de slogan. Au
>   maximum, Claude demande « as-tu un slogan en tête ou on laisse
>   un TODO_WORDING ? ».
> - **Ne pas proposer d'architecture technique** (Supabase, Stripe,
>   Notion, etc.). Cette session est purement produit.
> - **Toujours demander** avant de faire la moindre action de fond.
>
> ## Clôture (règle de récursivité)
>
> À la **fin de cette session**, après le merge de la PR de mémo
> de description :
>
> 1. Écrire le prompt pour la **session 2** dans `HANDOFF.md`
>    sous la section « Prompt pour la session suivante ».
> 2. Recopier ce même prompt dans la **dernière réponse de chat**
>    de la session.
> 3. Inclure dans ce prompt session 2 cette même consigne de
>    récursivité pour la session 3 (et ainsi de suite).
>
> Le prompt session 2 portera sur l'**Étape B du workflow** :
> proposer 2 à 4 options expliquées sans jargon sur les grands
> choix d'architecture, à partir de la description validée en
> session 1.
