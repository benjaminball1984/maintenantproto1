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

- `web/src/pages/**` — 62 pages métier.
- `web/src/components/**` (sauf `icons.tsx`) — Auth, Footer, Modals,
  Toast, Skeletons, Breadcrumbs, Empty states, etc.
- `web/src/hooks/**` — ~25 hooks de data fetching.
- `web/src/lib/**` — auth, transparency, social, messaging, notifications,
  pétitions, mobilisations, services, etc.
- `web/src/layouts/RootLayout.tsx` — header + nav + footer.
- `web/src/router.tsx`.
- `web/src/types/database.ts` — types Supabase générés.
- `web/src/test/`, `web/e2e/`, `web/playwright.config.ts`,
  `web/load/` — tests unitaires + E2E + load tests.
- `db/schema.sql`, `db/gen-types.mjs` — schéma DB Postgres avec RLS,
  RPC, triggers.
- `supabase/functions/**` — Edge Functions (create-checkout-session,
  stripe-webhook).
- `docs/MODERATION.md`, `docs/PROD-RUNBOOK.md`, `docs/USER-GUIDE.md`,
  `docs/REVUE-EXHAUSTIVE/` — documentation projet.
- `HANDOFF-PROGRESS.md` (~900k lignes d'historique d'avancement),
  `CLAUDE.md` (instructions process pré-reset), `CHANGES-A-FAIRE.md`,
  `PLAN-VISIBLE-FIRST.md`, `PUSH-INSTRUCTIONS.md`, `SKILL.md`.

---

## Protocole pour la prochaine session

L'utilisateur veut **piloter le redev** sans coder, et sans laisser
Claude partir dans tous les sens. Le déroulé strict :

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

### Étape B — Architecture proposée par Claude (langage naturel + diagramme)

À partir de la description validée à l'étape A, Claude rédige :

1. Une **arborescence de pages** plate (max 1 page = 1 URL).
2. Une **liste de composants** réutilisables identifiés (hero, card,
   bouton CTA, formulaire, etc.).
3. Un **modèle de données minimal** (quelles tables, quels champs, sans
   SQL pour l'instant).
4. Une **liste de dépendances externes** nécessaires (Supabase pour la
   DB ? Stripe pour les paiements ? Resend pour la newsletter ?).

L'utilisateur valide ou rejette chaque point.

### Étape C — Captures de validation visuelle

**Avant d'écrire la moindre ligne de code applicatif**, Claude
construit des **maquettes (wireframes simples ou captures d'écran d'un
prototype HTML statique)** pour chaque page-clé. L'utilisateur valide
le rendu sur la base de la charte graphique conservée.

Si la maquette ne convient pas, on itère **sur la maquette uniquement**,
jamais sur du code React déjà branché.

### Étape D — Plan de codage par étapes

Une fois l'architecture et les maquettes validées, Claude rédige un
**plan d'étapes atomiques**, où chaque étape :

- correspond à **une seule fonctionnalité observable** (ex. : « créer
  la page Home statique » ou « ajouter le formulaire d'inscription
  newsletter ») ;
- tient dans **une seule PR** ;
- inclut un **critère de validation visuel** (capture d'écran montrée à
  l'utilisateur avant merge) ;
- liste explicitement ce qu'elle **N'inclut PAS** (anti-scope-creep).

L'utilisateur valide le plan d'ensemble. À partir de là, le codage peut
commencer, **une étape à la fois**, avec capture-avant-merge.

---

## Règles dures pour Claude (à respecter sans exception)

1. **Ne code rien dans la session « description ».** Cette session sert
   à comprendre, valider, planifier. Pas à pisser du JSX.
2. **Ne propose pas d'architecture technique tant que le besoin
   utilisateur n'est pas verbalisé et validé.** L'ordre est :
   utilisateur → besoin → archi → maquette → code. Jamais l'inverse.
3. **Une seule décision = une seule PR.** Plus jamais de PR à 20 fichiers
   modifiés mélangeant wording + nav + DB + suppression de pages.
4. **Capture avant merge.** Tout changement visuel passe par une
   capture (Playwright headless ou screenshot manuel) validée par
   l'utilisateur avant qu'il fusionne la PR.
5. **Pas d'auto-merge.** L'utilisateur merge lui-même quand il a vu et
   validé. Claude ouvre la PR en draft + commente avec la capture.
6. **Pas de migration DB sans confirmation explicite.** Toute table /
   RPC / RLS nouvelle se discute avant. La DB n'est ajoutée que quand
   un besoin la justifie clairement.
7. **Pas de dépendance NPM nouvelle sans justification.** Chaque nouvelle
   ligne dans `package.json` doit être nommée + justifiée dans le body
   de la PR.
8. **Pas de fichier .md d'historique cumulatif.** L'ancien
   `HANDOFF-PROGRESS.md` faisait ~900k lignes — illisible, source de
   confusion. À la place : un fichier `HANDOFF.md` court (celui-ci),
   réécrit à chaque jalon majeur, qui décrit **l'état actuel** (pas
   l'historique). L'historique est dans `git log`.

---

## Restaurer l'ancien projet (si l'utilisateur change d'avis)

```bash
# Récupérer la version d'avant le reset (un commit avant le wipe)
git fetch origin backup-pre-reset-2026-05-17
git checkout backup-pre-reset-2026-05-17

# Si on veut la pousser sur main (annule le reset complet)
git checkout main
git reset --hard backup-pre-reset-2026-05-17
git push --force-with-lease origin main   # /!\ requiert confirmation explicite utilisateur
```

La branche `backup-pre-reset-2026-05-17` reste protégée tant que
l'utilisateur ne la supprime pas explicitement.
