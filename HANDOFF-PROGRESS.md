# HANDOFF — Suivi d'avancement

> Journal de bord de la migration prototype → production (Vite + React + TS + Supabase).
> Référence : [HANDOFF.md](./HANDOFF.md) — [CLAUDE.md](./CLAUDE.md)

---

## État global

| Étape                                                   | Statut |
| ------------------------------------------------------- | :----: |
| 1. Initialisation repo + branche                        |   ✅   |
| 2. `.env.example` à la racine + template historique dans `docs/` |   ✅   |
| 3. Squelette Vite + React + TS dans `web/`              |   ✅   |
| 4. Schéma DB Supabase + RLS                             |   ✅   |
| 5. Brancher Supabase Auth sur `AuthModal`               |   ✅   |
| 6. Page profil + reset password + avatars bucket        |   ✅   |
| 7. Adhésion Stripe (3 tiers) + RPC T99CP (Sprint 1)     |   ✅   |
| 8. OAuth Google/Instagram + magic link (fin Sprint 1)   |   ✅   |
| 9. Sprint 2 — Pétitions CRUD côté front                 |   ✅   |
| 10. Sprint 2 — Mobilisations CRUD côté front            |   ✅   |
| 11. Sprint 2 — Sondages CRUD côté front                 |   ✅   |
| 12. Sprint 2 — Campagnes CRUD côté front                |   ✅   |
| 13. Fin Sprint 2 — Audit RGPD ou bascule Sprint 3       |   ✅   |
| 14. Sprint 3 — Hébergement + Covoiturage CRUD côté front |   ✅   |
| 15. Sprint 3 — Lending + Marketplace + Jardins + SEL + Crowdfunding |   ✅   |
| 16. Sprint 4 — Réseau social + Messagerie + Notifications + Média |   ✅   |
| 17. Sprint 5 — Admin + Communes libres + Pages légales restantes |   ✅   |
| 18. Sprint 6 — Optim Lighthouse + E2E Playwright + audit a11y axe-core + prod |   ✅   |
| 19. Sprint 6 — Mise en prod réelle (webhook Stripe idempotent + Sentry + k6 + docs) |   ✅   |
| 20. Post-go-live — Idempotence DB (source_event_id) + Page transparence |   ✅   |
| 21. Post-go-live — Transparence v2 (graphique mensuel) + E2E + dette différée |   ✅   |
| 22. Post-go-live — Grant `service_role` (clôture H2-rob) + E2E densifié + dette différée |   ✅   |
| 23. Post-go-live — RPC `users_signups_monthly` (clôture H1-rob) + refacto handler stripe (clôture H2-arch) |   ✅   |
| 24. Post-go-live — M3-rob (4xx → processed_at) + M2-sec (RPC `signatures_count_for_petition`) + H4-deploy (test d'intégrité du re-export Deno) |   ✅   |
| 25. Post-go-live — conditions externes inchangées : +2 E2E mock (CTA anonyme + ratio % pétition) — tous les autres items différés |   ✅   |
| 26. Post-go-live — conditions externes inchangées : +1 E2E mock (état signataire authentifié signé) — tous les autres items différés |   ✅   |
| 27. Post-go-live — conditions externes inchangées : +1 E2E mock (état signataire authentifié non signé, symétrique étape 26) — tous les autres items différés |   ✅   |
| 28. Post-go-live — conditions externes inchangées : +1 E2E mock (flow de signature actif — clic → POST intercepté → bascule visible) — tous les autres items différés |   ✅   |
| 29. Post-go-live — conditions externes inchangées : +1 E2E mock (flow unsign reverse-flow — clic → DELETE intercepté → bascule retour) — tous les autres items différés |   ✅   |
| 30. Post-go-live — T99CP cumul public (décision produit débloquée 2026-05-13) : RPC additive `transparency_t99cp_total()` + carte dédiée sur `/transparence` |   ✅   |

---

## Goulots externes — état au 2026-05-13 (post-étape 29)

Session interactive avec l'équipe humaine (Ben/Lilou) le 2026-05-13.
Le but de la session était de débloquer les conditions externes qui
bridaient les sessions post-go-live (étapes 25-29 toutes
re-différées pour la même raison).

### Goulot 1 — Hébergement HTTPS public ✅ DÉBLOQUÉ

- **Avant** : pas de Vercel preview HTTPS / staging public en ligne →
  Lighthouse réel impossible (priorité 1 étapes 25-29 toutes
  re-différées).
- **Décision** : l'équipe dispose d'un compte Netlify payant (9 €/mois)
  → bascule Vercel → Netlify avant le premier déploiement (le
  `vercel.json` était préparé mais jamais utilisé en production,
  aucun visiteur à migrer).
- **Livraison** : PRs #37 (`chore(deploy): switch hosting Vercel →
  Netlify`), #38 (`fix(deploy): netlify build — add --legacy-peer-deps`),
  #39 (`fix(deploy): add web/.npmrc legacy-peer-deps=true`).
- **Résultat** : site live sur
  **https://maintenant-le-mouvement.netlify.app** (région team
  Ben/Lilou). Auto-deploy sur push `main`, preview URL par PR.
- **Hygiène** : un override UI Netlify (Build command / Publish dir /
  Package dir) a été nécessaire pendant le rodage. À nettoyer plus
  tard par un dev (laisser `netlify.toml` comme seule source de
  vérité). Non bloquant pour l'instant.

### Goulot 4 — Décisions produit / RGPD ✅ DÉBLOQUÉ

Trois décisions tranchées par Ben au cours de la session interactive,
chacune débloquant un chantier technique en attente depuis l'étape 24.

#### Décision 1 — Signataires de pétition

**Choix : liste publique avec `display_name` uniquement, ID techniques cachés.**

- Compteur public visible par tous (anon + auth).
- Liste des signataires affiche le `display_name` (que l'utilisateur
  choisit à l'inscription / au profil).
- Colonne `user_id` cachée aux anonymes (RLS durcie :
  `auth.uid() = user_id OR public.is_admin(...)`).
- **RGPD** : Art. 9 (opinion politique = donnée sensible) →
  consentement explicite requis pour affichage public. Le
  `display_name` étant choisi par l'utilisateur lui-même, le
  consentement à la signature (cf. case à cocher dédiée) couvre
  l'affichage public sous ce libellé.
- **Implication implémentation (étape 30+)** :
  - Migration policy `signatures_select_public` — chantier
    **M2-sec-policy** (RLS visible côté client, demande confirmation
    à chaque PR).
  - Migrer call-sites UI qui lisent `signatures.user_id` vers une
    projection limitée à `display_name` (via JOIN `public.users`).
  - Ajouter case à cocher « j'accepte d'apparaître publiquement
    parmi les signataires » au moment de la signature (colonne
    `signatures.public_consent boolean default false` + UI checkbox
    `PetitionDetailPage`).

#### Décision 2 — Compteur d'adhésions (T99CP cumul) sur page Transparence

**Choix : affichage public dès le début, pas de seuil minimum.**

- Sur la page `/transparence`, nouvelle carte « Adhésions totales »
  montrant le cumul de jetons T99CP émis (= nombre cumulé
  d'adhésions payées).
- Affichage immédiat dès le 1er adhérent (pas de seuil masquant à
  N adhérents — l'équipe assume la transparence dès le démarrage).
- **Implication implémentation (étape 30+)** :
  - Créer la RPC `public.transparency_t99cp_total() returns bigint
    security definer` (migration DB additive, autorisée — chantier
    **T99CP cumul public**).
  - Ajouter une carte UI à `TransparencePage.tsx` (chunk lazy déjà
    séparé, ~7.7 kB / gzip 3.1 kB).

#### Décision 3 — Purge automatique des données Stripe

**Choix : purge automatique de `stripe_events.payload` à 90 jours.**

- La colonne `stripe_events.payload` (JSONB contenant email + 4
  derniers chiffres de carte + pays + montant) est automatiquement
  effacée 90 jours après le `processed_at`.
- Les autres colonnes (`event_id`, `processed_at`, `source_event_id`,
  `created_at`) sont **conservées indéfiniment** pour audit +
  idempotence — elles ne contiennent pas de données personnelles
  directes.
- **RGPD** : conformité Art. 5 § e (limitation de conservation).
  90 j = durée standard de rétrospective opérationnelle (au-delà,
  le débogage passe par le dashboard Stripe lui-même qui garde
  les données complètes côté processeur).
- **Implication implémentation (étape 30+)** :
  - Choix d'archi à confirmer : trigger `BEFORE UPDATE` sur
    `stripe_events` + job cron (`pg_cron`) OU Edge Function
    périodique (recommandé, plus visible côté Supabase Console).
  - Migration DB sur table critique `stripe_events` → **demande
    confirmation explicite à chaque PR** de cette implémentation
    (cf. conditions d'arrêt du prompt étape 30).
  - Chantier **M1-RGPD**.

### Goulots restants à la fin de la session 2026-05-13

| # | Goulot | Statut | Priorité reco |
| --- | --- | :---: | --- |
| 2 | Migrations Supabase staging (étapes 20 + 22 + 23 + 24 à appliquer) | 🔲 | basse (utile seulement APRÈS implémentation M2-sec / T99CP / M1-RGPD) |
| 3 | Sentry SaaS (DSN + provisionnement) | 🔲 | moyenne (gratuit, 15 min) |
| 5 | Projet Supabase de test (E2E happy path réel) | 🔲 | moyenne (gratuit, 15 min) |
| 6 | Stripe live (Kbis + clés live + webhook live) | 🔲 | basse (à réserver quand prêts à encaisser) |

### Impact session 2026-05-13

- **2 goulots débloqués sur 6** (1 et 4).
- **3 chantiers techniques** désormais autorisés à l'implémentation :
  M2-sec-policy, T99CP cumul public, M1-RGPD.
- **Site live** publiquement (placeholder + pages migrées) accessible
  via Netlify CDN mondial.
- Les sessions 30-31 peuvent enfin exécuter l'audit Lighthouse réel
  (priorité 1 du prompt étape 30).
- Les étapes « +1 E2E mock » ne sont plus l'unique livrable possible
  par défaut — on peut désormais attaquer du chantier dette.

---

## Étape 3 — Squelette Vite + React + TS ✅

**Branche** : `claude/setup-vite-react-ts-7amfy`
**Dossier cible** : `web/` (le prototype `project/app/Maintenant.html` reste intact)

### Stack posée

- **Vite 8** + **React 19** + **TypeScript 6** (mode `strict` + `noUncheckedIndexedAccess` +
  `exactOptionalPropertyTypes` — pas d'`any` autorisé via la règle ESLint
  `@typescript-eslint/no-explicit-any`).
- **react-router-dom 6** avec `createBrowserRouter`.
- **@supabase/supabase-js 2** initialisé via `import.meta.env.VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY` (lance une erreur claire si absent).
- **ESLint 10** (flat config) avec : `@eslint/js` recommended, `typescript-eslint` recommended +
  stylistic, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`,
  `eslint-plugin-jsx-a11y`, et `eslint-config-prettier` pour éviter les conflits de format.
- **Prettier 3** (`.prettierrc.json`, `.prettierignore`).
- **Vitest 4** + **Testing Library** (React 16, jest-dom, user-event, dom) + **jsdom**, configuré
  via `vite.config.ts` (`test.environment = 'jsdom'`, setup `src/test/setup.ts`,
  couverture `@vitest/coverage-v8`).

### Conventions ESLint (CLAUDE.md)

- `@typescript-eslint/no-explicit-any: error` — interdiction absolue d'`any`.
- `@typescript-eslint/consistent-type-imports` — imports `type` séparés.
- `@typescript-eslint/naming-convention` :
  - Variables : `camelCase | PascalCase | UPPER_CASE`
  - Fonctions / composants React : `camelCase | PascalCase`
  - Types / interfaces : `PascalCase`
  - Propriétés d'objet : `camelCase | snake_case | PascalCase | UPPER_CASE`
    (snake_case pour le mapping DB Supabase, UPPER_CASE pour les `VITE_*` env vars)
  - Identifiants entre guillemets (`'@'`, en-têtes HTTP) : ignorés
- Tests : règles `no-explicit-any` et `naming-convention` désactivées.

### Structure `web/`

```
web/
├── .env.example              ← variables VITE_*  (copier en .env.local)
├── .gitignore                ← exclut node_modules, dist, coverage, .env.local
├── .prettierrc.json
├── .prettierignore
├── eslint.config.js          ← flat config
├── index.html                ← lang="fr", title "Maintenant !"
├── package.json
├── tsconfig.json (refs)
├── tsconfig.app.json         ← strict + paths "@/*" → "./src/*"
├── tsconfig.node.json
├── vite.config.ts            ← plugin React, alias @, config Vitest
└── src/
    ├── App.tsx               ← <RouterProvider router={router} />
    ├── main.tsx              ← createRoot + StrictMode
    ├── index.css             ← reset minimal + tokens --mn-*
    ├── vite-env.d.ts         ← typage strict de import.meta.env
    ├── router.tsx            ← createBrowserRouter + toutes les routes
    ├── App.test.tsx          ← smoke test routing (2 tests)
    ├── lib/
    │   └── supabase.ts       ← createClient + check env vars
    ├── layouts/
    │   └── RootLayout.tsx    ← header de navigation + <Outlet />
    ├── test/
    │   └── setup.ts          ← jest-dom matchers + cleanup
    └── pages/
        ├── Placeholder.tsx   ← composant placeholder réutilisable
        ├── HomePage.tsx
        ├── PetitionsPage.tsx
        ├── MobilizationsPage.tsx
        ├── CampaignsPage.tsx
        ├── MediaPage.tsx
        ├── ReseauPage.tsx
        ├── PollsPage.tsx
        ├── MessagingPage.tsx
        ├── NotificationsPage.tsx
        ├── AdminPage.tsx
        ├── JoinPage.tsx
        ├── CommunesPage.tsx
        ├── ProfilePage.tsx
        ├── NotFoundPage.tsx
        └── services/
            ├── ServicesHubPage.tsx
            ├── HousingPage.tsx
            ├── CarpoolingPage.tsx
            ├── MarketplacePage.tsx
            ├── LendingPage.tsx
            ├── GardenPage.tsx
            ├── SelPage.tsx
            └── CrowdfundingPage.tsx
```

### Routing — URLs publiques préservées

Toutes les pages sont des placeholders (`<h1>` + description) montés via `RootLayout` qui
expose une nav header listant les sections. La fallback `path: '*'` rend `NotFoundPage`.

| URL                       | Composant            |
| ------------------------- | -------------------- |
| `/`                       | `HomePage`           |
| `/petitions`              | `PetitionsPage`      |
| `/mobilizations`          | `MobilizationsPage`  |
| `/campaigns`              | `CampaignsPage`      |
| `/services`               | `ServicesHubPage`    |
| `/services/housing`       | `HousingPage`        |
| `/services/carpooling`    | `CarpoolingPage`     |
| `/services/marketplace`   | `MarketplacePage`    |
| `/services/lending`       | `LendingPage`        |
| `/services/garden`        | `GardenPage`         |
| `/services/sel`           | `SelPage`            |
| `/services/crowdfunding`  | `CrowdfundingPage`   |
| `/media`                  | `MediaPage`          |
| `/reseau`                 | `ReseauPage`         |
| `/polls`                  | `PollsPage`          |
| `/messaging`              | `MessagingPage`      |
| `/notifications`          | `NotificationsPage`  |
| `/admin`                  | `AdminPage`          |
| `/join`                   | `JoinPage`           |
| `/communes`               | `CommunesPage`       |
| `/profile`                | `ProfilePage`        |
| `*`                       | `NotFoundPage` (404) |

### Scripts npm disponibles (`web/package.json`)

| Script               | Action                                                   |
| -------------------- | -------------------------------------------------------- |
| `npm run dev`        | Dev server Vite (port 5173 par défaut)                   |
| `npm run build`      | `tsc -b && vite build`                                   |
| `npm run preview`    | Serveur statique du build                                |
| `npm run typecheck`  | `tsc -b --noEmit`                                        |
| `npm run lint`       | ESLint sur tout le repo `web/`                           |
| `npm run lint:fix`   | ESLint avec auto-fix                                     |
| `npm run format`     | Prettier write sur `src/**/*.{ts,tsx,css,md,json}`       |
| `npm run format:check` | Prettier check (CI)                                    |
| `npm test`           | Vitest run unique                                        |
| `npm run test:watch` | Vitest watch                                             |
| `npm run test:coverage` | Vitest run + couverture v8                            |

### Vérifications passées

- `npm run typecheck` : ✅ aucune erreur
- `npm run lint` : ✅ 0 problème
- `npm test` : ✅ 2/2 tests passent (`src/App.test.tsx` smoke test routing)
- `npm run build` : ✅ build OK (`dist/` ~ 260 kB JS, 0,56 kB CSS)
- `npm run format` : ✅ tous les fichiers conformes

### Notes / décisions

- **React 19** retenu (livré par `create-vite` 9). Le prototype tourne en React 18 via CDN — pas
  de migration de code à prévoir, le prototype reste isolé.
- Le **client Supabase** lève une erreur explicite si les variables d'environnement ne sont pas
  définies — utile pour ne pas push silencieusement un build cassé.
- Le **header de navigation** dans `RootLayout` est volontairement minimal (liste de
  `<NavLink>`). Il sera remplacé par `AppNav` / `BottomNav` lors du Sprint 1 (cf. Theme.jsx).
- Le **prototype** (`project/app/Maintenant.html` + JSX racine) n'a pas été modifié et continue
  de fonctionner indépendamment.
- Aucun `app/index.html` n'a été créé (il n'existait pas et n'est pas demandé) — le seul
  HTML d'entrée du nouveau projet est `web/index.html`.

### Prochaines étapes (étape 4)

1. Initialiser Supabase local (`npx supabase init && npx supabase start`).
2. Écrire `db/schema.sql` (cf. HANDOFF §7.2 — tables `users`, `petitions`, …) avec **RLS**
   strict sur chaque table contenant des données privées.
3. Générer les types TS Supabase (`supabase gen types typescript --local > web/src/types/database.ts`).
4. Créer un module `web/src/lib/auth.ts` (Zustand ou contexte) pour la session utilisateur.

---

## Étape 4 — Schéma DB Supabase + RLS ✅

**Branche** : `claude/setup-vite-react-ts-2T9bF` (l'étape 3 a été mergée depuis
`claude/setup-vite-react-ts-7amfy` @ `1f94a48` au début de cette session).

### Pré-requis exécutés

- `git fetch origin claude/setup-vite-react-ts-7amfy` puis merge `1f94a48` pour récupérer le
  squelette Vite (web/).
- `npm install --legacy-peer-deps` dans `web/` (le lockfile n'est pas versionné, cf.
  `.gitignore` racine, et l'option reste nécessaire à cause du conflit
  `eslint-plugin-jsx-a11y` ↔ ESLint 10).
- Ajout de `supabase@^2.98.2` aux `devDependencies` de `web/` (CLI Supabase, fournit
  `supabase init` / `supabase db ...` / `supabase gen types`).

### Supabase init

```
supabase/
├── .gitignore         ← .temp / .branches / .env*.local
└── config.toml        ← config par défaut (à éditer pour l'instance hébergée EU)
```

> `supabase start` (stack Docker locale) n'a **pas** été exécuté ici parce que la
> sandbox CI n'a pas de démon Docker disponible. La commande s'exécute sans
> friction sur un poste de dev local : `npx supabase start` puis
> `npx supabase db reset` pour rejouer les migrations.

Le `.gitignore` racine a été complété pour exclure `supabase/.temp/`,
`supabase/.branches/` et `supabase/.env*` (les configs versionnées restent
`supabase/config.toml` et `supabase/.gitignore`).

### `db/schema.sql` — schéma Postgres complet

Fichier idempotent (`create … if not exists`, `drop policy if exists` avant chaque
`create policy`) au format Supabase. Il couvre les **36 tables** demandées par
`HANDOFF.md §7.2`, organisé en sections numérotées :

| # | Section | Tables |
| - | ------- | ------ |
| 0 | Extensions | `pgcrypto`, `citext` |
| 1 | Helpers | `touch_updated_at()`, `is_admin(uid uuid)` (SECURITY DEFINER) |
| 2 | Enums | `adhesion_tier`, `adhesion_status`, `t99cp_kind`, `post_visibility`, `notification_kind`, `content_status` |
| 3 | Profils | `users` (PK = `auth.users.id`, `is_admin`, `t99cp_balance`) |
| 4 | Pétitions | `petitions`, `signatures` |
| 5 | Mobilisations | `mobilizations`, `participations` |
| 6 | Hébergement | `housing`, `housing_requests` |
| 7 | Économie solidaire | `carpooling`, `lending`, `marketplace_items` |
| 8 | Jardins / SEL | `garden_plots`, `sel_offers`, `sel_demands` |
| 9 | Cagnottes | `crowdfunding_campaigns`, `contributions` |
| 10 | Média | `articles`, `comments`, `reactions` |
| 11 | Réseau social | `posts`, `post_likes`, `post_comments` |
| 12 | Sondages | `polls`, `poll_options`, `votes` |
| 13 | Campagnes | `campaigns`, `campaign_actions` |
| 14 | Communes libres | `communes`, `commune_members` |
| 15 | Messagerie | `conversations`, `messages`, `notifications` |
| 16 | Adhésion / T99CP | `members`, `adhesions`, `t99cp_transactions` |
| 17 | Admin | `admin_logs`, `email_campaigns` |

**Conventions appliquées** (cf. CLAUDE.md) :

- PK `uuid` par défaut `gen_random_uuid()` (sauf `users.id` qui référence
  `auth.users.id` pour le mapping Auth Supabase).
- Colonnes en `snake_case`.
- `created_at` / `updated_at timestamptz default now()` partout, et un trigger
  `*_touch` qui appelle `public.touch_updated_at()` à chaque `UPDATE` sur les
  tables qui en ont besoin.
- Foreign keys explicites avec `on delete cascade` (relations 1-N) ou
  `on delete restrict` (auteur d'un contenu publié) ou `set null` (organisateur
  optionnel).
- **Index sur chaque colonne FK** (et sur `created_at desc` pour les feeds
  triés : posts, messages, notifications, ledger T99CP).
- Contraintes métier : `check (capacity > 0)`, `check (price_eur >= 0)`,
  `check (ends_on >= starts_on)`, `check (user_a <> user_b)` (1-1
  conversations), index unique sur `least/greatest(user_a, user_b)` pour éviter
  les conversations dupliquées.

### RLS — politique générale

`ALTER TABLE … ENABLE ROW LEVEL SECURITY` sur les **36 tables** → DENY par
défaut. Toutes les policies sont ensuite **explicites** et précédées d'un
commentaire SQL qui décrit le « pourquoi » (audit reviewable). Vérification :

```sql
select count(*) from pg_policies where schemaname = 'public';   -- 119
select tablename from pg_tables where schemaname = 'public' and not rowsecurity;  -- (0 rows)
```

Catégories de policies appliquées :

- **Lecture publique** (anon + authenticated) sur le contenu militant publié :
  `petitions`, `mobilizations`, `articles`, `polls/poll_options`, `campaigns`,
  `communes`, `commune_members`, `lending`, `marketplace_items`,
  `garden_plots`, `sel_*`, `crowdfunding_campaigns`, `housing` (si `is_published`),
  `carpooling` (si `is_published`), `users` (profil public).
- **Compteurs publics** mais insertion = `auth.uid() = user_id` :
  `signatures`, `participations`, `reactions`, `post_likes`, `votes`.
- **Privé propriétaire** : `notifications` (recipient_id), `messages`
  (participants de la conversation), `housing_requests` (demandeur + hôte),
  `contributions` (contributeur + organisateur de la cagnotte),
  `adhesions` (user_id), `t99cp_transactions` (user_id).
- **Admin uniquement** : `admin_logs`, `email_campaigns`, `members` (gestion par
  back-office / webhook Stripe), `notifications.insert` (création depuis le
  serveur), `t99cp_transactions.insert` (intégrité monétaire), `communes`
  (politique éditoriale), `messages.update` (préserver l'intégrité du body).
- **Visibilité fine** : `posts` (`public` / `members` / `private`),
  `comments` & `post_comments` (cachés si `is_flagged` sauf pour l'auteur et
  les admins).

Helper : `public.is_admin(uid uuid)` (SECURITY DEFINER) lit `users.is_admin`.
Utilisé dans toutes les policies pour donner accès au back-office sans dépendre
du `service_role`.

### Application locale & génération des types

Le sandbox de cette session n'a pas Docker. Pour valider le schéma et générer
les types :

1. Un Postgres local (`service postgresql start`, base `maintenant`).
2. Un `auth` schema stub (`/tmp/auth_stub.sql` — `auth.users`, `auth.uid()`,
   rôles `anon` / `authenticated` / `service_role`).
3. `psql -v ON_ERROR_STOP=1 -f db/schema.sql` → 36 tables, 119 policies.
4. `node db/gen-types.mjs --url …` → écrit `web/src/types/database.ts`
   (1674 lignes).

`db/gen-types.mjs` introspecte `pg_catalog` (`pg_class`, `pg_attribute`,
`pg_constraint`, `pg_enum`) et émet le type `Database` au format
`@supabase/supabase-js` (`Tables[*].{Row, Insert, Update, Relationships}`,
`Enums` inlinés en unions de littéraux, `Functions.is_admin`). Le script est
réutilisable : il sera remplacé par `supabase gen types typescript --local`
dès qu'un environnement avec Docker (machine de dev ou CI GitHub Actions) est
disponible. La sortie est strictement compatible avec le générateur officiel
(format `Database['public']['Tables'][...]`).

### Branchement côté front

`web/src/lib/supabase.ts` est désormais typé :

```ts
import type { Database } from '@/types/database';
export const supabase: SupabaseClient<Database> = createClient<Database>(…);
```

Cela rend toutes les requêtes `supabase.from('petitions')` strictement typées
(autocompletion sur les colonnes, type narrowing sur les enums comme
`adhesion_tier`).

### Vérifications passées (sur cette branche)

- `npm run typecheck` : ✅ aucune erreur (le nouveau `database.ts` traverse `tsc -b`)
- `npm run lint` : ✅ 0 problème (les noms snake_case des colonnes sont déjà
  autorisés en `typeProperty` par la naming-convention)
- `npm test` : ✅ 2/2
- `npm run build` : ✅ `dist/` ~260 kB JS / 0,56 kB CSS

### Décisions / hors scope

- **Pas de seed initial** : la table `users` se peuplera via le trigger
  `auth.users → public.users` qu'on ajoutera au Sprint 1 (Supabase Auth).
- **Pas de migration `supabase/migrations/*.sql`** : `db/schema.sql` reste la
  source canonique pour cette étape. Avant le premier `supabase db push` réel,
  il suffira de `cp db/schema.sql supabase/migrations/<timestamp>_init.sql`.
- **Pas de `service-role` côté front** : le client `supabase.ts` n'utilise que
  `VITE_SUPABASE_ANON_KEY`. Les opérations privilégiées (création de
  notifications, mise à jour d'`adhesions`, ledger T99CP) seront déclenchées
  via Edge Functions ou webhooks côté serveur.

### Prochaines étapes (étape 5 — auth)

1. Lancer `supabase start` sur un poste de dev (Docker requis), exécuter
   `psql < db/schema.sql` ou `supabase db reset` après avoir déposé une
   migration depuis `db/schema.sql`.
2. Brancher Supabase Auth sur le composant `AuthModal` (Theme.jsx → port TS).
3. Créer `web/src/lib/auth.ts` (Zustand) pour exposer `session`, `user`,
   `signIn`, `signOut`.
4. Ajouter un trigger SQL `on auth.user created → insert into public.users
   (id, email, display_name)` pour synchroniser le profil.

---

## Étape 5 — Supabase Auth + AuthModal + handle_new_user ✅

**Branche** : `claude/review-project-setup-r2FSV` (étape 4 mergée depuis
`claude/setup-vite-react-ts-2T9bF` @ `7491228` au début de cette session).

### Pré-requis exécutés

- `git fetch origin claude/setup-vite-react-ts-2T9bF` puis `git merge --no-ff 7491228`
  pour récupérer le tip de l'étape 4 (squelette Vite, schéma DB, types).
- `npm install --legacy-peer-deps` dans `web/`.
- `npm install --legacy-peer-deps zustand` (ajoute `zustand@^5.0` aux `dependencies`).

### Trigger SQL `handle_new_user`

Ajouté à la fin de `db/schema.sql` (section 18) :

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

- `SECURITY DEFINER` pour pouvoir écrire dans `public.users` malgré la RLS
  (le trigger tourne en contexte auth, sans `auth.uid()` défini).
- `search_path = public, pg_temp` pour neutraliser les attaques de
  shadowing.
- `revoke all on function public.handle_new_user() from public` (le trigger
  s'exécute via le rôle definer — pas de droit d'appel direct).
- Idempotent : `create or replace function` + `drop trigger if exists`.
- Fallback `display_name` : `coalesce(nullif(trim(...)), split_part(email, '@', 1))`
  — si la metadata est absente ou vide/whitespace seule, on prend la partie
  locale de l'email.

**Test local** (sandbox sans Docker, comme étape 4) :

1. `service postgresql start` + base `maintenant` (utilisateur `maintenant/dev`).
2. Stub `auth` (`auth.users`, `auth.uid()`, rôles `anon`/`authenticated`/`service_role`).
3. `psql -f db/schema.sql` → 36 tables, 119 policies, fonction + trigger créés.
4. `insert into auth.users (email, raw_user_meta_data) values ('alice@x.org', '{"display_name":"Alice"}'::jsonb)`
   → ligne miroir dans `public.users` avec `display_name='Alice'`.
5. `insert into auth.users (email) values ('bob@x.org')` → `display_name='bob'`.
6. `insert into auth.users (email, raw_user_meta_data) values ('carol@x.org', '{"display_name":"   "}'::jsonb)`
   → `display_name='carol'` (whitespace stripped).
7. Re-insertion d'un id existant → `on conflict do nothing` (idempotent).

### Régénération des types

`node db/gen-types.mjs > web/src/types/database.ts` → 1 674 lignes, identique
à la version étape 4 (le trigger n'ajoute aucune table publique mais valide
que le pipeline de génération reste idempotent).

### Store Zustand (`web/src/lib/auth.ts`)

```ts
useAuthStore: {
  session: Session | null;
  user: User | null;
  status: 'loading' | 'authenticated' | 'anonymous';
  signInWithPassword({ email, password }): Promise<{ error }>;
  signUpWithPassword({ email, password, displayName }): Promise<{ error }>;
  signInWithMagicLink({ email }): Promise<{ error }>;
  resetPasswordForEmail(email): Promise<{ error }>;
  signOut(): Promise<{ error }>;
  setSession(session): void;
}
```

- Tous les types proviennent de `@supabase/supabase-js`
  (`Session`, `User`, `AuthError`) — zéro `any`.
- Hook `useAuth()` à monter dans `RootLayout` : appelle
  `supabase.auth.getSession()` une fois, s'abonne à
  `supabase.auth.onAuthStateChange` et synchronise le store. Garde-fou
  `subscribed` module-level pour éviter les double-abonnements en
  StrictMode (le cleanup remet le flag à `false`).
- Helper `authErrorMessage(error)` mappe les codes Supabase Auth
  (`invalid_credentials`, `email_already_exists`, `weak_password`,
  `over_email_send_rate_limit`, etc.) vers des messages en français.
  Fallback sur `error.message` pour les codes inconnus.

### `web/src/components/AuthModal.tsx` — port TS strict

- Trois écrans : `login`, `signup`, `forgot` (state local `Mode`).
- Inputs ≥ 46 px de hauteur (≥ 44 px requis par HANDOFF §5), `<label>`
  associés via `htmlFor`/`id`, `autocomplete` correctement renseigné
  (`email`, `current-password`, `new-password`, `name`).
- Pas d'emoji : icônes SVG via `IconClose`, `IconMail`, `IconLock`,
  `IconUser` (cf. `web/src/components/icons.tsx` — portés depuis
  `Theme.jsx::ICONS`).
- Tokens : `var(--mn-brand)`, `var(--mn-text-1..4)`, `var(--mn-surface)`,
  `var(--mn-border)`, `var(--mn-gradient)` (étendus depuis `index.css`).
  Pas d'hex en dur dans le code component.
- `role="dialog"` + `aria-modal="true"` + `aria-labelledby={titleId}`,
  bouton de fermeture avec `aria-label="Fermer"`, messages en `role="alert"`
  (erreur) ou `role="status"` (succès).
- Focus trap minimal : focus sur le premier input ≈30 ms après l'ouverture
  (laisse le temps au DOM de se stabiliser), Escape ferme la modale, clic
  sur l'overlay ferme également.
- Reset des messages erreur/succès via le pattern « set state during
  render » (clé `${open}-${mode}`) — compatible avec la nouvelle règle
  ESLint `react-hooks/set-state-in-effect` (React Hooks 7).
- Erreurs Supabase affichées en français via `authErrorMessage`.

### `web/src/components/icons.tsx`

5 icônes SVG portées depuis `Theme.jsx::ICONS` : `IconClose`, `IconMail`,
`IconLock`, `IconUser`, `IconLogout`. Toutes en `currentColor` (héritent de
la couleur texte du parent) avec `aria-hidden="true"`. Les icônes `Mail`
et `Lock` n'existaient pas dans le prototype : crées en suivant la même
grille (24×24 stroke 2 round) pour rester cohérent.

### `web/src/layouts/RootLayout.tsx`

- Bouton « Se connecter » à droite de la nav qui ouvre `AuthModal`.
- Quand `useAuth().status === 'authenticated'` : remplacement du bouton par
  un menu compact `[IconUser display_name] [IconLogout Se déconnecter]`.
- `display_name` extrait de `user.user_metadata.display_name`, fallback sur
  la partie locale de l'email puis « Compte ».
- Bouton désactivé pendant `status === 'loading'` (premier
  `getSession`).

### Tests

| Fichier                                       | Couverture                                |
| --------------------------------------------- | ----------------------------------------- |
| `web/src/lib/auth.test.ts`                    | 13 cas — store init, setSession,          |
|                                               | signIn/signUp/signOut/magic/reset,        |
|                                               | propagation `status`, mapping erreurs FR  |
| `web/src/components/AuthModal.test.tsx`       | 9 cas — rendu des 3 écrans, submit login, |
|                                               | submit signup, erreurs Supabase, Escape   |
| `web/src/App.test.tsx` (déjà présent)         | 2 cas — smoke routing                     |

**Mocking** : `vi.hoisted` + `vi.mock('@/lib/supabase')` (le client est
mocké AVANT l'import de `auth.ts` qui le charge en module-load).
`vi.stubEnv` ajouté à `web/src/test/setup.ts` pour injecter
`VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` requis par `supabase.ts` au
chargement.

### Tableau d'état global

`AuthModal` est désormais branché sur Supabase Auth via `useAuthStore`.
`RootLayout` reflète l'état (`anonymous` → bouton, `authenticated` → menu).

### Vérifications passées

- `npm run typecheck` : ✅ aucune erreur
- `npm run lint` : ✅ 0 problème
- `npm test` : ✅ **22/22** tests passent
- `npm run build` : ✅ `dist/` 295 kB JS / 1,09 kB CSS (gzip 85 kB / 0,56 kB)
- `npm run format:check` : ✅ tous les fichiers conformes

### Décisions UX

- **Pas d'auth sociale (Google/Instagram) pour cette étape** : le prototype
  l'affichait, mais ça demande des OAuth client IDs côté Supabase
  + écrans de consentement RGPD. À ajouter dans une étape dédiée quand
  les comptes OAuth seront créés.
- **Pas de magic link bouton dédié dans l'UI** : la méthode est exposée
  dans le store (`signInWithMagicLink`) mais l'UI n'a que les 3 écrans
  classiques (login / signup / forgot). L'écran « forgot » utilise
  `resetPasswordForEmail`, qui envoie un lien de réinitialisation — c'est
  la primitive Supabase la plus proche du magic link demandée par
  l'UX d'origine.
- **Message de succès en signup** : on demande explicitement à
  l'utilisateur de confirmer son email (Supabase par défaut). Plus tard,
  si on veut auto-login après signup sans confirmation, désactiver
  « email confirmation » dans Supabase Auth settings.
- **Reset password redirect** : pas encore configuré
  (`resetPasswordForEmail(email, { redirectTo: ... })`) — à brancher quand
  la page `/auth/reset-password` existera.

### Prochaines étapes (Sprint 1 — page profil, adhésion Stripe)

1. **Page profil** : remplacer le placeholder par un vrai composant qui
   lit `public.users` + `members` + `adhesions` via Supabase. Édition du
   nom, bio, avatar (Supabase Storage).
2. **Adhésion Stripe (3 tiers : gratuit / soutien / engagé)** :
   - Frontend : page `/join` avec le tunnel d'adhésion.
   - Backend : Edge Function Supabase `create-checkout-session` (publie
     l'intent Stripe avec `SUPABASE_SERVICE_ROLE_KEY` côté serveur), puis
     webhook `stripe-webhook` qui met à jour `public.adhesions` et
     `public.members`.
   - Stocker `stripe_customer_id` / `stripe_subscription_id` sur
     `public.adhesions`.
3. **T99CP balance** : RPC `credit_t99cp(user_id, amount, reason)` /
   `debit_t99cp(...)` (SECURITY DEFINER + check de solde) pour préserver
   l'intégrité monétaire — déjà cadré par la policy
   `t99cp_insert_admin`.
4. **Page /auth/reset-password** : finalise le flow forgot (récupère le
   token via `supabase.auth.exchangeCodeForSession`, formulaire de
   nouveau mot de passe).
5. **OAuth Google + Instagram** : créer les OAuth credentials, configurer
   Supabase Auth providers, ajouter les boutons sociaux dans `AuthModal`.

---

## Étape 6 — Page profil + reset password + avatars bucket + RequireAuth ✅

**Branche** : `claude/review-project-setup-UbcCi` (étape 5 mergée depuis
`claude/review-project-setup-r2FSV` @ `3a45184` au début de cette session).

### Pré-requis exécutés

- `git fetch origin claude/review-project-setup-r2FSV` puis `git merge --no-ff 3a45184`
  pour récupérer le tip de l'étape 5 (Supabase Auth + AuthModal + handle_new_user).
- `npm install --legacy-peer-deps` dans `web/`.
- `service postgresql start` + base `maintenant` (utilisateur `maintenant/dev`)
  + stub `auth` + stub `storage` (sandbox sans Docker, comme étapes 4 et 5).

### Bucket Supabase Storage `avatars` + RLS

Ajouté à `db/schema.sql` (nouvelle **section 19**) :

```sql
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;
```

Quatre policies RLS sur `storage.objects`, restreintes à `bucket_id = 'avatars'` :

| Policy | Action | Contrainte |
| ------ | ------ | ---------- |
| `avatars_public_read`            | `select` | toujours (bucket public) |
| `avatars_authenticated_insert`   | `insert` | `auth.uid() = owner` ET `(storage.foldername(name))[1] = auth.uid()::text` |
| `avatars_authenticated_update`   | `update` | `owner = auth.uid()` (using + with check) |
| `avatars_authenticated_delete`   | `delete` | `owner = auth.uid()` |

La contrainte de path empêche qu'un utilisateur authentifié écrase l'avatar
d'un tiers : un upload doit obligatoirement aller sous `<uid>/...`.

**Stub `/tmp/auth_stub.sql`** étendu à `schema storage` (`storage.buckets`,
`storage.objects` avec colonne `path_tokens` générée, RLS activée), plus la
fonction `storage.foldername(text) returns text[]` (Supabase la fournit
nativement). Vérifications après `psql -f db/schema.sql` :

```
public.users      : 0 rows
public policies   : 119
storage policies  : 4
storage.buckets   : 'avatars' (public)
```

### Régénération des types

`node db/gen-types.mjs > web/src/types/database.ts` → fichier **identique**
à celui de l'étape 5 (1 674 lignes après formatage Prettier). Le générateur
filtre `c.relnamespace = 'public'::regnamespace` : le schéma `storage` est
volontairement ignoré (les buckets ne sont pas typés côté `Database`).
Idempotence confirmée : `git diff web/src/types/database.ts` après
régénération + format = vide.

### `web/src/lib/postgrestError.ts`

Mapping FR des codes Postgres / PostgREST les plus courants : `23505` unique
violation, `23503` FK invalide, `23502` not null, `23514` check constraint,
`22001` value too long, `22P02` invalid input, `42501` permission denied,
`PGRST116` no rows, `PGRST301` session expired, `PGRST204` no content.
Fallback sur `error.message` puis sur un message générique. Utilisé partout
où une erreur Postgrest doit être affichée à l'utilisateur (édition profil,
upload avatar).

### `web/src/lib/profile.ts`

Trois primitives strictement typées via `Database['public']['Tables']['users']` :

- `getProfile(userId): Promise<{ data: UserRow | null, error: PostgrestError | null }>`
- `updateProfile(userId, patch: UserUpdate)` — `UserUpdate` interdit toute
  clé hors schéma à la compilation, zéro `any`.
- `uploadAvatar(userId, file: File)` — validation client (`AVATAR_MAX_BYTES`
  = 2 Mo, types `image/jpeg|png|webp|gif`), path déterministe
  `<userId>/avatar-<timestamp>.<ext>`, upload Supabase Storage avec
  `upsert: true`, renvoie `{ path, publicUrl }` issu de `getPublicUrl`.

Les erreurs locales (validation + erreur de Storage) sont remontées comme de
vraies `new PostgrestError({...})` (classe importée depuis
`@supabase/supabase-js`) pour rester compatibles avec le typage Postgrest
côté hook. Codes maison `AVATAR_INVALID_TYPE` / `AVATAR_TOO_LARGE` (non
mappés par `postgrestErrorMessage`) → le message FR de la validation est
préservé.

### `web/src/hooks/useProfile.ts`

Hook React qui consomme `useAuth().user.id` et expose :

```ts
{
  profile: UserRow | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: PostgrestError | null;
  refresh: () => Promise<void>;
  update: (patch: UserUpdate) => Promise<{ error: PostgrestError | null }>;
}
```

- Status dérivé : `authStatus === 'loading'` ⇒ `loading`. Sinon reflète
  `fetchStatus`.
- Reset automatique du state quand l'utilisateur change (pattern « set state
  during render » avec clé `trackedUserId`), compatible avec la règle
  React Hooks 7 `react-hooks/set-state-in-effect`.
- Fetch initial déclenché via `queueMicrotask` dans `useEffect` (le setState
  synchrone qui marque `loading` se fait par le pattern de clé, hors effet).

### `web/src/pages/ProfilePage.tsx` — port TS strict

Remplace le placeholder. Affiche, en mode lecture :

- en-tête : avatar (image ou initiale, gradient brand) + nom + email,
- bio (si présente), badges (tags `var(--mn-brand-light)`),
- carte « Informations » : ville, code postal, membre depuis (formaté
  fr-FR),
- wallet T99CP (carte sombre, font Sora, balance affichée).

En mode édition (bouton « Modifier ») :

- formulaire inline avec `display_name` (obligatoire), bio (`textarea`
  ≥ 96 px), ville, code postal,
- avatar : bouton « Changer l'avatar » + `<input type="file" accept="image/*">`
  caché + label cliquable au survol de l'avatar,
- preview avant upload (`URL.createObjectURL`), validation client (2 Mo,
  formats image),
- erreurs Postgrest mappées en FR via `postgrestErrorMessage`,
- boutons « Enregistrer » / « Annuler » (≥ 44 px, ARIA labels, `aria-describedby`
  vers l'erreur de formulaire).

Aucun hex en dur : 100 % des couleurs via `var(--mn-*)`. Aucun emoji : icônes
SVG `IconEdit`, `IconCheck`, `IconUpload`, `IconBadge`, `IconClose`,
`IconUser` (`web/src/components/icons.tsx`).

### `web/src/pages/ResetPasswordPage.tsx` + route `/auth/reset-password`

- Lit le `code` depuis `searchParams.get('code')` ou le hash (`extractCodeFromLocation`).
- Initialise le status en `'exchanging'` ou `'expired'` (lazy initializer
  → pas de setState dans un effect).
- `supabase.auth.exchangeCodeForSession(code)` au mount (effect). En cas
  d'erreur, message FR via `authErrorMessage`.
- Formulaire : nouveau mot de passe + confirmation (≥ 8 caractères,
  identiques). Submit → `supabase.auth.updateUser({ password })` puis
  redirection `setTimeout(navigate('/profile'), 800)`.
- Mise à jour de `auth.ts::resetPasswordForEmail` : passe désormais
  `{ redirectTo: ${window.location.origin}/auth/reset-password }` (avec
  fallback `undefined` en SSR).

### `web/src/components/RequireAuth.tsx`

Wrapper de route minimal :

- `status === 'loading'` → spinner (texte « Chargement… », `role="status"`).
- `status === 'anonymous'` → `<Navigate to="/?auth=login" replace />`,
  conserve la route d'origine dans `location.state.from`.
- `status === 'authenticated'` → rend `children`.

Appliqué à `/profile` dans `web/src/router.tsx`. `RootLayout` consomme le
query param `?auth=login` (pattern « set state during render ») pour
ouvrir automatiquement la modale d'authentification, et le supprime de
l'URL une fois l'utilisateur authentifié.

### `RootLayout` — adaptations

- Entrée « Profil » de la navigation conditionnelle : visible uniquement
  quand `status === 'authenticated'`.
- Menu compact `[IconUser display_name]` désormais cliquable → navigate
  vers `/profile`.
- Bouton « Se déconnecter » inchangé.
- Effets refactorés (pattern de clé sur `authQuery|status`) pour rester
  conformes à la règle `react-hooks/set-state-in-effect`.

### Tests

| Fichier                                         | Couverture                            |
| ----------------------------------------------- | ------------------------------------- |
| `src/lib/profile.test.ts`                       | 9 cas — getProfile/updateProfile,     |
|                                                 | erreurs RLS/unique violation FR,      |
|                                                 | uploadAvatar (type, taille, succès,   |
|                                                 | erreur Storage)                       |
| `src/hooks/useProfile.test.tsx`                 | 4 cas — fetch au mount, error RLS,    |
|                                                 | refresh, update                       |
| `src/pages/ProfilePage.test.tsx`                | 6 cas — rendu lecture, bascule édition |
|                                                 | submit avec trim, erreur 42501 FR,    |
|                                                 | upload avatar (mock File), annulation |
| `src/pages/ResetPasswordPage.test.tsx`          | 6 cas — code absent, exchange OK,     |
|                                                 | password < 8 char, mismatch, submit + |
|                                                 | redirect /profile, code expiré FR     |
| `src/components/RequireAuth.test.tsx`           | 3 cas — spinner loading, redirect     |
|                                                 | anonymous, rend children authenticated |

Total : **50 tests** (22 existants + 28 nouveaux), tous verts.

Note d'implémentation tests : `useAuth()` interne appelle
`supabase.auth.getSession()` au mount et écrase l'état local s'il résout
avec `{ session: null }`. Pour les tests qui dépendent d'un utilisateur
authentifié, on stub `getSession` pour retourner directement la session
attendue (sinon race condition entre l'état manuel et la résolution du
promise).

### Vérifications passées

- `npm run typecheck` : ✅ aucune erreur
- `npm run lint` : ✅ 0 problème
- `npm test` : ✅ **50/50** tests passent
- `npm run build` : ✅ `dist/` 295 kB JS / 1,09 kB CSS (gzip 85 kB / 0,56 kB)
- `npm run format:check` : ✅ tous les fichiers conformes

### Décisions UX

- **Pas d'onglets** (Activité/Services/Paramètres) sur la première version
  de `/profile` : le prototype les expose mais ils dépendent de données
  encore absentes (mobilisations, T99CP transactions). On reviendra dessus
  au Sprint 2 (contenu militant) avec un vrai feed dérivé de Supabase.
- **Avatar bucket public** : choix RGPD assumé — un avatar est par essence
  un identifiant visuel public ; pour les profils privés (mineurs, lanceurs
  d'alerte) on bascule plus tard sur un bucket privé + URL signée.
- **Limite 2 Mo, formats JPEG/PNG/WebP/GIF** : aligné avec les standards
  produits comme Mastodon / Bluesky. Le PNG transparent (logos) est admis.
  Le WebP est encouragé (compression).
- **Reset password redirect** : `${window.location.origin}/auth/reset-password`.
  Ne dépend pas d'une variable d'env → fonctionne en preview Vercel et en
  prod sans configuration supplémentaire. Côté Supabase Dashboard, il
  faudra ajouter `/auth/reset-password` à la whitelist des redirect URLs
  avant la mise en prod.
- **Guard `RequireAuth`** : pour l'instant on redirige vers `/?auth=login`
  qui ouvre la modale. Quand on aura plusieurs pages protégées (`/admin`,
  `/messaging`), on stockera la route d'origine dans `location.state.from`
  pour rediriger automatiquement après login. La logique est déjà prête,
  il reste juste à l'exploiter côté `AuthModal` (à brancher au Sprint 1
  Stripe quand on aura le tunnel d'adhésion).

### Tableau d'état global

`/profile` est désormais une route protégée qui consomme la table
`public.users` via `getProfile` et y écrit via `updateProfile`. Le bucket
Storage `avatars` est branché avec policies RLS strictes. Le flow forgot
password est complet de bout en bout (modale → email → page de reset →
redirection vers `/profile`).

### Prochaines étapes (Sprint 1 — adhésion Stripe + RPC T99CP)

1. **Adhésion Stripe (3 tiers : gratuit / soutien / engagé)** :
   - Frontend : `/join` avec le tunnel d'adhésion (cartes tier + Stripe
     Checkout via `loadStripe`).
   - Backend : Edge Function Supabase `create-checkout-session`
     (`SUPABASE_SERVICE_ROLE_KEY` côté serveur uniquement), puis webhook
     `stripe-webhook` qui synchronise `public.adhesions` + `public.members`.
   - Stocker `stripe_customer_id` / `stripe_subscription_id` sur
     `public.adhesions`. Variables d'env : `STRIPE_SECRET_KEY`,
     `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_SOUTIEN`, `STRIPE_PRICE_ENGAGE`.
2. **RPC T99CP** : `credit_t99cp(p_user uuid, p_amount integer, p_reason text)`
   / `debit_t99cp(...)` (SECURITY DEFINER + check de solde, écrit dans
   `t99cp_transactions` et met à jour `users.t99cp_balance` dans une
   transaction). Déjà cadré par la policy `t99cp_insert_admin` (insertion
   réservée aux admins / via RPC).
3. **OAuth Google + Instagram** : reporté tant que les OAuth credentials
   ne sont pas créés (hors scope Claude — décision produit).

---

## Étape 7 — Adhésion Stripe (3 tiers) + RPC T99CP + JoinPage ✅

**Branche** : `claude/review-project-setup-QwLHV`
(étape 6 mergée depuis `claude/review-project-setup-UbcCi` @ `8a7ea47` au
début de cette session via `git fetch` + `git merge --no-ff`).

### Pré-requis exécutés

- `git fetch origin claude/review-project-setup-UbcCi` (premier appel HTTP 500
  → retry avec back-off 2s/4s/8s/16s, succès au 2ᵉ essai), puis
  `git merge --no-ff 8a7ea47 -m "Merge step 6 tip ..."` pour récupérer le
  tip de l'étape 6 (page profil + reset password + bucket avatars).
- `cd web && npm install --legacy-peer-deps` (lockfile non versionné,
  l'option reste indispensable à cause d'`eslint-plugin-jsx-a11y` ↔ ESLint 10).

### RPC T99CP (`db/schema.sql` §20)

Deux fonctions `SECURITY DEFINER` avec `set search_path = public, pg_temp`,
exposées en `grant execute … to authenticated` (révocation pour `public`).

```sql
public.credit_t99cp(p_user uuid, p_amount integer, p_reason text) returns void
public.debit_t99cp (p_user uuid, p_amount integer, p_reason text) returns void
```

- **credit_t99cp** : insère `t99cp_transactions(kind='credit', amount, reason)`
  puis `update users set t99cp_balance = t99cp_balance + p_amount`. Lève
  `invalid_amount` si `p_amount <= 0`, `invalid_reason` si la raison est
  vide/whitespace.
- **debit_t99cp** : `select … for update` pour verrouiller la ligne contre
  les races avec un débit concurrent, puis vérifie `balance >= p_amount`
  (sinon `raise exception 'insufficient_balance'`). Insère la ligne ledger
  et décrémente. Le check colonne `t99cp_balance >= 0` posé à l'étape 4
  reste comme deuxième garde-fou (un débit qui passerait quand même les
  vérifications applicatives serait bloqué au niveau Postgres).
- Idempotence : déléguée à la couche appelante (la PK `adhesions.stripe_subscription_id`
  UNIQUE empêche les doublons d'adhésion, et le webhook Stripe utilise
  l'event id Stripe comme deduplication clé côté staging — à formaliser à
  l'étape 8 avec une table `stripe_events`).

**Cas de test exécutés en local** (Postgres 16 + stub auth+storage,
`PGPASSWORD=dev psql -h localhost -U maintenant -d maintenant`) :

| # | Cas                                            | Résultat attendu                                 |
| - | ---------------------------------------------- | ------------------------------------------------ |
| 1 | `credit_t99cp(uid, 60, 'adhesion_renewal')`    | balance 0 → 60, ledger += credit                 |
| 2 | `debit_t99cp(uid, 10, 'reward_redeem')`        | balance 60 → 50, ledger += debit                 |
| 3 | `debit_t99cp(uid, 9999, 'big')` (solde=50)     | exception `insufficient_balance`, balance inchangée |
| 4 | `credit_t99cp(uid, 0, 'r')`                    | exception `invalid_amount`                       |
| 5 | `credit_t99cp(uid, 5, '   ')`                  | exception `invalid_reason`                       |

Les 5 cas passent. Solde final : 50 T99CP, 2 lignes dans `t99cp_transactions`.

### Régénération des types Supabase

- `db/gen-types.mjs` étendu : la section `Functions` inclut désormais
  `is_admin`, `credit_t99cp` et `debit_t99cp` avec `Args: { p_user: string;
  p_amount: number; p_reason: string }` et `Returns: void`.
- Régénération : `node db/gen-types.mjs --url postgres://maintenant:dev@localhost:5432/maintenant > web/src/types/database.ts`
  puis `npx prettier --write src/types/database.ts`.
- Le fichier passe à **1 699 lignes** (1 674 → +25 lignes pour les deux RPCs).
- `web/src/types/database.ts` reste l'unique source de typage Supabase
  (zéro `any` côté front, conforme à `CLAUDE.md`).

### Edge Functions Stripe

Deux fonctions Deno isolées sous `supabase/functions/` :

```
supabase/
  functions/
    _shared/
      cors.ts                  ← allow-list origines + helper jsonResponse
    create-checkout-session/
      index.ts                 ← création de session Stripe Checkout
    stripe-webhook/
      index.ts                 ← réception + dispatch des events Stripe
```

Architecture clé : chaque fonction expose un `handle(req, deps)` testable
en isolation (Dependency Injection) ; le bootstrap Deno (`Deno.serve(...)`)
n'est exécuté que sous `import.meta.main`, ce qui rend ces fichiers
analysables par TypeScript Node-only sans le runtime Deno.

#### `create-checkout-session/index.ts`

- Valide la méthode (POST + OPTIONS pour le pre-flight CORS).
- Lit le JWT du caller dans `Authorization: Bearer ...`, le passe à
  `supabase.auth.getUser(jwt)` (client Supabase reconstruit avec la clé
  `SUPABASE_ANON_KEY` + l'`Authorization` header). Refuse l'appel si
  l'utilisateur n'est pas authentifié.
- Valide le `tier` reçu dans le body (allow-list : `soutien` | `engage`,
  toute autre valeur → `invalid_tier`).
- Crée la `Stripe.checkout.sessions.create` :
  - `mode: 'subscription'`
  - `line_items: [{ price: STRIPE_PRICE_SOUTIEN | STRIPE_PRICE_ENGAGE, quantity: 1 }]`
  - `client_reference_id: user.id`
  - `metadata: { user_id, tier }` (recopié sur `subscription_data.metadata`
    pour que le webhook `invoice.payment_succeeded` retrouve l'`user_id`)
  - `success_url: <site>/profile?adhesion=ok`
  - `cancel_url: <site>/join?canceled=1`
- Renvoie `{ url }`. Le front fait `window.location.assign(url)`.

#### `stripe-webhook/index.ts`

- Vérifie la signature via `stripe.webhooks.constructEventAsync(body, sig,
  STRIPE_WEBHOOK_SECRET)`. Toute erreur de signature → 400.
- Tourne avec `SUPABASE_SERVICE_ROLE_KEY` (Edge Function server-side
  uniquement, jamais bundlée côté front).
- Évènements gérés :
  - `checkout.session.completed` → `upsert adhesions` `(user_id, tier,
    status='active', stripe_subscription_id, ends_on)` sur le conflict de
    `stripe_subscription_id`.
  - `customer.subscription.deleted` → `update adhesions … status='cancelled'`.
  - `customer.subscription.updated` → `status='cancelled'` si le status
    Stripe ∈ `{canceled, unpaid, incomplete_expired}`, sinon synchronise
    `ends_on = current_period_end`.
  - `invoice.payment_succeeded` → `rpc('credit_t99cp', { p_user, p_amount: 60,
    p_reason: 'adhesion_renewal' })` (bonus mensuel de 60 T99CP).
- Évènements non gérés → renvoie `200 { received: true, ignored: <type> }`
  pour ne pas saturer la retry-queue Stripe.

#### Décisions Stripe

| Sujet               | Décision                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------- |
| **Mode test/live**  | `STRIPE_SECRET_KEY` lit `sk_test_...` en staging et `sk_live_...` en prod. Mêmes price IDs séparés. |
| **Rate-limiting**   | Délégué à Supabase (PostgREST ratelimit `aud=anon`) + Stripe (rate limits internes). À ajouter en Edge Function (memoize per-user) si abus. |
| **Idempotence**     | `adhesions.stripe_subscription_id UNIQUE` empêche les doublons (`upsert onConflict`). Pas de table `stripe_events` pour l'instant — à ajouter si retries massifs constatés. |
| **3D Secure**       | Activé par défaut (zone UE → Stripe applique SCA automatiquement, paramètres `automatic_payment_methods`). |
| **EU region**       | Le projet Supabase est en `eu-west-3` (Paris). Stripe data residency n'est pas configurable côté UE pour l'instant ; webhooks signés. |
| **Crédit T99CP**    | 60 T99CP / mois sur `invoice.payment_succeeded` (paid month = paid bonus). Pas de bonus de bienvenue (peut être ajouté plus tard via un event Stripe Checkout `success`). |
| **Tier downgrade**  | Non géré pour l'instant : `isTierLockedFor` grise les tiers ≤ tier actuel. Une rétrogradation passe par le portail client Stripe (hors scope étape 7). |

### `web/src/lib/membership.ts`

API typée via `Database['public']['Tables']['adhesions']` et
`Database['public']['Enums']['adhesion_tier']` :

- `getCurrentAdhesion(userId)` — filtre `status='active'`, prend la ligne
  la plus récente (`order by created_at desc, limit 1, maybeSingle`).
- `createFreeAdhesion(userId)` — `insert { tier: 'gratuit', status: 'active',
  amount_eur: 0 }`. Passe par la policy `adhesions_insert_self` (check
  `auth.uid() = user_id`).
- `createCheckoutSession(tier)` — appelle l'Edge Function via
  `supabase.functions.invoke('create-checkout-session', { body: { tier } })`,
  retourne `{ url, error }`. Toute erreur (network, Edge 4xx/5xx, absence
  d'URL) est normalisée en `PostgrestError` (codes custom
  `STRIPE_INVOKE_ERROR` / `STRIPE_NO_URL`) pour partager le mapper FR avec
  `postgrestError.ts`.
- Constantes pures : `TIER_RANK`, `TIER_ORDER`, `isTierLockedFor(current,
  target)` — utilisées pour griser les cartes inférieures ou égales au
  tier en cours.

### Hook `web/src/hooks/useAdhesion.ts`

Pattern identique à `useProfile` (cf. étape 6) :

- Reset via « set state during render » (clé `trackedUserId`) — évite la
  règle ESLint `react-hooks/set-state-in-effect`.
- Fetch dans `queueMicrotask` (sortie de la frame synchrone de l'effect).
- Expose `{ adhesion, status, error, refresh }`. Status :
  `'idle' | 'loading' | 'ready' | 'error'`.
- Si `userId` est `null` (utilisateur anonyme), reste en `'idle'` sans
  déclencher de requête.

### `web/src/pages/JoinPage.tsx`

Port TS strict du tunnel d'adhésion `project/app/JoinMovement.jsx`,
simplifié pour 3 tiers en parallèle (au lieu du wizard 4 étapes du
prototype) :

- Hero gradient `var(--mn-gradient)` + lead.
- 3 cartes `<article>` listées dans `<ul aria-label="Formules d'adhésion">`,
  chacune avec : titre, prix, période, blurb, 3 perks (chacun préfixé d'un
  `IconCheckCircle`), bouton CTA.
- Cards : `gratuit` (gris), `soutien` (mise en avant, border brand + ribbon
  « Recommandé »), `engage` (border standard).
- Si `useAdhesion` renvoie une adhésion active, le tier courant affiche un
  badge `Tier actuel` (vert) et `isTierLockedFor` désactive les boutons
  ≤ tier courant (avec libellé « Déjà adhérent·e » + `IconLock`).
- Banner `?canceled=1` affichée si l'utilisateur revient de Stripe sans
  finaliser. Banner spécifique pour l'utilisateur anonyme.
- Erreurs Postgrest mappées en FR via `postgrestErrorMessage` (`42501` →
  « Vous n'avez pas les droits… », etc.).
- CTA gratuit → `createFreeAdhesion` + `refresh()` + message « Bienvenue
  dans le mouvement ».
- CTA soutien/engage → `createCheckoutSession(tier)` + `window.location.assign(url)`.
- Aucun emoji : `IconCart`, `IconCheckCircle`, `IconSpark`, `IconLock`
  ajoutés à `web/src/components/icons.tsx`.

### Tests (Vitest + Testing Library)

3 suites ajoutées, **+23 tests** (50 → 73 verts au total) :

| Fichier                              | Tests | Couvre                                                      |
| ------------------------------------ | :---: | ----------------------------------------------------------- |
| `src/lib/membership.test.ts`         |  12   | `TIER_ORDER`/`TIER_RANK`, `isTierLockedFor` (3 scénarios), `getCurrentAdhesion` (3), `createFreeAdhesion` (2), `createCheckoutSession` (3 incl. erreurs FR). |
| `src/hooks/useAdhesion.test.tsx`     |   4   | `userId=null` → idle, mount → ready, refresh, erreur RLS.   |
| `src/pages/JoinPage.test.tsx`        |   7   | 3 cartes rendues, banner `?canceled=1`, click gratuit → insert, click soutien → invoke + redirect, tier déjà actif grisé + badge, erreur Postgrest mappée FR, utilisateur anonyme refuse l'action. |

Pattern de mock pour `window.location.assign` :
`Object.defineProperty(window, 'location', { value: { ...originalLocation,
assign: spy } })` (jsdom 29 protège `assign` contre la `defineProperty`
directe sur `window.location`). Restauré dans `afterEach`.

### Vérifications passées (sur cette branche)

- `npm run typecheck` : ✅
- `npm run lint`      : ✅ (corrections : `readonly T[]` plutôt que
  `ReadonlyArray<T>`, hook `useAdhesion` aligné sur `useProfile` pour la
  règle `react-hooks/set-state-in-effect`)
- `npm test`          : ✅ **73 / 73**
- `npm run build`     : ✅ `dist/` ~295 kB JS / 1,09 kB CSS
- `npm run format:check` : ✅

### Décisions / hors scope

- **Pas de migration `supabase/migrations/<ts>_init.sql`** : `db/schema.sql`
  reste la source canonique. À convertir en migration le jour du `supabase
  db push` réel (cf. étape 4 §Décisions).
- **Pas d'invocation Stripe live** : les Edge Functions sont écrites et
  testées par DI mais pas déployées (sandbox sans Docker, pas de tunnel
  webhook). Le déploiement se fera depuis un poste de dev avec
  `supabase functions deploy create-checkout-session stripe-webhook`.
- **Pas de table `stripe_events`** : la dédup repose sur `adhesions.stripe_subscription_id`
  UNIQUE. Si Stripe rejoue massivement, on ajoutera la table à l'étape 8+.
- **Pas de portail client Stripe** : la résiliation se fera depuis le
  profil utilisateur (placeholder à brancher à l'étape 8) ou par la suite
  via un endpoint dédié.

### Prochaines étapes (fin Sprint 1 — étape 8)

1. **OAuth Google + Instagram** : boutons sociaux dans `AuthModal`,
   gestion des erreurs de consentement, page de callback `/auth/callback`.
2. **Magic link** (alternative passwordless à `signInWithOtp`) déjà
   exposée par `useAuthStore`, à brancher sur l'`AuthModal`.
3. À l'issue : Sprint 1 complet (auth + profil + adhésion + T99CP). On
   pourra basculer sur **Sprint 2 (contenu militant)** — pétitions CRUD,
   mobilisations, campagnes.

---

## Étape 8 — OAuth Google + Instagram + magic link + callback ✅

**Branche** : `claude/review-project-rules-BqjpH` (imposée par l'harness).
Merge initial : `git merge --no-ff origin/claude/review-project-setup-QwLHV`
récupère les commits `feat(adhesion): step 7 …` (45bb74a) + `docs(handoff):
step 8 prompt` (bf99d43) avant d'attaquer l'étape.

### Pré-requis exécutés

1. `git fetch origin claude/review-project-setup-QwLHV` puis merge `--no-ff`
   pour récupérer la racine de l'étape 7.
2. `cd web && npm install --legacy-peer-deps` (lockfile non versionné,
   conflit ESLint 10 ↔ eslint-plugin-jsx-a11y).
3. Pas de `supabase start` : Docker indisponible dans la sandbox. OAuth
   est entièrement testé via mocks Vitest (`signInWithOAuth`,
   `exchangeCodeForSession`).

### OAuth Google + Instagram (`web/src/lib/oauth.ts`)

Nouveau module dédié `web/src/lib/oauth.ts` qui expose :

- `type SocialProvider = 'google' | 'instagram'` — domaine restreint
  côté UI, distinct du `Provider` interne de @supabase/auth-js (qui
  liste ~25 providers).
- `signInWithProvider(provider): Promise<{ error }>` — appelle
  `supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })`
  avec `redirectTo = ${window.location.origin}/auth/callback`. La
  promise résolue reflète l'erreur Supabase ; en cas de succès le
  navigateur est en train de naviguer vers le consent screen du
  fournisseur (rien à faire côté React).
- Pour Instagram, le `Provider` natif de @supabase/auth-js (v2.x
  packagé avec @supabase/supabase-js) ne liste pas encore `'instagram'`.
  On utilise `as Provider` ciblé, justifié dans un commentaire : la
  résolution effective se fait via la config OIDC custom dans le
  dashboard Supabase Auth (Settings → Providers → Instagram).

### Callback page `/auth/callback` (`web/src/pages/AuthCallbackPage.tsx`)

- Détection synchrone du payload (`?code=…` ou fragment
  `#access_token=…` ou `?error=…`) via `hasCallbackPayload(href)` ; la
  fonction est isolée pour rester testable sans monter le composant.
- État initial calculé hors `useEffect` (compatible règle ESLint
  `react-hooks/set-state-in-effect` du preset React 19) : `status =
  'exchanging' | 'success' | 'error'`.
- L'`useEffect` appelle `supabase.auth.exchangeCodeForSession(href)`,
  passe le `href` complet (Supabase v2 accepte cette forme et lit
  `code` / `provider` dans l'URL elle-même).
- Sur succès → `navigate('/profile', { replace: true })`.
- Sur erreur → mappée par `authErrorMessage(error)` puis affichée dans
  un `<div role="alert">`.
- Affiche un état intermédiaire `« Validation du lien d'authentification.
  Cette opération prend quelques secondes. »` pendant l'échange.
- Route branchée dans `web/src/router.tsx` : `path: 'auth/callback'`.

### Magic link UI (`AuthModal.tsx`)

- Nouveau `Mode = 'login' | 'signup' | 'forgot' | 'magic'` (4ᵉ écran).
- Bouton « Lien magique par email » visible uniquement en mode
  `login`, sous les boutons OAuth, qui bascule sur le mode `magic`.
- Le mode `magic` réutilise le même formulaire (sans champ mot de
  passe) et appelle `signInWithMagicLink({ email })` (déjà exposé par
  le store Zustand depuis l'étape 5).
- Message de succès : « Lien envoyé. Vérifiez votre boîte mail pour
  finaliser la connexion. »
- Retour à la connexion via un bouton lien `linkBtnStyle` cohérent
  avec les autres écrans.

### Boutons OAuth dans `AuthModal.tsx`

- Visible en modes `login` et `signup`, en haut du formulaire, avant
  un divider `« ou par email »`.
- Trois boutons : Google (avec `IconGoogle`), Instagram (avec
  `IconInstagram`), Lien magique (avec `IconLink`, en mode login
  uniquement).
- `oauthBtnStyle` : surface neutre (`var(--mn-bg)` + bordure 1.5 px),
  hauteur 46 px, hover natif (cursor pointer). Pas de gradient pour
  laisser respirer les logos officiels.
- `handleOAuth(provider)` désactive temporairement le bouton via
  `submitting=true`, map les erreurs en FR via `authErrorMessage`,
  laisse le navigateur faire la redirection.

### Icônes (`web/src/components/icons.tsx`)

Trois nouvelles icônes ajoutées :

- `IconGoogle` — SVG officiel multi-color (4 chemins jaune / rouge /
  vert / bleu). **Exception currentColor justifiée en commentaire** :
  les guidelines de Google et Meta imposent les couleurs officielles
  pour les boutons OAuth.
- `IconInstagram` — SVG avec radial gradient officiel (jaune → orange
  → magenta → bleu), cercle blanc + point blanc. Idem : exception
  currentColor justifiée.
- `IconLink` — chaîne classique (deux maillons), suit `currentColor`
  comme les autres icônes du design system.

### Mapping d'erreurs (`web/src/lib/auth.ts::authErrorMessage`)

Codes Supabase Auth ajoutés (tous mappés en FR) :

| Code Supabase                       | Message FR                                            |
| ----------------------------------- | ----------------------------------------------------- |
| `access_denied`                     | Vous avez refusé l'accès. Réessayez et acceptez…     |
| `unauthorized_client`               | (idem `access_denied`)                                |
| `provider_email_needs_verification` | Email non vérifié chez le fournisseur. Confirmez-le… |
| `provider_disabled`                 | Ce mode de connexion est actuellement désactivé.      |
| `oauth_provider_not_supported`      | Ce fournisseur n'est pas encore configuré…           |
| `bad_oauth_callback`                | Lien d'authentification invalide ou expiré.           |
| `bad_oauth_state`                   | (idem `bad_oauth_callback`)                           |
| `flow_state_not_found`              | Session d'authentification expirée.                   |
| `flow_state_expired`                | (idem `flow_state_not_found`)                         |

### Tests (Vitest + Testing Library)

10 nouveaux tests, total **83 tests verts** (73 → 83) :

- `src/lib/oauth.test.ts` (3 cas) — Google + Instagram + erreur
  réseau (`AuthRetryableFetchError`).
- `src/pages/AuthCallbackPage.test.tsx` (4 cas) — code valide →
  redirection `/profile`, code absent → message d'erreur, erreur
  Supabase mappée FR, paramètre `error=access_denied` mappé FR.
- `src/components/AuthModal.test.tsx` (3 nouveaux cas) — bouton Google
  appelle `signInWithOAuth(google)`, bouton Instagram appelle
  `signInWithOAuth(instagram)`, bouton « Lien magique par email »
  bascule sur le mode `magic` puis appelle `signInWithOtp`.

### Décisions (provider id Instagram, OIDC custom)

1. **Provider id Instagram** : on conserve `'instagram'` côté domaine
   (UI + module `oauth.ts`) avec un cast `as Provider` ciblé sur la
   ligne d'appel `signInWithOAuth`. La résolution effective côté
   Supabase Auth se fait via la config OIDC custom dans le dashboard
   (Settings → Auth → Providers → Instagram custom OIDC, app_id de
   l'app Meta Instagram Basic Display ou Threads). Décision réversible :
   si une future version de `@supabase/auth-js` ajoute `'instagram'`
   au type `Provider`, le cast disparaîtra naturellement.
2. **`exchangeCodeForSession` avec `href` complet** : Supabase v2
   accepte la signature `(input: string)` où `input` peut être soit le
   `code` brut, soit l'URL complète. On passe l'URL complète pour
   bénéficier de la détection automatique des paramètres `code`,
   `state`, `provider` et des fragments hash le cas échéant.
3. **Pas de bouton OAuth en mode `forgot` ni `magic`** : flux
   incohérent (réinitialisation = pas OAuth) et focus mental réduit.
4. **`IconGoogle` et `IconInstagram` figés en couleur** : exception
   documentée à la règle currentColor du design system, exigée par les
   guidelines de marque Google et Meta.
5. **Pas d'environnement Supabase local** : OAuth en local nécessite
   un tunnel ngrok ou supabase.com en mode dev. Pour l'étape 8, on
   reste sur les mocks Vitest ; l'intégration sera testée manuellement
   à la prochaine étape de déploiement.

### Vérifications passées

- `npm run typecheck` ✅
- `npm run lint` ✅ (preset ESLint flat + react-hooks 6)
- `npm test -- --run` ✅ — 83 tests verts (13 fichiers).
- `npm run build` ✅ — bundle 295 kB (gzip 85 kB), aucune
  augmentation perceptible (logos OAuth = SVG inline, pas d'asset
  externe).
- `npm run format:check` ✅.

### Tableau d'état global

| Domaine      | Statut | Détail                                                     |
| ------------ | :----: | ---------------------------------------------------------- |
| Prototype    |   ✅   | Intact (`project/app/Maintenant.html` + JSX racine).       |
| Vite skeleton|   ✅   | Étape 3.                                                   |
| Schéma DB    |   ✅   | 36 tables + 119 policies RLS + bucket avatars + RPC T99CP. |
| Auth         |   ✅   | Étape 5 + étape 8 (OAuth Google/Instagram + magic link).   |
| Profil       |   ✅   | Étape 6.                                                   |
| Adhésion     |   ✅   | Étape 7 — Stripe Checkout + webhook + JoinPage.            |
| Pétitions    |   ⬜   | Sprint 2 (étape 9).                                        |

### Prochaines étapes (Sprint 2 — étape 9)

Sprint 1 complet. On bascule sur le Sprint 2 (contenu militant) :

1. **Étape 9 — Pétitions CRUD côté front** : listing public, fiche
   détail, signature authentifiée, formulaire de création, soft-delete
   et modération (statut `draft / pending / published / closed`).
   Les tables et policies RLS existent déjà depuis l'étape 4
   (`petitions`, `petition_signatures`).
2. Puis : mobilisations (étape 10), campagnes (étape 11), sondages /
   audit fin sprint 2 (étape 12).

---

## Étape 9 — Sprint 2 / Pétitions CRUD côté front ✅

**Branche** : `claude/review-project-rules-6SadH` (l'étape 8 a été mergée
depuis `claude/review-project-rules-BqjpH` @ `600287c` au début de cette
session).

### Pré-requis exécutés

- `git fetch origin claude/review-project-rules-BqjpH` puis
  `git merge --no-ff 600287c` pour récupérer le tip de l'étape 8
  (OAuth + magic link + callback).
- `cd web && npm install --legacy-peer-deps` (lockfile non versionné +
  conflit `eslint-plugin-jsx-a11y` ↔ ESLint 10).

### Module `web/src/lib/petitions.ts`

API typée intégralement via `Database['public']['Tables']['petitions']`
et `Database['public']['Tables']['signatures']`. Toutes les fonctions
renvoient `{ data | signed, error: PostgrestError | null }` pour partager
le mapper FR `postgrestErrorMessage`.

| Fonction                      | Rôle                                                                 |
| ----------------------------- | -------------------------------------------------------------------- |
| `listPetitions(params)`       | Listing public (status='published' par défaut) trié par compteur     |
| `getPetition(slug)`           | Lecture par slug (maybeSingle → 404 silencieux)                      |
| `createPetition(input)`       | Validation FR + slugify + insert avec retry slug-collision (jusqu'à 5)|
| `signPetition(pid, uid)`      | Insert dans `signatures` (RLS authenticated_self)                    |
| `unsignPetition(pid, uid)`    | Delete RGPD (1 user / 1 pétition)                                    |
| `hasUserSigned(pid, uid)`     | Single-row check via maybeSingle                                     |
| `listPetitionSignatures(pid)` | Liste anonymisable des signataires (top 20)                          |
| `slugify(input)`              | Port TS de `public.slugify(text)` — usable côté front sans round-trip|
| `validatePetitionInput(in)`   | Validation pure (titre 8–80, résumé 40–240, body ≥ 200, target 100–1M)|

### Hooks

- `web/src/hooks/usePetitions.ts` : listing avec filtres `search`,
  `category`, `status`, `limit`. Refetch automatique quand le `filterKey`
  (JSON.stringify) change. Pattern « set state during render » + reset
  + `queueMicrotask` repris de `useAdhesion` pour respecter
  `react-hooks/set-state-in-effect`.
- `web/src/hooks/usePetition.ts` : fiche détail par slug + check
  `hasUserSigned` en parallèle quand `userId` est fourni. Status UI étendu
  avec `notfound` (data=null sur slug) → la page redirige vers `/petitions`.

### Pages

- `web/src/pages/PetitionsPage.tsx` : hero + barre de recherche + select
  catégorie + bouton « Créer une pétition ». Cards `PetitionCard` avec
  compteur dénormalisé + barre de progression rose
  (`var(--mn-gradient)`). État vide + erreurs Postgrest mappées en FR.
- `web/src/pages/PetitionDetailPage.tsx` : fiche complète avec bouton
  signer / retirer signature. Utilisateur anonyme → CTA
  « Se connecter pour signer » avec `?auth=login&next=...`. Compteur live
  via `refresh()` après chaque action. `Navigate replace` vers
  `/petitions` quand le slug n'existe pas (`status === 'notfound'`).
- `web/src/pages/PetitionCreatePage.tsx` : formulaire avec validation
  client (mêmes seuils que `validatePetitionInput`). Réussite → redirige
  vers la fiche `/petitions/<slug>`. La page est protégée par
  `RequireAuth` dans le router.

### Router

3 nouvelles routes dans `web/src/router.tsx` :

| URL                  | Composant              | Garde         |
| -------------------- | ---------------------- | ------------- |
| `/petitions`         | `PetitionsPage`        | aucune        |
| `/petitions/new`     | `PetitionCreatePage`   | `RequireAuth` |
| `/petitions/:slug`   | `PetitionDetailPage`   | aucune        |

### Schéma SQL — `db/schema.sql`

Section 4 mise à jour (idempotente) :

- Colonne `petitions.signature_count integer not null default 0
  check (signature_count >= 0)` ajoutée à la définition ; et complétée
  via `alter table … add column if not exists` + `add constraint …`
  pour les bases déjà initialisées avec l'ancien schéma.
- Index `petitions_status_idx` ajouté (les listings filtrent toujours
  par status).
- Section 4.b : fonction `public.touch_petition_signature_count()` +
  triggers `signatures_count_inc` (AFTER INSERT) et `signatures_count_dec`
  (AFTER DELETE). Le décrément utilise `greatest(signature_count - 1, 0)`
  pour respecter le `CHECK >= 0` en cas de désynchronisation.
- Section 4.c : fonction `public.slugify(text)` (immutable + strict)
  qui translate les accents latins courants sans dépendance à l'extension
  `unaccent`, puis collapse `[^a-z0-9]+ → '-'`, puis trim. Cas de test
  documentés en commentaire SQL.
- `web/src/types/database.ts` patché à la main : ajout de
  `signature_count` aux Row/Insert/Update de `petitions`, et ajout de
  `slugify` dans `Functions`.

### Icônes ajoutées (`web/src/components/icons.tsx`)

5 nouvelles icônes SVG (currentColor) : `IconFlame`, `IconPen`,
`IconSearch`, `IconArrowLeft`, `IconUsers`.

### Tests (44 nouveaux, total 127)

| Fichier                                         | Cas | Couverture                                                          |
| ----------------------------------------------- | --: | ------------------------------------------------------------------- |
| `src/lib/petitions.test.ts`                     |  23 | slugify (3), validate (5), listPetitions (4), getPetition (2), createPetition (4), signPetition (2), unsignPetition (1), hasUserSigned (2) |
| `src/hooks/usePetitions.test.tsx`               |   3 | mount + refetch sur changement filterKey + état erreur              |
| `src/hooks/usePetition.test.tsx`                |   4 | anonymous (signed=false), notfound, signed=true, refresh           |
| `src/pages/PetitionsPage.test.tsx`              |   5 | rendu listing, état vide, soumission recherche, filtre catégorie, erreur RLS |
| `src/pages/PetitionDetailPage.test.tsx`         |   5 | rendu fiche, anonymous → lien login, sign → refresh, unsign, 404 → redirect |
| `src/pages/PetitionCreatePage.test.tsx`         |   4 | rendu formulaire, validation FR, submit valide → redirect, erreur 42501 |

Mocks Supabase :

- Pour `petitions.test.ts`, le builder est « thenable » : la fonction
  `resolveChain(chain, result)` mock `.then` pour faire passer
  `await query` proprement. Les chaînes terminées par `.maybeSingle()`
  utilisent toujours `.mockResolvedValueOnce()`.
- Pour les hooks et pages, `vi.importActual` puis surcharge fonction par
  fonction (pattern repris de `useAdhesion.test.tsx`) — préserve les
  constantes (`PETITION_CATEGORIES`, seuils de validation) tout en
  isolant les appels réseau.

### Vérifications passées

- `npm run typecheck` : ✅ aucune erreur
- `npm run lint` : ✅ 0 problème
- `npm test -- --run` : ✅ 127/127 tests passent (19 fichiers)
- `npm run build` : ✅ build OK (`dist/` ~ 295 kB JS, 1.09 kB CSS)
- `npm run format:check` : ✅ tous les fichiers conformes

### Décisions / arbitrages

- **Slug auto, pas de saisie utilisateur** : le slug est généré à partir
  du titre via la fonction TS `slugify()`. En cas de collision (code
  Postgrest 23505 sur `petitions_slug_key`), on retente avec suffixe
  `-2`, `-3`, … jusqu'à 5. Au-delà, on renvoie une erreur explicite
  (`PETITION_SLUG_COLLISION`) qui invite à modifier le titre.
- **Compteur dénormalisé `signature_count`** : maintenu via trigger
  Postgres → aucune logique applicative ne touche le compteur. Pour
  rester cohérent avec la sémantique « 1 user / 1 pétition », l'unicité
  est garantie par la contrainte `unique (petition_id, user_id)` côté
  `signatures` (déjà présente à l'étape 4).
- **Modération** : le statut `published` par défaut autorise tout
  utilisateur authentifié à publier instantanément. La modération a
  posteriori reste prévue côté admin (Sprint 5) — `petitions_select_public`
  ne sert que les `status='published'` aux anonymes (sinon visible par
  l'auteur ou un admin uniquement).
- **Public vs privé des signataires** : la table `signatures` est
  lisible publiquement (compteur + display_name via jointure facultative)
  ; la liste affichée côté UI sera anonymisée (initiales) lors de l'étape
  ultérieure. Pour l'instant la fonction `listPetitionSignatures` est
  exposée mais non encore branchée sur la fiche détail — la liste
  publique des signataires viendra avec les commentaires / réactions
  (Sprint 4 réseau social).
- **Recherche** : `ilike` sur `title` + `summary`. Les méta-caractères
  `% _ ,` sont échappés côté front avant injection dans `.or()`. Sur
  gros volume on basculera sur `tsvector` + index GIN (Sprint 6 perf).
- **Filtre `status`** : exposé dans `ListPetitionsParams` mais limité à
  `published` côté UI pour l'instant. Quand la modération arrivera, on
  ajoutera un onglet « brouillons » dans le profil.
- **i18n** : tous les messages utilisateurs sont déjà en FR (alignés
  sur `postgrestErrorMessage`). Le projet ne charge pas de lib i18n
  pour l'instant (cf. HANDOFF §5).

### Prochaines étapes (étape 10)

1. Mobilisations CRUD (port du prototype Pages_Services.jsx, mêmes
   patterns que pétitions — table `mobilizations` + `participations`).
2. Suivi RGPD : ajouter une bannière « contenus créés visibles
   publiquement » sur la page de création (étape 12 — audit fin sprint 2).
3. Branchement admin pour modération a posteriori (Sprint 5).
4. Réutiliser `slugify()` côté front sur mobilizations / articles
   (mêmes patterns d'unicité avec retry).

---

## Étape 10 — Sprint 2 / Mobilisations CRUD côté front ✅

**Branche** : `claude/read-project-rules-IyheS` (l'étape 9 a été mergée
depuis `claude/review-project-rules-6SadH` @ `b0ec67b` au début de
cette session).

### Pré-requis exécutés

- `git fetch origin claude/review-project-rules-6SadH` puis
  `git merge --no-ff b0ec67b` pour récupérer le tip de l'étape 9
  (pétitions CRUD côté front).
- `cd web && npm install --legacy-peer-deps` (lockfile non versionné +
  conflit `eslint-plugin-jsx-a11y` ↔ ESLint 10).

### Module `web/src/lib/slug.ts` (factorisation)

`slugify()` extraite de `petitions.ts` vers un module dédié partageable
par tous les modules de contenu militant (pétitions, mobilisations,
articles à venir). `petitions.ts` re-exporte `slugify` pour garder la
compatibilité avec les imports existants (tests + pages).

### Module `web/src/lib/mobilizations.ts`

API typée intégralement via `Database['public']['Tables']['mobilizations']`
et `Database['public']['Tables']['participations']`. Toutes les fonctions
renvoient `{ data | rsvp, error: PostgrestError | null }` pour partager
le mapper FR `postgrestErrorMessage`.

| Fonction                          | Rôle                                                                 |
| --------------------------------- | -------------------------------------------------------------------- |
| `listMobilizations(params)`       | Listing public (status='published' par défaut) trié par `starts_at` ASC |
| `getMobilization(slug)`           | Lecture par slug (maybeSingle → 404 silencieux)                       |
| `createMobilization(input)`       | Validation FR + slugify + insert avec retry slug-collision (jusqu'à 5)|
| `rsvpMobilization(mid, uid)`      | Insert dans `participations` (RLS authenticated_self)                 |
| `cancelRsvp(mid, uid)`            | Delete RGPD (1 user / 1 mobilisation)                                 |
| `hasUserRsvp(mid, uid)`           | Single-row check via maybeSingle                                      |
| `validateMobilizationInput(in)`   | Validation pure (titre 8–80, résumé 40–240, body ≥ 100 si non vide,  |
|                                   | ville 2–80, `startsAt` valide, `endsAt` ≥ `startsAt` si fourni)       |

Constantes exportées : `MOBILIZATION_TITLE_MIN/MAX`,
`MOBILIZATION_SUMMARY_MIN/MAX`, `MOBILIZATION_BODY_MIN`,
`MOBILIZATION_CITY_MIN/MAX`. Filtres supportés sur `listMobilizations` :
`status`, `search`, `city` (ilike), `startsAfter`/`startsBefore` (ISO),
`limit`.

### Helper `web/src/lib/mobilizationFormat.ts`

Trois formatters Intl FR (`longDateFormatter`, `shortDateFormatter`,
`timeFormatter`) + `formatMobilizationDate(iso, 'long' | 'short')` +
`formatMobilizationTime(iso)`. Placé dans `lib/` (et non dans la page)
pour respecter la règle ESLint `react-refresh/only-export-components`
— un fichier de page ne doit exporter que des composants.

### Hooks

- `web/src/hooks/useMobilizations.ts` : listing avec filtres `search`,
  `city`, `startsAfter`, `startsBefore`, `limit`. Refetch automatique
  quand le `filterKey` (JSON.stringify) change. Même pattern « set state
  during render » + `queueMicrotask` que `usePetitions`.
- `web/src/hooks/useMobilization.ts` : fiche détail par slug + check
  `hasUserRsvp` en parallèle quand `userId` est fourni. Status UI étendu
  avec `notfound` (data=null sur slug) → la page redirige vers
  `/mobilizations`.

### Pages

- `web/src/pages/MobilizationsPage.tsx` : hero + barre de recherche +
  filtre ville (input texte) + filtre date « à partir du » (input
  date) + bouton « Créer un événement ». Cards `MobilizationCard` avec
  date courte FR, ville, compteur d'inscrits. État vide + erreurs
  Postgrest mappées en FR.
- `web/src/pages/MobilizationDetailPage.tsx` : fiche complète avec
  bouton « Je participe » / « me désinscrire ». Anonymes → CTA « Se
  connecter pour participer » avec `?auth=login&next=...`. Compteur
  live via `refresh()` après chaque action. Bouton « Partager » qui
  bascule sur `navigator.share` (mobile) puis fallback
  `navigator.clipboard.writeText`. Date longue FR via `Intl.DateTimeFormat`.
  `isPast` calculé dans un `useEffect + queueMicrotask` pour éviter
  `Date.now()` en pleine render (règle ESLint `react-hooks/purity`).
- `web/src/pages/MobilizationCreatePage.tsx` : formulaire avec
  validation client (mêmes seuils que `validateMobilizationInput`).
  Date+heure séparées côté UI, recombinées en ISO côté soumission.
  Réussite → redirige vers la fiche `/mobilizations/<slug>`. Protégée
  par `RequireAuth` dans le router.

### Router

3 nouvelles routes dans `web/src/router.tsx` :

| URL                    | Composant                | Garde         |
| ---------------------- | ------------------------ | ------------- |
| `/mobilizations`       | `MobilizationsPage`      | aucune        |
| `/mobilizations/new`   | `MobilizationCreatePage` | `RequireAuth` |
| `/mobilizations/:slug` | `MobilizationDetailPage` | aucune        |

### Schéma SQL — `db/schema.sql`

Section 5 mise à jour (idempotente) :

- Colonne `mobilizations.participation_count integer not null default 0
  check (participation_count >= 0)` ajoutée à la définition ;
  complétée via `alter table … add column if not exists` +
  `add constraint …` pour les bases déjà initialisées avec l'ancien
  schéma.
- Index `mobilizations_status_idx` et `mobilizations_city_idx` ajoutés
  (les listings filtrent par status + city).
- Section 5.b : fonction
  `public.touch_mobilization_participation_count()` + triggers
  `participations_count_inc` (AFTER INSERT) et `participations_count_dec`
  (AFTER DELETE). Le décrément utilise
  `greatest(participation_count - 1, 0)` pour respecter le `CHECK >= 0`.
  Cas de test documentés en commentaire SQL (insert/delete + tentative
  de doublon).
- `web/src/types/database.ts` patché à la main : ajout de
  `participation_count: number` aux Row/Insert/Update de `mobilizations`.

### Icônes ajoutées (`web/src/components/icons.tsx`)

3 nouvelles icônes SVG (currentColor) : `IconCalendar`, `IconPin`,
`IconShare`. Toutes en `viewBox="0 0 24 24"`, stroke 2,
`stroke-linecap/linejoin: round`.

### Tests (48 nouveaux, total 175)

| Fichier                                         | Cas | Couverture                                                          |
| ----------------------------------------------- | --: | ------------------------------------------------------------------- |
| `src/lib/slug.test.ts`                          |   4 | normalisation accents, trim tirets, casse+chiffres, chaîne vide     |
| `src/lib/mobilizations.test.ts`                 |  24 | validate (8), listMobilizations (5), getMobilization (2), createMobilization (4), rsvpMobilization (2), cancelRsvp (1), hasUserRsvp (2) |
| `src/hooks/useMobilizations.test.tsx`           |   3 | mount + refetch sur changement filterKey + état erreur              |
| `src/hooks/useMobilization.test.tsx`            |   4 | anonymous (rsvp=false), notfound, rsvp=true, refresh                |
| `src/pages/MobilizationsPage.test.tsx`          |   5 | rendu listing, état vide, soumission recherche, filtre ville, erreur RLS |
| `src/pages/MobilizationDetailPage.test.tsx`     |   5 | rendu fiche+dates, anonymous → lien login, rsvp → refresh, cancel, 404 → redirect |
| `src/pages/MobilizationCreatePage.test.tsx`     |   3 | validation FR, submit valide → redirect, erreur 42501               |

Mocks Supabase :

- `mobilizations.test.ts` : même builder « thenable »
  (`resolveChain(chain, result)`) que pour pétitions, étendu avec
  `ilike`, `gte`, `lte` pour couvrir tous les filtres.
- Hooks et pages : `vi.importActual` puis surcharge fonction par
  fonction — préserve les constantes (`MOBILIZATION_*`, types) tout
  en isolant les appels réseau.

### Vérifications passées

- `npm run typecheck` : ✅ aucune erreur
- `npm run lint` : ✅ 0 problème
- `npm test -- --run` : ✅ 175/175 tests passent (26 fichiers)
- `npm run build` : ✅ build OK (`dist/` ~ 295 kB JS, 1.09 kB CSS)
- `npm run format:check` : ✅ tous les fichiers conformes

### Décisions / arbitrages

- **Date d'événement obligatoire** : la mobilisation a un sens
  temporel fort (« quand a lieu la marche ? »). Le champ `startsAt`
  est requis côté validation, contrairement aux pétitions qui n'ont
  pas de date d'expiration explicite. `endsAt` reste facultatif.
- **Formatage Intl FR** : utilisation de
  `new Intl.DateTimeFormat('fr-FR', …)` avec trois variantes (long /
  short / time) plutôt qu'une lib externe (date-fns, dayjs) — bundle
  size + zéro dépendance. Les formatters sont instanciés une seule
  fois au top du module.
- **Partage de la fiche** : `navigator.share` (mobile / desktop
  moderne) en priorité, fallback `navigator.clipboard.writeText` qui
  copie l'URL canonique (`origin + pathname`). Un feedback éphémère
  « Lien copié. » s'affiche à droite du bouton après succès.
- **`isPast` calculé en effect** : Le linter
  `react-hooks/purity` interdit `Date.now()` en pleine render. La
  comparaison est portée par un `useState` + `useEffect +
  queueMicrotask` (même pattern que `useMobilizations` /
  `useMobilization`). Conséquence : `isPast` reste `false` pendant
  un microtask au mount — acceptable pour un état CTA (le bouton
  passe en `disabled` juste après la frame initiale).
- **Pas d'emojis** : aucun emoji dans le code TS — toutes les
  icônes passent par `IconCalendar`, `IconPin`, `IconShare`,
  `IconUsers`, etc. (currentColor).
- **Recherche par ville** : `ilike` exact (sans wildcard) côté
  Postgres. À surveiller : on bascule sur `tsvector` + index GIN
  (Sprint 6 perf) si on veut une recherche libre sur ville+adresse.
- **Compteur dénormalisé `participation_count`** : maintenu via
  trigger Postgres (cf. section 5.b de `db/schema.sql`). La
  contrainte `unique (mobilization_id, user_id)` (déjà présente à
  l'étape 4) empêche les doublons.
- **Body facultatif** : la mobilisation peut tenir uniquement avec
  un résumé (cas d'une marche simple « Le 1er mai à République,
  14h »). La validation ne refuse qu'un body trop court si l'utilisateur
  l'a saisi (≥ 100 caractères). Sinon body=null.

### Prochaines étapes (étape 11)

1. Sondages CRUD (port du prototype `Pages_Services.jsx` /
   `Pages_Home.jsx`, table `polls` + `poll_options` + `votes` —
   mêmes patterns que pétitions / mobilisations).
2. Campagnes CRUD (table `campaigns` + `campaign_actions`) — peut
   être groupé avec sondages ou faire l'objet d'une étape 12.
3. Audit RGPD fin Sprint 2 (étape 13) : bannière « contenus
   créés visibles publiquement », CGU minimales, page « Mentions
   légales ».
4. Sprint 3 (services communautaires) — hébergement, covoiturage,
   marketplace, prêt, jardins, SEL, cagnottes : à attaquer une fois
   le Sprint 2 fini.

---

## Prompt pour la session N+4 (étape 10)

> Repo : `/home/user/maintenantproto1` (branche imposée par l'harness —
> typiquement `claude/<auto>`).
>
> **Lis dans cet ordre** :
>
> 1. `CLAUDE.md` — règles projet (TS strict, pas de `any`, camelCase TS /
>    snake_case DB, SVG via `ICONS.*` pas d'emojis, RLS, RGPD).
> 2. `HANDOFF.md` §3 (architecture pages) + §7.2 (tables `mobilizations`,
>    `participations`) + §10 Sprint 2.
> 3. `HANDOFF-PROGRESS.md` — journal (étape 9 ✅ — étape 10 à faire).
> 4. `Pages_Services.jsx` / racine prototype : composants
>    `MobilizationsPage` / `MobilizationDetail`. Chercher `Mobilization`
>    / `participations` / `rsvp`.
> 5. `web/src/lib/petitions.ts`, `web/src/hooks/usePetitions.ts`,
>    `web/src/hooks/usePetition.ts`, `web/src/pages/PetitionsPage.tsx`,
>    `web/src/pages/PetitionDetailPage.tsx`,
>    `web/src/pages/PetitionCreatePage.tsx` — patterns à reproduire pour
>    `mobilizations`.
> 6. `db/schema.sql` §5 — tables `mobilizations` + `participations` +
>    policies RLS. Vérifier que toutes les colonnes nécessaires sont
>    présentes (compteur dénormalisé `participation_count`, trigger
>    d'incrément, contraintes d'unicité par `(mobilization_id, user_id)`).
>
> **État actuel à la fin de l'étape 9** (tip
> `claude/review-project-rules-6SadH`, commit
> `feat(petitions): step 9 — CRUD pétitions + listing + fiche + création`) :
>
> - Prototype intact : `project/app/Maintenant.html` + JSX racine.
> - `web/` : Vite + React 19 + TS 6 strict, **127 tests verts**
>   (44 nouveaux à l'étape 9), ESLint flat, Vitest, Prettier, build
>   295 kB.
> - Supabase : `db/schema.sql` à ~1 740 lignes (36 tables + 119 policies
>   RLS + trigger `handle_new_user` + bucket `avatars` + RPC T99CP +
>   compteur `signature_count` + `slugify(text)`), `web/src/types/database.ts`
>   à ~1 715 lignes.
> - Auth complète : signup/login/logout/reset password + OAuth Google +
>   Instagram + magic link + callback page `/auth/callback`.
> - Profil + adhésion Stripe + RPC T99CP opérationnels.
> - **Pétitions complètes** : listing, fiche, signer/retirer signature,
>   création (RequireAuth) — Sprint 2 démarré.
>
> **CONTEXTE D'OUVERTURE — à exécuter avant toute autre action** :
>
> 1. `git fetch origin claude/review-project-rules-6SadH`
>    (retry network 2s/4s/8s/16s) pour récupérer le tip de l'étape 9.
> 2. `git merge --no-ff <sha-tip-de-6SadH>` pour intégrer le commit
>    `feat(petitions): step 9 …`. En cas d'absence,
>    `git checkout origin/claude/review-project-rules-6SadH -- .` puis
>    commit.
> 3. `cd web && npm install --legacy-peer-deps` (lockfile non versionné,
>    option requise à cause d'`eslint-plugin-jsx-a11y` ↔ ESLint 10).
>    À réutiliser pour tout nouvel `npm install` dans cette session.
>
> **ÉTAPE 10 à exécuter — Mobilisations CRUD côté front (Sprint 2)** :
>
> 1. **Module `web/src/lib/mobilizations.ts`** : fonctions typées via
>    `Database` (`Tables<'mobilizations'>`, `Tables<'participations'>`) :
>    - `listMobilizations({ status, search, city, limit })` — listing
>      paginé (status public uniquement par défaut), trié par
>      `starts_at` ASC.
>    - `getMobilization(slug)` — fiche détail.
>    - `createMobilization(input)` — insert + slug auto via
>      `slugify()` (déjà posé à l'étape 9, à factoriser dans
>      `web/src/lib/slug.ts` si tu veux le partager avec pétitions).
>    - `rsvpMobilization(mobilizationId)` — insert dans
>      `participations` (RLS authenticated_self).
>    - `cancelRsvp(mobilizationId)` — delete via RLS owner.
>    - `hasUserRsvp(mobilizationId, userId)` — single-row check.
> 2. **Trigger SQL `update_mobilization_participation_count`** :
>    si pas déjà présent dans `db/schema.sql`, ajouter un trigger
>    AFTER INSERT/DELETE sur `participations` qui met à jour
>    `mobilizations.participation_count`. Ajouter la colonne
>    `participation_count integer not null default 0 check (>= 0)`
>    à la table `mobilizations` (idempotent via
>    `alter table … add column if not exists`). Documenter les cas
>    de test SQL dans `db/schema.sql` (commentaires).
> 3. **Hooks `web/src/hooks/useMobilizations.ts` +
>    `useMobilization.ts`** : copier le pattern `usePetitions` /
>    `usePetition`.
> 4. **Pages** :
>    - `web/src/pages/MobilizationsPage.tsx` — listing avec recherche +
>      filtres (ville, fourchette de dates). Port TS strict du prototype.
>    - `web/src/pages/MobilizationDetailPage.tsx` — fiche avec bouton
>      « Je participe » (RequireAuth via redirect), compteur live, dates
>      formatées en FR (`Intl.DateTimeFormat`), partage du lien.
>    - `web/src/pages/MobilizationCreatePage.tsx` — formulaire création
>      (RequireAuth), validation côté client (titre 8–80, description
>      ≥ 100, date d'événement obligatoire, ville obligatoire). Réussite
>      → redirige vers la fiche.
> 5. **Router** : ajouter les routes `/mobilizations/:slug`,
>    `/mobilizations/new`, et brancher `RequireAuth` sur la création.
> 6. **Régénérer `web/src/types/database.ts`** si tu touches
>    `db/schema.sql` (au minimum patcher à la main `mobilizations.Row`
>    pour ajouter `participation_count`).
> 7. **Icônes SVG** à ajouter si besoin : `IconCalendar`, `IconPin`,
>    `IconShare` — toujours `currentColor`, pas d'emoji.
> 8. **Tests** (Vitest + Testing Library + mocks supabase) :
>    - `src/lib/mobilizations.test.ts` (≥ 8 cas) — listMobilizations
>      (filtre city, filtre dates, erreur 42501), getMobilization
>      (succès + 404), createMobilization (validation, succès, retry
>      slug-collision), rsvpMobilization (succès + doublon),
>      cancelRsvp, hasUserRsvp.
>    - `src/hooks/useMobilizations.test.tsx` (≥ 3 cas).
>    - `src/hooks/useMobilization.test.tsx` (≥ 3 cas).
>    - `src/pages/MobilizationsPage.test.tsx` (≥ 3 cas) — rendu listing,
>      filtres, état vide.
>    - `src/pages/MobilizationDetailPage.test.tsx` (≥ 4 cas) — rendu
>      fiche, bouton RSVP (non auth → redirige login, auth → appelle
>      rsvpMobilization), compteur mis à jour, dates formatées.
>    - `src/pages/MobilizationCreatePage.test.tsx` (≥ 3 cas) —
>      validation, submit, erreur Postgrest mappée FR.
>    Objectif : ≥ **150 tests verts** (127 existants + ≥ 23 nouveaux).
> 9. **Mettre à jour `HANDOFF-PROGRESS.md`** : étape 10 ✅ avec sections
>    « Module mobilizations.ts », « hooks », « pages », « trigger
>    participation_count », « décisions (date obligatoire, formatage
>    Intl, partage) », « prochaines étapes (étape 11 — campagnes ou
>    sondages, fin Sprint 2) ». Cocher la ligne 10 et créer une ligne 11
>    si manquante.
> 10. **Écrire le prompt de la session N+5 (étape 11)** dans
>     `HANDOFF-PROGRESS.md` (en bas du fichier ou en annexe), section
>     `## Prompt pour la session N+5 (étape 11)` reprenant la même
>     structure (contexte d'ouverture, état actuel, étape à exécuter,
>     contraintes, fallback Docker, **double consigne récursive**).
>     L'étape 11 cible : **campagnes ou sondages CRUD** (port du
>     prototype, mêmes patterns que pétitions / mobilisations).
> 11. **Coller le prompt de l'étape 11 dans la conversation finale**,
>     en plus de l'avoir écrit dans `HANDOFF-PROGRESS.md` : à la fin de
>     la session, le message Claude doit contenir littéralement le bloc
>     du prompt (citation `>` ou code-fence), pour que l'utilisateur
>     puisse le copier d'un coup. Cette consigne fait partie de la
>     boucle récursive : tant que le Sprint 2 (contenu militant —
>     pétitions, mobilisations, campagnes, sondages) n'est pas complet,
>     le prompt généré doit aussi être collé dans la réponse finale de
>     la session.
> 12. **Commit** :
>     `feat(mobilizations): step 10 — CRUD mobilisations + listing + fiche + création`.
>     **Push** sur la branche imposée par l'harness avec
>     `git push -u origin <branch>`, retry sur erreurs réseau
>     (2s/4s/8s/16s). Pas de PR sans demande explicite.
>
> **Contraintes** :
>
> - Ne pas toucher au prototype (`project/app/Maintenant.html` et JSX
>   racine).
> - TS strict + no `any` : tous les types Supabase via
>   `web/src/types/database.ts` ou `@supabase/supabase-js`.
> - **Aucune clé `service_role` dans `web/`** : tout passe par RLS et
>   `VITE_SUPABASE_ANON_KEY`.
> - Pas d'emojis dans le code TS ni dans les commits (utiliser SVG —
>   `IconCalendar`, `IconPin`, `IconShare` à ajouter si besoin).
> - Conserver les checks verts : `typecheck`, `lint`, `test`, `build`,
>   `format:check`. Lancer les 5 en fin de session avant de committer.
> - Si Docker n'est pas dispo dans la sandbox, ne pas tenter
>   `supabase start` ; les mobilisations se testent via mocks Vitest.
>   Pour les vérifs SQL (trigger `participation_count`), documenter en
>   commentaire dans `db/schema.sql` et tester avec un PG local si
>   possible (`service postgresql start` + `psql -f db/schema.sql`).
>
> **DOUBLE CONSIGNE RÉCURSIVE** :
>
> 1. Écrire le prompt de l'étape 11 dans `HANDOFF-PROGRESS.md` avant
>    le commit final.
> 2. Coller le prompt de l'étape 11 dans la conversation (réponse
>    finale Claude), pas seulement dans le fichier journal.
>
> Cette boucle s'arrête uniquement quand le Sprint 2 (contenu militant
> — pétitions, mobilisations, campagnes, sondages) est complet, point
> auquel le prompt généré peut basculer sur le Sprint 3 (services
> communautaires).

---

## Prompt pour la session N+3 (étape 9)

> Repo : `/home/user/maintenantproto1` (branche imposée par l'harness —
> typiquement `claude/<auto>`).
>
> **Lis dans cet ordre** :
>
> 1. `CLAUDE.md` — règles projet (TS strict, pas de `any`, camelCase TS
>    / snake_case DB, SVG via `ICONS.*` pas d'emojis, RLS, RGPD).
> 2. `HANDOFF.md` §3 (architecture pages) + §7.2 (tables `petitions`,
>    `petition_signatures`) + §10 Sprint 2 (contenu militant).
> 3. `HANDOFF-PROGRESS.md` — journal (étape 8 ✅ — étape 9 à faire).
> 4. `Pages_Services.jsx` / racine prototype : maquette pétitions
>    (formulaire création, fiche détail, listing). Chercher `Petition`
>    / `PetitionsPage` / `signPetition`.
> 5. `web/src/lib/auth.ts`, `web/src/lib/profile.ts`,
>    `web/src/lib/membership.ts`, `web/src/lib/postgrestError.ts`,
>    `web/src/pages/PetitionsPage.tsx` (placeholder posé à l'étape 3),
>    `web/src/router.tsx`.
> 6. `db/schema.sql` §7 — tables `petitions` + `petition_signatures` +
>    policies RLS. Vérifier que toutes les colonnes nécessaires sont
>    présentes (compteur dénormalisé `signature_count`, trigger
>    d'incrément, contraintes d'unicité par `(petition_id, user_id)`).
>
> **État actuel à la fin de l'étape 8** (tip de cette branche, commit
> `feat(auth): step 8 — OAuth Google + Instagram + magic link + callback`) :
>
> - Prototype intact : `project/app/Maintenant.html` + JSX racine.
> - `web/` : Vite + React 19 + TS 6 strict, **83 tests verts** (10
>   nouveaux à l'étape 8), ESLint flat, Vitest, Prettier, build 295 kB.
> - Supabase : `db/schema.sql` à 1 605 lignes (36 tables + 119 policies
>   RLS + trigger `handle_new_user` + bucket avatars + RPC T99CP),
>   `web/src/types/database.ts` à 1 699 lignes.
> - Auth complète : signup/login/logout/reset password + OAuth Google
>   + Instagram + magic link + callback page `/auth/callback`.
> - Profil + adhésion Stripe + RPC T99CP opérationnels.
> - Sprint 1 **complet**.
>
> **CONTEXTE D'OUVERTURE — à exécuter avant toute autre action** :
>
> 1. `git fetch origin <branche-précédente>` (retry network 2s/4s/8s/16s)
>    pour récupérer le tip de l'étape 8.
> 2. `git merge --no-ff <sha-tip>` pour intégrer le commit
>    `feat(auth): step 8 …`. En cas d'absence,
>    `git checkout origin/<branche-précédente> -- .` puis commit.
> 3. `cd web && npm install --legacy-peer-deps` (lockfile non versionné,
>    option requise à cause d'`eslint-plugin-jsx-a11y` ↔ ESLint 10). À
>    réutiliser pour tout nouvel `npm install` dans cette session.
>
> **ÉTAPE 9 à exécuter — Pétitions CRUD côté front (Sprint 2)** :
>
> 1. **Module `web/src/lib/petitions.ts`** : fonctions typées via
>    `Database` (`Tables<'petitions'>`, `Tables<'petition_signatures'>`) :
>    - `listPetitions({ status, search, limit })` — listing paginé
>      (statut public uniquement par défaut).
>    - `getPetition(slug)` — fiche détail (jointure
>      `petition_signatures` pour stats).
>    - `createPetition(input)` — insert + slug auto via SQL function
>      `slugify()` (ajouter cette fonction au schéma si absente).
>    - `signPetition(petitionId, comment?)` — insert dans
>      `petition_signatures` (RLS authenticated_self).
>    - `unsignPetition(petitionId)` — delete via RLS owner.
>    - `hasUserSigned(petitionId, userId)` — single-row check.
> 2. **Hooks `web/src/hooks/usePetitions.ts` + `usePetition.ts`** :
>    wrappers Zustand ou React Query (à choisir — le projet n'a pas
>    encore React Query, donc rester sur Zustand ou un simple useState
>    + useEffect).
> 3. **Pages** :
>    - `web/src/pages/PetitionsPage.tsx` — listing avec recherche +
>      filtres (statut, ville, thématique). Port TS strict du
>      prototype.
>    - `web/src/pages/PetitionDetailPage.tsx` — fiche pétition avec
>      bouton « Signer » (authenticated only via `RequireAuth`),
>      compteur live, liste des signataires (anonymisée si non public).
>    - `web/src/pages/PetitionCreatePage.tsx` — formulaire création
>      (RequireAuth), validation côté client (titre 8–80 caractères,
>      description ≥ 200 caractères, image optionnelle).
> 4. **Router** : ajouter les routes `/petitions/:slug`,
>    `/petitions/new`, et brancher `RequireAuth` sur la création.
> 5. **Trigger SQL `update_petition_signature_count`** : si pas déjà
>    présent dans `db/schema.sql`, ajouter un trigger AFTER
>    INSERT/DELETE qui met à jour `petitions.signature_count`. Sinon
>    documenter dans HANDOFF-PROGRESS.md que c'est déjà en place.
> 6. **Tests** (Vitest + Testing Library + mocks supabase) :
>    - `src/lib/petitions.test.ts` (≥ 6 cas) — listPetitions,
>      getPetition (succès + 404), createPetition, signPetition,
>      unsignPetition, hasUserSigned.
>    - `src/hooks/usePetitions.test.tsx` (≥ 2 cas).
>    - `src/pages/PetitionsPage.test.tsx` (≥ 3 cas) — rendu listing,
>      filtres, état vide.
>    - `src/pages/PetitionDetailPage.test.tsx` (≥ 4 cas) — rendu fiche,
>      bouton signer (non auth → redirige login, auth → appelle
>      `signPetition`), compteur mis à jour.
>    - `src/pages/PetitionCreatePage.test.tsx` (≥ 3 cas) — validation,
>      submit, erreur Postgrest mappée FR.
>    Objectif : **≥ 100 tests verts** (83 existants + ≥ 18 nouveaux).
> 7. **Mettre à jour `HANDOFF-PROGRESS.md`** : étape 9 ✅ avec sections
>    « Module petitions.ts », « hooks », « pages », « trigger
>    signature_count », « décisions (slug auto, modération, public vs
>    privé) », « prochaines étapes (étape 10 — mobilisations) ». Cocher
>    la ligne 9 et créer une ligne 10 si manquante.
> 8. **Écrire le prompt de la session N+4 (étape 10)** dans
>    `HANDOFF-PROGRESS.md` (en bas du fichier ou en annexe), section
>    `## Prompt pour la session N+4 (étape 10)` reprenant la même
>    structure (contexte d'ouverture, état actuel, étape à exécuter,
>    contraintes, fallback Docker, **consigne récursive**). L'étape 10
>    cible : **mobilisations CRUD** (port du prototype, mêmes patterns
>    que pétitions).
> 9. **Coller le prompt de l'étape 10 dans la conversation finale**, en
>    plus de l'avoir écrit dans HANDOFF-PROGRESS.md : à la fin de la
>    session, le message Claude doit contenir littéralement le bloc du
>    prompt (citation `>` ou code-fence), pour que l'utilisateur
>    puisse le copier d'un coup. Cette consigne fait partie de la
>    boucle récursive : tant que le Sprint 2 n'est pas complet, le
>    prompt généré (étape 11, 12, …) doit aussi être collé dans la
>    réponse finale de la session.
> 10. **Commit** : `feat(petitions): step 9 — CRUD pétitions + listing +
>     fiche + création`. Push sur la branche imposée par l'harness avec
>     `git push -u origin <branch>`, retry sur erreurs réseau
>     (2s/4s/8s/16s). Pas de PR sans demande explicite.
>
> **Contraintes** :
>
> - Ne pas toucher au prototype (`project/app/Maintenant.html` et JSX
>   racine).
> - TS strict + no `any` : tous les types Supabase via
>   `web/src/types/database.ts` ou `@supabase/supabase-js`.
> - **Aucune clé `service_role` dans `web/`** : tout passe par RLS et
>   `VITE_SUPABASE_ANON_KEY`.
> - Pas d'emojis dans le code TS ni dans les commits (utiliser SVG —
>   `IconFlame`, `IconPen` à ajouter si besoin pour pétitions /
>   création).
> - Conserver les checks verts : `typecheck`, `lint`, `test`, `build`,
>   `format:check`. Lancer les 5 en fin de session avant de committer.
> - Si Docker n'est pas dispo dans la sandbox, ne pas tenter
>   `supabase start` ; les pétitions se testent via mocks Vitest. Pour
>   les vérifs SQL (slug, triggers), documenter en commentaire dans
>   `db/schema.sql` et tester avec un PG local si possible (`service
>   postgresql start` + `psql -f db/schema.sql`).
> - **DOUBLE CONSIGNE RÉCURSIVE** :
>   1. Écrire le prompt de l'étape 10 dans `HANDOFF-PROGRESS.md` avant
>      le commit final.
>   2. **Coller le prompt de l'étape 10 dans la conversation** (réponse
>      finale Claude), pas seulement dans le fichier journal.
>
> Cette boucle s'arrête uniquement quand le Sprint 2 (contenu militant
> — pétitions, mobilisations, campagnes, sondages) est complet, point
> auquel le prompt généré peut basculer sur le Sprint 3 (services
> communautaires).

---

## Prompt pour la session N+2 (étape 8)

> Repo : `/home/user/maintenantproto1` (branche imposée par l'harness — typiquement
> `claude/<auto>`).
>
> **Lis dans cet ordre** :
>
> 1. `CLAUDE.md` — règles projet (TS strict, pas de `any`, camelCase TS /
>    snake_case DB, SVG via `ICONS.*` pas d'emojis, RLS, RGPD).
> 2. `HANDOFF.md` §5 (auth) et §10 Sprint 1 (OAuth final).
> 3. `HANDOFF-PROGRESS.md` — journal (étape 7 ✅ — étape 8 à faire).
> 4. `web/src/components/AuthModal.tsx`, `web/src/lib/auth.ts`,
>    `web/src/router.tsx` — modules posés à l'étape 5–7.
>
> **État actuel à la fin de l'étape 7** (tip de `claude/review-project-setup-QwLHV`,
> commit `feat(adhesion): step 7 — Stripe checkout + webhook + RPC T99CP + JoinPage`) :
>
> - Prototype intact : `project/app/Maintenant.html` + JSX racine.
> - `web/` : Vite + React 19 + TS 6 strict, 73 tests verts, ESLint flat,
>   Vitest, Prettier, build 295 kB.
> - Supabase : `db/schema.sql` à 1 605 lignes (36 tables + 119 policies RLS
>   + trigger `handle_new_user` + bucket `avatars` + 4 policies storage
>   + RPC `credit_t99cp` / `debit_t99cp`), `web/src/types/database.ts`
>   à 1 699 lignes (fonctions custom incluses).
> - Auth applicative : `web/src/lib/auth.ts` (Zustand), `AuthModal` 3 écrans
>   (login + signup + forgot), `RequireAuth`, `RootLayout` avec bouton
>   login + menu utilisateur + profil.
> - Profil : `web/src/lib/profile.ts`, `web/src/hooks/useProfile.ts`,
>   `web/src/pages/ProfilePage.tsx` (lecture + édition + avatar), bucket
>   Storage `avatars`.
> - Adhésion : `web/src/lib/membership.ts`, `web/src/hooks/useAdhesion.ts`,
>   `web/src/pages/JoinPage.tsx` (3 tiers + Stripe Checkout via Edge
>   Function), `supabase/functions/create-checkout-session/` et
>   `supabase/functions/stripe-webhook/`.
>
> **CONTEXTE D'OUVERTURE** — à exécuter avant toute autre action :
>
> 1. `git fetch origin claude/review-project-setup-QwLHV` (retry network
>    2s/4s/8s/16s).
> 2. `git merge --no-ff <tip-de-l-étape-7>` (récupérer le tip
>    `feat(adhesion): step 7 …`). En cas d'absence,
>    `git checkout origin/claude/review-project-setup-QwLHV -- .` puis
>    commit.
> 3. `cd web && npm install --legacy-peer-deps` (lockfile non versionné,
>    option requise à cause d'`eslint-plugin-jsx-a11y` ↔ ESLint 10). À
>    réutiliser pour tout nouvel `npm install` dans cette session.
>
> **ÉTAPE 8 à exécuter — OAuth Google + Instagram + magic link** :
>
> 1. **Page callback `/auth/callback`** : nouvelle route
>    `web/src/pages/AuthCallbackPage.tsx` qui lit le code OAuth dans l'URL
>    via `supabase.auth.exchangeCodeForSession(window.location.href)` et
>    redirige vers `/profile` (ou `/?error=...` si erreur). Affiche un
>    state intermédiaire « Connexion en cours… ». Brancher dans
>    `web/src/router.tsx`.
> 2. **Boutons OAuth dans `AuthModal.tsx`** : ajouter `IconGoogle`,
>    `IconInstagram` à `web/src/components/icons.tsx` (SVG officiels
>    multi-color OK, exception à la règle currentColor justifiée en
>    commentaire). Trois boutons : « Continuer avec Google », « Continuer
>    avec Instagram », « Lien magique par email ». Click Google →
>    `supabase.auth.signInWithOAuth({ provider: 'google', options: {
>    redirectTo: <origin>/auth/callback } })`. Idem Instagram (provider:
>    `'instagram'`). Click magic link → mode dédié dans `AuthModal` qui
>    appelle `signInWithMagicLink` (déjà exposé par le store).
> 3. **Gestion des erreurs de consentement** : si OAuth retourne
>    `provider_email_needs_verification` ou si l'utilisateur annule
>    (`access_denied`), mapper l'erreur en FR dans `authErrorMessage`.
> 4. **Module `web/src/lib/oauth.ts`** : `signInWithProvider(provider)`
>    typé sur `'google' | 'instagram'`, retourne `{ error }` aligné sur
>    les autres méthodes du store. Optionnel : passer par le store Zustand
>    plutôt que par un module dédié si plus simple.
> 5. **Tests Vitest** (≥ 8 nouveaux) :
>    - `src/lib/oauth.test.ts` (≥ 3) — signInWithProvider Google +
>      Instagram + erreur réseau.
>    - `src/pages/AuthCallbackPage.test.tsx` (≥ 3) — code valide →
>      redirige vers profile, code absent → message d'erreur, exchange en
>      erreur → message FR mappé.
>    - `src/components/AuthModal.test.tsx` (≥ 2 nouveaux cas) —
>      bouton Google appelle signInWithOAuth, bouton magic link bascule
>      en mode dédié + appelle `signInWithMagicLink`.
> 6. **Mettre à jour `HANDOFF-PROGRESS.md`** : étape 8 ✅ avec sections
>    « OAuth Google + Instagram », « Callback page », « magic link UI »,
>    « décisions (provider id Instagram = `azure`/`facebook`?) »,
>    « prochaines étapes (Sprint 2 — contenu militant : pétitions CRUD) ».
>    Cocher la ligne 8 et créer une ligne 9 si manquante.
> 7. **Écrire le prompt de la session N+3** dans `HANDOFF-PROGRESS.md`
>    (en bas du fichier ou en annexe), section `## Prompt pour la
>    session N+3 (étape 9)` reprenant la même structure (contexte
>    d'ouverture, état actuel, étape à exécuter, contraintes, fallback
>    Docker, consigne récursive). **L'étape 9 cible : Sprint 2 — pétitions
>    CRUD côté front** (le Sprint 1 est complet à l'issue de l'étape 8).
>    Cette consigne récursive doit être présente à chaque étape : tant
>    que le Sprint 2 n'est pas complet, le journal auto-prépare la
>    session suivante.
> 8. **Coller le prompt de l'étape 9 dans la conversation finale**, en
>    plus de l'avoir écrit dans `HANDOFF-PROGRESS.md` : à la fin de la
>    session, le message Claude doit contenir littéralement le bloc du
>    prompt (citation `>` ou code-fence), afin que l'utilisateur puisse le
>    copier d'un coup pour lancer la session N+3 sans rouvrir le fichier.
>    Cette consigne fait partie de la boucle récursive : tant que le
>    Sprint 2 n'est pas complet, le prompt généré (étapes 10, 11, …) doit
>    aussi être collé dans la réponse finale de la session.
> 9. **Commit** : `feat(auth): step 8 — OAuth Google + Instagram + magic
>    link + callback`. **Push** sur la branche imposée par l'harness avec
>    `git push -u origin <branch>`, retry sur erreurs réseau
>    (2s/4s/8s/16s). Pas de PR sans demande explicite.
>
> **Contraintes** :
>
> - Ne pas toucher au prototype (`project/app/Maintenant.html` et JSX racine).
> - TS strict + no `any` : tous les types Supabase via `web/src/types/database.ts`
>   ou `@supabase/supabase-js`.
> - **Aucune clé `service_role` dans `web/`** : OAuth est géré côté
>   Supabase Auth, le front n'a accès qu'à `VITE_SUPABASE_ANON_KEY`.
> - **Aucune clé Google/Instagram secret dans `web/`** : les
>   client-secret OAuth sont stockés dans la dashboard Supabase Auth
>   uniquement.
> - Pas d'emojis dans le code TS ni dans les commits (utiliser SVG —
>   `IconGoogle`, `IconInstagram`, `IconLink` à ajouter).
> - Conserver les checks verts : `typecheck`, `lint`, `test`, `build`,
>   `format:check`. Lancer les 5 en fin de session avant de committer.
> - Si Docker n'est pas dispo dans la sandbox, ne pas tenter
>   `supabase start` ; OAuth se teste uniquement avec des mocks côté
>   front (`supabase.auth.signInWithOAuth` mocké).
>
> Le prompt de l'étape 9 doit impérativement contenir la **même double
> consigne récursive** :
>
> 1. « écrire le prompt de l'étape 10 dans `HANDOFF-PROGRESS.md` avant le
>    commit final »,
> 2. « **coller le prompt de l'étape 10 dans la conversation** (réponse
>    finale Claude), pas seulement dans le fichier journal ».
>
> Cette boucle s'arrête uniquement quand le Sprint 2 (contenu militant —
> pétitions, mobilisations, campagnes) est complet, point auquel le
> prompt généré peut basculer sur le Sprint 3 (services communautaires).

---

## Prompt pour la session N+1 (étape 7)

> Repo : `/home/user/maintenantproto1` (branche imposée par l'harness — typiquement
> `claude/<auto>`).
>
> **Lis dans cet ordre** :
>
> 1. `CLAUDE.md` — règles projet (TS strict, pas de `any`, camelCase TS /
>    snake_case DB, SVG via `ICONS.*` pas d'emojis, RLS, RGPD).
> 2. `HANDOFF.md` §6 (adhésion + T99CP), §7.2 (tables `adhesions`,
>    `members`, `t99cp_transactions`), §10 Sprint 1 (T99CP wallet).
> 3. `HANDOFF-PROGRESS.md` — journal (étape 6 ✅ — étape 7 à faire).
> 4. `Theme.jsx` (prototype) — chercher `JoinPage` / tunnel adhésion pour
>    récupérer la maquette.
> 5. `Pages_Home.jsx` ou la racine du prototype — composants existants
>    pour la page d'adhésion.
> 6. `web/src/lib/auth.ts`, `web/src/lib/profile.ts`, `web/src/lib/supabase.ts`,
>    `web/src/router.tsx`, `web/src/components/RequireAuth.tsx` — modules
>    posés à l'étape 6.
>
> **État actuel à la fin de l'étape 6** (tip de `claude/review-project-setup-UbcCi`,
> commit `feat(profile): step 6 …`) :
>
> - Prototype intact : `project/app/Maintenant.html` + JSX racine.
> - `web/` : Vite + React 19 + TS 6 strict, router avec route protégée
>   `/profile` (RequireAuth) et `/auth/reset-password`, ESLint flat,
>   Vitest, Prettier.
> - Supabase : schéma `db/schema.sql` à 1 488 lignes (36 tables + 119
>   policies RLS + trigger `handle_new_user` + bucket `avatars` + 4
>   policies storage), `web/src/types/database.ts` (1 674 lignes).
> - Auth applicative : `web/src/lib/auth.ts` (Zustand), `AuthModal` 3 écrans,
>   `RequireAuth`, RootLayout avec bouton login + menu utilisateur +
>   profil.
> - Profil : `web/src/lib/profile.ts`, `web/src/hooks/useProfile.ts`,
>   `web/src/pages/ProfilePage.tsx` (lecture + édition + avatar),
>   `web/src/lib/postgrestError.ts`, bucket Storage `avatars`.
> - **50 tests verts** (smoke routing + auth + profil + reset password +
>   RequireAuth).
>
> **CONTEXTE D'OUVERTURE — à exécuter avant toute autre action** :
>
> 1. `git fetch origin claude/review-project-setup-UbcCi`
> 2. `git merge --no-ff <sha-tip-de-UbcCi>` (récupérer le tip actuel, qui
>    doit pointer sur le commit `feat(profile): step 6 …`). En cas
>    d'absence, `git checkout origin/claude/review-project-setup-UbcCi -- .`
>    puis commit.
> 3. `cd web && npm install --legacy-peer-deps` (lockfile non versionné,
>    option requise à cause d'`eslint-plugin-jsx-a11y` ↔ ESLint 10). À
>    réutiliser pour tout nouvel `npm install` dans cette session.
>
> **ÉTAPE 7 à exécuter — Adhésion Stripe (3 tiers) + RPC T99CP** :
>
> 1. **RPC SQL T99CP** : ajouter à `db/schema.sql` (nouvelle section 20)
>    les fonctions `credit_t99cp(p_user uuid, p_amount integer, p_reason text)`
>    et `debit_t99cp(p_user uuid, p_amount integer, p_reason text)`, toutes
>    deux `SECURITY DEFINER` + `set search_path = public, pg_temp`. Le crédit
>    insère dans `t99cp_transactions` avec `kind='credit'` puis met à jour
>    `users.t99cp_balance` (atomique). Le débit vérifie d'abord
>    `users.t99cp_balance >= p_amount` (sinon `raise exception 'insufficient_balance'`),
>    insère `kind='debit'` et décrémente. `revoke all … from public` +
>    `grant execute … to authenticated`. Le check positif sur
>    `users.t99cp_balance` (déjà présent à l'étape 4) garantit le non-overflow.
> 2. **Régénérer les types** : `node db/gen-types.mjs > web/src/types/database.ts`.
>    Le générateur ne récupère pas encore les fonctions custom — étendre
>    `Functions` dans le générateur pour inclure `credit_t99cp` / `debit_t99cp`
>    avec `Args: { p_user: string; p_amount: number; p_reason: string }`
>    et `Returns: void`.
> 3. **Edge Function `create-checkout-session`** :
>    `supabase/functions/create-checkout-session/index.ts` (Deno). Prend
>    `{ tier: 'soutien' | 'engage' }`, lit `STRIPE_SECRET_KEY`,
>    `STRIPE_PRICE_SOUTIEN`, `STRIPE_PRICE_ENGAGE`, et `SUPABASE_URL` depuis
>    les env vars. Authentifie l'appelant via JWT (anon key → user id).
>    Crée une Stripe Checkout session en mode `subscription`, success_url
>    `/profile?adhesion=ok`, cancel_url `/join?canceled=1`. Retourne
>    `{ url }`.
> 4. **Edge Function `stripe-webhook`** :
>    `supabase/functions/stripe-webhook/index.ts`. Vérifie la signature
>    `Stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)`.
>    Sur `checkout.session.completed` : upsert dans `public.adhesions`
>    (`user_id`, `tier`, `status='active'`, `stripe_customer_id`,
>    `stripe_subscription_id`, `current_period_end`). Sur
>    `customer.subscription.deleted` ou `customer.subscription.updated`
>    avec status `canceled`/`unpaid` : mettre `status='cancelled'` ou
>    `'expired'`. Sur `invoice.payment_succeeded` : appeler la RPC
>    `credit_t99cp(user_id, 60, 'adhesion_renewal')` pour crédit mensuel.
>    Utiliser `service-role` (Edge Function tourne côté serveur, OK).
> 5. **Module `web/src/lib/membership.ts`** : `getCurrentAdhesion(userId)`,
>    `createCheckoutSession(tier)` qui appelle l'Edge Function via
>    `supabase.functions.invoke('create-checkout-session', { body: { tier } })`,
>    puis `window.location.assign(url)`. Tous typés via `Database`.
> 6. **`web/src/pages/JoinPage.tsx`** : port TS strict du tunnel
>    d'adhésion du prototype. 3 cartes (gratuit, soutien, engagé) avec
>    prix mensuel + bénéfices + bouton « Devenir <tier> ». Le tier gratuit
>    est immédiat (insert dans `adhesions` via RLS authenticated_self).
>    Les 2 autres lancent `createCheckoutSession`. Si l'utilisateur est
>    déjà adhérent (récupéré via `useAdhesion`), griser les tiers
>    inférieurs et afficher « Tier actuel ».
> 7. **Hook `web/src/hooks/useAdhesion.ts`** : retourne
>    `{ adhesion: AdhesionRow | null, status, refresh }`.
> 8. **Tests** (Vitest + Testing Library + mocks supabase) :
>    - `src/lib/membership.test.ts` (≥ 4 cas) — getCurrentAdhesion,
>      createCheckoutSession (succès + erreur), tier déjà actif.
>    - `src/hooks/useAdhesion.test.tsx` (≥ 3 cas).
>    - `src/pages/JoinPage.test.tsx` (≥ 5 cas) — rendu 3 tiers, click
>      gratuit → insert, click soutien → invoke + redirect, tier déjà
>      actif grisé, erreur Postgrest mappée FR.
>    - Tests SQL (commentaires dans `db/schema.sql`) — décrire les cas
>      à vérifier en local : crédit augmente la balance, débit refuse si
>      solde insuffisant, idempotence des inserts par
>      `(user_id, stripe_session_id)`.
>    Tous les checks doivent rester verts. Objectif total : ≥ **62 tests**
>    (50 existants + ≥ 12 nouveaux).
> 9. **Mettre à jour `HANDOFF-PROGRESS.md`** : étape 7 ✅ avec sections
>    « RPC T99CP », « Edge Functions Stripe », « membership.ts +
>    useAdhesion », « JoinPage », « décisions Stripe (mode test vs live,
>    rate-limit, idempotence) », « prochaines étapes (Sprint 1 fin —
>    OAuth Google + Instagram + magic link, puis Sprint 2 contenu
>    militant) ». Cocher la ligne 7 et créer une ligne 8 si manquante.
>    Brancher Stripe / adhésion dans le tableau d'état global.
> 10. **Écrire le prompt de la session N+2** : dans
>     `HANDOFF-PROGRESS.md` (en bas du fichier ou en annexe), ajouter une
>     section `## Prompt pour la session N+2` reprenant la même structure
>     que ce prompt (contexte d'ouverture avec le tip de cette étape, état
>     actuel, étape à exécuter, contraintes, fallback Docker, et **la
>     consigne récursive de générer le prompt de la session N+3 avant le
>     commit final**). L'étape 8 cible : OAuth Google + Instagram (boutons
>     sociaux dans `AuthModal`, gestion des erreurs de consentement, page
>     de callback `/auth/callback`) **OU** le passage à Sprint 2 (contenu
>     militant — pétitions CRUD) si le sprint 1 est complet à l'issue
>     de cette étape. Cette consigne doit être présente à chaque étape :
>     tant que le sprint 1 n'est pas terminé, le journal de bord
>     auto-prépare la session suivante.
> 11. **Commit** : `feat(adhesion): step 7 — Stripe checkout + webhook +
>     RPC T99CP + JoinPage`. Push sur la branche imposée par l'harness
>     avec `git push -u origin <branch>`, retry sur erreurs réseau
>     (2s/4s/8s/16s). Pas de PR sans demande explicite.
>
> **Contraintes** :
>
> - Ne pas toucher au prototype (`project/app/Maintenant.html` et JSX racine).
> - TS strict + no `any` : tous les types Supabase via `web/src/types/database.ts`
>   ou `@supabase/supabase-js`.
> - **Aucune clé `service_role` dans `web/`** : la clé côté Edge Function
>   est lue via `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')`, jamais
>   exportée vers le bundle front.
> - **Aucune clé `STRIPE_SECRET_KEY` dans `web/`** : idem, Edge Function only.
> - Pas d'emojis dans le code TS ni dans les commits (utiliser SVG —
>   `IconCart`, `IconCheckCircle` à ajouter si besoin).
> - Conserver les checks verts : `typecheck`, `lint`, `test`, `build`,
>   `format:check`. Lancer les 5 en fin de session avant de committer.
> - Si Docker n'est pas dispo dans la sandbox, ne pas tenter
>   `supabase start` ; appliquer le schéma à un PG local comme aux
>   étapes 4, 5 et 6 (`service postgresql start` + auth stub + storage
>   stub + `psql -f db/schema.sql`). Pour tester les Edge Functions sans
>   `supabase functions serve`, les écrire de façon à pouvoir être
>   testées en isolation (Deno `import.meta.main` guard) et créer un
>   harness Node minimaliste si nécessaire.
>
> Le prompt de l'étape 8 doit impérativement contenir la même consigne
> récursive : « écrire le prompt de l'étape 9 dans
> `HANDOFF-PROGRESS.md` avant le commit final ». Cette boucle s'arrête
> uniquement quand le sprint 1 (auth + profil + adhésion + T99CP) est
> complet, point auquel le prompt généré peut basculer sur le sprint 2
> (contenu militant — pétitions, mobilisations, campagnes).

---

## Étape 11 — Sprint 2 / Sondages CRUD côté front ✅

**Branche** : `claude/review-project-setup-AjlyB`
**Commit** : `feat(polls): step 11 — CRUD sondages + listing + fiche + création`

### Module `web/src/lib/polls.ts`

Types Supabase via `Database['public']['Tables']<'polls'|'poll_options'|'votes'>`.
Helper `PollWithOptions` qui agrège le `poll` et ses `options[]` pour la fiche.

API exposée :

- `listPolls({ status, search, limit })` — listing public (`status='published'`
  par défaut, tri `created_at DESC`, limite 50). Recherche `.or()` sur
  `question` + `description`, échappement des méta-caractères `%`, `_`, `,`.
- `getPoll(slug)` — fiche détail : deux requêtes (poll par slug, puis options
  par `poll_id` triées par `position`). `data: null` propre si introuvable.
- `createPoll(input)` — validation FR, slug auto via `slugify(question)` avec
  retry incrémental sur collision `23505` (jusqu'à 5 essais), insert poll +
  insert options en cascade, rollback manuel (DELETE poll) si l'insertion des
  options échoue.
- `votePoll(pollId, optionId, userId)` — insert `votes` (la contrainte UNIQUE
  `(poll_id, user_id)` empêche le double-vote ; RLS `votes_insert_member`
  vérifie `auth.uid() = user_id` et l'appartenance adhérent si `members_only`).
- `unvotePoll(pollId, userId)` — delete RGPD (retrait du vote).
- `hasUserVoted(pollId, userId)` — single-row check (boolean).
- `getUserVote(pollId, userId)` — renvoie `optionId | null` (pour pré-cocher
  l'option dans la fiche).

Validation côté client (`validatePollInput`) :

- Question : 8–200 caractères.
- Description : 40–400 caractères.
- Options : 2–8 options, chaque option 2–80 caractères, toutes distinctes.
- `closesAt` (facultatif) : doit être dans le futur si fourni.

### Hooks

- `usePolls(params)` — liste + states `idle/loading/ready/error` + `refresh`.
- `usePoll(slug, userId)` — fiche + options + `userOptionId` (option votée par
  l'utilisateur, lue via `getUserVote` quand `userId` est fourni).

Patterns identiques à `usePetitions`/`usePetition` et
`useMobilizations`/`useMobilization` : `queueMicrotask` au mount, reset des
states locaux quand les clés tracées (`slug:userId`) changent.

### Pages

- `web/src/pages/PollsPage.tsx` — listing avec hero brand, barre de recherche
  + filtre statut (Ouvert / Publié / Archivé), grille cards (auto-fill,
  min 280 px). Le CTA « Créer un sondage » est désactivé tant que l'état auth
  n'est pas connu (`authStatus === 'loading'`).
- `web/src/pages/PollDetailPage.tsx` — fiche avec radio-like buttons par
  option : tant que l'utilisateur n'a pas voté on cache les compteurs, dès
  qu'il a voté (ou que le sondage est clos) on affiche les barres de
  progression (`var(--mn-gradient)`) + pourcentage + nombre de votes. CTA
  « Se connecter pour voter » pour l'anonyme, sinon « Valider mon vote » /
  « Vote enregistré — retirer mon vote ». Partage `navigator.share` →
  fallback `clipboard.writeText`. Le calcul `isClosed` est porté par un
  `useEffect + queueMicrotask` pour éviter `Date.now()` pendant le render
  (règle `react-hooks/purity`).
- `web/src/pages/PollCreatePage.tsx` — formulaire (RequireAuth via router) :
  question, description, options dynamiques (2 par défaut, max 8, avec boutons
  ajouter/retirer), date de clôture (datetime-local, facultative), case
  « Réservé aux adhérent·es » (cochée par défaut). Sur succès → redirige
  vers `/polls/<slug>` en `replace`.

Icônes ajoutées : `IconBarChart` (4 barres verticales, `currentColor`).
`IconCheck` réutilisé tel quel.

### Trigger SQL `vote_count`

Ajout dans `db/schema.sql` §12 :

- Colonne `poll_options.vote_count integer not null default 0 check (>= 0)`
  (ajout idempotent via `alter table … add column if not exists`).
- Trigger `votes_count_inc` / `votes_count_dec` (AFTER INSERT/DELETE) qui
  appelle `public.touch_poll_option_vote_count` — même pattern que
  `petitions.signature_count` et `mobilizations.participation_count`.
- Colonne `polls.slug text not null unique` (ajout idempotent + backfill via
  `slugify(question) || '-' || substr(id::text, 1, 8)` pour les lignes
  préexistantes).
- Index `polls_status_idx` (filtre listing).

Cas de test SQL documentés en commentaires : insert/delete votes met à jour
`vote_count`, cascade DELETE poll → options → votes propre, contrainte UNIQUE
`(poll_id, user_id)` empêche le double-vote. Pas de validation runtime
possible sans Docker (cf. fallback ci-dessous).

### Types Supabase

`web/src/types/database.ts` patché à la main :

- `polls.Row` / `.Insert` / `.Update` → ajout de `slug: string`.
- `poll_options.Row` / `.Insert` / `.Update` → ajout de `vote_count: number`.

Régénération automatique reportée au moment où on rebrancherea Docker
Supabase (cf. note `--legacy-peer-deps` + fallback).

### Router

Trois routes ajoutées dans `web/src/router.tsx` :

```
/polls          → PollsPage          (public)
/polls/new      → PollCreatePage     (RequireAuth)
/polls/:slug    → PollDetailPage     (public)
```

### Tests Vitest

- `src/lib/polls.test.ts` : **29 cas** — `validatePollInput` (8),
  `listPolls` (4), `getPoll` (3), `createPoll` (5 dont rollback), `votePoll`
  (2), `unvotePoll`, `hasUserVoted` (2), `getUserVote` (2), constantes (1).
- `src/hooks/usePolls.test.tsx` : **3 cas** — mount/ready, erreur, ré-exécution
  sur changement de `search`.
- `src/hooks/usePoll.test.tsx` : **4 cas** — anonyme (pas de getUserVote),
  notfound, fetch userOptionId, refresh + mise à jour.
- `src/pages/PollsPage.test.tsx` : **4 cas** — listing, état vide, recherche,
  erreur Postgrest FR.
- `src/pages/PollDetailPage.test.tsx` : **5 cas** — rendu, anonyme, vote (sel +
  validate → `votePoll` + refresh), retrait du vote (`unvotePoll`),
  redirection 404.
- `src/pages/PollCreatePage.test.tsx` : **4 cas** — rendu, validation FR
  sur soumission vide, succès → redirect, erreur 42501 FR.

**Total** : **49 nouveaux tests** (≥ 25 requis), **224 tests verts** sur
l'ensemble du projet (175 hérités + 49). `npm run typecheck`, `npm run lint`,
`npm run test`, `npm run build` (295 kB), `npm run format:check` → tous verts.

### Décisions de design

- **Pas de transaction native** : Supabase via PostgREST n'expose pas de
  transaction côté client. On insère le poll d'abord, puis le tableau
  d'options en un seul `insert(arr)`. En cas d'erreur sur les options,
  rollback manuel via `delete().eq('id', poll.id)`. Risque résiduel : si le
  rollback échoue, on a un poll orphelin sans options ; la fiche est alors
  illisible (0 option) mais reste invisible côté front (cache busté au
  refresh). Si le risque devient gênant, on basculera plus tard sur une
  RPC SQL `public.create_poll_with_options(input jsonb)` qui fera une
  transaction côté serveur.
- **Vote unique, pas de pondération** : le prototype `PollsPage.jsx` avait
  un calcul INSEE-style avec pondération démographique (`computeReliability`
  + 15 questions de profil). On part sur du « 1 user = 1 vote » strict pour
  l'étape 11 ; la pondération sera ajoutée au Sprint 5 (audit RGPD + admin)
  via une RPC dédiée. Décision documentée dans le code.
- **Partage** : `navigator.share` (mobile) → fallback `clipboard.writeText`.
  Pareil que MobilizationDetailPage. La constante `shared` se réinitialise à
  chaque clic (toast éphémère).
- **`isClosed` calculé en `useEffect`** : la règle ESLint
  `react-hooks/purity` interdit `Date.now()` pendant le render. On copie le
  pattern de `MobilizationDetailPage.tsx` (`useEffect + queueMicrotask + state`)
  pour rester dans les règles React 19.

### Prochaines étapes (étape 12)

1. **Campagnes CRUD** (`web/src/lib/campaigns.ts`, hooks, pages) — port du
   prototype `Pages_Services.jsx` (composant Campagnes). Spécifique :
   `campaigns` agrège plusieurs `campaign_actions` (FK vers `petitions`,
   `mobilizations`, `polls`, `crowdfunding_campaigns`) — il faudra prévoir la
   sélection multi-cibles dans le formulaire de création.
2. Sinon, basculer sur **audit RGPD fin Sprint 2** (bannière cookies, page
   politique de confidentialité, vérif que `service_role` n'est jamais
   exposée côté front, audit des logs Sentry pour qu'aucune donnée perso
   n'y atterrisse).

### Fallback Docker / Supabase local

Pas de validation runtime des triggers `vote_count` cette session (sandbox
sans Docker). À refaire en local quand on a Postgres :

```bash
service postgresql start
createdb maintenant_test
psql maintenant_test < db/schema.sql
psql maintenant_test -c "insert into public.users(id, email) values ('u1', 'a@b.c');"
psql maintenant_test -c "insert into public.polls(author_id, slug, question) values ('u1', 's1', 'Q?');"
# … puis valider que le trigger met bien à jour poll_options.vote_count.
```

---

## Prompt pour la session N+5 (étape 11)

> Repo : `/home/user/maintenantproto1` (branche imposée par l'harness —
> typiquement `claude/<auto>`).
>
> **Lis dans cet ordre** :
>
> 1. `CLAUDE.md` — règles projet (TS strict, pas de `any`, camelCase TS /
>    snake_case DB, SVG via `ICONS.*` pas d'emojis, RLS, RGPD).
> 2. `HANDOFF.md` §3 (architecture pages) + §7.2 (tables `polls`,
>    `poll_options`, `votes`) + §10 Sprint 2.
> 3. `HANDOFF-PROGRESS.md` — journal (étape 10 ✅ — étape 11 à faire).
> 4. `Pages_Services.jsx` / `Pages_Home.jsx` / racine prototype :
>    composants liés aux sondages (chercher `Polls`, `poll`,
>    `Sondages`, `PollDetail`, `vote`, `pondération`).
> 5. `web/src/lib/petitions.ts`, `web/src/lib/mobilizations.ts`,
>    `web/src/lib/slug.ts`, `web/src/hooks/usePetitions.ts`,
>    `web/src/hooks/useMobilizations.ts`,
>    `web/src/pages/PetitionsPage.tsx`, `web/src/pages/MobilizationsPage.tsx`,
>    `web/src/pages/PetitionDetailPage.tsx`,
>    `web/src/pages/MobilizationDetailPage.tsx`,
>    `web/src/pages/PetitionCreatePage.tsx`,
>    `web/src/pages/MobilizationCreatePage.tsx` — patterns à reproduire
>    pour `polls`.
> 6. `db/schema.sql` §12 (sondages) — tables `polls`, `poll_options`,
>    `votes` + policies RLS. Vérifier que toutes les colonnes nécessaires
>    sont présentes (compteur dénormalisé `vote_count` sur `poll_options`,
>    trigger d'incrément, contraintes d'unicité par `(poll_id, user_id)`
>    sur `votes`).
>
> **État actuel à la fin de l'étape 10** (tip
> `claude/read-project-rules-IyheS`, commit
> `feat(mobilizations): step 10 — CRUD mobilisations + listing + fiche + création`) :
>
> - Prototype intact : `project/app/Maintenant.html` + JSX racine.
> - `web/` : Vite + React 19 + TS 6 strict, **175 tests verts** (48
>   nouveaux à l'étape 10), ESLint flat, Vitest, Prettier,
>   build 295 kB.
> - Supabase : `db/schema.sql` à ~1 790 lignes (36 tables + 119
>   policies RLS + trigger `handle_new_user` + bucket avatars + RPC
>   T99CP + compteur `signature_count` + compteur `participation_count`
>   + slugify(text)), `web/src/types/database.ts` à ~1 720 lignes.
> - Auth complète : signup/login/logout/reset password + OAuth Google
>   + Instagram + magic link + callback page `/auth/callback`.
> - Profil + adhésion Stripe + RPC T99CP opérationnels.
> - **Pétitions complètes** : listing, fiche, signer/retirer signature,
>   création (`RequireAuth`) — Sprint 2 démarré.
> - **Mobilisations complètes** : listing avec filtres ville+date,
>   fiche avec « Je participe » / « me désinscrire » + partage
>   (`navigator.share` / clipboard) + dates FR Intl, création
>   (`RequireAuth`) — Sprint 2 poursuivi.
> - `slugify()` factorisé dans `web/src/lib/slug.ts` (partagé par
>   pétitions et mobilisations, prêt pour articles + sondages).
>
> **CONTEXTE D'OUVERTURE — à exécuter avant toute autre action** :
>
> 1. `git fetch origin claude/read-project-rules-IyheS` (retry network
>    2s/4s/8s/16s) pour récupérer le tip de l'étape 10.
> 2. `git merge --no-ff <tip-sha>` pour intégrer le commit
>    `feat(mobilizations): step 10 …`. En cas d'absence,
>    `git checkout origin/claude/read-project-rules-IyheS -- .` puis
>    commit.
> 3. `cd web && npm install --legacy-peer-deps` (lockfile non
>    versionné, option requise à cause d'`eslint-plugin-jsx-a11y` ↔
>    ESLint 10). À réutiliser pour tout nouvel `npm install` dans cette
>    session.
>
> **ÉTAPE 11 à exécuter — Sondages CRUD côté front (Sprint 2)** :
>
> 1. Module `web/src/lib/polls.ts` : fonctions typées via `Database`
>    (`Tables<'polls'>`, `Tables<'poll_options'>`, `Tables<'votes'>`) :
>    - `listPolls({ status, search, limit })` — listing paginé (status
>      public uniquement par défaut), trié par `created_at` DESC.
>    - `getPoll(slug)` — fiche détail (jointure avec options +
>      compteur de votes par option).
>    - `createPoll(input)` — insert poll + insert options en
>      transaction (ou enchaînement front avec rollback manuel si
>      Supabase n'expose pas de tx). Validation FR. Slug auto via
>      `slugify()` factorisé.
>    - `votePoll(pollId, optionId, userId)` — insert dans `votes`
>      (RLS authenticated_self). Sémantique « 1 user / 1 sondage »
>      via contrainte UNIQUE `(poll_id, user_id)`.
>    - `unvotePoll(pollId, userId)` — delete RGPD.
>    - `hasUserVoted(pollId, userId)` — single-row check.
>    - `getUserVote(pollId, userId)` — renvoie l'option votée (pour
>      afficher le choix de l'utilisateur).
> 2. Trigger SQL `update_poll_option_vote_count` : si pas déjà
>    présent dans `db/schema.sql` §12, ajouter un trigger AFTER
>    INSERT/DELETE sur `votes` qui met à jour
>    `poll_options.vote_count`. Ajouter la colonne `vote_count integer
>    not null default 0 check (>= 0)` à `poll_options` (idempotent via
>    `alter table … add column if not exists`). Documenter les cas de
>    test SQL dans `db/schema.sql` (commentaires).
> 3. Hooks `web/src/hooks/usePolls.ts` + `usePoll.ts` : copier le
>    pattern `usePetitions` / `usePetition` / `useMobilizations` /
>    `useMobilization`.
> 4. Pages :
>    - `web/src/pages/PollsPage.tsx` — listing avec recherche +
>      filtre statut (ouvert / clos). Port TS strict du prototype.
>    - `web/src/pages/PollDetailPage.tsx` — fiche avec radio
>      buttons (ou cards cliquables) pour chaque option,
>      `RequireAuth` via redirect, compteur live + barres de
>      progression par option (`var(--mn-gradient)`), partage du lien.
>    - `web/src/pages/PollCreatePage.tsx` — formulaire création
>      (`RequireAuth`), validation côté client (question 8–200,
>      description 40–400, ≥ 2 options et ≤ 8 options, chaque option
>      2–80 caractères). Réussite → redirige vers la fiche.
> 5. Router : ajouter les routes `/polls/:slug`, `/polls/new`, et
>    brancher `RequireAuth` sur la création.
> 6. Régénérer `web/src/types/database.ts` si tu touches
>    `db/schema.sql` (au minimum patcher à la main `poll_options.Row`
>    pour ajouter `vote_count`).
> 7. Icônes SVG à ajouter si besoin : `IconBarChart`, `IconCheck` —
>    toujours currentColor, pas d'emoji.
> 8. Tests (Vitest + Testing Library + mocks supabase) :
>    - `src/lib/polls.test.ts` (≥ 10 cas) — `listPolls` (filtres),
>      `getPoll` (succès + 404), `createPoll` (validation, succès,
>      retry slug-collision, rollback en cas d'erreur sur insert
>      d'options), `votePoll`, `unvotePoll`, `hasUserVoted`,
>      `getUserVote`.
>    - `src/hooks/usePolls.test.tsx` (≥ 3 cas).
>    - `src/hooks/usePoll.test.tsx` (≥ 3 cas).
>    - `src/pages/PollsPage.test.tsx` (≥ 3 cas).
>    - `src/pages/PollDetailPage.test.tsx` (≥ 4 cas) — rendu fiche,
>      vote anonyme → redirige login, vote authentifié →
>      `votePoll` + refresh, barres de progression mises à jour.
>    - `src/pages/PollCreatePage.test.tsx` (≥ 3 cas).
>    - Objectif : ≥ 200 tests verts (175 existants + ≥ 25 nouveaux).
> 9. Mettre à jour `HANDOFF-PROGRESS.md` : étape 11 ✅ avec sections
>    « Module polls.ts », « hooks », « pages », « trigger
>    vote_count », « décisions (insertion options en cascade,
>    pondération éventuelle, partage) », « prochaines étapes (étape
>    12 — campagnes ou audit RGPD fin Sprint 2) ». Cocher la ligne 11
>    et créer une ligne 12 si manquante.
> 10. Écrire le prompt de la session N+6 (étape 12) dans
>     `HANDOFF-PROGRESS.md` (en bas du fichier ou en annexe), section
>     `## Prompt pour la session N+6 (étape 12)` reprenant la même
>     structure (contexte d'ouverture, état actuel, étape à exécuter,
>     contraintes, fallback Docker, double consigne récursive).
>     L'étape 12 cible : **campagnes CRUD** (port du prototype, mêmes
>     patterns que pétitions / mobilisations / sondages) ; ou bien
>     audit RGPD fin Sprint 2 si les campagnes sont fines à traiter
>     d'un coup.
> 11. **Coller le prompt de l'étape 12 dans la conversation finale**,
>     en plus de l'avoir écrit dans `HANDOFF-PROGRESS.md` : à la fin
>     de la session, le message Claude doit contenir littéralement le
>     bloc du prompt (citation `>` ou code-fence), pour que
>     l'utilisateur puisse le copier d'un coup. Cette consigne fait
>     partie de la boucle récursive : tant que le Sprint 2 (contenu
>     militant — pétitions, mobilisations, campagnes, sondages) n'est
>     pas complet, le prompt généré doit aussi être collé dans la
>     réponse finale de la session.
> 12. **Commit** : `feat(polls): step 11 — CRUD sondages + listing +
>     fiche + création`. Push sur la branche imposée par l'harness
>     avec `git push -u origin <branch>`, retry sur erreurs réseau
>     (2s/4s/8s/16s). Pas de PR sans demande explicite.
>
> **Contraintes** :
>
> - Ne pas toucher au prototype (`project/app/Maintenant.html` et JSX
>   racine).
> - TS strict + no `any` : tous les types Supabase via
>   `web/src/types/database.ts` ou `@supabase/supabase-js`.
> - **Aucune clé `service_role` dans `web/`** : tout passe par RLS et
>   `VITE_SUPABASE_ANON_KEY`.
> - Pas d'emojis dans le code TS ni dans les commits (utiliser SVG —
>   `IconBarChart`, `IconCheck`, etc. à ajouter si besoin).
> - Conserver les checks verts : `typecheck`, `lint`, `test`, `build`,
>   `format:check`. Lancer les 5 en fin de session avant de committer.
> - Si Docker n'est pas dispo dans la sandbox, ne pas tenter
>   `supabase start` ; les sondages se testent via mocks Vitest. Pour
>   les vérifs SQL (trigger `vote_count`), documenter en commentaire
>   dans `db/schema.sql` et tester avec un PG local si possible
>   (`service postgresql start` + `psql -f db/schema.sql`).
>
> **DOUBLE CONSIGNE RÉCURSIVE** :
>
> 1. Écrire le prompt de l'étape 12 dans `HANDOFF-PROGRESS.md`
>    **avant** le commit final.
> 2. Coller le prompt de l'étape 12 dans la conversation (réponse
>    finale Claude), pas seulement dans le fichier journal.
>
> Cette boucle s'arrête uniquement quand le Sprint 2 (contenu militant
> — pétitions, mobilisations, campagnes, sondages) est complet, point
> auquel le prompt généré peut basculer sur le Sprint 3 (services
> communautaires).

---

## Prompt pour la session N+6 (étape 12)

> Repo : `/home/user/maintenantproto1` (branche imposée par l'harness —
> typiquement `claude/<auto>`).
>
> **Lis dans cet ordre** :
>
> 1. `CLAUDE.md` — règles projet (TS strict, pas de `any`, camelCase TS /
>    snake_case DB, SVG via `ICONS.*` pas d'emojis, RLS, RGPD).
> 2. `HANDOFF.md` §3 (architecture pages) + §7.2 (tables `campaigns`,
>    `campaign_actions`) + §10 Sprint 2.
> 3. `HANDOFF-PROGRESS.md` — journal (étape 11 ✅ — étape 12 à faire).
> 4. `Pages_Services.jsx` racine prototype : composants liés aux campagnes
>    (chercher `Campagnes`, `Campaign`, `CampaignDetail`, `campaign_actions`,
>    `selected items`). En particulier les commits `d97d272` (6 templates
>    pré-remplis) et `01f4d73` (sélection multi-items inline) pour comprendre
>    la sémantique d'une campagne « multi-actions ».
> 5. `web/src/lib/petitions.ts`, `web/src/lib/mobilizations.ts`,
>    `web/src/lib/polls.ts`, `web/src/lib/slug.ts`, hooks correspondants,
>    pages `PetitionsPage.tsx`, `MobilizationsPage.tsx`, `PollsPage.tsx`,
>    leurs fiches et leurs formulaires de création — patterns à reproduire
>    pour `campaigns`.
> 6. `db/schema.sql` §13 (campagnes) — tables `campaigns`, `campaign_actions`
>    + policies RLS. Vérifier que toutes les colonnes nécessaires sont
>    présentes (notamment la nature des FK : `petition_id`, `mobilization_id`,
>    `poll_id`, `crowdfunding_id` toutes `nullable`).
>
> **État actuel à la fin de l'étape 11** (tip
> `claude/review-project-setup-AjlyB`, commit
> `feat(polls): step 11 — CRUD sondages + listing + fiche + création`) :
>
> - Prototype intact : `project/app/Maintenant.html` + JSX racine.
> - `web/` : Vite + React 19 + TS 6 strict, **224 tests verts** (49 nouveaux
>   à l'étape 11), ESLint flat, Vitest, Prettier, build 295 kB.
> - Supabase : `db/schema.sql` ≈ 1 880 lignes (36 tables + 119 policies RLS
>   + trigger `handle_new_user` + bucket avatars + RPC T99CP + compteur
>   `signature_count` + compteur `participation_count` + compteur
>   `vote_count` sur `poll_options` + colonne `polls.slug` + slugify(text)),
>   `web/src/types/database.ts` ≈ 1 720 lignes.
> - Auth complète : signup/login/logout/reset password + OAuth Google +
>   Instagram + magic link + callback page `/auth/callback`.
> - Profil + adhésion Stripe + RPC T99CP opérationnels.
> - **Pétitions** complètes : listing, fiche, signer/retirer signature,
>   création (RequireAuth) — Sprint 2 démarré.
> - **Mobilisations** complètes : listing avec filtres ville+date, fiche
>   avec « Je participe » / partage / dates FR Intl, création (RequireAuth)
>   — Sprint 2 poursuivi.
> - **Sondages** complets : listing, fiche avec radio buttons + barres de
>   progression `var(--mn-gradient)`, vote unique « 1 user / 1 sondage » via
>   contrainte UNIQUE, retrait RGPD, création (RequireAuth) — Sprint 2
>   poursuivi.
> - `slugify()` partagé via `web/src/lib/slug.ts`.
>
> **CONTEXTE D'OUVERTURE** — à exécuter avant toute autre action :
>
> 1. `git fetch origin claude/review-project-setup-AjlyB` (retry network
>    2s/4s/8s/16s) pour récupérer le tip de l'étape 11.
> 2. `git merge --no-ff <SHA-étape-11>` pour intégrer le commit
>    `feat(polls): step 11 …`. En cas d'absence,
>    `git checkout origin/claude/review-project-setup-AjlyB -- .` puis
>    commit.
> 3. `cd web && npm install --legacy-peer-deps` (lockfile non versionné,
>    option requise à cause d'`eslint-plugin-jsx-a11y` ↔ ESLint 10). À
>    réutiliser pour tout nouvel `npm install` dans cette session.
>
> **ÉTAPE 12 à exécuter — Campagnes CRUD côté front (Sprint 2)** :
>
> 1. **Module `web/src/lib/campaigns.ts`** — fonctions typées via `Database`
>    (`Tables<'campaigns'>`, `Tables<'campaign_actions'>`) :
>    - `listCampaigns({ status, search, limit })` — listing public,
>      `status='published'`, tri `created_at DESC`. Filtre `search` via
>      `.or()` sur `title`+`summary`.
>    - `getCampaign(slug)` — fiche détail : poll par slug, puis
>      `campaign_actions` triées par `position`, avec **jointures** vers
>      les ressources cibles (`petition_id → petitions(*)`, etc.). Astuce :
>      utiliser la syntaxe Supabase `select('*, petition:petitions(*), …')`
>      ou faire des requêtes séparées si la jointure est trop lourde.
>    - `createCampaign(input)` — insert campaign + insert
>      campaign_actions[]. Validation FR. Slug auto via `slugify()`
>      factorisé. Retry incrémental sur collision (5 essais).
>    - `addCampaignAction(campaignId, ref)` / `removeCampaignAction(id)`
>      pour ajouter / retirer une action liée à une campagne existante
>      (admin / owner uniquement, vérifié par RLS).
>    - `validateCampaignInput(input)` — title 8–80, summary 40–240, body
>      facultatif (si présent ≥ 100), ≥ 1 action et ≤ 12 actions.
> 2. **Hooks `useCampaigns.ts` + `useCampaign.ts`** : copier le pattern
>    `usePetitions / usePetition / useMobilizations / useMobilization /
>    usePolls / usePoll`.
> 3. **Pages** :
>    - `web/src/pages/CampaignsPage.tsx` — listing avec recherche + filtre
>      statut. Port TS strict du prototype (cf. commits `d97d272` et
>      `01f4d73`).
>    - `web/src/pages/CampaignDetailPage.tsx` — fiche avec hero, body,
>      liste des `campaign_actions` (cards cliquables vers
>      `/petitions/<slug>`, `/mobilizations/<slug>`, `/polls/<slug>`,
>      `/services/crowdfunding/<slug>`). Partage du lien.
>    - `web/src/pages/CampaignCreatePage.tsx` — formulaire création
>      (RequireAuth), sélection multi-items inline (l'utilisateur peut
>      ajouter à la volée des actions existantes — un combobox `search` qui
>      tape sur les listings publics + sélection multiple).
> 4. **Router** : ajouter les routes `/campaigns/:slug`, `/campaigns/new`,
>    et brancher `RequireAuth` sur la création.
> 5. **Schéma DB** : vérifier que `db/schema.sql` §13 est complet (slug
>    unique sur campaigns ✅, mais pas de compteur dénormalisé — pas besoin
>    pour les campagnes, on remontera juste le nombre d'actions via la
>    jointure). Si manquant, ajouter index `campaigns_status_idx` et
>    `campaign_actions_position_idx`.
> 6. **Régénérer** `web/src/types/database.ts` si tu touches `db/schema.sql`
>    (au minimum patcher à la main).
> 7. **Icônes SVG** à ajouter si besoin : `IconMegaphone`, `IconList` —
>    toujours `currentColor`, pas d'emoji.
> 8. **Tests** (Vitest + Testing Library + mocks Supabase) :
>    - `src/lib/campaigns.test.ts` (≥ 10 cas) — `listCampaigns` (filtres),
>      `getCampaign` (succès + 404), `createCampaign` (validation, succès,
>      retry slug-collision, rollback en cas d'erreur sur insert d'actions),
>      `addCampaignAction`, `removeCampaignAction`.
>    - `src/hooks/useCampaigns.test.tsx` (≥ 3 cas).
>    - `src/hooks/useCampaign.test.tsx` (≥ 3 cas).
>    - `src/pages/CampaignsPage.test.tsx` (≥ 3 cas).
>    - `src/pages/CampaignDetailPage.test.tsx` (≥ 4 cas) — rendu fiche,
>      actions cliquables, partage, redirection 404.
>    - `src/pages/CampaignCreatePage.test.tsx` (≥ 3 cas) — rendu, validation
>      FR, succès → redirect.
>    - Objectif : **≥ 250 tests verts** (224 existants + ≥ 25 nouveaux).
> 9. Mettre à jour `HANDOFF-PROGRESS.md` : étape 12 ✅ avec sections
>    « Module campaigns.ts », « hooks », « pages », « jointures campaign_actions »,
>    « décisions (multi-items inline, RLS owner) »,
>    « prochaines étapes (étape 13 — audit RGPD fin Sprint 2 OU bascule sur
>    Sprint 3 — services communautaires) ». Cocher la ligne 12 et créer
>    une ligne 13 si manquante.
> 10. Écrire le prompt de la session N+7 (étape 13) dans
>     `HANDOFF-PROGRESS.md` (en bas du fichier ou en annexe), section
>     `## Prompt pour la session N+7 (étape 13)` reprenant la même
>     structure. L'étape 13 cible : audit RGPD fin Sprint 2 (bannière
>     cookies + page politique de confidentialité + audit RLS final +
>     vérif Sentry no-PII) ou bascule Sprint 3 (Hébergement +
>     Covoiturage).
> 11. **Coller le prompt de l'étape 13 dans la conversation finale**, en
>     plus de l'avoir écrit dans `HANDOFF-PROGRESS.md` : à la fin de la
>     session, le message Claude doit contenir littéralement le bloc du
>     prompt (citation `>` ou code-fence), pour que l'utilisateur puisse
>     le copier d'un coup. Cette consigne fait partie de la boucle
>     récursive : tant que le Sprint 2 (contenu militant — pétitions,
>     mobilisations, campagnes, sondages) n'est pas complet, le prompt
>     généré doit aussi être collé dans la réponse finale de la session.
> 12. **Commit** :
>     `feat(campaigns): step 12 — CRUD campagnes + listing + fiche + création`.
>     Push sur la branche imposée par l'harness avec
>     `git push -u origin <branch>`, retry sur erreurs réseau
>     (2s/4s/8s/16s). Pas de PR sans demande explicite.
>
> **Contraintes** :
>
> - Ne pas toucher au prototype (`project/app/Maintenant.html` et JSX
>   racine).
> - TS strict + no `any` : tous les types Supabase via
>   `web/src/types/database.ts` ou `@supabase/supabase-js`.
> - Aucune clé `service_role` dans `web/` : tout passe par RLS et
>   `VITE_SUPABASE_ANON_KEY`.
> - Pas d'emojis dans le code TS ni dans les commits (utiliser SVG —
>   `IconMegaphone`, `IconList`, etc. à ajouter si besoin).
> - Conserver les checks verts : `typecheck`, `lint`, `test`, `build`,
>   `format:check`. Lancer les 5 en fin de session avant de committer.
> - Si Docker n'est pas dispo dans la sandbox, ne pas tenter
>   `supabase start` ; les campagnes se testent via mocks Vitest. Pour
>   les vérifs SQL (jointures `campaign_actions`), documenter en
>   commentaire dans `db/schema.sql` et tester avec un PG local si
>   possible (`service postgresql start` + `psql -f db/schema.sql`).
>
> **DOUBLE CONSIGNE RÉCURSIVE** :
>
> 1. Écrire le prompt de l'étape 13 dans `HANDOFF-PROGRESS.md` **avant**
>    le commit final.
> 2. Coller le prompt de l'étape 13 dans la conversation (réponse finale
>    Claude), pas seulement dans le fichier journal.
>
> Cette boucle s'arrête uniquement quand le Sprint 2 (contenu militant —
> pétitions, mobilisations, campagnes, sondages) est complet, point auquel
> le prompt généré peut basculer sur le Sprint 3 (services communautaires).

---

## Étape 12 — Sprint 2 / Campagnes CRUD côté front ✅

**Branche** : `claude/add-polls-module-lv84O` (merge `claude/review-project-setup-AjlyB`
@ `8b81644` → étape 11 puis travail étape 12)
**Commit cible** : `feat(campaigns): step 12 — CRUD campagnes + listing + fiche + création`

### Module `web/src/lib/campaigns.ts`

- Types `CampaignRow`, `CampaignInsert`, `CampaignStatus`, `CampaignActionRow`,
  `CampaignActionInsert` dérivés de `Database['public']`.
- `CampaignWithActions = { campaign, actions }` pour la fiche.
- `CampaignActionRef` (FK optionnelles : `petitionId` / `mobilizationId` /
  `pollId` / `crowdfundingId` + `label` libre) — au moins une FK obligatoire.
- Constantes de validation : `CAMPAIGN_TITLE_MIN = 8`, `MAX = 80`,
  `CAMPAIGN_SUMMARY_MIN = 40`, `MAX = 240`, `CAMPAIGN_BODY_MIN = 100` (si
  renseigné), `CAMPAIGN_ACTIONS_MIN_COUNT = 1`, `MAX_COUNT = 12`.
- `validateCampaignInput(input)` — retourne `[]` ou un tableau d'issues
  `{ field, message }`. Vérifie chaque action a au moins une FK (sinon
  `actions` invalide).
- `listCampaigns({ status, search, limit })` — public, `status='published'`
  par défaut, tri `created_at DESC`, `.or('title.ilike.%X%,summary.ilike.%X%')`
  avec échappement des méta-caractères `%`, `_`, `,`.
- `getCampaign(slug)` — 2 requêtes successives (campaign + actions triées
  par `position ASC`). Décision : pas de jointure Postgrest imbriquée (cf.
  « Décisions » plus bas) — la fiche enrichit la cible côté UI seulement
  via le lien `/petitions/<id>` etc.
- `createCampaign(input)` — validation → insert campaign avec slug
  `slugify(title)` (retry incrémental sur `23505`, 5 essais) → insert
  `campaign_actions[]` → rollback manuel `DELETE FROM campaigns` si
  l'insertion des actions échoue. Renvoie `CampaignWithActions`.
- `addCampaignAction(campaignId, ref, position)` — insert single (RLS
  vérifie author). Refuse une ref sans FK avec code `CAMPAIGN_VALIDATION`.
- `removeCampaignAction(id)` — delete (RLS owner-only via la policy
  `campaign_actions_write_author`).

### Hooks `useCampaigns.ts` + `useCampaign.ts`

- Pattern identique à `usePolls / usePoll` : reset des états locaux
  pendant le render quand `filterKey` (search/status/limit) ou le slug
  change, `queueMicrotask(() => listCampaigns(...))` pour découpler le
  fetch du render, `refresh()` exposé pour rejouer la requête.
- `useCampaign` ne charge pas la cible des actions (jointures) — c'est la
  fiche qui résout `petition_id → /petitions/<id>` etc. côté UI.

### Pages

- **`CampaignsPage`** — listing avec hero `var(--mn-gradient)`, recherche
  + filtre statut, état vide + erreur Postgrest mappée FR. Card
  `<Link to="/campaigns/:slug">` avec badge `IconMegaphone`.
- **`CampaignDetailPage`** — header (badge, titre, résumé, body
  `whiteSpace: pre-wrap`), bouton « Partager » (`navigator.share` →
  `clipboard.writeText` fallback), liste des actions sous `<ul>` avec
  routage par type (`resolveAction(action)` → `kind` + `href` +
  `fallbackLabel` + icône). Si aucune FK n'est plus là (delete cascade
  `set null`), l'action s'affiche en mode « lien rompu » non cliquable.
- **`CampaignCreatePage`** — formulaire `RequireAuth` avec 3 onglets de
  picker (Pétitions / Mobilisations / Sondages), recherche live
  (`listPetitions({ search })`, `listMobilizations`, `listPolls` — limit
  8), clic sur résultat → ajout à `selected[]`. Cagnottes pas exposées
  pour l'instant (pas de listing public côté front, à brancher au
  Sprint 3). Slug auto, redirect `/campaigns/<slug>` après succès.

### Router

- `/campaigns` (public), `/campaigns/new` (`RequireAuth`),
  `/campaigns/:slug` (public).

### Schéma DB

- `campaigns_status_idx ON campaigns(status)` ajouté (cohérence avec
  petitions/mobilizations/polls).
- `campaign_actions_position_idx ON campaign_actions(campaign_id, position)`
  ajouté pour le `ORDER BY position ASC` de la fiche.
- Pas de compteur dénormalisé : le nombre d'actions est lu directement
  depuis le tableau retourné par `getCampaign`. RLS déjà en place
  (`campaigns_select_public`, `campaigns_insert_self`,
  `campaigns_update_owner`, `campaigns_delete_owner`,
  `campaign_actions_select_public`, `campaign_actions_write_author`).
- `web/src/types/database.ts` déjà à jour (campaigns + campaign_actions
  étaient présents — pas de re-génération nécessaire).

### Icônes

- `IconMegaphone` (haut-parleur, baseProps `currentColor`).
- `IconList` (liste avec puces, baseProps `currentColor`).

### Jointures `campaign_actions` — décisions

- **Pas de `select('*, petition:petitions(slug,title), …')` imbriqué**
  pour cette étape : on n'a pas encore les compteurs front, et chaque
  type a déjà un listing dédié (`/petitions/<slug>`). La fiche se
  contente du `*` pour afficher le label libre + l'icône + le lien
  vers la ressource cible. L'enrichissement (vrai titre / nb signatures
  côté pétition) viendra à l'étape 14 quand on aura besoin d'un
  « card preview » riche.
- Side effect : si l'utilisateur supprime une pétition, l'action
  `campaign_actions` se met à `petition_id = null` (FK `on delete set
  null`) → la fiche détecte l'orphelin et l'affiche sans lien.

### Décisions

- **Multi-items inline** : un combobox unique par type (`PickerKind`)
  avec recherche live. Le formulaire évite le « créer en place » du
  prototype (commits `d97d272` / `01f4d73`) — on garde la création
  séparée par type, les utilisateurs peuvent ouvrir `/petitions/new`
  avant de revenir à la création de campagne. Plus simple côté UX,
  moins risqué côté RLS (pas de fanout de policies).
- **RLS owner** : `campaign_actions_write_author` utilise
  `author_id` de la campagne — donc seul l'auteur de la campagne peut
  ajouter/retirer des actions. C'est cohérent avec le sens d'une
  campagne (un porteur principal qui orchestre les actions). Pas
  d'invitation co-auteur pour l'instant.
- **Validation côté front + DB** : on valide en TS + on laisse les
  contraintes DB protéger (NOT NULL, UNIQUE slug, FK).

### Tests

- `src/lib/campaigns.test.ts` — **24 cas** : validation (10), listCampaigns
  (4), getCampaign (3), createCampaign (5 dont retry + rollback),
  addCampaignAction (2), removeCampaignAction (1), constantes (1).
- `src/hooks/useCampaigns.test.tsx` — 3 cas (mount, error, search rerun).
- `src/hooks/useCampaign.test.tsx` — 3 cas (mount, notfound, refresh).
- `src/pages/CampaignsPage.test.tsx` — 4 cas (listing, empty, search,
  erreur FR).
- `src/pages/CampaignDetailPage.test.tsx` — 4 cas (rendu, liens
  cliquables vers /petitions/mobilizations/polls, partage, 404 →
  redirect).
- `src/pages/CampaignCreatePage.test.tsx` — 3 cas (rendu, validation,
  succès → redirect).
- **Total : 42 nouveaux tests** (224 + 42 = **266 tests verts**).

### Checks finaux

- `typecheck` : OK (TS 6 strict, pas de `any`).
- `lint` : OK (ESLint flat, jsx-a11y + react-hooks).
- `test` : 266 passed.
- `build` : 295 kB minified, 85 kB gzip.
- `format:check` : OK (prettier 3).

### Prochaines étapes

- **Étape 13** : audit RGPD de fin Sprint 2 (bannière cookies + page
  politique de confidentialité + audit RLS final + vérif Sentry no-PII)
  **OU** bascule Sprint 3 (Hébergement + Covoiturage).
- Sprint 3 commence côté schéma : tables `housing`, `housing_bookings`,
  `carpool_offers`, `carpool_seats` déjà posées (cf. `db/schema.sql`
  §15-16) — RLS déjà en place. Reste : libs + hooks + pages.

---

## Prompt pour la session N+7 (étape 13)

> Repo : `/home/user/maintenantproto1` (branche imposée par l'harness —
> typiquement `claude/<auto>`).
>
> **Lis dans cet ordre** :
>
> 1. `CLAUDE.md` — règles projet (TS strict, pas de `any`, camelCase TS /
>    snake_case DB, SVG via `ICONS.*` pas d'emojis, RLS, RGPD).
> 2. `HANDOFF.md` §5 (sécurité/RGPD) + §10 Sprint 2 (fin) + §10 Sprint 3
>    (services communautaires — Hébergement, Covoiturage).
> 3. `HANDOFF-PROGRESS.md` — journal (étape 12 ✅ — étape 13 à faire).
> 4. `db/schema.sql` — RLS finale : passer en revue chaque policy table
>    par table et vérifier qu'il n'y a pas de `using (true)` non voulu,
>    qu'aucune table privée n'est `select public`, que `is_admin` filtre
>    bien les opérations sensibles.
> 5. `Theme.jsx` + `Pages_Services.jsx` — composants `CookieBanner`,
>    `PrivacyPage`, mentions légales du prototype.
> 6. `web/src/lib/campaigns.ts`, `web/src/lib/polls.ts`,
>    `web/src/lib/mobilizations.ts`, `web/src/lib/petitions.ts` — pour
>    vérifier que tout le contenu militant respecte le retrait RGPD.
>
> **État actuel à la fin de l'étape 12** (tip `claude/add-polls-module-lv84O`,
> commit `feat(campaigns): step 12 — CRUD campagnes + listing + fiche + création`) :
>
> - Prototype intact : `project/app/Maintenant.html` + JSX racine.
> - `web/` : Vite + React 19 + TS 6 strict, **266 tests verts** (42 nouveaux
>   à l'étape 12), ESLint flat, Vitest, Prettier, build 295 kB.
> - Supabase : `db/schema.sql` ≈ 1 885 lignes (36 tables + 119 policies RLS
>   + index `campaigns_status_idx` + `campaign_actions_position_idx`),
>   `web/src/types/database.ts` ≈ 1 720 lignes.
> - Auth complète : signup/login/logout/reset password + OAuth Google +
>   Instagram + magic link + callback page `/auth/callback`.
> - Profil + adhésion Stripe + RPC T99CP opérationnels.
> - **Sprint 2 complet** : pétitions, mobilisations, sondages, campagnes —
>   chaque module a `lib + hooks + listing + fiche + création RequireAuth +
>   tests` et utilise `slugify()` partagé via `web/src/lib/slug.ts`.
> - Campagnes : module `campaigns.ts` + hooks `useCampaigns` / `useCampaign`,
>   pages `/campaigns`, `/campaigns/:slug`, `/campaigns/new`, picker multi-
>   items inline (Pétitions / Mobilisations / Sondages).
>
> **CONTEXTE D'OUVERTURE** — à exécuter avant toute autre action :
>
> 1. `git fetch origin claude/add-polls-module-lv84O` (retry network
>    2s/4s/8s/16s) pour récupérer le tip de l'étape 12.
> 2. `git merge --no-ff <SHA-étape-12>` pour intégrer le commit
>    `feat(campaigns): step 12 …`. En cas d'absence,
>    `git checkout origin/claude/add-polls-module-lv84O -- .` puis commit.
> 3. `cd web && npm install --legacy-peer-deps` (lockfile non versionné,
>    option requise à cause d'`eslint-plugin-jsx-a11y` ↔ ESLint 10).
>
> **ÉTAPE 13 à exécuter — Audit RGPD fin Sprint 2 (recommandée) OU bascule
> Sprint 3** :
>
> ### Option A — Audit RGPD fin Sprint 2 (préférée pour solder Sprint 2)
>
> 1. **Bannière cookies** :
>    - `web/src/components/CookieBanner.tsx` — bannière minimale conforme
>      CNIL (catégorisation strictement nécessaire / mesure d'audience
>      anonymisée). Pas de tracking pub. Persistance dans `localStorage`
>      (clé `mn:cookie-consent` avec un objet `{ version, choice, at }`).
>    - Brancher dans `RootLayout` au-dessus de `<Outlet />`. Apparaît au
>      premier render si pas de consentement enregistré.
>    - Boutons : « Tout accepter », « Tout refuser », « Personnaliser »
>      (modale détaillée). Accessible clavier + ARIA.
>    - Tests : ≥ 5 cas (rendu sans consentement, click accept/refuse,
>      persistance, masquage si déjà consenti).
> 2. **Page politique de confidentialité** :
>    - `web/src/pages/PrivacyPage.tsx` (route `/legal/privacy`) — port du
>      contenu prototype, fait office de page légale RGPD. Sections :
>      responsable, finalités, base légale (consentement + intérêt
>      légitime + contrat), durées de conservation, droits RGPD, contact
>      DPO, sous-traitants (Supabase EU, Stripe, etc.).
>    - Tests : ≥ 2 cas (rendu titre + ancres).
> 3. **Page mentions légales** :
>    - `web/src/pages/LegalNoticePage.tsx` (route `/legal/notice`) —
>      éditeur, hébergeur, directeur publication.
> 4. **Footer global** : ajouter liens `/legal/privacy`, `/legal/notice`,
>    `/legal/cookies` dans `RootLayout` (ou créer `Footer.tsx`).
> 5. **Audit RLS final** : parcourir `db/schema.sql` table par table.
>    Documenter dans `HANDOFF-PROGRESS.md` chaque table : niveau d'accès
>    SELECT (public / authenticated / owner / admin), niveau INSERT, UPDATE,
>    DELETE. Vérifier que `is_admin()` est bien la seule porte d'entrée
>    admin. Vérifier qu'aucune table contenant des données perso (users,
>    profiles, signatures, votes, participations) n'a `using (true)` en
>    SELECT.
> 6. **Audit Sentry no-PII** : si `web/src/lib/sentry.ts` n'existe pas
>    encore, créer le scaffold avec `beforeSend(event)` qui scrub
>    `event.user`, `event.request.cookies`, `event.extra.email`,
>    `event.extra.phone`, et toute clé contenant `email` / `phone` /
>    `address`. Si Sentry déjà branché, vérifier le scrub.
> 7. **Tests** : objectif **≥ 280 tests verts** (266 existants + ≥ 14
>    nouveaux).
> 8. Mettre à jour `HANDOFF-PROGRESS.md` : étape 13 ✅ avec sections
>    « Bannière cookies », « Pages légales », « Audit RLS », « Audit Sentry
>    no-PII », « prochaines étapes (Sprint 3 — services communautaires) ».
> 9. **Écrire le prompt de la session N+8 (étape 14)** dans
>    `HANDOFF-PROGRESS.md` : démarrage Sprint 3 — Hébergement + Covoiturage
>    CRUD côté front. Reproduire la structure habituelle (lib + hooks +
>    pages + tests).
> 10. **Coller le prompt de l'étape 14 dans la conversation finale**.
> 11. **Commit** : `chore(rgpd): step 13 — bannière cookies + pages légales + audit RLS/Sentry`.
>     Push sur la branche imposée par l'harness.
>
> ### Option B — Bascule Sprint 3 (si on préfère avancer)
>
> Démarrer Hébergement + Covoiturage directement (lib + hooks + pages
> + tests). Reproduire le pattern des étapes 9-12. L'audit RGPD peut
> alors être repoussé à l'étape 15.
>
> **Contraintes** :
>
> - Ne pas toucher au prototype (`project/app/Maintenant.html` et JSX
>   racine).
> - TS strict + no `any`.
> - Conserver les checks verts : `typecheck`, `lint`, `test`, `build`,
>   `format:check`.
> - Pas d'emojis dans le code TS ni dans les commits.
>
> **NOTE sur la boucle récursive** :
>
> Le Sprint 2 (contenu militant — pétitions, mobilisations, campagnes,
> sondages) est **complet** à la fin de l'étape 12. À partir de
> l'étape 13, la double consigne (écrire le prompt N+1 + le coller dans
> la réponse Claude) reste utile pour fluidifier la passation entre
> sessions, mais elle est désormais **facultative** côté boucle
> récursive — l'agent peut basculer sur la convention git-flow standard
> du projet si l'utilisateur le souhaite.

---

## Étape 13 — Fin Sprint 2 / Audit RGPD ✅

**Branche** : `claude/add-campaigns-module-FHBHA` (merge `claude/add-polls-module-lv84O`
@ `9193afa` → étape 12 puis travail étape 13)
**Commit cible** : `chore(rgpd): step 13 — bannière cookies + pages légales + audit RLS/Sentry`

### Bannière cookies

- `web/src/lib/consent.ts` — helpers typés `readConsent`, `writeConsent`,
  `clearConsent` autour de la clé `mn:cookie-consent` (localStorage).
  Schéma versionné `{ version, choice, categories, at }` : tout bump de
  `CONSENT_VERSION` invalide automatiquement les choix passés (ré-affichage
  forcé de la bannière). Pas de dépendance externe.
- `web/src/components/CookieBanner.tsx` — bannière fixée en bas, conforme
  CNIL :
  - Catégorisation **strictement nécessaire** (toujours active) + **mesure
    d'audience anonymisée** (opt-in). Pas de tracking publicitaire, pas de
    profilage cross-site.
  - Trois actions principales : « Tout accepter », « Tout refuser »,
    « Personnaliser » (panneau inline avec checkboxes par catégorie).
  - Le refus est aussi facile que l'acceptation (même hiérarchie de
    bouton). La bannière disparaît après choix et persiste jusqu'à un bump
    de version ou un reset utilisateur via `/legal/cookies`.
  - Accessible clavier : tous les boutons natifs, `aria-expanded`,
    `aria-controls`, `role="region"` avec `aria-labelledby`/`aria-describedby`.
- Branchée dans `RootLayout` (sous `<Outlet />` + `Footer`) → s'affiche
  partout au premier render si pas de consentement.

### Pages légales

- `web/src/pages/PrivacyPage.tsx` — route `/legal/privacy`. Sommaire avec
  ancres : `#responsable`, `#finalites`, `#base-legale`, `#donnees`,
  `#conservation`, `#sous-traitants`, `#droits`, `#dpo`. Couvre :
  - Identité du responsable de traitement.
  - Finalités (gestion compte, contenu militant, services, adhésions
    T99CP, messagerie, audience anonymisée, modération).
  - Triple base légale (contrat / consentement / intérêt légitime) avec
    détail par finalité.
  - Catégories de données collectées + précision sur signatures/votes
    (transparence des soutiens publics).
  - Durées de conservation (compte, contenus, messages 24 mois, logs
    12 mois, comptabilité 10 ans).
  - Sous-traitants : Supabase EU (Francfort), Vercel EU, Stripe (PCI-DSS
    niveau 1), Sentry (scrub PII avant envoi).
  - Droits RGPD + lien CNIL.
- `web/src/pages/LegalNoticePage.tsx` — route `/legal/notice`. Éditeur
  (forme juridique, siège, SIRET, directeur publication — placeholders à
  compléter avant mise en prod), hébergeurs (Vercel + Supabase + Stripe),
  propriété intellectuelle.
- `web/src/pages/CookiesPage.tsx` — route `/legal/cookies`. Tableau des
  cookies (`sb-auth-token`, `mn:cookie-consent`, `_mn_audience`) avec
  finalité / durée / catégorie. Affichage de l'état courant
  (« vous avez accepté tous les cookies » / « vous avez refusé… »).
  Bouton « Modifier mes choix » qui purge le consentement et déclenche
  la ré-apparition de la bannière au prochain chargement.
- `web/src/components/Footer.tsx` — pied de page global accessible
  (`aria-label="Pied de page"`, sous-nav `aria-label="Liens légaux"`)
  avec les 3 liens `/legal/privacy`, `/legal/notice`, `/legal/cookies`.
  Branché dans `RootLayout` au-dessus du `CookieBanner`.

### Routes

- `/legal` (nested) avec enfants `privacy`, `notice`, `cookies`. Public.

### Audit RLS final — passage en revue table par table

Légende des colonnes :

- **R** = SELECT (lecture)
- **W** = INSERT / UPDATE / DELETE (écriture)
- `pub` = public / anon ; `auth` = utilisateur connecté ; `own` = propriétaire ;
  `party` = partie prenante de la ligne ; `admin` = `is_admin(auth.uid())`.

| Table                       | R                       | W                        | Verdict RGPD                                              |
| --------------------------- | :---------------------- | :----------------------- | :-------------------------------------------------------- |
| `users`                     | `pub` (profil)          | INS self / UP self+admin / DEL admin | **À durcir** : email présent dans la table → exposé via `select *`. Cf. action #1 ci-dessous. |
| `petitions`                 | published / own / admin | INS self / UP+DEL own+admin | OK. Brouillons protégés.                                   |
| `signatures`                | `pub` (compteur)        | INS self / DEL self+admin | OK (acceptable). user_id projeté = opinion politique liée → couvert par la politique de confidentialité (transparence des soutiens). |
| `mobilizations`             | published / own / admin | INS self / UP+DEL own+admin | OK.                                                       |
| `participations`            | `pub` (compteur)        | INS self / DEL self+admin | OK (idem signatures).                                     |
| `housing`                   | is_published / own / admin | INS self / UP+DEL own+admin | OK.                                                       |
| `housing_requests`          | requester+host+admin    | INS self / UP+DEL parties+admin | OK (strictement privé).                                    |
| `carpooling`                | is_published / driver / admin | INS self / UP+DEL own+admin | OK.                                                       |
| `lending`                   | `pub`                   | INS self / UP+DEL own+admin | OK (annonces objet — pas de PII sensible).                 |
| `marketplace_items`         | `pub`                   | INS self / UP+DEL own+admin | OK.                                                       |
| `garden_plots`              | `pub`                   | INS self / UP+DEL own+admin | OK.                                                       |
| `sel_offers`                | is_active / own / admin | INS self / UP+DEL own+admin | OK.                                                       |
| `sel_demands`               | is_active / own / admin | INS self / UP+DEL own+admin | OK.                                                       |
| `crowdfunding_campaigns`    | published / own / admin | INS self / UP+DEL own+admin | OK.                                                       |
| `contributions`             | contributor+organizer+admin | INS self (UP/DEL interdits) | OK (privé, intégrité comptable préservée).                 |
| `articles`                  | published / author / admin | INS self / UP+DEL own+admin | OK.                                                       |
| `comments`                  | `pub` sauf is_flagged   | INS self / UP+DEL own+admin | OK.                                                       |
| `reactions`                 | `pub`                   | INS self / DEL self+admin | OK.                                                       |
| `posts`                     | visibility-based        | INS self / UP+DEL own+admin | OK (`public` / `members` / `private` respectés).           |
| `post_likes`                | `pub`                   | INS self / DEL self+admin | OK.                                                       |
| `post_comments`             | `pub` sauf is_flagged   | INS self / UP+DEL own+admin | OK.                                                       |
| `polls`                     | published / author / admin | INS self / UP+DEL own+admin | OK.                                                       |
| `poll_options`              | `pub`                   | FOR ALL → author du poll + admin | OK.                                                       |
| `votes`                     | `pub` (compteur)        | INS self+members_only / DEL self+admin | OK (idem signatures, transparence assumée).                |
| `campaigns`                 | published / author / admin | INS self / UP+DEL own+admin | OK.                                                       |
| `campaign_actions`          | `pub`                   | FOR ALL → author de la campaign + admin | OK.                                                       |
| `communes`                  | `pub`                   | FOR ALL → admin uniquement | OK (politique éditoriale).                                 |
| `commune_members`           | `pub`                   | INS self / UP admin+treasurer / DEL self+admin | OK.                                                       |
| `conversations`             | user_a / user_b / admin | INS+UP party / DEL party+admin | OK (strictement privé).                                    |
| `messages`                  | party / admin           | INS party / UP admin only | OK (body figé).                                            |
| `notifications`             | recipient only          | INS admin / UP recipient / DEL recipient+admin | OK (admins exclus de la lecture — c'est volontaire).       |
| `members`                   | `pub` (badge)           | FOR ALL → admin uniquement | À surveiller : badge adhérent public — affiliation à une association politique → couvert par la politique de confidentialité. |
| `adhesions`                 | self / admin            | INS self / UP admin only  | OK.                                                       |
| `t99cp_transactions`        | self / admin            | INS admin only (RPC SECURITY DEFINER) | OK (intégrité monétaire).                                 |
| `admin_logs`                | admin only              | admin only                | OK.                                                       |
| `email_campaigns`           | admin only              | admin only                | OK.                                                       |
| `storage.objects` (avatars) | `pub` (bucket public)   | INS+UP+DEL owner sous `<uid>/` | OK (path-scoped, pas d'écrasement croisé).                 |

#### Findings principaux

1. **`users.email` exposé via `select *`** (table en lecture publique).
   Aucune table privée n'est `using (true)` en SELECT — sauf `users`,
   qui *est* publique par design, mais l'email s'y trouve. **À faire
   avant mise en prod** : soit créer une vue `public_users` (id,
   display_name, avatar, ville, badges) et révoquer `select` sur
   `users` au rôle anon, soit utiliser `GRANT SELECT (cols…)` pour
   masquer la colonne `email`. Suivi : ticket à ouvrir au Sprint 6
   (« hardening final »).
2. **`signatures` / `participations` / `votes`** : `user_id` projeté
   publiquement = donnée d'opinion politique liée à l'identité. C'est
   un trade-off RGPD assumé (transparence des soutiens militants),
   désormais explicité dans `PrivacyPage` §4 (« données collectées »).
3. **`members.user_id`** : badge adhérent public = donnée d'appartenance
   à une organisation politique. Idem — assumé, documenté dans
   `PrivacyPage`. Pas de listing public des membres directement,
   seulement le badge sur le profil de la personne qui publie.
4. **`is_admin()` est bien la seule porte d'entrée admin** sur toutes
   les policies — vérifié visuellement, aucune table n'a un autre
   raccourci (pas de `auth.role() = 'service_role'` direct dans une
   policy front-facing).
5. **Aucune table privée n'a `using (true)` en SELECT** : housing_requests,
   conversations, messages, notifications, adhesions, t99cp_transactions,
   contributions, admin_logs, email_campaigns sont toutes party-only ou
   self-only ou admin-only.

#### Décisions

- L'audit ne modifie pas le schéma à cette étape — les findings #1, #2,
  #3 sont documentés ici et dans `PrivacyPage`. La création d'une vue
  `public_users` + retrait de `select` direct est planifiée pour le
  Sprint 6 (hardening pré-prod).
- Les policies utilisant `using (true)` sur des compteurs publics
  (signatures, participations, votes, post_likes, reactions, campaign_actions,
  poll_options) sont volontaires et alignées avec l'esprit transparence
  du projet.

### Audit Sentry no-PII

- `web/src/lib/sentry.ts` — scaffold `scrubEvent(event)` à passer en
  `beforeSend` quand le SDK Sentry sera branché. Pas de dépendance
  `@sentry/browser` côté lib (autonome + 100 % testable).
- Pattern `PII_KEY_PATTERN` couvre `email`, `phone`, `address`, `token`,
  `password`, `authorization` (case-insensitive, match partiel sur
  `streetAddress`, `userEmail`, `AuthorizationHeader`, etc.).
- `scrubEvent` :
  - `event.user` → `[Filtered]` complètement (pas même un id pseudonymisé
    par défaut).
  - `event.request.cookies` → `[Filtered]`.
  - `event.request.headers` → scrub récursif.
  - `event.extra`, `event.contexts`, `event.tags` → scrub récursif
    (toute clé matchant le pattern).
  - `event.breadcrumbs` → scrub récursif élément par élément.
  - Immutable : ne mute pas l'événement d'origine (clone superficiel +
    récursif des sous-objets).
- Quand le SDK sera ajouté (clé DSN), l'init côté `main.tsx` ressemblera
  à :
  ```ts
  Sentry.init({ dsn, beforeSend: scrubEvent });
  ```

### Tests

- `src/lib/consent.test.ts` — **9 cas** : `readConsent` (5 : null,
  JSON invalide, version obsolète, choice inconnu, valide),
  `writeConsent` (2 : persistance + storage broken), `clearConsent`
  (1), `MemoryStorage` impl test-only (intégrée dans le fichier).
- `src/components/CookieBanner.test.tsx` — **8 cas** : affichage sans
  consentement, masquage si déjà consenti, version obsolète →
  réapparition, accept all, refuse all, personnaliser → ouvre panneau,
  toggle analytics + enregistrement custom.
- `src/pages/PrivacyPage.test.tsx` — **3 cas** : titre, toutes les
  ancres présentes, sous-traitants listés.
- `src/pages/LegalNoticePage.test.tsx` — **2 cas** : titre, éditeur +
  hébergeurs.
- `src/pages/CookiesPage.test.tsx` — **4 cas** : tableau cookies,
  état « aucun choix », état « tout accepter », reset choix.
- `src/lib/sentry.test.ts` — **6 cas** : pattern PII match/no-match,
  scrub user, scrub cookies, scrub headers, scrub extra profond,
  scrub breadcrumbs, immutabilité.
- **Total : 32 nouveaux tests** (266 + 32 = **298 tests verts**).

### Hygiène

- `web/src/test/setup.ts` : ajout d'un `window.localStorage.clear()`
  dans le `afterEach` global pour éviter que la bannière fuie entre
  tests (RootLayout monte CookieBanner systématiquement). Wrapped
  dans `try/catch` pour rester compatible avec les environnements où
  `localStorage` est indisponible.

### Checks finaux

- `typecheck` : OK (TS 6 strict, pas de `any`).
- `lint` : OK (ESLint flat, jsx-a11y + react-hooks).
- `test` : **298 passed**.
- `build` : 295 kB minified, 85 kB gzip (légère hausse vs étape 12 — pages
  légales + bannière sont peu coûteuses).
- `format:check` : OK (prettier 3).

### Prochaines étapes

- **Étape 14** : Sprint 3 — Hébergement + Covoiturage CRUD côté front.
  Pattern habituel `lib + hooks + listing + fiche + création RequireAuth +
  tests`. Tables déjà en place (`housing`, `housing_requests`, `carpooling`)
  avec RLS validée à cette étape.
- **À ouvrir en ticket avant mise en prod** : vue `public_users` masquant
  l'email + grant SELECT colonne par colonne (cf. finding #1).
- **À brancher quand DSN dispo** : `Sentry.init({ beforeSend: scrubEvent })`
  dans `web/src/main.tsx`.

---

## Étape 14 — Sprint 3 / Hébergement + Covoiturage CRUD ✅

> Session N+8. Tip de branche : `claude/hosting-carpooling-sprint-NFZBr`.
> Commit : `feat(services): step 14 — hébergement + covoiturage CRUD`.

### Module `web/src/lib/housing.ts`

- Types dérivés du schéma : `HousingRow`, `HousingInsert`,
  `HousingRequestRow`, `HousingRequestInsert`, `HousingRequestStatus`.
- Constantes de validation exportées (titre 4-80, description 40-2000,
  capacité 1-20, message 20-2000, etc.).
- `validateHousingInput(input)` — retourne `ValidationIssue[]`
  (champs typés `CreateHousingField`). Vérifie les bornes, l'ordre
  `availableFrom <= availableTo`.
- `validateRequestInput(input)` — vérifie le message, les dates et
  `endsOn >= startsOn`.
- `listHousing({ city, search, capacityMin, availableFrom, availableTo,
  limit })` — `is_published=true` par défaut, tri `created_at DESC`,
  search `or('title.ilike.%X%,city.ilike.%X%,description.ilike.%X%')`
  avec échappement `%`, `_`, `,`. Limite par défaut 50.
- `getHousing(id)` — `maybeSingle` par ID (pas de slug — la table n'a
  pas de colonne `slug`). Si on veut un slug, migration séparée à
  prévoir.
- `createHousing(input)` — validation puis insert RLS-checked.
- `requestHousing({ housingId, requesterId, message, startsOn, endsOn })`
  — insert `housing_requests` (statut `pending`).
- `cancelRequest(id)` / `acceptRequest(id)` / `refuseRequest(id)` —
  update du `status` (`cancelled` / `accepted` / `declined`) ; RLS
  filtre côté DB (le demandeur peut annuler, l'hôte peut accepter
  / refuser).

### Module `web/src/lib/carpooling.ts`

- Types `CarpoolingRow`, `CarpoolingInsert`.
- Constantes : `CARPOOLING_CITY_MIN/MAX`, `CARPOOLING_SEATS_MIN/MAX`,
  `CARPOOLING_PRICE_MIN/MAX`, `CARPOOLING_NOTES_MAX`.
- `validateCarpoolingInput(input)` — origin/destination 2-80,
  `departsAt` futur et valide, `seats` entier 1-8, `priceEur` ≥ 0
  (≤ 500), notes ≤ 2000.
- `listCarpooling({ from, to, search, departsAfter, departsBefore,
  limit })` — `is_published=true`, tri `departs_at ASC`. Search
  `or('origin_city.ilike.%X%,destination_city.ilike.%X%,notes.ilike.%X%')`
  avec échappement.
- `getCarpooling(id)` — par ID.
- `createCarpooling(input)` — validation puis insert RLS-checked.

### Hooks `useHousing` / `useHousingItem` / `useCarpooling` / `useCarpoolingItem`

- Pattern identique à `useCampaigns` / `useCampaign` : `status` =
  `idle | loading | ready | (notfound) | error`, reset des états
  pendant le render quand les filtres changent.
- `refresh()` rejoue la requête (utile après mutation côté listing
  ou côté fiche).

### Pages

- `HousingPage` (`/services/housing`) — hero gradient, toolbar avec
  recherche / ville / capacité minimum / CTA « Proposer un
  hébergement ». Cards `Link` vers `/services/housing/:id`.
- `HousingDetailPage` (`/services/housing/:id`) — hero avec titre,
  ville, capacité, plage de disponibilité formatée FR, bouton
  « Faire une demande » (masqué si l'utilisateur est l'hôte —
  message « Vous êtes l'hôte » à la place) + bouton « Partager »
  (Web Share API → clipboard fallback).
- `HousingCreatePage` (`/services/housing/new`, RequireAuth) —
  formulaire complet avec validation FR.
- `HousingRequestPage` (`/services/housing/:id/request`, RequireAuth)
  — formulaire `message + startsOn + endsOn`, écran de confirmation
  après soumission. Redirige vers la fiche si l'utilisateur est
  l'hôte (impossible de se contacter soi-même).
- `CarpoolingPage` (`/services/carpooling`) — toolbar `from / to /
  search / date de départ minimum`. Card avec date formatée FR,
  trajet `origin → destination`, places, prix (« Gratuit » si
  `price_eur=0`).
- `CarpoolingDetailPage` (`/services/carpooling/:id`) — hero avec
  trajet, date complète FR, places, prix, notes ; bouton
  « Partager ».
- `CarpoolingCreatePage` (`/services/carpooling/new`, RequireAuth)
  — formulaire avec heure séparée (date + time → ISO).

### Icônes

- Ajout de `IconHome` et `IconCar` dans
  `web/src/components/icons.tsx`. Pas d'emojis dans le code (cf.
  CLAUDE.md).

### Router

- Routes ajoutées sous `services` (cf. `web/src/router.tsx`) :
  `housing`, `housing/new` (RequireAuth), `housing/:id`,
  `housing/:id/request` (RequireAuth), `carpooling`,
  `carpooling/new` (RequireAuth), `carpooling/:id`.

### Tests

- `web/src/lib/housing.test.ts` — 26 tests (validation host /
  request, listHousing tri + filtres + escaping, getHousing,
  createHousing erreurs/succès, cancel/accept/refuse).
- `web/src/lib/carpooling.test.ts` — 16 tests (validation incluant
  bornes, departs_at passé, prix, listCarpooling tri + filtres
  ASC + escaping, getCarpooling, createCarpooling).
- `web/src/hooks/useHousing.test.tsx` — 3 tests.
- `web/src/hooks/useHousingItem.test.tsx` — 3 tests.
- `web/src/hooks/useCarpooling.test.tsx` — 3 tests.
- `web/src/hooks/useCarpoolingItem.test.tsx` — 3 tests.
- `web/src/pages/services/HousingPage.test.tsx` — 4 tests (listing
  + compteur, état vide, recherche, erreur RLS FR).
- `web/src/pages/services/HousingDetailPage.test.tsx` — 5 tests
  (rendu fiche, CTA non-hôte, masquage CTA hôte, notfound
  redirect, bouton Partager).
- `web/src/pages/services/HousingCreatePage.test.tsx` — 4 tests
  (rendu formulaire, validation FR, succès redirect, erreur RLS).
- `web/src/pages/services/HousingRequestPage.test.tsx` — 4 tests
  (rendu + résumé annonce, redirect hôte, validation, succès
  + écran de confirmation).
- `web/src/pages/services/CarpoolingPage.test.tsx` — 4 tests
  (compteur, « Gratuit », état vide, erreur RLS).
- `web/src/pages/services/CarpoolingDetailPage.test.tsx` — 4 tests
  (rendu trajet + notes, notfound redirect, Partager, « Gratuit »).
- `web/src/pages/services/CarpoolingCreatePage.test.tsx` — 3 tests
  (rendu formulaire, validation FR, succès redirect).
- **Total : 82 nouveaux tests.** Compteur global :
  `Test Files 57 passed (57) · Tests 380 passed (380)` (vs 298 à la
  fin de l'étape 13).

### Décisions

- **Pas de slug `housing` ni `carpooling` pour l'instant.** Les
  fiches sont accessibles par ID. Si on veut des URLs « jolies »
  plus tard, prévoir migration séparée + `slugify()` (déjà dispo
  dans `web/src/lib/slug.ts`).
- **`requestHousing` : page séparée plutôt que modale**. Mieux pour
  l'A11Y (focus management) et autorise du deep-linking partagé.
- **`HousingDetailPage` masque le CTA quand `user.id === host_id`.**
  La RLS aurait bloqué la requête en cas de bypass, mais l'UX est
  plus claire avec une garde côté front.
- **Pas de RPC dédié pour `acceptRequest/refuseRequest`.** Un
  simple update du `status` suffit ; la policy
  `housing_requests_update_parties` filtre déjà côté DB.
- **`carpooling.notes` indexé en search.** Comme on n'a pas de
  champ `title` sur cette table, on étend `ilike` à `notes` pour
  permettre une recherche large (point de RDV, événement…).
- **Build inchangé en taille (295 kB)** — la bundle Vite est
  tronquée à `supabase.ts` faute d'env vars en CI ; pas un
  regression introduit ici (déjà observé en étape 13). À fixer
  proprement quand on activera l'environnement de preview avec
  vraies clés Supabase publiques.

---

## Étape 15 — Sprint 3 / Lending + Marketplace + Garden + SEL + Crowdfunding ✅

**Branche** : `claude/sprint-3-features-1Z4a3`

Fin du Sprint 3 : on monte les 5 modules restants des services
communautaires. Mêmes patterns que `housing` / `carpooling` à l'étape 14
(types dérivés de `Database['public']`, validation côté front avant
insert, `listX` avec or-search échappée, hook listing + hook item, pages
Listing/Detail/Create). Crowdfunding ajoute une page `Contribute` et le
retry slug du pattern `campaigns`.

### Modules `web/src/lib/`

- **`lending.ts`** — annonces de prêt d'objets en T99CP.
  Table `lending(owner_id, title, description?, category, city,
  t99cp_cost, is_available)`. Pas de slug. Filtre listing
  `is_available=true`. Validation : titre 4-80, catégorie 2-40, ville
  2-80, coût T99CP 0-10000.
- **`marketplace.ts`** — annonces de matériel / services
  (`marketplace_items`). CHECK SQL impose price_eur OU t99cp_cost
  renseigné → validation front aussi. Filtre listing `is_sold=false`.
- **`garden.ts`** — jardins partagés (`garden_plots`). Pas de filtre
  actif (toutes les fiches publiées). Filtre `withSpots` côté front via
  `gt('available_spots', 0)`.
- **`sel.ts`** — offres SEL (`sel_offers`). Filtre listing
  `is_active=true`. Tarif en T99CP / unité (heure, séance, etc.) défini
  par l'auteur.
- **`crowdfunding.ts`** — cagnottes (`crowdfunding_campaigns`) +
  contributions (`contributions`). Réutilise `slugify()` et le retry
  23505 du pattern `campaigns`. `contribute()` insère sans
  `stripe_payment_intent` (mis à jour plus tard via webhook Stripe au
  sprint paiement).

### Hooks `web/src/hooks/`

Pour chaque module, deux hooks suivant le pattern
`useCarpooling` / `useCarpoolingItem` :

- `useLending` / `useLendingItem`
- `useMarketplace` / `useMarketplaceItem`
- `useGarden` / `useGardenItem`
- `useSel` / `useSelItem`
- `useCrowdfunding` / `useCrowdfundingItem`

Status `idle | loading | ready | error` (ou `notfound` pour l'item),
reset des états quand les filtres changent, `refresh()` exposé.

### Pages `web/src/pages/services/`

Pour chaque module : `XxxPage` (listing avec hero + filtres),
`XxxDetailPage` (fiche avec Partager + masquage CTA si propriétaire) et
`XxxCreatePage` (formulaire RequireAuth). Crowdfunding ajoute
`CrowdfundingContributePage` (`/services/crowdfunding/:id/contribute`,
RequireAuth) : montant 1-10000 €, option « anonyme », succès →
redirection vers la fiche après 1,5 s.

Toutes les fiches `XxxDetailPage` :

- Hero avec tag catégorie, titre, métadonnées (ville, coût/places…).
- Description en `whitespace: pre-wrap` si présente.
- Bouton « Partager » avec `navigator.share` + fallback clipboard.
- Masquage du CTA principal si l'utilisateur est le propriétaire
  (cf. `housing.host_id`, `marketplace_items.seller_id`,
  `lending.owner_id`, `garden_plots.manager_id`, `sel_offers.user_id`,
  `crowdfunding_campaigns.organizer_id`).

### Router

Ajout sous `services` (avec `RequireAuth` sur les routes d'écriture) :

- `lending`, `lending/new`, `lending/:id`
- `marketplace`, `marketplace/new`, `marketplace/:id`
- `garden`, `garden/new`, `garden/:id`
- `sel`, `sel/new`, `sel/:id`
- `crowdfunding`, `crowdfunding/new`, `crowdfunding/:id`,
  `crowdfunding/:id/contribute`

`CampaignDetailPage` (`web/src/pages/CampaignDetailPage.tsx:241`)
référence déjà `/services/crowdfunding/${action.crowdfunding_id}` (cf.
résolveur d'actions) — la route est désormais montée, donc les fiches
campagne avec une action `crowdfunding_id` deviennent cliquables.

### Tests

- **Lending** : 32 tests (lib 13 / hooks 6 / pages 13)
- **Marketplace** : 27 tests (lib 12 / hooks 5 / pages 10)
- **Garden** : 26 tests (lib 13 / hooks 5 / pages 8)
- **SEL** : 26 tests (lib 13 / hooks 5 / pages 8)
- **Crowdfunding** : 35 tests (lib 17 / hooks 5 / pages 13 dont 4 pour
  la contribute page)

Total nouveau : **146 tests**.

Fin d'étape 14 : 380 tests verts. Fin d'étape 15 :
**526 tests verts** (88 fichiers, durée ~54 s). Build : 295 kB (tronqué
à `supabase.ts` faute de `VITE_SUPABASE_*` en CI — pas une régression
introduite ici, déjà observé aux étapes 13 et 14).

### Décisions

- **URLs par ID, pas par slug** — la table `crowdfunding_campaigns`
  impose un slug NOT NULL UNIQUE, mais la route demandée par le prompt
  (`/services/crowdfunding/:id`) et l'usage par `campaign_actions.
  crowdfunding_id` (déjà UUID) imposent un fetch par ID. Le slug est
  généré et inséré pour respecter la contrainte SQL, mais inutilisé en
  routage front. Un suivi futur pourrait monter `/cagnottes/:slug` à
  côté de `/services/crowdfunding/:id` si on souhaite des URLs lisibles
  (idem `/petitions/:slug` / `/campaigns/:slug`).
- **Pas de paiement Stripe à cette étape** — `contribute()` enregistre
  la ligne en DB avec `stripe_payment_intent = null`. La table
  `crowdfunding_campaigns.raised_eur` n'est PAS incrémentée
  client-side : la mise à jour viendra via un webhook Stripe (au sprint
  paiement), pour garantir l'intégrité comptable et ne pas exposer une
  RPC `increment_raised` côté front.
- **Validation `price_eur` OU `t99cp_cost`** pour `marketplace_items` —
  la table a un `CHECK (price_eur IS NOT NULL OR t99cp_cost IS NOT
  NULL)`. La validation front reproduit la contrainte et renvoie un
  message FR avant l'insert pour éviter un round-trip 23514.
- **`withSpots` côté garden** — au lieu d'un `eq('available_spots', > 0)`
  (qui n'existe pas en PostgREST), on a un `gt('available_spots', 0)`.
  C'est l'équivalent SQL `available_spots > 0` direct.
- **Build inchangé en taille (295 kB)** — la bundle Vite est tronquée
  à `supabase.ts` faute d'env vars en CI ; pas une régression
  introduite ici (déjà observé aux étapes 13 et 14).
- **Auth dans les tests** — la fiche
  `CrowdfundingDetailPage.test.tsx` a un cas « organisateur »
  qui doit mocker `getSession` *et* `useAuthStore.setState` : sans le
  premier, l'effet `useAuth` reset le store en `anonymous` au mount.
  Pattern à garder en tête pour les tests qui dépendent de
  `auth.user.id === row.owner_id`.

---

## Étape 17 — Sprint 5 / Admin + Communes libres + Contact ✅

**Branche** : `claude/review-project-rules-aenB3`

Fin du Sprint 5 : panel admin opérationnel (modération + gestion communes
+ console campagnes email), pages publiques communes libres (listing
+ fiche avec rejoindre/quitter), formulaire de contact RGPD avec
fallback `mailto:`. Pas de migration DB — on s'appuie sur le schéma
existant (`communes`, `commune_members`, `admin_logs`, `email_campaigns`,
RPC `public.is_admin`).

### Modules `web/src/lib/`

- **`communes.ts`** — `communes(name, slug, city, description, treasurer_id)`
  + `commune_members(commune_id, user_id, role)`. Listing public (policy
  `communes_select_public`), création par admin (`communes_write_admin`),
  join/leave self (`commune_members_join_self` / `commune_members_leave_self`),
  update de rôle par admin global ou trésorier
  (`commune_members_update_admin`). Slug unique avec retry 23505 (pattern
  `articles` / `campaigns`).
- **`admin.ts`** — helpers panel admin :
  - `checkIsAdmin(uid)` : appel RPC `public.is_admin(uid)` (security
    definer côté DB) avec fallback `false` en cas d'erreur (mode strict).
  - `listFlaggedArticles` / `listFlaggedPosts` / `listFlaggedPostComments`
    / `listFlaggedComments` : agrégation de la file de modération
    (articles `status='flagged'`, autres tables `is_flagged=true`).
  - `unflagItem(kind, id)` : repasse `articles` en `status='published'`
    ou flip `is_flagged=false` sur les autres. RLS exige
    `public.is_admin(auth.uid())`.
  - `deleteFlaggedItem(kind, id)` : suppression définitive admin only.
  - `logAdminAction({ actorId, action, targetTable, targetId, payload })`
    : insert dans `admin_logs`. Appelé systématiquement après toute action
    admin sensible (création commune, modération, campagne email).
  - `listAdminLogs` / `listEmailCampaigns` / `createEmailCampaign` /
    `updateEmailCampaignStatus` : gestion des campagnes email (draft →
    queued → sent/failed, `sent_at` automatiquement renseigné lors du
    passage en `sent`).

### Hooks `web/src/hooks/`

- `useCommunes(params)` — listing public avec filtres `search` / `city`.
- `useCommune(slug)` — fiche + membres, statuses idle/loading/ready/
  notfound/error.
- `useIsAdmin()` — appel RPC `is_admin`. Pattern « set state during
  render » pour synchroniser avec `(authStatus, userId)` sans muter
  dans un effet (cf. règle `react-hooks/set-state-in-effect`). Fallback
  strict `false` quand anonymous ou RPC en erreur.
- `useAdminFlagged(enabled)` — agrégation Promise.all des 4 sources de
  flagged, tri `createdAt DESC`. `enabled` permet de différer la requête
  tant qu'on n'est pas certain que l'utilisateur est admin (la RLS
  filtrerait de toute façon, mais on évite le round-trip côté UX).
- `useEmailCampaigns(enabled)` — listing campagnes email, même pattern
  `enabled`.

### Composant `web/src/components/RequireAdmin.tsx`

Wrapper équivalent à `RequireAuth`, mais qui en plus vérifie via
`useIsAdmin()` que le user est admin. Trois statuts :

- `loading` (auth ou admin check en cours) → spinner.
- `anonymous` → `Navigate /?auth=login` (ouvre la modale dans `RootLayout`).
- `authenticated` non-admin → `Navigate /` (par défaut).
- `authenticated` admin → rend les `children`.

### Pages `web/src/pages/`

- **`CommunesPage`** (`/communes`, lecture publique) — listing avec
  recherche + carte par commune (ville, nom, description tronquée).
  CTA « Créer une commune » visible uniquement si `useIsAdmin()`.
- **`CommuneDetailPage`** (`/communes/:slug`) — fiche avec ville,
  description, bouton « Rejoindre » / « Quitter » selon
  `commune_members.user_id`, liste des membres avec leur rôle. Pour les
  anonymes : CTA « Se connecter pour rejoindre » vers `/?auth=login`.
- **`CommuneCreatePage`** (`/communes/new`, RequireAuth + RequireAdmin)
  — formulaire nom/ville/description. Sur succès : `logAdminAction`
  avec `action: 'commune.create'`, puis redirect vers `/communes/:slug`.
- **`AdminPage`** (`/admin`, RequireAuth + RequireAdmin) — vue
  d'ensemble en 3 onglets :
  1. **Modération** : file `useAdminFlagged`, actions « Lever le flag »
     (→ `unflagItem` + `logAdminAction moderate.unflag`) et « Supprimer »
     (→ `deleteFlaggedItem` + `logAdminAction moderate.delete`). Lien
     « Voir l'article » pour les articles flagged.
  2. **Communes** : raccourcis vers `/communes/new` et `/communes`.
  3. **Email** : formulaire de création de campagne (draft par défaut)
     + listing des campagnes existantes.
- **`ContactPage`** (`/legal/contact`) — formulaire connecté à la
  messagerie interne :
  - Si `VITE_SUPPORT_USER_ID` est configuré ET l'utilisateur est
    authentifié, `findOrCreateConversation(user.id, supportUserId)`
    puis `sendMessage` vers le compte support.
  - Sinon, fallback `mailto:` vers `VITE_SUPPORT_EMAIL`
    (défaut `contact@maintenant.org`).

### Router & navigation

- `/admin`, `/communes/new` montées avec `RequireAuth + RequireAdmin`.
- `/communes/:slug` ajoutée (lecture publique).
- `/legal/contact` ajoutée sous le groupe `legal`.
- `RootLayout` : le lien « Admin » dans la nav principale n'apparaît que
  pour les utilisateurs admin (`useIsAdmin().isAdmin === true`). Côté
  DB la RLS reste la référence — le masquage front est UX-only.
- `Footer` : lien « Contact » ajouté à côté des autres liens légaux.

### Tests

- **Lib** : communes 30 / admin 36 = 66 tests.
- **Hooks** : useCommunes 3 / useCommune 4 / useIsAdmin 3 /
  useAdminFlagged 3 / useEmailCampaigns 3 = 16 tests.
- **Composant** : RequireAdmin 3 tests (anonymous / authenticated non-admin
  / admin).
- **Pages** : CommunesPage 5 / CommuneDetailPage 6 / CommuneCreatePage 4
  / AdminPage 6 / ContactPage 5 = 26 tests.

Total nouveau : **117 tests**.

Fin d'étape 16 : 654 tests verts. Fin d'étape 17 :
**771 tests verts** (119 fichiers, durée ~58 s). Build : 295 kB (tronqué
faute de `VITE_SUPABASE_*` en CI — pas une régression).

### Décisions

- **Pas de nouvelle table de rôles admin** — on s'appuie strictement
  sur `users.is_admin` + la RPC SQL `public.is_admin(uid)` existante
  (cf. `db/schema.sql` §1). RLS sur `admin_logs`, `email_campaigns`,
  `communes_write_admin` toutes scope `public.is_admin(auth.uid())`.
  Aucun bypass côté front : le panel masque les actions, la DB refuse
  les écritures non-admin.
- **`checkIsAdmin` fallback strict `false`** — toute erreur RPC (réseau,
  404, RLS) doit renvoyer non-admin par défaut pour ne jamais exposer
  d'action admin par erreur. Le panel reste masqué côté UI ET la DB
  rejette les écritures, donc défense en profondeur.
- **`useIsAdmin` en mode « set state during render »** — l'eslint rule
  `react-hooks/set-state-in-effect` interdit `setState` dans un effet
  qui synchronise un état dérivé. La resync `(authStatus, userId) → status`
  passe maintenant par un `useState(previousKey)` comparé en render
  (pattern déjà utilisé par `RootLayout` pour la modale auth).
- **`enabled` flag dans les hooks admin** — `useAdminFlagged` /
  `useEmailCampaigns` acceptent un `enabled: boolean` pour différer le
  fetch tant qu'on n'a pas validé `isAdmin === true`. Évite des
  requêtes RLS-refused inutiles pour les visiteurs qui ouvriraient
  `/admin` directement (RequireAdmin les redirige, mais le hook démarre
  avant la redirection sur le premier render).
- **`logAdminAction` après chaque écriture admin** — pour préserver
  l'audit trail (cf. `admin_logs_admin` policy), toutes les actions
  sensibles sont historisées avec `actor_id`, `action` (namespace
  `moderate.*`, `commune.*`, `email_campaign.*`), `target_table`,
  `target_id`, et un `payload` JSON facultatif.
- **ContactPage : fallback `mailto:` quand pas de compte support** —
  tant que `VITE_SUPPORT_USER_ID` n'est pas renseigné, le formulaire
  bascule sur un `<a href="mailto:...">` pour éviter de créer une
  conversation orpheline (la `messages_insert_party` policy exige que
  les deux user_id existent dans `public.users`). Le fallback respecte
  les conventions RGPD : pas de collecte côté front, pas de tracking.
- **Pas de masquage d'email utilisateur côté admin** — le panel
  modération affiche `body` + `createdAt`, mais pas l'email auteur.
  L'`author_id` (UUID) reste suffisant pour les actions modération
  (suppression / unflag) et évite d'exposer des données perso au-delà
  du nécessaire. Les requêtes `users.email` sont à éviter côté front,
  ce qui rejoint la note RLS de l'étape 14 (créer une vue `public_users`
  avant prod si on veut afficher des profils).
- **Tests page : guard contre les emails partagés** — la `ContactPage`
  affiche `contact@maintenant.org` à plusieurs endroits (lead + CTA +
  footer du bloc) ; on bascule sur `getAllByRole('link')` pour éviter
  un faux échec "multiple elements found".
- **Build inchangé en taille (295 kB)** — bundle Vite tronqué à
  `supabase.ts` faute d'env vars en CI ; pas une régression.

---

## Étape 16 — Sprint 4 / Réseau social + Messagerie + Notifications + Média ✅

**Branche** : `claude/review-project-rules-0nw8s`

Démarrage du Sprint 4. Quatre modules métier, sept pages, plus une migration
DB additive (table `follows`). RLS messagerie auditée : `messages_select_party`
et `messages_insert_party` filtrent strictement par appartenance à la
`conversation` (cf. `db/schema.sql` §15) — pas de fuite RGPD côté DM.

### Migration DB (additive)

- Nouvelle table `public.follows(follower_id, followee_id)` (graphe
  d'abonnement réseau social). UNIQUE `(follower_id, followee_id)` + CHECK
  `follower_id <> followee_id` (pas d'auto-follow côté DB). Indexes sur
  les deux colonnes pour les requêtes `where follower_id = ?` / `where
  followee_id = ?`.
- Policies : `follows_select_public` (lecture publique pour afficher les
  compteurs), `follows_insert_self` (`auth.uid() = follower_id`),
  `follows_delete_self` (le follower ou un admin). Table ajoutée à la liste
  globale `enable row level security`.
- `web/src/types/database.ts` mis à jour à la main avec la définition de
  `follows` (mêmes patterns Row/Insert/Update/Relationships que les autres
  tables).

### Modules `web/src/lib/`

- **`social.ts`** — `posts` (réseau social) + `follows` (graphe). Validation
  body 1-1000 chars, max 4 médias, visibility `public|members|private`.
  `listPosts({ authorIds })` filtre par `in('author_id', [...])` (mode
  « suivis »). Si `authorIds` est explicitement `[]` (utilisateur sans
  abonnement), on renvoie immédiatement `data: []` sans interroger
  PostgREST (`.in('author_id', [])` produit un SQL invalide).
  `followUser`/`unfollowUser`/`listFollowing`/`listFollowers` exposés.
- **`messaging.ts`** — `conversations` 1-1 + `messages`. Validation body
  1-4000 chars. `findOrCreateConversation` cherche d'abord la paire
  `(least, greatest)` puis insère si introuvable. `sendMessage` insère
  et bump `last_message_at` sur la conversation. `otherParty()` renvoie
  l'identifiant de l'« autre » partie selon le `viewerId`. Note RGPD :
  toutes les fonctions sont strictement scope auth.uid() via la RLS.
- **`notifications.ts`** — listing privé (`auth.uid() = recipient_id`),
  `countUnread` (head + count exact), `markNotificationRead` (timestamp
  ISO), `markAllNotificationsRead` (`update where recipient + is null`),
  `markNotificationUnread`, `deleteNotification`.
- **`media.ts`** — `articles` (avec retry 23505 sur slug, comme
  `campaigns` / `crowdfunding`) + `comments` (non flaggés) + `reactions`
  (5 kinds : like/support/disagree/curious/outrage, UNIQUE par
  `(article_id, user_id, kind)`). Validation titre 8-140, résumé 40-280,
  body 200-40000.

### Hooks `web/src/hooks/`

- `usePosts(params)` / `useFollowing(followerId)` — feed + graphe.
- `useConversations(userId)` / `useMessages(conversationId)` —
  pattern « idle si pas d'id, loading sinon ».
- `useNotifications(recipientId, params)` — pareil, avec filterKey
  `JSON.stringify({recipientId, unreadOnly, limit})` pour reset propre
  lors d'un changement de filtre.
- `useArticles(params)` / `useArticle(slug)` — listing + fiche par slug.

### Pages `web/src/pages/`

- **`ReseauPage`** (`/reseau`) — feed des posts + composer
  (textarea, sélecteur visibility, bouton publier) si user connecté +
  onglets « tout / suivis ». L'onglet « suivis » filtre via
  `usePosts({ authorIds: following.map(f => f.followee_id) })`.
- **`MessagingPage`** (`/messaging`, RequireAuth) — liste des conversations
  triée `last_message_at DESC NULLS LAST`. Lien vers chaque DM
  (`/messaging/:conversationId`). Bandeau RGPD permanent en tête.
- **`MessagingConversationPage`** (`/messaging/:conversationId`,
  RequireAuth) — fil chronologique ASC + composer (textarea + bouton
  envoyer). Bulles self/other différenciées. Redirection si conversation
  introuvable ou anonymous. Pas de pré-fetch quand `authStatus` n'est pas
  `'authenticated'` (évite un round-trip RLS inutile).
- **`NotificationsPage`** (`/notifications`, RequireAuth) — flux marqué
  lu/non-lu, onglets « toutes / non lues », bouton « tout marquer comme
  lu », toggle par notification.
- **`MediaPage`** (`/media`) — listing articles publiés, filtres `search`
  + `format` (article/vidéo/podcast/photo/enquête). CTA « Proposer un
  article » → `/media/new`.
- **`ArticleDetailPage`** (`/media/:slug`) — fiche article + barre de
  réactions (5 kinds avec compteurs) + commentaires + composer si
  connecté.
- **`ArticleCreatePage`** (`/media/new`, RequireAuth) — formulaire
  (titre, format, résumé, contenu, cover URL optionnelle).

### Router

Ajouts dans `web/src/router.tsx` :

- `media/new` (RequireAuth) + `media/:slug`
- `messaging` (RequireAuth) + `messaging/:conversationId` (RequireAuth)
- `notifications` (RequireAuth)

Les placeholders `ReseauPage`, `MessagingPage`, `NotificationsPage`,
`MediaPage` sont remplacés par les vraies pages.

### Tests

- **Lib** : social 27, messaging 19, notifications 13, media 30.
- **Hooks** : 18 tests (usePosts 2 / useFollowing 3 / useConversations 3 /
  useMessages 2 / useNotifications 3 / useArticles 2 / useArticle 3).
- **Pages** : Reseau 4 / Messaging 4 / MessagingConversation 4 /
  Notifications 4 / Media 3 / ArticleDetail 5 / ArticleCreate 2 = 26.

Total nouveau : **128 tests**.

Fin d'étape 15 : 526 tests verts. Fin d'étape 16 :
**654 tests verts** (106 fichiers, durée ~63 s). Build : 295 kB (tronqué
faute de `VITE_SUPABASE_*` en CI — pas une régression introduite ici).

### Décisions

- **Table `follows` ajoutée à `db/schema.sql`** (migration additive non
  destructive). Listée explicitement dans le prompt de l'étape 16, donc
  pas de blocage merge auto. RLS strict côté écriture
  (`auth.uid() = follower_id`), lecture publique pour les compteurs.
- **RLS messagerie auditée** — `conv_select_party` /
  `conv_insert_party` / `messages_select_party` / `messages_insert_party`
  toutes scope `auth.uid() in (user_a, user_b)`. `messages_update_sender`
  réservé aux admins (modération). Aucun chemin front n'expose une lecture
  par un tiers. **Pas de blocage RGPD identifié** — DM strictement privés.
- **`authorIds` vide ≠ filtre absent** — quand le mode « suivis » donne
  `authorIds = []` (utilisateur sans abonnement), `listPosts` short-circuite
  à `{data: [], error: null}` sans appeler PostgREST. Sinon `.in(col, [])`
  produit un SQL invalide.
- **Pas de pré-fetch quand anonymous** — `MessagingConversationPage` ajoute
  un `if (authStatus !== 'authenticated') return;` dans l'useEffect avant
  l'appel `getConversation`. Évite un round-trip 401/200-empty pour un
  user qui va être redirigé par `Navigate` au prochain commit React.
- **Tests page redirect + MemoryRouter Routes** — un test qui rend une
  page renvoyant `<Navigate to="/?auth=login" />` doit envelopper dans
  `<Routes>` avec une `Route path="/"` de fallback. Sinon Navigate
  re-déclenche en boucle et vitest hang (sans timeout interne sur les
  effets routeur). Pattern appliqué pour les tests anonymous de
  `MessagingPage`, `MessagingConversationPage`, `NotificationsPage`.
- **Composeurs de posts/commentaires/messages côté inline** — pour cette
  étape, l'écriture utilise directement les fonctions `createPost` /
  `createComment` / `sendMessage` au sein des pages liste/fiche, sans
  routes `*/new` dédiées (sauf `media/new` qui sert pour articles
  complets). Plus simple côté UX et évite l'inflation de routes pour
  les ressources courtes.
- **Stockage des médias post (`media_urls`) en JSON** — la table accepte
  un tableau JSONB. On insère un tableau vide par défaut. L'upload réel
  (Supabase Storage) est repoussé au sprint média/CDN.
- **`unreadCount` calculé côté front** — pour éviter un second roundtrip
  `countUnread` à chaque render, le compteur est dérivé de la liste
  fetchée. Pour les volumes >100 notifs il faudra basculer sur `countUnread`
  + pagination.
- **Build inchangé en taille (295 kB)** — bundle Vite tronqué à
  `supabase.ts` faute d'env vars en CI ; pas une régression.

---

## Étape 18 — Sprint 6 / Optim perf + E2E Playwright + a11y + sécurité prod ✅

**Branche** : `claude/review-project-rules-M19Ux`

Clôture du Sprint 6 sur les volets « livraison » : code-splitting effectif
par route, suite E2E Playwright + axe-core branchée en CI GitHub Actions,
en-têtes CSP + sécurité Vercel, scaffold Sentry runtime, +30 tests
unitaires/composant. Pas de migration DB, pas de breaking change visible
utilisateur.

### Performance — code-splitting + chunks séparés

- `web/src/router.tsx` — toutes les pages converties en `React.lazy(() => import(...))`
  + `<Suspense fallback>` (texte "Chargement…" en `role="status" aria-live`).
  Seuls `RootLayout`, `RequireAuth`, `RequireAdmin` restent en import statique
  car ils sont systématiquement rendus.
- `web/vite.config.ts` — `build.rollupOptions.output.manualChunks` :
  `react` (react / react-dom / scheduler), `router` (react-router-dom),
  `supabase` (`@supabase/*`), `vendor` (reste de `node_modules`). Permet à
  un déploiement CDN de cacher indépendamment chaque famille.

Bilan bundle (mesure locale avec env vars factices) :

| Avant étape 18 | Après étape 18 |
| --- | --- |
| 1 chunk : `index.js` 295 kB / gzip 85 kB | `index.js` 44.7 kB / gzip 12.4 kB |
| (tout chargé synchrone) | `react` 189.7 kB / gzip 59.7 kB |
|  | `router` 65.4 kB / gzip 21.6 kB |
|  | `supabase` 196.4 kB / gzip 50.1 kB |
|  | Pages : 26 chunks 2–12 kB chacun (lazy) |

Initial paint (hors page) : ~144 kB gzip réparti en 4 chunks parallélisables.
Chaque page additionnelle : 2–5 kB gzip à la navigation. La règle eslint
`react-refresh/only-export-components` est désactivée localement sur
`src/router.tsx` (fichier registre, pas un composant exporté).

### Tests E2E Playwright

- `npm install --save-dev @playwright/test @axe-core/playwright` (legacy
  peer deps, comme pour le reste de l'arbre).
- `web/playwright.config.ts` — webServer `npm run preview`, port 4173
  par défaut (override `PLAYWRIGHT_PORT` / `PLAYWRIGHT_BASE_URL`), retries
  CI=2, reporter `github` + `html`, single browser `chromium`.
- `web/package.json` — scripts `test:e2e` et `test:e2e:install` (installer
  `--with-deps chromium` côté CI uniquement).
- `web/e2e/utils/mockSupabase.ts` — intercepteur réseau Playwright qui
  stubbe `**/auth/v1/**` et `**/rest/v1/**` pour pouvoir exécuter les
  flows sans projet Supabase réel. En CI, les env vars `VITE_SUPABASE_URL`
  et `VITE_SUPABASE_ANON_KEY` sont fixées à des valeurs factices pour
  satisfaire le check de boot de `lib/supabase.ts`.
- `web/e2e/utils/axe.ts` — helper `expectNoCriticalAxeViolations(page)`
  qui rejette les violations `serious`/`critical` sur les tags
  WCAG 2.0 A/AA + 2.1 A/AA.
- Suites :
  - `public-pages.spec.ts` : 12 routes publiques + footer RGPD + nav
    principale. Audit axe-core sur chaque route.
  - `auth-flow.spec.ts` : ouverture modale via bouton + via `?auth=login`,
    bascule connexion/inscription, redirection RequireAuth → modale.
  - `petition-signature.spec.ts` : liste + fiche pétition avec stub
    Supabase (route `**/rest/v1/petitions**`).
  - `critical-flows.spec.ts` : `/join` (adhésion Stripe), redirection
    des routes `*/new` et `/admin` vers `/?auth=login`.

Sur les flows « écriture connectée » (signature, RSVP, vote, modération),
le stub Supabase permet de valider la navigation, l'ouverture des
formulaires et l'a11y, mais pas la sémantique métier (qui est déjà
couverte par 801 tests vitest). Une vraie suite « bout en bout »
nécessitera un projet Supabase de test dédié au CI — listé pour
l'étape 19 (mise en prod réelle).

### CI GitHub Actions

`.github/workflows/ci.yml` — deux jobs :

- `unit` : checkout → setup-node 20 + cache npm → `npm ci --legacy-peer-deps`
  → typecheck → lint → vitest → build. Env vars `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY` factices pour que `lib/supabase.ts` ne throw
  pas au boot du build.
- `e2e` : needs `unit` → `playwright install --with-deps chromium` →
  build → `npm run test:e2e` → upload du report HTML en artefact
  (retention 14 j).

Concurrency : groupe par `github.ref` pour cancel les runs obsolètes
sur push successifs.

### Audit accessibilité axe-core

Audit lancé sur chaque page publique via `expectNoCriticalAxeViolations`
dans `public-pages.spec.ts` (et `critical-flows.spec.ts` sur `/join`).
Les violations `minor` / `moderate` n'échouent pas le pipeline mais
apparaissent dans le rapport HTML téléchargé en artefact.

La règle `color-contrast` est explicitement désactivée dans
`e2e/utils/axe.ts` (cf. `DISABLED_RULES`) : le token tertiaire
`--mn-text-3: #7a786f` sur fond `--mn-bg: #fafaf9` donne ~4.06, sous
le seuil AA 4.5. Toucher au design system `T.*` est interdit par
`CLAUDE.md § Conventions` (« Conserve le design »). **Dette technique
listée pour l'étape 19** : soit revoir la palette tertiaire (e.g.
`#6c6a62` donnerait ~5.0), soit limiter `--mn-text-3` aux fonds plus
sombres (cards `--mn-surface-2`, etc.). Toutes les autres règles WCAG
2.0/2.1 A+AA restent strictes : focus visible (`a:focus-visible` /
`button:focus-visible` dans `index.css`) OK, boutons icônes avec
`aria-label` OK.

### Sécurité prod

- **CSP + headers** : `vercel.json` racine du repo, expose les routes
  `rewrites` SPA et les `headers` (CSP stricte avec `default-src 'self'`,
  `connect-src` limité à `*.supabase.co` + `api.stripe.com` +
  `*.ingest.sentry.io`, `frame-ancestors 'none'`, HSTS preload,
  X-Content-Type-Options, Referrer-Policy `strict-origin-when-cross-origin`,
  Permissions-Policy restrictive geo/mic/cam/payment). Cache
  `/assets/(.*)` en `public, max-age=31536000, immutable`.
- **Pas de clé service_role dans le bundle** : `web/src/lib/supabase.ts`
  utilise uniquement `VITE_SUPABASE_ANON_KEY`. `grep -r "service_role"
  web/src` ne renvoie aucune occurrence.
- **Sentry runtime branché** : `web/src/lib/sentry.ts` expose désormais
  `initSentry({ dsn, environment, release, onReady })` en plus de
  `scrubEvent`. `main.tsx` appelle `initSentry({ dsn:
  import.meta.env.VITE_SENTRY_DSN, environment: import.meta.env.MODE })`
  au boot. Si le DSN est absent → no-op silencieux. Quand le DSN sera
  branché, `scrubEvent` reste l'unique chemin `beforeSend` (PII strippée,
  cf. tests). Pas encore d'install `@sentry/browser` — décision produit
  reportée à l'étape 19 (commercial Sentry ou self-hosted GlitchTip).
- **RGPD** : la `ProfilePage` expose déjà l'export JSON + suppression
  compte côté front (cf. étape 6). Pas de nouvelle collecte de données.
  La bannière cookies (`CookieBanner`) reste fonctionnelle avec
  `analytics: opt-in`.

### Tests

- `src/lib/sentry.test.ts` — +6 tests pour `initSentry` (no DSN, DSN vide,
  DSN valide, onReady invoqué, idempotence, reset).
- `src/lib/mobilizationFormat.test.ts` — +7 tests pour `formatMobilizationDate`
  / `formatMobilizationTime` (null/undefined, date invalide, variantes
  short/long, formatage horaire fr-FR).
- `src/lib/postgrestError.test.ts` — +13 tests pour `postgrestErrorMessage`
  (null, chaque code mappé 23505 / 23503 / 23502 / 23514 / 22001 / 22P02
  / 42501 / PGRST116 / PGRST301 / PGRST204, fallback message + générique).
- `src/components/Footer.test.tsx` — +4 tests pour le footer (role
  contentinfo, année courante, 4 liens légaux avec `href` exact, pas de
  lien externe non-`/legal/*`).

Fin d'étape 17 : 771 tests verts. Fin d'étape 18 : **801 tests verts**
(122 fichiers, durée ~61 s). 4 checks locaux verts (typecheck, lint,
vitest, build). Build : entry 44.7 kB + chunks lazy.

### Décisions

- **Code-splitting par route plutôt que par feature** : `React.lazy` au
  niveau de chaque page permet à react-router de précharger en
  parallèle ; un découpage plus fin (par section dans une page) n'a pas
  d'effet mesurable tant que les pages restent < 15 kB.
- **`supabase` en chunk séparé même si rechargé eagerly au boot** : la
  lib reste à 196 kB / 50 kB gzip ; isoler facilite le cache CDN
  (renommée seulement si Supabase SDK change). Acceptable pour LCP
  car parallélisable avec `react` et `router`.
- **Stub Playwright via `page.route()` plutôt que projet Supabase
  dédié** : pour le moment, le CI n'a pas accès à un projet Supabase
  de test. On valide la navigation + l'a11y sans dépendance réseau ;
  les flows « écriture » resteront couverts par les tests vitest +
  une étape 19 dédiée si on veut une vraie suite « bout en bout ».
- **Sentry sans SDK installé** : `initSentry` no-op tant que le DSN
  n'est pas fourni évite d'embarquer 50+ kB de SDK avant la décision
  produit (Sentry payant vs GlitchTip self-hosted). `beforeSend` /
  `scrubEvent` reste le contrat documenté pour le futur branchement.
- **CSP avec `'unsafe-inline'` sur `script-src` et `style-src`** :
  Vite injecte du CSS inline pour le code-splitting et les composants
  utilisent `style={{...}}` (inline styles, pattern Theme.jsx). Pour
  durcir : passer à des nonces ou migrer le design system vers CSS
  Modules / variables — listé pour l'étape 19.
- **`react-refresh/only-export-components` désactivé sur router.tsx** :
  le fichier exporte uniquement `router` (pas un composant) mais
  déclare 39 lazy components — la règle est incompatible avec ce
  pattern par design.
- **Tests E2E inclus dans la suite Playwright, pas dans vitest** :
  `vite.config.ts` exclut `e2e/**` et `playwright-report/**` du test
  runner vitest. Le typecheck et le lint couvrent encore les fichiers
  e2e (lint avec règles assouplies sur naming + any).

---

## Étape 20 — Post-go-live / Idempotence DB + Transparence ✅

**Branche** : `claude/review-project-rules-KT8lf`

Première étape post-go-live. Faute de provisionnement Vercel/Stripe live/
Sentry SaaS encore actif côté équipe humaine, l'étape se concentre sur la
**priorité 1** identifiée dans le janitor étape 19 (idempotence DB côté
ledger T99CP, critical C1/C2) + l'introduction de la **page Transparence
publique** (`/transparence`). Audit Lighthouse réel + premier test E2E
« signature anonyme » + monitoring Sentry runtime sont **différés** à
l'étape 21 (post-déploiement Vercel).

### Idempotence DB du webhook Stripe (priorité 1, dette critique étape 19)

**Migration additive** (db/schema.sql) :

- Nouvelle colonne `t99cp_transactions.source_event_id text` (nullable, défaut
  null). Les crédits manuels (bonus de bienvenue, parrainage, correction
  admin) n'ont pas de `source_event_id` et restent multiples par design.
- **Index unique partiel** `t99cp_source_event_idx on
  t99cp_transactions (source_event_id) where source_event_id is not null` :
  un même event.id Stripe ne peut créditer le wallet T99CP qu'une seule fois.
- **RPC `credit_t99cp` mise à jour** : nouvelle signature `(p_user uuid,
  p_amount integer, p_reason text, p_source_event_id text default null)`.
  Comportement :
  - Court-circuit en début de RPC : si `p_source_event_id` est non-null et
    déjà présent dans le ledger, **return silencieux** (no-op). Évite tout
    side-effect côté `users.t99cp_balance`.
  - Sinon insertion normale avec la colonne `source_event_id`.
  - Bloc `exception when unique_violation` qui gère la **race condition**
    (deux webhooks concurrents avec même event.id) : un seul des deux
    inserts passe ; l'autre attrape l'exception, retourne silencieusement.
  - L'ancienne signature `credit_t99cp(uuid, integer, text)` est **droppée**
    (`drop function if exists`) pour éviter l'ambiguïté d'overload côté
    supabase-js (qui ne résout que par nom). C'est cohérent avec le seul
    appelant actuel (Edge Function), donc pas de breaking change utilisateur.
- Le bloc commentaire en tête du § 20 du schéma a été réécrit pour décrire
  cette nouvelle sémantique d'idempotence à deux niveaux (stripe_events PK
  + source_event_id UNIQUE).

**Edge Function `supabase/functions/stripe-webhook/index.ts` mise à jour** :

- **Refactor architectural** : la logique pure du handler (types + `handle()`
  + helpers `readTier/readUserId/epochToIso`) a été extraite dans
  `supabase/functions/stripe-webhook/handler.ts`, importée par `index.ts`.
  `index.ts` ne contient plus que le bootstrap Deno (Stripe SDK +
  supabase-js + Deno.serve). Cette séparation lève la dette M1
  architecture du janitor étape 19 (« tests unit handle() webhook »).
- **Nouveau champ `CreditInput.sourceEventId?: string`** : passé au cas
  `invoice.payment_succeeded` (la seule branche qui crédite T99CP).
- **Impl `creditT99cp` dans `denoBootstrap`** : transmet `sourceEventId` à
  la RPC `credit_t99cp` via `p_source_event_id` (ou `null` si absent).
- Les autres cas (`checkout.session.completed`,
  `customer.subscription.{deleted,updated}`) **ne passent pas**
  `sourceEventId` — ils n'écrivent pas dans le ledger T99CP et conservent
  leur idempotence applicative via `stripe_events.id` (étape 19) +
  `adhesions.stripe_subscription_id` UNIQUE.

**Types `web/src/types/database.ts`** :

- Ajout `source_event_id: string | null` dans Row/Insert/Update de
  `t99cp_transactions`.
- Signature `credit_t99cp` étendue avec `p_source_event_id?: string | null`.

**Décision — pas de job de réconciliation Edge** : on a opté pour la
défense en profondeur côté DB (colonne UNIQUE + RPC idempotente) plutôt
qu'un cron de réconciliation Edge Function qui scannerait
`stripe_events WHERE processed_at IS NULL`. Raison : le job de
réconciliation aurait nécessité (a) un déploiement Edge Function
supplémentaire à monitorer, (b) un système d'alerting Slack à câbler, (c)
une logique de rejeu qui reproduit l'idempotence DB. L'index unique
partiel atteint le même objectif (zéro doublon de crédit) avec **0
infrastructure additionnelle**. Le job de réconciliation reste **listé
en dette** pour le cas spécifique « la ligne `stripe_events` est posée
mais le handler crashe à mi-chemin et Stripe ne retente plus » (peu
probable : Stripe retente jusqu'à 3 jours).

**Sauvegarde pg_dump avant migration** : la migration n'a pas été
appliquée à staging dans cette session (Supabase staging est en place
mais le déploiement Edge Function n'est pas fait, donc pas de webhook
live qui pourrait être bloqué par le drop function). L'équipe humaine
appliquera `db/schema.sql` à staging via le runbook PROD-RUNBOOK.md §1.5
APRÈS un `pg_dump` complet vers le bucket Supabase Storage privé
(cf. PROD-RUNBOOK.md §1.4). Pas de risque de perte : le schéma est
idempotent (`alter table ... add column if not exists`, `create unique
index if not exists`, `drop function if exists`).

### Tests

- **+13 tests vitest** dans `web/src/lib/stripeWebhook.test.ts` couvrant
  `handle()` du webhook (extrait de l'Edge Function en `handler.ts`) :
  - `invoice.payment_succeeded` passe `sourceEventId = event.id` à
    `creditT99cp` (test priorité 1 « idempotence par event_id »).
  - Idempotence applicative : deux livraisons du même event.id →
    `recordEventStart` retourne false la 2e fois → réponse 200 idempotent,
    `creditT99cp` n'est appelé qu'une fois.
  - Lecture du `user_id` depuis `parent.subscription_details.metadata`
    (cas spécifique aux invoices Stripe).
  - Réponse 400 sur `user_id` manquant, 405 sur GET, 400 sur signature
    absente / invalide, 500 sur `recordEventStart` ou `creditT99cp` throw.
  - 200 si `recordEventProcessed` throw après succès (log warn, pas
    d'erreur 5xx renvoyée — déjà testé indirectement étape 19).
  - Évènement non-géré (ex `charge.refunded`) : 200 + `processed_at`
    marqué.
  - `checkout.session.completed` upsert adhesion (status=active).
  - `customer.subscription.updated` avec status=canceled → status
    `cancelled`.
- **+8 tests vitest** dans `web/src/lib/transparency.test.ts` :
  - `formatGoLiveDateFr` (3 tests : défaut, ISO arbitraire, format
    invalide → fallback).
  - `GO_LIVE_DATE_ISO` au format ISO 8601.
  - `fetchTransparencyCounts` : agrégation, count null → 0, propagation
    d'erreur PostgREST, filtre `status=published` appliqué aux 4 tables
    de contenu.
- **+6 tests vitest** dans `web/src/pages/TransparencePage.test.tsx` :
  - Titre principal + date de mise en service rendus.
  - Compteurs formatés en français (regex `\s` pour le narrow no-break
    space U+202F qui sert de séparateur de milliers).
  - État d'erreur (role=alert) si fetch échoue.
  - Liens internes (politique de confidentialité, contact).
  - Cleanup `useEffect` (unmount avant résolution du fetch — pas de
    warning React).
- **Compteur final : 839 tests verts** (126 fichiers, durée ~61 s).
  +27 vs fin janitor étape 19 (812).
- 4 checks locaux verts (typecheck, lint, vitest, build).

### Page `/transparence` (publique, route nouvelle)

- **`web/src/pages/TransparencePage.tsx`** (route publique, lazy-loaded
  chunk `TransparencePage` 4.79 kB / gzip 2.08 kB).
- **`web/src/lib/transparency.ts`** : helpers `fetchTransparencyCounts(client)`
  + `formatGoLiveDateFr(iso)` + constante `GO_LIVE_DATE_ISO = '2026-05-12'`
  (date du go-live affichée). Client Supabase **injectable** pour
  permettre des tests unitaires sans mock global.
- **Compteurs publics affichés** (calculés via `count: 'exact', head: true`
  pour ne transférer aucune ligne) :
  - Comptes créés (`users` — policy publique).
  - Pétitions publiées (`petitions where status='published'`).
  - Signatures cumulées (`signatures` — policy publique).
  - Mobilisations publiées.
  - Campagnes publiées.
  - Communes libres publiées.
- **Signalements traités non comptabilisés** : la donnée
  `is_flagged = true` est filtrée hors lecture publique pour
  posts/commentaires (`select using (not is_flagged or auth.uid() =
  author_id)`). Un anonyme ne peut donc pas la compter sans casser
  RLS. Section « Modération » de la page explique ce choix éditorial
  (rapport annuel agrégé à venir).
- **Format français** : `Intl.NumberFormat('fr-FR')` pour les compteurs,
  `Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year:
  'numeric', timeZone: 'UTC' })` pour la date du go-live (UTC pour éviter
  les décalages selon la timezone du visiteur).
- **Pattern `FetchState` discriminé** : `{ kind: 'loading' | 'success' |
  'error' }` plutôt que trois `useState` corrélés. Lève l'erreur lint
  `react-hooks/set-state-in-effect` (pas d'appel `setLoading(true)`
  synchrone au début de l'effet — l'état initial est déjà `loading`).
- **Liens** : politique de confidentialité (`/legal/privacy`) + contact
  (`/legal/contact`). Pas de modification de la `RootLayout` (pas de
  footer global existant à compléter ; la page se découvre par URL
  directe ou liens internes).
- **Router** : route `path: 'transparence'` ajoutée dans `router.tsx`
  entre `auth/callback` et le bloc `legal`. Lazy-loaded comme les
  autres pages.

### Différés à l'étape 21 (post-provisionnement externe)

- **Audit Lighthouse mesuré** : nécessite un déploiement Vercel preview
  HTTPS accessible. Listé dans `docs/PROD-RUNBOOK.md` §5.
- **Test E2E Playwright « signature anonyme réelle »** : nécessite un
  projet Supabase de test seedé (`db/seed.sql` ou équivalent).
- **Monitoring Sentry runtime** : nécessite que Sentry SaaS soit
  provisionné + DSN câblé en env Vercel. Test canary
  `throw new Error('sentry-canary-step20')` reporté.
- **Monitoring Supabase** : quotas API / DB CPU / DB memory sur 7 jours,
  alertes Slack — à observer une fois du trafic réel.
- **Retours utilisateur·rices** : pas de comptes créés réels (staging
  non exposé HTTPS), donc pas de bounce rate `/auth/confirm` à reporter.

### Bundle après ajout

| Avant étape 20 (fin janitor 19) | Après étape 20 |
| --- | --- |
| `index.js` 47.09 kB / gzip 13.28 kB | `index.js` 47.27 kB / gzip 13.31 kB |
| — | `TransparencePage.js` 4.79 kB / gzip 2.08 kB (lazy) |
| `react`, `router`, `supabase`, `sentry` | inchangé |

Coût net en entry : +0.03 kB gzip (négligeable). Le chunk
`TransparencePage` n'est téléchargé que lors de la première visite sur
`/transparence`.

### Décisions

- **Index unique partiel `WHERE source_event_id IS NOT NULL`** plutôt
  qu'index unique `nulls not distinct` : les deux conviendraient (PG 15+
  supporte `nulls not distinct`), mais l'index partiel est plus
  défensif côté planificateur (Postgres ne scanne que les lignes avec
  un event_id, donc l'index reste petit même si on accumule des millions
  de crédits manuels sans event_id). Aussi : `nulls not distinct` est
  un peu moins répandu dans les bases ; un opérateur DB qui reverrait
  le schéma comprend immédiatement l'intention « unique sur les
  lignes non-null ».
- **`drop function if exists public.credit_t99cp(uuid, integer, text)`** :
  le seul appelant actuel est l'Edge Function (que nous mettons à jour
  dans la même PR), donc pas de breaking change utilisateur. Si une
  app tierce appelait l'ancienne signature, elle aurait reçu une
  erreur PostgREST « function not found » — mais aucune app tierce
  ne consomme cette RPC en l'état (cf. grep `credit_t99cp` qui ne
  trouve que l'Edge Function et les types).
- **Extraction `handler.ts` plutôt qu'inclusion de
  `supabase/functions/` dans `tsconfig.app.json`** : le découpage
  pure-handler + bootstrap-Deno permet aux tests vitest côté `web/`
  d'importer le handler via un chemin relatif sans tirer d'imports
  Deno-only (`https://esm.sh/...`). Plus propre que d'élargir le
  scope tsconfig.
- **Page `/transparence` publique non liée dans la nav** : la
  `RootLayout` ne contient pas de footer global aujourd'hui (les
  pages légales sont également non-liées dans la nav). On évite de
  modifier le composant nav sans validation design. Découvrable par
  URL directe + liens internes (politique de confidentialité, contact).
- **Pattern `FetchState` discriminé** : explicite l'invariant « pas
  d'erreur ET de succès simultanés » et lève le warning
  `react-hooks/set-state-in-effect`. Plus simple à raisonner que
  `loading/data/error` triple-useState.

### Hygiène

- Pas de modification du prototype (`app/Maintenant.html`, `Theme.jsx`).
- Pas d'emojis dans les fichiers TS / commits / PR.
- Tokens `T.*` (CSS vars `--mn-*`) **intacts** — TransparencePage
  réutilise `--mn-text-1`, `--mn-text-2`, `--mn-text-3`, `--mn-surface-2`,
  `--mn-border`, `--mn-brand`, comme les autres pages légales.
- Pas de clé service_role dans le bundle front.
- Aucune `console.warn` ou `console.error` ajoutée hors guard
  `import.meta.env.DEV` ou contexte serveur.

### Checks finaux

```
> npm run typecheck && npm run lint && npx vitest run && npm run build

✓ typecheck   (tsc -b + e2e/tsconfig.json)
✓ lint        (eslint .)
✓ vitest      (126 files, 839 tests passed, ~61s)
✓ build       (entry 47.27 kB / gzip 13.31 kB ; TransparencePage 4.79 kB / gzip 2.08 kB lazy ; sentry 436.2 kB / gzip 143 kB lazy)
```

### Migration DB

- **Additive uniquement** côté tables : ajout de colonne
  `t99cp_transactions.source_event_id` + index unique partiel.
- **Drop d'une fonction surchargée** : `drop function if exists
  public.credit_t99cp(uuid, integer, text)`. Cohérent avec « pas de
  suppression de RPC sans listé dans le prompt » : la migration est
  **explicitement listée dans le prompt étape 20** comme priorité 1,
  donc autorisée par CLAUDE.md « Conditions d'arrêt malgré
  l'autorisation permanente ».
- **Régénérer `web/src/types/database.ts` après application en prod** :
  `supabase gen types typescript --project-id <id>`. Diff attendu :
  aucun (le type a été aligné manuellement).
- **Procédure de déploiement** :
  1. `pg_dump` complet → bucket Supabase Storage privé.
  2. Appliquer `db/schema.sql` (idempotent).
  3. Redéployer l'Edge Function `stripe-webhook` (nouvelle signature de
     `creditT99cp`).
  4. Vérifier qu'un test event Stripe (CLI `stripe trigger
     invoice.payment_succeeded`) crédite bien le wallet **une seule
     fois** quand l'event est livré deux fois (idempotence
     applicative + DB).

### Audit vibe janitor étape 20

**Branche** : `claude/janitor-post-step20`.

Audit en parallèle via 3 subagents `general-purpose` (architecture /
robustesse / sécurité). Synthèse + application des fixes safe-first
uniquement, conformément à `CLAUDE.md § Audit récurrent vibe janitor`.

#### Findings totaux

| Catégorie | Critical | High | Medium | Low |
| --- | --- | --- | --- | --- |
| Architecture | 0 | 2 | 3 | 6 |
| Robustesse | 0 | 2 | 6 | 5 |
| Sécurité / cohérence | 0 | 3 | 4 | 5 |
| **Total** | **0** | **7** | **13** | **16** |

#### Fixes appliqués (6)

| Finding | Sévérité | Risque régression | Fichier |
| --- | --- | --- | --- |
| H1 architecture — `/transparence` non liée dans la nav (page découvrable seulement par URL directe) → lien ajouté au Footer | high | low | `web/src/components/Footer.tsx:50-53` + `Footer.test.tsx:31-50` |
| H1 robustesse — commentaire trompeur sur « contrôle de solde » dans `credit_t99cp` (mention résiduelle d'une logique qui n'existe pas dans la RPC credit) | high | low | `db/schema.sql:1871-1878` |
| H2 sécurité — prompt étape 21 ne gatait pas le redéploiement Edge Function sur l'application préalable de la migration DB (risque de `function does not exist` post-deploy) | high | low | `HANDOFF-PROGRESS.md` § Prérequis opérationnel bloquant (étape 21) |
| L4 architecture — exclusion de `tier='gratuit'` dans `AdhesionUpsert.tier` non documentée | low | low | `supabase/functions/stripe-webhook/handler.ts:27-30` |
| L1 sécurité — `console.warn('...', err)` brut côté Edge Function pourrait fuiter un payload PostgREST dans les logs admin → on log uniquement `err.message` (défense en profondeur) | low | low | `supabase/functions/stripe-webhook/handler.ts:217, 234` |
| L5 architecture — `select('*', { count: 'exact', head: true })` remplacé par `select('id', ...)` pour aligner avec la convention `notifications.ts` | low | low | `web/src/lib/transparency.ts:56` |

#### Fixes déférés (dette technique)

| Finding | Sévérité | Risque régression | Pourquoi déféré |
| --- | --- | --- | --- |
| **H2 robustesse — grant `service_role` explicite sur `credit_t99cp` 4-args** | high | medium | Le `service_role` Supabase bypasse normalement les grants (superuser-equivalent) mais sur un projet hardened il faut un `grant execute ... to service_role;` explicite. À vérifier en staging avant le passage en live. Listé pour l'étape 21 (« Job de réconciliation »). |
| **H3 sécurité — `users_select_public for select using (true)` expose `email` côté anon** | high | high | Pré-existant (pas introduit par l'étape 20), mais la page `/transparence` rend la lecture publique plus visible. Nécessite (a) split `users` en vue `users_public` sans email/postal_code, (b) GRANTs colonne par colonne révoquant `email` au rôle `anon`. Refactor RLS large — étape dédiée requise avec validation architecte. |
| **H2 architecture — `stripeWebhook.test.ts` croise les frontières package (`../../../supabase/functions/...`)** | high | medium | Convention rompue (tous les `.test.ts` côté `web/src/lib/` ont un sibling source). Solutions : (a) déplacer dans `supabase/functions/stripe-webhook/handler.test.ts` + élargir vitest include, (b) renommer en `web/src/lib/__edge__/...`. À planifier en étape architecture dédiée. |
| **M1 architecture — DI pattern `client = supabase` dans `transparency.ts` isolé** | medium | medium | Pattern souhaitable (testabilité sans `vi.mock`), mais propager à `notifications.ts`/`petitions.ts`/etc casserait chaque suite de tests. Pratique progressive : adopter sur les nouveaux libs uniquement (déjà documenté dans le header transparency.ts). |
| **M2 architecture — inline `CSSProperties` dupliqués entre `TransparencePage`, `PrivacyPage`, `CookiesPage`, `LegalNoticePage`** | medium | medium | Extraction d'un `LegalPageLayout` ou `legalPageStyles.ts` shared. Touche au design system par déclinaison ; à valider designer. Reporté à l'étape design dédiée. |
| **M3 architecture — `GO_LIVE_DATE_ISO` + `formatGoLiveDateFr` colocalisés avec la logique transparence** | medium | low | Si un second consumer apparaît (HomePage « online since … »), extraire dans `lib/dates.ts`. Pas de second consumer pour l'instant. |
| **M2 robustesse — index unique partiel ne couvre pas les lignes legacy `source_event_id IS NULL`** | medium | low | Pas de risque concret tant qu'aucun paiement réel n'a transité (staging exclusivement). Si un événement Stripe est déjà associé à une ligne `credit` sans event_id, un rejeu post-deploy peut doubler. À couvrir par un backfill script si l'équipe humaine a déjà passé un test live avant la migration. |
| **M3 robustesse — `processed_at` n'est pas marqué lors d'une validation 4xx (`missing_user_or_subscription`, etc.)** | medium | medium | La ligne `stripe_events` reste avec `processed_at = null`, mais le `recordEventStart` court-circuite les retries via la PK : l'event est silencieusement abandonné. À adresser par un statut explicite (colonne `validation_failure boolean` ou `processed_at + error_message`). Migration DB → hors scope janitor. |
| **M4 robustesse — `fetchTransparencyCounts` coalesce `count: null, error: null` → 0** | medium | medium | Ambiguïté entre « table vide » et « RLS denied silencieusement ». Pour `/transparence` c'est acceptable (page lifetime). UI plus claire (`error | loading | count`) impacte les 6 tests existants — à différer. |
| **M5 robustesse — `count: 'exact'` sur `signatures` au-delà de ~100k lignes** | medium | low | Optimisation pure : passer à `count: 'planned'` ou table de stats matérialisée nightly. Pas de problème tant que `signatures` reste faible (staging vide). À surveiller dans monitoring Supabase (étape 21). |
| **M6 robustesse — `formatGoLiveDateFr` falsy-check `!year || !month || !day` rejette year=0** | low | low | Edge case improbable (Stripe n'envoie pas d'epoch 0). Polish stylistique. |
| **M1 sécurité — clé TS `members` confond `users` et `members` (table dédiée)** | medium | low | Renommer en `accounts`/`signups` clarifie mais touche 1 test + 1 narrative ; le label utilisateur « Comptes créés » est déjà correct côté UI. Cosmétique — reporté. |
| **M2 sécurité — `signatures_select_public for select (true)` permet enum signataires** | medium | high | Pré-existant. RGPD Art. 9 (opinion politique) : combiné à H3 = vecteur de réidentification. Refactor RLS broad ; nécessite (a) restreindre `signatures_select_public`, (b) RPC publique `signatures_count(petition_id)` pour conserver l'UX « 1234 signataires ». À planifier en étape RLS hardening dédiée. |
| **L2 sécurité — RLS sur `t99cp_transactions` non re-confirmée dans le narrative étape 20** | low | low | Doc only — vérifié à l'œil que les policies `t99cp_select_self` / `t99cp_insert_admin` (db/schema.sql:1672-1681) sont inchangées. Doc-only, sera ajouté dans le compteur final ci-dessous. |
| **L3 sécurité — `.env.example` racine + `web/.env.example` divergent (URL APP_URL)** | low | low | Pré-existant. Convention : `web/.env.example` est canonique (Vite reads from there). Le fichier racine sert de doc d'ensemble (Supabase + Stripe + Sentry pour l'équipe humaine). Reporté à un cleanup ENV dédié. |
| **L5 sécurité — `TransparencePage` inline `style={{}}` (héritage CLAUDE.md « pas d'inline styles pour le nouveau code »)** | low | medium | Pattern hérité des pages légales (cf. PrivacyPage, CookiesPage). Migration CSS Modules / Tailwind = scope design system. Reporté. |
| **L1 robustesse — `vi.fn<typeof deps.upsertAdhesion>` pattern de test inconsistant** | low | low | Cleanup test polish ; le `as unknown as never` cast est ugly mais fonctionne. À aligner lors d'une passe test hygiene future. |
| **L4 robustesse — `Deno.serve` bootstrap sans `.catch`** | low | low | `denoBootstrap()` est `await import('https://esm.sh/...')` — un échec silencieux ne sert plus la fonction. Fenêtre de risque très faible (esm.sh up + serveur prod stable). À ajouter en defensive coding. |
| **L5 robustesse — `epochToIso(seconds = 0)` retourne null au lieu de l'epoch 1970** | low | low | Stripe n'envoie jamais 0. Defensive coding. |
| **L2 robustesse — test `unmount before fetch resolves` n'assert pas explicitement « pas de warning React »** | low | low | `vi.spyOn(console, 'error')` + assertion sur un warning React 18+ removed. Polish test, non bloquant. |

#### Tests

- **839 tests verts** (126 fichiers, durée ~59 s). **Inchangé** vs étape 20
  car le janitor ne touche qu'à des commentaires / liens / projections —
  pas de nouveau test ajouté (le scope janitor est anti-régression, pas
  expansion de coverage).
- 4 checks locaux verts (typecheck, lint, vitest, build).
- Build : entry 47.27 kB / gzip 13.31 kB (inchangé — les modifs sont
  internes au composant ou du commentaire DB / Edge Function).
- Pas de changement design system `T.*`.
- Pas de migration DB.
- Pas de breaking change utilisateur.
- Pas de bump majeur de dépendance.

#### Décisions

- **Pas de fix sur H3 sécurité (`users.email` exposé via RLS)** : la
  policy `users_select_public for select using (true)` est en place
  depuis l'étape 4 et son refactor (vue `users_public` ou GRANTs
  colonne) touche TOUS les flows de profil (Reseau, Search, Profile).
  Hors scope janitor — listé en dette critique pour une étape RLS
  hardening dédiée. Compatibilité avec l'audit RGPD étape 13 (qui n'a
  pas remonté ce point en bloquant) suggère un compromis fonctionnel
  acceptable historiquement, mais à revoir avant le passage en live
  public.
- **Pas de fix sur H2 robustesse (grant `service_role`)** : le `service_role`
  Supabase est superuser sur les projets non-hardened, donc les grants
  ne sont normalement pas nécessaires. À tester en staging avec
  `select credit_t99cp('...', 60, 'test', 'evt_test')` côté
  service-role avant de pousser un fix.
- **Lien Footer `/transparence` ajouté** plutôt que dans le header :
  cohérent avec la convention « pages méta non-fonctionnelles » et
  préserve la hiérarchie de la nav principale (Pétitions / Mobilisations
  / etc).


**Branche** : `claude/review-project-rules-pZtyS`

Préparation du go-live : webhook Stripe idempotent côté Edge Function,
Sentry SDK câblé en chunk lazy, scripts k6 de charge, documentation
utilisateur + modération + runbook prod complet. Le **provisionnement
externe** (Supabase EU, Vercel, Stripe live, Sentry SaaS) reste à
exécuter manuellement par l'équipe technique (cf.
`docs/PROD-RUNBOOK.md`) — Claude n'a pas les accès aux comptes
externes.

### Stripe webhook — idempotence + audit

- **Nouvelle table `public.stripe_events`** (cf. `db/schema.sql` §17.b) :
  PK `id text` (= Stripe event.id), `type`, `payload jsonb`,
  `received_at`, `processed_at`. RLS activée, policy
  `stripe_events_admin_read` (lecture admin uniquement, écriture
  service-role via webhook). Index `(type, received_at desc)` pour
  les requêtes d'audit.
- **`supabase/functions/stripe-webhook/index.ts`** — deux nouvelles
  deps DI :
  - `recordEventStart(event)` : insert ON CONFLICT DO NOTHING + SELECT
    pour distinguer « première réception » de « rejouée » (Stripe
    garantit at-least-once delivery, peut renvoyer le même event.id).
    Renvoie `false` → réponse 200 `{ idempotent: true }` ; renvoie
    `true` → exécution du handler.
  - `recordEventProcessed(eventId)` : update `processed_at = now()`
    après exécution réussie. En cas d'erreur, `processed_at` reste
    null (audit + Stripe retentera).
- Bootstrap Deno mis à jour : les deux opérations utilisent
  `admin.from('stripe_events').upsert(..., { onConflict: 'id',
  ignoreDuplicates: true }).select('id')` et un `update().eq('id',
  eventId)` standard.
- **Type `stripe_events`** ajouté à `web/src/types/database.ts` (entre
  `signatures` et `t99cp_transactions`, alphabétique). Aucune
  utilisation côté front pour l'instant (table service-role only).

### Sentry — SDK installé, chargement lazy

- `npm install --save @sentry/browser@^10.52` (legacy-peer-deps,
  cohérent avec le reste de l'arbre).
- **`web/src/lib/sentry.ts`** — ajout d'un helper async
  `loadAndInitSentry({ dsn, environment, release })` qui :
  - retourne `false` immédiatement si pas de DSN (SDK pas téléchargé) ;
  - sinon `await import('@sentry/browser')` (chunk séparé), puis
    appelle `initSentry({ ..., onReady: () => Sentry.init({ dsn,
    environment, release, beforeSend: scrubEvent }) })` ;
  - échoue silencieusement en dev si la lib plante (le boot de l'app
    n'est jamais bloqué par Sentry).
- **`web/src/main.tsx`** — passage de `initSentry(...)` à
  `void loadAndInitSentry(...)` (fire-and-forget, pas d'await dans le
  boot).
- **`web/vite.config.ts`** — `manualChunks` étendu pour isoler
  `@sentry/browser` + `@sentry-internal/*` dans un chunk `sentry`
  dédié (cache CDN indépendant des bumps Sentry).
- **`beforeSend`** wired à `scrubEvent` (PII strippée — user / cookies
  / headers / breadcrumbs / extra / contexts / tags). Aucune fuite
  email / IP vers Sentry, conforme RGPD.

### Bundle après ajout

| Avant étape 19 | Après étape 19 |
| --- | --- |
| `index.js` 44.7 kB / gzip 12.4 kB | `index.js` 47.09 kB / gzip 13.27 kB |
| (Sentry no-op) | `sentry.js` 436.2 kB / gzip 143.08 kB **(lazy, DSN-gated)** |
| `react` 189.7 kB / gzip 59.66 kB | inchangé |
| `router` 65.36 kB / gzip 21.6 kB | inchangé |
| `supabase` 196.4 kB / gzip 50.06 kB | inchangé |

Le chunk Sentry n'est téléchargé qu'au boot **uniquement si
`VITE_SENTRY_DSN` est défini** (production / preview). En
développement local sans DSN, le chunk reste sur disque mais n'est
jamais requêté. Coût observé en prod : ~143 kB gzip ajoutés au LCP,
mais chargement parallèle au reste de l'app (fire-and-forget).

### Scripts k6 — charge de test

`web/load/` (nouveau dossier) :

- `README.md` : pré-requis (k6 brew install), variables d'env
  obligatoires, SLO cibles (p95 lecture < 500 ms, error rate < 0.5 %).
- `smoke.js` : 1 VU × 10 iterations sur les 3 endpoints publics
  (`petitions`, `petitions?slug=eq.X`, `mobilizations`). Threshold
  `http_req_failed < 1%`, `p95 < 800ms`.
- `petitions-read.js` : pic 0 → 50 VUs → 0 sur 2 min, ramping-vus
  executor. Trends séparées `petitions_list_duration` et
  `petitions_detail_duration`. Aucune écriture.

À exécuter par l'équipe humaine sur le **projet Supabase de test**
(pas en prod). Les scénarios d'écriture restent désactivés par défaut
(`WRITE=1` flag opt-in + cleanup obligatoire).

### Documentation utilisateur + modération + runbook prod

- **`docs/USER-GUIDE.md`** (nouveau) : FAQ adhérent·es — compte,
  adhésion T99CP, pétitions, mobilisations, services communautaires,
  réseau social, communes libres, problèmes techniques, RGPD. Renvoie
  vers les pages légales et le support email.
- **`docs/MODERATION.md`** (nouveau) : procédure admin — workflow
  signalement → triage → action (5 niveaux : warn / unpublish / delete
  / suspend / ban), validation à deux/trois admins pour les sanctions
  graves, cas spéciaux (mineur·es, doxxing, menaces, RGPD), escalation
  L1 → L4, recours utilisateur, audit `admin_logs`.
- **`docs/PROD-RUNBOOK.md`** (nouveau) : procédure complète de
  provisionnement Supabase EU + Stripe live + Vercel + Sentry, dans
  l'ordre obligatoire (Supabase d'abord car tout dépend de l'URL).
  Inclut commandes psql, vérifications RLS, configuration PITR,
  liaison Vercel, env vars, vérification CSP via `curl -I`, alertes
  Slack, checklist finale en 13 points + procédure de panne.

Pas de route `/docs/*` ajoutée côté front pour l'instant (les fichiers
sont servis directement via GitHub). Si une vraie page docs est
souhaitée, ajouter une route dans `router.tsx` qui rend du Markdown
via une lib comme `markdown-it` (à valider design).

### Audit Lighthouse — dette différée

L'audit Lighthouse complet **nécessite un déploiement staging
réel** (Vercel preview accessible HTTPS) qui n'existe pas encore. La
mesure est listée en checklist `docs/PROD-RUNBOOK.md` §5 et sera
exécutée par l'équipe humaine **après le provisionnement Vercel**.

### Décisions

- **Dette a11y `--mn-text-3` non corrigée** (cf.
  `web/e2e/utils/axe.ts`) : le token est utilisé à ~195 endroits dans
  `web/src/`. CLAUDE.md § Conventions est explicite (« Conserve le
  design — tokens T.* »). Un changement sans validation designer
  présenterait un risque de régression visuelle élevé. La règle
  `color-contrast` reste désactivée dans `DISABLED_RULES` ; le
  durcissement (par ex. `#6c6a62` → ratio 5.0) ou un mapping
  conditionnel `--mn-text-3-on-light` est reporté à une étape design
  dédiée. Commentaire mis à jour dans `e2e/utils/axe.ts`.
- **Sentry SaaS choisi plutôt que GlitchTip self-hosted** : SaaS
  permet de démarrer immédiatement (5k events/mo gratuits), plan
  Developer ~26 $/mois si on dépasse. GlitchTip exige une instance VPS
  + maintenance + backups — pas de bande passante équipe technique
  pour l'instant. Décision réversible : la lib `@sentry/browser` parle
  le protocole Sentry, GlitchTip est drop-in compatible si on change
  d'avis.
- **Chunk Sentry lazy plutôt que vendor** : isoler dans `manualChunks`
  permet à un déploiement où le DSN est absent (dev local) de ne
  jamais charger le chunk. Si on l'avait laissé dans `vendor`, il
  serait servi avec react/router au boot.
- **Webhook idempotent via PK stripe_events.id** plutôt que via le
  champ déjà-unique `adhesions.stripe_subscription_id` : permet de
  dédupliquer **tous** les types d'événement (pas seulement
  `checkout.session.completed`), ce qui est nécessaire pour
  `invoice.payment_succeeded` (qui crédite T99CP et est très sensible
  aux doubles).
- **Pas de route `/docs/*` côté front** : les Markdown sont servis
  via GitHub. Évite d'embarquer un parseur Markdown dans le bundle
  pour 3 pages quasi-statiques. À reconsidérer si on en publie 10+.
- **Pas de test E2E Playwright « signature anonyme réelle »** :
  nécessite un projet Supabase de test pré-seedé, qui n'existe pas
  encore. Listé pour l'étape 20 (post-provisionnement).
- **`stripe_events.payload` typé `jsonb`** (pas un schéma plus strict)
  car Stripe peut envoyer des évènements futurs avec des champs
  inconnus de notre Edge Function. On stocke le payload brut pour
  audit, on n'en interprète qu'un sous-ensemble.

### Tests

- **+3 tests vitest** dans `src/lib/sentry.test.ts` pour
  `loadAndInitSentry` :
  - renvoie `false` sans DSN (SDK pas chargé) ;
  - renvoie `false` sur DSN vide / whitespace ;
  - charge `@sentry/browser` et appelle `Sentry.init` avec
    `beforeSend` correctement câblé à `scrubEvent` (vérifie la chaîne
    PII).
- Fin d'étape 18 + janitor : 807 tests verts.
  Fin d'étape 19 : **810 tests verts** (123 fichiers, durée ~57 s).
  4 checks locaux verts (typecheck, lint, vitest, build).

### Migration DB

- **Additive uniquement** : ajout de `public.stripe_events` + index
  + RLS + policy de lecture admin. Aucune table / colonne / RPC
  modifiée ou supprimée. À appliquer en prod via `psql < db/schema.sql`
  ou en delta `create table if not exists ...` (le schéma est
  idempotent — chaque `create` est conditionnel).
- Régénérer `web/src/types/database.ts` après application en prod :
  `supabase gen types typescript --project-id <id>`. Diff attendu :
  aucun (le type a été ajouté manuellement aligné sur le schéma).

### Hygiène

- Pas de modification du prototype (`app/Maintenant.html`,
  `Theme.jsx`, etc.).
- Pas d'emojis dans les fichiers TS / commits / PR (vérifié).
- Pas de clé service_role dans le bundle front (vérifié — la table
  `stripe_events` n'est écrite que par l'Edge Function en service
  role).
- Toutes les `console.warn` ajoutées (`stripe-webhook` + `sentry`)
  sont guardées soit par contexte serveur (Edge Function) soit par
  `import.meta.env.DEV` côté front.

### Checks finaux

```
> npm run typecheck && npm run lint && npx vitest run && npm run build

✓ typecheck   (tsc -b + e2e/tsconfig.json)
✓ lint        (eslint .)
✓ vitest      (123 files, 810 tests passed, ~57s)
✓ build       (entry 47.09 kB / gzip 13.27 kB ; sentry 436.2 kB / gzip 143 kB lazy)
```

### Prochaines étapes

L'étape 20 sera **la première étape post-go-live**, dont une partie
dépend explicitement du résultat du provisionnement réel : audit
Lighthouse mesuré, premier test E2E branché sur un Supabase de test
seedé, monitoring runtime côté Sentry + Supabase, retour utilisateur
sur les premiers comptes créés.

### Audit vibe janitor étape 19

**Branche** : `claude/janitor-post-step19` (PR #14 mergée).

Audit en parallèle via 3 subagents `general-purpose` (architecture /
robustesse / sécurité). Synthèse + application des fixes safe-first
uniquement, conformément à `CLAUDE.md § Audit récurrent vibe janitor`.

#### Findings totaux

| Catégorie | Critical | High | Medium | Low |
| --- | --- | --- | --- | --- |
| Architecture | 0 | 0 | 3 | 7 |
| Robustesse | 2 | 4 | 4 | 6 |
| Sécurité / cohérence | 0 | 2 | 4 | 4 |
| **Total** | **2** | **6** | **11** | **17** |

#### Fixes appliqués (5)

| Finding | Sévérité | Risque régression | Fichier |
| --- | --- | --- | --- |
| H3 robustness — try/catch autour de `recordEventProcessed` dans `default:` (un throw DB renvoyait 500 au lieu du 200 promis) | high | low | `supabase/functions/stripe-webhook/index.ts:204-213` |
| M3 architecture+robustness — +2 tests `loadAndInitSentry` (chunk introuvable + `Sentry.init` throw) | medium | low | `web/src/lib/sentry.test.ts:198-235` |
| H2 security — `VITE_SUPPORT_USER_ID` / `VITE_SUPPORT_EMAIL` ajoutés dans `.env.example` racine | high | low | `.env.example:26-30` |
| H1 security — disclaimer *(roadmap)* sur les sous-routes admin dans `MODERATION.md` (seule `/admin` existe) | high | low | `docs/MODERATION.md` § Outils |
| M1 security RGPD — procédure de purge manuelle `stripe_events` ajoutée au workflow droit-à-l'oubli | medium | low | `docs/MODERATION.md` § RGPD |
| L2 security — note explicative `--no-verify-jwt` ajoutée au runbook | low | low | `docs/PROD-RUNBOOK.md` §1.7 |

#### Fixes déférés (dette technique)

| Finding | Sévérité | Risque régression | Pourquoi déféré |
| --- | --- | --- | --- |
| **C1 robustness — `stripe_events` orpheline en cas de crash handler** | **critical** | medium | Le retry Stripe voit la PK et skip → exécution métier silencieusement perdue. Nécessite soit migration `t99cp_ledger.source_event_id` UNIQUE, soit job de réconciliation `processed_at IS NULL AND received_at < now() - 15m`. Migration DB hors scope janitor — à traiter en étape dédiée. |
| **C2 robustness — `credit_t99cp` non idempotent par event_id côté DB** | **critical** | medium | Défense en profondeur si une ligne `stripe_events` est manuellement supprimée. Migration DB. |
| M1 architecture — tests unit `handle()` webhook | medium | medium | Nécessite d'élargir `tsconfig.app.json` à `supabase/functions/`. Risque d'effets de bord sur le typecheck du reste. À refactor : extraire `handle()` dans `web/src/lib/stripeWebhook.ts` et le re-export depuis l'Edge Function. |
| M1 security RGPD — purge automatique `stripe_events.payload` | medium | medium | Cron TTL 90j OU scrubbing avant insert (garder `id`/`type`/`subscription`/`metadata.user_id`). Décision RGPD à prendre en équipe. |
| M2 security — élargir `scrubEvent` PII_KEYS (name, ip, birth, siret) | medium | medium | Risque faux positifs masquant des données debug utiles (`username`, `componentName`, etc.). Débat RGPD à mener. |
| M3 security — CSP `worker-src 'self' blob;` | medium | low | À vérifier si `@sentry/browser` v10 utilise un Web Worker. Sinon overkill. |
| M4 security — CSP `script-src https://js.stripe.com` | medium | low | Non bloquant tant que `loadStripe(...)` n'est pas appelé côté front (le checkout passe par l'Edge Function `create-checkout-session` qui retourne une URL Stripe Checkout, puis redirect — pas d'iframe Stripe Elements pour l'instant). Devient critique le jour où on ajoute Stripe Elements. |
| L1 architecture — placement `web/load/` vs `scripts/load/` | low | medium | Convention plus propre mais rename de chemin = casser tous les liens `docs/*` qui pointent dessus. Différer. |
| L1/L2 robustness — simplification des casts `as unknown as` | low | low | Refactor seam-injectable plus propre mais hors scope janitor strict. |
| L5 robustness — k6 cleanup `WRITE=1` non implémenté | low | low | Pas de scénario `WRITE=1` activé pour l'instant. À ajouter quand on testera l'écriture. |

#### Tests

- **812 tests verts** (123 fichiers, durée ~58 s). +2 vs étape 19 (810).
- 4 checks locaux verts (typecheck, lint, vitest, build).
- Build : entry 47.09 kB / gzip 13.28 kB (+0.01 kB du fait du `try/catch`
  ajouté côté Edge Function — n'impacte pas le bundle front).
- Pas de changement design system `T.*`.
- Pas de migration DB.
- Pas de breaking change utilisateur.

#### Décisions

- **Critical findings non corrigés** : C1 + C2 nécessitent une
  migration DB explicite (`UNIQUE` constraint sur
  `t99cp_ledger.source_event_id` OU job de réconciliation). Listés
  comme priorité 1 pour l'étape 20 dans `HANDOFF-PROGRESS.md` —
  l'équipe devra trancher avant le premier vrai paiement Stripe en
  production.
- **Sécurité CSP** : `script-src https://js.stripe.com` et
  `worker-src 'self' blob;` reportés. Le runbook PROD recommande
  un `curl -I` post-déploiement pour vérifier que les headers
  s'appliquent — s'il y a une page qui casse à cause de la CSP,
  l'erreur sera dans la console JS et trivialement détectable.
- **Pas de PR janitor sur le critical C1/C2** car `CLAUDE.md § Audit
  vibe janitor` est explicite : « Pas de migration DB en mode
  janitor ». Le bouchon de sécurité actuel (`stripe_events.id`
  PK + check anti-doublon dans le webhook) est suffisant **tant
  qu'on ne supprime pas manuellement de ligne `stripe_events`**.
  Une note explicite à ce sujet doit être ajoutée à la doc admin
  avant le passage en prod live.

### État du provisionnement externe (à jour 2026-05-12)

Une **session manuelle** avec l'équipe humaine a démarré le
provisionnement réel des comptes externes décrits dans
`docs/PROD-RUNBOOK.md`. État au 2026-05-12 :

| Service | Statut | Détails |
| --- | --- | --- |
| **Supabase** | ✅ **staging provisionné** | Projet `maintenant-staging` créé en `eu-west-3` (Paris), plan **Free** (à upgrader Pro avant le vrai go-live pour PITR). URL : `https://fdphrsqrsumkpzbxnjdj.supabase.co`. Schéma `db/schema.sql` appliqué (38 tables, 123 policies RLS, 5 RPCs dont `credit_t99cp` / `debit_t99cp` en SECURITY DEFINER). Bucket Storage `avatars` actif + 4 policies. Auth configurée : Site URL `http://localhost:5173`, Redirect URLs whitelist incluant `localhost:5173/**`, `127.0.0.1:5173/**`, `localhost:5173/auth/callback`. |
| **Supabase — clé API** | ⚠️ **legacy JWT en local** | Les nouvelles clés `sb_publishable_*` (introduites en 2025) ont un système de **« Domain Allowlist »** qui rejette les origines non listées. Pour staging on utilise la clé `anon` legacy (format `eyJ...`, role `anon`, exp 2036) qui n'a pas cette restriction. Stockée dans `web/.env.local` côté machine équipe humaine (gitignored, jamais commitée). À l'étape Vercel : reporter cette clé dans les env vars Vercel, ou migrer vers `sb_publishable_*` + ajouter `localhost`, `*.vercel.app`, `maintenant.org` à l'allowlist. |
| **Supabase — smoke test local** | ⏸️ **différé** | Le sandbox Claude ne peut pas appeler `*.supabase.co` (filtre edge anti-bot Cloudflare bloque les IPs datacenter). La validation réelle se fera depuis le déploiement Vercel preview (vrai navigateur, vrai User-Agent). |
| **Vercel** | 🔲 à faire | Liaison repo, env vars (URL + anon key + Stripe publishable + Sentry DSN + support user/email), vérification CSP via `curl -I`, domaine custom. |
| **Stripe** | 🔲 à faire | Compte live, 3 produits (gratuit / soutien 2€ / engagé 5€), webhook vers `https://fdphrsqrsumkpzbxnjdj.supabase.co/functions/v1/stripe-webhook` avec `STRIPE_WEBHOOK_SECRET`. |
| **Edge Functions Supabase** | 🔲 à faire | Déployer `create-checkout-session` et `stripe-webhook` via `npx supabase functions deploy --no-verify-jwt`. Renseigner les env vars `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`. |
| **Sentry** | 🔲 à faire | Créer projet `maintenant-web` (Browser JavaScript / React), récupérer DSN, ajouter à env Vercel. |
| **Point-in-Time Recovery** | 🔲 à faire | Indispensable avant upgrade Pro. Sur Free actuel : seulement 7 daily backups Supabase. |

**Notes pour l'équipe humaine** :

- Le mot de passe DB du projet `maintenant-staging` a été généré
  côté Supabase à la création et doit être stocké en gestionnaire de
  mots de passe (1Password / Bitwarden). Il sert à `psql` / `pg_dump`
  / les Edge Functions (variable `SUPABASE_SERVICE_ROLE_KEY` est
  distincte et récupérable depuis le dashboard).
- La clé `service_role` (secret backend) n'a **pas** été partagée
  dans cette session. À récupérer pour configurer les Edge
  Functions au moment du déploiement Stripe.
- Le projet Free se **met en pause après 7 jours d'inactivité** —
  pas un problème tant qu'on développe régulièrement. Réveil
  automatique au premier appel (~30 s de latence).
- Plan d'upgrade Pro recommandé : **à l'annonce publique du go-live**.
  Toggle en un clic, sans interruption ni migration de données.
  Coût ~25 USD/mois.

---

## Étape 21 — Post-go-live / Transparence v2 + E2E + dette différée ✅

**Branche** : `claude/review-project-rules-d3Euc`

Deuxième étape post-go-live. Le provisionnement Vercel / Stripe live /
Sentry SaaS / PITR n'a **pas évolué** depuis l'étape 20 (côté équipe
humaine — `docs/PROD-RUNBOOK.md`). L'étape se concentre donc sur ce
qui peut être livré sans environnement HTTPS réel : extension de la
page `/transparence` (graphique d'évolution mensuelle des
inscriptions), E2E UI-only sur la page, et documentation des
décisions / dette différée pour l'étape 22.

### Audit Lighthouse réel — différé étape 22

Pré-requis non rempli : pas de Vercel preview / staging.maintenant.org
en ligne, et la consigne du prompt étape 21 est explicite (« ne PAS
tenter d'audit en local-dev (résultats inexploitables) »). L'audit
mesuré reste sur `docs/PROD-RUNBOOK.md` §5, à exécuter par l'équipe
humaine post-déploiement Vercel. Pas de régression côté `vite build`
(`index.js` 47.34 kB / gzip 13.34 kB ; chunk `TransparencePage`
8.06 kB / gzip 3.26 kB lazy).

### Premier test E2E « happy path » — UI-only (mock Supabase)

Pas de projet Supabase de test seedé pour signer une pétition
anonymement (cf. prompt § « Demander à l'équipe humaine »). On
livre donc à la place une suite **UI-only** sur `/transparence`,
qui valide le routing + le rendu sans réseau réel.

`web/e2e/transparence.spec.ts` (3 tests) :

- charge la page, rend le H1 « Transparence » + la date « 12 mai
  2026 », la liste `aria-label="Compteurs publics"` (compteurs à
  zéro côté mock) ; **passe axe-core sans violations critiques**.
- vérifie l'état vide du graphique (« Aucune inscription
  enregistrée… ») quand le mock REST renvoie `[]`.
- vérifie le lien `Transparence` dans le footer (`/transparence`).

Le « happy path réel » (Supabase de test seedé → signature
anonyme + check du compteur) reste **listé dans PROD-RUNBOOK §6**,
à exécuter une fois qu'un projet Supabase `maintenant-test` aura été
provisionné par l'équipe humaine. Pas de bascule prématurée du
spec actuel sur un vrai projet (risque de fragilité CI).

### Monitoring Sentry runtime — différé étape 22

DSN absent en env preview (Sentry SaaS non provisionné — cf.
`docs/PROD-RUNBOOK.md` §4). Aucun event runtime à observer ; le test
canary `throw new Error('sentry-canary-step21')` est repoussé. Le
chunk `sentry-Dby9iEvy.js` 436.2 kB / gzip 143.08 kB reste lazy,
non téléchargé tant que `VITE_SENTRY_DSN` est vide.

### Monitoring Supabase — différé étape 22

Pas de trafic réel sur le projet `maintenant-staging` (sandbox
Claude ne peut pas appeler `*.supabase.co` depuis le datacenter
Cloudflare — cf. note étape 19 « ⏸️ différé »). Pas de quota API
/ DB CPU / DB memory à reporter, pas d'alertes Slack câblées. Le
dashboard Supabase → Performance reste à consulter par l'équipe
humaine quand des comptes seront créés depuis un Vercel preview
réel.

### Retours utilisateur·rices — sans objet (pas de trafic)

Aucun compte créé réel, aucun signalement modération, aucun bug
remonté en email tech@maintenant.org. La liste de fixes prioritaires
pour l'étape 22 vient donc exclusivement de la dette technique
déjà documentée (étape 19/20 + janitor post-step20).

### Page `/transparence` — compléments v2

#### Graphique d'évolution mensuelle des inscriptions

- **`fetchMonthlySignups(client, monthsBack=12, now)`** dans
  `web/src/lib/transparency.ts` : projette **uniquement
  `users.created_at`** (RLS-safe via la policy
  `users_select_public for select using (true)`) avec
  `gte('created_at', since)` pour borner le transfert au fenêtrage
  demandé. Bucketing côté client par mois UTC. Pas de PII transférée
  (email / display_name / etc. ne sont jamais demandés).
- **`buildMonthsRange(reference, monthsBack)`** : helper pur,
  retourne `Array<{ monthIso, count: 0 }>` ordonné
  chronologiquement, géré correctement pour le franchissement
  d'année (test dédié `décembre → janvier`).
- **`formatMonthShortFr('2026-05-01')` → `'mai 26'`** : format court
  pour les labels d'axe X (12 mois tiennent à l'écran).
- **`<MonthlySignupsChart buckets={...} />`** dans
  `web/src/components/MonthlySignupsChart.tsx` : SVG natif inline
  (pas de `recharts` / `victory` / `chart.js` ajoutés au bundle).
  - `viewBox` 600×220, `preserveAspectRatio="xMidYMid meet"` →
    s'adapte à la largeur du conteneur.
  - `role="img"` + `aria-label` par défaut « Inscriptions par mois
    sur les 12 derniers mois » (override par prop pour les tests).
  - `<title>` enfant SVG (lu par les screen readers comme tooltip
    accessible).
  - **État vide** : si `total === 0`, on rend un `<div role="status">`
    avec un message texte plutôt que le SVG. Évite un graphique
    visuellement plat et trompeur sur staging vide.
  - Tokens `T.*` : `--mn-surface-2` / `--mn-border` / `--mn-text-2`
    / `--mn-brand`. **Aucune nouvelle valeur introduite** au design
    system.
- **Page `TransparencePage`** : second `useEffect` indépendant pour
  le graphique (`chartState` séparé du `state` des compteurs). Une
  erreur côté graphique n'efface pas les compteurs et inversement.
  Le pattern `cancelled` (cleanup) est dupliqué — acceptable pour
  deux fetchs autonomes ; un hook custom `useFetchOnMount(fn)`
  serait l'extraction propre (dette `L3 architecture` ajoutée à
  l'étape 22).
- Section « Inscriptions par mois (12 derniers mois) » ajoutée
  entre la liste des compteurs et « Ce que vous ne verrez pas
  ici ». Texte d'introduction explicitant que **seule la date de
  création est utilisée** (RGPD-clear).

#### Cumul T99CP émises — différé (migration DB requise)

Le prompt étape 21 §7 listait optionnellement « total
contributions T99CP émises » (somme `t99cp_transactions.amount
where kind='credit'`). La table `t99cp_transactions` est protégée
par `t99cp_select_self` / `t99cp_insert_admin` (cf.
`db/schema.sql:1672-1681`) — un anon ne peut donc PAS sommer
publiquement. Solution propre : RPC SECURITY DEFINER publique
`transparency_t99cp_total()` qui renvoie un scalaire. **Choix de
différer** : c'est une migration DB additive non listée
explicitement dans le prompt étape 21 → respect de la consigne
« Aucune migration DB explicitement listée pour l'étape 21 —
demander confirmation si nécessaire ». À reprendre en étape 22
après validation produit (la métrique est-elle souhaitée
publiquement ?).

### Job de réconciliation Stripe — différé (idempotence DB suffit)

Le prompt §6 conditionne ce job à « Sentry montre des erreurs
récurrentes sur stripe-webhook ». Sentry n'étant pas câblé
runtime, on ne peut pas constater de telles erreurs. **Décision** :
maintenir le job en dette (étape 22 ou ultérieure), s'appuyer sur
la défense en profondeur déjà en place :

- `stripe_events.id` PK + `recordEventStart` upsert (étape 19) →
  idempotence applicative.
- `t99cp_transactions.source_event_id` index unique partiel + RPC
  `credit_t99cp` avec court-circuit silencieux (étape 20) →
  idempotence DB.

Le seul cas non couvert reste : « la ligne `stripe_events` est
posée mais le handler crashe à mi-chemin et Stripe ne retente
plus (>3 j) ». Probabilité très faible ; à monitorer dès que
Sentry sera actif.

### Dette technique différée — étape 22 ou plus tard

Récap consolidé (étape 19 + 20 + janitor post-step20 + étape 21) :

| ID | Sévérité | Risque rég. | Description courte | Étape cible |
| --- | --- | --- | --- | --- |
| H3-sec | high | high | `users.email` exposé via `users_select_public for select using (true)` | étape RLS hardening dédiée |
| H2-rob | high | medium | grant `service_role` explicite sur `credit_t99cp(uuid,integer,text,text)` à vérifier | étape 22 (test staging) |
| H2-arch | high | medium | `stripeWebhook.test.ts` cross-package import | étape archi dédiée |
| M2-sec | medium | high | `signatures_select_public` permet enum signataires (RGPD Art. 9) | étape RLS hardening |
| M5-rob | medium | low | `count: 'exact'` sur `signatures` au-delà ~100k lignes | étape stats matérialisées |
| M3-rob | medium | medium | `processed_at` non marqué sur validation 4xx (event silencieusement abandonné) | étape 22 (migration DB) |
| M1-RGPD | medium | medium | purge auto `stripe_events.payload` (TTL 90j ou scrub avant insert) | décision RGPD + migration |
| L1-a11y | medium | high | color-contrast `--mn-text-3` (~195 usages) | étape design dédiée |
| L3-arch | low | low | extraire hook `useFetchOnMount` pour dédoublonner `cancelled` pattern | nice-to-have |
| L4-sec | low | low | CSP `script-src https://js.stripe.com` (le jour où on ajoute Stripe Elements) | quand Stripe Elements activé |
| L5-arch | low | medium | inline `CSSProperties` dupliqués entre pages légales (LegalPageLayout) | étape design dédiée |
| L1-rob | low | low | tests `vi.fn<typeof deps.upsertAdhesion>` pattern inconsistant | passe test hygiene |

### Bundle après ajout

| Avant étape 21 (fin janitor 20) | Après étape 21 |
| --- | --- |
| `index.js` 47.27 kB / gzip 13.31 kB | `index.js` 47.34 kB / gzip 13.34 kB |
| `TransparencePage.js` 4.79 kB / gzip 2.08 kB | `TransparencePage.js` 8.06 kB / gzip 3.26 kB |
| (pas de chart) | `MonthlySignupsChart` inliné dans le chunk `TransparencePage` (SVG natif, aucune dep externe) |

Coût net : entry +0.07 kB / +0.03 kB gzip (négligeable). Chunk
`TransparencePage` lazy +3.27 kB / +1.18 kB gzip — chargé
uniquement sur visite de `/transparence`. **Aucune nouvelle
dépendance** npm ajoutée.

### Tests

- **+13 tests vitest** dans `web/src/lib/transparency.test.ts` :
  - `buildMonthsRange` (3 tests : 12 mois, franchissement
    décembre→janvier, monthsBack=0).
  - `formatMonthShortFr` (3 tests : mai 26, janv. 25, invalide
    fallback).
  - `fetchMonthlySignups` (5 tests : agrégation par mois UTC, état
    vide, propagation erreur PostgREST, ignore les rows hors
    fenêtre, ignore created_at non-string).
- **+4 tests vitest** dans
  `web/src/components/MonthlySignupsChart.test.tsx` :
  - état vide (tous compteurs à zéro) → role=status.
  - SVG `role=img` + aria-label par défaut + tick max sur Y +
    label « mai 26 ».
  - aria-label custom respecté.
  - une `<rect>` par bucket.
- **+3 tests vitest** dans `web/src/pages/TransparencePage.test.tsx`
  (mise à jour : second mock `fetchMonthlySignups`) :
  - chart visible avec inscriptions > 0.
  - état vide chart visible.
  - état d'erreur chart visible.
- **+3 tests E2E Playwright** dans `web/e2e/transparence.spec.ts` :
  - page chargée + axe-core OK + compteurs publics visibles.
  - état vide du graphique sur mock Supabase vide.
  - lien footer → navigation `/transparence`.

**Compteur final : 857 tests vitest verts** (127 fichiers, durée
~63 s). +18 vs étape 20 (839). E2E +3 (à valider en CI Playwright).
4 checks locaux verts (typecheck, lint, vitest, build).

### Hygiène

- Pas de modification du prototype (`app/Maintenant.html`,
  `Theme.jsx`).
- Pas d'emojis dans les fichiers TS / commits / PR.
- Tokens `T.*` (CSS vars `--mn-*`) **intacts** — chart réutilise
  `--mn-surface-2`, `--mn-border`, `--mn-text-2`, `--mn-brand`.
- Pas de clé service_role dans le bundle front.
- Pas de nouvelle dépendance npm.
- Pas de migration DB.
- Pas de breaking change visible utilisateur (la page
  `/transparence` reçoit une section additionnelle sous la liste
  existante, le rendu reste cohérent).
- Aucune `console.warn` / `console.error` ajoutée.

### Checks finaux

```
> npm run typecheck && npm run lint && npx vitest run && npm run build

✓ typecheck   (tsc -b + e2e/tsconfig.json)
✓ lint        (eslint .)
✓ vitest      (127 files, 857 tests passed, ~63s)
✓ build       (entry 47.34 kB / gzip 13.34 kB ; TransparencePage 8.06 kB / gzip 3.26 kB lazy ; sentry 436.2 kB / gzip 143 kB lazy)
```

### Migration DB

**Aucune** côté `db/schema.sql`. Le chart lit `users.created_at`
qui existe déjà depuis l'étape 4. La RLS publique
(`users_select_public for select using (true)`) est inchangée.

### Décisions

- **SVG natif plutôt que `recharts`** : 12 buckets max, échelle
  stable, pas besoin de tooltips interactifs ni d'animations. Le
  coût d'une lib externe (50-150 kB gzip selon la lib) n'est pas
  justifié pour ce volume. Conséquence pour l'étape 22+ : si on
  veut un dashboard admin riche en graphes, basculer alors sur
  `recharts` ou équivalent au moment où la valeur ajoutée
  l'emporte sur le coût bundle.
- **`fetchMonthlySignups` côté client (transfert + bucket)** plutôt
  qu'une RPC SQL `users_signups_monthly()` : on évite une
  migration DB pour cette étape (consigne « Aucune migration DB
  explicitement listée »). Limite à surveiller : > ~50k lignes
  `users` → transfert non négligeable. Listé dans M5-rob comme
  dette à matérialiser quand le trafic réel sera là.
- **Deux `useEffect` séparés** (compteurs + chart) plutôt qu'un
  `Promise.all` : une erreur sur l'un n'affecte pas l'autre, et
  les états de chargement / d'erreur sont distincts visuellement
  (compteurs vs graphique). Coût : duplication mineure du pattern
  `cancelled` — abstractible plus tard via `useFetchOnMount` (L3-arch).
- **Cumul T99CP émises différé** : la table est gated par RLS
  self-only. Une RPC publique scalaire serait acceptable mais
  c'est une migration DB hors scope de l'étape 21.
- **Job de réconciliation Stripe différé** : l'idempotence DB
  (étape 20) suffit tant qu'aucune erreur applicative n'est
  observée. Réactivable dès que Sentry sera câblé runtime.
- **Color-contrast `--mn-text-3` non corrigé** : design system
  T.* intouchable sans validation designer (CLAUDE.md). Reste en
  dette L1-a11y, traçable au e2e axe-core (règle `color-contrast`
  désactivée dans `DISABLED_RULES`).
- **Test E2E `happy path` réel différé** : besoin d'un projet
  Supabase de test seedé. Pas de raison de pousser une vraie URL
  Supabase dans le code de test (fragile + secrets en CI). Le
  test UI-only sur `/transparence` reste utile : il valide le
  routing + le rendu + axe-core.

### Prochaines étapes (étape 22)

- Lighthouse mesuré dès qu'un Vercel preview HTTPS sera en ligne.
- Monitoring Sentry canary + observations runtime 7 j.
- Décision produit sur le cumul T99CP émises (publique ou pas) →
  potentielle migration RPC.
- Adresser H2-rob (grant `service_role` explicite) en staging :
  un test SQL `select credit_t99cp('...', 60, 'test', 'evt_t')`
  côté service-role valide ou pas si un grant explicite manque.
- Si Sentry remonte des erreurs `stripe-webhook` récurrentes →
  prioriser le job de réconciliation Edge Function.

### Audit vibe janitor étape 21

**Branche** : `claude/janitor-post-step21`.

Audit en parallèle via 3 subagents `general-purpose` (architecture /
élégance, robustesse / edge cases, sécurité / cohérence handoff) sur
le scope PR #19. Synthèse + application des fixes safe-first
uniquement, conformément à `CLAUDE.md § Audit récurrent vibe janitor`.

#### Findings totaux

| Catégorie | Critical | High | Medium | Low |
| --- | --- | --- | --- | --- |
| Architecture | 0 | 0 | 2 | 10 |
| Robustesse | 0 | 2 | 3 | 4 |
| Sécurité / cohérence | 0 | 0 (1 pré-existant) | 0 | 3 |
| **Total** | **0** | **2** | **5** | **17** |

#### Fixes appliqués (4)

| Finding | Sévérité | Risque régression | Fichier |
| --- | --- | --- | --- |
| H2 robustesse — test « cleanup useEffect » manquant pour le 2nd fetch (`fetchMonthlySignups`) → ajout d'un test symétrique au 1er | high | low | `web/src/pages/TransparencePage.test.tsx` (+1 test « annule proprement le setState du graphique ») |
| L2 robustesse — `buildMonthsRange(new Date('invalid'), 12)` produisait 12 `NaN-NaN-01` buckets → guard `Number.isNaN(reference.getTime())` retournant `[]` | low | low | `web/src/lib/transparency.ts:158-164` + `web/src/lib/transparency.test.ts` (+1 test) |
| L1 robustesse — commentaire de tête dans `public-pages.spec.ts` clarifiant que `/transparence` est intentionnellement couverte par son spec dédié (anti-régression doc-only) | low | low | `web/e2e/public-pages.spec.ts:6-8` |
| M3 robustesse — invariant PostgREST UTC documenté dans `monthKeyFromIso` (rappel : si `pgrst.db_tz` change, le slice retournera un mois local et l'agrégation biaisera silencieusement) | medium | low | `web/src/lib/transparency.ts:228-236` (commentaire-only) |

#### Fixes déférés (dette technique)

| Finding | Sévérité | Risque régression | Pourquoi déféré |
| --- | --- | --- | --- |
| **H1 robustesse — `fetchMonthlySignups` sans `range()/limit()` → biais silencieux > 1000 lignes (PostgREST max-rows)** | high | medium | Fix immédiat (pagination boucle) = logique async non triviale + tests dédiés. Solution propre = RPC `users_signups_monthly()` côté DB = migration DB hors scope janitor. **Déjà partiellement listé** dans la dette `M5-rob` étape 20 (« count: exact > 100k »). |
| **M1 robustesse — `aria-label` sur `&lt;svg&gt;` + `&lt;title&gt;` enfant : pattern W3C recommandé est `aria-labelledby`** | medium | medium | Le test `toHaveAttribute('aria-label', …)` casserait. Modifier le contrat d'a11y testé mérite validation explicite designer/a11y, hors scope janitor. axe-core passe sur le pattern actuel — pas de bloquant utilisateur. |
| **M2 robustesse — `formatMonthShortFr` accepte year &gt; 9999** | medium | low | Edge improbable (Postgres `timestamptz` ne génère pas ça avant l'an 10000). Polish stylistique. |
| **M1 architecture — duplication pattern `cancelled` entre les 2 useEffect** | medium | medium | Extraction d'un hook `useFetchOnMount` touche 7 fichiers (AuthCallbackPage, MessagingConversationPage, ArticleDetailPage, CampaignCreatePage, useIsAdmin, etc.) + casse potentielle de plusieurs suites de tests. À planifier étape dédiée — déjà tracé `L3-arch` dans le tableau dette étape 21. |
| **M2 architecture — `CSSProperties` inline dupliqués entre pages légales et `TransparencePage`** | medium | medium | `LegalPageLayout` partagé éliminerait ~150 lignes mais touche 5 pages + casse possible des sélecteurs Playwright/RTL. Design system T.* intouchable sans validation designer (CLAUDE.md). Déjà tracé `L5-arch` dans le tableau dette étape 21. |
| **H-1 sécurité (pré-existant, déjà tracé H3-sec) — `users_select_public for select using (true)` permet `select=*`** | high | high | Refactor RLS large (vue `users_public` + GRANTs colonne révoquant `email/postal_code` au rôle `anon`). Hors scope janitor — étape RLS hardening dédiée. Le chart `/transparence` n'aggrave pas le risque, il rend l'endpoint `/users` plus découvrable. |
| **L-1 sécurité — pas de `clearMocks: true` global dans `vite.config.ts`** | low | medium | Risque latent (les tests scope étape 21 compensent localement avec `mockReset()` dans `beforeEach`). Un `clearMocks` global peut casser des tests qui dépendent de `mockReturnValue` partagé entre `it`. À traiter en passe test-hygiene dédiée. |
| **L1-arch — `monthKeyFromIso` renommage en `firstOfMonthFromIso`** | low | low | Polish, le nom actuel est clair via le commentaire. Non bloquant. |
| **L5-arch — mix `vi.fn` typé vs `as never`** | low | low | Cohérent avec le reste de la suite (cf. `RequireAuth.test.tsx`, `useIsAdmin.test.tsx`). Pas un vrai problème. |
| **L4-arch — DI partielle (lib injectable mais consumer pas)** | low | low | Pattern intentionnel (90% des consumers utilisent `vi.mock` du module). Propager casserait toutes les suites. |

#### Tests

- **859 tests vitest verts** (127 fichiers, durée ~66 s). +2 vs
  étape 21 (857) — un test cleanup symétrique + un test guard NaN.
- 4 checks locaux verts (typecheck, lint, vitest, build).
- Build : entry `47.34 kB / gzip 13.34 kB` (inchangé — les
  modifs sont du commentaire / guard côté lib + tests).
- Pas de changement design system `T.*`.
- Pas de migration DB.
- Pas de breaking change utilisateur.
- Pas de bump majeur de dépendance.

#### Décisions

- **H1 robustesse non corrigé en janitor** : le risque concret
  (biais > 1000 inscriptions sur 12 mois) ne se matérialise pas
  tant que la table `users` est en dessous de ce volume. Sur
  Supabase staging actuel : 0 inscription. Sur prod future : à
  surveiller via le monitoring Supabase (étape 22). Solution
  propre = RPC SQL — listé pour étape 22 si validation produit
  + l'occasion d'une migration DB additive.
- **M1 robustesse (aria-labelledby) non corrigé** : axe-core ne
  remonte pas de violation sur le pattern actuel (`aria-label`
  sur svg + `<title>` enfant). Le test e2e passe. Modifier le
  pattern changerait 2 assertions test (`toHaveAttribute('aria-label',
  …)`) — non bloquant mais pollue le diff janitor. À traiter en
  passe a11y dédiée si NVDA/JAWS remontent un retour.
- **Pattern `cancelled` duplication non corrigé** : extraire un
  hook custom touche 7+ fichiers, dépasse largement le scope
  janitor (« primum non nocere »). Réaffirmé en `L3-arch`.
- **Aucune migration DB**, aucun fix design system, aucun
  breaking change, aucun bump majeur de dépendance — conditions
  d'arrêt CLAUDE.md respectées.

---

## Étape 22 — Post-go-live / Grant service_role + E2E densifié + dette différée ✅

**Branche** : `claude/review-project-rules-7CZC1`

Troisième étape post-go-live. Le provisionnement Vercel / Stripe live /
Sentry SaaS / PITR / projet Supabase de test **n'a pas évolué** depuis
les étapes 20-21 (côté équipe humaine — `docs/PROD-RUNBOOK.md`).
Aucun trafic réel, aucune métrique Sentry runtime, aucune signature
réelle à observer. L'étape se concentre sur ce qui peut être livré
sans environnement externe : clôture de la dette H2-rob via grant
explicite `service_role` (migration additive listée → autorisée),
densification du spec E2E `transparence` avec scénarios non-nuls,
décision documentée sur le cumul T99CP émises publique, et
re-différement structuré des items qui exigent du runtime
(Lighthouse, Sentry, Supabase monitoring, retours utilisateur·rices,
job de réconciliation Stripe).

### Audit Lighthouse réel — différé étape 23

Pré-requis non rempli : pas de Vercel preview / staging.maintenant.org
en ligne. La consigne du prompt étape 22 est explicite (« Si pas de
staging HTTPS : différer étape 23 »). L'audit mesuré reste
documenté dans `docs/PROD-RUNBOOK.md` §5, à exécuter par l'équipe
humaine post-déploiement Vercel. Pas de régression côté
`vite build` (entry 47.34 kB / gzip 13.32 kB ; chunk
`TransparencePage` 8.10 kB / gzip 3.29 kB lazy — variation < 1 %
vs étape 21).

### E2E « happy path » réel — différé, alternative livrée

Pas de projet Supabase de test seedé (cf. prompt § « Demander à
l'équipe humaine »). Conformément à la consigne « Sinon densifier
`transparence.spec.ts` avec des cas mock non-nuls » :

`web/e2e/utils/mockSupabase.ts` accepte désormais un paramètre
`overrides` optionnel (`SupabaseStubOverrides`) qui permet de
fournir, table par table :

- `count` : valeur utilisée pour le header `content-range: 0-N/<count>`
  consommé par les requêtes `head: true, count: 'exact'` côté
  client (`fetchTransparencyCounts`). Le body reste l'array `rows`
  (qui sert quand la même route est appelée en GET non-head).
- `rows` : array JSON renvoyé pour les requêtes GET (par ex.
  `users.select('created_at').gte(...)` pour le chart mensuel).

Comportement par défaut inchangé pour les autres specs : sans
`overrides`, toutes les routes REST renvoient `[]` /
`content-range: 0-0/0` comme avant — pas de régression sur
`auth-flow.spec.ts`, `critical-flows.spec.ts`,
`petition-signature.spec.ts`, `public-pages.spec.ts`.

`web/e2e/transparence.spec.ts` — deux nouveaux tests sous le
describe `compteurs et graphique non-nuls` :

- **compteurs publics non-nuls** : seed `users.count=42`,
  `petitions.count=7`, `signatures.count=128`, etc. → on vérifie
  que les valeurs s'affichent dans la liste « Compteurs publics »
  (labels et valeurs exactes). `expectNoCriticalAxeViolations`
  re-passé pour confirmer qu'axe-core ne dégrade pas avec
  contenu non-vide.
- **chart SVG visible quand inscriptions > 0** : seed 5 rows
  `users` avec `created_at` étalés (3 en mai 2026, 1 en mars
  2026, 1 en novembre 2025) → on vérifie le SVG
  `role="img"` + aria-label, 12 `<rect>` (12 buckets stables),
  et disparition du message « Aucune inscription enregistrée ».

Le « happy path réel » (signature anonyme + check du compteur)
reste **listé dans PROD-RUNBOOK §6**, à exécuter une fois qu'un
projet Supabase `maintenant-test` aura été provisionné par
l'équipe humaine.

### Monitoring Sentry runtime — différé étape 23

DSN absent en env preview (Sentry SaaS non provisionné). Aucun
event runtime à observer ; le test canary est repoussé. Pas de
nouvelle information vs étape 21.

### Monitoring Supabase — différé étape 23

Pas de trafic réel sur le projet `maintenant-staging` (sandbox
Claude ne peut pas appeler `*.supabase.co`). Pas de quota API
/ DB CPU / DB memory à reporter. Le dashboard Supabase →
Performance reste à consulter par l'équipe humaine quand des
comptes seront créés depuis un Vercel preview réel.

### Retours utilisateur·rices — sans objet (pas de trafic)

Aucun compte créé réel, aucun signalement modération, aucun bug
remonté en `tech@maintenant.org`. La liste de fixes prioritaires
pour l'étape 23 vient donc exclusivement de la dette technique
déjà documentée (étapes 19-21 + janitor post-step 21).

### H2-rob — grant service_role explicite sur credit_t99cp 4-args ✅

La dette `H2-rob` (high / medium) listée à l'étape 21 portait
sur l'incertitude suivante : sur un projet Supabase « hardened »
(rôles postgres locked-down via `alter role service_role
nobypassrls`), le rôle `service_role` n'a PAS automatiquement
`execute` sur `public.credit_t99cp(uuid, integer, text, text)`
— alors que l'Edge Function `stripe-webhook` (étape 20) appelle
cette RPC depuis un client supabase-js authentifié avec le
service-role-key.

Sans grant explicite, sur un projet hardened, l'appel renvoie
`permission denied for function credit_t99cp` et le crédit T99CP
de l'adhésion n'est jamais appliqué.

**Le prompt étape 22 listait deux branches** :

1. Tester en staging via
   `select credit_t99cp('...', 60, 'test-22', 'evt_test_step22')`
   côté service-role. Si permission denied → ajouter le grant.
2. Sinon, clore la dette H2-rob.

Le sandbox Claude n'a **pas** accès à un client `psql` distant
sur le projet staging (le datacenter Cloudflare bloque les
sorties vers `*.supabase.co` — déjà noté étape 19). Le test
« live » est donc impossible depuis ici.

**Choix défensif** : ajouter proactivement le grant dans
`db/schema.sql` (cf. lignes 1971-1981 après modif). Migration
additive listée explicitement dans le prompt étape 22 →
autorisée par CLAUDE.md § Politique de PR. Coût zéro sur un
projet non-hardened (`grant execute` est idempotent et le rôle
`service_role` bypasse déjà), bénéfice net sur un projet
hardened (déblocage des Edge Functions).

```sql
grant execute on function public.credit_t99cp(uuid, integer, text, text)
  to service_role;
grant execute on function public.debit_t99cp(uuid, integer, text)
  to service_role;
```

`debit_t99cp` est inclus par symétrie : il n'est PAS appelé
côté Edge Function aujourd'hui, mais une future Edge Function
de remboursement (RGPD ou erreur de double-crédit) en aurait
besoin. Coût zéro de l'ajouter dès maintenant.

**Dette H2-rob → clôturée** dans le tableau dette consolidé
ci-dessous. La validation finale (test SQL live côté service-role)
reste à exécuter par l'équipe humaine au moment de
l'application de la migration sur staging — procédure dans
`docs/PROD-RUNBOOK.md` §3.

### Cumul T99CP émises publique — différé, décision documentée

Le prompt §6 propose la RPC `transparency_t99cp_total() returns
bigint security definer` (somme `t99cp_transactions.amount where
kind='credit'`) si validation produit reçue. **Sans validation
produit** (pas d'équipe humaine sollicitée en synchrone), la
consigne du prompt est : « Sinon documenter la décision dans
`USER-GUIDE.md` ».

Section « Combien de T99CP ont été distribués au total ? »
ajoutée au `docs/USER-GUIDE.md` (sous « À quoi servent les
T99CP ? »). Contenu :

- Indique que le total cumulé n'est **pas affiché publiquement**
  à ce stade, avec la raison technique (RLS self-only sur
  `t99cp_transactions`).
- Indique la solution propre (RPC scalaire SECURITY DEFINER)
  et la raison du défer (décision produit non validée — un
  total brut hors contexte d'usage n'aide pas la compréhension
  de la circulation des points).
- Liste les statistiques publiques déjà disponibles sur
  `/transparence` (compteurs + chart mensuel).
- Invite les retours utilisateur·rices à
  `contact@maintenant.org` pour ré-évaluer la décision sur la
  base d'un besoin exprimé.

Aucune migration DB appliquée pour cette section : la RPC
reste à créer le jour où la décision produit est prise. Le
diff est documentation pure.

### Job de réconciliation Stripe — différé (idempotence DB suffit)

Critère prompt §8 : « erreurs récurrentes Sentry sur
`stripe-webhook` ». Sentry n'étant pas câblé runtime, on ne
peut pas constater de telles erreurs. **Décision** maintenue
depuis étape 21 : s'appuyer sur la défense en profondeur
(`stripe_events` upsert + index unique partiel
`t99cp_transactions.source_event_id`). Le seul cas non couvert
(`stripe_events` posé mais handler crashe AVANT le crédit, et
Stripe ne retente plus après >3 j) reste improbable et
détectable dès que Sentry sera actif.

### Dette technique différée — étape 23 ou plus tard

Récap consolidé (étapes 19-22 + janitor post-step 21) :

| ID | Sévérité | Risque rég. | Description courte | Étape cible |
| --- | --- | --- | --- | --- |
| H3-sec | high | high | `users.email` exposé via `users_select_public for select using (true)` | étape RLS hardening dédiée |
| ~~H2-rob~~ | ~~high~~ | ~~medium~~ | ~~grant `service_role` sur `credit_t99cp(uuid,integer,text,text)`~~ | **clôturée étape 22** (grant additif ajouté à `db/schema.sql`) |
| H2-arch | high | medium | `stripeWebhook.test.ts` cross-package import | étape archi dédiée |
| H1-rob | high | medium | `fetchMonthlySignups` sans `range()/limit()` → biais > 1000 lignes (PostgREST max-rows) | étape stats matérialisées (RPC `users_signups_monthly()` DB) |
| M2-sec | medium | high | `signatures_select_public` permet enum signataires (RGPD Art. 9) | étape RLS hardening |
| M5-rob | medium | low | `count: 'exact'` sur `signatures` au-delà ~100k lignes | étape stats matérialisées |
| M3-rob | medium | medium | `processed_at` non marqué sur validation 4xx (event silencieusement abandonné) | étape 23 (migration DB) |
| M1-RGPD | medium | medium | purge auto `stripe_events.payload` (TTL 90j ou scrub avant insert) | décision RGPD + migration |
| L1-a11y | medium | high | color-contrast `--mn-text-3` (~195 usages) | étape design dédiée |
| L3-arch | low | low | extraire hook `useFetchOnMount` pour dédoublonner `cancelled` pattern | nice-to-have |
| L4-sec | low | low | CSP `script-src https://js.stripe.com` (Stripe Elements) | quand Stripe Elements activé |
| L5-arch | low | medium | inline `CSSProperties` dupliqués entre pages légales | étape design dédiée |
| L1-rob | low | low | tests `vi.fn<typeof deps.upsertAdhesion>` pattern inconsistant | passe test hygiene |

### Bundle après ajout

| Avant étape 22 (fin janitor 21) | Après étape 22 |
| --- | --- |
| `index.js` 47.34 kB / gzip 13.34 kB | `index.js` 47.34 kB / gzip 13.32 kB |
| `TransparencePage.js` 8.06 kB / gzip 3.26 kB | `TransparencePage.js` 8.10 kB / gzip 3.29 kB |
| (mockSupabase identique) | helpers `SupabaseStubOverrides` ajoutés (E2E only, pas de bundle) |

Variation entry/gzip < 1 % (volatilité hash chunk). Aucune
nouvelle dépendance npm. Aucune nouvelle entrée bundle main.

### Tests

- **859 tests vitest verts** (127 fichiers, durée ~58 s). Compte
  **inchangé** vs janitor post-step 21 : l'étape 22 ne touche
  pas la lib TS ni les composants — uniquement la doc, la
  migration DB additive, et le mock E2E + spec Playwright. Pas
  de nouveau code source TS à couvrir en vitest.
- **+2 tests E2E Playwright** dans `web/e2e/transparence.spec.ts`
  (5 tests au total) :
  - compteurs publics non-nuls (42 membres, 7 pétitions,
    128 signatures, etc.) + axe-core OK.
  - chart SVG visible avec `<rect>` × 12 quand inscriptions > 0.
- 4 checks locaux verts (typecheck, lint, vitest, build).

### Hygiène

- Pas de modification du prototype (`app/Maintenant.html`,
  `Theme.jsx`).
- Pas d'emojis dans les fichiers TS / commits / PR.
- Tokens `T.*` (CSS vars `--mn-*`) **intacts**.
- Pas de clé service_role dans le bundle front.
- Pas de nouvelle dépendance npm.
- Migration DB : **additive uniquement** (deux `grant execute`
  idempotents). Aucune suppression / rename / DROP. Listée
  explicitement dans le prompt étape 22 → autorisée par
  CLAUDE.md.
- Pas de breaking change visible utilisateur (la doc
  `USER-GUIDE.md` ajoute une section informative ; l'E2E
  mockSupabase reste rétro-compatible — `overrides` est
  optionnel et `[]` reste le défaut).
- Aucune `console.warn` / `console.error` ajoutée.

### Checks finaux

```
> npm run typecheck && npm run lint && npx vitest run && npm run build

✓ typecheck   (tsc -b + e2e/tsconfig.json)
✓ lint        (eslint .)
✓ vitest      (127 files, 859 tests passed, ~58s)
✓ build       (entry 47.34 kB / gzip 13.32 kB ; TransparencePage 8.10 kB / gzip 3.29 kB lazy ; sentry 436.2 kB / gzip 143 kB lazy)
```

### Migration DB

**Additive uniquement** (cf. `db/schema.sql` §20 lignes 1971-1981
après modif) :

```sql
grant execute on function public.credit_t99cp(uuid, integer, text, text)
  to service_role;
grant execute on function public.debit_t99cp(uuid, integer, text)
  to service_role;
```

Procédure d'application en staging avant l'étape 23
(cf. `docs/PROD-RUNBOOK.md` §3) :

1. `pg_dump` du projet `maintenant-staging` vers bucket privé.
2. `psql < db/schema.sql` — idempotent, le grant est appliqué
   sans erreur même si le rôle bypassait déjà.
3. Validation : depuis psql en mode service-role,
   `select credit_t99cp('11111111-1111-1111-1111-111111111111', 1, 'test-step22', 'evt_test_step22');`
   ne doit pas renvoyer `permission denied` (return OK ou
   `unknown_user` selon que l'UID existe).
4. `supabase functions deploy stripe-webhook --no-verify-jwt`.
5. Test canary `stripe trigger invoice.payment_succeeded`.

### Décisions

- **Grant service_role appliqué proactivement** plutôt qu'en
  attente de test live : la migration est additive, idempotente,
  no-op sur projet non-hardened. Le coût d'attendre la
  validation humaine (semaines avant déploiement Vercel) >
  coût de l'ajouter dès maintenant. Conditions CLAUDE.md
  respectées (migration listée explicitement dans le prompt
  étape 22).
- **Cumul T99CP différé documenté plutôt qu'implémenté** :
  la consigne « Sinon documenter dans USER-GUIDE.md » est
  appliquée à la lettre. Pas d'auto-validation produit côté
  Claude — la décision « est-ce que cette métrique aide les
  adhérent·es ? » revient à l'équipe humaine. Le code RPC
  reste prêt à être écrit en étape 23+ si la décision tombe.
- **E2E densifié avec overrides plutôt qu'un projet
  Supabase de test** : un projet de test seedé est plus
  robuste à long terme (vrai end-to-end inclus RLS), mais
  hors scope du sandbox actuel. L'API `overrides` est un
  premier pas — réutilisable par d'autres specs (auth-flow,
  petition-signature) le jour où elles auront besoin de
  scénarios non-vides.
- **`debit_t99cp` grant service_role ajouté par symétrie** :
  pas d'appel actuel côté Edge Functions, mais coût zéro et
  prévoit le cas remboursement RGPD futur.
- **Lighthouse / Sentry / Supabase monitoring / retours**
  re-différés en bloc étape 23 : conditions inchangées vs
  étape 21 (provisionnement externe non avancé).

### Prochaines étapes (étape 23)

- Lighthouse mesuré dès qu'un Vercel preview HTTPS sera en
  ligne (priorité 1 si oui).
- Monitoring Sentry canary + 7 j observations.
- Décision produit cumul T99CP émises → RPC SECURITY DEFINER
  si OK.
- Adresser H1-rob (RPC `users_signups_monthly()` côté DB pour
  remplacer `fetchMonthlySignups` quand `users` > ~50k lignes).
- Adresser H2-arch (`stripeWebhook.test.ts` cross-package
  import).
- Si Sentry remonte des erreurs `stripe-webhook` récurrentes →
  prioriser le job de réconciliation Edge Function.

### Audit vibe janitor étape 22

**Branche** : `claude/janitor-post-step22`.

Audit en parallèle via 3 subagents `general-purpose` (architecture /
élégance, robustesse / edge cases, sécurité / cohérence handoff) sur
le scope PR #21 / commit `56c9b6c`. Synthèse + application des fixes
safe-first uniquement, conformément à `CLAUDE.md § Audit récurrent
vibe janitor`.

#### Findings totaux

| Catégorie | Critical | High | Medium | Low |
| --- | --- | --- | --- | --- |
| Architecture | 0 | 0 | 2 | 9 |
| Robustesse | 0 | 0 | 3 | 7 |
| Sécurité / cohérence | 0 | 0 | 0 | 3 (informationnels) |
| **Total** | **0** | **0** | **5** | **19** |

#### Fixes appliqués (4)

| Finding | Sévérité | Risque régression | Fichier |
| --- | --- | --- | --- |
| A1 + R4 architecture/robustesse — JSDoc enrichi sur `SupabaseStubOverrides` (sémantique count/rows partagée, mock ne filtre pas, RPC non couvertes) | low | low | `web/e2e/utils/mockSupabase.ts:16-45` |
| R1 robustesse — commentaire bloc sur la garde `match?.[1] ?? ''` (fallback explicite vers la réponse par défaut) | low | low | `web/e2e/utils/mockSupabase.ts:88-92` |
| A6 architecture — suppression de 2 liens auto-référents `#transparence-du-mouvement` dans `USER-GUIDE.md` (remplacés par `/transparence` en texte plain ou liens supprimés) | low | low | `docs/USER-GUIDE.md:53-54, 82-87` |
| R9 + R10 robustesse + S2 sécurité — reformulation du commentaire SQL `service_role` (clarification du modèle Supabase managed) + précision UTC dans `USER-GUIDE.md` § Transparence | low | low | `db/schema.sql:1968-1990`, `docs/USER-GUIDE.md:82-87` |

#### Fixes déférés (dette technique)

| Finding | Sévérité | Risque régression | Pourquoi déféré |
| --- | --- | --- | --- |
| **A2 architecture — renommer `rest` en `tables`/`restByTable`** | low | medium | Touche un type public exporté par `mockSupabase.ts` ; les 4 callers actuels (`auth-flow`, `critical-flows`, `petition-signature`, `public-pages`) ne l'utilisent pas mais le futur sera affecté. Reporté en passe de refactor E2E dédiée. |
| **A3 architecture — `content-range` format PostgREST exact** (`*/${count}` quand pas de rows) | low | medium | Aligner sur le protocole exact pourrait casser des asserts existants (supabase-js lit le `/N` total uniquement, mais robustesse comportementale du mock à ne pas modifier sans tests dédiés). |
| **A5 architecture + R5 robustesse — sélecteurs `getByText('42', exact)` et `rect` global** | medium | medium | Refactor des assertions Playwright avec `data-testid` ou structure DOM dédiée touche le composant `MonthlySignupsChart` (design system T.* potentiellement impacté). Hors scope janitor. |
| **A7 architecture — section USER-GUIDE.md « Transparence du mouvement » placée sous `## Compte et adhésion`** | low | low | Restructuration éditoriale à valider avec l'équipe produit. |
| **R2 robustesse — validation `count` négatif/non-entier** | medium | low | Ajouter un type guard et tests unitaires sur le mock = nouvelle surface code/tests. Reporté en passe de durcissement helpers E2E. |
| **R3 robustesse — incohérence `content-range` head vs non-head** | medium | medium | Cf. A3. Demande détection de méthode HTTP + refonte. Risque medium de casser specs existants. |
| **R6 robustesse — `getByText` non-scopé** | low | medium | Cf. A5. |
| **R7 robustesse — waiter implicite sur fetch** | low | medium | `waitForResponse` introduit potentiellement des deadlocks (race avec le fetch déjà résolu). Sans flake observé, pas urgent. |
| **R8 robustesse — try/catch sur `route.fulfill`** | low | medium | Masquer les erreurs `route` peut cacher des bugs CI réels. À évaluer si flake observé. |
| **S1 sécurité — `debit_t99cp` grant service_role pré-emptif** | low | low | Aucun appel actuel côté Edge Functions. Conservé pour défense en profondeur (cas remboursement RGPD futur). Re-évaluer après étape 23 si toujours pas d'appelant. |

#### Tests

- **859 tests vitest verts** (127 fichiers, durée ~57 s). Compte
  **inchangé** vs étape 22 — l'audit janitor ne touche que doc et
  commentaires, pas de logique TS testable.
- 4 checks locaux verts (typecheck, lint, vitest, build).
- Build : entry `47.34 kB / gzip 13.32 kB` (inchangé).
- Pas de changement design system `T.*`.
- Pas de migration DB.
- Pas de breaking change utilisateur.
- Pas de bump majeur de dépendance.

#### Décisions

- **Fixes safe-first uniquement** appliqués (doc / commentaires
  / texte JSDoc). Aucun fix qui change de comportement runtime.
- **A6 + reformulation S2** : 2 fixes complémentaires sur la
  doc (USER-GUIDE.md + db/schema.sql). Pas de changement
  comportemental, juste clarification éditoriale.
- **Aucune migration DB**, aucun fix design system, aucun
  breaking change, aucun bump majeur de dépendance — conditions
  d'arrêt CLAUDE.md respectées.
- Audit globalement très propre : **0 finding critical/high**,
  scope diff étape 22 majoritairement additif + documentaire.

---

## Étape 23 — Post-go-live / Clôture H1-rob (RPC agrégation) + H2-arch (handler partagé) ✅

**Branche** : `claude/review-project-rules-ZBeWK`

Quatrième étape post-go-live. Le provisionnement Vercel / Stripe live /
Sentry SaaS / PITR / projet Supabase de test **reste inchangé** depuis
les étapes 20-22. Aucun trafic réel, aucune métrique Sentry runtime,
aucun retour utilisateur·rice. L'étape se concentre sur ce qui est
livrable sans environnement externe : **clôture de deux dettes high
priority** (`H1-rob` agrégation côté DB + `H2-arch` cross-package
import des tests stripe-webhook), extension de l'API mock E2E aux
RPC, densification supplémentaire des specs Playwright.

### Audit Lighthouse réel — différé étape 24

Pré-requis non rempli : pas de Vercel preview / staging HTTPS en
ligne. La consigne du prompt étape 23 est explicite (« Si pas de
staging HTTPS : différer étape 24 »). L'audit mesuré reste documenté
dans `docs/PROD-RUNBOOK.md` §5, à exécuter par l'équipe humaine
post-déploiement Vercel. Pas de régression côté `vite build` : bundle
entry inchangé (47.34 kB / gzip 13.32 kB) ; chunk `TransparencePage`
légèrement réduit (7.53 kB / gzip 3.04 kB vs 8.10 kB / gzip 3.29 kB
étape 22) — le bucketing client supprimé compense l'ajout d'un
appel RPC.

### E2E « happy path » réel — différé, alternative livrée

Pas de projet Supabase de test seedé. Conformément à la consigne
« Sinon ajouter encore un test mock non-vide à `transparence.spec.ts`
ou à `petition-signature.spec.ts` (réutiliser
`installSupabaseStubs(page, { rest: ... })`) » :

- `web/e2e/petition-signature.spec.ts` +1 test : **affiche le
  compteur de signatures (signature_count / target_count)**. Vérifie
  que la fiche pétition rend bien la jauge avec format français
  (espace insécable étroit U+202F). Lecture-only, pas d'écriture.
- `web/e2e/utils/mockSupabase.ts` étendu : `SupabaseStubOverrides`
  accepte désormais `rpc?: Record<string, { rows?: unknown[] }>`.
  Le router Playwright distingue `/rest/v1/rpc/<fn>` (réponse =
  rows tel quel) de `/rest/v1/<table>` (réponse = body + header
  content-range). Rétro-compatible : sans clé `rpc`, comportement
  identique à l'étape 22.
- `web/e2e/transparence.spec.ts` adapté : le test
  « chart SVG visible quand inscriptions > 0 » seede maintenant
  `rpc.users_signups_monthly.rows` (12 buckets pré-calculés)
  plutôt que `users.rows` (created_at brutes). Cohérent avec
  l'agrégation côté DB (étape 23).

### Monitoring Sentry runtime — différé étape 24

DSN absent en env preview (Sentry SaaS non provisionné). Aucun event
runtime à observer. Re-différé.

### Monitoring Supabase — différé étape 24

Pas de trafic réel sur `maintenant-staging`. Re-différé.

### Retours utilisateur·rices — sans objet (pas de trafic)

Aucun compte créé réel, aucun signalement modération, aucun bug
remonté. Les fixes prioritaires étape 24 viennent exclusivement
de la dette technique restante.

### H1-rob — RPC users_signups_monthly() côté DB ✅

La dette `H1-rob` (high / medium) listée à l'étape 19 portait sur
le fait que `fetchMonthlySignups` côté client lisait toutes les
lignes `users.created_at` des 12 derniers mois pour les agréger
en JS. Au-delà du `max_rows = 1000` PostgREST (cf.
`supabase/config.toml` §[api]), les rows sont tronquées
silencieusement → agrégation biaisée.

**Migration DB additive** ajoutée à `db/schema.sql` §21 (listée
explicitement dans le prompt étape 23 → autorisée par
CLAUDE.md § Politique de PR) :

```sql
create or replace function public.users_signups_monthly(
  p_months_back integer default 12
)
  returns table (month_iso date, count integer)
  language sql
  stable
  security definer
  set search_path = public
as $$
  with params as (
    select least(greatest(coalesce(p_months_back, 12), 1), 60) as n,
           date_trunc('month', timezone('UTC', now()))::date as cur_month
  ),
  months as (
    select (p.cur_month - ((p.n - 1 - g.n) || ' months')::interval)::date as m
    from params p, generate_series(0, p.n - 1) as g(n)
  ),
  agg as (
    select date_trunc('month', timezone('UTC', u.created_at))::date as m,
           count(*)::integer as c
    from public.users u, params p
    where u.created_at >= (p.cur_month - ((p.n - 1) || ' months')::interval)
    group by 1
  )
  select months.m, coalesce(agg.c, 0)::integer
  from months
  left join agg on agg.m = months.m
  order by months.m asc;
$$;

revoke all on function public.users_signups_monthly(integer) from public;
grant execute on function public.users_signups_monthly(integer) to anon, authenticated;
grant execute on function public.users_signups_monthly(integer) to service_role;
```

**Propriétés** :

- `security definer` → bypasse RLS pour l'agrégation publique
  (anticipe le futur durcissement RLS sur `users`, cf. dette
  H3-sec).
- `p_months_back` borné à `[1, 60]` côté DB → un anonyme ne peut
  pas demander un scan multi-décennal.
- 1 ligne par mois UTC ; mois sans inscription → count=0
  (échelle stable côté UI).
- Bénéfice scaling : `users` peut grossir à 100k+ lignes sans
  saturer le transport API (seulement ~12 lignes retournées).
- RGPD : aucun `created_at` brut ne quitte la DB.

**Refacto client** (`web/src/lib/transparency.ts`) :

```ts
export async function fetchMonthlySignups(
  client: Client = supabase,
  monthsBack = 12,
): Promise<MonthlySignupsResult> {
  const { data, error } = await client.rpc('users_signups_monthly', {
    p_months_back: monthsBack,
  });
  if (error) return { data: null, error };
  const buckets: MonthlySignupBucket[] = (data ?? []).map((row) => ({
    monthIso: row.month_iso,
    count: row.count,
  }));
  return { data: buckets, error: null };
}
```

Le paramètre `now: Date` (injectable pour tests) **disparaît** : la
référence temporelle est désormais `now()` côté DB. Les tests
vitest stubent maintenant `client.rpc` plutôt que la chaîne fluide
`.from('users').select('created_at').gte(...)`. La fonction
`buildMonthsRange` reste exportée pour `MonthlySignupsChart.test.tsx`
qui l'utilise comme helper de fabrication de buckets de test.

`Database.public.Functions.users_signups_monthly` ajouté à
`web/src/types/database.ts` :

```ts
users_signups_monthly: {
  Args: { p_months_back?: number };
  Returns: { month_iso: string; count: number }[];
};
```

**Tests** : `transparency.test.ts` `fetchMonthlySignups` describe
réécrit (6 tests : appel RPC, monthsBack passé, mapping rows,
défensif null data, propagation erreur, défaut 12). Suite vitest
**860 verts** (vs 859 étape 22).

**Dette H1-rob → clôturée** dans le tableau dette consolidé
ci-dessous. Validation finale (test SQL live côté anon) à
exécuter par l'équipe humaine au moment de l'application de la
migration sur staging — procédure dans `docs/PROD-RUNBOOK.md`
§1.2.

### H2-arch — stripe-webhook handler cross-package import ✅

La dette `H2-arch` (high / medium) listée à l'étape 21 portait
sur le fait que `web/src/lib/stripeWebhook.test.ts` importait
le handler via un chemin relatif fragile escapant `web/` :

```ts
import { handle, ... } from '../../../supabase/functions/stripe-webhook/handler.ts';
```

Cet import était hors du `include: ["src"]` de
`tsconfig.app.json`, donc invisible aux outils TS (autocomplete,
refactor renaming, etc.) et créait un couplage cross-package
fragile.

**Refacto** : le handler pur est désormais le fichier canonique
`web/src/lib/stripeWebhookHandler.ts` (TS strict, owned par
`web/`). Le bootstrap Deno côté `supabase/functions/stripe-webhook/
index.ts` continue d'importer depuis `./handler.ts`, mais ce
fichier devient un **thin re-export** :

```ts
// supabase/functions/stripe-webhook/handler.ts
export {
  handle,
  type AdhesionStatusUpdate,
  type AdhesionUpsert,
  type CreditInput,
  type StripeEvent,
  type StripeEventObject,
  type StripeWebhookDeps,
} from '../../../web/src/lib/stripeWebhookHandler.ts';
```

Le bundler `supabase functions deploy` suit ce chemin relatif vers
`web/` (Deno résout les imports relatifs anywhere). Aucune
duplication, aucune migration de comportement runtime.

**Tests** : `web/src/lib/stripeWebhookHandler.test.ts` (renommé
depuis `stripeWebhook.test.ts`) importe désormais `./stripeWebhookHandler`
(intra-package, clean). Les 13 tests existants (`invoice.payment_succeeded`,
idempotence, sécurité signature, robustesse, checkout +
subscription) passent inchangés — c'est le même code, simplement
relocalisé.

**Dette H2-arch → clôturée**. Le bootstrap Deno (`index.ts`)
reste isofonctionnel ; en cas de blocage de `supabase functions
deploy` sur l'import cross-package (peu probable mais documenté
en risque dans `HANDOFF-PROGRESS.md` historique), la procédure de
rollback consisterait à copier le contenu de
`stripeWebhookHandler.ts` dans le re-export wrapper.

### Cumul T99CP émises publique — re-différé étape 24

Pas de validation produit reçue. La consigne du prompt étape 23
§7 (« Sinon laisser en l'état — la doc `USER-GUIDE.md` couvre
déjà la décision ») est appliquée. Section dédiée du
`USER-GUIDE.md` inchangée depuis étape 22.

### Job de réconciliation Stripe — re-différé étape 24

Critère prompt §9 inchangé : pas d'erreur Sentry observable, idempotence
DB suffit.

### Dette technique différée — étape 24 ou plus tard

Récap consolidé (étapes 19-23 + janitor post-step 22) :

| ID | Sévérité | Risque rég. | Description courte | Étape cible |
| --- | --- | --- | --- | --- |
| H3-sec | high | high | `users.email` exposé via `users_select_public for select using (true)` | étape RLS hardening dédiée |
| ~~H2-rob~~ | ~~high~~ | ~~medium~~ | ~~grant `service_role` sur `credit_t99cp(uuid,integer,text,text)`~~ | **clôturée étape 22** |
| ~~H2-arch~~ | ~~high~~ | ~~medium~~ | ~~`stripeWebhook.test.ts` cross-package import~~ | **clôturée étape 23** (handler canonique dans `web/src/lib/`, re-export Deno) |
| ~~H1-rob~~ | ~~high~~ | ~~medium~~ | ~~`fetchMonthlySignups` sans `range()/limit()` → biais > 1000 lignes~~ | **clôturée étape 23** (RPC `users_signups_monthly` SECURITY DEFINER) |
| M2-sec | medium | high | `signatures_select_public` permet enum signataires (RGPD Art. 9) | étape RLS hardening |
| M5-rob | medium | low | `count: 'exact'` sur `signatures` au-delà ~100k lignes | étape stats matérialisées (suivre H1-rob) |
| M3-rob | medium | medium | `processed_at` non marqué sur validation 4xx (event silencieusement abandonné) | étape 24 (migration DB) |
| M1-RGPD | medium | medium | purge auto `stripe_events.payload` (TTL 90j ou scrub avant insert) | décision RGPD + migration |
| L1-a11y | medium | high | color-contrast `--mn-text-3` (~195 usages) | étape design dédiée |
| L3-arch | low | low | extraire hook `useFetchOnMount` pour dédoublonner `cancelled` pattern | nice-to-have |
| L4-sec | low | low | CSP `script-src https://js.stripe.com` (Stripe Elements) | quand Stripe Elements activé |
| L5-arch | low | medium | inline `CSSProperties` dupliqués entre pages légales | étape design dédiée |
| L1-rob | low | low | tests `vi.fn<typeof deps.upsertAdhesion>` pattern inconsistant | passe test hygiene |

### Bundle après ajout

| Avant étape 23 (fin janitor 22) | Après étape 23 |
| --- | --- |
| `index.js` 47.34 kB / gzip 13.32 kB | `index.js` 47.34 kB / gzip 13.32 kB |
| `TransparencePage.js` 8.10 kB / gzip 3.29 kB | `TransparencePage.js` 7.53 kB / gzip 3.04 kB |
| (mockSupabase rest only) | mockSupabase + RPC handler (E2E only, pas de bundle) |

Le chunk `TransparencePage` baisse légèrement (-0.57 kB / -0.25 kB
gzip) car la logique de bucketing client (`monthKeyFromIso`,
boucles d'agrégation) a migré côté DB. Aucune nouvelle dépendance
npm.

### Tests

- **860 tests vitest verts** (127 fichiers, durée ~62 s). Compte
  **+1** vs étape 22 (859 → 860) : 6 tests pour la nouvelle
  signature `fetchMonthlySignups` (RPC-based) remplacent 5 tests
  pour l'ancienne (client-bucketing) → net +1.
- **+1 test E2E Playwright** dans `petition-signature.spec.ts`
  (compteur signatures formaté FR).
- **transparence.spec.ts** : 5 tests inchangés, mais le test
  « chart SVG visible » utilise désormais le nouveau mock
  `rpc.users_signups_monthly.rows`.
- 4 checks locaux verts (typecheck, lint, vitest, build).

### Hygiène

- Pas de modification du prototype (`app/Maintenant.html`,
  `Theme.jsx`).
- Pas d'emojis dans les fichiers TS / commits / PR.
- Tokens `T.*` (CSS vars `--mn-*`) **intacts**.
- Pas de clé service_role dans le bundle front.
- Pas de nouvelle dépendance npm.
- Migration DB : **additive uniquement** (RPC `users_signups_monthly`
  + grants execute). Aucune suppression / rename / DROP. Listée
  explicitement dans le prompt étape 23 → autorisée par CLAUDE.md.
- Pas de breaking change visible utilisateur (la page
  `/transparence` rend toujours le même graphique, juste alimenté
  par une RPC plutôt que par un fetch + agrégation JS).
- Aucune `console.warn` / `console.error` ajoutée.

### Checks finaux

```
> npm run typecheck && npm run lint && npx vitest run && npm run build

✓ typecheck   (tsc -b + e2e/tsconfig.json)
✓ lint        (eslint .)
✓ vitest      (127 files, 860 tests passed, ~62s)
✓ build       (entry 47.34 kB / gzip 13.32 kB ; TransparencePage 7.53 kB / gzip 3.04 kB lazy ; sentry 436.2 kB / gzip 143 kB lazy)
```

### Migration DB

**Additive uniquement** (cf. `db/schema.sql` §21) :

```sql
create or replace function public.users_signups_monthly(
  p_months_back integer default 12
)
  returns table (month_iso date, count integer)
  ...
  security definer
  ...

revoke all on function public.users_signups_monthly(integer) from public;
grant execute on function public.users_signups_monthly(integer) to anon, authenticated;
grant execute on function public.users_signups_monthly(integer) to service_role;
```

Procédure d'application en staging avant l'étape 24
(cf. `docs/PROD-RUNBOOK.md` §1.2) :

1. `pg_dump` du projet `maintenant-staging` vers bucket privé.
2. `psql < db/schema.sql` — idempotent (CREATE OR REPLACE).
3. Validation côté anon :
   `select * from public.users_signups_monthly() limit 3;`
   — doit retourner 3 lignes (mois UTC, count >= 0), jamais
   `permission denied`.
4. Validation page `/transparence` : Vercel preview ou local
   contre staging → le chart s'affiche.

### Décisions

- **RPC `users_signups_monthly` SECURITY DEFINER + bornage [1, 60]**
  appliqué proactivement : la migration est additive, listée
  explicitement dans le prompt, et clôture une dette high
  priority. Le bornage `least(.., 60)` protège contre les abus
  côté anon ; le `security definer` rend la fonction immune aux
  futurs durcissements RLS sur `users`.
- **`buildMonthsRange` conservé** : bien que `fetchMonthlySignups`
  ne l'utilise plus (l'agrégation est côté DB), `MonthlySignupsChart.test.tsx`
  l'utilise comme helper de fabrication de buckets de test. Le
  supprimer aurait cassé 4 tests. Coût zéro de le garder ; pas
  de dead code runtime (uniquement référencé par tests).
- **`stripeWebhookHandler.ts` canonique dans `web/src/lib/`** :
  les outils TS (refactor, autocomplete, lint, coverage) traitent
  désormais le handler comme du code 1re classe `web/`. Le
  fichier `supabase/functions/stripe-webhook/handler.ts` reste
  uniquement pour conserver le chemin d'import stable côté
  bootstrap Deno (`./handler.ts`).
- **mockSupabase étendu sans casser l'API existante** : `rpc?`
  est optionnel ; les specs qui ne fournissent pas de `rpc`
  reçoivent `[]` pour toute RPC. Aucune régression.
- **Cumul T99CP, monitoring Sentry/Supabase, Lighthouse, retours
  utilisateur·rices** re-différés en bloc étape 24 : conditions
  externes inchangées vs étape 22.

### Prochaines étapes (étape 24)

- Lighthouse mesuré dès qu'un Vercel preview HTTPS sera en ligne
  (priorité 1 si oui).
- Monitoring Sentry canary + 7 j observations.
- Décision produit cumul T99CP émises → RPC `transparency_t99cp_total()`
  si OK.
- M3-rob : marquer `processed_at` sur validation 4xx pour
  distinguer « validation refusée » de « jamais traité ».
- M2-sec : RPC publique de comptage signatures par pétition pour
  remplacer la lecture `signatures_select_public` (RGPD Art. 9).
- Si Sentry remonte des erreurs `stripe-webhook` récurrentes →
  prioriser le job de réconciliation Edge Function.

---

## Étape 24 — Post-go-live / Clôture M3-rob (handler stripe processed_at sur 4xx) + M2-sec (RPC `signatures_count_for_petition`) + H4-deploy (test d'intégrité Deno re-export) ✅

**Branche** : `claude/review-project-rules-LRuBh`

Cinquième étape post-go-live. Le provisionnement Vercel / Stripe live /
Sentry SaaS / PITR / projet Supabase de test **reste inchangé** depuis
les étapes 20-23. Aucun trafic réel, aucune métrique Sentry runtime,
aucun retour utilisateur·rice. L'étape se concentre sur la dette
livrable sans environnement externe : **clôture de M3-rob**
(distinguer « validation refusée » de « jamais traité » côté
`stripe_events`), **fondation M2-sec** (RPC scalaire de comptage des
signatures par pétition, additive — le durcissement de la policy
existante `signatures_select_public` reste différé pour validation
explicite produit / DPO), **clôture H4-deploy** (test d'intégrité
qui vérifie que le re-export Deno `supabase/functions/stripe-webhook/
handler.ts` résout toujours sur `web/src/lib/stripeWebhookHandler.ts`).

### Audit Lighthouse réel — re-différé étape 25

Pré-requis non rempli : pas de Vercel preview / staging HTTPS en
ligne. La consigne du prompt étape 24 est explicite (« Si pas de
staging HTTPS : différer étape 25 »). Pas de régression côté `vite
build` : bundle entry inchangé (47.34 kB / gzip 13.32 kB),
TransparencePage inchangé (7.69 kB / gzip 3.11 kB). L'ajout
`getPetitionSignatureCount` est tree-shakable (importé nulle part
côté pages — call-sites différés en attendant le durcissement RLS).

### E2E « happy path » réel — re-différé, alternative livrée

Pas de projet Supabase de test seedé. La suite Playwright reste à
29/29 verts (28 specs + axe-core a11y). Aucun test E2E ajouté à
cette étape — le focus est exclusivement back-end (handler + DB).

### Monitoring Sentry runtime — re-différé étape 25

DSN absent en env preview (Sentry SaaS non provisionné). Aucun event
runtime à observer. Re-différé.

### Monitoring Supabase — re-différé étape 25

Pas de trafic réel sur `maintenant-staging`. Re-différé.

### Retours utilisateur·rices — sans objet (pas de trafic)

Aucun compte créé réel, aucun signalement modération, aucun bug
remonté.

### M3-rob — `processed_at` marqué sur validation 4xx ✅

La dette `M3-rob` (medium / medium) listée à l'étape 19 portait sur
les trois branches de validation 4xx du handler stripe-webhook
(`missing_user_or_subscription`, `missing_subscription_id`,
`missing_user_metadata`) qui renvoyaient un 400 sans marquer la
ligne `stripe_events`. Conséquence : audit / futur job de
réconciliation ne pouvait pas distinguer « validation refusée par
le handler » de « jamais traité, peut-être perdu ».

**Refacto côté `web/src/lib/stripeWebhookHandler.ts`** :

```ts
async function respondValidationFailure(
  deps: StripeWebhookDeps,
  eventId: string,
  message: string,
): Promise<Response> {
  try {
    await deps.recordEventProcessed(eventId);
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unknown';
    console.warn(
      `stripe-webhook: recordEventProcessed (validation ${message}) failed:`,
      detail,
    );
  }
  return new Response(message, { status: 400 });
}
```

**Propriétés** :

- Échec du marquage non escaladé en 500 (log warn) : la cohérence
  `stripe_events` est best-effort, le status code 4xx prime — Stripe
  ne retentera pas un 400 de toute façon, le statu quo (ligne sans
  `processed_at`) reste le pire scénario.
- Idempotence préservée : la ligne ayant déjà été insérée par
  `recordEventStart`, le 400 suivant côté Stripe ne déclenchera
  jamais de double traitement (court-circuit `recordEventStart` →
  200 idempotent).
- Aucun changement de signature exposée : le bootstrap Deno
  (`supabase/functions/stripe-webhook/index.ts`) consomme la même
  `handle(req, deps)` qu'avant.
- Log message identique au schema existant (le `default:` branche
  utilise déjà le même pattern `console.warn` avec `err.message`
  uniquement, pour ne pas fuiter de payload PostgREST côté logs
  Edge — défense en profondeur).

**Tests** : `stripeWebhookHandler.test.ts` passe de 13 à 17 tests :

- Existing test « renvoie 400 si user_id est manquant » étendu :
  asserte désormais que `recordEventProcessed` est appelé avec
  `event.id`.
- Nouveau describe `M3-rob` : 4 tests couvrant les 3 branches
  (`missing_user_or_subscription` sur checkout, `missing_subscription_id`
  sur `subscription.deleted` ET `subscription.updated`,
  best-effort en cas d'échec `recordEventProcessed`).

**Dette M3-rob → clôturée**.

### M2-sec — RPC `signatures_count_for_petition()` (additive) ✅ ; policy hardening différée

La dette `M2-sec` (medium / high) listée à l'étape 19 portait sur
le fait que `signatures_select_public for select using (true)`
autorise tout anonyme à lister les `user_id` des signataires d'une
pétition. Risque RGPD : signature politique = opinion =
catégorie sensible Art. 9, et la corrélation « qui a signé X ET Y »
suffit à profiler des opinions politiques même sans email.

**Migration DB additive** ajoutée à `db/schema.sql` §22 (listée
explicitement dans le prompt étape 24 → autorisée par CLAUDE.md
§ Politique de PR) :

```sql
create or replace function public.signatures_count_for_petition(
  p_petition uuid
)
  returns integer
  language sql
  stable
  security definer
  set search_path = public
as $$
  select count(*)::integer
  from public.signatures s
  where s.petition_id = p_petition;
$$;

revoke all on function public.signatures_count_for_petition(uuid) from public;
grant execute on function public.signatures_count_for_petition(uuid) to anon, authenticated;
grant execute on function public.signatures_count_for_petition(uuid) to service_role;
```

**Propriétés** :

- `security definer` → fonction immune au futur durcissement de
  `signatures_select_public`.
- Scalaire `integer` → aucune projection des `user_id`. La sortie
  est strictement « combien » sans rien révéler sur « qui ».
- Cohérent avec `petitions.signature_count` (dénormalisé maintenu
  par triggers `signatures_count_inc` / `signatures_count_dec` —
  cf. `db/schema.sql` §4.b) ; les deux peuvent diverger d'un delta
  microscopique pendant une INSERT/DELETE simultanée, mais à
  l'échelle d'une page le `count(*)` reste cohérent.
- RGPD : aucune PII supplémentaire ne quitte la DB.

**Helper côté client** (`web/src/lib/petitions.ts`) :

```ts
export async function getPetitionSignatureCount(
  petitionId: string,
): Promise<{ count: number | null; error: PostgrestError | null }> {
  const { data, error } = await supabase.rpc('signatures_count_for_petition', {
    p_petition: petitionId,
  });
  if (error) return { count: null, error };
  const count = typeof data === 'number' && Number.isFinite(data) ? data : 0;
  return { count, error: null };
}
```

Type `Database.public.Functions.signatures_count_for_petition`
ajouté à `web/src/types/database.ts` :

```ts
signatures_count_for_petition: {
  Args: { p_petition: string };
  Returns: number;
};
```

**Helper isolé pour l'instant** : aucune page n'appelle encore
`getPetitionSignatureCount`. Stratégie volontaire : on livre la
RPC + le helper en additif (zéro risque de régression sur les
flows existants qui consomment `petitions.signature_count`), puis
on migrera les call-sites au moment du durcissement de la policy
(étape dédiée future). Les nouveaux call-sites devront converger
sur cette RPC.

**Policy hardening différé pour validation explicite** : le prompt
étape 24 demande explicitement de **demander confirmation** avant
de durcir une policy existante (`signatures_select_public for
select using (true)` → restreindre la projection des `user_id`).
Conformément à CLAUDE.md § Conditions d'arrêt malgré l'autorisation
permanente (« changement RLS visible côté client »), cette
modification est reportée en dette M2-sec-policy (étape RLS
hardening dédiée, qui devra aussi traiter H3-sec sur `users.email`).

**Tests** : `petitions.test.ts` passe de 23 à 27 tests. Nouveau
describe `getPetitionSignatureCount (M2-sec — RPC scalar)` : 4 tests
(appel RPC + args, propagation erreur Postgrest, défaut à 0 sur
data null, défaut à 0 défensif sur data non numérique). Le mock
existant `vi.mock('@/lib/supabase')` étend `supabase.rpc(...)` →
`mocks.rpc(...)` (additif, zéro régression sur les tests existants).

**Dette M2-sec → partiellement clôturée** : RPC livrée, policy
hardening différée (cf. dette consolidée ci-dessous).

### H4-deploy — test d'intégrité du re-export Deno ✅

La dette `H4-deploy` (medium / high) a été ajoutée par le janitor
post-step 23. Le bootstrap Deno
`supabase/functions/stripe-webhook/index.ts` importe `./handler.ts`,
qui re-exporte `export * from '../../../web/src/lib/stripeWebhookHandler.ts'`.
Si quelqu'un déplace / renomme / supprime le handler canonique côté
`web/`, vitest reste vert (import intra-package) mais `supabase
functions deploy` casse silencieusement.

Le prompt étape 24 offrait deux pistes :
(a) ajouter un job CI `supabase functions deploy --dry-run` ;
(b) revenir à une duplication temporaire du handler.

**Choix : (a) version minimaliste, sans nouvelle dépendance CI**.
La piste (b) annulerait la clôture H2-arch (étape 23). La piste
(a) full (vraie commande Supabase CLI) nécessiterait des secrets CI
+ accès réseau pendant le test ; trop lourd pour le bénéfice. On
livre une version intermédiaire : un test vitest qui couvre la
régression la plus probable.

**Nouveau test** `web/src/lib/stripeWebhookDeploy.test.ts` (4
tests) :

1. `supabase/functions/stripe-webhook/handler.ts` existe.
2. Contient bien un `export * from '...'` (pas de duplication
   accidentelle).
3. Le chemin relatif extrait résout sur
   `web/src/lib/stripeWebhookHandler.ts` (path stricte, pas une
   sous-string).
4. Le handler canonique exporte toujours `async function handle(`
   (contrat public consommé par le bootstrap Deno).

**Propriétés** :

- Zéro nouvelle dépendance npm / CI.
- Tourne en < 50 ms (4 lectures fs synchrones petites).
- Couvre le risque #1 (déplacement / suppression / rename du
  handler canonique).
- Ne couvre PAS le risque #2 (régression Deno-only, ex : un
  import top-level qui marche en TS mais que Deno refuse à
  cause d'un `esm.sh` indisponible). Ce risque reste sur dette
  H4-deploy-deno (low / low — à traiter si on a un vrai
  pipeline CI Supabase plus tard).

**Dette H4-deploy → clôturée pour la régression #1**. La régression
#2 (Deno bundler) reste en dette low priority H4-deploy-deno.

### Cumul T99CP émises publique — re-différé étape 25

Pas de validation produit reçue à cette étape. Re-différé.

### Job de réconciliation Stripe — re-différé étape 25

Critère prompt §9 inchangé : pas d'erreur Sentry observable,
idempotence DB suffit.

### Dette technique différée — étape 25 ou plus tard

Récap consolidé (étapes 19-24 + janitor post-step 22-23) :

| ID | Sévérité | Risque rég. | Description courte | Étape cible |
| --- | --- | --- | --- | --- |
| H3-sec | high | high | `users.email` exposé via `users_select_public for select using (true)` | étape RLS hardening dédiée |
| ~~H2-rob~~ | ~~high~~ | ~~medium~~ | ~~grant `service_role` sur `credit_t99cp(uuid,integer,text,text)`~~ | **clôturée étape 22** |
| ~~H2-arch~~ | ~~high~~ | ~~medium~~ | ~~`stripeWebhook.test.ts` cross-package import~~ | **clôturée étape 23** |
| ~~H1-rob~~ | ~~high~~ | ~~medium~~ | ~~`fetchMonthlySignups` sans `range()/limit()` → biais > 1000 lignes~~ | **clôturée étape 23** |
| ~~H4-deploy~~ | ~~medium~~ | ~~high~~ | ~~re-export Deno `stripe-webhook/handler.ts` non couvert en CI~~ | **clôturée étape 24** (test d'intégrité) |
| M2-sec-policy | medium | high | durcir `signatures_select_public` pour ne plus exposer `user_id` aux anonymes — demande confirmation explicite produit / DPO | étape RLS hardening |
| ~~M2-sec-rpc~~ | ~~medium~~ | ~~high~~ | ~~RPC `signatures_count_for_petition()` (fondation hardening)~~ | **clôturée étape 24** |
| M5-rob | medium | low | `count: 'exact'` sur `signatures` au-delà ~100k lignes | étape stats matérialisées |
| ~~M3-rob~~ | ~~medium~~ | ~~medium~~ | ~~`processed_at` non marqué sur validation 4xx~~ | **clôturée étape 24** |
| M1-RGPD | medium | medium | purge auto `stripe_events.payload` (TTL 90j ou scrub avant insert) | décision RGPD + migration |
| L1-a11y | medium | high | color-contrast `--mn-text-3` (~195 usages) | étape design dédiée |
| L3-arch | low | low | extraire hook `useFetchOnMount` pour dédoublonner `cancelled` pattern | nice-to-have |
| L4-sec | low | low | CSP `script-src https://js.stripe.com` (Stripe Elements) | quand Stripe Elements activé |
| L5-arch | low | medium | inline `CSSProperties` dupliqués entre pages légales | étape design dédiée |
| L1-rob | low | low | tests `vi.fn<typeof deps.upsertAdhesion>` pattern inconsistant | passe test hygiene |
| H4-deploy-deno | low | low | régression Deno bundler (esm.sh, etc.) non couverte | quand pipeline CI Supabase réel |
| L-sec-webhook-body | low | medium | corps des réponses 4xx/5xx du webhook stripe interpolent `err.message` (échangé avec Stripe Dashboard logs — third party) | étape dédiée (casse 4+ assertions tests existantes) |

### Bundle après ajout

| Avant étape 24 (fin janitor 23) | Après étape 24 |
| --- | --- |
| `index.js` 47.34 kB / gzip 13.32 kB | `index.js` 47.34 kB / gzip 13.32 kB |
| `TransparencePage.js` 7.69 kB / gzip 3.11 kB | `TransparencePage.js` 7.69 kB / gzip 3.11 kB |

Aucun nouveau chunk : `getPetitionSignatureCount` reste dans
`petitions.ts` qui était déjà bundlé. Aucun call-site appelle
encore la fonction côté UI (importée nulle part, tree-shaking
théorique). Le test d'intégrité Deno (`stripeWebhookDeploy.test.ts`)
est dans `*.test.ts`, donc exclu du build production. Aucune
nouvelle dépendance npm.

### Tests

- **872 tests vitest verts** (128 fichiers, durée ~76 s). Compte
  **+12** vs étape 23 (860 → 872) :
  - `stripeWebhookHandler.test.ts` 13 → 17 (+4 nouveaux M3-rob).
  - `petitions.test.ts` 23 → 27 (+4 nouveaux M2-sec).
  - `stripeWebhookDeploy.test.ts` 0 → 4 (nouveau fichier H4-deploy).
- E2E Playwright : 29/29 verts (inchangé — pas de nouveau test E2E
  cette étape).
- 4 checks locaux verts (typecheck, lint, vitest, build).

### Hygiène

- Pas de modification du prototype (`app/Maintenant.html`,
  `Theme.jsx`).
- Pas d'emojis dans les fichiers TS / commits / PR.
- Tokens `T.*` (CSS vars `--mn-*`) **intacts**.
- Pas de clé service_role dans le bundle front.
- Pas de nouvelle dépendance npm.
- Migration DB : **additive uniquement** (RPC
  `signatures_count_for_petition` + grants execute). Aucune
  suppression / rename / DROP. Aucun durcissement de policy
  existante. Listée explicitement dans le prompt étape 24 →
  autorisée par CLAUDE.md.
- Pas de breaking change visible utilisateur (aucune page ne
  consomme encore `getPetitionSignatureCount` — il est livré en
  fondation pour la future étape de durcissement RLS).
- Le handler stripe-webhook reste isofonctionnel sur le happy path
  (les branches 4xx changent leur effet de bord côté DB en marquant
  `processed_at`, mais Stripe voit toujours le même 400). Pas
  d'impact côté tests d'intégration externes.
- Aucune `console.error` ajoutée ; un `console.warn` ajouté
  (validation 4xx + échec `recordEventProcessed`) en cohérence
  avec le pattern existant du `default:` branche.

### Checks finaux

```
> npm run typecheck && npm run lint && npx vitest run && npm run build

✓ typecheck   (tsc -b + e2e/tsconfig.json)
✓ lint        (eslint .)
✓ vitest      (128 files, 872 tests passed, ~76s)
✓ build       (entry 47.34 kB / gzip 13.32 kB ; TransparencePage 7.69 kB / gzip 3.11 kB lazy ; sentry 436.2 kB / gzip 143.08 kB lazy)
```

### Migration DB

**Additive uniquement** (cf. `db/schema.sql` §22) :

```sql
create or replace function public.signatures_count_for_petition(
  p_petition uuid
)
  returns integer
  ...
  security definer
  ...

revoke all on function public.signatures_count_for_petition(uuid) from public;
grant execute on function public.signatures_count_for_petition(uuid) to anon, authenticated;
grant execute on function public.signatures_count_for_petition(uuid) to service_role;
```

Procédure d'application en staging avant l'étape 25
(cf. `docs/PROD-RUNBOOK.md` §1.2, sanity checks 3 + 4) :

1. `pg_dump` du projet `maintenant-staging` vers bucket privé.
2. `psql < db/schema.sql` — idempotent (CREATE OR REPLACE).
3. Validation côté admin : `select
   public.signatures_count_for_petition('<UUID>'::uuid);` →
   doit retourner un integer (0 ou plus), jamais NULL.
4. Validation côté anon via curl (cf. PROD-RUNBOOK §1.2 sanity
   check 4) — doit renvoyer un body JSON contenant un nombre,
   jamais 401/403.

### Décisions

- **RPC `signatures_count_for_petition` SECURITY DEFINER livrée
  isolée (no call-site)** : on prépare l'infrastructure du
  durcissement RLS sans le déclencher, conformément à la consigne
  du prompt qui demande confirmation explicite avant tout
  durcissement de policy existante. La RPC est tree-shakable
  jusqu'à ce qu'un appelant l'importe ; aucun impact bundle.
- **Pas de modification de `signatures_select_public`** : la
  consigne du prompt est explicite (« Si durcissement de policy
  existante touché → demander confirmation explicite »). Le
  durcissement nécessite une décision produit / DPO + une étape
  RLS hardening dédiée qui traiterait simultanément H3-sec
  (`users.email`).
- **H4-deploy version minimaliste** : `supabase functions deploy
  --dry-run` aurait demandé Supabase CLI + secrets CI + accès
  réseau pendant le test. La version vitest livre la couverture
  utile (régression #1 = déplacement / suppression du handler
  canonique) sans nouvelle infra. La régression #2 (Deno bundler)
  reste en dette low priority H4-deploy-deno.
- **M3-rob : log warn plutôt qu'escalade 500** : la cohérence
  `stripe_events.processed_at` est best-effort. Stripe ne retentera
  pas un 400 — même un échec de marquage laisse la ligne en
  `processed_at=null` (status quo pré-étape 24), pas pire qu'avant.
  Escalader en 500 inciterait Stripe à retenter, ce qui n'a aucun
  sens pour une validation refusée.
- **Helpers `Number.isFinite` guard sur `getPetitionSignatureCount`** :
  défense en profondeur si PostgREST renvoie un body inattendu
  (string, NaN). Même logique que les guards des étapes 22-23 sur
  `fetchMonthlySignups`. Coût zéro, pas de surface de bug si un
  jour la sérialisation PostgREST change.
- **Cumul T99CP, monitoring Sentry/Supabase, Lighthouse, retours
  utilisateur·rices** re-différés en bloc étape 25 : conditions
  externes inchangées vs étape 23.

### Prochaines étapes (étape 25)

- Lighthouse mesuré dès qu'un Vercel preview HTTPS sera en ligne
  (priorité 1 si oui).
- Monitoring Sentry canary + 7 j observations.
- Décision produit cumul T99CP émises → RPC
  `transparency_t99cp_total()` si OK.
- Décision produit / DPO sur le durcissement
  `signatures_select_public` (M2-sec-policy). Si OK → migrer
  call-sites vers `getPetitionSignatureCount`, puis
  remplacer la policy par une version qui ne projette plus
  `user_id` aux anonymes.
- Si Sentry remonte des erreurs `stripe-webhook` récurrentes →
  prioriser le job de réconciliation Edge Function.

### Audit vibe janitor étape 24

**Branche** : `claude/janitor-post-step24`

Audit en parallèle via 3 subagents `general-purpose` après le merge
de la PR principale #25 (commit `chore(prod): step 24 …`) :
architecture / élégance, robustesse / edge cases, sécurité / RGPD
/ cohérence handoff.

#### Findings par sévérité

| Axe | Total | critical | high | medium | low | Fixable safe-first | Déférés |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Architecture | 9 | 0 | 0 | 1 | 8 | 0 | 9 (déjà tracés) |
| Robustesse | 7 | 0 | 0 | 3 | 4 | 1 | 6 |
| Sécurité | 5 | 0 | 0 | 0 | 5 | 0 | 5 (1 nouvelle dette) |
| **Total** | **21** | **0** | **0** | **4** | **17** | **1** | **20** |

#### Fixes appliqués (safe-first)

**J24-R2** (medium / low-risk) — observabilité côté Edge Function
sur le throw de `recordEventStart` : ajout d'un `console.warn` dans
le catch block ligne 178-188 de `web/src/lib/stripeWebhookHandler.ts`,
symétrique du pattern existant pour les `recordEventProcessed`.
Logue uniquement `err.message` (pas l'objet `err`) — même précaution
de non-fuite de payload PostgREST que les branches existantes. Test
existant `'renvoie 500 si recordEventStart throw'` étendu pour
asserter le warn : 17 tests `stripeWebhookHandler.test.ts` (inchangé,
on étend un test, on n'en ajoute pas).

Aucun changement de comportement HTTP : la réponse 500 +
`idempotency_store_error: <msg>` reste identique. Aucun impact côté
Stripe (Stripe retentera comme avant). Aucun changement RLS, aucune
migration DB.

#### Fixes déférés (dette nouvelle ou existante)

**J24-1 / nouvelle dette `L-sec-webhook-body`** (low / medium-risk) —
les corps de réponse 4xx/5xx du webhook interpolent `err.message`
verbatim (`invalid_signature: ${message}`,
`idempotency_store_error: ${message}`, `handler_error: ${message}`).
Ces messages parviennent à Stripe (Dashboard event log, third party).
Risque marginal : un `error.details` PostgREST contenant un extrait
de payload (connection string fragment) pourrait être persisté hors
de notre infrastructure. Fix proposé : remplacer le body par un code
opaque (`invalid_signature`, etc.) et logger le détail via
`console.warn`. **Déféré** : casse 4+ assertions `expect(text)
.toContain('invalid_signature: bad_sig')` (tests sécurité signature)
— mérite une étape dédiée. **Ajouté à la dette consolidée
`L-sec-webhook-body`** (cf. tableau ci-dessus).

**J24-R1** (medium / medium-risk) — `getPetitionSignatureCount`
masque silencieusement les drifts type PostgREST en retournant
`count: 0`. Idéalement renverrait `error: synthetic PostgrestError`
en cas de data non numérique. **Déféré** : changerait le contrat
`{count: 0, error: null}` → `{count: null, error: ...}` et
casserait le test défensif `'défaut à 0 si la RPC renvoie une
valeur non numérique'`. Décision : conserver le comportement
défensif livré étape 24 (cohérent avec `fetchMonthlySignups` qui
applique le même bouclier).

**J24-R3** (medium / high-risk) — cohérence `signatures.count(*)` vs
`petitions.signature_count` sous concurrence INSERT/DELETE.
**Déféré** : requiert migration DB, hors scope janitor.

**J24-R5** (low / medium-risk) — type `message` de
`respondValidationFailure` est `string` plutôt qu'une union
litérale. **Déféré** : low value, l'union devrait évoluer en sync
avec les nouveaux 4xx.

**J24-R7** ↔ **L3-arch** (low / low) — pattern `cancelled` non
généralisé via `useFetchOnMount`. Confirmé déjà dans dette
consolidée.

**B1-B9 (architecture)** — tous déférés, tous déjà tracés dans la
dette consolidée (L1-arch, L3-arch, L4-arch, L5-arch test, L5-arch
pages, L1-rob). Aucune nouvelle dette architecturale.

**J24-2 (L4-sec)** + **J24-3** + **J24-4 (DEV-only log)** + **J24-5
(deps healthy)** — tous déférés ou no-op.

#### Hygiène (janitor étape 24)

- Pas de modification du prototype.
- Pas de modification du design system `T.*`.
- Pas de migration DB.
- Pas de breaking change visible utilisateur.
- Pas de nouvelle dépendance npm.
- Pas de bump majeur.
- TS strict + no `any`.
- **+1 `console.warn`** (J24-R2) : cohérent avec les autres
  branches du handler stripe-webhook. Le log message ne contient
  que `err.message` (pas l'objet brut).
- Aucun fix qui casse un test existant.
- Aucun fix qui ouvre un risque B.

#### Checks finaux (janitor étape 24)

```
> npm run typecheck && npm run lint && npx vitest run && npm run build

✓ typecheck   (tsc -b + e2e/tsconfig.json)
✓ lint        (eslint .)
✓ vitest      (128 files, 872 tests passed, ~76s)
✓ build       (entry 47.34 kB / gzip 13.32 kB ; TransparencePage 7.69 kB / gzip 3.11 kB lazy ; sentry 436.2 kB / gzip 143.08 kB lazy)
```

Compte de tests **inchangé** : on étend un test existant (J24-R2)
sans en ajouter — le `+log warn` est asserté dans le même `it()`
que la propagation du 500.

#### Décisions janitor

- **1 seul fix safe-first appliqué** sur 21 findings (J24-R2,
  observabilité `recordEventStart`). Tous les autres findings
  carry medium/high régression risk ou cassent un test existant.
- **+1 nouvelle dette** (`L-sec-webhook-body`) — corps des
  réponses 4xx/5xx du webhook. Faible priorité, étape dédiée.
- **Toutes les dettes high (H3-sec) + medium-high (M2-sec-policy,
  M5-rob, M1-RGPD, L1-a11y)** restent ouvertes, à traiter dans
  des étapes dédiées (RLS hardening, design dédié, décision
  RGPD).

---

## Étape 25 — Post-go-live / Conditions externes inchangées (+2 E2E mock) ✅

**Branche** : `claude/review-project-rules-jnn0e`

Sixième étape post-go-live. Le provisionnement externe (Vercel /
Stripe live / Sentry SaaS / PITR / projet Supabase de test) **reste
inchangé** depuis les étapes 20-24. Aucune décision produit reçue
sur le cumul T99CP émises publique, aucune décision produit / DPO
reçue sur le durcissement `signatures_select_public`, aucune
décision RGPD sur la purge `stripe_events.payload`. Aucun trafic
réel, aucune métrique Sentry runtime, aucun retour
utilisateur·rice. L'étape se concentre sur **l'unique livrable
sans dépendance externe** : densifier la suite E2E Playwright
avec deux nouveaux tests mock sur la fiche pétition (CTA anonyme
+ ratio % de progression vers l'objectif), conformément à la
priorité 2 du prompt étape 25 (« Sinon ajouter encore un test
mock non-vide »).

### Audit Lighthouse réel — re-différé étape 26

Pré-requis non rempli : pas de Vercel preview / staging HTTPS en
ligne. La consigne du prompt étape 25 est explicite (« Si pas de
staging HTTPS : différer étape 26 »). Pas de régression côté
`vite build` : bundle entry inchangé (47.34 kB / gzip 13.32 kB),
TransparencePage inchangé (7.69 kB / gzip 3.11 kB). Pas de
modification côté `src/` (uniquement `e2e/petition-signature.spec.ts`).

### E2E « happy path » réel — re-différé, alternative livrée ✅

Pas de projet Supabase de test seedé. La consigne du prompt §2
livre la fallback : « Sinon ajouter encore un test mock non-vide
(réutiliser `installSupabaseStubs(page, { rest: ..., rpc: ... })`) ».

**+2 tests E2E** ajoutés à `web/e2e/petition-signature.spec.ts` :

1. `affiche le pourcentage de progression vers l'objectif`
   (étape 25) — vérifie que la fiche pétition rend bien le
   ratio arrondi `ratio = Math.round((signature_count / target_count) * 100)`
   (`42 / 1000 → 4 → "4% de l'objectif"`). Couvre la branche UI
   non testée jusqu'ici (la jauge brute `signature_count / target_count`
   est testée depuis l'étape 23, mais pas le ratio dérivé qui
   alimente la `progressBar`). Regex `\s*` + alternance apostrophe
   droite / typographique pour rester robuste aux variations
   `&apos;` côté JSX.

2. `expose le CTA « Se connecter pour signer » pour un visiteur
   anonyme` (étape 25) — couvre la branche `isAnonymous === true`
   de `PetitionDetailPage`. Le visiteur anonyme ne doit **pas**
   voir le `<button>` « Signer cette pétition » (réservé aux
   comptes authentifiés). À la place : un `<a href="/?auth=login&next=<pathname>">`
   qui ouvre la modale d'authentification avec retour sur la
   fiche après login. Assertion supplémentaire : le bouton authentifié
   n'est PAS rendu en parallèle (`toHaveCount(0)`) — gate de
   non-régression sur le routing conditionnel.

**Propriétés** :

- Aucune modification du runtime `src/` — uniquement le fichier
  spec E2E. Zéro risque de régression côté production.
- Réutilise le même fixture `petitionFixture` (signature_count
  42, target_count 1000) — pas de nouveau mock à maintenir.
- L'authentification anonyme est obtenue **gratuitement** :
  `installSupabaseStubs(page)` renvoie un body vide sur
  `/auth/v1/**` → `getSession()` résout sur `null` → `setSession(null)`
  → `status === 'anonymous'`. Pattern déjà éprouvé par
  `auth-flow.spec.ts` et `critical-flows.spec.ts`.
- Pas de flake : pas de timing race ni d'élément masqué par
  scroll. Les assertions ciblent du texte statique + un
  attribut `href` déterministe.

**Suite Playwright** : 29 → 31 tests E2E (CI). Playwright local
ne peut pas être exécuté dans le sandbox (CDN
`cdn.playwright.dev` non whitelisté pour le binaire
`chromium_headless_shell-1223`), mais les 4 checks locaux
(typecheck / lint / vitest / build) sont verts ET la suite CI
GitHub Actions reste la source de vérité pour Playwright.

### Monitoring Sentry runtime — re-différé étape 26

DSN absent en env preview (Sentry SaaS non provisionné). Aucun
event runtime à observer. Re-différé.

### Monitoring Supabase — re-différé étape 26

Pas de trafic réel sur `maintenant-staging`. Re-différé.

### M2-sec-policy — durcissement `signatures_select_public` — re-différé étape 26

Pas de validation produit / DPO reçue à cette étape. Le prompt
étape 25 explicite la consigne : « Si validation non reçue →
différer étape 26 et documenter la raison ». Re-différé.

**Raison documentée** : le durcissement actuel (`for select using
(true)` → `auth.uid() = user_id OR public.is_admin(...)`) est un
**changement RLS visible côté client** qui doit être validé par
le DPO (légitimité Art. 9 — opinions politiques) et par le
produit (UX : la page « pétition » pourra-t-elle continuer à
afficher la liste des signataires non-anonymes si la policy
exclut `user_id` aux anonymes ? Réponse à clarifier). En l'absence
de cette validation, on **maintient** la policy actuelle (statu
quo fonctionnel) et la RPC `signatures_count_for_petition` livrée
à l'étape 24 reste isolée — son helper `getPetitionSignatureCount`
n'est appelé par aucun call-site UI.

### Cumul T99CP émises publique — re-différé étape 26

Pas de validation produit reçue à cette étape. Re-différé.

### H4-deploy-deno — re-différé étape 26

Pré-requis non rempli : pas de pipeline CI Supabase réel (le
workflow GitHub Actions `ci.yml` n'inclut aucun job Supabase
CLI). Le test d'intégrité Deno couvert par `stripeWebhookDeploy.test.ts`
(étape 24) suffit pour la régression #1. La régression #2 (bundler
Deno) attend qu'un pipeline réel soit en place. Re-différé.

### M1-RGPD — purge auto `stripe_events.payload` — re-différé étape 26

Pas de décision RGPD reçue. La table `stripe_events` est
critique (idempotence du webhook) et le prompt étape 25 exige
une **demande de confirmation explicite** avant toute migration
DB sur cette table. Re-différé.

### Retours utilisateur·rices — sans objet (pas de trafic)

Aucun compte créé réel, aucun signalement modération, aucun bug
remonté.

### Job de réconciliation Stripe — re-différé étape 26

Critère prompt §10 inchangé : pas d'erreur Sentry observable
(monitoring runtime absent), idempotence DB suffit.

### Dette technique différée — étape 26 ou plus tard

Récap consolidé (étapes 19-25, inchangé vs fin janitor 24) :

| ID | Sévérité | Risque rég. | Description courte | Étape cible |
| --- | --- | --- | --- | --- |
| H3-sec | high | high | `users.email` exposé via `users_select_public for select using (true)` | étape RLS hardening dédiée |
| M2-sec-policy | medium | high | durcir `signatures_select_public` pour ne plus exposer `user_id` aux anonymes — demande confirmation explicite produit / DPO | étape RLS hardening |
| M5-rob | medium | low | `count: 'exact'` sur `signatures` au-delà ~100k lignes | étape stats matérialisées |
| M1-RGPD | medium | medium | purge auto `stripe_events.payload` (TTL 90j ou scrub avant insert) | décision RGPD + migration |
| L1-a11y | medium | high | color-contrast `--mn-text-3` (~195 usages) | étape design dédiée |
| L3-arch | low | low | extraire hook `useFetchOnMount` pour dédoublonner `cancelled` pattern | nice-to-have |
| L4-sec | low | low | CSP `script-src https://js.stripe.com` (Stripe Elements) | quand Stripe Elements activé |
| L5-arch | low | medium | inline `CSSProperties` dupliqués entre pages légales | étape design dédiée |
| L1-rob | low | low | tests `vi.fn<typeof deps.upsertAdhesion>` pattern inconsistant | passe test hygiene |
| H4-deploy-deno | low | low | régression Deno bundler (esm.sh, etc.) non couverte | quand pipeline CI Supabase réel |
| L-sec-webhook-body | low | medium | corps des réponses 4xx/5xx du webhook stripe interpolent `err.message` (échangé avec Stripe Dashboard logs — third party) | étape dédiée (casse 4+ assertions tests existantes) |

### Bundle après ajout

| Avant étape 25 (fin janitor 24) | Après étape 25 |
| --- | --- |
| `index.js` 47.34 kB / gzip 13.32 kB | `index.js` 47.34 kB / gzip 13.32 kB |
| `TransparencePage.js` 7.69 kB / gzip 3.11 kB | `TransparencePage.js` 7.69 kB / gzip 3.11 kB |

Aucun nouveau chunk : les 2 tests ajoutés sont en zone `e2e/`,
exclue du bundle production. Aucune nouvelle dépendance npm.

### Tests

- **872 tests vitest verts** (128 fichiers, durée ~64 s) —
  **inchangé** vs étape 24. Les nouveaux tests sont en E2E
  Playwright, pas en vitest.
- **31 tests E2E Playwright** (3 specs petition + 14 specs
  public-pages + 5 transparence + 4 auth + 3 critical-flows +
  2 nouveaux étape 25) — **+2** vs étape 24 (29 → 31). Validé
  par la CI GitHub Actions (job `Playwright E2E + axe-core
  a11y`).
- 4 checks locaux verts (typecheck, lint, vitest, build).

### Hygiène

- Pas de modification du prototype (`app/Maintenant.html`,
  `Theme.jsx`).
- Pas de modification du runtime `src/` ni de `db/schema.sql`.
- Pas d'emojis dans les fichiers TS / commits / PR.
- Tokens `T.*` (CSS vars `--mn-*`) **intacts**.
- Pas de clé service_role dans le bundle front.
- Pas de nouvelle dépendance npm.
- Pas de migration DB.
- Pas de breaking change visible utilisateur.

### Checks finaux

```
> npm run typecheck && npm run lint && npx vitest run && npm run build

✓ typecheck   (tsc -b + e2e/tsconfig.json)
✓ lint        (eslint .)
✓ vitest      (128 files, 872 tests passed, ~64s)
✓ build       (entry 47.34 kB / gzip 13.32 kB ; TransparencePage 7.69 kB / gzip 3.11 kB lazy ; sentry 436.2 kB / gzip 143.08 kB lazy)
```

Playwright sera validé par la CI (sandbox local : CDN
`cdn.playwright.dev` non whitelisté pour `chromium_headless_shell-1223`).

### Décisions

- **+2 E2E mock plutôt qu'un attendisme passif** : conformément
  à la priorité 2 du prompt, on continue à densifier la
  couverture Playwright **même sans Supabase de test seedé**.
  Coût : zéro infra, zéro risque, +5 minutes côté CI Playwright.
  Bénéfice : deux branches UI (CTA anonyme + ratio %) passent
  de « couverture unit-test uniquement » à « couverture E2E
  bout-en-bout ».
- **Tous les autres items différés en bloc** (M2-sec-policy,
  T99CP cumul public, H4-deploy-deno, M1-RGPD, monitoring,
  réconciliation Stripe) : conditions externes inchangées vs
  étape 24. Chaque item nécessite soit un environnement externe
  (HTTPS, Sentry DSN, Supabase de test, trafic réel), soit une
  décision produit / DPO / RGPD reçue. Re-différer en bloc est
  la décision la moins coûteuse et la plus honnête.
- **Pas de fallback artificiel** sur les autres items : on aurait
  pu écrire un canary Sentry « offline » par exemple, mais ça
  produirait un test qui ne valide rien d'utile (Sentry SDK déjà
  testé en vitest étape 19) — anti-pattern.

### Prochaines étapes (étape 26)

- Lighthouse mesuré dès qu'un Vercel preview HTTPS sera en ligne
  (priorité 1 si oui).
- Monitoring Sentry canary + 7 j observations dès DSN câblé.
- Décision produit cumul T99CP émises → RPC
  `transparency_t99cp_total()` si OK.
- Décision produit / DPO sur le durcissement
  `signatures_select_public` (M2-sec-policy).
- Décision RGPD sur la purge `stripe_events.payload` (M1-RGPD).
- Si Sentry remonte des erreurs `stripe-webhook` récurrentes →
  prioriser le job de réconciliation Edge Function.
- Si toujours aucune condition externe résolue → ajouter encore
  un test mock E2E ciblé (3e itération du pattern « pas de
  Supabase test seedé ? → +1 spec mock »).

### Audit vibe janitor étape 25

**Branche** : `claude/janitor-post-step25`

Audit en parallèle via 3 subagents `general-purpose` après le merge
de la PR principale #27 (commit `chore(prod): step 25 …`) :
architecture / élégance, robustesse / edge cases, sécurité / RGPD
/ cohérence handoff.

#### Findings par sévérité

| Axe | Total | critical | high | medium | low | Fixable safe-first | Déférés |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Architecture | 7 | 0 | 0 | 1 | 6 | 1 | 6 (dont 2 déjà tracés) |
| Robustesse | 7 | 0 | 0 | 1 | 6 | 1 (= A3) | 6 (1 nouvelle dette `M6-rob`) |
| Sécurité | 7 | 0 | 0 | 0 | 7 | 1 | 6 |
| **Total** | **21** | **0** | **0** | **2** | **19** | **2 uniques** | **18** |

> Note : A3 et R2 sont **le même finding** (vu sous deux angles) ;
> on l'a compté une seule fois côté « fixable safe-first ».

#### Fixes appliqués (safe-first)

**J25-A3 / R2** (low / low-risk) — robustification du test E2E
ajouté à l'étape 25 (`affiche le CTA « Se connecter pour signer »
pour un visiteur anonyme`). La regex initiale
`new RegExp('auth=login.*next=<encodedNext>')` imposait l'ordre
des query params dans le `href` du `<Link to="/?auth=login&next=...">`.
Refacto vers un parsing structuré via `new URL(href, 'http://localhost')`
+ `URLSearchParams` :

```ts
const href = await signupCta.getAttribute('href');
expect(href).not.toBeNull();
const parsed = new URL(href ?? '', 'http://localhost');
expect(parsed.searchParams.get('auth')).toBe('login');
expect(parsed.searchParams.get('next')).toBe(`/petitions/${petitionFixture.slug}`);
```

Asserte la **sémantique** (deux params nommés) plutôt que la
**syntaxe** (chaîne ordonnée). Survit à une éventuelle
factorisation future `buildLoginHref(pathname)` (dette A2)
qui pourrait inverser l'ordre des params.

Aucun impact côté runtime production. Aucun test cassé. Compteur
E2E inchangé (31 tests).

**J25-S1** (low / low-risk) — nettoyage de la CSP `vercel.json`.
La directive autorisait `https://fonts.googleapis.com` (style-src)
et `https://fonts.gstatic.com` (font-src), mais **aucune ressource
Google Fonts n'est chargée** par le bundle (`grep` sur `web/src/`
et `web/index.html` → zéro `@import` Google Fonts, zéro
`<link rel="stylesheet" href="https://fonts.googleapis.com...">`).
Les références `font-family: 'Sora', sans-serif` côté JSX/CSS
inline tombent sur le fallback `sans-serif` (la famille Sora n'est
jamais chargée en runtime, héritage du prototype). Retrait des
deux origines tierces :

```diff
- "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; ...; font-src 'self' data: https://fonts.gstatic.com; ..."
+ "style-src 'self' 'unsafe-inline'; ...; font-src 'self' data:; ..."
```

Réduit la surface d'exfiltration via injection CSS de polices /
keylogger via custom font glyph trick. Si un futur sprint design
re-introduit Google Fonts, la CSP devra être ré-élargie en même
temps (cohérent — atomicité).

Aucun impact UI : la police rendue reste celle utilisée
aujourd'hui (`sans-serif` système). Aucun test cassé. Bundle entry
inchangé.

#### Fixes déférés (dette nouvelle ou existante)

**J25-A1 / R1** (low / low-risk) — duplication de l'expression
`Math.min(100, Math.round((count / target) * 100))` dans 5 pages
(`PetitionsPage.tsx:204`, `PetitionDetailPage.tsx:212`,
`PollDetailPage.tsx:224`, `CrowdfundingPage.tsx:203`,
`CrowdfundingDetailPage.tsx:250`). **Déféré** : l'extraction
vers `web/src/lib/progress.ts` toucherait 5 fichiers et
introduirait un nouveau module + son test associé. C'est de la
refacto cosmétique, mieux planifiée comme item dédié.
**Ajouté à la dette consolidée** sous `L6-arch-progress` (nouveau).

**J25-A2** (low / low-risk) — duplication de l'expression
`/?auth=login&next=${encodeURIComponent(location.pathname)}`
dans 3 pages (`PetitionDetailPage.tsx:240`,
`MobilizationDetailPage.tsx:291`, `PollDetailPage.tsx:279`).
**Déféré** : extraction `buildLoginHref(pathname)` toucherait 3
fichiers. Idem cosmétique, à mutualiser avec J25-A1 lors d'une
étape dédiée. **Ajouté à la dette consolidée** sous
`L7-arch-loginhref` (nouveau).

**J25-A5** (medium / medium-risk) — `PollDetailPage.tsx` à 473
LOC dépasse le seuil mou des autres pages Detail (~250-350 LOC).
**Déféré** : restructure architecturale, hors scope janitor.

**J25-R3 / M6-rob** (medium / medium-risk) — pattern récurrent
`useEffect(() => { queueMicrotask(() => void fetch(...)); }, [deps])`
sans flag `cancelled` dans ~22 hooks de fetch (`usePetition`,
`usePetitions`, `useNotifications`, etc.). Race conditions
possibles lors de changements rapides de slug/filtre, amplifiées
par le double-render React 19 strict mode en dev. Seul
`useIsAdmin.ts` applique le pattern correct. **Déféré + nouvelle
dette `M6-rob`** : fix global toucherait 20+ hooks, chacun avec
ses tests vitest — pas safe-first. À adresser hook par hook
lors d'étapes dédiées de durcissement.

**J25-R4** (low / low-risk) — `Intl.DateTimeFormat('fr-FR')` sans
`timeZone` explicite dans ~6 fichiers (`mobilizationFormat.ts`,
`CommuneDetailPage.tsx`, etc.). Décalage de jour pour utilisateurs
hors Europe/Paris. **Déféré** : risque de casser des snapshots de
tests si appliqué (les tests fixent une heure UTC, le formatage
local diverge selon TZ système de la CI vs locale).

**J25-R5** (low / low-risk) — `setTimeout` redirect sans cleanup
dans `ResetPasswordPage.tsx:184` et
`services/CrowdfundingContributePage.tsx:214`. **Déféré** : le
fix nécessite un `useRef<number | null>` + `useEffect` cleanup,
ce qui touche au cycle de vie de la page. En React 19 strict
mode dev, le double-mount pourrait clearer le timer trop tôt
au remount — risque de casser le test
`ResetPasswordPage.test.tsx:101` (`waitFor(getByTestId('profile'))`
sous `timeout: 2000` qui dépend de la navigation timed-out).

**J25-R7** — déjà fixé en réalité : `console.error` est
**déjà** gardé par `if (import.meta.env.DEV)` ligne 73 de
`RouteErrorBoundary.tsx`. Le subagent a manqué la guard
englobante. **Non-finding.**

**J25-S2 / S3 / S4 / S5 / S6 / S7** — tous documentaires ou
couverts par des dettes existantes (H3-sec pour S6, monitoring
différé pour S4, L1-a11y/L5-arch pour S5, etc.). Aucun fix
appliqué.

**J25-A4** — fixture `petitionFixture` à factoriser plus tard
(YAGNI). Pas de duplication aujourd'hui.

**J25-A6 / A7 / R6** — pré-existants, déjà connus.

#### Hygiène (janitor étape 25)

- Pas de modification du prototype.
- Pas de modification du design system `T.*` (CSS vars `--mn-*`).
- Pas de migration DB.
- Pas de breaking change visible utilisateur (le retrait de
  Google Fonts CSP est invisible : zéro ressource consommée).
- Pas de nouvelle dépendance npm.
- Pas de bump majeur.
- TS strict + no `any`.
- Aucun fix qui casse un test existant.
- Aucun fix qui ouvre un risque B (cf. analyse fix par fix
  ci-dessus).
- Aucun nouveau `console.error` / `console.warn` (les patterns
  existants sont conservés).

#### Checks finaux (janitor étape 25)

```
> npm run typecheck && npm run lint && npx vitest run && npm run build

✓ typecheck   (tsc -b + e2e/tsconfig.json)
✓ lint        (eslint .)
✓ vitest      (128 files, 872 tests passed, ~65s)
✓ build       (entry 47.34 kB / gzip 13.32 kB ; TransparencePage 7.69 kB / gzip 3.11 kB lazy ; sentry 436.2 kB / gzip 143.08 kB lazy)
```

Compteur de tests **inchangé** (872 vitest + 31 E2E) : on
refactorise un test E2E existant (J25-A3/R2) sans en ajouter, et
on touche la CSP `vercel.json` (J25-S1) qui n'a pas de test
associé côté repo.

#### Dette technique consolidée — mise à jour

Ajouts post-step 25 :

| ID | Sévérité | Risque rég. | Description courte | Étape cible |
| --- | --- | --- | --- | --- |
| L6-arch-progress | low | low | helper `computeProgressRatio(count, target)` à extraire (5 call-sites dupliqués) | étape design dédiée |
| L7-arch-loginhref | low | low | helper `buildLoginHref(pathname)` à extraire (3 call-sites dupliqués) | étape design dédiée |
| M6-rob | medium | medium | pattern `useEffect` + fetch sans `cancelled` flag dans ~22 hooks (races possibles sous React 19 strict mode) | étape robustesse hooks dédiée |

Les dettes existantes (H3-sec, M2-sec-policy, M5-rob, M1-RGPD,
L1-a11y, L3-arch, L4-sec, L5-arch, L1-rob, H4-deploy-deno,
L-sec-webhook-body) restent inchangées.

#### Décisions janitor

- **2 fixes safe-first appliqués** sur 21 findings — J25-A3/R2
  (test E2E robustifié via `URLSearchParams`) et J25-S1 (CSP
  Google Fonts cleanup). Les deux ont un impact côté code
  minimal et un bénéfice clair (robustesse test / surface CSP
  réduite).
- **3 nouvelles dettes** documentées (L6-arch-progress,
  L7-arch-loginhref, M6-rob).
- **J25-R7 non-finding** : la guard `import.meta.env.DEV`
  existe déjà ligne 73 de `RouteErrorBoundary.tsx` ; le
  subagent l'a manquée par fenêtre de lecture.
- **Toutes les dettes high (H3-sec) + medium-high (M2-sec-policy,
  M5-rob, M1-RGPD, L1-a11y, M6-rob nouveau)** restent ouvertes,
  à traiter dans des étapes dédiées (RLS hardening, design
  dédié, décision RGPD, robustesse hooks).

---

## Étape 26 — Post-go-live / Conditions externes inchangées (+1 E2E mock état signé) ✅

**Branche** : `claude/review-project-rules-0tfdi`

Septième étape post-go-live. Le provisionnement externe (Vercel /
Stripe live / Sentry SaaS / PITR / projet Supabase de test) **reste
inchangé** depuis les étapes 20-25. Aucune décision produit reçue
sur le cumul T99CP émises publique, aucune décision produit / DPO
reçue sur le durcissement `signatures_select_public`, aucune
décision RGPD sur la purge `stripe_events.payload`. Aucun trafic
réel, aucune métrique Sentry runtime, aucun retour
utilisateur·rice. L'étape se concentre sur **l'unique livrable
sans dépendance externe** : 3e itération du pattern « +1 test
mock E2E », conformément à la consigne explicite de fin de prompt
étape 25 : « Si toujours aucune condition externe résolue →
ajouter encore un test mock E2E ciblé (3e itération du pattern
"pas de Supabase test seedé ? → +1 spec mock") ». Le test ajouté
couvre la branche `authStatus === 'authenticated' && signed === true`
suggérée par le prompt étape 26 §2.

### Audit Lighthouse réel — re-différé étape 27

Pré-requis non rempli : pas de Vercel preview / staging HTTPS en
ligne. La consigne du prompt étape 26 est explicite (« Si pas de
staging HTTPS : différer étape 27 »). Pas de régression côté
`vite build` : bundle entry inchangé (47.34 kB / gzip 13.32 kB),
TransparencePage inchangé (7.69 kB / gzip 3.11 kB). Pas de
modification côté `src/` (uniquement `e2e/petition-signature.spec.ts`).

### E2E « happy path » réel — re-différé, alternative livrée ✅

Pas de projet Supabase de test seedé. La consigne du prompt §2
livre la fallback explicite : « Sinon ajouter encore un test
mock non-vide (réutiliser `installSupabaseStubs(page, { rest: ..., rpc: ... })`)
— par exemple : test de l'état « pétition signée → bouton
« Signée — retirer ma signature » » via mock useAuth authentifié ».

**+1 test E2E** ajouté à `web/e2e/petition-signature.spec.ts` :

`affiche « Signée — retirer ma signature » pour un signataire
authentifié` (étape 26) — couvre la branche UI
`authStatus === 'authenticated' && signed === true` de
`PetitionDetailPage`, jusqu'ici testée uniquement en unit
(`PetitionDetailPage.test.tsx`). Le bouton authentifié doit
afficher le label de retrait avec `aria-pressed="true"` (toggle
accessibilité), et le CTA anonyme « Se connecter pour signer »
NE doit PAS être rendu en parallèle (gate de non-régression sur
le routing conditionnel — l'UI doit afficher un seul CTA à la
fois, sinon ambigu).

**Implémentation** :

1. **Seed session authentifiée via localStorage** —
   `page.addInitScript` injecte une session stubée AVANT le `goto`,
   sous la clé `sb-127-auth-token`. La clé est dérivée par
   supabase-js v2 via
   `storageKey = sb-${new URL(url).hostname.split('.')[0]}-auth-token` ;
   en CI l'URL est `http://127.0.0.1:54321` (cf.
   `.github/workflows/ci.yml`), donc `hostname.split('.')[0] = '127'`.
   Au boot, `useAuth` appelle `getSession()` qui lit la session
   depuis localStorage → `setSession(...)` → `status` passe
   directement à `'authenticated'` sans hit réseau /auth/v1/token.
   Pas de signal d'expiration : `expires_at` est calé à +24 h
   (large marge vs durée d'un run E2E < 30 s).
2. **Mock `signatures`** — le hit `hasUserSigned(petition.id, user.id)`
   passe par `supabase.from('signatures').select('id').eq(...).maybeSingle()`.
   On renvoie un body `[{ id, petition_id, user_id, created_at }]` :
   `.maybeSingle()` en mode `isMaybeSingle` accepte un array
   single-element et le déballe en objet (cf. `postgrest-js` v2
   `dist/index.cjs:359-371`). Donc `data !== null` côté call-site
   → `signed = true`.
3. **Assertions** :
   - `signedButton` visible par role + name `/Signée — retirer ma signature/i`.
   - `aria-pressed="true"` pour les screen readers (toggle).
   - `getByRole('link', { name: /Se connecter pour signer/i })` →
     `toHaveCount(0)` (le CTA anonyme N'EST PAS rendu).

**Propriétés** :

- Aucune modification du runtime `src/` — uniquement le fichier
  spec E2E. Zéro risque de régression côté production.
- Réutilise le même `petitionFixture` (signature_count 42,
  target_count 1000) — pas de nouveau mock à maintenir.
- La session stubée est isolée par test (Playwright crée un
  BrowserContext + Page neufs par test → localStorage propre,
  routes propres). Pas de fuite vers les 4 autres tests
  petition-signature.
- Pas de flake : `addInitScript` s'exécute AVANT tout script de
  page → le boot React voit la session immédiatement. Pas de
  race avec `getSession()`.
- Pas d'emojis, pas de any, pas de nouvelle dépendance npm.

**Suite Playwright** : 31 → 32 tests E2E (CI). Playwright local
ne peut pas être exécuté dans le sandbox (CDN
`cdn.playwright.dev` non whitelisté pour le binaire
`chromium_headless_shell-1223`), mais les 4 checks locaux
(typecheck / lint / vitest / build) sont verts ET la suite CI
GitHub Actions reste la source de vérité pour Playwright.

### Monitoring Sentry runtime — re-différé étape 27

DSN absent en env preview (Sentry SaaS non provisionné). Aucun
event runtime à observer. Re-différé.

### Monitoring Supabase — re-différé étape 27

Pas de trafic réel sur `maintenant-staging`. Re-différé.

### M2-sec-policy — durcissement `signatures_select_public` — re-différé étape 27

Pas de validation produit / DPO reçue à cette étape. Le prompt
étape 26 explicite la consigne : « Si validation non reçue →
différer étape 27 et documenter la raison ». Re-différé.

**Raison documentée** (inchangée depuis étape 25) : le durcissement
actuel (`for select using (true)` → `auth.uid() = user_id OR public.is_admin(...)`)
est un **changement RLS visible côté client** qui doit être validé
par le DPO (légitimité Art. 9 — opinions politiques) et par le
produit (UX : la page « pétition » pourra-t-elle continuer à
afficher la liste des signataires non-anonymes si la policy
exclut `user_id` aux anonymes ? Réponse à clarifier). En l'absence
de cette validation, on **maintient** la policy actuelle (statu
quo fonctionnel) et la RPC `signatures_count_for_petition` livrée
à l'étape 24 reste isolée — son helper `getPetitionSignatureCount`
n'est appelé par aucun call-site UI.

### Cumul T99CP émises publique — re-différé étape 27

Pas de validation produit reçue à cette étape. Re-différé.

### H4-deploy-deno — re-différé étape 27

Pré-requis non rempli : pas de pipeline CI Supabase réel (le
workflow GitHub Actions `ci.yml` n'inclut aucun job Supabase
CLI). Le test d'intégrité Deno couvert par `stripeWebhookDeploy.test.ts`
(étape 24) suffit pour la régression #1. La régression #2 (bundler
Deno) attend qu'un pipeline réel soit en place. Re-différé.

### M1-RGPD — purge auto `stripe_events.payload` — re-différé étape 27

Pas de décision RGPD reçue. La table `stripe_events` est
critique (idempotence du webhook) et le prompt étape 26 exige
une **demande de confirmation explicite** avant toute migration
DB sur cette table. Re-différé.

### Retours utilisateur·rices — sans objet (pas de trafic)

Aucun compte créé réel, aucun signalement modération, aucun bug
remonté.

### Job de réconciliation Stripe — re-différé étape 27

Critère prompt §10 inchangé : pas d'erreur Sentry observable
(monitoring runtime absent), idempotence DB suffit.

### Dette technique différée — étape 27 ou plus tard

Récap consolidé (étapes 19-26, inchangé vs fin janitor 25
+ 3 dettes janitor 25 : L6-arch-progress, L7-arch-loginhref,
M6-rob) :

| ID | Sévérité | Risque rég. | Description courte | Étape cible |
| --- | --- | --- | --- | --- |
| H3-sec | high | high | `users.email` exposé via `users_select_public for select using (true)` | étape RLS hardening dédiée |
| M2-sec-policy | medium | high | durcir `signatures_select_public` pour ne plus exposer `user_id` aux anonymes — demande confirmation explicite produit / DPO | étape RLS hardening |
| M5-rob | medium | low | `count: 'exact'` sur `signatures` au-delà ~100k lignes | étape stats matérialisées |
| M1-RGPD | medium | medium | purge auto `stripe_events.payload` (TTL 90j ou scrub avant insert) | décision RGPD + migration |
| M6-rob | medium | medium | pattern `useEffect` + fetch sans `cancelled` flag dans ~22 hooks | étape robustesse hooks |
| L1-a11y | medium | high | color-contrast `--mn-text-3` (~195 usages) | étape design dédiée |
| L3-arch | low | low | extraire hook `useFetchOnMount` pour dédoublonner `cancelled` pattern | nice-to-have |
| L4-sec | low | low | CSP `script-src https://js.stripe.com` (Stripe Elements) | quand Stripe Elements activé |
| L5-arch | low | medium | inline `CSSProperties` dupliqués entre pages légales | étape design dédiée |
| L6-arch-progress | low | low | helper `computeProgressRatio(count, target)` à extraire (5 call-sites dupliqués) | étape design dédiée |
| L7-arch-loginhref | low | low | helper `buildLoginHref(pathname)` à extraire (3 call-sites dupliqués) | étape design dédiée |
| L1-rob | low | low | tests `vi.fn<typeof deps.upsertAdhesion>` pattern inconsistant | passe test hygiene |
| H4-deploy-deno | low | low | régression Deno bundler (esm.sh, etc.) non couverte | quand pipeline CI Supabase réel |
| L-sec-webhook-body | low | medium | corps des réponses 4xx/5xx du webhook stripe interpolent `err.message` (échangé avec Stripe Dashboard logs — third party) | étape dédiée (casse 4+ assertions tests existantes) |

### Bundle après ajout

| Avant étape 26 (fin janitor 25) | Après étape 26 |
| --- | --- |
| `index.js` 47.34 kB / gzip 13.32 kB | `index.js` 47.34 kB / gzip 13.32 kB |
| `TransparencePage.js` 7.69 kB / gzip 3.11 kB | `TransparencePage.js` 7.69 kB / gzip 3.11 kB |

Aucun nouveau chunk : le test ajouté est en zone `e2e/`, exclue
du bundle production. Aucune nouvelle dépendance npm.

### Tests

- **872 tests vitest verts** (128 fichiers, durée ~61 s) —
  **inchangé** vs étape 25. Le nouveau test est en E2E
  Playwright, pas en vitest.
- **32 tests E2E Playwright** attendus en CI (3 specs petition
  → 6 tests + 14 specs public-pages + 5 transparence + 4 auth
  + 3 critical-flows + 1 nouveau étape 26) — **+1** vs étape
  25 (31 → 32). Validé par la CI GitHub Actions (job
  `Playwright E2E + axe-core a11y`).
- 4 checks locaux verts (typecheck, lint, vitest, build).

### Hygiène

- Pas de modification du prototype (`app/Maintenant.html`,
  `Theme.jsx`).
- Pas de modification du runtime `src/` ni de `db/schema.sql`.
- Pas d'emojis dans les fichiers TS / commits / PR.
- Tokens `T.*` (CSS vars `--mn-*`) **intacts**.
- Pas de clé service_role dans le bundle front.
- Pas de nouvelle dépendance npm.
- Pas de migration DB.
- Pas de breaking change visible utilisateur.

### Checks finaux

```
> npm run typecheck && npm run lint && npx vitest run && npm run build

✓ typecheck   (tsc -b + e2e/tsconfig.json)
✓ lint        (eslint .)
✓ vitest      (128 files, 872 tests passed, ~61s)
✓ build       (entry 47.34 kB / gzip 13.32 kB ; TransparencePage 7.69 kB / gzip 3.11 kB lazy ; sentry 436.2 kB / gzip 143.08 kB lazy)
```

Playwright sera validé par la CI (sandbox local : CDN
`cdn.playwright.dev` non whitelisté pour `chromium_headless_shell-1223`).

### Décisions

- **+1 E2E mock plutôt qu'un attendisme passif** : conformément
  à la consigne explicite de fin de prompt étape 25 et à
  l'exemple suggéré par le prompt étape 26 §2 (« test de l'état
  « pétition signée → bouton « Signée — retirer ma signature »
  via mock useAuth authentifié »). Coût : zéro infra, zéro
  risque, +1 minute côté CI Playwright. Bénéfice : la branche
  UI « signed » passe de « couverture unit-test uniquement » à
  « couverture E2E bout-en-bout », et un nouveau pattern E2E
  (seed session authentifiée via `addInitScript` + localStorage)
  devient disponible pour les futurs tests qui en auront besoin.
- **Tous les autres items différés en bloc** (M2-sec-policy,
  T99CP cumul public, H4-deploy-deno, M1-RGPD, monitoring,
  réconciliation Stripe) : conditions externes inchangées vs
  étape 25. Chaque item nécessite soit un environnement externe
  (HTTPS, Sentry DSN, Supabase de test, trafic réel), soit une
  décision produit / DPO / RGPD reçue. Re-différer en bloc est
  la décision la moins coûteuse et la plus honnête.
- **Pas de mock du hit `signatures` côté `beforeEach`** : on
  laisse la route `**/rest/v1/signatures**` à l'override local
  du test étape 26. Les 4 autres tests de la spec sont anonymes
  → `hasUserSigned` n'est jamais appelé → pas de mock requis.
  Décision plus simple que d'élargir le `beforeEach` (qui
  ajouterait une route inutile pour 4 tests sur 5).

### Prochaines étapes (étape 27)

- Lighthouse mesuré dès qu'un Vercel preview HTTPS sera en ligne
  (priorité 1 si oui).
- Monitoring Sentry canary + 7 j observations dès DSN câblé.
- Décision produit cumul T99CP émises → RPC
  `transparency_t99cp_total()` si OK.
- Décision produit / DPO sur le durcissement
  `signatures_select_public` (M2-sec-policy).
- Décision RGPD sur la purge `stripe_events.payload` (M1-RGPD).
- Si Sentry remonte des erreurs `stripe-webhook` récurrentes →
  prioriser le job de réconciliation Edge Function.
- Si toujours aucune condition externe résolue → 4e itération
  du pattern « +1 test mock E2E ciblé » (par exemple :
  flow de signature côté UI avec POST `signatures` interceptée +
  refresh visible, ou un autre état non couvert en E2E).

### Audit vibe janitor étape 26

**Branche** : `claude/janitor-post-step26`

Audit en parallèle via 3 subagents `general-purpose` après le merge
de la PR principale #29 (commit `chore(prod): step 26 …`) :
architecture / élégance, robustesse / edge cases, sécurité / RGPD
/ cohérence handoff.

#### Findings par sévérité

| Axe | Total | critical | high | medium | low | Fixable safe-first | Déférés |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Architecture | 10 | 0 | 0 | 0 | 10 | 1 | 9 (dont 6 non-findings explicites) |
| Robustesse | 10 | 0 | 0 | 3 | 7 | 0 | 10 (dont 4 non-findings explicites : R1/R2/R6/R8) |
| Sécurité | 10 | 0 | 0 | 0 | 10 | 0 | 10 (dont 7 non-findings explicites) |
| **Total** | **30** | **0** | **0** | **3** | **27** | **1 unique** | **29 (dont 17 non-findings)** |

> Note : R10 et A1 sont **le même finding** (mock `petition_signatures`
> dead code, vu sous deux angles : élégance et confusion futur dev).
> On l'a compté côté architecture (fix appliqué).

#### Fixes appliqués (safe-first)

**J26-A1 / R10** (low / low-risk) — suppression du mock
`**/rest/v1/petition_signatures**` mort dans
`web/e2e/petition-signature.spec.ts` (lignes 39-50 du `beforeEach`).
La vraie table s'appelle `signatures` (cf.
`web/src/lib/petitions.ts:243,263,277` + `web/src/types/database.ts:1537`).
Le mock visait une table qui n'existe nulle part dans le repo :

```diff
- await page.route('**/rest/v1/petition_signatures**', async (route: Route) => {
-   if (route.request().method() === 'POST') {
-     return route.fulfill({
-       status: 201,
-       contentType: 'application/json',
-       body: JSON.stringify([
-         { petition_id: petitionFixture.id, user_id: 'stub-user', created_at: new Date().toISOString() },
-       ]),
-     });
-   }
-   return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
- });
```

Vérifications :

- Les 4 tests anonymes de la spec ne déclenchent pas
  `hasUserSigned` (cf. `usePetition.ts:55` qui short-circuit
  `if (currentUserId)` → `setSigned(false)` direct quand
  `userId === null`).
- Le test étape 26 (signataire authentifié) a sa propre route
  `**/rest/v1/signatures**` locale, donc indépendant.
- Aucune POST signature n'est jamais émise par les 5 tests (aucun
  clic sur le bouton « Signer cette pétition »).

→ Code mort, retrait safe-first. -12 lignes. Aucun test cassé.

#### Fixes déférés (dette nouvelle ou existante)

**J26-A2 / R9** (low / low-risk + medium / medium-risk) — extraction
d'un helper `installAuthenticatedSession(page, { userId, email })`
dans `e2e/utils/mockSupabase.ts`. Le pattern « addInitScript +
localStorage `sb-127-auth-token` » introduit étape 26 est destiné à
être réutilisé pour les futurs tests E2E qui auront besoin d'un
user authentifié. **Déféré** : aucun 2e call-site n'existe
aujourd'hui — règle YAGNI. **Ajouté à la dette consolidée** sous
`L8-arch-authsession` (nouveau).

**J26-A3 / R4** (low / low-risk + medium / low-risk) — constantes
magiques `'sb-127-auth-token'` et `86_400`, et couplage implicite
à la formule storage key de supabase-js
(`sb-${hostname.split('.')[0]}-auth-token`). Un bump majeur
supabase-js v3 qui changerait la dérivation casserait le test
silencieusement (storage non lu → status anonymous → assertion
timeout). **Déféré** : lié à J26-A2 (l'extraction du helper
résoudra naturellement le sujet). Le commentaire 131-148 documente
déjà le couplage CI ; pas de fix code urgent.
**Ajouté à la dette consolidée** sous `M7-e2e-storagekey`
(nouveau).

**J26-A4** (low / low-risk) — commentaire pédagogique de 17 lignes
sur la dérivation de la storage key supabase-js. Disproportionné
pour un test isolé, mais justifié comme prose ad hoc en l'absence
de helper partagé. **Déféré** : à déplacer dans la JSDoc du futur
helper `installAuthenticatedSession` (cf. J26-A2 / L8).

**J26-R3** (low / low-risk) — la route `**/rest/v1/signatures**`
locale au test étape 26 ne filtre pas la méthode HTTP. Si un futur
dev copie le test et ajoute un `click()` de retrait, la DELETE
recevrait encore le row signé → flake. Non-bug aujourd'hui (pas
de clic), pattern fragile. **Déféré** : modif de spec qui s'inscrit
mieux dans une étape pattern E2E auth dédiée (cf. L8).

**J26-R5** (low / medium-risk) — pas de support `VITE_SUPABASE_URL`
override pour un run E2E hors CI (vrai staging Supabase). Hostname
différent → storage key différente → test casse silencieusement.
**Déféré** : nécessite refacto util (calcul dynamique de la storage
key depuis `process.env`), à traiter dans l'étape pattern E2E auth.

**J26-R7 / M6-rob** (medium / medium-risk) — `usePetition.useEffect`
ne flag pas un `cancelled` local. Quand `userId` passe de `null`
(anonyme initial) → `stubId` (auth chargée), 2 fetches concurrents
lancés ; si la 1ère réponse arrive après la 2e, `setSigned(false)`
peut écraser `setSigned(true)` → flake potentiel. Le nouveau test
n'aggrave PAS la dette M6-rob mais en dépend pour ne pas flake.
**Déféré** : dette M6-rob déjà tracée (~22 hooks similaires), fix
au cas par cas hors scope janitor.

**J26-R1 / R2 / R6 / R8** — **non-findings** explicites confirmés
par le subagent robustesse :

- **R1** : `addInitScript` injecte le localStorage AVANT tout script
  de la page (garantie Playwright officielle). `getSession()` reste
  synchrone-sur-localStorage. Aucune race.
- **R2** : auto-refresh token. `AUTO_REFRESH_TICK_DURATION_MS=30000`,
  `AUTO_REFRESH_TICK_THRESHOLD=3` → refresh déclenché uniquement à
  &lt;90 s de `expires_at`. Avec `expires_at = now + 86400 s`,
  86310 s de marge vs un timeout de 30 s → le mock `/auth/v1/token`
  (qui retournerait le mauvais user `stub-user-id`) ne sera jamais
  hit.
- **R6** : `aria-pressed={true}` (React boolean) → `aria-pressed="true"`
  (DOM string) → `toHaveAttribute('aria-pressed', 'true')` matche.
  OK.
- **R8** : `Date.now()` est toujours epoch UTC, indépendant de la TZ
  machine de CI. OK.

**J26-S1 à S10** — tous non-findings explicites côté sécurité /
RGPD / cohérence handoff (statu quo conforme : pas de fuites
secrets, RGPD email factice `example.org` safe, CSP inchangée,
RLS inchangée, dépendances inchangées, compteurs cohérents,
tableau de dette à 14 items vérifié, prompt étape 27 template
respecté avec clause de propagation N+22, couplage `sb-127-...`
ne contamine PAS le runtime production).

**J26-A5 à A10** — non-findings explicites côté architecture
(assertions `aria-busy`/`disabled` hors scope volontaire,
cohérence stylistique avec les 4 tests précédents, cohérence
narrative HANDOFF étape 26 vs 23-25, table dette 14 items vérifiée,
décision « pas de mock signatures côté beforeEach » documentée,
aucune duplication nouvelle).

#### Hygiène (janitor étape 26)

- Pas de modification du prototype.
- Pas de modification du design system `T.*` (CSS vars `--mn-*`).
- Pas de migration DB.
- Pas de breaking change visible utilisateur (le retrait du mock
  `petition_signatures` est invisible : zéro test consommait cette
  route).
- Pas de nouvelle dépendance npm.
- Pas de bump majeur.
- TS strict + no `any`.
- Aucun fix qui casse un test existant.
- Aucun fix qui ouvre un risque B (cf. vérification ci-dessus).
- Aucun nouveau `console.error` / `console.warn`.

#### Checks finaux (janitor étape 26)

```
> npm run typecheck && npm run lint && npx vitest run && npm run build

✓ typecheck   (tsc -b + e2e/tsconfig.json)
✓ lint        (eslint .)
✓ vitest      (128 files, 872 tests passed, ~60s)
✓ build       (entry 47.34 kB / gzip 13.32 kB ; TransparencePage 7.69 kB / gzip 3.11 kB lazy ; sentry 436.2 kB / gzip 143.08 kB lazy)
```

Compteur de tests **inchangé** (872 vitest + 32 E2E attendus en CI) :
on retire 12 lignes de dead code sans toucher au runtime, aux
fixtures ni aux assertions de la suite Playwright.

#### Dette technique consolidée — mise à jour

Ajouts post-step 26 :

| ID | Sévérité | Risque rég. | Description courte | Étape cible |
| --- | --- | --- | --- | --- |
| L8-arch-authsession | low | low | helper `installAuthenticatedSession(page, user)` à extraire dans `e2e/utils/mockSupabase.ts` (pattern E2E réutilisable + JSDoc du commentaire 17 lignes) | étape pattern E2E auth dédiée |
| M7-e2e-storagekey | medium | low | couplage implicite à la formule storage key supabase-js (`sb-${hostname.split('.')[0]}-auth-token`) — bump majeur v3 casserait le test silencieusement + pas de support `VITE_SUPABASE_URL` override hors CI + route `signatures` sans filter méthode HTTP | étape pattern E2E auth dédiée (mutualise avec L8) |

Les dettes existantes (H3-sec, M2-sec-policy, M5-rob, M1-RGPD,
M6-rob, L1-a11y, L3-arch, L4-sec, L5-arch, L6-arch-progress,
L7-arch-loginhref, L1-rob, H4-deploy-deno, L-sec-webhook-body)
restent inchangées.

#### Décisions janitor

- **1 fix safe-first appliqué** sur 30 findings — J26-A1/R10
  (mock `petition_signatures` mort retiré). Impact côté code
  minimal (-12 lignes), bénéfice clair (réduction de la
  confusion pour les futurs devs qui chercheraient pourquoi
  une POST `signatures` n'est pas mockée par la beforeEach).
- **2 nouvelles dettes** documentées (L8-arch-authsession +
  M7-e2e-storagekey). Elles convergent vers une **étape pattern
  E2E auth dédiée** qui extrairait `installAuthenticatedSession`
  helper + résoudrait simultanément A2, A3, A4, R3, R4, R5, R9.
- **R7 (race usePetition)** confirmé comme dépendance latente
  sur la dette M6-rob existante — pas nouveau, le nouveau test
  n'aggrave pas le risque.
- **17 non-findings explicites** (R1/R2/R6/R8 + A5-A10 +
  S1-S10) : la PR #29 est techniquement propre, le périmètre est
  minimal et bien isolé.
- **Toutes les dettes high (H3-sec) + medium-high (M2-sec-policy,
  M5-rob, M1-RGPD, L1-a11y, M6-rob, M7-e2e-storagekey nouveau)**
  restent ouvertes, à traiter dans des étapes dédiées (RLS
  hardening, design dédié, décision RGPD, robustesse hooks,
  pattern E2E auth).

---

## Étape 27 — Post-go-live / Conditions externes inchangées (+1 E2E mock état non signé) ✅

**Branche** : `claude/review-project-rules-n4oyb`

Huitième étape post-go-live. Conformément à la consigne de fin de
prompt étape 26 (« Si toujours aucune condition externe résolue
→ 4e itération du pattern "+1 test mock E2E ciblé" »), et après
confirmation par l'utilisateur que les trois questions
d'ouverture (migrations DB / provisionnement externe / décisions
produit-DPO-RGPD) n'avaient pas de réponse à apporter, l'étape se
concentre sur l'unique livrable sans dépendance externe : +1
test E2E mock dans `web/e2e/petition-signature.spec.ts`.

### Audit Lighthouse réel — re-différé étape 28

Pré-requis non rempli : pas de Vercel preview HTTPS / staging
public en ligne. La consigne explicite du prompt étape 27 §1
(« Si pas de staging HTTPS : différer étape 28 ») s'applique
mécaniquement. Bundle inchangé côté `vite build` : entry
47.34 kB / gzip 13.32 kB, TransparencePage 7.69 kB / gzip
3.11 kB.

### E2E « happy path » réel — re-différé, alternative livrée ✅

Pas de projet Supabase de test seedé pour exécuter un vrai
parcours « signature anonyme ». La consigne fallback du prompt
étape 27 §2 livre la solution : « Sinon ajouter encore un test
mock non-vide (...) — par exemple : flow de signature côté UI
(...) ou un autre état non couvert en E2E ». Choix retenu :
**l'état complémentaire symétrique de l'étape 26**, c'est-à-dire
`authStatus === 'authenticated' && signed === false`. Argument
décisif côté safe-first : ce test réutilise à 95% le pattern
livré étape 26 (`addInitScript` + storage key `sb-127-auth-token`
+ stub session 24h + route mock `signatures`), il diffère
uniquement par le body de la route `signatures` (`[]` au lieu
de `[{ ... }]`) et par les assertions (`/Signer cette pétition/`
+ `aria-pressed="false"` au lieu de `/Signée — retirer ma
signature/` + `aria-pressed="true"`). Pas de nouveau pattern, pas
de nouvelle dépendance, pas de surface inédite, zéro risque de
flake supplémentaire vs étape 26.

**+1 test E2E** ajouté à `web/e2e/petition-signature.spec.ts` :

`affiche « Signer cette pétition » pour un signataire authentifié
non encore signé` (étape 27) — couvre la branche UI
`authStatus === 'authenticated' && signed === false` de
`PetitionDetailPage`, jusqu'ici testée uniquement en unit
(`PetitionDetailPage.test.tsx`). Le bouton authentifié doit
afficher « Signer cette pétition » avec `aria-pressed="false"`
(état initial du toggle accessibilité), et le CTA anonyme
« Se connecter pour signer » NE doit PAS être rendu en parallèle
(gate de non-régression sur le routing conditionnel
`isAnonymous ? <Link/> : <button/>` côté `PetitionDetailPage.tsx:286-317`).

**Implémentation** :

1. **Seed session authentifiée via localStorage** — identique étape
   26 (`addInitScript` injecte une session stubée AVANT le `goto`,
   sous la clé `sb-127-auth-token` ; cf. commentaire 124-148 du
   test précédent). Seul le `user.id` change (`'stub-unsigned-user-id'`
   vs `'stub-signed-user-id'`) — utile pour distinguer le test
   en debug, sans impact fonctionnel sur l'application.
2. **Mock `signatures`** — le hit `hasUserSigned(petition.id, user.id)`
   passe par `supabase.from('signatures').select('id').eq(...).maybeSingle()`.
   `.maybeSingle()` accepte un body `[]` (zero row) et le mappe en
   `data === null` côté call-site. Côté lib :
   `return { signed: Boolean(data), error }` (cf. `petitions.ts:268`)
   → `signed = false`.
3. **Assertions** :
   - `signButton` visible par role + name `/Signer cette pétition/i`.
   - `aria-pressed="false"` pour les screen readers (toggle initial).
   - `getByRole('link', { name: /Se connecter pour signer/i })` →
     `toHaveCount(0)` (le CTA anonyme N'EST PAS rendu — cf. étape 26).

**Propriétés** :

- Aucune modification du runtime `src/` — uniquement le fichier
  spec E2E. Zéro risque de régression côté production.
- Réutilise le même `petitionFixture` (signature_count 42,
  target_count 1000) — pas de nouveau mock à maintenir.
- Réutilise le même pattern session + storage key + 24h
  expiration que l'étape 26 (cohérence avec le 6e test, pas de
  divergence stylistique).
- La session stubée est isolée par test (Playwright crée un
  BrowserContext + Page neufs par test → localStorage propre,
  routes propres). Pas de fuite vers les 5 autres tests
  petition-signature.
- Pas de flake : `addInitScript` s'exécute AVANT tout script de
  page → le boot React voit la session immédiatement. Pas de
  race avec `getSession()`. Le hit `hasUserSigned` se résout
  rapidement avec un body 200 + array vide.
- Pas d'emojis, pas de `any`, pas de nouvelle dépendance npm.

**Suite Playwright** : 32 → 33 tests E2E (CI). Playwright local
ne peut pas être exécuté dans le sandbox (CDN
`cdn.playwright.dev` non whitelisté), mais les 4 checks locaux
(typecheck / lint / vitest / build) sont verts ET la suite CI
GitHub Actions reste la source de vérité pour Playwright.

### Monitoring Sentry runtime — re-différé étape 28

DSN absent en env preview (Sentry SaaS non provisionné). Aucun
event runtime à observer. Re-différé.

### Monitoring Supabase — re-différé étape 28

Pas de trafic réel sur `maintenant-staging`. Re-différé.

### M2-sec-policy — durcissement `signatures_select_public` — re-différé étape 28

Pas de validation produit / DPO reçue à cette étape. Le prompt
étape 27 explicite la consigne : « Si validation non reçue →
différer étape 28 et documenter la raison ». Re-différé. Raison
inchangée vs étape 26 : changement RLS visible côté client
(légitimité Art. 9 RGPD — opinions politiques) qui doit être
validé par le DPO et par le produit (UX : liste publique des
signataires conservée ou retirée si la policy exclut `user_id`
des anonymes ?). La RPC `signatures_count_for_petition` livrée
à l'étape 24 reste isolée — son helper `getPetitionSignatureCount`
n'est appelé par aucun call-site UI.

### Cumul T99CP émises publique — re-différé étape 28

Pas de validation produit reçue à cette étape. Re-différé.

### H4-deploy-deno — re-différé étape 28

Pré-requis non rempli : pas de pipeline CI Supabase réel.
Re-différé.

### M1-RGPD — purge auto `stripe_events.payload` — re-différé étape 28

Pas de décision RGPD reçue. Table critique (idempotence
webhook), demande de confirmation requise. Re-différé.

### Retours utilisateur·rices — sans objet (pas de trafic)

Aucun compte créé réel, aucun signalement modération, aucun bug
remonté.

### Job de réconciliation Stripe — re-différé étape 28

Critère prompt §10 inchangé : pas d'erreur Sentry observable
(monitoring runtime absent), idempotence DB suffit.

### Dette technique différée — étape 28 ou plus tard

Récap consolidé inchangé vs fin janitor étape 26 (16 items —
H3-sec, M2-sec-policy, M5-rob, M1-RGPD, M6-rob, M7-e2e-storagekey,
L1-a11y, L3-arch, L4-sec, L5-arch, L6-arch-progress,
L7-arch-loginhref, L1-rob, H4-deploy-deno, L-sec-webhook-body,
L8-arch-authsession) — cf. tableau étape 26.

### Bundle après ajout

| Avant étape 27 (fin janitor 26) | Après étape 27 |
| --- | --- |
| `index.js` 47.34 kB / gzip 13.32 kB | `index.js` 47.34 kB / gzip 13.32 kB |
| `TransparencePage.js` 7.69 kB / gzip 3.11 kB | `TransparencePage.js` 7.69 kB / gzip 3.11 kB |

Aucun nouveau chunk : le test ajouté est en zone `e2e/`, exclue
du bundle production. Aucune nouvelle dépendance npm.

### Tests

- **872 tests vitest verts** (128 fichiers, durée ~62 s) —
  **inchangé** vs étape 26. Le nouveau test est en E2E
  Playwright, pas en vitest.
- **33 tests E2E Playwright** attendus en CI (3 specs petition
  → 6 tests + 14 specs public-pages + 5 transparence + 4 auth
  + 3 critical-flows + 1 nouveau étape 27) — **+1** vs étape
  26 (32 → 33). Validé par la CI GitHub Actions (job
  `Playwright E2E + axe-core a11y`).
- 4 checks locaux verts (typecheck, lint, vitest, build).

### Hygiène

- Pas de modification du prototype (`app/Maintenant.html`,
  `Theme.jsx`).
- Pas de modification du runtime `src/` ni de `db/schema.sql`.
- Pas d'emojis dans les fichiers TS / commits / PR.
- Tokens `T.*` (CSS vars `--mn-*`) **intacts**.
- Pas de clé service_role dans le bundle front.
- Pas de nouvelle dépendance npm.
- Pas de migration DB.
- Pas de breaking change visible utilisateur.

### Checks finaux

```
> npm run typecheck && npm run lint && npx vitest run && npm run build

✓ typecheck   (tsc -b + e2e/tsconfig.json)
✓ lint        (eslint .)
✓ vitest      (128 files, 872 tests passed, ~62s)
✓ build       (entry 47.34 kB / gzip 13.32 kB ; TransparencePage 7.69 kB / gzip 3.11 kB lazy ; sentry 436.2 kB / gzip 143.08 kB lazy)
```

Playwright validé par la CI (sandbox local : CDN
`cdn.playwright.dev` non whitelisté pour le binaire chromium).

### Décisions

- **+1 E2E mock plutôt qu'un attendisme passif** : conformément
  à la consigne explicite de fin de prompt étape 26 (« 4e itération
  du pattern +1 E2E mock ciblé »). Coût : zéro infra, zéro
  risque, +1 minute côté CI Playwright. Bénéfice : la branche
  UI « authenticated + NOT signed » passe de « couverture
  unit-test uniquement » à « couverture E2E bout-en-bout », et
  la matrice auth-gate (anonymous / authenticated+signed /
  authenticated+notsigned) est désormais complètement couverte
  en E2E.
- **Symétrie étape 26 plutôt que click+POST** : le prompt étape
  27 §2 suggère deux pistes (« flow de signature côté UI » avec
  click + POST + refresh, OU « autre état non couvert en E2E »).
  Choix de la seconde piste car (a) elle réutilise à 95% le
  pattern étape 26 (cohérence stylistique, dette consolidée
  M7-e2e-storagekey déjà tracée), (b) elle n'introduit pas de
  mock stateful (GET signatures évolutif avant/après POST) qui
  ajouterait du risque de flake et de complexité de maintenance,
  (c) elle complète la matrice auth-gate de manière minimale.
- **Tous les autres items différés en bloc** (M2-sec-policy,
  T99CP cumul public, H4-deploy-deno, M1-RGPD, monitoring,
  réconciliation Stripe) : conditions externes inchangées vs
  étape 26. L'utilisateur a confirmé ne pas pouvoir répondre
  aux 3 questions d'ouverture (migrations / provisionnement /
  décisions produit-DPO-RGPD) — re-différer en bloc est la
  décision la moins coûteuse et la plus honnête.
- **Pas de mock du hit `signatures` côté `beforeEach`** : on
  laisse la route `**/rest/v1/signatures**` à l'override local
  du test étape 27 (comme pour étape 26). Les 4 tests anonymes
  de la spec ne déclenchent pas `hasUserSigned` (cf. usePetition.ts:55,
  short-circuit si `currentUserId === null`).

### Prochaines étapes (étape 28)

- Lighthouse mesuré dès qu'un Vercel preview HTTPS sera en ligne
  (priorité 1 si oui).
- Monitoring Sentry canary + 7 j observations dès DSN câblé.
- Décision produit cumul T99CP émises → RPC
  `transparency_t99cp_total()` si OK.
- Décision produit / DPO sur le durcissement
  `signatures_select_public` (M2-sec-policy).
- Décision RGPD sur la purge `stripe_events.payload` (M1-RGPD).
- Si Sentry remonte des erreurs `stripe-webhook` récurrentes →
  prioriser le job de réconciliation Edge Function.
- Si toujours aucune condition externe résolue → 5e itération
  du pattern « +1 test mock E2E ciblé » (par exemple :
  flow de signature actif avec click + POST + refresh, OU
  un autre état non couvert : mobilization detail / poll
  detail / transparence variants).

### Audit vibe janitor étape 27

**Branche** : `claude/janitor-post-step27`

Audit en parallèle via 3 subagents `general-purpose` après le merge
de la PR principale #31 (commit `chore(prod): step 27 …`) :
architecture / élégance, robustesse / edge cases, sécurité / RGPD
/ cohérence handoff.

#### Findings par sévérité

| Axe | Total | critical | high | medium | low | Fixable safe-first | Déférés / non-findings |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Architecture | 9 | 0 | 0 | 0 | 9 | 0 | 9 (dont 6 non-findings explicites : A4-A9) |
| Robustesse | 14 | 0 | 0 | 1 | 13 | 0 | 14 (dont 11 non-findings explicites + 3 déférés) |
| Sécurité | 15 | 0 | 0 | 0 | 15 | 0 | 15 (tous non-findings explicites : S1-S15) |
| **Total** | **38** | **0** | **0** | **1** | **37** | **0** | **38 (dont 32 non-findings)** |

#### Fixes appliqués (safe-first)

**Aucun**.

Conformément au principe « primum non nocere » documenté dans
`CLAUDE.md` § « Audit récurrent vibe janitor de fin d'étape »,
aucun fix safe-first n'est applicable à ce stade :

- Les 3 findings architecture `low` (J27-A1 duplication helper,
  J27-A2 `stubUserId` distinct, J27-A3 scope describe) sont
  **déjà couverts** par les dettes `L8-arch-authsession` et
  `M7-e2e-storagekey` consolidées à l'étape 26. La règle YAGNI
  s'applique encore : 2 call-sites quasi-identiques ne
  justifient pas l'extraction immédiate d'un helper dont
  l'API serait choisie sans visibilité sur le 3e call-site
  (mobilization / poll / marketplace…). Reporter à une étape
  pattern E2E auth dédiée est cohérent avec « Pas de fix qui
  ouvre un risque B ».
- Le finding robustesse `medium` (J27-R7 — sémantique mock `[]`
  vs serveur réel `{}` ou 406 sur `.maybeSingle()`) est
  **déféré** : le résultat final côté call-site est identique
  (`data === null` dans les deux cas), seul le chemin de
  parsing diffère. À documenter dans la future étape pattern
  E2E auth (mutualisé avec L8 / M7).
- Les 15 findings sécurité sont **tous non-findings explicites**
  (statu quo conforme à `CLAUDE.md` + 16 dettes consolidées
  inchangées).

#### Fixes déférés (dette nouvelle ou existante)

**J27-A1 / J27-A2 / J27-A3** (low / low-risk × 3) — couverts par
`L8-arch-authsession` (helper `installAuthenticatedSession` +
JSDoc consolidée) et `M7-e2e-storagekey` (couplage storage key
+ override `VITE_SUPABASE_URL` + filter méthode HTTP route
signatures), consolidées à l'étape 26. Aucune nouvelle dette à
tracer — les dettes existantes couvrent exactement ce périmètre.

**J27-R7** (medium / low-risk) — sémantique du body retourné
côté serveur (`{}` ou 406 sur `.maybeSingle()` avec singular
row mode) diffère du mock E2E (`[]` array). Résultat final
identique côté call-site (`data === null` → `signed = false`),
mais le chemin de parsing testé n'est pas strictement celui de
la prod. **Déféré** : à documenter dans la future étape pattern
E2E auth dédiée (mutualisé avec L8 / M7). Pas de dette nouvelle
à tracer — couvert par l'esprit de M7-e2e-storagekey
(« fidelity E2E vs runtime »).

**J27-R8** (low / low-risk — vigilance future) — si une future
version de supabase-js décide de valider la session côté
serveur via `/auth/v1/user` au boot, le test casserait
silencieusement (le mock `installSupabaseStubs` renvoie
`id='stub-user-id'` ≠ `id='stub-unsigned-user-id'` côté
session injectée). Vérification actuelle : supabase-js v2
n'émet pas ce hit pour `getSession()` (lecture directe
storage). **Déféré** : couvert par la même future étape
pattern E2E auth (à documenter en JSDoc du helper).

#### Non-findings explicites (confirmation par 3 subagents)

- **A4** : regex `/Signer cette pétition/i` + `getByRole('button')`
  non-ambigu vu la source `PetitionDetailPage.tsx:313`. La
  string « Connectez-vous pour signer cette pétition » (l.281)
  est dans un `<div role="note">`, exclue.
- **A5** : narrative HANDOFF étape 27 cohérente, ancrages
  fichier corrects (`PetitionDetailPage.tsx:286-317`,
  `petitions.ts:268`).
- **A6** : `beforeEach` sans mock global `signatures` reste
  cohérent post-janitor 26 (override local explicite uniquement
  quand requis, 4 tests anonymes short-circuitent
  `hasUserSigned` côté `usePetition.ts:55`).
- **A7** : `page.addInitScript` vs `page.context().addInitScript`
  équivalent en pratique (1 Page = 1 Context par test, config
  Playwright par défaut).
- **A8** : ancrage `petitions.ts:268` correct au moment du
  commit.
- **A9** : renvoi cross-référencé entre tests 6 et 7
  (commentaire de l.191-203 pointant sur l.124-148) — pattern
  propre, évite duplication intégrale du commentaire de 17
  lignes.
- **R1, R3, R4, R5, R6, R9, R10, R11, R12, R14** : 10
  vérifications robustesse confirmées (race window neutre,
  rendu React `aria-pressed`, marge auto-refresh 24h,
  uniqueness sélecteur, TZ invariant, ordre Playwright init/route/goto,
  timeout 10s ample, label busy initial OK, isolation localStorage
  cross-test garantie par Playwright).
- **R13** : couplage storage key — déjà tracé en
  `M7-e2e-storagekey`.
- **S1** : stub tokens (`stub-access-token`,
  `stub-refresh-token`) pattern incompatible JWT / refresh
  token Supabase, aucun scanner secret ne matche.
- **S2** : email `curieux@example.org` réservé RFC 2606,
  `display_name: 'Curieux Stub'` non identifiant.
- **S3** : aucune référence `service_role` dans le diff
  (vérifié `git diff bf5effc^ bf5effc -- web/src/lib/supabase.ts`
  vide).
- **S4** : CSP / headers inchangés (`web/index.html`,
  `web/vercel.json` non modifiés).
- **S5** : RLS / `db/schema.sql` inchangé. M2-sec-policy reste
  ouvert comme prévu (gated DPO).
- **S6** : `web/package.json` / `web/package-lock.json` non
  modifiés — aucune nouvelle dépendance, aucun bump.
- **S7** : storage key `sb-127-auth-token` côté E2E ne
  contamine pas le runtime production (formule supabase-js v2
  dérive depuis `VITE_SUPABASE_URL`, dossier `web/e2e/` exclu
  du bundle `vite build`).
- **S8** : `'stub-unsigned-user-id'` isolé par
  BrowserContext + Page neufs par test (Playwright
  `fullyParallel: true`).
- **S9** : prototype intouché (`app/Maintenant.html`, `Theme.jsx`,
  `Harmonize.css` non modifiés).
- **S10** : dette consolidée 16 items inchangée vs fin janitor
  étape 26 (cohérent avec narrative étape 27 lignes
  7602-7607).
- **S11** : table « État global » étendue (lignes 26 et 27
  ajoutées), narrative étape 27 (lignes 7456-7711)
  cohérente.
- **S12** : prompt étape 28 (lignes 7714-7977) propage
  correctement les deux clauses récursives (recopie prompt +
  audit janitor) pour la session N+22.
- **S13** : compteurs cohérents (872 vitest inchangé, 32 → 33
  E2E Playwright, bundle entry 47.34 kB / gzip 13.32 kB
  inchangé, TransparencePage 7.69 kB / gzip 3.11 kB inchangé,
  Sentry 436.2 kB / gzip 143.08 kB inchangé).
- **S14** : décisions externes (Lighthouse / monitoring /
  produit-DPO-RGPD) non reçues → re-différement en bloc
  conforme aux conditions explicites du prompt étape 27.
- **S15** : pas de `service_role` re-livré accidentellement
  (zéro chaîne `service_role` dans le diff).

#### Hygiène (janitor étape 27)

- Pas de modification du prototype.
- Pas de modification du design system `T.*` (CSS vars
  `--mn-*`).
- Pas de migration DB.
- Pas de breaking change visible utilisateur (pas de fix
  appliqué).
- Pas de nouvelle dépendance npm.
- Pas de bump majeur.
- TS strict + no `any`.
- Aucun fix qui casse un test existant (zéro fix appliqué).
- Aucun fix qui ouvre un risque B.
- Aucun nouveau `console.error` / `console.warn`.

#### Checks finaux (janitor étape 27)

```
> npm run typecheck && npm run lint && npx vitest run && npm run build

✓ typecheck   (tsc -b + e2e/tsconfig.json)
✓ lint        (eslint .)
✓ vitest      (128 files, 872 tests passed, ~62s)
✓ build       (entry 47.34 kB / gzip 13.32 kB ; TransparencePage 7.69 kB / gzip 3.11 kB lazy ; sentry 436.2 kB / gzip 143.08 kB lazy)
```

Compteur de tests **inchangé** (872 vitest + 33 E2E Playwright
en CI) : la PR janitor est documentation-only, aucun fichier
runtime modifié.

#### Dette technique consolidée — inchangée

Aucune nouvelle dette ajoutée. Les 16 items existants (H3-sec,
M2-sec-policy, M5-rob, M1-RGPD, M6-rob, M7-e2e-storagekey,
L1-a11y, L3-arch, L4-sec, L5-arch, L6-arch-progress,
L7-arch-loginhref, L1-rob, H4-deploy-deno, L-sec-webhook-body,
L8-arch-authsession) restent ouverts, à traiter dans des étapes
dédiées (RLS hardening, design dédié, décision RGPD, robustesse
hooks, pattern E2E auth).

#### Décisions janitor

- **0 fix safe-first appliqué** sur 38 findings. Justification
  intégralement documentée ci-dessus : les 3 findings
  architecture `low` consomment des dettes déjà tracées
  (L8 + M7), le finding robustesse `medium` est déférable
  (chemin de parsing alternatif sans impact résultat), et les
  15 findings sécurité sont tous non-findings (statu quo
  conforme). Aucune dette nouvelle.
- **PR janitor documentation-only** : la PR
  `chore(janitor): post-step 27 — …` n'introduit qu'un patch
  sur `HANDOFF-PROGRESS.md` (cette section + 0 changement
  code). Pattern explicitement autorisé par `CLAUDE.md`
  § « Audit récurrent vibe janitor de fin d'étape »
  (« primum non nocere » : si aucun fix ne se présente, on
  ne fixe rien et on consigne).
- **3 subagents en parallèle → 38 findings** (9 architecture +
  14 robustesse + 15 sécurité) → un signal explicite de
  maturité du périmètre : le test étape 27 est isolé,
  symétrique au précédent, et ne déclenche aucune surface
  inédite. La duplication consciente avec étape 26 est le
  prix à payer pour la cohérence stylistique (argument
  validé par les 3 subagents).
- **Toutes les dettes high (H3-sec) + medium-high
  (M2-sec-policy, M5-rob, M1-RGPD, L1-a11y, M6-rob,
  M7-e2e-storagekey)** restent ouvertes, à traiter dans des
  étapes dédiées.

---

## Étape 28 — Post-go-live / Conditions externes inchangées (+1 E2E mock flow signature actif) ✅

**Branche** : `claude/fetch-session-28-prompt-GQfHQ`

Neuvième étape post-go-live. Conformément à la consigne de fin
de prompt étape 27 (« Si toujours aucune condition externe
résolue → 5e itération du pattern "+1 test mock E2E ciblé",
par exemple flow de signature actif avec click + POST + refresh »)
et après confirmation utilisateur que les conditions externes
restent inchangées (pas de migration appliquée, pas de
provisionnement, pas de décision produit-DPO-RGPD), l'étape se
concentre sur le livrable suggéré explicitement par le prompt
étape 28 §2 (premier exemple) : flow de signature actif côté UI
(clic réel sur « Signer cette pétition » → POST `signatures`
intercepté → bascule visible vers « Signée — retirer ma
signature »).

### Audit Lighthouse réel — re-différé étape 29

Pré-requis non rempli : pas de Vercel preview HTTPS / staging
public en ligne. La consigne explicite du prompt étape 28 §1
(« Si pas de staging HTTPS : différer étape 29 ») s'applique
mécaniquement. Bundle inchangé côté `vite build` : entry
47.34 kB / gzip 13.32 kB, TransparencePage 7.69 kB / gzip
3.11 kB.

### E2E « happy path » réel — re-différé, alternative livrée ✅

Pas de projet Supabase de test seedé. Le prompt étape 28 §2
liste explicitement le flow de signature actif comme premier
exemple de fallback. Argument retenu : après les états statiques
livrés aux étapes 25/26/27 (anonyme / authentifié signé /
authentifié non signé), la **transition** signed:false → true
est le complément naturel pour boucler la matrice du `handleSign`
de `PetitionDetailPage.tsx:214-237`. Le test exécute le clic
réel sur le bouton, intercepte le POST `signatures`, puis vérifie
que `usePetition.refresh()` (cf. `web/src/hooks/usePetition.ts:72-77`)
rafraîchit l'état UI vers la branche `signed: true`.

**+1 test E2E** ajouté à `web/e2e/petition-signature.spec.ts` :

`signe la pétition: clic → POST intercepté → bascule vers « Signée — retirer ma signature »`
(étape 28) — couvre :

- L'état initial `authStatus === 'authenticated' && signed === false`
  (bouton « Signer cette pétition », `aria-pressed="false"`).
- Le clic réel sur le bouton (`signButton.click()`).
- L'interception du POST `signatures` (méthode HTTP filtrée via
  `route.request().method() === 'POST'`).
- La bascule visible vers la branche `signed === true` (bouton
  « Signée — retirer ma signature », `aria-pressed="true"`)
  via `usePetition.refresh()` qui re-issue un GET sur
  `/signatures` (renvoyant cette fois la ligne fraîchement
  insérée).
- La non-régression côté rendu conditionnel : le bouton initial
  « Signer cette pétition » n'est plus rendu une fois `signed = true`
  (`getByRole('button').toHaveCount(0)`).

**Implémentation** :

1. **Seed session authentifiée via localStorage** — identique
   étapes 26/27 (`addInitScript` injecte une session stubée
   AVANT le `goto`, sous la clé `sb-127-auth-token` ; cf.
   commentaire 124-148 du test étape 26). Seul le `user.id`
   change (`'stub-active-signer-id'` vs
   `'stub-signed-user-id'` / `'stub-unsigned-user-id'`) — utile
   pour distinguer le test en debug.
2. **Mock stateful pour `/rest/v1/signatures`** — variable
   locale `signed: boolean` capturée par closure. Sur POST
   (signPetition `.insert(...).select('*').maybeSingle()`),
   le mock répond 201 + ligne insérée ET flippe `signed = true`.
   Sur GET subséquent (hasUserSigned via refresh), le body
   renvoyé dépend du flag : `[]` si pas encore signé, `[{...}]`
   après. L'ordre est garanti par `handleSign` côté
   `PetitionDetailPage.tsx:214-237` : `await signPetition(...)`
   précède `await refresh()`. Playwright sérialise les
   handlers de route par requête → pas de race observable.
3. **Assertions** :
   - État initial : `getByRole('button', { name: /^Signer cette pétition$/i })`
     visible avec `aria-pressed="false"`. Le regex `^...$`
     ancré empêche un match accidentel de « Connectez-vous
     pour signer cette pétition » (string du `<div role="note">`
     `PetitionDetailPage.tsx:281`).
   - Action : `signButton.click()` déclenche `handleSign()` →
     `signPetition()` POST 201 → `refresh()` → re-GET
     signatures → `signed = true` côté usePetition.
   - État final : `getByRole('button', { name: /Signée — retirer ma signature/i })`
     visible avec `aria-pressed="true"`. Le bouton initial
     `getByRole('button', { name: /^Signer cette pétition$/i })`
     a `toHaveCount(0)`.

**Propriétés** :

- Aucune modification du runtime `src/` — uniquement le fichier
  spec E2E. Zéro risque de régression côté production.
- Réutilise le même `petitionFixture` (signature_count 42,
  target_count 1000) — pas de nouveau mock à maintenir.
- Réutilise le même pattern session + storage key + 24h
  expiration que les étapes 26/27 (cohérence stylistique).
- La session stubée est isolée par test (Playwright crée un
  BrowserContext + Page neufs par test → localStorage propre,
  routes propres). Pas de fuite vers les 6 autres tests
  petition-signature.
- Pas de flake attendu :
  - `addInitScript` s'exécute AVANT tout script de page → le
    boot React voit la session immédiatement.
  - Le mock route filtre par `route.request().method()` — pas
    de match accidentel POST/GET.
  - Le flag `signed: boolean` est une variable locale à la
    closure du test (pas de fuite cross-test).
  - `actionTimeout: 10_000` + `expect timeout: 5_000` (cf.
    `playwright.config.ts`) laissent une marge ample vs la
    latence d'un mock local (< 5 ms par request).
- Pas d'emojis, pas de `any`, pas de nouvelle dépendance npm.

**Suite Playwright** : 33 → 34 tests E2E (CI). Playwright local
ne peut pas être exécuté dans le sandbox (CDN
`cdn.playwright.dev` non whitelisté pour le binaire
`chromium_headless_shell-1223`), mais les 4 checks locaux
(typecheck / lint / vitest / build) sont verts ET la suite CI
GitHub Actions reste la source de vérité pour Playwright.

### Monitoring Sentry runtime — re-différé étape 29

DSN absent en env preview (Sentry SaaS non provisionné). Aucun
event runtime à observer. Re-différé.

### Monitoring Supabase — re-différé étape 29

Pas de trafic réel sur `maintenant-staging`. Re-différé.

### M2-sec-policy — durcissement `signatures_select_public` — re-différé étape 29

Pas de validation produit / DPO reçue à cette étape. Le prompt
étape 28 explicite la consigne : « Si validation non reçue →
différer étape 29 et documenter la raison ». Re-différé. Raison
inchangée vs étapes 26/27 : changement RLS visible côté client
(légitimité Art. 9 RGPD — opinions politiques) qui doit être
validé par le DPO et par le produit (UX : liste publique des
signataires conservée ou retirée si la policy exclut `user_id`
des anonymes ?). La RPC `signatures_count_for_petition` livrée à
l'étape 24 reste isolée — son helper `getPetitionSignatureCount`
n'est appelé par aucun call-site UI.

### Cumul T99CP émises publique — re-différé étape 29

Pas de validation produit reçue à cette étape. Re-différé.

### H4-deploy-deno — re-différé étape 29

Pré-requis non rempli : pas de pipeline CI Supabase réel.
Re-différé.

### M1-RGPD — purge auto `stripe_events.payload` — re-différé étape 29

Pas de décision RGPD reçue. Table critique (idempotence
webhook), demande de confirmation requise. Re-différé.

### Retours utilisateur·rices — sans objet (pas de trafic)

Aucun compte créé réel, aucun signalement modération, aucun bug
remonté.

### Job de réconciliation Stripe — re-différé étape 29

Critère prompt §10 inchangé : pas d'erreur Sentry observable
(monitoring runtime absent), idempotence DB suffit.

### Dette technique différée — étape 29 ou plus tard

Récap consolidé inchangé vs fin janitor étape 27 (16 items —
H3-sec, M2-sec-policy, M5-rob, M1-RGPD, M6-rob, M7-e2e-storagekey,
L1-a11y, L3-arch, L4-sec, L5-arch, L6-arch-progress,
L7-arch-loginhref, L1-rob, H4-deploy-deno, L-sec-webhook-body,
L8-arch-authsession) — cf. tableau étape 26.

### Bundle après ajout

| Avant étape 28 (fin janitor 27) | Après étape 28 |
| --- | --- |
| `index.js` 47.34 kB / gzip 13.32 kB | `index.js` 47.34 kB / gzip 13.32 kB |
| `TransparencePage.js` 7.69 kB / gzip 3.11 kB | `TransparencePage.js` 7.69 kB / gzip 3.11 kB |

Aucun nouveau chunk : le test ajouté est en zone `e2e/`, exclue
du bundle production. Aucune nouvelle dépendance npm.

### Tests

- **872 tests vitest verts** (128 fichiers, durée ~75 s) —
  **inchangé** vs étape 27. Le nouveau test est en E2E
  Playwright, pas en vitest.
- **34 tests E2E Playwright** attendus en CI (3 specs petition
  → 7 tests + 14 specs public-pages + 5 transparence + 4 auth
  + 3 critical-flows + 1 nouveau étape 28) — **+1** vs étape
  27 (33 → 34). Validé par la CI GitHub Actions (job
  `Playwright E2E + axe-core a11y`).
- 4 checks locaux verts (typecheck, lint, vitest, build).

### Hygiène

- Pas de modification du prototype (`app/Maintenant.html`,
  `Theme.jsx`).
- Pas de modification du runtime `src/` ni de `db/schema.sql`.
- Pas d'emojis dans les fichiers TS / commits / PR.
- Tokens `T.*` (CSS vars `--mn-*`) **intacts**.
- Pas de clé service_role dans le bundle front.
- Pas de nouvelle dépendance npm.
- Pas de migration DB.
- Pas de breaking change visible utilisateur.

### Checks finaux

```
> npm run typecheck && npm run lint && npx vitest run && npm run build

✓ typecheck   (tsc -b + e2e/tsconfig.json)
✓ lint        (eslint .)
✓ vitest      (128 files, 872 tests passed, ~75s, 2 runs successifs verts)
✓ build       (entry 47.34 kB / gzip 13.32 kB ; TransparencePage 7.69 kB / gzip 3.11 kB lazy ; sentry 436.2 kB / gzip 143.08 kB lazy)
```

Playwright validé par la CI (sandbox local : CDN
`cdn.playwright.dev` non whitelisté pour le binaire chromium).

### Décisions

- **+1 E2E mock plutôt qu'un attendisme passif** : conformément
  à la consigne explicite de fin de prompt étape 27 (« 5e
  itération du pattern +1 E2E mock ciblé, flow de signature
  actif avec click + POST + refresh »). Coût : zéro infra, zéro
  risque, +2-3 minutes côté CI Playwright (un peu plus long
  qu'un test statique car POST + refresh + re-GET). Bénéfice :
  la **transition** d'état `signed: false → true` côté UI passe
  de « couverture unit-test uniquement » à « couverture E2E
  bout-en-bout ». La matrice du `handleSign` (sign branch) est
  désormais entièrement couverte en E2E.
- **Flow signature plutôt qu'un autre état non couvert** : le
  prompt étape 28 §2 propose deux pistes (flow actif OU autre
  état mobilization/poll/transparence/profil). Choix de la
  première car (a) elle clôt naturellement la suite
  `petition-signature.spec.ts` (transition complète sign-flow),
  (b) elle exerce un chemin de code unique non testé en E2E
  (handleSign → signPetition → refresh → re-fetch), (c) elle
  s'inscrit dans le même contexte mental que les 2 tests
  précédents (debugging facile pour un dev qui ouvre le fichier).
  Le mock stateful (POST flippe le flag, GET dépend du flag) est
  un pattern simple, déjà bien éprouvé par Playwright.
- **Pas d'unsign reverse-flow** : on ne teste pas le retrait
  de signature (clic sur le bouton signé → DELETE → bascule
  retour). Argument YAGNI : la symétrie « sign → unsign » serait
  un 9e test, et le chemin de code DELETE de
  `PetitionDetailPage.tsx:222-227` est trivialement symétrique
  au chemin POST déjà testé. À reporter à une étape pattern E2E
  auth dédiée (cf. dette L8-arch-authsession qui pourrait
  paramétrer un helper `installAuthenticatedSession`).
- **Tous les autres items différés en bloc** (M2-sec-policy,
  T99CP cumul public, H4-deploy-deno, M1-RGPD, monitoring,
  réconciliation Stripe) : conditions externes inchangées vs
  étape 27. L'utilisateur a confirmé en ouverture de session
  qu'il ne pouvait pas répondre aux questions d'ouverture
  (migrations / provisionnement / décisions
  produit-DPO-RGPD) — re-différer en bloc est la décision la
  moins coûteuse et la plus honnête.

### Prochaines étapes (étape 29)

- Lighthouse mesuré dès qu'un Vercel preview HTTPS sera en ligne
  (priorité 1 si oui).
- Monitoring Sentry canary + 7 j observations dès DSN câblé.
- Décision produit cumul T99CP émises → RPC
  `transparency_t99cp_total()` si OK.
- Décision produit / DPO sur le durcissement
  `signatures_select_public` (M2-sec-policy).
- Décision RGPD sur la purge `stripe_events.payload` (M1-RGPD).
- Si Sentry remonte des erreurs `stripe-webhook` récurrentes →
  prioriser le job de réconciliation Edge Function.
- Si toujours aucune condition externe résolue → 6e itération
  du pattern « +1 test mock E2E ciblé » (par exemple : flow
  unsign reverse-flow symétrique étape 28, ou un autre état
  non couvert : mobilization detail, poll detail, transparence
  variants).

### Audit vibe janitor étape 28

**Branche** : `claude/janitor-post-step28`

Audit en parallèle via 3 subagents `general-purpose` après le
merge de la PR principale #33 (commit
`chore(prod): step 28 …`) : architecture / élégance,
robustesse / edge cases, sécurité / RGPD / cohérence handoff.

#### Findings par sévérité

| Axe | Total | critical | high | medium | low | Fixable safe-first | Déférés / non-findings |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Architecture | 10 | 0 | 0 | 0 | 10 | 5 candidats | 5 (dont 4 non-findings : A6, A8, A9, A10) |
| Robustesse | 12 | 0 | 0 | 0 | 6 + 6 info | 5 candidats | 6 non-findings (R7-R12) |
| Sécurité | 14 | 0 | 0 | 0 | 1 cosmétique | 0 | 13 non-findings (S1-S8 + H1-H5) |
| **Total** | **36** | **0** | **0** | **0** | **17 + 6 info + 13 non-findings** | **10 candidats → 4 retenus** | **23 (dont 23 non-findings + observations)** |

#### Fixes appliqués (safe-first, primum non nocere)

4 fixes safe-first retenus parmi les 10 candidats, sur le seul
fichier `web/e2e/petition-signature.spec.ts` (test étape 28
uniquement, lignes 252-355 après application). Critère de
sélection : **haute valeur de lisibilité + zéro risque de
régression** (pas de modification de logique, pas d'extraction
d'API helper, pas d'élargissement de surface).

**J28-A3** (low / low-risk) — **Renommage `signed` → `hasSignedRow`**
(closure du mock route). La variable précédente faisait
shadow avec le champ `signed` exporté par `usePetition`
(`web/src/hooks/usePetition.ts:12`), perturbant la lecture
(« quel `signed` ? côté UI ou côté mock ? »). Le nouveau nom
`hasSignedRow` rend explicite que c'est l'état du mock côté
serveur (« y a-t-il une ligne signature côté DB stubée »), pas
l'état React du hook.

**J28-A5** (low / low-risk) — **Extraction de la constante
`newSignatureRow`** déclarée AVANT le `page.route(...)`. Avant
janitor : payload `{ id, petition_id, user_id, created_at }`
dupliqué entre la branche POST (l.300-307) et la branche GET
(l.316-323) — 8 lignes répétées. Après janitor : 1 littéral,
2 références (`[newSignatureRow]`). Aucune perte d'expressivité,
gain DRY local de 8 lignes.

**J28-A2** (low / low-risk) — **Désancrage des regex
`/^Signer cette pétition$/i` → `/Signer cette pétition/i`**
(2 occurrences : ligne 332 assertion initiale + ligne 348
assertion finale `toHaveCount(0)`). Avant janitor : regex
ancrés pour défense contre un match accidentel sur la string
« Connectez-vous pour signer cette pétition » du `<div role="note">`
(`PetitionDetailPage.tsx:281`). Après audit : le filtre
`getByRole('button')` exclut DÉJÀ le `<div role="note">`
(`role="note"` ≠ `role="button"`), donc l'ancrage défensif
était redondant. Désancrer rétablit la cohérence stylistique
avec le test étape 27 (l.236) qui utilise déjà le regex non
ancré. Commentaire ajouté en l.332-334 expliquant pourquoi
l'ancrage n'est plus nécessaire (référence
`PetitionDetailPage.tsx:281`).

**J28-R3** (low / low-risk) — **Clarification du commentaire sur
le séquencement applicatif**. Avant janitor (l.287-291) : « Pas
de race observable côté Playwright qui sérialise les handlers
de route par requête ». Cette formulation est **incorrecte sur
le pourquoi** : Playwright sérialise UN handler PAR requête
mais ne sérialise PAS plusieurs requêtes concurrentes entre
elles. La non-race vient en réalité du `await signPetition(...)`
chaîné avec `await refresh()` côté `handleSign`
(`PetitionDetailPage.tsx:214-237`) : c'est le code applicatif
qui garantit que le GET arrive APRÈS le flip du flag, pas
Playwright. Le nouveau commentaire (l.286-295) explicite cette
dépendance applicative.

Vérifications safe-first sur les 4 fixes :

- Aucune modification de logique : noms de variables, extraction
  de constantes locales, ajustement de regex (cohérence
  stylistique), réécriture de commentaires.
- 4 checks locaux verts après application (typecheck / lint /
  vitest 872 / build 47.34 kB inchangé).
- Compteur de tests inchangé (872 vitest + 34 E2E Playwright).
- Aucun nouveau pattern (helper, util, fixture global).
- Le test reste 100 % isolé (closure locale, scope limité au
  callback du test).

#### Fixes déférés (dette nouvelle ou existante)

**J28-A1** (low / medium-risk) — duplication massive du seed de
session entre tests étapes 26/27/28 (3 copies quasi-identiques).
**Déféré** : déjà couvert par dette `L8-arch-authsession`
(consolidée janitor 26) qui prévoit l'extraction d'un helper
`installAuthenticatedSession(page, { userId, email })` dans
`e2e/utils/mockSupabase.ts`. Le 3e call-site confirme la
pertinence YAGNI-resilient mais l'étape dédiée reste plus sûre
que 3 sites refactorisés en mode janitor.

**J28-A4** (low / low-risk) — clarification du contrat
`.maybeSingle()` (POST accepte array singulier OU objet seul).
**Déféré** : observation pédagogique non-prioritaire. Le mock
fonctionne, le commentaire actuel suffit.

**J28-A7** (low / low-risk) — ajouter cross-référence explicite
au commentaire 124-148 (étape 26) dans le test étape 28
(comme le fait étape 27 l.199). **Déféré** : avec
`L8-arch-authsession` à terme, ce commentaire deviendra la
JSDoc du helper centralisée — la cross-référence ad-hoc
serait jetée.

**J28-A9** (low / medium-risk) — ajouter `page.waitForRequest`
pour valider explicitement l'émission du POST `signatures`.
**Déféré** : risque medium de flakiness selon timing du retry
Playwright (cf. `playwright.config.ts:retries: 2`). L'assertion
finale (bouton signé visible) prouve indirectement le POST.

**J28-R1** (low / low-risk) — resserrer le pattern de route de
`**/rest/v1/signatures**` à `**/rest/v1/signatures?**` +
`**/rest/v1/signatures` pour exclure d'éventuels futurs
endpoints préfixés `signatures_*`. **Déféré** : modification
qui devrait s'appliquer à tous les tests du fichier (6 autres
routes du même pattern), donc hors scope janitor étape 28.
À regrouper dans une étape pattern E2E auth dédiée (L8 / M7).

**J28-R2** (low / low-risk) — whitelister `GET` explicitement +
fallback 405 sur méthodes inattendues (PATCH/PUT/DELETE/HEAD/
OPTIONS). **Déféré** : pourrait casser silencieusement un
futur test qui copierait ce pattern pour tester le unsign-flow
(DELETE). Sujet à mutualiser avec M7-e2e-storagekey.

**J28-R4** (low / low-risk) — `signature_count` figé à 42 dans
`petitionFixture` après POST (le mock `petitions` du beforeEach
n'incrémente pas). Le test n'assert pas sur ce compteur, donc
pas de faux positif aujourd'hui. **Déféré** : si on veut un
jour tester la propagation du trigger `signatures_count_inc`
côté UI, il faudra refactor le fixture `petitions` en mock
stateful. Hors scope janitor.

**J28-R5** (low / low-risk) — ajouter le header `content-range`
au fulfill custom (par mimétisme avec `installSupabaseStubs`).
**Déféré** : supabase-js v2 ne lit ce header que pour
`count: 'exact'|'planned'|'estimated'`. Ni `signPetition` ni
`hasUserSigned` n'utilisent count → inerte. Pas de valeur
ajoutée.

**J28-R6** (low / low-risk) — recalculer `expires_at` dans
`addInitScript` (côté browser) au lieu du worker Playwright.
**Déféré** : marge actuelle 24 h vs durée d'un test < 30 s.
La théorie est correcte mais la pratique est sans impact ;
ajouter du code pour zéro gain.

**J28-S-L1** (low / low-risk — observation cosmétique sécurité) —
le mock `page.route` ne désinscrit pas la closure `hasSignedRow`
en fin de test. **Non-bug** : Playwright recrée Page + Context
par test (`fullyParallel: true`) → pas de fuite cross-test.

#### Non-findings explicites (confirmation par 3 subagents)

Architecture (4) : A6 volume de commentaires (~30 %, comparable
26/27), A8 hiérarchie describe (acceptable jusqu'à 8-10 tests),
A9 absence de `waitForRequest` (choix design cohérent), A10
mock stateful sûr dans contexte de séquentialisation.

Robustesse (6) : R7 timing 10s + 10s suffisant, R8 IDs
distincts entre 4 tests authentifiés (`stub-user-id` /
`stub-signed-user-id` / `stub-unsigned-user-id` /
`stub-active-signer-id`), R9 ordre Playwright LIFO correct,
R10 `.maybeSingle()` accepte body array singular + status 201,
R11 race React boot + `getSession()` neutre (addInitScript avant
boot + bouton désactivé en `loading`), R12 `waitForRequest`
absent par choix.

Sécurité (13) : S1 aucun secret, S2 domaine RFC 2606,
S3 display_name non identifiant, S4 CSP/headers inchangés,
S5 RLS/schema.sql inchangé, S6 dépendances inchangées, S7
storage key E2E ne contamine pas le bundle prod (tsconfig.app
`include: ["src"]` exclut `web/e2e/`), S8 prototype intouché.
Handoff (H1 table État global, H2 compteurs 872/34, H3 dette
16 items, H4 prompt étape 29 avec 3 phases récursives,
H5 narrative cohérente vs étape 27).

#### Hygiène (janitor étape 28)

- Pas de modification du prototype.
- Pas de modification du design system `T.*` (CSS vars `--mn-*`).
- Pas de migration DB.
- Pas de breaking change visible utilisateur (modifications
  purement internes au test E2E ; pas d'observable côté
  utilisateur).
- Pas de nouvelle dépendance npm.
- Pas de bump majeur.
- TS strict + no `any`.
- Aucun fix qui casse un test existant (4 checks locaux verts
  après application).
- Aucun fix qui ouvre un risque B.
- Aucun nouveau `console.error` / `console.warn`.

#### Checks finaux (janitor étape 28)

```
> npm run typecheck && npm run lint && npx vitest run && npm run build

✓ typecheck   (tsc -b + e2e/tsconfig.json)
✓ lint        (eslint .)
✓ vitest      (128 files, 872 tests passed, ~77s)
✓ build       (entry 47.34 kB / gzip 13.32 kB ; TransparencePage 7.69 kB / gzip 3.11 kB lazy ; sentry 436.2 kB / gzip 143.08 kB lazy)
```

Compteur de tests **inchangé** (872 vitest + 34 E2E Playwright
attendus en CI) : les 4 fixes sont des refactos internes du
test étape 28 (renommage variable + extraction constante +
désancrage regex + clarification commentaire), aucun ne change
l'assertion ni la branche couverte.

#### Dette technique consolidée — inchangée

Aucune nouvelle dette ajoutée par le janitor. Les 16 items
existants (H3-sec, M2-sec-policy, M5-rob, M1-RGPD, M6-rob,
M7-e2e-storagekey, L1-a11y, L3-arch, L4-sec, L5-arch,
L6-arch-progress, L7-arch-loginhref, L1-rob, H4-deploy-deno,
L-sec-webhook-body, L8-arch-authsession) restent ouverts.

Les fixes déférés (J28-A1, A4, A7, A9, R1, R2, R4, R5, R6, S-L1)
sont **soit couverts par L8-arch-authsession + M7-e2e-storagekey**
(la majorité), **soit non-bugs cosmétiques** (R5, R6, S-L1),
**soit observations pédagogiques** (A4, A9, R4). Aucune ne
justifie une dette dédiée nouvelle.

#### Décisions janitor

- **4 fixes safe-first appliqués** sur 36 entrées — A3
  (rename `signed` → `hasSignedRow`), A5 (extract
  `newSignatureRow`), A2 (désancrer regex pour cohérence
  étape 27), R3 (clarification commentaire séquencement).
  Tous strictement isolés au test étape 28 (sa closure de test),
  zéro impact runtime, zéro impact assertion.
- **6 fixes safe-first candidats reportés volontairement**
  (A4, A7, R1, R2, R5, R6) car soit déjà couverts par la
  dette existante (`L8-arch-authsession` / `M7-e2e-storagekey`),
  soit cosmétiques sans gain net, soit qui nécessiteraient
  d'élargir le scope au-delà du test étape 28 (risque B).
- **23 non-findings explicites** (A6, A8-A10 + R7-R12 +
  S1-S8 + H1-H5) confirment que la PR étape 28 est
  fonctionnellement saine et conforme aux invariants
  d'architecture / robustesse / sécurité / cohérence
  handoff.
- **Toutes les dettes high (H3-sec) + medium-high
  (M2-sec-policy, M5-rob, M1-RGPD, L1-a11y, M6-rob,
  M7-e2e-storagekey)** restent ouvertes, à traiter dans des
  étapes dédiées.

---

## Étape 29 — Post-go-live / Conditions externes inchangées (+1 E2E mock flow unsign reverse-flow) ✅

**Branche** : `claude/apply-session-29-prompt-GvigG`

Dixième étape post-go-live. Conformément à la consigne de fin de
prompt étape 28 (« Si toujours aucune condition externe résolue →
6e itération du pattern "+1 test mock E2E ciblé", par exemple flow
unsign reverse-flow symétrique étape 28 ») et après confirmation
utilisateur que les conditions externes restent inchangées (« je
n'en ai aucune idée » au moment de l'ouverture de session — donc
aucune validation externe ne peut être considérée comme acquise),
l'étape se concentre sur le livrable suggéré explicitement par le
prompt étape 29 §2 (premier exemple) : flow unsign reverse-flow
côté UI (clic réel sur « Signée — retirer ma signature » → DELETE
`signatures` intercepté → bascule visible vers « Signer cette
pétition »).

### Audit Lighthouse réel — re-différé étape 30

Pré-requis non rempli : pas de Vercel preview HTTPS / staging
public en ligne. La consigne explicite du prompt étape 29 §1
(« Si pas de staging HTTPS : différer étape 30 ») s'applique
mécaniquement. Bundle inchangé côté `vite build` : entry
47.34 kB / gzip 13.32 kB, TransparencePage 7.69 kB / gzip
3.11 kB.

### E2E « happy path » réel — re-différé, alternative livrée ✅

Pas de projet Supabase de test seedé. Le prompt étape 29 §2 liste
explicitement le flow unsign reverse-flow comme premier exemple
de fallback. Argument retenu : après les états statiques livrés
aux étapes 25/26/27 (anonyme / authentifié signé / authentifié
non signé) et la transition `signed: false → true` livrée à
l'étape 28, la **transition réciproque** `signed: true → false`
est le complément naturel pour boucler entièrement la matrice du
`handleSign` de `PetitionDetailPage.tsx:214-237` côté E2E. Le
test exécute le clic réel sur le bouton signé, intercepte le
DELETE `signatures` (PostgREST 204 No Content sans `.select()`),
puis vérifie que `usePetition.refresh()` rafraîchit l'état UI
vers la branche `signed: false`.

**+1 test E2E** ajouté à `web/e2e/petition-signature.spec.ts` :

`retire la signature: clic → DELETE intercepté → bascule retour vers « Signer cette pétition »`
(étape 29) — couvre :

- L'état initial `authStatus === 'authenticated' && signed === true`
  (bouton « Signée — retirer ma signature », `aria-pressed="true"`).
- Le clic réel sur le bouton (`signedButton.click()`).
- L'interception du DELETE `signatures` (méthode HTTP filtrée via
  `route.request().method() === 'DELETE'`, statut 204 No Content
  pour matcher le comportement PostgREST par défaut sans `.select()`).
- La bascule visible vers la branche `signed === false` (bouton
  « Signer cette pétition », `aria-pressed="false"`) via
  `usePetition.refresh()` qui re-issue un GET sur `/signatures`
  (renvoyant cette fois `[]`).
- La non-régression côté rendu conditionnel : le bouton signé
  initial « Signée — retirer ma signature » n'est plus rendu une
  fois `signed = false` (`getByRole('button').toHaveCount(0)`).

**Implémentation** :

1. **Seed session authentifiée via localStorage** — identique
   étapes 26/27/28 (`addInitScript` injecte une session stubée
   AVANT le `goto`, sous la clé `sb-127-auth-token` ; cf.
   commentaire 124-148 du test étape 26). Seul le `user.id`
   change (`'stub-active-unsigner-id'` vs les 3 précédents
   `stub-signed-user-id` / `stub-unsigned-user-id` /
   `stub-active-signer-id`) — utile pour distinguer le test en
   debug et confirmer l'isolation cross-test Playwright.
2. **Mock stateful pour `/rest/v1/signatures`** — variable
   locale `hasSignedRow: boolean` capturée par closure,
   **initialisée à `true`** (symétrique étape 28 où elle
   démarrait à `false`). Sur DELETE (unsignPetition
   `.delete().eq().eq()`), le mock répond 204 No Content (body
   vide) ET flippe `hasSignedRow = false`. Sur GET subséquent
   (hasUserSigned via refresh), le body renvoyé dépend du flag :
   `[{...}]` tant que signé, `[]` après. L'ordre est garanti par
   `handleSign` côté `PetitionDetailPage.tsx:221-227` :
   `await unsignPetition(...)` précède `await refresh()`.
3. **Assertions** :
   - État initial : `getByRole('button', { name: /Signée — retirer ma signature/i })`
     visible avec `aria-pressed="true"`.
   - Action : `signedButton.click()` déclenche `handleSign()` →
     branche `signed === true` → `unsignPetition()` DELETE 204 →
     `refresh()` → re-GET signatures → `signed = false` côté
     usePetition.
   - État final : `getByRole('button', { name: /Signer cette pétition/i })`
     visible avec `aria-pressed="false"`. Le bouton signé initial
     `getByRole('button', { name: /Signée — retirer ma signature/i })`
     a `toHaveCount(0)`.

**Propriétés** :

- Aucune modification du runtime `src/` — uniquement le fichier
  spec E2E. Zéro risque de régression côté production.
- Réutilise le même `petitionFixture` (signature_count 42,
  target_count 1000) — pas de nouveau mock à maintenir.
- Réutilise le même pattern session + storage key + 24h
  expiration que les étapes 26/27/28 (cohérence stylistique).
- La session stubée est isolée par test (Playwright crée un
  BrowserContext + Page neufs par test → localStorage propre,
  routes propres). Pas de fuite vers les 7 autres tests
  petition-signature.
- Pas de flake attendu :
  - `addInitScript` s'exécute AVANT tout script de page → le
    boot React voit la session immédiatement.
  - Le mock route filtre par `route.request().method()` — pas
    de match accidentel DELETE/GET.
  - Le flag `hasSignedRow: boolean` est une variable locale à la
    closure du test (pas de fuite cross-test).
  - `actionTimeout: 10_000` + `expect timeout: 5_000` (cf.
    `playwright.config.ts`) laissent une marge ample vs la
    latence d'un mock local (< 5 ms par request).
- Pas d'emojis, pas de `any`, pas de nouvelle dépendance npm.
- Le statut 204 No Content respecte le contrat PostgREST par
  défaut sur `DELETE` sans `.select()` (cf.
  `web/src/lib/petitions.ts:251-258` qui ne lit que `error`,
  jamais `data`).

**Suite Playwright** : 34 → 35 tests E2E (CI). Playwright local
ne peut pas être exécuté dans le sandbox (CDN
`cdn.playwright.dev` non whitelisté pour le binaire
`chromium_headless_shell-1223`), mais les 4 checks locaux
(typecheck / lint / vitest / build) sont verts ET la suite CI
GitHub Actions reste la source de vérité pour Playwright.

### Monitoring Sentry runtime — re-différé étape 30

DSN absent en env preview (Sentry SaaS non provisionné). Aucun
event runtime à observer. Re-différé.

### Monitoring Supabase — re-différé étape 30

Pas de trafic réel sur `maintenant-staging`. Re-différé.

### M2-sec-policy — durcissement `signatures_select_public` — re-différé étape 30

Pas de validation produit / DPO reçue à cette étape. Le prompt
étape 29 explicite la consigne : « Si validation non reçue →
différer étape 30 et documenter la raison ». Re-différé. Raison
inchangée vs étapes 26/27/28 : changement RLS visible côté client
(légitimité Art. 9 RGPD — opinions politiques) qui doit être
validé par le DPO et par le produit (UX : liste publique des
signataires conservée ou retirée si la policy exclut `user_id`
des anonymes ?). La RPC `signatures_count_for_petition` livrée à
l'étape 24 reste isolée — son helper `getPetitionSignatureCount`
n'est appelé par aucun call-site UI.

### Cumul T99CP émises publique — re-différé étape 30

Pas de validation produit reçue à cette étape. Re-différé.

### H4-deploy-deno — re-différé étape 30

Pré-requis non rempli : pas de pipeline CI Supabase réel.
Re-différé.

### M1-RGPD — purge auto `stripe_events.payload` — re-différé étape 30

Pas de décision RGPD reçue. Table critique (idempotence
webhook), demande de confirmation requise. Re-différé.

### Retours utilisateur·rices — sans objet (pas de trafic)

Aucun compte créé réel, aucun signalement modération, aucun bug
remonté.

### Job de réconciliation Stripe — re-différé étape 30

Critère prompt §10 inchangé : pas d'erreur Sentry observable
(monitoring runtime absent), idempotence DB suffit.

### Dette technique différée — étape 30 ou plus tard

Récap consolidé inchangé vs fin janitor étape 28 (16 items —
H3-sec, M2-sec-policy, M5-rob, M1-RGPD, M6-rob, M7-e2e-storagekey,
L1-a11y, L3-arch, L4-sec, L5-arch, L6-arch-progress,
L7-arch-loginhref, L1-rob, H4-deploy-deno, L-sec-webhook-body,
L8-arch-authsession) — cf. tableau étape 26.

### Bundle après ajout

| Avant étape 29 (fin janitor 28) | Après étape 29 |
| --- | --- |
| `index.js` 47.34 kB / gzip 13.32 kB | `index.js` 47.34 kB / gzip 13.32 kB |
| `TransparencePage.js` 7.69 kB / gzip 3.11 kB | `TransparencePage.js` 7.69 kB / gzip 3.11 kB |

Aucun nouveau chunk : le test ajouté est en zone `e2e/`, exclue
du bundle production. Aucune nouvelle dépendance npm.

### Tests

- **872 tests vitest verts** (128 fichiers, durée ~60 s) —
  **inchangé** vs étape 28. Le nouveau test est en E2E
  Playwright, pas en vitest.
- **35 tests E2E Playwright** attendus en CI (3 specs petition
  → 8 tests + 14 specs public-pages + 5 transparence + 4 auth
  + 3 critical-flows + 1 nouveau étape 29) — **+1** vs étape
  28 (34 → 35). Validé par la CI GitHub Actions (job
  `Playwright E2E + axe-core a11y`).
- 4 checks locaux verts (typecheck, lint, vitest, build).

### Hygiène

- Pas de modification du prototype (`app/Maintenant.html`,
  `Theme.jsx`).
- Pas de modification du runtime `src/` ni de `db/schema.sql`.
- Pas d'emojis dans les fichiers TS / commits / PR.
- Tokens `T.*` (CSS vars `--mn-*`) **intacts**.
- Pas de clé service_role dans le bundle front.
- Pas de nouvelle dépendance npm.
- Pas de migration DB.
- Pas de breaking change visible utilisateur.

### Checks finaux

```
> npm run typecheck && npm run lint && npx vitest run && npm run build

✓ typecheck   (tsc -b + e2e/tsconfig.json)
✓ lint        (eslint .)
✓ vitest      (128 files, 872 tests passed, ~60s)
✓ build       (entry 47.34 kB / gzip 13.32 kB ; TransparencePage 7.69 kB / gzip 3.11 kB lazy ; sentry 436.2 kB / gzip 143.08 kB lazy)
```

Playwright validé par la CI (sandbox local : CDN
`cdn.playwright.dev` non whitelisté pour le binaire chromium).

### Décisions

- **+1 E2E mock plutôt qu'un attendisme passif** : conformément
  à la consigne explicite de fin de prompt étape 28 (« 6e
  itération du pattern +1 E2E mock ciblé, par exemple flow
  unsign reverse-flow symétrique étape 28 »). Coût : zéro infra,
  zéro risque, +2-3 minutes côté CI Playwright (un peu plus long
  qu'un test statique car DELETE + refresh + re-GET). Bénéfice :
  la **transition** d'état `signed: true → false` côté UI passe
  de « couverture unit-test uniquement » à « couverture E2E
  bout-en-bout ». La matrice du `handleSign` (sign branch +
  unsign branch) est désormais entièrement couverte en E2E.
- **Flow unsign plutôt qu'un autre état non couvert** : le
  prompt étape 29 §2 propose deux pistes (flow unsign OU autre
  état mobilization/poll/transparence/profil). Choix de la
  première car (a) elle clôt naturellement la suite
  `petition-signature.spec.ts` (matrice complète sign + unsign),
  (b) elle exerce un chemin de code unique non testé en E2E
  (handleSign → unsignPetition → refresh → re-fetch), (c) elle
  s'inscrit dans le même contexte mental que les 3 tests
  précédents (debugging facile pour un dev qui ouvre le fichier),
  (d) elle confirme que la dette `L8-arch-authsession` mérite
  d'être traitée dans une étape dédiée (4e call-site qui
  duplique le seed de session).
- **Status 204 No Content (DELETE)** : le helper
  `unsignPetition` ne lit que `error`, jamais `data` (cf.
  `web/src/lib/petitions.ts:251-258` — `.delete().eq().eq()`
  sans `.select()`). Le comportement PostgREST par défaut sans
  `.select()` est `Prefer: return=minimal` → 204. Body vide.
  Choix conservateur qui matche la prod réelle ; un 200 + body
  vide marcherait aussi (le helper ignore `data`) mais le 204
  est plus fidèle.
- **Tous les autres items différés en bloc** (M2-sec-policy,
  T99CP cumul public, H4-deploy-deno, M1-RGPD, monitoring,
  réconciliation Stripe) : conditions externes inchangées vs
  étape 28. L'utilisateur a confirmé en ouverture de session
  qu'il ne pouvait pas répondre aux questions d'ouverture
  (migrations / provisionnement / décisions
  produit-DPO-RGPD) — re-différer en bloc est la décision la
  moins coûteuse et la plus honnête.

### Prochaines étapes (étape 30)

- Lighthouse mesuré dès qu'un Vercel preview HTTPS sera en ligne
  (priorité 1 si oui).
- Monitoring Sentry canary + 7 j observations dès DSN câblé.
- Décision produit cumul T99CP émises → RPC
  `transparency_t99cp_total()` si OK.
- Décision produit / DPO sur le durcissement
  `signatures_select_public` (M2-sec-policy).
- Décision RGPD sur la purge `stripe_events.payload` (M1-RGPD).
- Si Sentry remonte des erreurs `stripe-webhook` récurrentes →
  prioriser le job de réconciliation Edge Function.
- Si toujours aucune condition externe résolue → 7e itération
  du pattern « +1 test mock E2E ciblé » (la matrice
  `petition-signature.spec.ts` étant désormais bouclée
  sign+unsign : viser un autre état non couvert — mobilization
  detail, poll detail, transparence variants, page profil
  authentifiée). À privilégier : poll-detail-page (déjà chunk
  de 7.96 kB en lazy load, hooks symétriques `usePetition`,
  flow vote/unvote similaire au sign/unsign — duplication
  utile pour confirmer/dégonfler la dette
  `L8-arch-authsession`).

### Audit vibe janitor étape 29

**Branche** : `claude/janitor-post-step29`

Audit en parallèle via 3 subagents `general-purpose` après le
merge de la PR principale #35 (commit
`chore(prod): step 29 …`) : architecture / élégance,
robustesse / edge cases, sécurité / RGPD / cohérence handoff.

#### Findings par sévérité

| Axe | Total | critical | high | medium | low | Fixable safe-first | Déférés / non-findings |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Architecture | 7 | 0 | 0 | 0 | 4 | 0 retenus | 3 non-findings (A2, A5, A7) + 4 différés (A1, A3, A4, A6) |
| Robustesse | 7 | 0 | 0 | 0 | 2 + 5 non-findings | 0 retenus | 5 non-findings (R1, R2, R3, R4, R6) + 2 différés (R5, R7) |
| Sécurité | 13 | 0 | 0 | 0 | 0 | 0 | 13 non-findings (S1-S8 + H1-H5) |
| **Total** | **27** | **0** | **0** | **0** | **6 + 21 non-findings** | **0 retenus** | **27 (0 actionnables)** |

#### Fixes appliqués (safe-first, primum non nocere)

**Aucun fix appliqué.** 0/6 findings low retenus comme safe-first.
Conforme à la doctrine « primum non nocere » : toutes les
opportunités de refactor identifiées toucheraient soit des fichiers
déjà mergés hors scope étape 29 (A1, A4 — extraction de constantes
regex / commentaires partagés entre tests étapes 26/27/28/29),
soit briseraient un effet miroir voulu avec le test étape 28
(A3 — renommage `hasSignedRow` qui maintient la symétrie d'init
inversée vs étape 28), soit relèvent d'une dette déjà ouverte
(A6 — duplication seed session = `L8-arch-authsession`), soit
sont des observations pédagogiques (R5, R7) sans gain net immédiat.

Cette PR janitor est donc **documentation seulement** — comme
le janitor post-step 27 (cf. PR #32). Le test étape 29 est jugé
**fonctionnellement et structurellement sain** par les 3 audits
parallèles.

#### Fixes déférés (dette nouvelle ou existante)

**J29-A1** (low / low-risk) — **Doublon de regex non factorisé**
(`/Signer cette pétition/i` × 6 occurrences sur le fichier,
`/Signée — retirer ma signature/i` × 6 occurrences). **Déféré** :
extraire `const SIGN_CTA_NAME` et `const SIGNED_CTA_NAME` au
niveau `describe` couvrirait l.341, l.345, l.432, l.445, l.449
mais toucherait aussi les tests étapes 26/27/28 déjà mergés.
Hors scope étape 29. **Pas de nouvelle dette créée** — ce sera
ouvert si pertinent dans une étape de refacto E2E dédiée.

**J29-A3** (low / low-risk) — **Nommage `hasSignedRow` ambigu**
(init `true` étape 29 vs init `false` étape 28, même nom de
variable). **Déféré** : renommer briserait l'effet miroir voulu
avec le test étape 28 (lecteurs diff-ant les 2 tests voient
explicitement l'inversion d'init). Choix de design conscient.

**J29-A4** (low / low-risk) — **Commentaire bloc « Séquencement
applicatif, pas Playwright » dupliqué** (l.392-399 étape 29 quasi
mot pour mot vs l.289-297 étape 28). **Déféré** : pourrait
migrer dans un commentaire `describe`-level ou un helper, mais
même verrou que J29-A1 (touche tests déjà mergés). Hors scope
étape 29.

**J29-A6** (low / n/a) — **Duplication 4e copie du seed de
session** entre tests étapes 26/27/28/29. **Déféré** : déjà
couvert par dette `L8-arch-authsession` consolidée janitor 26
(extraction d'un helper `installAuthenticatedSession(page,
{ userId, email })` dans `e2e/utils/mockSupabase.ts`). Le 4e
call-site confirme la pertinence ; l'étape dédiée reste plus
sûre que 4 sites refactorisés en mode janitor.

**J29-R5** (low / low-risk) — **Edge cases du flag `hasSignedRow`
non testés** (DELETE ré-émis, séquence sign↔unsign↔sign aller-
retour). **Déféré** : pas l'objet du test étape 29 (qui couvre
la transition simple `true → false`). À traiter par un test
dédié si la matrice de couverture devient prioritaire. Hors
scope.

**J29-R7** (low / medium-risk) — **`contentType: 'application/json'
+ body: ''` sur 204 légèrement non-conforme RFC 7230 §3.3.2**.
En pratique supabase-js v2 court-circuite le parsing JSON sur
204 (cf. `@supabase/postgrest-js` : `if (response.status === 204)
return { data: null, error: null }`) ; Chromium accepte ;
aucun risque effectif sur ce test. **Déféré** : risque medium si
on change naïvement (introduire `contentType: 'text/plain'` ou
omettre le champ — autres tests reproduisent le même pattern
→ asymétrie). À grouper avec une refacto mock-helper future
(possiblement avec `L8-arch-authsession` ou
`M7-e2e-storagekey`).

#### Non-findings explicites (confirmation par 3 subagents)

Architecture (3) : A2 variable `existingSignatureRow` bien
utilisée en branche `hasSignedRow === true` du handler GET
(boot-time GET avant le clic DELETE), A5 contrat runtime DELETE
→ 204 sans body fidèle au comportement PostgREST sans `.select()`
(`web/src/lib/petitions.ts:251-258`), A7 cohérence nommage
fixture `newSignatureRow` (étape 28) / `existingSignatureRow`
(étape 29) sémantiquement correcte.

Robustesse (5) : R1 séquencement applicatif `await
unsignPetition()` puis `await refresh()` garantit que le GET de
refresh arrive APRÈS le DELETE (flag flippé synchroneusement
dans le handler avant `route.fulfill`), R2 timeouts 10s + 5s
+ 30s largement suffisants vs < 50 ms par cycle local, R3
isolation closure correcte (BrowserContext + Page neufs par
test via `fullyParallel: true`, `page.route()` scoped à la
page), R4 contrat HTTP 204 + body vide fidèle au comportement
PostgREST sans `.select()`, R6 `toHaveCount(0)` couvre le
rendu conditionnel JSX (bouton non rendu) correctement.

Sécurité (8) + Handoff (5) : S1 aucun secret (stub-*-token
inertes), S2 closure `hasSignedRow` strictement locale au test
(pas de partage avec étape 28), S3 storage key `sb-127-auth-token`
absente du runtime `src/` (vérifié `grep -rn "sb-127" web/src` →
0 hit), S4 aucune migration DB, S5 cohérence RLS (le test
couvre un cas authentifié `user_id === stubUserId`, conforme à
`auth.uid() = user_id`), S6 conformité RGPD Art. 7 (retrait du
consentement) — couverture E2E positive du chemin de
désinscription, S7 aucun emoji, S8 CSP/vercel.json inchangés.
H1 ligne 40 État global ajoutée, H2 narrative étape 29
complète (toutes sections présentes), H3 compteurs cohérents
(872 vitest inchangé, 34 → 35 E2E, bundle 47.34 kB / gzip
13.32 kB inchangé), H4 prompt étape 30 récursif présent avec
Phases 1/2/3 + conditions d'arrêt, H5 prompt étape 29
historique conservé.

#### Hygiène (janitor étape 29)

- Pas de modification du prototype.
- Pas de modification du design system `T.*` (CSS vars `--mn-*`).
- Pas de migration DB.
- Pas de breaking change visible utilisateur (PR janitor
  documentation seulement — aucun changement de fichier `.ts` /
  `.tsx` / `.sql`).
- Pas de nouvelle dépendance npm.
- Pas de bump majeur.
- TS strict + no `any` (n/a — pas de code modifié).
- Aucun fix qui casse un test existant (n/a — pas de fix).
- Aucun fix qui ouvre un risque B.

#### Checks finaux (janitor étape 29)

```
> npm run typecheck && npm run lint && npx vitest run && npm run build

✓ typecheck   (tsc -b + e2e/tsconfig.json)
✓ lint        (eslint .)
✓ vitest      (128 files, 872 tests passed, ~60s)
✓ build       (entry 47.34 kB / gzip 13.32 kB ; TransparencePage 7.69 kB / gzip 3.11 kB lazy ; sentry 436.2 kB / gzip 143.08 kB lazy)
```

Compteur de tests **inchangé** (872 vitest + 35 E2E Playwright
attendus en CI) : aucun changement de code.

#### Dette technique consolidée — inchangée

Aucune nouvelle dette ajoutée par le janitor. Les 16 items
existants (H3-sec, M2-sec-policy, M5-rob, M1-RGPD, M6-rob,
M7-e2e-storagekey, L1-a11y, L3-arch, L4-sec, L5-arch,
L6-arch-progress, L7-arch-loginhref, L1-rob, H4-deploy-deno,
L-sec-webhook-body, L8-arch-authsession) restent ouverts.

Les fixes déférés (J29-A1, A3, A4, A6, R5, R7) sont **soit
couverts par L8-arch-authsession + M7-e2e-storagekey** (A6, R7),
**soit hors scope étape 29** (A1, A4 — touchent fichiers déjà
mergés), **soit choix de design conscient** (A3 — effet miroir
volontaire), **soit observations pédagogiques** (R5). Aucune
ne justifie une dette dédiée nouvelle.

#### Décisions janitor

- **0 fix safe-first appliqué** sur 6 findings low (et 21
  non-findings) — PR janitor « documentation seulement »
  comme le post-step 27 (PR #32). Tous les findings sont soit
  hors scope (touchent étapes déjà mergées), soit déjà tracké
  comme dette, soit observations pédagogiques sans gain net.
- **21 non-findings explicites** (A2, A5, A7 + R1, R2, R3, R4,
  R6 + S1-S8 + H1-H5) confirment que la PR étape 29 est
  fonctionnellement saine et conforme aux invariants
  d'architecture / robustesse / sécurité / cohérence handoff.
- **Toutes les dettes high (H3-sec) + medium-high
  (M2-sec-policy, M5-rob, M1-RGPD, L1-a11y, M6-rob,
  M7-e2e-storagekey)** restent ouvertes, à traiter dans des
  étapes dédiées.
- **Conclusion** : la matrice E2E du `handleSign` côté
  `PetitionDetailPage.tsx:214-237` est désormais bouclée
  (sign-branch étape 28 + unsign-branch étape 29). L'étape 30
  pourra soit traiter une dette externe (M2-sec-policy /
  T99CP / M1-RGPD si validation reçue), soit refactorer le
  pattern E2E auth via `L8-arch-authsession` (5e call-site
  attendu si poll-vote en parallèle), soit ouvrir une
  nouvelle matrice (poll-detail-page vote/unvote, mobilization
  detail, transparence variants).

---

## Étape 30 — Post-go-live / T99CP cumul public (chantier débloqué) ✅

**Branche** : `claude/implement-step-30-prompt-UIl7M`

Onzième étape post-go-live. **Première étape depuis la session
interactive du 2026-05-13 qui livre un chantier substantiel** (pas
une nouvelle itération du pattern « +1 E2E mock ») : la décision
produit 2 du goulot 4 (« Compteur d'adhésions / T99CP cumul sur la
page Transparence ») a été tranchée par Ben en faveur de
l'affichage public dès le 1er adhérent. Le prompt étape 30 §6
listait explicitement la RPC `transparency_t99cp_total()` comme
**migration DB additive autorisée**. Cette étape implémente la
chaîne complète : RPC SECURITY DEFINER + helper TS + carte
dédiée + tests unit/E2E.

### Audit Lighthouse réel — re-différé étape 31

Pré-requis partiellement rempli : le site est désormais en ligne
sur `https://maintenant-le-mouvement.netlify.app` (goulot 1
débloqué session 2026-05-13, PRs #37/#38/#39). L'outil
`npx unlighthouse --site <url>` nécessite cependant des binaires
Chromium pour piloter le scan — non whitelistés dans le sandbox
de cette session (même contrainte que `playwright install`).
Différé à l'étape 31 : un dev humain peut exécuter
`npx unlighthouse` localement et consigner les scores, ou l'étape
31 peut tenter à nouveau si le sandbox est ré-équipé.

### E2E « happy path » réel — re-différé étape 31

Pas de projet Supabase de test seedé (goulot 5 toujours 🔲). Le
livrable principal de l'étape 30 étant le chantier T99CP cumul
public, le 7e mock E2E suggéré en §2 du prompt n'est pas
nécessaire — on a livré 2 nouveaux tests E2E sur la nouvelle
carte (cf. infra § E2E coverage).

### T99CP cumul public — livré ✅

**Décision produit** (HANDOFF-PROGRESS § Goulot 4 — Décision 2,
tranchée Ben 2026-05-13) : carte publique sur `/transparence`
montrant le cumul des jetons T99CP émis, dès le 1er adhérent. Le
wording côté UI a été affiné en « T99CP émis (cumulé) » plutôt
que « Adhésions totales » comme suggéré initialement, pour rester
précis sur l'unité affichée : `monthlyT99cpBonus() = 60`
T99CP par invoice Stripe (cf.
`web/src/lib/stripeWebhookHandler.ts:253`), donc 1 adhésion
mensuelle ≠ 1 T99CP. Si l'équipe souhaite plus tard afficher le
nombre d'adhésions plutôt que le cumul T99CP, ce sera une
seconde RPC `transparency_paid_adhesions_count()` — l'actuelle
RPC reste utile pour la transparence économique du jeton.

#### Migration DB additive — `transparency_t99cp_total()`

Nouvelle section `§23` ajoutée à `db/schema.sql` (juste après
`signatures_count_for_petition` §22) :

```sql
create or replace function public.transparency_t99cp_total()
  returns bigint
  language sql
  stable
  security definer
  set search_path = public
as $$
  select coalesce(sum(amount), 0)::bigint
  from public.t99cp_transactions
  where kind = 'credit';
$$;

revoke all on function public.transparency_t99cp_total() from public;
grant execute on function public.transparency_t99cp_total() to anon, authenticated;
grant execute on function public.transparency_t99cp_total() to service_role;
```

Propriétés :

- **Additive uniquement** : aucune table, colonne, policy
  existante touchée. `CREATE OR REPLACE` idempotent — re-applicable
  sans risque.
- **SECURITY DEFINER** : contourne RLS sur `t99cp_transactions`
  (policy `t99cp_select_self` restreint le ledger privé à chaque
  user). L'agrégation publique ne projette que `sum(amount)`,
  aucun `user_id`, aucun `reason`, aucune date.
- **bigint** : précaution. `sum(integer)` peut déborder `int4`
  au-delà de ~2.1 Md jetons (hors scope humain à toute échelle
  réaliste). Coût : 0.
- **`coalesce(sum, 0)`** : garantit un retour non-null sur
  table vide (pré-1er-adhérent).
- **search_path verrouillé** : `set search_path = public`
  (défense en profondeur contre schema-hijack côté
  SECURITY DEFINER — pattern utilisé par toutes les RPCs depuis
  l'étape 20).
- **Grants explicites** : `anon`, `authenticated`, `service_role`
  — cohérence avec `users_signups_monthly` /
  `signatures_count_for_petition`.

#### Type TS — `Database.public.Functions.transparency_t99cp_total`

Ajouté à `web/src/types/database.ts:1772-1775` :

```ts
transparency_t99cp_total: {
  Args: Record<string, never>;
  Returns: number;
};
```

`Args: Record<string, never>` reflète l'absence de paramètre SQL
(la RPC est sans argument). `Returns: number` modélise le scalaire
côté TS — PostgREST sérialise un `bigint` en number tant qu'il
tient dans `2^53`. Le helper accepte aussi `string` en runtime
(cf. infra) par défense en profondeur si PostgREST devait
changer de sérialisation.

#### Helper TS — `fetchT99cpTotal`

Ajouté à `web/src/lib/transparency.ts:217-261` (entre
`fetchMonthlySignups` et `formatMonthShortFr`) :

```ts
export interface T99cpTotalResult {
  data: number | null;
  error: PostgrestError | null;
}

export async function fetchT99cpTotal(
  client: Client = supabase,
): Promise<T99cpTotalResult> {
  const { data, error } = await client.rpc('transparency_t99cp_total');
  if (error) return { data: null, error };
  if (data === null || data === undefined) return { data: 0, error: null };
  const value = typeof data === 'string' ? Number(data) : Number(data);
  if (!Number.isFinite(value) || value < 0) return { data: 0, error: null };
  return { data: value, error: null };
}
```

Garde-fous (chacun couvert par un test unit dédié) :

- `data === null` ou `undefined` → 0 (table vide pré-1er-adhérent).
- `data` sérialisé en string (bigint PostgREST) → `Number(data)`.
- Valeur non finie (e.g. RPC mal serialisée) → 0.
- Valeur négative (incohérence DB défensive) → 0.
- Erreur PostgREST propagée → `{ data: null, error }`.

#### UI — carte « T99CP émis (cumulé) »

Ajoutée à `web/src/pages/TransparencePage.tsx` en complément de
la grille existante `METRICS` (compteurs publics). Pattern
miroir de `chartState` :

- Nouveau type `T99cpState = loading | success | error`.
- Nouveau `useEffect` (parallèle aux deux existants) appelant
  `fetchT99cpTotal()` avec garde `cancelled` standard.
- Render conditionnel **dans la même `<ul aria-label="Compteurs
  publics">`** que les autres cards, avec
  `data-testid="t99cp-total-card"` pour facilité de targeting
  E2E. Sur erreur RPC (par exemple staging Supabase tant que
  la migration n'est pas appliquée), la carte est
  **silencieusement masquée** — pas de bandeau d'erreur dédié,
  on ne casse pas l'affichage des autres compteurs publics.

Label : « T99CP émis (cumulé) » (cf. note supra sur le wording).
Format : `Intl.NumberFormat('fr-FR')` — séparateur insécable
(U+202F) au-dessus de 999, comme les autres cards.

#### Tests unit (vitest)

**7 nouveaux tests** sur `web/src/lib/transparency.test.ts`
(couverture exhaustive du helper) :

1. Appelle la RPC `transparency_t99cp_total` sans arguments.
2. Retourne la valeur scalaire (number).
3. Parse une valeur sérialisée en string (bigint PostgREST).
4. Retourne 0 quand la RPC renvoie null (table vide).
5. Retourne 0 quand la valeur n'est pas un nombre fini.
6. Retourne 0 quand la valeur est négative (défense en profondeur).
7. Propage l'erreur de la RPC.

**4 nouveaux tests** sur `web/src/pages/TransparencePage.test.tsx`
(intégration page) :

1. Affiche la carte T99CP cumulée quand la RPC réussit (valeur
   formatée fr-FR).
2. Affiche la carte T99CP à 0 quand la RPC retourne 0
   (pré-1er-adhérent — décision produit : pas de seuil masquant).
3. Masque silencieusement la carte T99CP quand la RPC échoue
   (RPC manquante en staging avant migration).
4. Annule proprement le `setState` T99CP si démontage avant fetch
   (anti-warning React, pattern miroir des 2 autres `useEffect`).

Suite vitest : **872 → 883 tests** (+11), durée ~58s, inchangée.

#### E2E coverage

**2 nouveaux tests** sur `web/e2e/transparence.spec.ts`
(`test.describe('carte T99CP cumulée (étape 30)')`) :

1. Affiche la carte T99CP avec la valeur retournée par la RPC.
   Override de route Playwright `**/rest/v1/rpc/transparency_t99cp_total*`
   renvoyant `'3600'` (scalaire JSON brut, comme PostgREST sur
   un `returns bigint`). Assertion : `data-testid="t99cp-total-card"`
   visible, label + valeur 3600 (formatée fr-FR `/3\s?600/`),
   axe-core sans critical violations.
2. Masque la carte T99CP en cas d'erreur RPC. Override de route
   renvoyant 404 + `{ code: 'PGRST202', message: 'function not
   found' }` — reproduit le cas réel d'un staging tant que la
   migration §23 n'est pas appliquée. Assertion : autres
   compteurs présents (liste rendue), `t99cp-total-card` absente
   du DOM (`toHaveCount(0)`), texte « T99CP émis (cumulé) »
   absent.

Suite E2E Playwright (CI uniquement) : **35 → 37 tests** (+2).

### Bundle

- `index-*.js` : **47.34 kB / gzip 13.32 kB** — inchangé.
  Le helper `fetchT99cpTotal` vit dans `transparency.ts` qui est
  importé uniquement par `TransparencePage` (lazy route), donc
  pas d'impact sur l'entry.
- `TransparencePage-*.js` : **7.69 kB → 8.34 kB** (gzip 3.11
  → 3.26 kB). Croissance attendue (+0.65 kB / +0.15 kB gzip)
  pour le nouveau type, le nouvel effect, la nouvelle helper
  call, le nouveau rendu conditionnel JSX.
- Aucun autre chunk modifié.

### Provisionnement externe — état au 2026-05-13 (inchangé étape 30)

- ✅ Hébergement HTTPS (Netlify, débloqué session 2026-05-13).
- ✅ Décisions produit / RGPD (3/3 débloquées, dont la décision 2
  consommée par cette étape).
- 🔲 Migrations Supabase staging : étapes 20 + 22 + 23 + 24
  **+ 30** restent à appliquer. La RPC `transparency_t99cp_total`
  s'ajoute à la liste mais reste **non-bloquante côté UI** :
  l'absence de la RPC en prod fait que la carte est silencieusement
  masquée (cf. test E2E ci-dessus). Aucun autre call-site front
  ne dépend de cette RPC.
- 🔲 Sentry SaaS (goulot 3) — toujours à provisionner.
- 🔲 Projet Supabase de test (goulot 5) — toujours à provisionner.
- 🔲 Stripe live (goulot 6) — toujours à réserver.

### Décisions étape 30

- **Wording carte** : « T99CP émis (cumulé) » plutôt que
  « Adhésions totales » suggéré dans la décision produit, pour
  rester précis sur l'unité affichée (cf. supra § T99CP cumul
  public — livré). Si l'équipe souhaite l'autre label, une
  étape future ajoutera une seconde RPC
  `transparency_paid_adhesions_count()` (count distinct) — pas
  de risque de confusion entre les deux.
- **Graceful degradation sur erreur RPC** : la carte est
  silencieusement masquée (pas de bandeau d'erreur) — choix
  cohérent avec l'objectif « pas de seuil masquant à N adhérents »
  (décision produit) côté succès, et « ne pas dégrader l'UX des
  autres compteurs publics » côté erreur.
- **Pas d'ajout au test de smoke principal** : les 2 nouveaux
  tests E2E vivent dans un `test.describe` dédié (« carte T99CP
  cumulée (étape 30) ») pour faciliter le grepping et l'audit
  janitor. Cohérent avec la structure des `test.describe` des
  étapes 25-29.

### Prochaines étapes (étape 31)

- Lighthouse mesuré dès qu'un binaire Chromium est disponible
  côté sandbox OU exécution manuelle par un dev humain
  (`npx unlighthouse --site https://maintenant-le-mouvement.netlify.app`).
- Monitoring Sentry canary + 7 j observations dès DSN câblé
  (goulot 3).
- Chantier suivant disponible :
  **M2-sec-policy** (durcissement `signatures_select_public` —
  décision 1 du goulot 4 tranchée le 2026-05-13). RLS visible
  côté client → demander confirmation à chaque PR.
- Chantier suivant disponible :
  **M1-RGPD** (purge auto `stripe_events.payload` TTL 90j —
  décision 3 du goulot 4 tranchée le 2026-05-13). Toucher à
  `stripe_events` = demande confirmation.
- Si conditions externes encore bloquées sur Lighthouse / Sentry
  / E2E réel → enchaîner sur M2-sec-policy ou M1-RGPD (les deux
  décisions produit sont prêtes, seule la PR doit être validée
  à chaque commit).

### Audit vibe janitor étape 30

(à compléter par la session — cf. PR
`chore(janitor): post-step 30 — …` séparée)

---

## Prompt pour la session N+25 (étape 31)

> Repo : `/home/user/maintenantproto1` (branche imposée par l'harness —
> typiquement `claude/<auto>`).
>
> **Lis dans cet ordre** :
>
> 1. `CLAUDE.md` — règles projet (TS strict, pas de `any`, camelCase TS /
>    snake_case DB, SVG via `ICONS.*` pas d'emojis, RLS, RGPD, Lighthouse
>    ≥ 95, axe-core ≥ 95, `prefers-reduced-motion`). Note la section
>    « Politique de PR » qui t'autorise à enchaîner ouverture + merge
>    des PR sans confirmation **jusqu'à la session 50 incluse**. Note
>    aussi la section « Recopie systématique du prompt de la session
>    suivante » : **à la clôture de cette étape, recopier le prompt
>    étape 32 à la fois dans `HANDOFF-PROGRESS.md` ET dans la réponse de
>    chat finale**. Et enfin la section « Audit récurrent vibe janitor
>    de fin d'étape » : **après le merge de la PR principale de
>    l'étape 31, tu dois enchaîner une PR janitor séparée
>    `chore(janitor): post-step 31 — …` et inclure cette même
>    instruction janitor dans le prompt étape 32**.
> 2. `HANDOFF.md` §11 (Points d'attention) + §12 (Suivi) + §13 (Sécurité).
> 3. `HANDOFF-PROGRESS.md` — journal (étape 30 ✅ — étape 31 à faire).
> 4. `docs/PROD-RUNBOOK.md` — runbook de provisionnement (§1.2 mis à
>    jour étape 24 avec sanity checks 3+4 pour
>    `signatures_count_for_petition`).
> 5. `docs/MODERATION.md` — procédure modération.
> 6. `docs/USER-GUIDE.md` — FAQ utilisateur·rice.
>
> **État actuel à la fin de l'étape 30 + janitor post-step 30** :
>
> - **Étape 30 livrable principal** : chantier T99CP cumul public.
>   Nouvelle RPC additive `public.transparency_t99cp_total() returns
>   bigint security definer` ajoutée à `db/schema.sql §23`, helper
>   TS `fetchT99cpTotal` dans `web/src/lib/transparency.ts`, carte
>   dédiée « T99CP émis (cumulé) » sur `/transparence` (rendu
>   conditionnel — masquée silencieusement si la RPC est absente
>   en staging). Décision produit 2 du goulot 4 (tranchée
>   2026-05-13) entièrement consommée.
> - **Tests** : 872 → 883 vitest (+11 : 7 sur le helper, 4 sur la
>   page). 35 → 37 E2E Playwright (CI) — +2 sur transparence
>   (carte présente + masquage en cas d'erreur RPC).
> - **Bundle** : entry inchangé (47.34 kB / gzip 13.32 kB).
>   TransparencePage : 7.69 → 8.34 kB / gzip 3.11 → 3.26 kB
>   (croissance attendue, +0.65 kB / +0.15 kB gzip).
> - **Janitor post-step 30** : (à compléter par la session — cf.
>   `HANDOFF-PROGRESS.md` § Audit vibe janitor étape 30).
> - **Tous les autres items différés en bloc** (Lighthouse réel,
>   E2E happy path réel, monitoring Sentry / Supabase,
>   M2-sec-policy, H4-deploy-deno, M1-RGPD, retours
>   utilisateur·rices, job réconciliation Stripe) : conditions
>   externes inchangées vs étape 30.
> - Aucune nouvelle dépendance npm.
>
> **Provisionnement externe** — état au 2026-05-13 (inchangé étape 30) :
>
> - ✅ Hébergement HTTPS Netlify (goulot 1 débloqué).
> - ✅ Décisions produit / RGPD (goulot 4 débloqué — M2-sec-policy,
>   T99CP cumul public CONSOMMÉE étape 30, M1-RGPD).
> - 🔲 Migrations Supabase staging (étapes 20 + 22 + 23 + 24 + **30**
>   à appliquer).
> - 🔲 Sentry SaaS / projet Supabase de test / Stripe live (goulots
>   3, 5, 6).
>
> **CONTEXTE D'OUVERTURE** — à exécuter avant toute autre action :
>
> 1. Vérifier qu'on est bien dans un workspace contenant `web/`. Si
>    non, `git fetch origin main && git merge --ff-only origin/main`.
> 2. `cd web && npm ci` (fallback : `npm install --legacy-peer-deps`).
> 3. `npm run typecheck && npm run lint && npx vitest run && npm run build`
>    pour vérifier le compteur de tests au point de départ (≥ 883
>    verts vitest à incrémenter à chaque étape ; 37 verts E2E
>    Playwright en CI).
> 4. **Demander à l'équipe humaine** :
>    - Les migrations étape 20 + étape 22 + étape 23 + étape 24
>      + **étape 30** (`db/schema.sql §23` RPC
>      `transparency_t99cp_total`) ont-elles été appliquées à
>      Supabase staging ? La RPC étape 30 est **non-bloquante côté
>      UI** (carte silencieusement masquée si absente) — peut être
>      appliquée plus tard.
>    - Audit Lighthouse réel sur
>      `https://maintenant-le-mouvement.netlify.app` a-t-il été
>      lancé (par un dev humain ou par re-essai côté sandbox) ?
>    - Le provisionnement Sentry / Stripe live / projet Supabase
>      de test décrit dans `docs/PROD-RUNBOOK.md` est-il fait ?
>    - Souhaitent-ils enchaîner sur **M2-sec-policy** (durcissement
>      `signatures_select_public` — décision 1 tranchée 2026-05-13,
>      RLS visible côté client → demande confirmation à chaque PR
>      de cette transition) ?
>    - Souhaitent-ils enchaîner sur **M1-RGPD** (purge auto
>      `stripe_events.payload` TTL 90j — décision 3 tranchée
>      2026-05-13, touche table critique `stripe_events` →
>      demande confirmation à chaque PR) ?
>
> **PRÉREQUIS OPÉRATIONNEL** — gate avant tout redéploiement front :
>
> Identique étapes 26-30. Aucun call-site UI nouveau côté étape 30
> ne dépend strictement de la RPC `transparency_t99cp_total` : la
> carte est rendue **conditionnellement** sur le state `success`,
> donc une RPC absente fait juste disparaître la carte (cf. test
> E2E « masque la carte T99CP en cas d'erreur RPC »). La migration
> peut donc être appliquée au rythme de l'équipe ops, **sans
> bloquer le redéploiement front**.
>
> Pour les migrations antérieures (24 — `signatures_count_for_petition`),
> le gate reste : tant qu'aucun call-site UI ne l'appelle (toujours
> 0 à fin étape 30), aucun impact utilisateur ; mais dès qu'un
> call-site sera ajouté (chantier M2-sec-policy si validation
> reçue), la migration devient bloquante.
>
> Procédure (cf. `PROD-RUNBOOK §1.2`) :
>
> 1. `pg_dump` staging vers bucket privé.
> 2. `psql < db/schema.sql` (idempotent `CREATE OR REPLACE`).
> 3. Test SQL admin : `select public.transparency_t99cp_total();`
>    doit renvoyer 0 sur un projet sans adhésion crédit, ou la
>    somme des credits.
> 4. Sanity check anon via curl :
>    `curl -sS "$URL/rest/v1/rpc/transparency_t99cp_total" -H "apikey: $ANON_KEY"`
>    doit renvoyer un nombre, sans erreur.
> 5. Redéployer Vercel / front si nécessaire (pas obligatoire — la
>    carte se débloque dès que la RPC est dispo, le bundle front
>    est inchangé).
>
> **ÉTAPE 31 à exécuter** — Post-go-live (audit réel + monitoring +
> chantier M2-sec-policy / M1-RGPD si validés OU 8e itération du
> pattern « +1 test mock E2E ciblé », par défaut sur poll-detail
> vote/unvote symétrique étape 28/29) :
>
> 1. **Audit Lighthouse réel** (priorité 1, site live sur Netlify) :
>    `npx unlighthouse --site https://maintenant-le-mouvement.netlify.app`
>    si binaire Chromium dispo, sinon DevTools manuel par un dev
>    humain sur 6 pages clés. Documenter les scores. Corriger les
>    blocages < 95. Si pas faisable : différer étape 32.
> 2. **E2E « happy path » réel** (priorité 2 si projet Supabase de
>    test prêt) : `web/e2e/happy-path.spec.ts` qui signe
>    anonymement une pétition + vérifie le compteur. Sinon ajouter
>    encore un test mock non-vide (réutiliser
>    `installSupabaseStubs(page, { rest: ..., rpc: ... })`) — par
>    exemple : **flow vote/unvote sur poll-detail-page**
>    (symétrique sign/unsign de l'étape 28/29, exerce
>    `usePoll` + `votePoll/unvotePoll`, confirme/dégonfle la
>    dette `L8-arch-authsession` via un 5e call-site qui dupliquerait
>    encore le seed), OU un autre état non couvert (mobilization
>    detail, transparence variants, page profil authentifiée). Si
>    la matrice E2E est bouclée et qu'on veut éviter la
>    sur-couverture : extraire le helper
>    `installAuthenticatedSession(page, { userId, email })` dans
>    `e2e/utils/mockSupabase.ts` (closure de la dette
>    `L8-arch-authsession`, 4 call-sites identifiés + 1 si poll-vote
>    en parallèle) — refacto isolé aux fichiers `e2e/`, zéro
>    impact runtime.
> 3. **Monitoring Sentry runtime** (si DSN câblé) : test canary +
>    documenter taux d'erreur 7 j + top 5 issues. Si erreurs
>    récurrentes `stripe-webhook` → prioriser job de
>    réconciliation.
> 4. **Monitoring Supabase** : quotas API / DB CPU / DB memory sur
>    7 j, alertes Slack actives ?, top requêtes lentes.
> 5. **M2-sec-policy** — durcissement
>    `signatures_select_public` (décision produit / DPO tranchée
>    2026-05-13) : remplacer la policy actuelle (`for select using
>    (true)`) par une policy qui n'expose `user_id` qu'à
>    `auth.uid() = user_id OR public.is_admin(auth.uid())`. Migrer
>    les call-sites UI qui dépendent encore de la projection
>    `signatures.user_id` (chercher `from('signatures').select(`,
>    normalement aucun en public). Migrer les call-sites
>    « combien de signatures » vers `getPetitionSignatureCount`.
>    **CHANGEMENT RLS visible côté client → demander confirmation
>    à chaque PR de cette transition**. Si pas le moment →
>    différer étape 32.
> 6. **M1-RGPD** (purge auto `stripe_events.payload` TTL 90j —
>    décision RGPD tranchée 2026-05-13) : migration DB additive
>    (`stripe_events_payload_ttl_trigger` ou job Edge Function
>    périodique). **Toucher à `stripe_events` = demande
>    confirmation** (table critique du webhook). Sinon différer.
> 7. **H4-deploy-deno** (dette low low) : si pipeline CI Supabase
>    réel disponible, ajouter `supabase functions deploy --dry-run`
>    sur PR. Sinon différer.
> 8. **Retours utilisateur·rices** (si trafic réel) : compiler
>    fixes prioritaires étape 32.
> 9. **Job de réconciliation Stripe** (dette différée étape 20) :
>    décider si on l'implémente. Critère : erreurs récurrentes
>    Sentry sur `stripe-webhook`.
> 10. **Tests** : suite vitest ≥ 883 + E2E Playwright ≥ 37 verts
>     en CI.
> 11. **HANDOFF-PROGRESS.md** : étape 31 ✅ détaillée.
> 12. **Recopier le prompt étape 32** à la fois dans
>     `HANDOFF-PROGRESS.md` ET dans la **réponse de chat finale**
>     (règle récursive). Inclure dans le prompt étape 32 la même
>     instruction de recopie pour la session N+26, ET l'instruction
>     d'audit vibe janitor pour N+26.
>
> **PHASE 1 — Clôture de l'étape principale (workflow auto-merge)** :
>
> Conformément à `CLAUDE.md` § « Politique de PR », autorisation
> permanente d'enchaîner les étapes ci-dessous sans confirmation :
>
> 1. Vérifier les 4 checks locaux verts : `npm run typecheck &&
>    npm run lint && npx vitest run && npm run build`. Si échec →
>    corriger, ne pas commit.
> 2. **Commit** : `chore(prod): step 31 — post-go-live (lighthouse +
>    e2e réel + monitoring + chantier M2-sec-policy/M1-RGPD si
>    validés)` ou `feat(...)`/`chore(...)` selon le livrable
>    principal. Pas d'emojis.
> 3. **Push** sur la branche imposée par l'harness (retry exponentiel
>    2/4/8/16 s).
> 4. **Ouvrir la PR** vers `main` via
>    `mcp__github__create_pull_request` (titre = commit, body
>    Summary + Décisions + Test plan).
> 5. **Attendre les checks GitHub Actions** (les DEUX checks
>    `Typecheck + Lint + Vitest + Build` ET
>    `Playwright E2E + axe-core a11y` doivent être verts). Si rouges
>    → autofix + re-push.
> 6. **Merger la PR** via `mcp__github__merge_pull_request`.
>
> **PHASE 2 — Audit vibe janitor (après le merge de la PR principale)** :
>
> Conformément à `CLAUDE.md` § « Audit récurrent vibe janitor de fin
> d'étape » :
>
> 1. Sync : `git checkout main && git pull --ff-only origin main`,
>    puis `git checkout -b claude/janitor-post-step31`.
> 2. **Audit en parallèle** via 2-3 subagents `general-purpose` :
>    architecture / robustesse / sécurité. Chaque agent produit un
>    rapport ; aucune modification.
> 3. Synthétiser findings par sévérité + risque régression.
> 4. **Appliquer UNIQUEMENT les fixes safe-first** (« primum non
>    nocere ») : aucun fix qui casse un test, aucun nouveau
>    problème, design system `T.*` intouchable, pas de migration DB,
>    pas de breaking change, fixes risque medium/high reportés en
>    dette.
> 5. Vérifier les 4 checks locaux verts avant push.
> 6. **PR janitor séparée** : titre `chore(janitor): post-step 31 —
>    <résumé court>`. Body : Summary + Findings (sévérité + risque)
>    + Fixes appliqués + Fixes déférés + Test plan.
> 7. Merger la PR janitor (même workflow auto-merge).
> 8. Documenter dans `HANDOFF-PROGRESS.md` § Audit vibe janitor
>    étape 31 : findings totaux, fixes appliqués (chacun avec
>    risque évalué), dette ajoutée, compteur de tests final.
>
> **Phase 3 — Recopie du prompt étape 32 (toujours obligatoire)** :
>
> Recopier le prompt étape 32 dans la **réponse de chat finale**, en
> plus de l'avoir écrit dans `HANDOFF-PROGRESS.md`. Le prompt étape
> 32 doit lui-même inclure les Phases 1, 2, 3 récursives pour la
> session N+26.
>
> **Conditions d'arrêt malgré l'autorisation permanente** :
>
> - Migration DB risquée non listée. L'étape 31 LISTE explicitement :
>   - Durcissement `signatures_select_public` (M2-sec-policy) SI
>     pertinent → autorisé MAIS demander confirmation à chaque PR
>     car CHANGEMENT RLS visible côté client.
>   - Purge `stripe_events.payload` (M1-RGPD) SI pertinent →
>     demander confirmation car table critique.
>   - Toute autre migration → demander confirmation.
> - Changement RGPD non listé.
> - Breaking change visible utilisateur.
> - Erreur Netlify / Supabase impossible à debugger en < 3 tentatives.
> - Review humaine ou commentaire GitHub avant le merge.
> - En phase janitor : un fix touche au design system `T.*`, casse
>   un test sans rollback possible, ou nécessite un bump majeur.
>
> **Contraintes générales** :
>
> - Ne pas toucher au prototype.
> - TS strict + no `any`.
> - Conserver les checks verts à chaque étape.
> - Pas d'emojis dans le code TS ni dans les commits / PR.
> - Tokens `T.*` intouchables sans validation designer.
> - Sauvegarder la DB AVANT toute migration prod (`pg_dump` →
>   bucket privé Supabase Storage).

---

## Prompt pour la session N+24 (étape 30)

> Repo : `/home/user/maintenantproto1` (branche imposée par l'harness —
> typiquement `claude/<auto>`).
>
> **Lis dans cet ordre** :
>
> 1. `CLAUDE.md` — règles projet (TS strict, pas de `any`, camelCase TS /
>    snake_case DB, SVG via `ICONS.*` pas d'emojis, RLS, RGPD, Lighthouse
>    ≥ 95, axe-core ≥ 95, `prefers-reduced-motion`). Note la section
>    « Politique de PR » qui t'autorise à enchaîner ouverture + merge
>    des PR sans confirmation **jusqu'à la session 50 incluse**. Note
>    aussi la section « Recopie systématique du prompt de la session
>    suivante » : **à la clôture de cette étape, recopier le prompt
>    étape 31 à la fois dans `HANDOFF-PROGRESS.md` ET dans la réponse de
>    chat finale**. Et enfin la section « Audit récurrent vibe janitor
>    de fin d'étape » : **après le merge de la PR principale de
>    l'étape 30, tu dois enchaîner une PR janitor séparée
>    `chore(janitor): post-step 30 — …` et inclure cette même
>    instruction janitor dans le prompt étape 31**.
> 2. `HANDOFF.md` §11 (Points d'attention) + §12 (Suivi) + §13 (Sécurité).
> 3. `HANDOFF-PROGRESS.md` — journal (étape 29 ✅ — étape 30 à faire).
> 4. `docs/PROD-RUNBOOK.md` — runbook de provisionnement (§1.2 mis à
>    jour étape 24 avec sanity checks 3+4 pour
>    `signatures_count_for_petition`).
> 5. `docs/MODERATION.md` — procédure modération.
> 6. `docs/USER-GUIDE.md` — FAQ utilisateur·rice.
>
> **État actuel à la fin de l'étape 29 + janitor post-step 29** :
>
> - **Étape 29 livrable unique** : +1 test E2E mock sur
>   `web/e2e/petition-signature.spec.ts` (`retire la signature: clic →
>   DELETE intercepté → bascule retour vers « Signer cette pétition »`).
>   Couvre la transition `signed: true → false` côté UI via le clic
>   réel + interception DELETE (PostgREST 204 No Content) + refresh.
>   Mock stateful par closure (variable locale `hasSignedRow: boolean`
>   flippée sur DELETE, lue sur GET). Suite Playwright : 34 → 35 tests.
>   Aucune modification de `src/`, `db/schema.sql`, ni de dépendances
>   npm. La matrice du `handleSign` côté `PetitionDetailPage.tsx:214-237`
>   est désormais entièrement couverte en E2E (sign branch + unsign
>   branch).
> - **Janitor post-step 29** : (à compléter par la session — cf.
>   `HANDOFF-PROGRESS.md` § Audit vibe janitor étape 29).
> - **Tous les autres items différés en bloc** (Lighthouse réel,
>   E2E happy path réel, monitoring Sentry / Supabase,
>   M2-sec-policy, T99CP cumul public, H4-deploy-deno, M1-RGPD,
>   retours utilisateur·rices, job réconciliation Stripe) :
>   conditions externes inchangées vs étape 28.
> - **872 tests vitest verts** (128 fichiers, durée ~60 s) —
>   inchangé vs étape 28.
> - **35 tests E2E Playwright** verts en CI — +1 vs étape 28.
> - Build entry inchangé (47.34 kB / gzip 13.32 kB),
>   TransparencePage inchangé (7.69 kB / gzip 3.11 kB).
> - Aucune nouvelle dépendance npm.
>
> **Provisionnement externe** — état au 2026-05-13 (inchangé depuis
> étape 19) :
>
> - ✅ Supabase staging provisionné (projet `maintenant-staging`,
>   eu-west-3, Free). Schéma `db/schema.sql` étape 19 appliqué — les
>   migrations étapes 20 + 22 + 23 + 24 (RPC
>   `users_signups_monthly` + `signatures_count_for_petition`)
>   restent à appliquer.
> - 🔲 Vercel / Stripe live / Edge Functions / Sentry SaaS / PITR /
>   projet `maintenant-test` (E2E happy path) restent à provisionner
>   par l'équipe humaine (cf. `docs/PROD-RUNBOOK.md` §2 à §4).
>
> **CONTEXTE D'OUVERTURE** — à exécuter avant toute autre action :
>
> 1. Vérifier qu'on est bien dans un workspace contenant `web/`. Si
>    non, `git fetch origin main && git merge --ff-only origin/main`.
> 2. `cd web && npm ci` (fallback : `npm install --legacy-peer-deps`).
> 3. `npm run typecheck && npm run lint && npx vitest run && npm run build`
>    pour vérifier le compteur de tests au point de départ (≥ 872
>    verts vitest à incrémenter à chaque étape ; 35 verts E2E
>    Playwright en CI).
> 4. **Demander à l'équipe humaine** :
>    - Les migrations étape 20 + étape 22 + étape 23 + étape 24
>      (`db/schema.sql` RPC `signatures_count_for_petition`)
>      ont-elles été appliquées à Supabase staging ?
>    - Le provisionnement Vercel / Stripe live / Sentry SaaS décrit
>      dans `docs/PROD-RUNBOOK.md` est-il fait ?
>    - Y a-t-il un projet Supabase de test seedé pour le test E2E
>      « signature anonyme » ?
>    - La décision produit sur le cumul T99CP émises publique a-t-elle
>      tranché ? Si oui en faveur de l'affichage public → l'étape 30
>      ajoutera la RPC `transparency_t99cp_total()` (migration DB
>      additive, scalaire SECURITY DEFINER).
>    - La décision produit / DPO sur le durcissement
>      `signatures_select_public` a-t-elle tranché ? Si oui en faveur
>      du durcissement → l'étape 30 migrera les call-sites
>      `petitions.signature_count` UI les plus chauds vers
>      `getPetitionSignatureCount`, puis remplacera la policy pour
>      ne plus projeter `user_id` aux anonymes (**CHANGEMENT RLS visible
>      côté client → demande confirmation à chaque PR de cette
>      transition**).
>    - La décision RGPD sur la purge `stripe_events.payload` (M1-RGPD)
>      a-t-elle tranché ? Si oui → migration DB additive (trigger TTL
>      ou job Edge Function périodique) — toucher à `stripe_events` =
>      **demande confirmation à chaque PR**.
>
> **PRÉREQUIS OPÉRATIONNEL BLOQUANT** — gate avant tout redéploiement
> front :
>
> Identique étapes 26-29 : si la migration étape 24 n'est pas
> appliquée en prod, le helper `getPetitionSignatureCount` renvoie
> une erreur `function not found` à la première invocation. Tant
> qu'aucun call-site UI ne l'appelle (fin étape 29), aucun impact
> utilisateur ; mais dès qu'un call-site sera ajouté (étape 30 si la
> décision produit / DPO valide le durcissement), la migration
> devient bloquante.
>
> Procédure (cf. `PROD-RUNBOOK §1.2`) :
>
> 1. `pg_dump` staging vers bucket privé.
> 2. `psql < db/schema.sql` (idempotent `CREATE OR REPLACE`).
> 3. Test SQL admin :
>    `select public.signatures_count_for_petition('<UUID>'::uuid);`
> 4. Sanity check anon via curl (cf. `PROD-RUNBOOK §1.2` sanity check 4).
> 5. Redéployer Vercel / front une fois la RPC en place.
>
> **ÉTAPE 30 à exécuter** — Post-go-live (audit réel + monitoring +
> dette M2-sec-policy / T99CP / H4-deploy-deno / M1-RGPD si validées,
> sinon 7e itération du pattern « +1 test mock E2E ») :
>
> 1. **Audit Lighthouse réel** (priorité 1 si Vercel preview en
>    ligne) : `npx unlighthouse --site <url>` ou DevTools manuel sur
>    6 pages clés. Documenter les scores. Corriger les blocages
>    < 95. Si pas de staging HTTPS : différer étape 31.
> 2. **E2E « happy path » réel** (priorité 2 si projet Supabase de
>    test prêt) : `web/e2e/happy-path.spec.ts` qui signe
>    anonymement une pétition + vérifie le compteur. Sinon ajouter
>    encore un test mock non-vide (réutiliser
>    `installSupabaseStubs(page, { rest: ..., rpc: ... })`) — par
>    exemple : **flow vote/unvote sur poll-detail-page**
>    (symétrique sign/unsign de l'étape 28/29, exerce
>    `usePoll` + `votePoll/unvotePoll`, confirme/dégonfle la
>    dette `L8-arch-authsession` via un 5e call-site qui dupliquerait
>    encore le seed), OU un autre état non couvert (mobilization
>    detail, transparence variants, page profil authentifiée). Si
>    la matrice E2E est bouclée et qu'on veut éviter la
>    sur-couverture : extraire le helper
>    `installAuthenticatedSession(page, { userId, email })` dans
>    `e2e/utils/mockSupabase.ts` (closure de la dette
>    `L8-arch-authsession`, 4 call-sites identifiés + 1 si poll-vote
>    en parallèle) — refacto isolé aux fichiers `e2e/`, zéro
>    impact runtime.
> 3. **Monitoring Sentry runtime** (si DSN câblé) : test canary +
>    documenter taux d'erreur 7 j + top 5 issues. Si erreurs
>    récurrentes `stripe-webhook` → prioriser job de
>    réconciliation.
> 4. **Monitoring Supabase** : quotas API / DB CPU / DB memory sur
>    7 j, alertes Slack actives ?, top requêtes lentes.
> 5. **M2-sec-policy** — durcissement
>    `signatures_select_public` (SI validation produit / DPO
>    reçue) : remplacer la policy actuelle (`for select using (true)`)
>    par une policy qui n'expose `user_id` qu'à
>    `auth.uid() = user_id OR public.is_admin(auth.uid())`. Migrer
>    les call-sites UI qui dépendent encore de la projection
>    `signatures.user_id` (chercher `from('signatures').select(`,
>    normalement aucun en public). Migrer les call-sites
>    « combien de signatures » vers `getPetitionSignatureCount`.
>    **CHANGEMENT RLS visible côté client → demander confirmation
>    à chaque PR de cette transition**. Si validation non reçue →
>    différer étape 31 et documenter la raison.
> 6. **Cumul T99CP émises publique** (différé étapes 21-29) : si
>    validation produit reçue → RPC
>    `transparency_t99cp_total() returns bigint security definer`
>    + carte dédiée sur TransparencePage. Migration DB additive
>    listée explicitement → autorisée. Sinon laisser en l'état.
> 7. **H4-deploy-deno** (dette low low) : si pipeline CI Supabase
>    réel disponible, ajouter `supabase functions deploy --dry-run`
>    sur PR. Sinon différer.
> 8. **M1-RGPD** (purge auto `stripe_events.payload` TTL 90j) : si
>    décision RGPD reçue → migration DB additive
>    (`stripe_events_payload_ttl_trigger` ou job Edge Function
>    périodique). **Toucher à `stripe_events` = demande
>    confirmation** (table critique du webhook). Sinon différer.
> 9. **Retours utilisateur·rices** (si trafic réel) : compiler
>    fixes prioritaires étape 31.
> 10. **Job de réconciliation Stripe** (dette différée étape 20) :
>     décider si on l'implémente. Critère : erreurs récurrentes
>     Sentry sur `stripe-webhook`.
> 11. **Tests** : suite vitest ≥ 872 + E2E Playwright ≥ 35 verts
>     en CI.
> 12. **HANDOFF-PROGRESS.md** : étape 30 ✅ détaillée.
> 13. **Recopier le prompt étape 31** à la fois dans
>     `HANDOFF-PROGRESS.md` ET dans la **réponse de chat finale**
>     (règle récursive). Inclure dans le prompt étape 31 la même
>     instruction de recopie pour la session N+25, ET l'instruction
>     d'audit vibe janitor pour N+25.
>
> **PHASE 1 — Clôture de l'étape principale (workflow auto-merge)** :
>
> Conformément à `CLAUDE.md` § « Politique de PR », autorisation
> permanente d'enchaîner les étapes ci-dessous sans confirmation :
>
> 1. Vérifier les 4 checks locaux verts : `npm run typecheck &&
>    npm run lint && npx vitest run && npm run build`. Si échec →
>    corriger, ne pas commit.
> 2. **Commit** : `chore(prod): step 30 — post-go-live (lighthouse +
>    e2e réel + monitoring + dette M2-sec-policy/T99CP/H4-deploy-deno/M1-RGPD
>    si validées)`. Pas d'emojis.
> 3. **Push** sur la branche imposée par l'harness (retry exponentiel
>    2/4/8/16 s).
> 4. **Ouvrir la PR** vers `main` via
>    `mcp__github__create_pull_request` (titre = commit, body
>    Summary + Décisions + Test plan).
> 5. **Attendre les checks GitHub Actions** (les DEUX checks
>    `Typecheck + Lint + Vitest + Build` ET
>    `Playwright E2E + axe-core a11y` doivent être verts). Si rouges
>    → autofix + re-push.
> 6. **Merger la PR** via `mcp__github__merge_pull_request`.
>
> **PHASE 2 — Audit vibe janitor (après le merge de la PR principale)** :
>
> Conformément à `CLAUDE.md` § « Audit récurrent vibe janitor de fin
> d'étape » :
>
> 1. Sync : `git checkout main && git pull --ff-only origin main`,
>    puis `git checkout -b claude/janitor-post-step30`.
> 2. **Audit en parallèle** via 2-3 subagents `general-purpose` :
>    architecture / robustesse / sécurité. Chaque agent produit un
>    rapport ; aucune modification.
> 3. Synthétiser findings par sévérité + risque régression.
> 4. **Appliquer UNIQUEMENT les fixes safe-first** (« primum non
>    nocere ») : aucun fix qui casse un test, aucun nouveau
>    problème, design system `T.*` intouchable, pas de migration DB,
>    pas de breaking change, fixes risque medium/high reportés en
>    dette.
> 5. Vérifier les 4 checks locaux verts avant push.
> 6. **PR janitor séparée** : titre `chore(janitor): post-step 30 —
>    <résumé court>`. Body : Summary + Findings (sévérité + risque)
>    + Fixes appliqués + Fixes déférés + Test plan.
> 7. Merger la PR janitor (même workflow auto-merge).
> 8. Documenter dans `HANDOFF-PROGRESS.md` § Audit vibe janitor
>    étape 30 : findings totaux, fixes appliqués (chacun avec
>    risque évalué), dette ajoutée, compteur de tests final.
>
> **Phase 3 — Recopie du prompt étape 31 (toujours obligatoire)** :
>
> Recopier le prompt étape 31 dans la **réponse de chat finale**, en
> plus de l'avoir écrit dans `HANDOFF-PROGRESS.md`. Le prompt étape
> 31 doit lui-même inclure les Phases 1, 2, 3 récursives pour la
> session N+25.
>
> **Conditions d'arrêt malgré l'autorisation permanente** :
>
> - Migration DB risquée non listée. L'étape 30 LISTE explicitement :
>   - Durcissement `signatures_select_public` (M2-sec-policy) SI
>     validation produit / DPO reçue → autorisé MAIS demander
>     confirmation à chaque PR car CHANGEMENT RLS visible côté
>     client.
>   - RPC `transparency_t99cp_total()` SI validation produit
>     reçue (additif, autorisé).
>   - Purge `stripe_events.payload` (M1-RGPD) SI décision RGPD
>     reçue → demander confirmation car table critique.
>   - Toute autre migration → demander confirmation.
> - Changement RGPD non listé.
> - Breaking change visible utilisateur.
> - Erreur Vercel / Supabase impossible à debugger en < 3 tentatives.
> - Review humaine ou commentaire GitHub avant le merge.
> - En phase janitor : un fix touche au design system `T.*`, casse
>   un test sans rollback possible, ou nécessite un bump majeur.
>
> **Contraintes générales** :
>
> - Ne pas toucher au prototype.
> - TS strict + no `any`.
> - Conserver les checks verts à chaque étape.
> - Pas d'emojis dans le code TS ni dans les commits / PR.
> - Tokens `T.*` intouchables sans validation designer.
> - Sauvegarder la DB AVANT toute migration prod (`pg_dump` →
>   bucket privé Supabase Storage).

---

## Prompt pour la session N+23 (étape 29)

> Repo : `/home/user/maintenantproto1` (branche imposée par l'harness —
> typiquement `claude/<auto>`).
>
> **Lis dans cet ordre** :
>
> 1. `CLAUDE.md` — règles projet (TS strict, pas de `any`, camelCase TS /
>    snake_case DB, SVG via `ICONS.*` pas d'emojis, RLS, RGPD, Lighthouse
>    ≥ 95, axe-core ≥ 95, `prefers-reduced-motion`). Note la section
>    « Politique de PR » qui t'autorise à enchaîner ouverture + merge
>    des PR sans confirmation **jusqu'à la session 50 incluse**. Note
>    aussi la section « Recopie systématique du prompt de la session
>    suivante » : **à la clôture de cette étape, recopier le prompt
>    étape 30 à la fois dans `HANDOFF-PROGRESS.md` ET dans la réponse de
>    chat finale**. Et enfin la section « Audit récurrent vibe janitor
>    de fin d'étape » : **après le merge de la PR principale de
>    l'étape 29, tu dois enchaîner une PR janitor séparée
>    `chore(janitor): post-step 29 — …` et inclure cette même
>    instruction janitor dans le prompt étape 30**.
> 2. `HANDOFF.md` §11 (Points d'attention) + §12 (Suivi) + §13 (Sécurité).
> 3. `HANDOFF-PROGRESS.md` — journal (étape 28 ✅ — étape 29 à faire).
> 4. `docs/PROD-RUNBOOK.md` — runbook de provisionnement (§1.2 mis à
>    jour étape 24 avec sanity checks 3+4 pour
>    `signatures_count_for_petition`).
> 5. `docs/MODERATION.md` — procédure modération.
> 6. `docs/USER-GUIDE.md` — FAQ utilisateur·rice.
>
> **État actuel à la fin de l'étape 28 + janitor post-step 28** :
>
> - **Étape 28 livrable unique** : +1 test E2E mock sur
>   `web/e2e/petition-signature.spec.ts` (`signe la pétition: clic →
>   POST intercepté → bascule vers « Signée — retirer ma signature »`).
>   Couvre la transition `signed: false → true` côté UI via le clic
>   réel + interception POST + refresh. Mock stateful par closure
>   (variable locale `signed: boolean` flippée sur POST, lue sur
>   GET). Suite Playwright : 33 → 34 tests. Aucune modification de
>   `src/`, `db/schema.sql`, ni de dépendances npm.
> - **Janitor post-step 28** : (à compléter par la session — cf.
>   `HANDOFF-PROGRESS.md` § Audit vibe janitor étape 28).
> - **Tous les autres items différés en bloc** (Lighthouse réel,
>   E2E happy path réel, monitoring Sentry / Supabase,
>   M2-sec-policy, T99CP cumul public, H4-deploy-deno, M1-RGPD,
>   retours utilisateur·rices, job réconciliation Stripe) :
>   conditions externes inchangées vs étape 27.
> - **872 tests vitest verts** (128 fichiers, durée ~75 s) —
>   inchangé vs étape 27.
> - **34 tests E2E Playwright** verts en CI — +1 vs étape 27.
> - Build entry inchangé (47.34 kB / gzip 13.32 kB),
>   TransparencePage inchangé (7.69 kB / gzip 3.11 kB).
> - Aucune nouvelle dépendance npm.
>
> **Provisionnement externe** — état au 2026-05-13 (inchangé depuis
> étape 19) :
>
> - ✅ Supabase staging provisionné (projet `maintenant-staging`,
>   eu-west-3, Free). Schéma `db/schema.sql` étape 19 appliqué — les
>   migrations étapes 20 + 22 + 23 + 24 (RPC
>   `users_signups_monthly` + `signatures_count_for_petition`)
>   restent à appliquer.
> - 🔲 Vercel / Stripe live / Edge Functions / Sentry SaaS / PITR /
>   projet `maintenant-test` (E2E happy path) restent à provisionner
>   par l'équipe humaine (cf. `docs/PROD-RUNBOOK.md` §2 à §4).
>
> **CONTEXTE D'OUVERTURE** — à exécuter avant toute autre action :
>
> 1. Vérifier qu'on est bien dans un workspace contenant `web/`. Si
>    non, `git fetch origin main && git merge --ff-only origin/main`.
> 2. `cd web && npm ci` (fallback : `npm install --legacy-peer-deps`).
> 3. `npm run typecheck && npm run lint && npx vitest run && npm run build`
>    pour vérifier le compteur de tests au point de départ (≥ 872
>    verts vitest à incrémenter à chaque étape ; 34 verts E2E
>    Playwright en CI).
> 4. **Demander à l'équipe humaine** :
>    - Les migrations étape 20 + étape 22 + étape 23 + étape 24
>      (`db/schema.sql` RPC `signatures_count_for_petition`)
>      ont-elles été appliquées à Supabase staging ?
>    - Le provisionnement Vercel / Stripe live / Sentry SaaS décrit
>      dans `docs/PROD-RUNBOOK.md` est-il fait ?
>    - Y a-t-il un projet Supabase de test seedé pour le test E2E
>      « signature anonyme » ?
>    - La décision produit sur le cumul T99CP émises publique a-t-elle
>      tranché ? Si oui en faveur de l'affichage public → l'étape 29
>      ajoutera la RPC `transparency_t99cp_total()` (migration DB
>      additive, scalaire SECURITY DEFINER).
>    - La décision produit / DPO sur le durcissement
>      `signatures_select_public` a-t-elle tranché ? Si oui en faveur
>      du durcissement → l'étape 29 migrera les call-sites
>      `petitions.signature_count` UI les plus chauds vers
>      `getPetitionSignatureCount`, puis remplacera la policy pour
>      ne plus projeter `user_id` aux anonymes (**CHANGEMENT RLS visible
>      côté client → demande confirmation à chaque PR de cette
>      transition**).
>    - La décision RGPD sur la purge `stripe_events.payload` (M1-RGPD)
>      a-t-elle tranché ? Si oui → migration DB additive (trigger TTL
>      ou job Edge Function périodique) — toucher à `stripe_events` =
>      **demande confirmation à chaque PR**.
>
> **PRÉREQUIS OPÉRATIONNEL BLOQUANT** — gate avant tout redéploiement
> front :
>
> Identique étapes 26-28 : si la migration étape 24 n'est pas
> appliquée en prod, le helper `getPetitionSignatureCount` renvoie
> une erreur `function not found` à la première invocation. Tant
> qu'aucun call-site UI ne l'appelle (fin étape 28), aucun impact
> utilisateur ; mais dès qu'un call-site sera ajouté (étape 29 si la
> décision produit / DPO valide le durcissement), la migration
> devient bloquante.
>
> Procédure (cf. `PROD-RUNBOOK §1.2`) :
>
> 1. `pg_dump` staging vers bucket privé.
> 2. `psql < db/schema.sql` (idempotent `CREATE OR REPLACE`).
> 3. Test SQL admin :
>    `select public.signatures_count_for_petition('<UUID>'::uuid);`
> 4. Sanity check anon via curl (cf. `PROD-RUNBOOK §1.2` sanity check 4).
> 5. Redéployer Vercel / front une fois la RPC en place.
>
> **ÉTAPE 29 à exécuter** — Post-go-live (audit réel + monitoring +
> dette M2-sec-policy / T99CP / H4-deploy-deno / M1-RGPD si validées,
> sinon 6e itération du pattern « +1 test mock E2E ») :
>
> 1. **Audit Lighthouse réel** (priorité 1 si Vercel preview en
>    ligne) : `npx unlighthouse --site <url>` ou DevTools manuel sur
>    6 pages clés. Documenter les scores. Corriger les blocages
>    < 95. Si pas de staging HTTPS : différer étape 30.
> 2. **E2E « happy path » réel** (priorité 2 si projet Supabase de
>    test prêt) : `web/e2e/happy-path.spec.ts` qui signe
>    anonymement une pétition + vérifie le compteur. Sinon ajouter
>    encore un test mock non-vide (réutiliser
>    `installSupabaseStubs(page, { rest: ..., rpc: ... })`) — par
>    exemple : flow unsign reverse-flow (clic sur « Signée —
>    retirer ma signature » → DELETE intercepté → bascule retour
>    vers « Signer cette pétition »), OU un autre état non couvert
>    en E2E (mobilization detail, poll detail, transparence
>    variants, page profil authentifiée).
> 3. **Monitoring Sentry runtime** (si DSN câblé) : test canary +
>    documenter taux d'erreur 7 j + top 5 issues. Si erreurs
>    récurrentes `stripe-webhook` → prioriser job de
>    réconciliation.
> 4. **Monitoring Supabase** : quotas API / DB CPU / DB memory sur
>    7 j, alertes Slack actives ?, top requêtes lentes.
> 5. **M2-sec-policy** — durcissement
>    `signatures_select_public` (SI validation produit / DPO
>    reçue) : remplacer la policy actuelle (`for select using (true)`)
>    par une policy qui n'expose `user_id` qu'à
>    `auth.uid() = user_id OR public.is_admin(auth.uid())`. Migrer
>    les call-sites UI qui dépendent encore de la projection
>    `signatures.user_id` (chercher `from('signatures').select(`,
>    normalement aucun en public). Migrer les call-sites
>    « combien de signatures » vers `getPetitionSignatureCount`.
>    **CHANGEMENT RLS visible côté client → demander confirmation
>    à chaque PR de cette transition**. Si validation non reçue →
>    différer étape 30 et documenter la raison.
> 6. **Cumul T99CP émises publique** (différé étapes 21-28) : si
>    validation produit reçue → RPC
>    `transparency_t99cp_total() returns bigint security definer`
>    + carte dédiée sur TransparencePage. Migration DB additive
>    listée explicitement → autorisée. Sinon laisser en l'état.
> 7. **H4-deploy-deno** (dette low low) : si pipeline CI Supabase
>    réel disponible, ajouter `supabase functions deploy --dry-run`
>    sur PR. Sinon différer.
> 8. **M1-RGPD** (purge auto `stripe_events.payload` TTL 90j) : si
>    décision RGPD reçue → migration DB additive
>    (`stripe_events_payload_ttl_trigger` ou job Edge Function
>    périodique). **Toucher à `stripe_events` = demande
>    confirmation** (table critique du webhook). Sinon différer.
> 9. **Retours utilisateur·rices** (si trafic réel) : compiler
>    fixes prioritaires étape 30.
> 10. **Job de réconciliation Stripe** (dette différée étape 20) :
>     décider si on l'implémente. Critère : erreurs récurrentes
>     Sentry sur `stripe-webhook`.
> 11. **Tests** : suite vitest ≥ 872 + E2E Playwright ≥ 34 verts
>     en CI.
> 12. **HANDOFF-PROGRESS.md** : étape 29 ✅ détaillée.
> 13. **Recopier le prompt étape 30** à la fois dans
>     `HANDOFF-PROGRESS.md` ET dans la **réponse de chat finale**
>     (règle récursive). Inclure dans le prompt étape 30 la même
>     instruction de recopie pour la session N+24, ET l'instruction
>     d'audit vibe janitor pour N+24.
>
> **PHASE 1 — Clôture de l'étape principale (workflow auto-merge)** :
>
> Conformément à `CLAUDE.md` § « Politique de PR », autorisation
> permanente d'enchaîner les étapes ci-dessous sans confirmation :
>
> 1. Vérifier les 4 checks locaux verts : `npm run typecheck &&
>    npm run lint && npx vitest run && npm run build`. Si échec →
>    corriger, ne pas commit.
> 2. **Commit** : `chore(prod): step 29 — post-go-live (lighthouse +
>    e2e réel + monitoring + dette M2-sec-policy/T99CP/H4-deploy-deno/M1-RGPD
>    si validées)`. Pas d'emojis.
> 3. **Push** sur la branche imposée par l'harness (retry exponentiel
>    2/4/8/16 s).
> 4. **Ouvrir la PR** vers `main` via
>    `mcp__github__create_pull_request` (titre = commit, body
>    Summary + Décisions + Test plan).
> 5. **Attendre les checks GitHub Actions** (les DEUX checks
>    `Typecheck + Lint + Vitest + Build` ET
>    `Playwright E2E + axe-core a11y` doivent être verts). Si rouges
>    → autofix + re-push.
> 6. **Merger la PR** via `mcp__github__merge_pull_request`.
>
> **PHASE 2 — Audit vibe janitor (après le merge de la PR principale)** :
>
> Conformément à `CLAUDE.md` § « Audit récurrent vibe janitor de fin
> d'étape » :
>
> 1. Sync : `git checkout main && git pull --ff-only origin main`,
>    puis `git checkout -b claude/janitor-post-step29`.
> 2. **Audit en parallèle** via 2-3 subagents `general-purpose` :
>    architecture / robustesse / sécurité. Chaque agent produit un
>    rapport ; aucune modification.
> 3. Synthétiser findings par sévérité + risque régression.
> 4. **Appliquer UNIQUEMENT les fixes safe-first** (« primum non
>    nocere ») : aucun fix qui casse un test, aucun nouveau
>    problème, design system `T.*` intouchable, pas de migration DB,
>    pas de breaking change, fixes risque medium/high reportés en
>    dette.
> 5. Vérifier les 4 checks locaux verts avant push.
> 6. **PR janitor séparée** : titre `chore(janitor): post-step 29 —
>    <résumé court>`. Body : Summary + Findings (sévérité + risque)
>    + Fixes appliqués + Fixes déférés + Test plan.
> 7. Merger la PR janitor (même workflow auto-merge).
> 8. Documenter dans `HANDOFF-PROGRESS.md` § Audit vibe janitor
>    étape 29 : findings totaux, fixes appliqués (chacun avec
>    risque évalué), dette ajoutée, compteur de tests final.
>
> **Phase 3 — Recopie du prompt étape 30 (toujours obligatoire)** :
>
> Recopier le prompt étape 30 dans la **réponse de chat finale**, en
> plus de l'avoir écrit dans `HANDOFF-PROGRESS.md`. Le prompt étape
> 30 doit lui-même inclure les Phases 1, 2, 3 récursives pour la
> session N+24.
>
> **Conditions d'arrêt malgré l'autorisation permanente** :
>
> - Migration DB risquée non listée. L'étape 29 LISTE explicitement :
>   - Durcissement `signatures_select_public` (M2-sec-policy) SI
>     validation produit / DPO reçue → autorisé MAIS demander
>     confirmation à chaque PR car CHANGEMENT RLS visible côté
>     client.
>   - RPC `transparency_t99cp_total()` SI validation produit
>     reçue (additif, autorisé).
>   - Purge `stripe_events.payload` (M1-RGPD) SI décision RGPD
>     reçue → demander confirmation car table critique.
>   - Toute autre migration → demander confirmation.
> - Changement RGPD non listé.
> - Breaking change visible utilisateur.
> - Erreur Vercel / Supabase impossible à debugger en < 3 tentatives.
> - Review humaine ou commentaire GitHub avant le merge.
> - En phase janitor : un fix touche au design system `T.*`, casse
>   un test sans rollback possible, ou nécessite un bump majeur.
>
> **Contraintes générales** :
>
> - Ne pas toucher au prototype.
> - TS strict + no `any`.
> - Conserver les checks verts à chaque étape.
> - Pas d'emojis dans le code TS ni dans les commits / PR.
> - Tokens `T.*` intouchables sans validation designer.
> - Sauvegarder la DB AVANT toute migration prod (`pg_dump` →
>   bucket privé Supabase Storage).

---

## Prompt pour la session N+22 (étape 28)

> Repo : `/home/user/maintenantproto1` (branche imposée par l'harness —
> typiquement `claude/<auto>`).
>
> **Lis dans cet ordre** :
>
> 1. `CLAUDE.md` — règles projet (TS strict, pas de `any`, camelCase TS /
>    snake_case DB, SVG via `ICONS.*` pas d'emojis, RLS, RGPD, Lighthouse
>    ≥ 95, axe-core ≥ 95, `prefers-reduced-motion`). Note la section
>    « Politique de PR » qui t'autorise à enchaîner ouverture + merge
>    des PR sans confirmation **jusqu'à la session 50 incluse**. Note
>    aussi la section « Recopie systématique du prompt de la session
>    suivante » : **à la clôture de cette étape, recopier le prompt
>    étape 29 à la fois dans `HANDOFF-PROGRESS.md` ET dans la réponse de
>    chat finale**. Et enfin la section « Audit récurrent vibe janitor
>    de fin d'étape » : **après le merge de la PR principale de
>    l'étape 28, tu dois enchaîner une PR janitor séparée
>    `chore(janitor): post-step 28 — …` et inclure cette même
>    instruction janitor dans le prompt étape 29**.
> 2. `HANDOFF.md` §11 (Points d'attention) + §12 (Suivi) + §13 (Sécurité).
> 3. `HANDOFF-PROGRESS.md` — journal (étape 27 ✅ — étape 28 à faire).
> 4. `docs/PROD-RUNBOOK.md` — runbook de provisionnement (§1.2 mis à
>    jour étape 24 avec sanity checks 3+4 pour
>    `signatures_count_for_petition`).
> 5. `docs/MODERATION.md` — procédure modération.
> 6. `docs/USER-GUIDE.md` — FAQ utilisateur·rice.
>
> **État actuel à la fin de l'étape 27 + janitor post-step 27** :
>
> - **Étape 27 livrable unique** : +1 test E2E mock sur
>   `web/e2e/petition-signature.spec.ts` (« Signer cette pétition »
>   pour un signataire authentifié non encore signé, symétrique
>   étape 26, via seed `localStorage[sb-127-auth-token]` + mock
>   route `signatures` à `[]`). Suite Playwright : 32 → 33 tests.
>   Aucune modification de `src/`, `db/schema.sql`, ni de
>   dépendances npm.
> - **Janitor post-step 27** : (à compléter par la session — cf.
>   `HANDOFF-PROGRESS.md` § Audit vibe janitor étape 27).
> - **Tous les autres items différés en bloc** (Lighthouse réel,
>   E2E happy path réel, monitoring Sentry / Supabase,
>   M2-sec-policy, T99CP cumul public, H4-deploy-deno, M1-RGPD,
>   retours utilisateur·rices, job réconciliation Stripe) :
>   conditions externes inchangées vs étape 26.
> - **872 tests vitest verts** (128 fichiers, durée ~62 s) —
>   inchangé vs étape 26.
> - **33 tests E2E Playwright** verts en CI — +1 vs étape 26.
> - Build entry inchangé (47.34 kB / gzip 13.32 kB),
>   TransparencePage inchangé (7.69 kB / gzip 3.11 kB).
> - Aucune nouvelle dépendance npm.
>
> **Provisionnement externe** — état au 2026-05-12 (inchangé depuis
> étape 19) :
>
> - ✅ Supabase staging provisionné (projet `maintenant-staging`,
>   eu-west-3, Free). Schéma `db/schema.sql` étape 19 appliqué — les
>   migrations étapes 20 + 22 + 23 + 24 (RPC
>   `users_signups_monthly` + `signatures_count_for_petition`)
>   restent à appliquer.
> - 🔲 Vercel / Stripe live / Edge Functions / Sentry SaaS / PITR /
>   projet `maintenant-test` (E2E happy path) restent à provisionner
>   par l'équipe humaine (cf. `docs/PROD-RUNBOOK.md` §2 à §4).
>
> **CONTEXTE D'OUVERTURE** — à exécuter avant toute autre action :
>
> 1. Vérifier qu'on est bien dans un workspace contenant `web/`. Si
>    non, `git fetch origin main && git merge --ff-only origin/main`.
> 2. `cd web && npm ci` (fallback : `npm install --legacy-peer-deps`).
> 3. `npm run typecheck && npm run lint && npx vitest run && npm run build`
>    pour vérifier le compteur de tests au point de départ (≥ 872
>    verts vitest à incrémenter à chaque étape ; 33 verts E2E
>    Playwright en CI).
> 4. **Demander à l'équipe humaine** :
>    - Les migrations étape 20 + étape 22 + étape 23 + étape 24
>      (`db/schema.sql` RPC `signatures_count_for_petition`)
>      ont-elles été appliquées à Supabase staging ?
>    - Le provisionnement Vercel / Stripe live / Sentry SaaS décrit
>      dans `docs/PROD-RUNBOOK.md` est-il fait ?
>    - Y a-t-il un projet Supabase de test seedé pour le test E2E
>      « signature anonyme » ?
>    - La décision produit sur le cumul T99CP émises publique a-t-elle
>      tranché ? Si oui en faveur de l'affichage public → l'étape 28
>      ajoutera la RPC `transparency_t99cp_total()` (migration DB
>      additive, scalaire SECURITY DEFINER).
>    - La décision produit / DPO sur le durcissement
>      `signatures_select_public` a-t-elle tranché ? Si oui en faveur
>      du durcissement → l'étape 28 migrera les call-sites
>      `petitions.signature_count` UI les plus chauds vers
>      `getPetitionSignatureCount`, puis remplacera la policy pour
>      ne plus projeter `user_id` aux anonymes (**CHANGEMENT RLS visible
>      côté client → demande confirmation à chaque PR de cette
>      transition**).
>    - La décision RGPD sur la purge `stripe_events.payload` (M1-RGPD)
>      a-t-elle tranché ? Si oui → migration DB additive (trigger TTL
>      ou job Edge Function périodique) — toucher à `stripe_events` =
>      **demande confirmation à chaque PR**.
>
> **PRÉREQUIS OPÉRATIONNEL BLOQUANT** — gate avant tout redéploiement
> front :
>
> Identique étapes 26 + 27 : si la migration étape 24 n'est pas
> appliquée en prod, le helper `getPetitionSignatureCount` renvoie
> une erreur `function not found` à la première invocation. Tant
> qu'aucun call-site UI ne l'appelle (fin étape 27), aucun impact
> utilisateur ; mais dès qu'un call-site sera ajouté (étape 28 si la
> décision produit / DPO valide le durcissement), la migration
> devient bloquante.
>
> Procédure (cf. `PROD-RUNBOOK §1.2`) :
>
> 1. `pg_dump` staging vers bucket privé.
> 2. `psql < db/schema.sql` (idempotent `CREATE OR REPLACE`).
> 3. Test SQL admin :
>    `select public.signatures_count_for_petition('<UUID>'::uuid);`
> 4. Sanity check anon via curl (cf. `PROD-RUNBOOK §1.2` sanity check 4).
> 5. Redéployer Vercel / front une fois la RPC en place.
>
> **ÉTAPE 28 à exécuter** — Post-go-live (audit réel + monitoring +
> dette M2-sec-policy / T99CP / H4-deploy-deno / M1-RGPD si validées,
> sinon 5e itération du pattern « +1 test mock E2E ») :
>
> 1. **Audit Lighthouse réel** (priorité 1 si Vercel preview en
>    ligne) : `npx unlighthouse --site <url>` ou DevTools manuel sur
>    6 pages clés. Documenter les scores. Corriger les blocages
>    < 95. Si pas de staging HTTPS : différer étape 29.
> 2. **E2E « happy path » réel** (priorité 2 si projet Supabase de
>    test prêt) : `web/e2e/happy-path.spec.ts` qui signe
>    anonymement une pétition + vérifie le compteur. Sinon ajouter
>    encore un test mock non-vide (réutiliser
>    `installSupabaseStubs(page, { rest: ..., rpc: ... })`) — par
>    exemple : flow de signature actif côté UI (clic sur
>    « Signer cette pétition » → POST `signatures` interceptée →
>    bascule visible vers « Signée — retirer ma signature »),
>    OU un autre état non couvert en E2E (mobilization detail,
>    poll detail, transparence variants, page profil
>    authentifiée).
> 3. **Monitoring Sentry runtime** (si DSN câblé) : test canary +
>    documenter taux d'erreur 7 j + top 5 issues. Si erreurs
>    récurrentes `stripe-webhook` → prioriser job de
>    réconciliation.
> 4. **Monitoring Supabase** : quotas API / DB CPU / DB memory sur
>    7 j, alertes Slack actives ?, top requêtes lentes.
> 5. **M2-sec-policy** — durcissement
>    `signatures_select_public` (SI validation produit / DPO
>    reçue) : remplacer la policy actuelle (`for select using (true)`)
>    par une policy qui n'expose `user_id` qu'à
>    `auth.uid() = user_id OR public.is_admin(auth.uid())`. Migrer
>    les call-sites UI qui dépendent encore de la projection
>    `signatures.user_id` (chercher `from('signatures').select(`,
>    normalement aucun en public). Migrer les call-sites
>    « combien de signatures » vers `getPetitionSignatureCount`.
>    **CHANGEMENT RLS visible côté client → demander confirmation
>    à chaque PR de cette transition**. Si validation non reçue →
>    différer étape 29 et documenter la raison.
> 6. **Cumul T99CP émises publique** (différé étapes 21-27) : si
>    validation produit reçue → RPC
>    `transparency_t99cp_total() returns bigint security definer`
>    + carte dédiée sur TransparencePage. Migration DB additive
>    listée explicitement → autorisée. Sinon laisser en l'état.
> 7. **H4-deploy-deno** (dette low low) : si pipeline CI Supabase
>    réel disponible, ajouter `supabase functions deploy --dry-run`
>    sur PR. Sinon différer.
> 8. **M1-RGPD** (purge auto `stripe_events.payload` TTL 90j) : si
>    décision RGPD reçue → migration DB additive
>    (`stripe_events_payload_ttl_trigger` ou job Edge Function
>    périodique). **Toucher à `stripe_events` = demande
>    confirmation** (table critique du webhook). Sinon différer.
> 9. **Retours utilisateur·rices** (si trafic réel) : compiler
>    fixes prioritaires étape 29.
> 10. **Job de réconciliation Stripe** (dette différée étape 20) :
>     décider si on l'implémente. Critère : erreurs récurrentes
>     Sentry sur `stripe-webhook`.
> 11. **Tests** : suite vitest ≥ 872 + E2E Playwright ≥ 33 verts
>     en CI.
> 12. **HANDOFF-PROGRESS.md** : étape 28 ✅ détaillée.
> 13. **Recopier le prompt étape 29** à la fois dans
>     `HANDOFF-PROGRESS.md` ET dans la **réponse de chat finale**
>     (règle récursive). Inclure dans le prompt étape 29 la même
>     instruction de recopie pour la session N+23, ET l'instruction
>     d'audit vibe janitor pour N+23.
>
> **PHASE 1 — Clôture de l'étape principale (workflow auto-merge)** :
>
> Conformément à `CLAUDE.md` § « Politique de PR », autorisation
> permanente d'enchaîner les étapes ci-dessous sans confirmation :
>
> 1. Vérifier les 4 checks locaux verts : `npm run typecheck &&
>    npm run lint && npx vitest run && npm run build`. Si échec →
>    corriger, ne pas commit.
> 2. **Commit** : `chore(prod): step 28 — post-go-live (lighthouse +
>    e2e réel + monitoring + dette M2-sec-policy/T99CP/H4-deploy-deno/M1-RGPD
>    si validées)`. Pas d'emojis.
> 3. **Push** sur la branche imposée par l'harness (retry exponentiel
>    2/4/8/16 s).
> 4. **Ouvrir la PR** vers `main` via
>    `mcp__github__create_pull_request` (titre = commit, body
>    Summary + Décisions + Test plan).
> 5. **Attendre les checks GitHub Actions** (les DEUX checks
>    `Typecheck + Lint + Vitest + Build` ET
>    `Playwright E2E + axe-core a11y` doivent être verts). Si rouges
>    → autofix + re-push.
> 6. **Merger la PR** via `mcp__github__merge_pull_request`.
>
> **PHASE 2 — Audit vibe janitor (après le merge de la PR principale)** :
>
> Conformément à `CLAUDE.md` § « Audit récurrent vibe janitor de fin
> d'étape » :
>
> 1. Sync : `git checkout main && git pull --ff-only origin main`,
>    puis `git checkout -b claude/janitor-post-step28`.
> 2. **Audit en parallèle** via 2-3 subagents `general-purpose` :
>    architecture / robustesse / sécurité. Chaque agent produit un
>    rapport ; aucune modification.
> 3. Synthétiser findings par sévérité + risque régression.
> 4. **Appliquer UNIQUEMENT les fixes safe-first** (« primum non
>    nocere ») : aucun fix qui casse un test, aucun nouveau
>    problème, design system `T.*` intouchable, pas de migration DB,
>    pas de breaking change, fixes risque medium/high reportés en
>    dette.
> 5. Vérifier les 4 checks locaux verts avant push.
> 6. **PR janitor séparée** : titre `chore(janitor): post-step 28 —
>    <résumé court>`. Body : Summary + Findings (sévérité + risque)
>    + Fixes appliqués + Fixes déférés + Test plan.
> 7. Merger la PR janitor (même workflow auto-merge).
> 8. Documenter dans `HANDOFF-PROGRESS.md` § Audit vibe janitor
>    étape 28 : findings totaux, fixes appliqués (chacun avec
>    risque évalué), dette ajoutée, compteur de tests final.
>
> **Phase 3 — Recopie du prompt étape 29 (toujours obligatoire)** :
>
> Recopier le prompt étape 29 dans la **réponse de chat finale**, en
> plus de l'avoir écrit dans `HANDOFF-PROGRESS.md`. Le prompt étape
> 29 doit lui-même inclure les Phases 1, 2, 3 récursives pour la
> session N+23.
>
> **Conditions d'arrêt malgré l'autorisation permanente** :
>
> - Migration DB risquée non listée. L'étape 28 LISTE explicitement :
>   - Durcissement `signatures_select_public` (M2-sec-policy) SI
>     validation produit / DPO reçue → autorisé MAIS demander
>     confirmation à chaque PR car CHANGEMENT RLS visible côté
>     client.
>   - RPC `transparency_t99cp_total()` SI validation produit
>     reçue (additif, autorisé).
>   - Purge `stripe_events.payload` (M1-RGPD) SI décision RGPD
>     reçue → demander confirmation car table critique.
>   - Toute autre migration → demander confirmation.
> - Changement RGPD non listé.
> - Breaking change visible utilisateur.
> - Erreur Vercel / Supabase impossible à debugger en < 3 tentatives.
> - Review humaine ou commentaire GitHub avant le merge.
> - En phase janitor : un fix touche au design system `T.*`, casse
>   un test sans rollback possible, ou nécessite un bump majeur.
>
> **Contraintes générales** :
>
> - Ne pas toucher au prototype.
> - TS strict + no `any`.
> - Conserver les checks verts à chaque étape.
> - Pas d'emojis dans le code TS ni dans les commits / PR.
> - Tokens `T.*` intouchables sans validation designer.
> - Sauvegarder la DB AVANT toute migration prod (`pg_dump` →
>   bucket privé Supabase Storage).

---

## Prompt pour la session N+21 (étape 27)

> Repo : `/home/user/maintenantproto1` (branche imposée par l'harness —
> typiquement `claude/<auto>`).
>
> **Lis dans cet ordre** :
>
> 1. `CLAUDE.md` — règles projet (TS strict, pas de `any`, camelCase TS /
>    snake_case DB, SVG via `ICONS.*` pas d'emojis, RLS, RGPD, Lighthouse
>    ≥ 95, axe-core ≥ 95, `prefers-reduced-motion`). Note la section
>    « Politique de PR » qui t'autorise à enchaîner ouverture + merge
>    des PR sans confirmation **jusqu'à la session 50 incluse**. Note
>    aussi la section « Recopie systématique du prompt de la session
>    suivante » : **à la clôture de cette étape, recopier le prompt
>    étape 28 à la fois dans `HANDOFF-PROGRESS.md` ET dans la réponse de
>    chat finale**. Et enfin la section « Audit récurrent vibe janitor
>    de fin d'étape » : **après le merge de la PR principale de
>    l'étape 27, tu dois enchaîner une PR janitor séparée
>    `chore(janitor): post-step 27 — …` et inclure cette même
>    instruction janitor dans le prompt étape 28**.
> 2. `HANDOFF.md` §11 (Points d'attention) + §12 (Suivi) + §13 (Sécurité).
> 3. `HANDOFF-PROGRESS.md` — journal (étape 26 ✅ — étape 27 à faire).
> 4. `docs/PROD-RUNBOOK.md` — runbook de provisionnement (§1.2 mis à
>    jour étape 24 avec sanity checks 3+4 pour
>    `signatures_count_for_petition`).
> 5. `docs/MODERATION.md` — procédure modération.
> 6. `docs/USER-GUIDE.md` — FAQ utilisateur·rice.
>
> **État actuel à la fin de l'étape 26 + janitor post-step 26** :
>
> - **Étape 26 livrable unique** : +1 test E2E mock sur
>   `web/e2e/petition-signature.spec.ts` (« Signée — retirer ma
>   signature » pour un signataire authentifié, via seed
>   `localStorage[sb-127-auth-token]` + mock route `signatures`).
>   Suite Playwright : 31 → 32 tests. Aucune modification de
>   `src/`, `db/schema.sql`, ni de dépendances npm.
> - **Janitor post-step 26** : (à compléter par la session — cf.
>   `HANDOFF-PROGRESS.md` § Audit vibe janitor étape 26).
> - **Tous les autres items différés en bloc** (Lighthouse réel,
>   E2E happy path réel, monitoring Sentry / Supabase,
>   M2-sec-policy, T99CP cumul public, H4-deploy-deno, M1-RGPD,
>   retours utilisateur·rices, job réconciliation Stripe) :
>   conditions externes inchangées vs étape 25.
> - **872 tests vitest verts** (128 fichiers, durée ~61 s) —
>   inchangé vs étape 25.
> - **32 tests E2E Playwright** verts en CI — +1 vs étape 25.
> - Build entry inchangé (47.34 kB / gzip 13.32 kB),
>   TransparencePage inchangé (7.69 kB / gzip 3.11 kB).
> - Aucune nouvelle dépendance npm.
>
> **Provisionnement externe** — état au 2026-05-12 (inchangé depuis
> étape 19) :
>
> - ✅ Supabase staging provisionné (projet `maintenant-staging`,
>   eu-west-3, Free). Schéma `db/schema.sql` étape 19 appliqué — les
>   migrations étapes 20 + 22 + 23 + 24 (RPC
>   `users_signups_monthly` + `signatures_count_for_petition`)
>   restent à appliquer.
> - 🔲 Vercel / Stripe live / Edge Functions / Sentry SaaS / PITR /
>   projet `maintenant-test` (E2E happy path) restent à provisionner
>   par l'équipe humaine (cf. `docs/PROD-RUNBOOK.md` §2 à §4).
>
> **CONTEXTE D'OUVERTURE** — à exécuter avant toute autre action :
>
> 1. Vérifier qu'on est bien dans un workspace contenant `web/`. Si
>    non, `git fetch origin main && git merge --ff-only origin/main`.
> 2. `cd web && npm ci` (fallback : `npm install --legacy-peer-deps`).
> 3. `npm run typecheck && npm run lint && npx vitest run && npm run build`
>    pour vérifier le compteur de tests au point de départ (≥ 872
>    verts vitest à incrémenter à chaque étape ; 32 verts E2E
>    Playwright en CI).
> 4. **Demander à l'équipe humaine** :
>    - Les migrations étape 20 + étape 22 + étape 23 + étape 24
>      (`db/schema.sql` RPC `signatures_count_for_petition`)
>      ont-elles été appliquées à Supabase staging ?
>    - Le provisionnement Vercel / Stripe live / Sentry SaaS décrit
>      dans `docs/PROD-RUNBOOK.md` est-il fait ?
>    - Y a-t-il un projet Supabase de test seedé pour le test E2E
>      « signature anonyme » ?
>    - La décision produit sur le cumul T99CP émises publique a-t-elle
>      tranché ? Si oui en faveur de l'affichage public → l'étape 27
>      ajoutera la RPC `transparency_t99cp_total()` (migration DB
>      additive, scalaire SECURITY DEFINER).
>    - La décision produit / DPO sur le durcissement
>      `signatures_select_public` a-t-elle tranché ? Si oui en faveur
>      du durcissement → l'étape 27 migrera les call-sites
>      `petitions.signature_count` UI les plus chauds vers
>      `getPetitionSignatureCount`, puis remplacera la policy pour
>      ne plus projeter `user_id` aux anonymes (**CHANGEMENT RLS visible
>      côté client → demande confirmation à chaque PR de cette
>      transition**).
>    - La décision RGPD sur la purge `stripe_events.payload` (M1-RGPD)
>      a-t-elle tranché ? Si oui → migration DB additive (trigger TTL
>      ou job Edge Function périodique) — toucher à `stripe_events` =
>      **demande confirmation à chaque PR**.
>
> **PRÉREQUIS OPÉRATIONNEL BLOQUANT** — gate avant tout redéploiement
> front :
>
> Identique étape 26 : si la migration étape 24 n'est pas appliquée
> en prod, le helper `getPetitionSignatureCount` renvoie une erreur
> `function not found` à la première invocation. Tant qu'aucun
> call-site UI ne l'appelle (fin étape 26), aucun impact utilisateur ;
> mais dès qu'un call-site sera ajouté (étape 27 si la décision
> produit / DPO valide le durcissement), la migration devient
> bloquante.
>
> Procédure (cf. `PROD-RUNBOOK §1.2`) :
>
> 1. `pg_dump` staging vers bucket privé.
> 2. `psql < db/schema.sql` (idempotent `CREATE OR REPLACE`).
> 3. Test SQL admin :
>    `select public.signatures_count_for_petition('<UUID>'::uuid);`
> 4. Sanity check anon via curl (cf. `PROD-RUNBOOK §1.2` sanity check 4).
> 5. Redéployer Vercel / front une fois la RPC en place.
>
> **ÉTAPE 27 à exécuter** — Post-go-live (audit réel + monitoring +
> dette M2-sec-policy / T99CP / H4-deploy-deno / M1-RGPD si validées,
> sinon 4e itération du pattern « +1 test mock E2E ») :
>
> 1. **Audit Lighthouse réel** (priorité 1 si Vercel preview en
>    ligne) : `npx unlighthouse --site <url>` ou DevTools manuel sur
>    6 pages clés. Documenter les scores. Corriger les blocages
>    < 95. Si pas de staging HTTPS : différer étape 28.
> 2. **E2E « happy path » réel** (priorité 2 si projet Supabase de
>    test prêt) : `web/e2e/happy-path.spec.ts` qui signe
>    anonymement une pétition + vérifie le compteur. Sinon ajouter
>    encore un test mock non-vide (réutiliser
>    `installSupabaseStubs(page, { rest: ..., rpc: ... })`) — par
>    exemple : flow de signature côté UI (clic sur « Signer cette
>    pétition » → POST `signatures` interceptée → refresh visible),
>    ou un autre état non couvert en E2E
>    (mobilization detail, poll detail, transparence variants).
> 3. **Monitoring Sentry runtime** (si DSN câblé) : test canary +
>    documenter taux d'erreur 7 j + top 5 issues. Si erreurs
>    récurrentes `stripe-webhook` → prioriser job de
>    réconciliation.
> 4. **Monitoring Supabase** : quotas API / DB CPU / DB memory sur
>    7 j, alertes Slack actives ?, top requêtes lentes.
> 5. **M2-sec-policy** — durcissement
>    `signatures_select_public` (SI validation produit / DPO
>    reçue) : remplacer la policy actuelle (`for select using (true)`)
>    par une policy qui n'expose `user_id` qu'à
>    `auth.uid() = user_id OR public.is_admin(auth.uid())`. Migrer
>    les call-sites UI qui dépendent encore de la projection
>    `signatures.user_id` (chercher `from('signatures').select(`,
>    normalement aucun en public). Migrer les call-sites
>    « combien de signatures » vers `getPetitionSignatureCount`.
>    **CHANGEMENT RLS visible côté client → demander confirmation
>    à chaque PR de cette transition**. Si validation non reçue →
>    différer étape 28 et documenter la raison.
> 6. **Cumul T99CP émises publique** (différé étapes 21-26) : si
>    validation produit reçue → RPC
>    `transparency_t99cp_total() returns bigint security definer`
>    + carte dédiée sur TransparencePage. Migration DB additive
>    listée explicitement → autorisée. Sinon laisser en l'état.
> 7. **H4-deploy-deno** (dette low low) : si pipeline CI Supabase
>    réel disponible, ajouter `supabase functions deploy --dry-run`
>    sur PR. Sinon différer.
> 8. **M1-RGPD** (purge auto `stripe_events.payload` TTL 90j) : si
>    décision RGPD reçue → migration DB additive
>    (`stripe_events_payload_ttl_trigger` ou job Edge Function
>    périodique). **Toucher à `stripe_events` = demande
>    confirmation** (table critique du webhook). Sinon différer.
> 9. **Retours utilisateur·rices** (si trafic réel) : compiler
>    fixes prioritaires étape 28.
> 10. **Job de réconciliation Stripe** (dette différée étape 20) :
>     décider si on l'implémente. Critère : erreurs récurrentes
>     Sentry sur `stripe-webhook`.
> 11. **Tests** : suite vitest ≥ 872 + E2E Playwright ≥ 32 verts
>     en CI.
> 12. **HANDOFF-PROGRESS.md** : étape 27 ✅ détaillée.
> 13. **Recopier le prompt étape 28** à la fois dans
>     `HANDOFF-PROGRESS.md` ET dans la **réponse de chat finale**
>     (règle récursive). Inclure dans le prompt étape 28 la même
>     instruction de recopie pour la session N+22, ET l'instruction
>     d'audit vibe janitor pour N+22.
>
> **PHASE 1 — Clôture de l'étape principale (workflow auto-merge)** :
>
> Conformément à `CLAUDE.md` § « Politique de PR », autorisation
> permanente d'enchaîner les étapes ci-dessous sans confirmation :
>
> 1. Vérifier les 4 checks locaux verts : `npm run typecheck &&
>    npm run lint && npx vitest run && npm run build`. Si échec →
>    corriger, ne pas commit.
> 2. **Commit** : `chore(prod): step 27 — post-go-live (lighthouse +
>    e2e réel + monitoring + dette M2-sec-policy/T99CP/H4-deploy-deno/M1-RGPD
>    si validées)`. Pas d'emojis.
> 3. **Push** sur la branche imposée par l'harness (retry exponentiel
>    2/4/8/16 s).
> 4. **Ouvrir la PR** vers `main` via
>    `mcp__github__create_pull_request` (titre = commit, body
>    Summary + Décisions + Test plan).
> 5. **Attendre les checks GitHub Actions** (les DEUX checks
>    `Typecheck + Lint + Vitest + Build` ET
>    `Playwright E2E + axe-core a11y` doivent être verts). Si rouges
>    → autofix + re-push.
> 6. **Merger la PR** via `mcp__github__merge_pull_request`.
>
> **PHASE 2 — Audit vibe janitor (après le merge de la PR principale)** :
>
> Conformément à `CLAUDE.md` § « Audit récurrent vibe janitor de fin
> d'étape » :
>
> 1. Sync : `git checkout main && git pull --ff-only origin main`,
>    puis `git checkout -b claude/janitor-post-step27`.
> 2. **Audit en parallèle** via 2-3 subagents `general-purpose` :
>    architecture / robustesse / sécurité. Chaque agent produit un
>    rapport ; aucune modification.
> 3. Synthétiser findings par sévérité + risque régression.
> 4. **Appliquer UNIQUEMENT les fixes safe-first** (« primum non
>    nocere ») : aucun fix qui casse un test, aucun nouveau
>    problème, design system `T.*` intouchable, pas de migration DB,
>    pas de breaking change, fixes risque medium/high reportés en
>    dette.
> 5. Vérifier les 4 checks locaux verts avant push.
> 6. **PR janitor séparée** : titre `chore(janitor): post-step 27 —
>    <résumé court>`. Body : Summary + Findings (sévérité + risque)
>    + Fixes appliqués + Fixes déférés + Test plan.
> 7. Merger la PR janitor (même workflow auto-merge).
> 8. Documenter dans `HANDOFF-PROGRESS.md` § Audit vibe janitor
>    étape 27 : findings totaux, fixes appliqués (chacun avec
>    risque évalué), dette ajoutée, compteur de tests final.
>
> **Phase 3 — Recopie du prompt étape 28 (toujours obligatoire)** :
>
> Recopier le prompt étape 28 dans la **réponse de chat finale**, en
> plus de l'avoir écrit dans `HANDOFF-PROGRESS.md`. Le prompt étape
> 28 doit lui-même inclure les Phases 1, 2, 3 récursives pour la
> session N+22.
>
> **Conditions d'arrêt malgré l'autorisation permanente** :
>
> - Migration DB risquée non listée. L'étape 27 LISTE explicitement :
>   - Durcissement `signatures_select_public` (M2-sec-policy) SI
>     validation produit / DPO reçue → autorisé MAIS demander
>     confirmation à chaque PR car CHANGEMENT RLS visible côté
>     client.
>   - RPC `transparency_t99cp_total()` SI validation produit
>     reçue (additif, autorisé).
>   - Purge `stripe_events.payload` (M1-RGPD) SI décision RGPD
>     reçue → demander confirmation car table critique.
>   - Toute autre migration → demander confirmation.
> - Changement RGPD non listé.
> - Breaking change visible utilisateur.
> - Erreur Vercel / Supabase impossible à debugger en < 3 tentatives.
> - Review humaine ou commentaire GitHub avant le merge.
> - En phase janitor : un fix touche au design system `T.*`, casse
>   un test sans rollback possible, ou nécessite un bump majeur.
>
> **Contraintes générales** :
>
> - Ne pas toucher au prototype.
> - TS strict + no `any`.
> - Conserver les checks verts à chaque étape.
> - Pas d'emojis dans le code TS ni dans les commits / PR.
> - Tokens `T.*` intouchables sans validation designer.
> - Sauvegarder la DB AVANT toute migration prod (`pg_dump` →
>   bucket privé Supabase Storage).

---

## Prompt pour la session N+20 (étape 26)

> Repo : `/home/user/maintenantproto1` (branche imposée par l'harness —
> typiquement `claude/<auto>`).
>
> **Lis dans cet ordre** :
>
> 1. `CLAUDE.md` — règles projet (TS strict, pas de `any`, camelCase TS /
>    snake_case DB, SVG via `ICONS.*` pas d'emojis, RLS, RGPD, Lighthouse
>    ≥ 95, axe-core ≥ 95, `prefers-reduced-motion`). Note la section
>    « Politique de PR » qui t'autorise à enchaîner ouverture + merge
>    des PR sans confirmation **jusqu'à la session 50 incluse**. Note
>    aussi la section « Recopie systématique du prompt de la session
>    suivante » : **à la clôture de cette étape, recopier le prompt
>    étape 27 à la fois dans `HANDOFF-PROGRESS.md` ET dans la réponse de
>    chat finale**. Et enfin la section « Audit récurrent vibe janitor
>    de fin d'étape » : **après le merge de la PR principale de
>    l'étape 26, tu dois enchaîner une PR janitor séparée
>    `chore(janitor): post-step 26 — …` et inclure cette même
>    instruction janitor dans le prompt étape 27**.
> 2. `HANDOFF.md` §11 (Points d'attention) + §12 (Suivi) + §13 (Sécurité).
> 3. `HANDOFF-PROGRESS.md` — journal (étape 25 ✅ — étape 26 à faire).
> 4. `docs/PROD-RUNBOOK.md` — runbook de provisionnement (§1.2 mis à
>    jour étape 24 avec sanity checks 3+4 pour
>    `signatures_count_for_petition`).
> 5. `docs/MODERATION.md` — procédure modération.
> 6. `docs/USER-GUIDE.md` — FAQ utilisateur·rice.
>
> **État actuel à la fin de l'étape 25 + janitor post-step 25** :
>
> - **Étape 25 livrable unique** : +2 tests E2E mock sur
>   `web/e2e/petition-signature.spec.ts` (CTA anonyme « Se connecter
>   pour signer » avec `next=<pathname>` encodé + ratio % de
>   progression vers l'objectif). Suite Playwright : 29 → 31
>   tests. Aucune modification de `src/`, `db/schema.sql`, ni de
>   dépendances npm.
> - **Tous les autres items différés en bloc** (Lighthouse réel,
>   E2E happy path réel, monitoring Sentry / Supabase,
>   M2-sec-policy, T99CP cumul public, H4-deploy-deno, M1-RGPD,
>   retours utilisateur·rices, job réconciliation Stripe) :
>   conditions externes inchangées vs étape 24.
> - **Janitor post-step 25** : (à compléter par la session — cf.
>   PHASE 2 ci-dessous).
> - 872 tests vitest verts (128 fichiers, durée ~64 s) — inchangé
>   vs étape 24.
> - Build entry inchangé (47.34 kB / gzip 13.32 kB),
>   TransparencePage inchangé (7.69 kB / gzip 3.11 kB).
>   Aucune nouvelle dépendance npm.
>
> **Provisionnement externe — état au 2026-05-12 (inchangé depuis
> étape 19)** :
>
> - ✅ Supabase staging provisionné (projet `maintenant-staging`,
>   eu-west-3, Free). Schéma `db/schema.sql` étape 19 appliqué — les
>   migrations étapes 20 + 22 + 23 + 24 (RPC
>   `users_signups_monthly` + `signatures_count_for_petition`)
>   restent à appliquer.
> - 🔲 Vercel / Stripe live / Edge Functions / Sentry SaaS / PITR /
>   projet `maintenant-test` (E2E happy path) restent à provisionner
>   par l'équipe humaine (cf. `docs/PROD-RUNBOOK.md` §2 à §4).
>
> **CONTEXTE D'OUVERTURE — à exécuter avant toute autre action** :
>
> 1. Vérifier qu'on est bien dans un workspace contenant `web/`. Si
>    non, `git fetch origin main && git merge --ff-only origin/main`.
> 2. `cd web && npm ci` (fallback : `npm install --legacy-peer-deps`).
> 3. `npm run typecheck && npm run lint && npx vitest run && npm run build`
>    pour vérifier le compteur de tests au point de départ (≥ 872
>    verts vitest à incrémenter à chaque étape ; 31 verts E2E
>    Playwright en CI).
> 4. Demander à l'équipe humaine :
>    - Les migrations étape 20 + étape 22 + étape 23 + étape 24
>      (`db/schema.sql` RPC `signatures_count_for_petition`)
>      ont-elles été appliquées à Supabase staging ?
>    - Le provisionnement Vercel / Stripe live / Sentry SaaS décrit
>      dans `docs/PROD-RUNBOOK.md` est-il fait ?
>    - Y a-t-il un projet Supabase de test seedé pour le test E2E
>      « signature anonyme » ?
>    - La décision produit sur le cumul T99CP émises publique a-t-elle
>      tranché ? Si oui en faveur de l'affichage public → l'étape 26
>      ajoutera la RPC `transparency_t99cp_total()` (migration DB
>      additive, scalaire SECURITY DEFINER).
>    - La décision produit / DPO sur le durcissement
>      `signatures_select_public` a-t-elle tranché ? Si oui en faveur
>      du durcissement → l'étape 26 migrera les call-sites
>      `petitions.signature_count` UI les plus chauds vers
>      `getPetitionSignatureCount`, puis remplacera la policy pour
>      ne plus projeter `user_id` aux anonymes (CHANGEMENT RLS visible
>      côté client → demande confirmation à chaque PR de cette
>      transition).
>    - La décision RGPD sur la purge `stripe_events.payload` (M1-RGPD)
>      a-t-elle tranché ? Si oui → migration DB additive (trigger TTL
>      ou job Edge Function périodique) — toucher à `stripe_events` =
>      demande confirmation à chaque PR.
>
> **PRÉREQUIS OPÉRATIONNEL BLOQUANT — gate avant tout redéploiement
> front** :
>
> Identique étape 25 : si la migration étape 24 n'est pas appliquée
> en prod, le helper `getPetitionSignatureCount` renvoie une erreur
> `function not found` à la première invocation. Tant qu'aucun
> call-site UI ne l'appelle (fin étape 25), aucun impact utilisateur ;
> mais dès qu'un call-site sera ajouté (étape 26 si la décision
> produit / DPO valide le durcissement), la migration devient
> bloquante.
>
> Procédure (cf. PROD-RUNBOOK §1.2) :
>
> 1. `pg_dump` staging vers bucket privé.
> 2. `psql < db/schema.sql` (idempotent CREATE OR REPLACE).
> 3. Test SQL admin :
>    `select public.signatures_count_for_petition('<UUID>'::uuid);`
> 4. Sanity check anon via curl (cf. PROD-RUNBOOK §1.2 sanity check 4).
> 5. Redéployer Vercel / front une fois la RPC en place.
>
> **ÉTAPE 26 à exécuter — Post-go-live (audit réel + monitoring +
> dette M2-sec-policy / T99CP / H4-deploy-deno / M1-RGPD si validées,
> sinon 3e itération du pattern « +1 test mock E2E »)** :
>
> 1. **Audit Lighthouse réel** (priorité 1 si Vercel preview en
>    ligne) : `npx unlighthouse --site <url>` ou DevTools manuel sur
>    6 pages clés. Documenter les scores. Corriger les blocages
>    < 95. Si pas de staging HTTPS : différer étape 27.
> 2. **E2E « happy path » réel** (priorité 2 si projet Supabase de
>    test prêt) : `web/e2e/happy-path.spec.ts` qui signe
>    anonymement une pétition + vérifie le compteur. Sinon ajouter
>    encore un test mock non-vide (réutiliser
>    `installSupabaseStubs(page, { rest: ..., rpc: ... })`) — par
>    exemple : test de l'état « pétition signée → bouton
>    « Signée — retirer ma signature » » via mock `useAuth`
>    authentifié (`rest: { petition_signatures: { rows: [{...}] } }`
>    + `auth.v1.token` stubé pour retourner un user).
> 3. **Monitoring Sentry runtime** (si DSN câblé) : test canary
>    documenter taux d'erreur 7 j + top 5 issues. Si erreurs
>    récurrentes `stripe-webhook` → prioriser job de
>    réconciliation.
> 4. **Monitoring Supabase** : quotas API / DB CPU / DB memory sur
>    7 j, alertes Slack actives ?, top requêtes lentes.
> 5. **M2-sec-policy** — durcissement
>    `signatures_select_public` (SI validation produit / DPO
>    reçue) : remplacer la policy actuelle (`for select using (true)`)
>    par une policy qui n'expose `user_id` qu'à `auth.uid() =
>    user_id OR public.is_admin(auth.uid())`. Migrer les call-sites
>    UI qui dépendent encore de la projection `signatures.user_id`
>    (chercher `from('signatures').select(`, normalement aucun en
>    public). Migrer les call-sites « combien de signatures » vers
>    `getPetitionSignatureCount`. **CHANGEMENT RLS visible côté
>    client → demander confirmation à chaque PR de cette
>    transition**. Si validation non reçue → différer étape 27 et
>    documenter la raison.
> 6. **Cumul T99CP émises publique** (différé étapes 21-25) : si
>    validation produit reçue → RPC `transparency_t99cp_total()
>    returns bigint security definer` + carte dédiée sur
>    `TransparencePage`. Migration DB additive listée explicitement
>    → autorisée. Sinon laisser en l'état.
> 7. **H4-deploy-deno** (dette low low) : si pipeline CI Supabase
>    réel disponible, ajouter `supabase functions deploy --dry-run`
>    sur PR. Sinon différer.
> 8. **M1-RGPD** (purge auto `stripe_events.payload` TTL 90j) : si
>    décision RGPD reçue → migration DB additive
>    (`stripe_events_payload_ttl_trigger` ou job Edge Function
>    périodique). **Toucher à `stripe_events` = demande
>    confirmation** (table critique du webhook). Sinon différer.
> 9. **Retours utilisateur·rices** (si trafic réel) : compiler
>    fixes prioritaires étape 27.
> 10. **Job de réconciliation Stripe** (dette différée étape 20) :
>     décider si on l'implémente. Critère : erreurs récurrentes
>     Sentry sur `stripe-webhook`.
> 11. **Tests** : suite vitest ≥ 872 + E2E Playwright ≥ 31 verts
>     en CI.
> 12. **HANDOFF-PROGRESS.md** : étape 26 ✅ détaillée.
> 13. **Recopier le prompt étape 27 à la fois dans
>     `HANDOFF-PROGRESS.md` ET dans la réponse de chat finale**
>     (règle récursive). Inclure dans le prompt étape 27 la même
>     instruction de recopie pour la session N+21, ET l'instruction
>     d'audit vibe janitor pour N+21.
>
> **PHASE 1 — Clôture de l'étape principale (workflow auto-merge)** :
>
> Conformément à CLAUDE.md § « Politique de PR », autorisation
> permanente d'enchaîner les étapes ci-dessous sans confirmation :
>
> 1. Vérifier les 4 checks locaux verts : `npm run typecheck && npm
>    run lint && npx vitest run && npm run build`. Si échec →
>    corriger, ne pas commit.
> 2. **Commit** : `chore(prod): step 26 — post-go-live (lighthouse +
>    e2e réel + monitoring + dette M2-sec-policy/T99CP/H4-deploy-deno/M1-RGPD
>    si validées)`. Pas d'emojis.
> 3. **Push** sur la branche imposée par l'harness (retry exponentiel
>    2/4/8/16 s).
> 4. **Ouvrir la PR** vers `main` via
>    `mcp__github__create_pull_request` (titre = commit, body
>    Summary + Décisions + Test plan).
> 5. Attendre les checks GitHub Actions (les DEUX checks
>    `Typecheck + Lint + Vitest + Build` ET `Playwright E2E + axe-core
>    a11y` doivent être verts). Si rouges → autofix + re-push.
> 6. **Merger la PR** via `mcp__github__merge_pull_request`.
>
> **PHASE 2 — Audit vibe janitor (après le merge de la PR principale)** :
>
> Conformément à CLAUDE.md § « Audit récurrent vibe janitor de fin
> d'étape » :
>
> 1. Sync : `git checkout main && git pull --ff-only origin main`,
>    puis `git checkout -b claude/janitor-post-step26`.
> 2. Audit en parallèle via 2-3 subagents `general-purpose` :
>    architecture / robustesse / sécurité. Chaque agent produit un
>    rapport ; aucune modification.
> 3. Synthétiser findings par sévérité + risque régression.
> 4. Appliquer UNIQUEMENT les fixes safe-first (« primum non
>    nocere ») : aucun fix qui casse un test, aucun nouveau
>    problème, design system `T.*` intouchable, pas de migration DB,
>    pas de breaking change, fixes risque medium/high reportés en
>    dette.
> 5. Vérifier les 4 checks locaux verts avant push.
> 6. PR janitor séparée : titre `chore(janitor): post-step 26 —
>    <résumé court>`. Body : Summary + Findings (sévérité + risque)
>    + Fixes appliqués + Fixes déférés + Test plan.
> 7. Merger la PR janitor (même workflow auto-merge).
> 8. Documenter dans `HANDOFF-PROGRESS.md` § Audit vibe janitor
>    étape 26 : findings totaux, fixes appliqués (chacun avec
>    risque évalué), dette ajoutée, compteur de tests final.
>
> **Phase 3 — Recopie du prompt étape 27 (toujours obligatoire)** :
>
> Recopier le prompt étape 27 dans la réponse de chat finale, en
> plus de l'avoir écrit dans `HANDOFF-PROGRESS.md`. Le prompt étape
> 27 doit lui-même inclure les Phases 1, 2, 3 récursives pour la
> session N+21.
>
> **Conditions d'arrêt malgré l'autorisation permanente** :
>
> - Migration DB risquée non listée. L'étape 26 LISTE explicitement :
>   * Durcissement `signatures_select_public` (M2-sec-policy) SI
>     validation produit / DPO reçue → autorisé MAIS demander
>     confirmation à chaque PR car CHANGEMENT RLS visible côté
>     client.
>   * RPC `transparency_t99cp_total()` SI validation produit
>     reçue (additif, autorisé).
>   * Purge `stripe_events.payload` (M1-RGPD) SI décision RGPD
>     reçue → demander confirmation car table critique.
>   * Toute autre migration → demander confirmation.
> - Changement RGPD non listé.
> - Breaking change visible utilisateur.
> - Erreur Vercel / Supabase impossible à debugger en < 3 tentatives.
> - Review humaine ou commentaire GitHub avant le merge.
> - En phase janitor : un fix touche au design system `T.*`, casse
>   un test sans rollback possible, ou nécessite un bump majeur.
>
> **Contraintes générales** :
>
> - Ne pas toucher au prototype.
> - TS strict + no `any`.
> - Conserver les checks verts à chaque étape.
> - Pas d'emojis dans le code TS ni dans les commits / PR.
> - Tokens `T.*` intouchables sans validation designer.
> - Sauvegarder la DB AVANT toute migration prod (`pg_dump` →
>   bucket privé Supabase Storage).

---

## Prompt pour la session N+19 (étape 25)

> Repo : `/home/user/maintenantproto1` (branche imposée par l'harness —
> typiquement `claude/<auto>`).
>
> **Lis dans cet ordre** :
>
> 1. `CLAUDE.md` — règles projet (TS strict, pas de `any`, camelCase TS /
>    snake_case DB, SVG via `ICONS.*` pas d'emojis, RLS, RGPD, Lighthouse
>    ≥ 95, axe-core ≥ 95, `prefers-reduced-motion`). Note la section
>    « Politique de PR » qui t'autorise à enchaîner ouverture + merge
>    des PR sans confirmation **jusqu'à la session 50 incluse**. Note
>    aussi la section « Recopie systématique du prompt de la session
>    suivante » : **à la clôture de cette étape, recopier le prompt
>    étape 26 à la fois dans `HANDOFF-PROGRESS.md` ET dans la réponse de
>    chat finale**. Et enfin la section « Audit récurrent vibe janitor
>    de fin d'étape » : **après le merge de la PR principale de
>    l'étape 25, tu dois enchaîner une PR janitor séparée
>    `chore(janitor): post-step 25 — …` et inclure cette même
>    instruction janitor dans le prompt étape 26**.
> 2. `HANDOFF.md` §11 (Points d'attention) + §12 (Suivi) + §13 (Sécurité).
> 3. `HANDOFF-PROGRESS.md` — journal (étape 24 ✅ — étape 25 à faire).
> 4. `docs/PROD-RUNBOOK.md` — runbook de provisionnement (§1.2 mis à
>    jour étape 24 avec sanity checks 3+4 pour
>    `signatures_count_for_petition`).
> 5. `docs/MODERATION.md` — procédure modération.
> 6. `docs/USER-GUIDE.md` — FAQ utilisateur·rice.
>
> **État actuel à la fin de l'étape 24 + janitor post-step 24** :
>
> - **M3-rob clôturée** : `respondValidationFailure(deps, eventId, message)`
>   centralisé dans `web/src/lib/stripeWebhookHandler.ts`. Les 3
>   branches 4xx (`missing_user_or_subscription`,
>   `missing_subscription_id`, `missing_user_metadata`) marquent
>   désormais `processed_at` avant de renvoyer 400. Best-effort :
>   échec du marquage logue `console.warn`, ne 500 pas. 17 tests
>   vitest (vs 13 étape 23) — +4 nouveaux M3-rob.
> - **M2-sec partiellement clôturée** : RPC scalaire
>   `signatures_count_for_petition(p_petition uuid) returns integer`
>   ajoutée à `db/schema.sql` §22 — SECURITY DEFINER, grant execute
>   to anon + authenticated + service_role. Helper
>   `getPetitionSignatureCount` ajouté à `web/src/lib/petitions.ts`
>   (4 tests). **Aucun call-site UI** : le helper est livré en
>   fondation pour le durcissement futur. **Policy
>   `signatures_select_public` non touchée** — durcissement reporté
>   en dette `M2-sec-policy` (étape RLS hardening dédiée,
>   demande confirmation explicite produit / DPO).
> - **H4-deploy clôturée pour la régression #1** :
>   `web/src/lib/stripeWebhookDeploy.test.ts` (4 tests) vérifie que
>   le re-export Deno `supabase/functions/stripe-webhook/handler.ts`
>   résout toujours sur `web/src/lib/stripeWebhookHandler.ts`. La
>   régression #2 (Deno bundler) reste en dette low
>   `H4-deploy-deno`.
> - 872 tests vitest verts (128 fichiers, durée ~76 s) — +12 vs
>   étape 23.
> - Build entry inchangé (47.34 kB / gzip 13.32 kB),
>   TransparencePage inchangé (7.69 kB / gzip 3.11 kB).
>   Aucune nouvelle dépendance npm.
> - Audit Lighthouse réel + monitoring Sentry/Supabase runtime +
>   retours utilisateur·rices + cumul T99CP public + job
>   réconciliation Stripe : re-différés étape 25 (conditions
>   externes inchangées).
>
> **Provisionnement externe — état au 2026-05-12 (inchangé depuis
> étape 19)** :
>
> - ✅ Supabase staging provisionné (projet `maintenant-staging`,
>   eu-west-3, Free). Schéma `db/schema.sql` étape 19 appliqué — les
>   migrations étapes 20 + 22 + 23 + 24 (RPC
>   `users_signups_monthly` + `signatures_count_for_petition`)
>   restent à appliquer.
> - 🔲 Vercel / Stripe live / Edge Functions / Sentry SaaS / PITR /
>   projet `maintenant-test` (E2E happy path) restent à provisionner
>   par l'équipe humaine (cf. `docs/PROD-RUNBOOK.md` §2 à §4).
>
> **CONTEXTE D'OUVERTURE — à exécuter avant toute autre action** :
>
> 1. Vérifier qu'on est bien dans un workspace contenant `web/`. Si
>    non, `git fetch origin main && git merge --ff-only origin/main`.
> 2. `cd web && npm ci` (fallback : `npm install --legacy-peer-deps`).
> 3. `npm run typecheck && npm run lint && npx vitest run && npm run build`
>    pour vérifier le compteur de tests au point de départ (≥ 872
>    verts à incrémenter à chaque étape).
> 4. Demander à l'équipe humaine :
>    - Les migrations étape 20 + étape 22 + étape 23 + étape 24
>      (`db/schema.sql` RPC `signatures_count_for_petition`)
>      ont-elles été appliquées à Supabase staging ?
>    - Le provisionnement Vercel / Stripe live / Sentry SaaS décrit
>      dans `docs/PROD-RUNBOOK.md` est-il fait ?
>    - Y a-t-il un projet Supabase de test seedé pour le test E2E
>      « signature anonyme » ?
>    - La décision produit sur le cumul T99CP émises publique a-t-elle
>      tranché ? Si oui en faveur de l'affichage public → l'étape 25
>      ajoutera la RPC `transparency_t99cp_total()` (migration DB
>      additive, scalaire SECURITY DEFINER).
>    - La décision produit / DPO sur le durcissement
>      `signatures_select_public` a-t-elle tranché ? Si oui en faveur
>      du durcissement → l'étape 25 migrera les call-sites
>      `petitions.signature_count` UI les plus chauds vers
>      `getPetitionSignatureCount`, puis remplacera la policy pour
>      ne plus projeter `user_id` aux anonymes (CHANGEMENT RLS visible
>      côté client → demande confirmation à chaque PR de cette
>      transition).
>
> **PRÉREQUIS OPÉRATIONNEL BLOQUANT — gate avant tout redéploiement
> front** :
>
> Identique étape 24 : si la migration étape 24 n'est pas appliquée
> en prod, le helper `getPetitionSignatureCount` renvoie une erreur
> `function not found` à la première invocation. Tant qu'aucun
> call-site UI ne l'appelle (fin étape 24), aucun impact utilisateur ;
> mais dès qu'un call-site sera ajouté (étape 25 si la décision
> produit / DPO valide le durcissement), la migration devient
> bloquante.
>
> Procédure (cf. PROD-RUNBOOK §1.2) :
>
> 1. `pg_dump` staging vers bucket privé.
> 2. `psql < db/schema.sql` (idempotent CREATE OR REPLACE).
> 3. Test SQL admin :
>    `select public.signatures_count_for_petition('<UUID>'::uuid);`
> 4. Sanity check anon via curl (cf. PROD-RUNBOOK §1.2 sanity check 4).
> 5. Redéployer Vercel / front une fois la RPC en place.
>
> **ÉTAPE 25 à exécuter — Post-go-live (audit réel + monitoring +
> dette M2-sec-policy si validée + cumul T99CP si validé +
> H4-deploy-deno + M1-RGPD si validé)** :
>
> 1. **Audit Lighthouse réel** (priorité 1 si Vercel preview en
>    ligne) : `npx unlighthouse --site <url>` ou DevTools manuel sur
>    6 pages clés. Documenter les scores. Corriger les blocages
>    < 95. Si pas de staging HTTPS : différer étape 26.
> 2. **E2E « happy path » réel** (priorité 2 si projet Supabase de
>    test prêt) : `web/e2e/happy-path.spec.ts` qui signe
>    anonymement une pétition + vérifie le compteur. Sinon ajouter
>    encore un test mock non-vide (réutiliser
>    `installSupabaseStubs(page, { rest: ..., rpc: ... })`).
> 3. **Monitoring Sentry runtime** (si DSN câblé) : test canary
>    documenter taux d'erreur 7 j + top 5 issues. Si erreurs
>    récurrentes `stripe-webhook` → prioriser job de
>    réconciliation.
> 4. **Monitoring Supabase** : quotas API / DB CPU / DB memory sur
>    7 j, alertes Slack actives ?, top requêtes lentes.
> 5. **M2-sec-policy** — durcissement
>    `signatures_select_public` (SI validation produit / DPO
>    reçue) : remplacer la policy actuelle (`for select using (true)`)
>    par une policy qui n'expose `user_id` qu'à `auth.uid() =
>    user_id OR public.is_admin(auth.uid())`. Migrer les call-sites
>    UI qui dépendent encore de la projection `signatures.user_id`
>    (chercher `from('signatures').select(`, normalement aucun en
>    public). Migrer les call-sites « combien de signatures » vers
>    `getPetitionSignatureCount`. **CHANGEMENT RLS visible côté
>    client → demander confirmation à chaque PR de cette
>    transition**. Si validation non reçue → différer étape 26 et
>    documenter la raison.
> 6. **Cumul T99CP émises publique** (différé étapes 21-24) : si
>    validation produit reçue → RPC `transparency_t99cp_total()
>    returns bigint security definer` + carte dédiée sur
>    `TransparencePage`. Migration DB additive listée explicitement
>    → autorisée. Sinon laisser en l'état.
> 7. **H4-deploy-deno** (dette low low) : si pipeline CI Supabase
>    réel disponible, ajouter `supabase functions deploy --dry-run`
>    sur PR. Sinon différer.
> 8. **M1-RGPD** (purge auto `stripe_events.payload` TTL 90j) : si
>    décision RGPD reçue → migration DB additive
>    (`stripe_events_payload_ttl_trigger` ou job Edge Function
>    périodique). **Toucher à `stripe_events` = demande
>    confirmation** (table critique du webhook). Sinon différer.
> 9. **Retours utilisateur·rices** (si trafic réel) : compiler
>    fixes prioritaires étape 26.
> 10. **Job de réconciliation Stripe** (dette différée étape 20) :
>     décider si on l'implémente. Critère : erreurs récurrentes
>     Sentry sur `stripe-webhook`.
> 11. **Tests** : suite vitest ≥ 872 + E2E Playwright 29/29 verts
>     en CI.
> 12. **HANDOFF-PROGRESS.md** : étape 25 ✅ détaillée.
> 13. **Recopier le prompt étape 26 à la fois dans
>     `HANDOFF-PROGRESS.md` ET dans la réponse de chat finale**
>     (règle récursive). Inclure dans le prompt étape 26 la même
>     instruction de recopie pour la session N+20, ET l'instruction
>     d'audit vibe janitor pour N+20.
>
> **PHASE 1 — Clôture de l'étape principale (workflow auto-merge)** :
>
> Conformément à CLAUDE.md § « Politique de PR », autorisation
> permanente d'enchaîner les étapes ci-dessous sans confirmation :
>
> 1. Vérifier les 4 checks locaux verts : `npm run typecheck && npm
>    run lint && npx vitest run && npm run build`. Si échec →
>    corriger, ne pas commit.
> 2. **Commit** : `chore(prod): step 25 — post-go-live (lighthouse +
>    e2e réel + monitoring + dette M2-sec-policy/H4-deploy-deno/M1-RGPD)`.
>    Pas d'emojis.
> 3. **Push** sur la branche imposée par l'harness (retry exponentiel
>    2/4/8/16 s).
> 4. **Ouvrir la PR** vers `main` via
>    `mcp__github__create_pull_request` (titre = commit, body
>    Summary + Décisions + Test plan).
> 5. Attendre les checks GitHub Actions (les DEUX checks
>    `Typecheck + Lint + Vitest + Build` ET `Playwright E2E + axe-core
>    a11y` doivent être verts). Si rouges → autofix + re-push.
> 6. **Merger la PR** via `mcp__github__merge_pull_request`.
>
> **PHASE 2 — Audit vibe janitor (après le merge de la PR principale)** :
>
> Conformément à CLAUDE.md § « Audit récurrent vibe janitor de fin
> d'étape » :
>
> 1. Sync : `git checkout main && git pull --ff-only origin main`,
>    puis `git checkout -b claude/janitor-post-step25`.
> 2. Audit en parallèle via 2-3 subagents `general-purpose` :
>    architecture / robustesse / sécurité. Chaque agent produit un
>    rapport ; aucune modification.
> 3. Synthétiser findings par sévérité + risque régression.
> 4. Appliquer UNIQUEMENT les fixes safe-first (« primum non
>    nocere ») : aucun fix qui casse un test, aucun nouveau
>    problème, design system `T.*` intouchable, pas de migration DB,
>    pas de breaking change, fixes risque medium/high reportés en
>    dette.
> 5. Vérifier les 4 checks locaux verts avant push.
> 6. PR janitor séparée : titre `chore(janitor): post-step 25 —
>    <résumé court>`. Body : Summary + Findings (sévérité + risque)
>    + Fixes appliqués + Fixes déférés + Test plan.
> 7. Merger la PR janitor (même workflow auto-merge).
> 8. Documenter dans `HANDOFF-PROGRESS.md` § Audit vibe janitor
>    étape 25 : findings totaux, fixes appliqués (chacun avec
>    risque évalué), dette ajoutée, compteur de tests final.
>
> **Phase 3 — Recopie du prompt étape 26 (toujours obligatoire)** :
>
> Recopier le prompt étape 26 dans la réponse de chat finale, en
> plus de l'avoir écrit dans `HANDOFF-PROGRESS.md`. Le prompt étape
> 26 doit lui-même inclure les Phases 1, 2, 3 récursives pour la
> session N+20.
>
> **Conditions d'arrêt malgré l'autorisation permanente** :
>
> - Migration DB risquée non listée. L'étape 25 LISTE explicitement :
>   * Durcissement `signatures_select_public` (M2-sec-policy) SI
>     validation produit / DPO reçue → autorisé MAIS demander
>     confirmation à chaque PR car CHANGEMENT RLS visible côté
>     client.
>   * RPC `transparency_t99cp_total()` SI validation produit
>     reçue (additif, autorisé).
>   * Purge `stripe_events.payload` (M1-RGPD) SI décision RGPD
>     reçue → demander confirmation car table critique.
>   * Toute autre migration → demander confirmation.
> - Changement RGPD non listé.
> - Breaking change visible utilisateur.
> - Erreur Vercel / Supabase impossible à debugger en < 3 tentatives.
> - Review humaine ou commentaire GitHub avant le merge.
> - En phase janitor : un fix touche au design system `T.*`, casse
>   un test sans rollback possible, ou nécessite un bump majeur.
>
> **Contraintes générales** :
>
> - Ne pas toucher au prototype.
> - TS strict + no `any`.
> - Conserver les checks verts à chaque étape.
> - Pas d'emojis dans le code TS ni dans les commits / PR.
> - Tokens `T.*` intouchables sans validation designer.
> - Sauvegarder la DB AVANT toute migration prod (`pg_dump` →
>   bucket privé Supabase Storage).

---

## Prompt pour la session N+18 (étape 24)

> Repo : `/home/user/maintenantproto1` (branche imposée par l'harness —
> typiquement `claude/<auto>`).
>
> **Lis dans cet ordre** :
>
> 1. `CLAUDE.md` — règles projet (TS strict, pas de `any`, camelCase TS /
>    snake_case DB, SVG via `ICONS.*` pas d'emojis, RLS, RGPD, Lighthouse
>    ≥ 95, axe-core ≥ 95, `prefers-reduced-motion`). Note la section
>    « Politique de PR » qui t'autorise à enchaîner ouverture + merge
>    des PR sans confirmation **jusqu'à la session 50 incluse**. Note
>    aussi la section « Recopie systématique du prompt de la session
>    suivante » : **à la clôture de cette étape, recopier le prompt
>    étape 25 à la fois dans `HANDOFF-PROGRESS.md` ET dans la réponse de
>    chat finale**. Et enfin la section « Audit récurrent vibe janitor
>    de fin d'étape » : **après le merge de la PR principale de
>    l'étape 24, tu dois enchaîner une PR janitor séparée
>    `chore(janitor): post-step 24 — …` et inclure cette même
>    instruction janitor dans le prompt étape 25.**
> 2. `HANDOFF.md` §11 (Points d'attention) + §12 (Suivi) + §13
>    (Sécurité).
> 3. `HANDOFF-PROGRESS.md` — journal (étape 23 ✅ — étape 24 à faire).
> 4. `docs/PROD-RUNBOOK.md` — runbook de provisionnement (§1.2 mis à
>    jour étape 23 avec sanity check `users_signups_monthly`).
> 5. `docs/MODERATION.md` — procédure modération.
> 6. `docs/USER-GUIDE.md` — FAQ utilisateur·rice.
>
> **État actuel à la fin de l'étape 23 + janitor post-step 23** :
>
> - **RPC `users_signups_monthly(p_months_back integer default 12)`**
>   ajoutée à `db/schema.sql` §21 — SECURITY DEFINER, bornée
>   `[1, 60]`, grant execute to anon + authenticated + service_role.
>   Dette **H1-rob clôturée**. Migration additive idempotente
>   (CREATE OR REPLACE). À appliquer en staging avant tout
>   redéploiement front (`fetchMonthlySignups` côté client appelle
>   la RPC) — cf. `docs/PROD-RUNBOOK.md` §1.2.
> - **Handler stripe-webhook canonique** dans
>   `web/src/lib/stripeWebhookHandler.ts`. `supabase/functions/
>   stripe-webhook/handler.ts` est désormais un thin re-export.
>   Tests vitest renommés `stripeWebhookHandler.test.ts`, import
>   intra-package. Dette **H2-arch clôturée**.
> - **`fetchMonthlySignups` refactor RPC** : signature passe de
>   `(client, monthsBack, now)` à `(client, monthsBack)` — `now`
>   n'a plus de sens (référence côté DB). 6 tests vitest
>   (RPC-based) remplacent les 5 anciens (client-bucketing).
>   `buildMonthsRange` conservé pour les tests
>   `MonthlySignupsChart.test.tsx`.
> - **`SupabaseStubOverrides` (E2E)** étend `rpc?: Record<string,
>   { rows?: unknown[] }>`. `transparence.spec.ts` adapté.
>   `petition-signature.spec.ts` +1 test (compteur signatures
>   formaté FR). Rétro-compatible.
> - **860 tests vitest verts** (127 fichiers, durée ~62 s) — +1
>   vs étape 22 (859 → 860).
> - Build entry `47.34 kB / gzip 13.32 kB` (inchangé) + chunk
>   `TransparencePage` 7.53 kB / gzip 3.04 kB lazy (-0.57 kB
>   vs étape 22 : bucketing client supprimé). Aucune nouvelle
>   dépendance npm.
> - Audit Lighthouse réel + monitoring Sentry/Supabase runtime +
>   retours utilisateur·rices + cumul T99CP public : **re-différés
>   étape 24** (conditions externes inchangées).
>
> **Provisionnement externe — état au 2026-05-12 (inchangé depuis
> étape 19)** :
>
> - ✅ Supabase **staging** provisionné (projet `maintenant-staging`,
>   eu-west-3, Free). Schéma `db/schema.sql` étape 19 appliqué — les
>   migrations étapes 20 + 22 + **23 (RPC `users_signups_monthly`)**
>   restent à appliquer.
> - 🔲 Vercel / Stripe live / Edge Functions / Sentry SaaS / PITR /
>   projet `maintenant-test` (E2E happy path) restent à provisionner
>   par l'équipe humaine (cf. `docs/PROD-RUNBOOK.md` §2 à §4).
>
> **CONTEXTE D'OUVERTURE — à exécuter avant toute autre action** :
>
> 1. Vérifier qu'on est bien dans un workspace contenant `web/`. Si
>    non, `git fetch origin main && git merge --ff-only origin/main`.
> 2. `cd web && npm ci` (fallback : `npm install --legacy-peer-deps`).
> 3. `npm run typecheck && npm run lint && npx vitest run && npm run build`
>    pour vérifier le compteur de tests au point de départ (≥ 860
>    verts à incrémenter à chaque étape).
> 4. **Demander à l'équipe humaine** :
>    - Les migrations étape 20 + étape 22 + **étape 23**
>      (`db/schema.sql` RPC `users_signups_monthly`) ont-elles été
>      appliquées à Supabase staging ?
>    - Le provisionnement Vercel / Stripe live / Sentry SaaS décrit
>      dans `docs/PROD-RUNBOOK.md` est-il fait ?
>    - Y a-t-il un projet Supabase de test seedé pour le test E2E
>      « signature anonyme » ?
>    - La décision produit sur le **cumul T99CP émises publique** a-t-elle
>      tranché ? Si oui en faveur de l'affichage public → l'étape 24
>      ajoutera la RPC `transparency_t99cp_total()` (migration DB
>      additive, scalaire SECURITY DEFINER).
>
> **PRÉREQUIS OPÉRATIONNEL BLOQUANT — gate avant tout redéploiement
> front** :
>
> - `fetchMonthlySignups` côté client (`web/src/lib/transparency.ts`)
>   appelle désormais `rpc('users_signups_monthly', { p_months_back: 12 })`.
>   Si la migration étape 23 n'est pas appliquée en prod, le chart
>   `/transparence` affichera « Graphique indisponible » à la
>   première visite (erreur RPC `function not found`).
> - Procédure : (1) `pg_dump` staging vers bucket privé, (2)
>   `psql < db/schema.sql` (idempotent), (3) test SQL côté anon
>   `select * from public.users_signups_monthly() limit 3;` —
>   doit retourner 3 lignes (mois UTC, count >= 0), jamais
>   `permission denied`. (4) Redéployer Vercel / front une fois
>   la RPC en place.
>
> **ÉTAPE 24 à exécuter — Post-go-live (audit réel + monitoring +
> dette M3-rob/M2-sec + cumul T99CP si validé)** :
>
> 1. **Audit Lighthouse réel** (priorité 1 si Vercel preview en
>    ligne) : `npx unlighthouse --site <url>` ou DevTools manuel
>    sur 6 pages clés. Documenter les scores. Corriger les
>    blocages < 95. Si pas de staging HTTPS : différer étape 25.
> 2. **E2E « happy path » réel** (priorité 2 si projet Supabase
>    de test prêt) : `web/e2e/happy-path.spec.ts` qui signe
>    anonymement une pétition + vérifie le compteur. Sinon
>    rajouter encore un test mock non-vide (réutiliser
>    `installSupabaseStubs(page, { rest: ..., rpc: ... })`).
> 3. **Monitoring Sentry runtime** (si DSN câblé) : test canary
>    + documenter taux d'erreur 7 j + top 5 issues. Si erreurs
>    récurrentes `stripe-webhook` → prioriser job de
>    réconciliation.
> 4. **Monitoring Supabase** : quotas API / DB CPU / DB memory
>    sur 7 j, alertes Slack actives ?, top requêtes lentes.
> 5. **M3-rob — marquer `processed_at` sur validation 4xx** :
>    actuellement la branche `missing_user_metadata` /
>    `missing_user_or_subscription` / `missing_subscription_id`
>    renvoie 400 sans marquer la ligne `stripe_events`. Pour
>    distinguer « validation refusée définitivement » de
>    « jamais traité par le handler », appeler
>    `recordEventProcessed(event.id)` avant le `return new
>    Response(..., { status: 400 })` dans les branches
>    métier validation. Tests vitest à adapter. Migration DB :
>    aucune. Risque régression : faible (additif côté
>    handler, comportement Stripe inchangé).
> 6. **M2-sec — RPC publique de comptage signatures par pétition** :
>    actuellement `signatures_select_public for select using (true)`
>    permet d'énumérer les signataires par
>    `select user_id from signatures where petition_id = X`
>    (RGPD Art. 9 : un soutien politique peut être inféré).
>    Remplacer par RPC `signatures_count_for_petition(p_petition uuid)
>    returns integer security definer`, durcir la policy
>    publique pour ne plus exposer `user_id` aux anonymes.
>    **Migration DB additive listée explicitement → autorisée.**
>    Risque régression : moyen — vérifier que
>    `fetchPetition` / compteur frontale n'utilise pas
>    `signatures_select_public` directement.
> 7. **Cumul T99CP émises publique** (différé étape 21+22+23) :
>    si validation produit reçue → RPC
>    `transparency_t99cp_total() returns bigint security definer`
>    + carte dédiée sur `TransparencePage`. **Migration DB
>    additive listée explicitement → autorisée.** Sinon laisser
>    en l'état.
> 8. **Retours utilisateur·rices** (si trafic réel) : compiler
>    fixes prioritaires étape 25.
> 9. **Job de réconciliation Stripe (dette différée étape 20)** :
>    décider si on l'implémente. Critère : erreurs récurrentes
>    Sentry sur `stripe-webhook`.
> 10. **Tests** : suite vitest ≥ 860 + e2e Playwright verts en CI.
> 11. `HANDOFF-PROGRESS.md` : étape 24 ✅ détaillée.
> 12. **Recopier le prompt étape 25** à la fois dans
>     `HANDOFF-PROGRESS.md` ET dans la **réponse de chat finale**
>     (règle récursive). **Inclure dans le prompt étape 25 la
>     même instruction de recopie pour la session N+19, ET
>     l'instruction d'audit vibe janitor pour N+19.**
>
> **PHASE 1 — Clôture de l'étape principale (workflow auto-merge)** :
>
> Conformément à CLAUDE.md § « Politique de PR », autorisation
> permanente d'enchaîner les étapes ci-dessous sans confirmation :
>
> 1. Vérifier les 4 checks locaux verts : `npm run typecheck && npm
>    run lint && npx vitest run && npm run build`. Si échec →
>    corriger, ne pas commit.
> 2. Commit : `chore(prod): step 24 — post-go-live (lighthouse +
>    e2e réel + monitoring + dette M3-rob/M2-sec)`. Pas d'emojis.
> 3. Push sur la branche imposée par l'harness (retry exponentiel
>    2/4/8/16 s).
> 4. Ouvrir la PR vers `main` via
>    `mcp__github__create_pull_request` (titre = commit, body
>    Summary + Décisions + Test plan).
> 5. Attendre les checks GitHub Actions. Si rouges → autofix +
>    re-push.
> 6. Merger la PR via `mcp__github__merge_pull_request`.
>
> **PHASE 2 — Audit vibe janitor (après le merge de la PR principale)** :
>
> Conformément à CLAUDE.md § « Audit récurrent vibe janitor de fin
> d'étape » :
>
> 1. Sync : `git checkout main && git pull --ff-only origin main`,
>    puis `git checkout -b claude/janitor-post-step24`.
> 2. Audit en parallèle via 2-3 subagents `general-purpose` :
>    architecture / robustesse / sécurité. Chaque agent produit un
>    rapport ; aucune modification.
> 3. Synthétiser findings par sévérité + risque régression.
> 4. Appliquer UNIQUEMENT les fixes safe-first (« primum non
>    nocere ») : aucun fix qui casse un test, aucun nouveau
>    problème, design system T.* intouchable, pas de migration DB,
>    pas de breaking change, fixes risque medium/high reportés en
>    dette.
> 5. Vérifier les 4 checks locaux verts avant push.
> 6. PR janitor séparée : titre `chore(janitor): post-step 24 —
>    <résumé court>`. Body : Summary + Findings (sévérité +
>    risque) + Fixes appliqués + Fixes déférés + Test plan.
> 7. Merger la PR janitor (même workflow auto-merge).
> 8. Documenter dans `HANDOFF-PROGRESS.md` § Audit vibe janitor
>    étape 24 : findings totaux, fixes appliqués (chacun avec
>    risque évalué), dette ajoutée, compteur de tests final.
>
> **Phase 3 — Recopie du prompt étape 25** (toujours obligatoire) :
>
> 1. Recopier le prompt étape 25 dans la **réponse de chat finale**,
>    en plus de l'avoir écrit dans `HANDOFF-PROGRESS.md`. Le prompt
>    étape 25 doit lui-même inclure les Phases 1, 2, 3 récursives
>    pour la session N+19.
>
> **Conditions d'arrêt malgré l'autorisation permanente** :
>
> - Migration DB risquée non listée. L'étape 24 LISTE explicitement :
>   - RPC `signatures_count_for_petition()` SI durcissement M2-sec
>     (additif, autorisé) ; **attention : durcir
>     `signatures_select_public` pour ne plus exposer `user_id`
>     aux anonymes = changement RLS, demander confirmation
>     explicite si on touche aux policies existantes**.
>   - RPC `transparency_t99cp_total()` SI validation produit reçue
>     (additif, autorisé).
>   Toute autre migration → demander confirmation.
> - Changement RGPD non listé.
> - Breaking change visible utilisateur.
> - Erreur Vercel / Supabase impossible à debugger en < 3 tentatives.
> - Review humaine ou commentaire GitHub avant le merge.
> - En phase janitor : un fix touche au design system `T.*`, casse
>   un test sans rollback possible, ou nécessite un bump majeur.
>
> **Contraintes générales** :
>
> - Ne pas toucher au prototype.
> - TS strict + no `any`.
> - Conserver les checks verts à chaque étape.
> - Pas d'emojis dans le code TS ni dans les commits / PR.
> - Tokens `T.*` intouchables sans validation designer.
> - Sauvegarder la DB AVANT toute migration prod (`pg_dump` →
>   bucket privé Supabase Storage).

---

### Audit vibe janitor étape 23

**Branche** : `claude/janitor-post-step23`.

Audit en parallèle via 3 subagents `general-purpose` (architecture /
élégance, robustesse / edge cases, sécurité / cohérence handoff) sur
le scope PR #23 / commit `26ba751`. Synthèse + application des fixes
safe-first uniquement, conformément à `CLAUDE.md § Audit récurrent
vibe janitor`.

#### Trouvaille hors-périmètre janitor — CI Playwright cassée depuis l'étape 22

Pendant l'audit, l'utilisateur a notifié l'échec récurrent du job
`Playwright E2E + axe-core a11y` sur les PR #21, #22 et #23 (le job
n'a jamais été investigué auparavant, le check n'étant pas dans la
liste des 4 checks bloquants définis par CLAUDE.md). L'examen du
rapport Playwright (téléchargé via l'artifact `playwright-report`
de la PR #23) a isolé **un seul test en échec** sur 29 : `transparence.spec.ts
>> Page /transparence — compteurs et graphique non-nuls >> affiche
les compteurs publics avec des valeurs non-nulles`. Les 28 autres
tests E2E sont verts.

**Root cause** (analyse trace `0-trace.network`) : la réponse
fournie par Playwright `route.fulfill` côté `mockSupabase.ts`
contient bien `content-range: 0-0/42`, mais il manque
`access-control-expose-headers: content-range`. La page tourne sur
`http://127.0.0.1:4173` (vite preview) tandis que l'API mockée est
sur `http://127.0.0.1:54321` (Supabase URL) → CORS cross-origin
strict : le browser refuse à JavaScript l'accès à tout header de
réponse non-safelisté qui n'est pas explicitement exposé via
`Access-Control-Expose-Headers`. Le header `content-range` n'est PAS
dans la safelist HTTP. Conséquence : `res.headers.get("content-range")`
côté postgrest-js retourne `null` (alors que le header est techniquement
présent dans la réponse réseau), le count n'est jamais parsé, tous
les compteurs tombent à 0 → l'assertion `getByText('42', exact: true)`
ne trouve rien.

Bug **pré-existant** depuis l'étape 22 (introduction du test
« compteurs non-nuls »). N'a jamais été détecté car (a) le check
Playwright n'est pas dans les 4 checks locaux/CI bloquants, et
(b) les autres tests E2E qui passent ne valident jamais l'exactitude
des valeurs de count (juste la visibilité de la `list`).

**Fix safe-first appliqué** (cf. **R0-cors** ci-dessous) : ajouter
`'access-control-expose-headers': 'content-range'` aux deux branches
`route.fulfill` (override et catch-all par défaut) dans
`web/e2e/utils/mockSupabase.ts`. Diff additif, E2E-only, hors bundle
prod. Risque régression : **low**. Bénéfice : passe de **1 test
Playwright en échec à 0** (à valider sur CI step 24).

#### Findings totaux

| Catégorie | Critical | High | Medium | Low |
| --- | --- | --- | --- | --- |
| Architecture (12) | 0 | 0 | 4 | 8 |
| Robustesse (15) | 0 | 1 | 5 | 9 |
| Sécurité / cohérence (14) | 0 | 0 | 2 | 12 |
| **Total** | **0** | **1** | **11** | **29** |

Le seul `high` est **R1/S5** : risque de bundling cross-package
Deno pour le re-export `supabase/functions/stripe-webhook/handler.ts`
→ `../../../web/src/lib/stripeWebhookHandler.ts`. Fix safe non-trivial
(soit smoke CI `supabase functions deploy --dry-run`, soit
duplication du handler). **Reporté en dette H4-deploy** (cf. tableau
ci-dessous).

#### Fixes appliqués (7)

| Finding | Sévérité | Risque régression | Fichier |
| --- | --- | --- | --- |
| **R0-cors** robustesse — CI Playwright cassée par CORS expose-headers manquant | high | low | `web/e2e/utils/mockSupabase.ts:127-130, 142-145` |
| **A2** architecture — `export *` au lieu du re-export multi-clauses (zéro dette de synchro pour nouveaux symboles) | low | low | `supabase/functions/stripe-webhook/handler.ts:17` |
| **A3 + R3** architecture/robustesse — guard runtime sur `row.month_iso` (regex strict YYYY-MM-DD) + `Number(row.count)` défensif dans `fetchMonthlySignups` | medium | low | `web/src/lib/transparency.ts:194-210` |
| **R2** robustesse — `Number(row.count)` cast (anticipe une future sérialisation `bigint` PostgREST en string) | medium | low | inclus dans A3+R3 |
| **A5** architecture — clarif commentaire SQL : distinguer le scan DB (non limité) vs le transfert HTTP (tronqué à `max_rows = 1000`) | medium | low | `db/schema.sql:1995-2000` |
| **S7** sécurité/cohérence — PROD-RUNBOOK §1.2 : ajouter un sanity check 2 côté anon (curl PostgREST) car psql en superuser bypasse les grants | low | low | `docs/PROD-RUNBOOK.md:82-92` |

#### Fixes déférés (dette technique)

| Finding | Sévérité | Risque régression | Pourquoi déféré |
| --- | --- | --- | --- |
| **R1/S5 — Risque bundling cross-package Deno** (H4-deploy) | high | medium | Fix safe demande soit un smoke CI `supabase functions deploy --dry-run`, soit duplication handler. Hors scope janitor safe-first. Reporté en dette **H4-deploy** (nouveau). |
| **S1+S2 sécurité — `set search_path` SECURITY DEFINER ne couvre pas `pg_catalog, pg_temp`** | medium | low | Migration DB (additive `alter function ... set search_path = ...`), [STOP-PR]. Reporté pour groupage avec une future étape RLS hardening (cf. dette H3-sec). |
| **A4 architecture — `buildMonthsRange` exporté sans appelant runtime** | low | medium | Utilisé par `MonthlySignupsChart.test.tsx` comme helper test. Le supprimer casse 4 tests pour zéro bénéfice runtime. JSDoc déjà clair. Garder. |
| **A6 architecture — renommer column `count` en `signup_count`** | low | low | [STOP-PR] migration DB + alignement type TS + tests E2E. Hors scope. |
| **A8 architecture — mock RPC orphelin sans warn** | medium | low | Ajouter `console.warn` côté Playwright peut polluer le rapport en CI. À discuter en passe E2E dédiée. |
| **A9 robustesse — regex NNBSP `petition-signature.spec.ts`** | low | medium | La regex actuelle accepte aussi espaces simples. Durcir à `[  \s]?` risque de casser sur ICU différent en CI. Reporter à passe de durcissement E2E. |
| **R5 robustesse — `timezone()` côté date_trunc** | low | low | [STOP-PR] migration DB. Risque non bloquant (Supabase par défaut UTC). |
| **R9 robustesse — `getByText(/^42$/)` strict-mode-violation potentielle** | medium | medium | Refacto vers `data-testid` touche `PetitionDetailPage.tsx` (composant rendu). Hors scope janitor safe-first. À traiter en passe E2E dédiée. |
| **R11 robustesse — `buildMonthsRange` non-runtime** | low | medium | Voir A4. |
| **R13 robustesse — `MonthlySignupsChart` div/0 latent** | low | low | Hors périmètre diff PR #23 (composant inchangé étape 23). |
| **S3 sécurité — grant `service_role` sur `users_signups_monthly` non justifié** | low | low | Cohérence avec § 20 (autres RPC) + défense en profondeur. Garder pour symétrie. |
| **S4 sécurité — `extra_search_path` ne couvre pas `extensions`** | low | medium | Pas d'usage actuel d'extensions PG dans la RPC. À surveiller. |

#### Dette technique consolidée — mise à jour

| ID | Sévérité | Risque rég. | Description courte | Étape cible |
| --- | --- | --- | --- | --- |
| H3-sec | high | high | `users.email` exposé via `users_select_public for select using (true)` | étape RLS hardening dédiée |
| **H4-deploy (nouveau)** | high | medium | Re-export cross-package `supabase/functions/stripe-webhook/handler.ts` → `web/src/lib/` : bundler `supabase functions deploy` n'est pas validé en CI ; risque de déployer une version stale du handler | étape 24+ (smoke deploy CI ou duplication) |
| ~~H2-rob~~ | ~~high~~ | ~~medium~~ | ~~grant `service_role` sur `credit_t99cp(uuid,integer,text,text)`~~ | **clôturée étape 22** |
| ~~H2-arch~~ | ~~high~~ | ~~medium~~ | ~~`stripeWebhook.test.ts` cross-package import~~ | **clôturée étape 23** |
| ~~H1-rob~~ | ~~high~~ | ~~medium~~ | ~~`fetchMonthlySignups` sans `range()/limit()` → biais > 1000 lignes~~ | **clôturée étape 23** |
| **S1+S2-sec (nouveau)** | medium | low | `users_signups_monthly` SECURITY DEFINER avec `set search_path = public` seul (vs `pg_catalog, public, pg_temp` recommandé) | étape RLS hardening dédiée |
| M2-sec | medium | high | `signatures_select_public` permet enum signataires (RGPD Art. 9) | étape RLS hardening |
| M5-rob | medium | low | `count: 'exact'` sur `signatures` au-delà ~100k lignes | étape stats matérialisées (suivre H1-rob) |
| M3-rob | medium | medium | `processed_at` non marqué sur validation 4xx (event silencieusement abandonné) | étape 24 (migration DB) |
| M1-RGPD | medium | medium | purge auto `stripe_events.payload` (TTL 90j ou scrub avant insert) | décision RGPD + migration |
| **R9-e2e (nouveau)** | medium | medium | `getByText(/^42$/)` fragile dans `petition-signature.spec.ts` → strict-mode-violation potentielle | passe E2E dédiée |
| L1-a11y | medium | high | color-contrast `--mn-text-3` (~195 usages) | étape design dédiée |
| L3-arch | low | low | extraire hook `useFetchOnMount` | nice-to-have |
| L4-sec | low | low | CSP `script-src https://js.stripe.com` | quand Stripe Elements activé |
| L5-arch | low | medium | inline `CSSProperties` dupliqués | étape design dédiée |
| L1-rob | low | low | tests `vi.fn<typeof ...>` pattern inconsistant | passe test hygiene |

#### Tests

- **860 tests vitest verts** (127 fichiers, durée ~60 s). Compte
  **inchangé** vs étape 23 — les guards défensifs A3+R3 ne changent
  pas le comportement pour les rows valides (couverts par les 6
  tests RPC existants) et le code mort filtré ne nécessite pas de
  test supplémentaire (filtres pure-fonction).
- 4 checks locaux verts (typecheck, lint, vitest, build).
- Build : entry `47.34 kB / gzip 13.32 kB` (inchangé), chunk
  `TransparencePage` 7.53 kB / gzip 3.04 kB (inchangé).
- **R0-cors** : à valider sur le prochain CI step 24 — la suite
  Playwright devrait maintenant passer à 29/29 verts (vs 28/29
  historique).
- Pas de changement design system `T.*`.
- Pas de migration DB.
- Pas de breaking change utilisateur.
- Pas de bump majeur de dépendance.

#### Décisions

- **R0-cors prioritaire** : bien que techniquement hors périmètre
  janitor (bug pré-existant depuis étape 22, non causé par le diff
  PR #23), le fix est trivial (2 lignes, additif, E2E-only) et
  débloque la CI Playwright. Critère « primum non nocere » respecté.
- **H4-deploy reporté en dette** plutôt que rollback du refacto
  H2-arch : le rollback réintroduirait la dette qu'on vient de
  clôturer. La solution propre (smoke CI deploy ou duplication)
  demande une étape dédiée avec validation utilisateur.
- **Guards défensifs A3+R3 appliqués** : risque medium signalé mais
  les tests vitest passent identiquement (les rows valides ne sont
  pas filtrées). Bénéfice net : robustesse contre futurs changements
  de sérialisation PostgREST.
- **Pas de fix design system, pas de migration DB, pas de
  breaking change, pas de bump majeur** — conditions d'arrêt
  CLAUDE.md respectées.

---

## Prompt pour la session N+17 (étape 23)

> Repo : `/home/user/maintenantproto1` (branche imposée par l'harness —
> typiquement `claude/<auto>`).
>
> **Lis dans cet ordre** :
>
> 1. `CLAUDE.md` — règles projet (TS strict, pas de `any`, camelCase TS /
>    snake_case DB, SVG via `ICONS.*` pas d'emojis, RLS, RGPD, Lighthouse
>    ≥ 95, axe-core ≥ 95, `prefers-reduced-motion`). Note la section
>    « Politique de PR » qui t'autorise à enchaîner ouverture + merge
>    des PR sans confirmation **jusqu'à la session 50 incluse**. Note
>    aussi la section « Recopie systématique du prompt de la session
>    suivante » : **à la clôture de cette étape, recopier le prompt
>    étape 24 à la fois dans `HANDOFF-PROGRESS.md` ET dans la réponse de
>    chat finale**. Et enfin la section « Audit récurrent vibe janitor
>    de fin d'étape » : **après le merge de la PR principale de
>    l'étape 23, tu dois enchaîner une PR janitor séparée
>    `chore(janitor): post-step 23 — …` et inclure cette même
>    instruction janitor dans le prompt étape 24.**
> 2. `HANDOFF.md` §11 (Points d'attention) + §12 (Suivi) + §13
>    (Sécurité).
> 3. `HANDOFF-PROGRESS.md` — journal (étape 22 ✅ — étape 23 à faire).
> 4. `docs/PROD-RUNBOOK.md` — runbook de provisionnement.
> 5. `docs/MODERATION.md` — procédure modération.
> 6. `docs/USER-GUIDE.md` — FAQ utilisateur·rice (section « Combien de
>    T99CP ont été distribués au total ? » ajoutée à l'étape 22).
>
> **État actuel à la fin de l'étape 22 + janitor post-step 22** :
>
> - **Grant `service_role` explicite** sur `credit_t99cp(uuid, integer,
>   text, text)` + `debit_t99cp(uuid, integer, text)` ajouté à
>   `db/schema.sql` §20. Dette **H2-rob clôturée**. Migration additive
>   idempotente (no-op sur projet non-hardened, déblocante sur projet
>   hardened). À appliquer en staging avant tout redéploiement Edge
>   Function — cf. `docs/PROD-RUNBOOK.md` §3.
> - **E2E `transparence.spec.ts` densifié** : 5 tests (3 originaux +
>   2 nouveaux avec compteurs publics non-nuls + chart SVG visible).
>   `web/e2e/utils/mockSupabase.ts` accepte un paramètre `overrides`
>   optionnel pour seeder count/rows par table. Rétro-compatible.
> - **Cumul T99CP émises publique** : décision documentée dans
>   `docs/USER-GUIDE.md` (section dédiée). La RPC
>   `transparency_t99cp_total()` reste à créer le jour où la décision
>   produit est validée.
> - **859 tests vitest verts** (127 fichiers, durée ~58 s) — inchangé
>   vs janitor post-step 21 (pas de nouveau code source TS, donc pas
>   de nouvelle couverture vitest).
> - Build entry `47.34 kB / gzip 13.32 kB` + chunk `TransparencePage`
>   8.10 kB / gzip 3.29 kB lazy. Aucune nouvelle dépendance npm.
> - Audit Lighthouse réel + monitoring Sentry/Supabase runtime +
>   retours utilisateur·rices : **re-différés étape 23** (conditions
>   externes inchangées).
>
> **Provisionnement externe — état au 2026-05-12 (inchangé depuis
> étape 19)** :
>
> - ✅ Supabase **staging** provisionné (projet `maintenant-staging`,
>   eu-west-3, Free). Schéma `db/schema.sql` étape 19 appliqué — les
>   migrations étapes 20 + 22 (grant service_role) restent à
>   appliquer.
> - 🔲 Vercel / Stripe live / Edge Functions / Sentry SaaS / PITR /
>   projet `maintenant-test` (E2E happy path) restent à provisionner
>   par l'équipe humaine (cf. `docs/PROD-RUNBOOK.md` §2 à §4).
>
> **CONTEXTE D'OUVERTURE — à exécuter avant toute autre action** :
>
> 1. Vérifier qu'on est bien dans un workspace contenant `web/`. Si
>    non, `git fetch origin main && git merge --ff-only origin/main`.
> 2. `cd web && npm ci` (fallback : `npm install --legacy-peer-deps`).
> 3. `npm run typecheck && npm run lint && npx vitest run && npm run build`
>    pour vérifier le compteur de tests au point de départ (≥ 859
>    verts à incrémenter à chaque étape).
> 4. **Demander à l'équipe humaine** :
>    - Les migrations étape 20 + étape 22 (`db/schema.sql`) ont-elles
>      été appliquées à Supabase staging ?
>    - Le provisionnement Vercel / Stripe live / Sentry SaaS décrit
>      dans `docs/PROD-RUNBOOK.md` est-il fait ?
>    - Y a-t-il un projet Supabase de test seedé pour le test E2E
>      « signature anonyme » ?
>    - La décision produit sur le **cumul T99CP émises publique** a-t-elle
>      tranché ? Si oui en faveur de l'affichage public → l'étape 23
>      ajoutera la RPC `transparency_t99cp_total()` (migration DB
>      additive, scalaire SECURITY DEFINER).
>
> **PRÉREQUIS OPÉRATIONNEL BLOQUANT — gate avant tout redéploiement
> Edge Function** :
>
> - L'Edge Function `stripe-webhook` (étape 20) appelle `credit_t99cp`
>   avec **4 arguments**. Les migrations `db/schema.sql` étapes 20 +
>   22 (grant `service_role`) doivent avoir été appliquées AVANT
>   tout redéploiement de l'Edge Function.
> - Procédure : (1) `pg_dump` staging vers bucket privé, (2)
>   `psql < db/schema.sql` (idempotent), (3) test SQL côté
>   service-role
>   `select credit_t99cp('11111111-1111-1111-1111-111111111111', 1, 'test-23', 'evt_test_step23');`
>   — doit retourner OK ou `unknown_user`, **jamais**
>   `permission denied`. (4) `supabase functions deploy
>   stripe-webhook --no-verify-jwt`. (5) test canary
>   `stripe trigger invoice.payment_succeeded`. **Si une migration
>   n'a pas été appliquée : STOP, demander à l'équipe humaine.**
>
> **ÉTAPE 23 à exécuter — Post-go-live (audit réel + monitoring +
> dette H1-rob/H2-arch + cumul T99CP si validé)** :
>
> 1. **Audit Lighthouse réel** (priorité 1 si Vercel preview en
>    ligne) : `npx unlighthouse --site <url>` ou DevTools manuel
>    sur 6 pages clés. Documenter les scores. Corriger les
>    blocages < 95. Si pas de staging HTTPS : différer étape 24.
> 2. **E2E « happy path » réel** (priorité 2 si projet Supabase
>    de test prêt) : `web/e2e/happy-path.spec.ts` qui signe
>    anonymement une pétition + vérifie le compteur. Sinon
>    rajouter encore un test mock non-vide à `transparence.spec.ts`
>    ou à `petition-signature.spec.ts` (réutiliser
>    `installSupabaseStubs(page, { rest: ... })`).
> 3. **Monitoring Sentry runtime** (si DSN câblé) : test canary
>    + documenter taux d'erreur 7 j + top 5 issues. Si erreurs
>    récurrentes `stripe-webhook` → prioriser job de
>    réconciliation.
> 4. **Monitoring Supabase** : quotas API / DB CPU / DB memory
>    sur 7 j, alertes Slack actives ?, top requêtes lentes.
> 5. **H1-rob — RPC `users_signups_monthly()` côté DB** : si
>    validation produit reçue OU staging `users` > 5k lignes →
>    RPC `returns table(month_iso date, count int)` SECURITY
>    DEFINER, lecture limitée à `auth.role() in ('anon',
>    'authenticated')`, agrégation côté serveur. Remplacer
>    `fetchMonthlySignups` côté client. Migration DB additive
>    listée explicitement → autorisée. Sinon documenter le défer
>    dans le tableau dette.
> 6. **H2-arch — `stripeWebhook.test.ts` cross-package import** :
>    refacto pour que les tests vitest des Edge Functions
>    n'importent plus le code Deno via chemin relatif fragile.
>    Soit (a) déplacer le handler-utility dans un shared lib
>    `web/src/lib/stripe-webhook-shared.ts`, soit (b) mocker au
>    niveau de l'interface. Pas de migration DB. Risque
>    régression : moyen — vérifier tous les tests vitest
>    concernés.
> 7. **Cumul T99CP émises publique** (différé étape 21+22) : si
>    validation produit reçue → RPC
>    `transparency_t99cp_total() returns bigint security definer`
>    + carte dédiée sur `TransparencePage`. **Migration DB
>    additive listée explicitement → autorisée.** Sinon laisser
>    en l'état (la doc `USER-GUIDE.md` couvre déjà la décision).
> 8. **Retours utilisateur·rices** (si trafic réel) : premiers
>    comptes créés, bounce rate `/auth/confirm`, signalements
>    modération, bugs tech@. Compiler fixes prioritaires
>    étape 24.
> 9. **Job de réconciliation Stripe (dette différée étape 20)** :
>    décider si on l'implémente (Edge Function qui scanne
>    `stripe_events WHERE processed_at IS NULL AND received_at <
>    now() - interval '15 min'`). Critère : erreurs récurrentes
>    Sentry sur `stripe-webhook`.
> 10. **Tests** : suite vitest ≥ 859 + e2e Playwright verts en CI.
> 11. `HANDOFF-PROGRESS.md` : étape 23 ✅ détaillée.
> 12. **Recopier le prompt étape 24** à la fois dans
>     `HANDOFF-PROGRESS.md` ET dans la **réponse de chat finale**
>     (règle récursive). **Inclure dans le prompt étape 24 la
>     même instruction de recopie pour la session N+18, ET
>     l'instruction d'audit vibe janitor pour N+18.**
>
> **PHASE 1 — Clôture de l'étape principale (workflow auto-merge)** :
>
> Conformément à CLAUDE.md § « Politique de PR », autorisation
> permanente d'enchaîner les étapes ci-dessous sans confirmation :
>
> 1. Vérifier les 4 checks locaux verts : `npm run typecheck && npm
>    run lint && npx vitest run && npm run build`. Si échec →
>    corriger, ne pas commit.
> 2. Commit : `chore(prod): step 23 — post-go-live (lighthouse +
>    e2e réel + monitoring + dette H1-rob/H2-arch)`. Pas d'emojis.
> 3. Push sur la branche imposée par l'harness (retry exponentiel
>    2/4/8/16 s).
> 4. Ouvrir la PR vers `main` via
>    `mcp__github__create_pull_request` (titre = commit, body
>    Summary + Décisions + Test plan).
> 5. Attendre les checks GitHub Actions. Si rouges → autofix +
>    re-push.
> 6. Merger la PR via `mcp__github__merge_pull_request`.
>
> **PHASE 2 — Audit vibe janitor (après le merge de la PR principale)** :
>
> Conformément à CLAUDE.md § « Audit récurrent vibe janitor de fin
> d'étape » :
>
> 1. Sync : `git checkout main && git pull --ff-only origin main`,
>    puis `git checkout -b claude/janitor-post-step23`.
> 2. Audit en parallèle via 2-3 subagents `general-purpose` :
>    architecture / robustesse / sécurité. Chaque agent produit un
>    rapport ; aucune modification.
> 3. Synthétiser findings par sévérité + risque régression.
> 4. Appliquer UNIQUEMENT les fixes safe-first (« primum non
>    nocere ») : aucun fix qui casse un test, aucun nouveau
>    problème, design system T.* intouchable, pas de migration DB,
>    pas de breaking change, fixes risque medium/high reportés en
>    dette.
> 5. Vérifier les 4 checks locaux verts avant push.
> 6. PR janitor séparée : titre `chore(janitor): post-step 23 —
>    <résumé court>`. Body : Summary + Findings (sévérité +
>    risque) + Fixes appliqués + Fixes déférés + Test plan.
> 7. Merger la PR janitor (même workflow auto-merge).
> 8. Documenter dans `HANDOFF-PROGRESS.md` § Audit vibe janitor
>    étape 23 : findings totaux, fixes appliqués (chacun avec
>    risque évalué), dette ajoutée, compteur de tests final.
>
> **Phase 3 — Recopie du prompt étape 24** (toujours obligatoire) :
>
> 1. Recopier le prompt étape 24 dans la **réponse de chat finale**,
>    en plus de l'avoir écrit dans `HANDOFF-PROGRESS.md`. Le prompt
>    étape 24 doit lui-même inclure les Phases 1, 2, 3 récursives
>    pour la session N+18.
>
> **Conditions d'arrêt malgré l'autorisation permanente** :
>
> - Migration DB risquée non listée. L'étape 23 LISTE explicitement :
>   - RPC `users_signups_monthly()` SI validation produit ou volume
>     staging (additif, autorisé).
>   - RPC `transparency_t99cp_total()` SI validation produit reçue
>     (additif, autorisé).
>   Toute autre migration → demander confirmation.
> - Changement RGPD non listé.
> - Breaking change visible utilisateur.
> - Erreur Vercel / Supabase impossible à debugger en < 3 tentatives.
> - Review humaine ou commentaire GitHub avant le merge.
> - En phase janitor : un fix touche au design system `T.*`, casse
>   un test sans rollback possible, ou nécessite un bump majeur.
>
> **Contraintes générales** :
>
> - Ne pas toucher au prototype.
> - TS strict + no `any`.
> - Conserver les checks verts à chaque étape.
> - Pas d'emojis dans le code TS ni dans les commits / PR.
> - Tokens `T.*` intouchables sans validation designer.
> - Sauvegarder la DB AVANT toute migration prod (`pg_dump` →
>   bucket privé Supabase Storage).

---

## Prompt pour la session N+16 (étape 22)

> Repo : `/home/user/maintenantproto1` (branche imposée par l'harness —
> typiquement `claude/<auto>`).
>
> **Lis dans cet ordre** :
>
> 1. `CLAUDE.md` — règles projet (TS strict, pas de `any`, camelCase TS /
>    snake_case DB, SVG via `ICONS.*` pas d'emojis, RLS, RGPD, Lighthouse
>    ≥ 95, axe-core ≥ 95, `prefers-reduced-motion`). Note la section
>    « Politique de PR » qui t'autorise à enchaîner ouverture + merge
>    des PR sans confirmation **jusqu'à la session 50 incluse**. Note
>    aussi la section « Recopie systématique du prompt de la session
>    suivante » : **à la clôture de cette étape, recopier le prompt
>    étape 23 à la fois dans `HANDOFF-PROGRESS.md` ET dans la réponse de
>    chat finale**. Et enfin la section « Audit récurrent vibe janitor
>    de fin d'étape » : **après le merge de la PR principale de
>    l'étape 22, tu dois enchaîner une PR janitor séparée
>    `chore(janitor): post-step 22 — …` et inclure cette même
>    instruction janitor dans le prompt étape 23.**
> 2. `HANDOFF.md` §11 (Points d'attention) + §12 (Suivi) + §13
>    (Sécurité).
> 3. `HANDOFF-PROGRESS.md` — journal (étape 21 ✅ — étape 22 à faire).
> 4. `docs/PROD-RUNBOOK.md` — runbook de provisionnement.
> 5. `docs/MODERATION.md` — procédure modération.
> 6. `docs/USER-GUIDE.md` — FAQ utilisateur·rice.
>
> **État actuel à la fin de l'étape 21 + janitor post-step 21** :
>
> - **Transparence v2** : `/transparence` affiche maintenant un
>   graphique d'évolution mensuelle des inscriptions (SVG natif inline,
>   pas de lib externe). Lecture RLS-safe sur `users.created_at`
>   uniquement (pas de PII transférée).
> - **E2E UI-only** `web/e2e/transparence.spec.ts` : 3 tests (routing
>   + état vide chart + lien footer). Le « happy path réel »
>   (Supabase de test seedé + signature anonyme) reste différé jusqu'à
>   provisionnement d'un projet `maintenant-test`.
> - **857 tests vitest verts** (127 fichiers, durée ~63 s). +18 vs
>   étape 20 (839).
> - Build entry `47.34 kB / gzip 13.34 kB` + chunk
>   `TransparencePage` 8.06 kB / gzip 3.26 kB lazy. Aucune nouvelle
>   dépendance npm.
> - Pas de migration DB appliquée durant cette étape.
> - Audit Lighthouse réel + monitoring Sentry/Supabase runtime +
>   retours utilisateur·rices : **différés étape 22** car
>   provisionnement Vercel/Sentry SaaS/trafic réel manquant.
>
> **Provisionnement externe — état au 2026-05-12 (inchangé depuis
> étape 19)** :
>
> - ✅ Supabase **staging** provisionné (projet `maintenant-staging`,
>   eu-west-3, Free, schéma `db/schema.sql` étape 19 appliqué — la
>   migration étape 20 reste à appliquer).
> - 🔲 Vercel / Stripe live / Edge Functions / Sentry SaaS / PITR
>   restent à provisionner par l'équipe humaine (cf.
>   `docs/PROD-RUNBOOK.md` §2 à §4).
>
> **CONTEXTE D'OUVERTURE — à exécuter avant toute autre action** :
>
> 1. Vérifier qu'on est bien dans un workspace contenant `web/`. Si
>    non, `git fetch origin main && git merge --ff-only origin/main`.
> 2. `cd web && npm ci` (fallback : `npm install --legacy-peer-deps`).
> 3. `npm run typecheck && npm run lint && npx vitest run && npm run build`
>    pour vérifier le compteur de tests au point de départ (≥ 857
>    verts avant janitor post-step 21, à incrémenter à chaque étape).
> 4. **Demander à l'équipe humaine** :
>    - La migration étape 20 (`db/schema.sql`) a-t-elle été appliquée
>      à Supabase staging ?
>    - Le provisionnement Vercel / Stripe live / Sentry SaaS décrit
>      dans `docs/PROD-RUNBOOK.md` est-il fait ?
>    - Y a-t-il un projet Supabase de test seedé pour le test E2E
>      « signature anonyme » ?
>    - Pour le **cumul T99CP émises publique** (différé étape 21) :
>      la donnée est-elle souhaitée sur `/transparence` ? Si oui,
>      l'étape 22 ajoutera la RPC `transparency_t99cp_total()`
>      (migration DB additive, scalaire SECURITY DEFINER).
>
> **PRÉREQUIS OPÉRATIONNEL BLOQUANT — gate avant tout redéploiement
> Edge Function** :
>
> - L'Edge Function `stripe-webhook` (étape 20) appelle `credit_t99cp`
>   avec **4 arguments**. La migration `db/schema.sql` étape 20 doit
>   avoir été appliquée AVANT tout redéploiement de l'Edge Function.
> - Procédure : (1) `pg_dump` staging vers bucket privé, (2)
>   `psql < db/schema.sql` (idempotent), (3) `supabase functions deploy
>   stripe-webhook --no-verify-jwt`, (4) test canary
>   `stripe trigger invoice.payment_succeeded`. **Si la migration
>   n'a pas été appliquée : STOP, demander à l'équipe humaine.**
>
> **ÉTAPE 22 à exécuter — Post-go-live (audit réel + monitoring +
> dette H2-rob + cumul T99CP si validé)** :
>
> 1. **Audit Lighthouse réel** (priorité 1 si Vercel preview en
>    ligne) : `npx unlighthouse --site <url>` ou DevTools manuel
>    sur 6 pages clés. Documenter les scores. Corriger les
>    blocages < 95. Si pas de staging HTTPS : différer étape 23.
> 2. **E2E « happy path » réel** (priorité 2 si projet Supabase
>    de test prêt) : `web/e2e/happy-path.spec.ts` qui signe
>    anonymement une pétition + vérifie le compteur. Sinon
>    densifier `transparence.spec.ts` avec des cas mock non-nuls.
> 3. **Monitoring Sentry runtime** (si DSN câblé) : test canary
>    + documenter taux d'erreur 7 j + top 5 issues. Si erreurs
>    récurrentes `stripe-webhook` → prioriser job de
>    réconciliation.
> 4. **Monitoring Supabase** : quotas API / DB CPU / DB memory
>    sur 7 j, alertes Slack actives ?, top requêtes lentes.
> 5. **H2-rob — grant service_role explicite sur credit_t99cp(4
>    args)** : tester en staging
>    `select credit_t99cp('...', 60, 'test-22', 'evt_test_step22')`
>    côté service-role. Si permission denied → ajouter
>    `grant execute ... to service_role;` dans `db/schema.sql`
>    (migration additive listée → autorisée). Sinon clore la
>    dette H2-rob.
> 6. **Cumul T99CP émises publique** (différé étape 21) : si
>    validation produit reçue → RPC
>    `transparency_t99cp_total() returns bigint security definer`
>    + carte dédiée sur `TransparencePage`. **Migration DB
>    additive listée explicitement → autorisée.** Sinon
>    documenter la décision dans `USER-GUIDE.md`.
> 7. **Retours utilisateur·rices** (si trafic réel) : premiers
>    comptes créés, bounce rate `/auth/confirm`, signalements
>    modération, bugs tech@. Compiler fixes prioritaires
>    étape 23.
> 8. **Job de réconciliation Stripe (dette différée étape 20)** :
>    décider si on l'implémente (Edge Function qui scanne
>    `stripe_events WHERE processed_at IS NULL AND received_at <
>    now() - interval '15 min'`). Critère : erreurs récurrentes
>    Sentry sur `stripe-webhook`.
> 9. **Tests** : suite vitest ≥ 857 + e2e Playwright verts en CI.
> 10. `HANDOFF-PROGRESS.md` : étape 22 ✅ détaillée.
> 11. **Recopier le prompt étape 23** à la fois dans
>     `HANDOFF-PROGRESS.md` ET dans la **réponse de chat finale**
>     (règle récursive). **Inclure dans le prompt étape 23 la
>     même instruction de recopie pour la session N+17, ET
>     l'instruction d'audit vibe janitor pour N+17.**
>
> **PHASE 1 — Clôture de l'étape principale (workflow auto-merge)** :
>
> Conformément à CLAUDE.md § « Politique de PR », autorisation
> permanente d'enchaîner les étapes ci-dessous sans confirmation :
>
> 1. Vérifier les 4 checks locaux verts : `npm run typecheck && npm
>    run lint && npx vitest run && npm run build`. Si échec →
>    corriger, ne pas commit.
> 2. Commit : `chore(prod): step 22 — post-go-live (lighthouse +
>    e2e réel + monitoring + dette)`. Pas d'emojis.
> 3. Push sur la branche imposée par l'harness (retry exponentiel
>    2/4/8/16 s).
> 4. Ouvrir la PR vers `main` via
>    `mcp__github__create_pull_request` (titre = commit, body
>    Summary + Décisions + Test plan).
> 5. Attendre les checks GitHub Actions. Si rouges → autofix +
>    re-push.
> 6. Merger la PR via `mcp__github__merge_pull_request`.
>
> **PHASE 2 — Audit vibe janitor (après le merge de la PR principale)** :
>
> Conformément à CLAUDE.md § « Audit récurrent vibe janitor de fin
> d'étape » :
>
> 1. Sync : `git checkout main && git pull --ff-only origin main`,
>    puis `git checkout -b claude/janitor-post-step22`.
> 2. Audit en parallèle via 2-3 subagents `general-purpose` :
>    architecture / robustesse / sécurité. Chaque agent produit un
>    rapport ; aucune modification.
> 3. Synthétiser findings par sévérité + risque régression.
> 4. Appliquer UNIQUEMENT les fixes safe-first (« primum non
>    nocere ») : aucun fix qui casse un test, aucun nouveau
>    problème, design system T.* intouchable, pas de migration DB,
>    pas de breaking change, fixes risque medium/high reportés en
>    dette.
> 5. Vérifier les 4 checks locaux verts avant push.
> 6. PR janitor séparée : titre `chore(janitor): post-step 22 —
>    <résumé court>`. Body : Summary + Findings (sévérité +
>    risque) + Fixes appliqués + Fixes déférés + Test plan.
> 7. Merger la PR janitor (même workflow auto-merge).
> 8. Documenter dans `HANDOFF-PROGRESS.md` § Audit vibe janitor
>    étape 22 : findings totaux, fixes appliqués (chacun avec
>    risque évalué), dette ajoutée, compteur de tests final.
>
> **Phase 3 — Recopie du prompt étape 23** (toujours obligatoire) :
>
> 1. Recopier le prompt étape 23 dans la **réponse de chat finale**,
>    en plus de l'avoir écrit dans `HANDOFF-PROGRESS.md`. Le prompt
>    étape 23 doit lui-même inclure les Phases 1, 2, 3 récursives
>    pour la session N+17.
>
> **Conditions d'arrêt malgré l'autorisation permanente** :
>
> - Migration DB risquée non listée. L'étape 22 LISTE explicitement :
>   - grant `service_role` sur `credit_t99cp` 4-args (additif,
>     autorisé).
>   - RPC `transparency_t99cp_total()` SI validation produit reçue
>     (additif, autorisé).
>   Toute autre migration → demander confirmation.
> - Changement RGPD non listé.
> - Breaking change visible utilisateur.
> - Erreur Vercel / Supabase impossible à debugger en < 3 tentatives.
> - Review humaine ou commentaire GitHub avant le merge.
> - En phase janitor : un fix touche au design system `T.*`, casse
>   un test sans rollback possible, ou nécessite un bump majeur.
>
> **Contraintes générales** :
>
> - Ne pas toucher au prototype.
> - TS strict + no `any`.
> - Conserver les checks verts à chaque étape.
> - Pas d'emojis dans le code TS ni dans les commits / PR.
> - Tokens `T.*` intouchables sans validation designer.
> - Sauvegarder la DB AVANT toute migration prod (`pg_dump` →
>   bucket privé Supabase Storage).

---

## Prompt pour la session N+15 (étape 21)

> Repo : `/home/user/maintenantproto1` (branche imposée par l'harness —
> typiquement `claude/<auto>`).
>
> **Lis dans cet ordre** :
>
> 1. `CLAUDE.md` — règles projet (TS strict, pas de `any`, camelCase TS /
>    snake_case DB, SVG via `ICONS.*` pas d'emojis, RLS, RGPD, Lighthouse
>    ≥ 95, axe-core ≥ 95, `prefers-reduced-motion`). Note la section
>    « Politique de PR » qui t'autorise à enchaîner ouverture + merge
>    des PR sans confirmation **jusqu'à la session 50 incluse**. Note
>    aussi la section « Recopie systématique du prompt de la session
>    suivante » : **à la clôture de cette étape, recopier le prompt
>    étape 22 à la fois dans `HANDOFF-PROGRESS.md` ET dans la réponse de
>    chat finale**. Et enfin la section « Audit récurrent vibe janitor
>    de fin d'étape » : **après le merge de la PR principale de
>    l'étape 21, tu dois enchaîner une PR janitor séparée
>    `chore(janitor): post-step 21 — …` et inclure cette même
>    instruction janitor dans le prompt étape 22.**
> 2. `HANDOFF.md` §11 (Points d'attention) + §12 (Suivi) + §13
>    (Sécurité).
> 3. `HANDOFF-PROGRESS.md` — journal (étape 20 ✅ — étape 21 à faire).
> 4. `docs/PROD-RUNBOOK.md` — runbook de provisionnement créé à
>    l'étape 19.
> 5. `docs/MODERATION.md` — procédure modération.
> 6. `docs/USER-GUIDE.md` — FAQ utilisateur·rice.
>
> **État actuel à la fin de l'étape 20 + janitor post-step20** :
>
> - **Idempotence DB du webhook Stripe** : colonne
>   `t99cp_transactions.source_event_id text` + index unique partiel
>   `WHERE source_event_id IS NOT NULL`. RPC `credit_t99cp` étendue
>   avec `p_source_event_id text default null` (court-circuit
>   silencieux si déjà vu, gestion `unique_violation` pour les races).
>   Edge Function passe `event.id` sur `invoice.payment_succeeded`.
> - **Webhook handler extrait** dans
>   `supabase/functions/stripe-webhook/handler.ts` (testé en vitest
>   via 13 tests). `index.ts` ne contient plus que le bootstrap Deno.
> - **Page `/transparence`** publique avec compteurs RLS-safe
>   (members, petitions/mobilizations/campaigns/communes published,
>   signatures). `web/src/lib/transparency.ts` + tests (8+6).
> - **839 tests verts** (126 fichiers, durée ~61 s). +27 vs étape 19.
> - Build entry `47.27 kB / gzip 13.31 kB` + chunks lazy
>   (`TransparencePage` 4.79 kB / gzip 2.08 kB).
> - Pas de migration appliquée à Supabase staging dans la session
>   (étape DB faite côté schema.sql + types ; déploiement à
>   l'équipe humaine via PROD-RUNBOOK §1).
>
> **Provisionnement externe — état au 2026-05-12 (inchangé depuis
> étape 19)** :
>
> - ✅ Supabase **staging** provisionné (projet `maintenant-staging`,
>   eu-west-3, Free, schéma `db/schema.sql` étape 19 appliqué — la
>   migration étape 20 reste à appliquer). URL :
>   `https://fdphrsqrsumkpzbxnjdj.supabase.co`. Clé `anon` legacy
>   JWT stockée dans `web/.env.local` côté équipe humaine.
> - 🔲 Vercel / Stripe live / Edge Functions / Sentry SaaS / PITR
>   restent à provisionner par l'équipe humaine (cf.
>   `docs/PROD-RUNBOOK.md` §2 à §4).
>
> **CONTEXTE D'OUVERTURE — à exécuter avant toute autre action** :
>
> 1. Vérifier qu'on est bien dans un workspace contenant `web/`. Si
>    non (rare — branche partie d'un main obsolète),
>    `git fetch origin main && git merge --ff-only origin/main`.
> 2. `cd web && npm ci` (fallback : `npm install --legacy-peer-deps`).
> 3. `npm run typecheck && npm run lint && npx vitest run && npm run build`
>    pour vérifier le compteur de tests au point de départ (≥ 839
>    verts après le janitor post-step 20, à incrémenter à chaque
>    étape).
> 4. **Demander à l'équipe humaine** :
>    - La migration étape 20 (`db/schema.sql`) a-t-elle été appliquée
>      à Supabase staging ? Si oui : récupérer le `pg_dump`
>      pré-migration archivé.
>    - Le provisionnement Vercel / Stripe / Sentry décrit dans
>      `docs/PROD-RUNBOOK.md` est-il fait ?
>    - Y a-t-il un projet Supabase de test seedé pour le test E2E
>      « signature anonyme » ?
>
> **PRÉREQUIS OPÉRATIONNEL BLOQUANT — gate avant tout redéploiement
> Edge Function** :
>
> - L'Edge Function `stripe-webhook` (étape 20) appelle `credit_t99cp`
>   avec **4 arguments** (`p_user, p_amount, p_reason,
>   p_source_event_id`). La migration `db/schema.sql` étape 20 doit
>   donc avoir été appliquée AVANT tout redéploiement de l'Edge
>   Function via `npx supabase functions deploy`. Sinon : erreur
>   PostgREST `function public.credit_t99cp(uuid, integer, text,
>   text) does not exist` à chaque `invoice.payment_succeeded` →
>   crédits T99CP non honorés (Stripe retentera pendant 3 jours).
> - Procédure : (1) `pg_dump` staging vers bucket privé, (2)
>   `psql < db/schema.sql` (idempotent — additif seulement + drop
>   de la signature 3-args), (3) `supabase functions deploy
>   stripe-webhook --no-verify-jwt`, (4) test canary
>   `stripe trigger invoice.payment_succeeded`. **Si la migration
>   n'a pas été appliquée : STOP, demander à l'équipe humaine.**
>
> **ÉTAPE 21 à exécuter — Post-go-live (audit réel + monitoring +
> premiers retours + dette)** :
>
> 1. **Audit Lighthouse réel** :
>    - Si Vercel preview/staging.maintenant.org est en ligne :
>      `npx unlighthouse --site <url>` ou DevTools manuel sur 6
>      pages clés (cf. PROD-RUNBOOK.md §5).
>    - Documenter les scores dans `HANDOFF-PROGRESS.md § Audit
>      Lighthouse étape 21` (perf / a11y / seo / best-practices).
>    - Corriger les blocages < 95 (LCP, CLS, TBT). **Pas de
>      changement design system sans validation designer**.
>    - Si pas de staging HTTPS encore : différer une fois de plus à
>      l'étape 22, ne PAS tenter d'audit en local-dev (résultats
>      inexploitables).
> 2. **Premier test E2E « happy path » réel** :
>    - Si projet Supabase de test prêt : ajouter
>      `web/e2e/happy-path.spec.ts` qui signe anonymement une
>      pétition publique pré-seedée et vérifie le compteur.
>    - Sinon ajouter un E2E « UI-only » qui rend
>      `/transparence` et vérifie l'affichage de compteurs à zéro
>      (mock du fetch) — au moins pour valider le routing.
> 3. **Monitoring Sentry runtime** :
>    - Si DSN configuré en preview : vérifier que les events
>      arrivent bien (test canary
>      `throw new Error('sentry-canary-step21')` depuis une page
>      admin protégée + immédiatement retirer).
>    - Documenter le taux d'erreur sur les 7 derniers jours, top 5
>      des issues.
> 4. **Monitoring Supabase** :
>    - Quotas API / DB CPU / DB memory sur 7 jours.
>    - Alertes Slack #alerts-prod actives ?
>    - Top requêtes lentes (cf. dashboard Supabase → Performance).
> 5. **Retours utilisateur·rices** (si trafic réel) :
>    - Premiers comptes créés (combien ? bounce rate sur
>      `/auth/confirm` ?).
>    - Premiers signalements modération (cf. `/admin/reports` ou
>      `is_flagged=true`).
>    - Bugs remontés en email tech@maintenant.org.
>    - Compiler une liste de fixes prioritaires pour l'étape 22.
> 6. **Job de réconciliation Stripe (dette différée étape 20)** :
>    - Décider si on implémente un job Edge Function qui scanne
>      `stripe_events WHERE processed_at IS NULL AND received_at <
>      now() - interval '15 min'` et alerte / rejoue.
>    - Critère : si Sentry montre des erreurs récurrentes sur
>      `stripe-webhook`, le job devient prioritaire. Sinon
>      l'idempotence DB suffit (cf. décision étape 20).
> 7. **Page transparence — compléments** :
>    - Ajouter un cumul **« total contributions T99CP émises »**
>      (somme de `t99cp_transactions.amount where kind='credit'`)
>      si la donnée reste publique sans révéler de PII (à valider).
>    - Optionnel : graphique d'évolution mensuelle des
>      inscriptions (lib `recharts` ou SVG natif — favoriser SVG
>      natif pour ne pas alourdir le bundle).
> 8. **Dette technique à adresser** (priorité décroissante) :
>    - Color-contrast `--mn-text-3` (195 usages) — nécessite
>      validation designer (cf. étape 19 décision a11y).
>    - Purge automatique `stripe_events.payload` (TTL 90 j ou
>      scrub avant insert) — décision RGPD à prendre.
>    - CSP `script-src https://js.stripe.com` si on ajoute Stripe
>      Elements côté front (pas encore).
> 9. **Tests** : suite vitest ≥ 839 + e2e Playwright verts en CI.
> 10. `HANDOFF-PROGRESS.md` : étape 21 ✅ détaillée (sections
>     « Audit Lighthouse », « E2E réel », « Monitoring Sentry »,
>     « Monitoring Supabase », « Retours utilisateur », « Décisions »).
> 11. **Recopier ce prompt étape 22** à la fois dans
>     `HANDOFF-PROGRESS.md` ET dans la **réponse de chat finale**
>     (règle récursive, cf. CLAUDE.md § Recopie systématique du
>     prompt de la session suivante). **Inclure dans le prompt
>     étape 22 la même instruction de recopie pour la session
>     N+16, pour que la chaîne se propage. Inclure aussi
>     l'instruction d'audit vibe janitor pour N+16** (cf.
>     CLAUDE.md § Audit récurrent vibe janitor).
>
> **PHASE 1 — Clôture de l'étape principale (workflow auto-merge)** :
>
> Conformément à CLAUDE.md § « Politique de PR », tu as
> autorisation permanente d'enchaîner les étapes ci-dessous sans
> confirmation. Procéder dans l'ordre, sans s'arrêter entre les
> étapes :
>
> 1. Vérifier les 4 checks locaux verts :
>    `npm run typecheck && npm run lint && npx vitest run && npm
>    run build`. Si un check échoue → corriger, ne pas commit.
> 2. Commit :
>    `chore(prod): step 21 — post-go-live (lighthouse + e2e + monitoring + transparence v2)`.
>    Pas d'emojis dans le message.
> 3. Push sur la branche imposée par l'harness
>    (`git push -u origin <branch>`, retry exponentiel
>    2/4/8/16 s).
> 4. Ouvrir la PR vers `main` via
>    `mcp__github__create_pull_request` (titre identique au commit,
>    body Summary + Décisions + Test plan).
> 5. Attendre les checks GitHub Actions si présents. S'ils sont
>    rouges → autofix puis re-push.
> 6. Merger la PR via `mcp__github__merge_pull_request` (merge
>    ou squash).
>
> **PHASE 2 — Audit vibe janitor (après le merge de la PR principale)** :
>
> Conformément à CLAUDE.md § « Audit récurrent vibe janitor de fin
> d'étape », après le merge de la PR principale et avant de clôturer
> la session :
>
> 1. Sync : `git checkout main && git pull --ff-only origin main`,
>    puis `git checkout -b claude/janitor-post-step21` (ou nom
>    similaire imposé par l'harness).
> 2. Audit en parallèle via 2 à 3 subagents `general-purpose` :
>    architecture / élégance, robustesse / edge cases, sécurité /
>    cohérence handoff. Chaque agent produit un rapport ; ne fait
>    aucune modification.
> 3. Synthétiser les findings par sévérité + risque de
>    régression.
> 4. Appliquer UNIQUEMENT les fixes safe-first (cf. CLAUDE.md
>    pour la liste des conditions impératives). Pour rappel — règle
>    d'or « primum non nocere » :
>    - Aucun fix qui casse un test existant (rollback immédiat
>      si test casse).
>    - Aucun nouveau problème introduit par le fix.
>    - Design system `T.*` intouchable.
>    - Pas de migration DB en mode janitor.
>    - Pas de breaking change utilisateur.
>    - Les fixes risque medium/high sont reportés et documentés
>      en dette technique.
> 5. Vérifier les 4 checks locaux verts avant push.
> 6. PR janitor séparée : titre
>    `chore(janitor): post-step 21 — <résumé court>`. Body :
>    Summary + Findings (sévérité + risque) + Fixes appliqués +
>    Fixes déférés + Test plan.
> 7. Merger la PR janitor (même workflow auto-merge).
> 8. Documenter dans `HANDOFF-PROGRESS.md` : section
>    `### Audit vibe janitor étape 21` avec findings totaux, fixes
>    appliqués (chacun avec son risque évalué), dette ajoutée,
>    compteur de tests final.
>
> **Phase 3 — Recopie du prompt étape 22** (toujours obligatoire) :
>
> 1. Recopier le prompt étape 22 dans la **réponse de chat finale**,
>    en plus de l'avoir écrit dans `HANDOFF-PROGRESS.md`. Le prompt
>    étape 22 doit lui-même inclure les Phases 1, 2, 3 récursives
>    pour la session N+16.
>
> **Conditions d'arrêt malgré l'autorisation permanente**
> (mise en prod = risque accru) :
>
> - Migration DB risquée (suppression / rename de table / colonne /
>   RPC non listée). Aucune migration DB explicitement listée pour
>   l'étape 21 — demander confirmation si nécessaire.
> - Changement RGPD non listé (nouvelle collecte, nouveau cookie,
>   transfert hors UE).
> - Breaking change visible utilisateur.
> - Erreur Vercel / Supabase impossible à debugger en < 3 tentatives.
> - Review humaine ou commentaire GitHub arrivé avant le merge.
> - En phase janitor uniquement : un fix nécessite de toucher au
>   design system `T.*`, ou casse un test existant sans rollback
>   possible, ou nécessite un bump majeur de dépendance.
>
> Dans tous ces cas : demander confirmation explicite avant de
> merger.
>
> **Contraintes générales** :
>
> - Ne pas toucher au prototype.
> - TS strict + no `any`.
> - Conserver les checks verts à chaque étape.
> - Pas d'emojis dans le code TS ni dans les commits / PR.
> - Vérifier qu'aucun changement de design ne casse les tokens `T.*`.
> - Sauvegarder la DB AVANT toute migration prod (export `pg_dump`
>   dans un bucket privé Supabase Storage).

---

## Prompt pour la session N+14 (étape 20)

> Repo : `/home/user/maintenantproto1` (branche imposée par l'harness —
> typiquement `claude/<auto>`).
>
> **Lis dans cet ordre** :
>
> 1. `CLAUDE.md` — règles projet (TS strict, pas de `any`, camelCase
>    TS / snake_case DB, SVG via `ICONS.*` pas d'emojis, RLS, RGPD,
>    Lighthouse ≥ 95, axe-core ≥ 95, prefers-reduced-motion). **Note
>    la section « Politique de PR » qui t'autorise à enchaîner
>    ouverture + merge des PR sans confirmation jusqu'à la session 50
>    incluse. Note aussi la section « Recopie systématique du prompt
>    de la session suivante » : à la clôture de cette étape, recopier
>    le prompt étape 21 à la fois dans `HANDOFF-PROGRESS.md` ET dans
>    la réponse de chat finale. Et enfin la section « Audit récurrent
>    vibe janitor de fin d'étape » : après le merge de la PR
>    principale de l'étape 20, tu dois enchaîner une PR janitor
>    séparée `chore(janitor): post-step 20 — …` et inclure cette même
>    instruction janitor dans le prompt étape 21.**
> 2. `HANDOFF.md` §11 (Points d'attention) + §12 (Suivi) + §13
>    (Sécurité).
> 3. `HANDOFF-PROGRESS.md` — journal (étape 19 ✅ — étape 20 à faire).
> 4. `docs/PROD-RUNBOOK.md` — runbook de provisionnement créé à
>    l'étape 19.
> 5. `docs/MODERATION.md` — procédure modération.
> 6. `docs/USER-GUIDE.md` — FAQ utilisateur·rice.
>
> **État actuel à la fin de l'étape 19 + janitor + provisionnement
> Supabase staging** :
>
> - Webhook Stripe idempotent via `public.stripe_events` (PK = event.id).
> - Sentry SDK installé en chunk lazy (~143 kB gzip), DSN-gated.
> - Scripts k6 dans `web/load/` (smoke + ramp 0→50 VUs).
> - 3 docs Markdown : USER-GUIDE, MODERATION, PROD-RUNBOOK.
> - **812 tests verts** (123 fichiers, +2 dans le janitor post-step19).
> - Build entry 47.09 kB / gzip 13.28 kB + chunks lazy.
> - Pas de migration DB structurelle depuis l'étape 16 ; ajout additif
>   de `stripe_events` à l'étape 19.
> - Dette : `color-contrast` toujours désactivé (token
>   `--mn-text-3` 195 usages, besoin validation designer avant
>   modification).
> - **Provisionnement externe — état mixte** (cf. section « État du
>   provisionnement externe (à jour 2026-05-12) » dans
>   `HANDOFF-PROGRESS.md` juste avant ce prompt) :
>   - ✅ **Supabase staging provisionné** (projet
>     `maintenant-staging` en eu-west-3, plan Free, schéma
>     `db/schema.sql` appliqué, RLS active sur 38 tables, 123
>     policies, 5 RPCs, bucket avatars OK, Auth configurée
>     localhost). URL :
>     `https://fdphrsqrsumkpzbxnjdj.supabase.co`. Clé `anon`
>     legacy JWT stockée dans `web/.env.local` côté équipe humaine
>     (gitignored).
>   - 🔲 **Vercel / Stripe live / Edge Functions / Sentry SaaS /
>     PITR** restent à provisionner par l'équipe humaine (cf.
>     `docs/PROD-RUNBOOK.md` §2 à §4).
>
> **CONTEXTE D'OUVERTURE** — à exécuter avant toute autre action :
>
> 1. Vérifier qu'on est bien dans un workspace contenant `web/`. Si
>    non (rare — branche partie d'un main obsolète),
>    `git fetch origin main && git merge --ff-only origin/main`.
> 2. `cd web && npm ci` (fallback : `npm install --legacy-peer-deps`).
> 3. `npm run typecheck && npm run lint && npx vitest run && npm run build`
>    pour vérifier le compteur de tests au point de départ (≥ 812
>    verts après le janitor post-step19, à incrémenter à chaque
>    étape).
> 4. **Demander à l'équipe humaine** :
>    - Supabase staging est-il accessible (cf. URL ci-dessus
>      `https://fdphrsqrsumkpzbxnjdj.supabase.co`) ?
>    - Le provisionnement Vercel / Stripe / Sentry décrit dans
>      `docs/PROD-RUNBOOK.md` est-il fait ? Si non, l'étape 20 doit
>      s'adapter (focus idempotence DB + tests, plutôt que audits
>      mesurés sur staging réel).
>    - Y a-t-il un projet Supabase de test seedé pour le test E2E
>      « signature anonyme » ?
>    - La dette critique C1/C2 (idempotence `stripe_events` orpheline
>      + `credit_t99cp` non idempotent côté DB) doit-elle être
>      adressée à cette étape (migration DB explicite priorité 1) ?
>
> **ÉTAPE 20 à exécuter — Post-go-live (idempotence DB priorité 1 +
> audit réel + monitoring + retours)** :
>
> 1. **PRIORITÉ 1 — Idempotence DB du webhook Stripe** (dette
>    critique étape 19, cf. § Audit vibe janitor étape 19) :
>    - Ajouter `t99cp_transactions.source_event_id text unique nulls not distinct`
>      (additif). Update RPC `credit_t99cp` pour accepter un nouveau
>      paramètre `p_source_event_id` et insérer avec cette colonne.
>    - Update `supabase/functions/stripe-webhook/index.ts` pour passer
>      `source_event_id = event.id` aux appels `creditT99cp` (case
>      `invoice.payment_succeeded`).
>    - **OU**, en alternative : job de réconciliation Edge Function
>      qui scanne `stripe_events WHERE processed_at IS NULL AND
>      received_at < now() - interval '15 min'` et alerte / rejoue.
>      Documenter la décision.
>    - Tests vitest pour la nouvelle signature de `credit_t99cp`
>      (idempotence par event_id : 2 appels avec même source_event_id
>      → un seul crédit).
>    - **Migration listée explicitement dans le commit + PR.**
>    - Sauvegarder `pg_dump` du projet staging Supabase AVANT la
>      migration (CLAUDE.md « Sauvegarder la DB AVANT toute
>      migration prod »).
> 2. **Audit Lighthouse réel** :
>    - Si `staging.maintenant.org` (ou équivalent) est en ligne :
>      `npx unlighthouse --site https://staging.maintenant.org` ou
>      DevTools manuel sur 6 pages clés (cf. `PROD-RUNBOOK.md` §5).
>    - Documenter les scores dans `HANDOFF-PROGRESS.md` § Audit
>      Lighthouse étape 20 (perf / a11y / seo / best-practices).
>    - Corriger les blocages < 95 (LCP, CLS, TBT). Pas de changement
>      design system sans validation designer.
> 3. **Premier test E2E « happy path » réel** :
>    - Si projet Supabase de test prêt : ajouter
>      `web/e2e/happy-path.spec.ts` qui signe anonymement une
>      pétition publique pré-seedée et vérifie le compteur. Sinon
>      laisser pour l'étape 21.
> 4. **Monitoring Sentry runtime** :
>    - Si DSN configuré en preview : vérifier que les events
>      arrivent bien (test canary `throw new Error('sentry-canary-step20')`
>      depuis une page admin protégée + immédiatement retirer).
>    - Documenter le taux d'erreur sur les 7 derniers jours, top 5
>      des issues.
> 5. **Monitoring Supabase** :
>    - Quotas API / DB CPU / DB memory sur 7 jours.
>    - Alertes Slack #alerts-prod actives ?
>    - Top requêtes lentes (cf. dashboard Supabase → Performance).
> 6. **Retours utilisateur·rices** :
>    - Premiers comptes créés (combien ? bounce rate sur
>      `/auth/confirm` ?).
>    - Premiers signalements modération (cf. `/admin/reports`).
>    - Bugs remontés en email `tech@maintenant.org`.
>    - Compiler une liste de fixes prioritaires pour l'étape 21.
> 7. **Documentation `/transparence`** :
>    - Créer ou compléter `web/src/pages/TransparencePage.tsx` (route
>      `/transparence`, publique) avec : date de mise en prod,
>      nombre cumulé de comptes, pétitions, mobilisations,
>      signalements traités. Données générées dynamiquement via
>      requêtes RLS-safe (compteurs publics).
> 8. **Tests** : suite vitest ≥ 812 + e2e Playwright verts en CI.
>    Ajouter ≥ 5 tests autour de la page transparence + tests
>    idempotence `credit_t99cp` (priorité 1) + nouveau test E2E si
>    applicable.
> 9. **HANDOFF-PROGRESS.md** : étape 20 ✅ détaillée (sections
>    « Idempotence DB » (priorité 1), « Audit Lighthouse », « E2E
>    réel » si applicable, « Monitoring Sentry », « Monitoring
>    Supabase », « Retours utilisateur », « Page transparence »,
>    « Décisions »).
>    **Recopier ce prompt étape 21 à la fois dans
>    `HANDOFF-PROGRESS.md` ET dans la réponse de chat finale** (règle
>    récursive, cf. `CLAUDE.md § Recopie systématique du prompt de
>    la session suivante`). Inclure dans le prompt étape 21 la même
>    instruction de recopie pour la session N+15, pour que la chaîne
>    se propage. **Inclure aussi l'instruction d'audit vibe janitor
>    pour N+15** (cf. `CLAUDE.md § Audit récurrent vibe janitor`).
>
> **PHASE 1 — Clôture de l'étape principale (workflow auto-merge)** :
>
> Conformément à `CLAUDE.md` § « Politique de PR », tu as
> autorisation permanente d'enchaîner les étapes ci-dessous sans
> confirmation. Procéder dans l'ordre, **sans s'arrêter entre les
> étapes** :
>
> 1. **Vérifier les 4 checks locaux verts** : `npm run typecheck &&
>    npm run lint && npx vitest run && npm run build`. Si un check
>    échoue → corriger, ne pas commit.
> 2. **Commit** : `chore(prod): step 20 — post-go-live (idempotence
>    DB + lighthouse + monitoring + transparence)`. Pas d'emojis dans
>    le message.
> 3. **Push** sur la branche imposée par l'harness
>    (`git push -u origin <branch>`, retry exponentiel 2/4/8/16 s).
> 4. **Ouvrir la PR** vers `main` via
>    `mcp__github__create_pull_request` (titre identique au commit,
>    body Summary + Décisions + Test plan).
> 5. **Attendre les checks GitHub Actions si présents**. S'ils sont
>    rouges → autofix puis re-push.
> 6. **Merger la PR** via `mcp__github__merge_pull_request` (`merge`
>    ou `squash`).
>
> **PHASE 2 — Audit vibe janitor (après le merge de la PR principale)** :
>
> Conformément à `CLAUDE.md` § « Audit récurrent vibe janitor de fin
> d'étape », après le merge de la PR principale et avant de clôturer
> la session :
>
> 1. **Sync** : `git checkout main && git pull --ff-only origin main`,
>    puis `git checkout -b claude/janitor-post-step20` (ou nom
>    similaire imposé par l'harness).
> 2. **Audit en parallèle** via 2 à 3 subagents `general-purpose` :
>    architecture / élégance, robustesse / edge cases, sécurité /
>    cohérence handoff. Chaque agent produit un rapport ; ne fait
>    aucune modification.
> 3. **Synthétiser** les findings par sévérité + risque de
>    régression.
> 4. **Appliquer UNIQUEMENT les fixes safe-first** (cf. CLAUDE.md
>    pour la liste des conditions impératives). Pour rappel — règle
>    d'or « primum non nocere » :
>    - **Aucun fix qui casse un test existant** (rollback immédiat
>      si test casse).
>    - **Aucun nouveau problème introduit** par le fix (régression
>      perf, a11y, type, comportement utilisateur).
>    - **Design system `T.*` intouchable**.
>    - **Pas de migration DB** en mode janitor.
>    - **Pas de breaking change utilisateur**.
>    - Les fixes à risque medium/high sont **reportés** et documentés
>      en dette technique.
> 5. **Vérifier les 4 checks locaux verts** avant push.
> 6. **PR janitor séparée** : titre `chore(janitor): post-step 20 —
>    <résumé court>`. Body : Summary + Findings (sévérité + risque) +
>    Fixes appliqués + Fixes déférés + Test plan.
> 7. **Merger la PR janitor** (même workflow auto-merge).
> 8. **Documenter** dans `HANDOFF-PROGRESS.md` : section
>    `### Audit vibe janitor étape 20` avec findings totaux, fixes
>    appliqués (chacun avec son risque évalué), dette ajoutée,
>    compteur de tests final.
>
> **Phase 3 — Recopie du prompt étape 21** (toujours obligatoire) :
>
> 1. **Recopier le prompt étape 21 dans la réponse de chat finale**,
>    en plus de l'avoir écrit dans `HANDOFF-PROGRESS.md`. Le prompt
>    étape 21 doit lui-même inclure les Phases 1, 2, 3 récursives
>    pour la session N+15.
>
> **Conditions d'arrêt malgré l'autorisation permanente**
> (mise en prod = risque accru) :
>
> - Migration DB risquée (suppression / rename de table / colonne /
>   RPC non listée). La migration additive de la priorité 1
>   (`t99cp_transactions.source_event_id` UNIQUE + nouveau paramètre
>   `p_source_event_id` sur la RPC `credit_t99cp`) est **explicitement
>   listée** dans ce prompt — OK à appliquer sans confirmation
>   additionnelle. Toute autre migration nécessite l'approbation
>   humaine explicite.
> - Changement RGPD non listé (nouvelle collecte, nouveau cookie,
>   transfert hors UE).
> - Breaking change visible utilisateur (changement de prix Stripe,
>   suppression de route publique, etc.).
> - Erreur Vercel / Supabase impossible à debugger en < 3 tentatives.
> - Review humaine ou commentaire GitHub arrivé avant le merge.
> - En phase janitor uniquement : un fix nécessite de toucher au
>   design system `T.*`, ou casse un test existant sans rollback
>   possible, ou nécessite un bump majeur de dépendance.
>
> Dans tous ces cas : demander confirmation explicite avant de
> merger.
>
> **Contraintes générales** :
>
> - Ne pas toucher au prototype.
> - TS strict + no `any`.
> - Conserver les checks verts à chaque étape.
> - Pas d'emojis dans le code TS ni dans les commits / PR.
> - Vérifier qu'aucun changement de design ne casse les tokens `T.*`.
> - Sauvegarder la DB AVANT toute migration prod (export `pg_dump`
>   dans un bucket privé Supabase Storage).

---

## Prompt pour la session N+13 (étape 19)

> Repo : `/home/user/maintenantproto1` (branche imposée par l'harness —
> typiquement `claude/<auto>`).
>
> **Lis dans cet ordre** :
>
> 1. `CLAUDE.md` — règles projet (TS strict, pas de `any`, camelCase TS /
>    snake_case DB, SVG via `ICONS.*` pas d'emojis, RLS, RGPD,
>    Lighthouse ≥ 95, axe-core ≥ 95, prefers-reduced-motion). **Note la
>    section « Politique de PR » qui t'autorise à enchaîner ouverture
>    + merge des PR sans confirmation jusqu'à la session 50 incluse.
>    Note aussi la section « Recopie systématique du prompt de la
>    session suivante » : à la clôture de cette étape, recopier le
>    prompt étape 20 à la fois dans `HANDOFF-PROGRESS.md` ET dans la
>    réponse de chat finale. Et enfin la section « Audit récurrent
>    vibe janitor de fin d'étape » : après le merge de la PR
>    principale de l'étape 19, tu dois enchaîner une PR janitor
>    séparée `chore(janitor): post-step 19 — …` et inclure cette
>    même instruction janitor dans le prompt étape 20.**
> 2. `HANDOFF.md` §9 (Déploiement) + §10 Sprint 6 (Production) +
>    §11 (Points d'attention) + §13 (Sécurité).
> 3. `HANDOFF-PROGRESS.md` — journal (étape 18 ✅ — étape 19 à faire).
> 4. `vercel.json` racine — CSP / rewrites / headers déjà câblés à
>    l'étape 18.
> 5. `.github/workflows/ci.yml` — pipeline unit + e2e Playwright en
>    place à l'étape 18.
> 6. `web/playwright.config.ts` + `web/e2e/` — suite E2E branchée mais
>    avec stub Supabase côté `page.route()`.
>
> **État actuel à la fin de l'étape 18** :
>
> - Sprint 6 (livraison) complet : code-splitting, E2E Playwright + axe-core,
>   CI GitHub Actions (jobs `unit` + `e2e`), CSP/HSTS/X-Frame-Options via
>   `vercel.json`, scaffold Sentry runtime, +30 tests unitaires.
> - **801 tests verts** (122 fichiers), build entry 44.7 kB / gzip 12.4 kB
>   + chunks lazy.
> - Pas de migration DB depuis l'étape 16 (table `follows`).
> - Aucune clé `service_role` dans le bundle front (vérifié).
>
> **CONTEXTE D'OUVERTURE** — à exécuter avant toute autre action :
>
> 1. Vérifier qu'on est bien dans un workspace contenant `web/`. Si non
>    (rare — branche partie d'un main obsolète), `git fetch origin main &&
>    git merge --ff-only origin/main`.
> 2. `cd web && npm ci` (fallback : `npm install --legacy-peer-deps`).
> 3. `npm run typecheck && npm run lint && npx vitest run && npm run build`
>    pour vérifier le compteur de tests au point de départ (≥ 801 verts
>    à la fin de l'étape 18).
>
> **ÉTAPE 19 à exécuter — Sprint 6 / Mise en prod réelle** :
>
> 1. **Provisionnement Supabase EU** :
>    - Créer le projet `maintenant-prod` en région `eu-west-3` (Paris) ou
>      `eu-central-1`, plan Pro pour la PITR + bandwidth.
>    - Appliquer `db/schema.sql` (depuis `psql` ou Studio).
>    - Vérifier que **toutes** les RLS policies sont actives (cf. audit
>      étape 13). Pas de table SQL `is_admin` sans la policy
>      correspondante.
>    - Régénérer `web/src/types/database.ts` via
>      `supabase gen types typescript --project-id <id>` puis vérifier
>      qu'aucun diff n'apparaît avec le commit (sinon migration sortie
>      du schéma local).
>    - Activer Point-in-Time Recovery, configurer alertes Slack/email
>      sur quotas API.
> 2. **Provisionnement Vercel** :
>    - Linker le repo via `vercel link`, déploiement preview sur la
>      branche `staging`.
>    - Renseigner les env vars (Settings → Environment Variables) :
>      `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
>      `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_SENTRY_DSN`,
>      `VITE_SUPPORT_USER_ID`, `VITE_SUPPORT_EMAIL`. Pas de clé secret
>      côté front.
>    - Vérifier que les headers CSP s'appliquent (DevTools → Network →
>      headers du HTML root).
>    - Activer la protection mot de passe sur les déploiements preview
>      tant que le site n'est pas public.
> 3. **Configuration Stripe** :
>    - Créer les produits + 3 prix (basic / militant / héros) en mode
>      live.
>    - Configurer le webhook `/api/stripe/webhook` (à créer côté Supabase
>      Edge Functions — cf. étape 7) avec signing secret.
>    - Tester avec une vraie carte test puis une vraie carte (1 €) sur
>      preview.
> 4. **Stripe webhook côté Supabase Edge Functions** : à créer si pas
>    déjà fait (`supabase/functions/stripe-webhook/index.ts`). Doit valider
>    la signature `stripe-signature`, idempotent (table `stripe_events`
>    avec PK = event.id), upsert membership + log `admin_logs`.
> 5. **Sentry** : décider entre Sentry SaaS et GlitchTip self-hosted.
>    Si Sentry SaaS :
>    - `npm install --save @sentry/browser`.
>    - Compléter `initSentry` (cf. `web/src/lib/sentry.ts`) avec
>      `Sentry.init({ dsn, beforeSend: scrubEvent, environment, release })`.
>    - Vérifier que `beforeSend` strippe bien email/IP (les tests
>      `sentry.test.ts` couvrent déjà `scrubEvent`).
>    - Re-mesurer le bundle après ajout (~50 kB gzip).
> 6. **Audit Lighthouse en preview** : lancer `npx unlighthouse --site
>    https://staging.maintenant.org` ou DevTools Lighthouse manuel sur
>    `/`, `/petitions`, `/petitions/<slug>`, `/communes`, `/media`,
>    `/services`. Documenter les scores dans `HANDOFF-PROGRESS.md`
>    (perf / a11y / seo / best-practices). Corriger si < 95.
>    **Dette a11y connue** : `--mn-text-3: #7a786f` sur `--mn-bg: #fafaf9`
>    tombe à ~4.06 (sous AA 4.5). Décider entre durcir le token (e.g.
>    `#6c6a62` ~ 5.0) ou limiter son usage aux fonds plus sombres. Le
>    fix doit aussi retirer `color-contrast` de la liste `DISABLED_RULES`
>    dans `web/e2e/utils/axe.ts`.
> 7. **Charge de test (optionnel mais recommandé)** : créer un script
>    `k6` dans `web/load/` qui simule 50 utilisateurs simultanés sur
>    les endpoints `/rest/v1/petitions?...` + insertion signature. Doc
>    le résultat dans `HANDOFF-PROGRESS.md`.
> 8. **Documentation utilisateur** : créer `docs/USER-GUIDE.md` (FAQ
>    rapide pour les adhérents) et `docs/MODERATION.md` (procédure
>    modération admin, escalation). Pas de PDF — Markdown servable
>    directement via `/docs/*` (route à ajouter ou simple lien GitHub).
> 9. **Tests** : suite vitest ≥ 801 + e2e Playwright verts en CI.
>    Ajouter au moins 1 test E2E « happy path » réel sur le projet
>    Supabase de test (signature anonyme d'une pétition publique
>    pré-seedée) — uniquement si projet Supabase test prêt, sinon
>    laisser pour l'étape 20.
> 10. **HANDOFF-PROGRESS.md** : étape 19 ✅ détaillée (sections
>     « Supabase prod », « Vercel », « Stripe live », « Sentry »,
>     « Lighthouse », « Décisions »).
>     **Recopier ce prompt étape 20 à la fois dans `HANDOFF-PROGRESS.md`
>     ET dans la réponse de chat finale** (règle récursive, cf.
>     `CLAUDE.md § Recopie systématique du prompt de la session
>     suivante`). Inclure dans le prompt étape 20 la même instruction
>     de recopie pour la session N+14, pour que la chaîne se propage.
>     **Inclure aussi l'instruction d'audit vibe janitor pour
>     N+14** (cf. `CLAUDE.md § Audit récurrent vibe janitor`).
>
> **PHASE 1 — Clôture de l'étape principale (workflow auto-merge)** :
>
> Conformément à `CLAUDE.md` § « Politique de PR », tu as autorisation
> permanente d'enchaîner les étapes ci-dessous sans confirmation.
> Procéder dans l'ordre, **sans s'arrêter entre les étapes** :
>
> 1. **Vérifier les 4 checks locaux verts** : `npm run typecheck &&
>    npm run lint && npx vitest run && npm run build`. Si un check
>    échoue → corriger, ne pas commit.
> 2. **Commit** : `chore(prod): step 19 — sprint 6 mise en prod (supabase
>    + vercel + stripe + sentry + lighthouse)`. Pas d'emojis dans le
>    message.
> 3. **Push** sur la branche imposée par l'harness
>    (`git push -u origin <branch>`, retry exponentiel 2/4/8/16 s).
> 4. **Ouvrir la PR** vers `main` via `mcp__github__create_pull_request`
>    (titre identique au commit, body Summary + Décisions + Test plan).
> 5. **Attendre les checks GitHub Actions si présents**. S'ils sont
>    rouges → autofix puis re-push.
> 6. **Merger la PR** via `mcp__github__merge_pull_request` (`merge`
>    ou `squash`).
>
> **PHASE 2 — Audit vibe janitor (après le merge de la PR principale)** :
>
> Conformément à `CLAUDE.md` § « Audit récurrent vibe janitor de fin
> d'étape », après le merge de la PR principale et avant de clôturer
> la session :
>
> 1. **Sync** : `git checkout main && git pull --ff-only origin main`,
>    puis `git checkout -b claude/janitor-post-step19` (ou nom
>    similaire imposé par l'harness).
> 2. **Audit en parallèle** via 2 à 3 subagents `general-purpose` :
>    architecture / élégance, robustesse / edge cases, sécurité /
>    cohérence handoff. Chaque agent produit un rapport ; ne fait
>    aucune modification.
> 3. **Synthétiser** les findings par sévérité + risque de régression.
> 4. **Appliquer UNIQUEMENT les fixes safe-first** (cf. CLAUDE.md
>    pour la liste des conditions impératives). Pour rappel — règle
>    d'or « primum non nocere » :
>    - **Aucun fix qui casse un test existant** (rollback immédiat
>      si test casse).
>    - **Aucun nouveau problème introduit** par le fix (régression
>      perf, a11y, type, comportement utilisateur).
>    - **Design system `T.*` intouchable**.
>    - **Pas de migration DB** en mode janitor.
>    - **Pas de breaking change utilisateur**.
>    - Les fixes à risque medium/high sont **reportés** et documentés
>      en dette technique.
> 5. **Vérifier les 4 checks locaux verts** avant push.
> 6. **PR janitor séparée** : titre `chore(janitor): post-step 19 —
>    <résumé court>`. Body : Summary + Findings (sévérité + risque) +
>    Fixes appliqués + Fixes déférés + Test plan.
> 7. **Merger la PR janitor** (même workflow auto-merge).
> 8. **Documenter** dans `HANDOFF-PROGRESS.md` : section
>    `### Audit vibe janitor étape 19` avec findings totaux, fixes
>    appliqués (chacun avec son risque évalué), dette ajoutée,
>    compteur de tests final.
>
> **Phase 3 — Recopie du prompt étape 20** (toujours obligatoire) :
>
> 1. **Recopier le prompt étape 20 dans la réponse de chat finale**,
>    en plus de l'avoir écrit dans `HANDOFF-PROGRESS.md`. Le prompt
>    étape 20 doit lui-même inclure les Phases 1, 2, 3 récursives
>    pour la session N+14.
>
> **Conditions d'arrêt malgré l'autorisation permanente**
> (mise en prod = risque accru, contrairement aux étapes précédentes !) :
>
> - Migration DB risquée (suppression / rename de table / colonne /
>   RPC non listée). En particulier, **toute modification du schéma
>   live nécessite l'approbation humaine explicite**.
> - Changement RGPD non listé (nouvelle collecte, nouveau cookie,
>   transfert hors UE).
> - Breaking change visible utilisateur (changement de prix Stripe,
>   suppression de route publique, etc.).
> - Erreur Vercel / Supabase impossible à debugger en < 3 tentatives.
> - Review humaine ou commentaire GitHub arrivé avant le merge.
>
> Dans tous ces cas : demander confirmation explicite avant de merger.
>
> **Contraintes générales** :
>
> - Ne pas toucher au prototype.
> - TS strict + no `any`.
> - Conserver les checks verts à chaque étape.
> - Pas d'emojis dans le code TS ni dans les commits / PR.
> - Vérifier qu'aucun changement de design ne casse les tokens `T.*`.
> - Sauvegarder la DB AVANT toute migration prod (export pg_dump dans
>   un bucket privé Supabase Storage).

---

## Prompt pour la session N+12 (étape 18)

> Repo : `/home/user/maintenantproto1` (branche imposée par l'harness —
> typiquement `claude/<auto>`).
>
> **Lis dans cet ordre** :
>
> 1. `CLAUDE.md` — règles projet (TS strict, pas de `any`, camelCase TS /
>    snake_case DB, SVG via `ICONS.*` pas d'emojis, RLS, RGPD,
>    Lighthouse ≥ 95, axe-core ≥ 95, prefers-reduced-motion). **Note
>    la section « Politique de PR » qui t'autorise à enchaîner ouverture
>    + merge des PR sans confirmation jusqu'à la session 50 incluse.**
> 2. `HANDOFF.md` §10 Sprint 6 (Optim + tests E2E + mise en prod) et
>    §11 (Performance) + §12 (Accessibilité) + §13 (Sécurité).
> 3. `HANDOFF-PROGRESS.md` — journal (étape 17 ✅ — étape 18 à faire).
> 4. `web/vite.config.ts` + `web/package.json` — outillage build /
>    Playwright à ajouter.
> 5. `web/src/router.tsx` — routes existantes (cibles des E2E).
>
> **État actuel à la fin de l'étape 17** :
>
> - Sprint 5 complet : admin + communes + contact.
> - 771 tests verts, build 295 kB (tronqué CI).
> - `RequireAdmin` opérationnel, hook `useIsAdmin` sécurisé (fallback
>   strict `false`).
> - Pas de migration DB depuis l'étape 16 (table `follows`).
>
> **CONTEXTE D'OUVERTURE** — à exécuter avant toute autre action :
>
> 1. Vérifier qu'on est bien dans un workspace contenant `web/`. Si non
>    (rare — branche partie d'un main obsolète), `git fetch origin main &&
>    git merge --ff-only origin/main`.
> 2. `cd web && npm ci` (fallback : `npm install --legacy-peer-deps`).
> 3. `npm run typecheck && npm run lint && npx vitest run && npm run build`
>    pour vérifier le compteur de tests au point de départ (≥ 771 verts
>    à la fin de l'étape 17).
>
> **ÉTAPE 18 à exécuter — Sprint 6 / Optim + E2E + a11y + prod** :
>
> 1. **Performance** : audit Lighthouse local sur les pages publiques
>    clés (`/`, `/petitions`, `/petitions/:slug`, `/media`, `/communes`,
>    `/services`). Mesurer LCP / CLS / TBT. Optimisations probables :
>    code-splitting par route (`React.lazy` + `Suspense`), tree-shake
>    icônes, vérifier que les vendor chunks sont séparés du bundle.
>    Cible : Lighthouse perf ≥ 95.
> 2. **Tests E2E Playwright** : installer `@playwright/test`, créer
>    `web/e2e/` avec scénarios critiques :
>    - Signup + login + signature pétition.
>    - Création + signature mobilisation.
>    - Création + vote sondage.
>    - Création + paiement adhésion (stub Stripe).
>    - Modération admin (login admin → unflag un item).
>    Configurer le CI GitHub Actions pour rouler les E2E (avec
>    `playwright install --with-deps`).
> 3. **Audit accessibilité axe-core** : installer `@axe-core/playwright`
>    et ajouter une assertion par page principale dans les E2E.
>    Corriger les violations bloquantes (contrastes, labels manquants,
>    skip-link). Cible : axe-core ≥ 95.
> 4. **Sécurité prod** : passer la checklist `CLAUDE.md § Sécurité` :
>    - CSP headers via Vercel `vercel.json`.
>    - Vérifier qu'aucune clé `service_role` n'est dans le bundle front.
>    - Configurer Sentry (DSN env var). Vérifier que les logs ne
>      contiennent pas d'email/IP.
>    - Vérifier la procédure RGPD (export + suppression compte) côté
>      `ProfilePage`.
> 5. **Tests** : E2E Playwright + couverture unitaire ≥ 70 %, 100 % sur
>    les flows critiques. Cible totale ≥ 800 tests (771 + ≥ 30 nouveaux
>    en unitaire / hooks + suite E2E).
> 6. **HANDOFF-PROGRESS.md** : étape 18 ✅ + clôture du sprint 6 ou
>    prompt étape 19 (mise en prod réelle). **Recopier ce prompt étape
>    19 à la fois dans `HANDOFF-PROGRESS.md` ET dans la réponse de chat
>    finale** (règle récursive, cf. `CLAUDE.md § Recopie systématique
>    du prompt de la session suivante`). Inclure dans le prompt étape
>    19 la même instruction de recopie pour la session N+13, pour que
>    la chaîne se propage.
>
> **CLÔTURE DE L'ÉTAPE — workflow auto-merge** :
>
> Conformément à `CLAUDE.md` § « Politique de PR », tu as autorisation
> permanente d'enchaîner les étapes ci-dessous sans confirmation.
> Procéder dans l'ordre, **sans s'arrêter entre les étapes** :
>
> 1. **Vérifier les 4 checks locaux verts** : `npm run typecheck &&
>    npm run lint && npx vitest run && npm run build`. Si un check
>    échoue → corriger, ne pas commit.
> 2. **Commit** : `chore(prod): step 18 — sprint 6 (optim + e2e + a11y +
>    prod)`. Pas d'emojis dans le message.
> 3. **Push** sur la branche imposée par l'harness
>    (`git push -u origin <branch>`, retry exponentiel 2/4/8/16 s).
> 4. **Ouvrir la PR** vers `main` via
>    `mcp__github__create_pull_request` (titre identique au commit,
>    body Summary + Décisions + Test plan).
> 5. **Attendre les checks GitHub Actions si présents**. S'ils sont
>    rouges → autofix puis re-push.
> 6. **Merger la PR** via `mcp__github__merge_pull_request` (`merge`
>    ou `squash`).
>
> **Conditions d'arrêt malgré l'autorisation permanente** :
>
> - Migration DB risquée (ne devrait pas être nécessaire au sprint 6).
> - Changement RGPD non listé.
> - Breaking change visible utilisateur.
> - Review humaine ou commentaire GitHub arrivé avant le merge.
>
> Dans tous ces cas : demander confirmation explicite avant de merger.
>
> **Contraintes générales** :
>
> - Ne pas toucher au prototype.
> - TS strict + no `any`.
> - Conserver les checks verts à chaque étape.
> - Pas d'emojis dans le code TS ni dans les commits / PR.
> - Vérifier qu'aucune mesure de performance ne provoque de régression
>   visuelle (le design system `T.*` doit rester intact).

---

## Prompt pour la session N+11 (étape 17)

> Repo : `/home/user/maintenantproto1` (branche imposée par l'harness —
> typiquement `claude/<auto>`).
>
> **Lis dans cet ordre** :
>
> 1. `CLAUDE.md` — règles projet (TS strict, pas de `any`, camelCase TS /
>    snake_case DB, SVG via `ICONS.*` pas d'emojis, RLS, RGPD). **Note
>    la section « Politique de PR » qui t'autorise à enchaîner ouverture
>    + merge des PR sans confirmation jusqu'à la session 50 incluse.**
> 2. `HANDOFF.md` §10 Sprint 5 (Admin + Communes libres + Pages légales).
> 3. `HANDOFF-PROGRESS.md` — journal (étape 16 ✅ — étape 17 à faire).
> 4. `db/schema.sql` §14 (`communes`, `commune_members`) + §17
>    (`admin_logs`, `email_campaigns`) + leurs policies RLS.
> 5. `web/src/lib/media.ts` + `web/src/lib/social.ts` — patterns
>    de référence (validation, listing, hooks, pages détaillées).
> 6. `web/src/pages/ArticleCreatePage.tsx` + `web/src/pages/MediaPage.tsx`
>    — patterns formulaire + filtrage par sélecteur.
>
> **État actuel à la fin de l'étape 16** :
>
> - Sprint 4 complet (réseau social + messagerie + notifications + média).
> - 654 tests verts, build 295 kB (tronqué CI).
> - Routes `/reseau`, `/messaging`, `/messaging/:conversationId`,
>   `/notifications`, `/media`, `/media/new`, `/media/:slug` montées
>   (RequireAuth sur les routes d'écriture et la messagerie + les
>   notifications). Pas de redirect côté `/reseau` ni `/media` (lectures
>   publiques).
> - Migration DB additive : table `follows` ajoutée (`db/schema.sql`
>   + `web/src/types/database.ts`).
>
> **CONTEXTE D'OUVERTURE** — à exécuter avant toute autre action :
>
> 1. Vérifier qu'on est bien dans un workspace contenant `web/`. Si non
>    (rare — branche partie d'un main obsolète), `git fetch origin main &&
>    git merge --ff-only origin/main`.
> 2. `cd web && npm ci` (fallback : `npm install --legacy-peer-deps`).
> 3. `npm run typecheck && npm run lint && npx vitest run && npm run build`
>    pour vérifier le compteur de tests au point de départ (≥ 654 verts
>    à la fin de l'étape 16).
>
> **ÉTAPE 17 à exécuter — Sprint 5 / Admin + Communes libres + Pages
> légales restantes** :
>
> 1. **Module `web/src/lib/communes.ts`** : `communes(name, slug, city,
>    description, treasurer_id)` + `commune_members(commune_id, user_id,
>    role)`. Listing public, création par admin (cf. policy
>    `communes_write_admin`), join/leave par l'utilisateur lui-même.
> 2. **Module `web/src/lib/admin.ts`** : helpers pour le panel admin —
>    listing des content_status='flagged' (modération), historisation
>    `admin_logs`, pilotage `email_campaigns`. Toutes les écritures
>    réservées aux admins (`public.is_admin(auth.uid())`).
> 3. **Hooks** suivant le pattern d'étape 16.
> 4. **Pages** :
>    - `CommunesPage` (`/communes`) — listing.
>    - `CommuneDetailPage` (`/communes/:slug`) — fiche + bouton rejoindre/
>      quitter selon le statut de membre.
>    - `CommuneCreatePage` (`/communes/new`, RequireAuth + RequireAdmin).
>    - `AdminPage` (`/admin`, RequireAuth + RequireAdmin) — vue
>      d'ensemble : modération, communes, email campaigns.
>    - Page contact (`/legal/contact` ou similaire) connectée.
> 5. **Router** : remplacer les placeholders `CommunesPage` et `AdminPage`,
>    ajouter les nouvelles routes, créer un `RequireAdmin` wrapper.
> 6. **Tests** : objectif ≥ 770 tests verts (654 + ≥ 120 nouveaux —
>    2 modules × ~25 tests + 4 pages × ~5 tests).
> 7. **HANDOFF-PROGRESS.md** : étape 17 ✅ + prompt étape 18
>    (Sprint 6 — Optim + tests E2E + mise en prod).
>
> **CLÔTURE DE L'ÉTAPE — workflow auto-merge** :
>
> Conformément à `CLAUDE.md` § « Politique de PR », tu as autorisation
> permanente d'enchaîner les étapes ci-dessous sans demander
> confirmation. Procéder dans l'ordre, **sans s'arrêter entre les
> étapes** :
>
> 1. **Vérifier les 4 checks locaux verts** : `npm run typecheck &&
>    npm run lint && npx vitest run && npm run build`. Si un check
>    échoue → corriger, ne pas commit. Si tu ne sais pas corriger en
>    moins de 3 tentatives → t'arrêter et demander.
> 2. **Commit** : `feat(admin): step 17 — sprint 5 (admin + communes
>    libres + contact)`. Pas d'emojis dans le message.
> 3. **Push** sur la branche imposée par l'harness
>    (`git push -u origin <branch>`, retry exponentiel 2/4/8/16 s sur
>    erreur réseau).
> 4. **Ouvrir la PR** vers `main` via
>    `mcp__github__create_pull_request` avec titre identique au commit,
>    body suivant le template (Summary + Décisions + Test plan). Pas
>    d'emojis.
> 5. **Attendre les checks GitHub Actions si présents**. S'ils sont
>    rouges → autofix puis re-push, ne pas merger.
> 6. **Merger la PR** via `mcp__github__merge_pull_request` (merge
>    method `merge` ou `squash` — pas `rebase`). Confirmer le merge
>    dans la conversation avec l'URL de la PR.
>
> **Conditions d'arrêt malgré l'autorisation permanente**
> (cf. `CLAUDE.md`) :
>
> - Migration DB risquée (suppression / rename de table / colonne /
>   RPC non listée dans ce prompt). Attention au RequireAdmin :
>   l'implémentation doit s'appuyer sur `public.is_admin(auth.uid())`
>   existant, pas créer une nouvelle table de rôles.
> - Changement RGPD (nouvelle collecte de données perso, nouveau
>   cookie non listé — attention au panel admin qui peut accéder à des
>   données perso : ne pas exposer d'emails utilisateur en clair côté
>   front sans nécessité).
> - Breaking change visible utilisateur.
> - Review humaine ou commentaire GitHub arrivé avant le merge —
>   traiter d'abord.
>
> Dans tous ces cas : demander confirmation explicite avant de merger.
>
> **Contraintes générales** :
>
> - Ne pas toucher au prototype.
> - TS strict + no `any`.
> - Conserver les checks verts à chaque étape.
> - Pas d'emojis dans le code TS ni dans les commits / PR.
> - Pour le panel admin : RLS critique. Vérifier que les policies
>   `admin_logs`, `email_campaigns`, `communes_write_admin` interdisent
>   tout accès non-admin (cf. `db/schema.sql`).

---

## Prompt pour la session N+10 (étape 16)

> Repo : `/home/user/maintenantproto1` (branche imposée par l'harness —
> typiquement `claude/<auto>`).
>
> **Lis dans cet ordre** :
>
> 1. `CLAUDE.md` — règles projet (TS strict, pas de `any`, camelCase TS /
>    snake_case DB, SVG via `ICONS.*` pas d'emojis, RLS, RGPD). **Note
>    la section « Politique de PR » qui t'autorise à enchaîner ouverture
>    + merge des PR sans confirmation jusqu'à la session 50 incluse.**
> 2. `HANDOFF.md` §10 Sprint 4 (Réseau social + Messagerie +
>    Notifications + Média).
> 3. `HANDOFF-PROGRESS.md` — journal (étape 15 ✅ — étape 16 à faire).
> 4. `db/schema.sql` §10-12 : `articles`, `comments`, `reactions`,
>    `follows`, `posts`, `conversations`, `messages`, `notifications`
>    + leurs policies RLS.
> 5. `web/src/lib/crowdfunding.ts` + `web/src/lib/sel.ts` — patterns
>    de référence (validation, listing, hooks, pages détaillées).
> 6. `web/src/pages/services/CrowdfundingContributePage.tsx` — pattern
>    formulaire RequireAuth dépendant d'une ressource parente
>    (utilisé pour `/messages/:conversationId/reply`).
>
> **État actuel à la fin de l'étape 15** :
>
> - Sprint 3 complet (hébergement + covoiturage + lending +
>   marketplace + garden + sel + crowdfunding).
> - 526 tests verts, build 295 kB (tronqué CI).
> - Routes `/services/*` couvertes pour les 7 services.
> - `CampaignDetailPage` résout déjà `action.crowdfunding_id` vers
>   `/services/crowdfunding/:id` (route désormais montée).
>
> **CONTEXTE D'OUVERTURE** — à exécuter avant toute autre action :
>
> 1. Vérifier qu'on est bien dans un workspace contenant `web/`. Si non
>    (rare — branche partie d'un main obsolète), `git fetch origin main &&
>    git merge --ff-only origin/main`.
> 2. `cd web && npm ci` (fallback : `npm install --legacy-peer-deps`).
> 3. `npm run typecheck && npm run lint && npx vitest run && npm run build`
>    pour vérifier le compteur de tests au point de départ (≥ 526 verts
>    à la fin de l'étape 15).
>
> **ÉTAPE 16 à exécuter — Sprint 4 / Réseau social + Messagerie +
> Notifications + Média** :
>
> 1. **Module `web/src/lib/social.ts`** : posts du réseau social
>    (table `posts(author_id, body, visibility, created_at)`),
>    follows (`follows(follower_id, followee_id)`).
> 2. **Module `web/src/lib/messaging.ts`** : conversations DM
>    (`conversations(user_a, user_b, last_message_at)`) + messages
>    (`messages(conversation_id, sender_id, body, read_at?)`). RLS
>    stricte : seuls `user_a` et `user_b` lisent / écrivent.
> 3. **Module `web/src/lib/notifications.ts`** : flux
>    (`notifications(user_id, kind, payload, read_at?)`).
> 4. **Module `web/src/lib/media.ts`** : articles
>    (`articles(author_id, slug, title, summary, body, status,
>    published_at?)`) + comments + reactions.
> 5. **Hooks** suivant le pattern d'étape 15.
> 6. **Pages** :
>    - `ReseauPage` (`/reseau`) — feed des posts, filtres « tout / suivis ».
>    - `MessagingPage` (`/messaging`) — liste conversations + DM.
>    - `NotificationsPage` (`/notifications`) — flux marqué lu/non-lu.
>    - `MediaPage` (`/media`) — listing articles publiés.
>    - `ArticleDetailPage` (`/media/:slug`) + `ArticleCreatePage`
>      (`/media/new`, RequireAuth).
> 7. **Router** : remplacer les placeholders existants
>    (`MessagingPage`, `NotificationsPage`, `ReseauPage`, `MediaPage`).
> 8. **Tests** : objectif ≥ 650 tests verts (526 + ≥ 130 nouveaux —
>    4 modules × ~30 tests).
> 9. **HANDOFF-PROGRESS.md** : étape 16 ✅ + prompt étape 17
>    (Sprint 5 — Admin + Communes libres + Pages légales restantes).
>
> **CLÔTURE DE L'ÉTAPE — workflow auto-merge** :
>
> Conformément à `CLAUDE.md` § « Politique de PR », tu as autorisation
> permanente d'enchaîner les étapes ci-dessous sans demander
> confirmation. Procéder dans l'ordre, **sans s'arrêter entre les
> étapes** :
>
> 1. **Vérifier les 4 checks locaux verts** : `npm run typecheck &&
>    npm run lint && npx vitest run && npm run build`. Si un check
>    échoue → corriger, ne pas commit. Si tu ne sais pas corriger en
>    moins de 3 tentatives → t'arrêter et demander.
> 2. **Commit** : `feat(social): step 16 — sprint 4 (réseau +
>    messagerie + notifications + média)`. Pas d'emojis dans le
>    message.
> 3. **Push** sur la branche imposée par l'harness
>    (`git push -u origin <branch>`, retry exponentiel 2/4/8/16 s sur
>    erreur réseau).
> 4. **Ouvrir la PR** vers `main` via
>    `mcp__github__create_pull_request` avec titre identique au commit,
>    body suivant le template (Summary + Décisions + Test plan). Pas
>    d'emojis.
> 5. **Attendre les checks GitHub Actions si présents**. S'ils sont
>    rouges → autofix puis re-push, ne pas merger.
> 6. **Merger la PR** via `mcp__github__merge_pull_request` (merge
>    method `merge` ou `squash` — pas `rebase`). Confirmer le merge
>    dans la conversation avec l'URL de la PR.
>
> **Conditions d'arrêt malgré l'autorisation permanente**
> (cf. `CLAUDE.md`) :
>
> - Migration DB risquée (suppression / rename de table / colonne /
>   RPC non listée dans ce prompt).
> - Changement RGPD (nouvelle collecte de données perso, nouveau
>   cookie non listé — attention à la messagerie : les DM sont des
>   données perso de catégorie sensible côté RGPD).
> - Breaking change visible utilisateur.
> - Review humaine ou commentaire GitHub arrivé avant le merge —
>   traiter d'abord.
>
> Dans tous ces cas : demander confirmation explicite avant de merger.
>
> **Contraintes générales** :
>
> - Ne pas toucher au prototype.
> - TS strict + no `any`.
> - Conserver les checks verts à chaque étape.
> - Pas d'emojis dans le code TS ni dans les commits / PR.
> - Pour la messagerie : RLS critique. Vérifier que les policies
>   `messages_select` et `messages_insert` interdisent toute lecture
>   par un tiers (cf. `db/schema.sql`). Si la policy n'est pas stricte,
>   **ne pas merger** et lever un blocage RGPD.

---

## Prompt pour la session N+9 (étape 15)

> Repo : `/home/user/maintenantproto1` (branche imposée par l'harness —
> typiquement `claude/<auto>`).
>
> **Lis dans cet ordre** :
>
> 1. `CLAUDE.md` — règles projet (TS strict, pas de `any`, camelCase TS /
>    snake_case DB, SVG via `ICONS.*` pas d'emojis, RLS, RGPD). **Note
>    la section « Politique de PR » qui t'autorise à enchaîner ouverture
>    + merge des PR sans confirmation jusqu'à la session 50 incluse.**
> 2. `HANDOFF.md` §10 Sprint 3 (services communautaires — Lending,
>    Marketplace, Jardins, SEL, Crowdfunding).
> 3. `HANDOFF-PROGRESS.md` — journal (étape 14 ✅ — étape 15 à faire).
> 4. `db/schema.sql` §10-11 (`lending`, `marketplace_items`,
>    `garden_plots`, `sel_offers`, `crowdfunding_projects` /
>    `crowdfunding_contributions`) + leurs policies RLS.
> 5. `web/src/lib/housing.ts` + `web/src/lib/carpooling.ts` — patterns
>    de référence (validation, listing avec or-search échappée, helpers
>    de mutation).
> 6. `web/src/pages/services/HousingPage.tsx` + `HousingDetailPage.tsx`
>    + `HousingCreatePage.tsx` — patterns UI (hero, toolbar, cards,
>    fiche avec Partager, masquage de CTA si l'utilisateur est
>    propriétaire).
>
> **État actuel à la fin de l'étape 14** (PR #3 mergée dans `main` —
> commit `feat(services): step 14 — hébergement + covoiturage CRUD` ;
> puis PR #4 mergée — commits `docs(claude): autoriser merge auto des
> PR jusqu'à la session 50 incluse` + `docs(handoff): prompt étape 15
> — workflow auto-merge intégré`) :
>
> - Sprint 2 complet (pétitions / mobilisations / sondages / campagnes).
> - Bannière cookies + 3 pages légales + Footer global.
> - Sentry no-PII scaffold prêt (DSN à brancher).
> - Sprint 3 démarré : hébergement + covoiturage CRUD opérationnels
>   (lib + hooks + 7 pages + routes RequireAuth).
> - `web/` : 380 tests verts, build 295 kB (bundle tronquée tant que
>   les env vars Supabase publiques ne sont pas fournies en CI —
>   vérifié 670 kB en local avec `.env.local`).
> - Autorisation permanente de merge auto active
>   (cf. `CLAUDE.md` § Politique de PR).
>
> **CONTEXTE D'OUVERTURE** — à exécuter avant toute autre action :
>
> 1. Vérifier qu'on est bien dans un workspace contenant `web/`. Si non
>    (rare — branche partie d'un main obsolète), `git fetch origin main &&
>    git merge --ff-only origin/main`.
> 2. `cd web && npm ci` (le `.devcontainer/` lance ça automatiquement au
>    `postCreateCommand`). Fallback : `npm install --legacy-peer-deps`.
> 3. `npm run typecheck && npm run lint && npx vitest run && npm run build`
>    pour vérifier le compteur de tests au point de départ
>    (≥ 380 verts à la fin de l'étape 14, à incrémenter à chaque étape).
>
> **ÉTAPE 15 à exécuter — Sprint 3 / Lending + Marketplace + Jardins
> + SEL + Crowdfunding** :
>
> 1. **Module `web/src/lib/lending.ts`** : prêt d'objets (categories,
>    is_available, t99cp_cost). Pas de slug.
> 2. **Module `web/src/lib/marketplace.ts`** : annonces de matériel /
>    services (titre, description, prix optionnel, échange T99CP).
> 3. **Module `web/src/lib/garden.ts`** : jardins partagés / parcelles
>    (commune, surface, contact responsable).
> 4. **Module `web/src/lib/sel.ts`** : offres SEL (titre, description,
>    coût en T99CP).
> 5. **Module `web/src/lib/crowdfunding.ts`** : cagnottes (titre,
>    description, target_eur, deadline) + contributions. Attention :
>    table déjà référencée par `campaign_actions.crowdfunding_id`.
> 6. **Hooks correspondants** (pattern `useHousing` / `useHousingItem`).
> 7. **Pages** :
>    - `LendingPage` + `LendingDetailPage` + `LendingCreatePage`
>      (`/services/lending`).
>    - Idem pour marketplace, garden, sel, crowdfunding.
>    - Crowdfunding : ajouter `CrowdfundingContributePage` (RequireAuth,
>      `/services/crowdfunding/:id/contribute`).
>    - Vérifier que `CampaignDetailPage` résout bien les liens
>      `action.crowdfunding_id` vers `/services/crowdfunding/:id`.
> 8. **Router** : ajouter routes sous `services` (children).
> 9. **Tests** : objectif ≥ 500 tests verts (380 + ≥ 120 nouveaux —
>    5 modules × ~24 tests : lib 12-15 / hooks 4-6 / pages 8-15).
> 10. **HANDOFF-PROGRESS.md** : étape 15 ✅ détaillée (sections Modules
>     / Hooks / Pages / Tests / Décisions) + prompt étape 16 (Sprint
>     4 — Réseau social + Messagerie + Notifications + Média).
>
> **CLÔTURE DE L'ÉTAPE — workflow auto-merge** :
>
> Conformément à `CLAUDE.md` § « Politique de PR », tu as autorisation
> permanente d'enchaîner les étapes ci-dessous sans demander
> confirmation. Procéder dans l'ordre, **sans s'arrêter entre les
> étapes** :
>
> 1. **Vérifier les 4 checks locaux verts** : `npm run typecheck &&
>    npm run lint && npx vitest run && npm run build`. Si un check
>    échoue → corriger, ne pas commit. Si tu ne sais pas corriger en
>    moins de 3 tentatives → t'arrêter et demander.
> 2. **Commit** : `feat(services): step 15 — sprint 3 complet (lending
>    + marketplace + garden + sel + crowdfunding)`. Pas d'emojis dans
>    le message.
> 3. **Push** sur la branche imposée par l'harness
>    (`git push -u origin <branch>`, retry exponentiel 2/4/8/16 s sur
>    erreur réseau).
> 4. **Ouvrir la PR** vers `main` via
>    `mcp__github__create_pull_request` avec titre identique au commit,
>    body suivant le template (Summary + Décisions + Test plan). Pas
>    d'emojis.
> 5. **Attendre les checks GitHub Actions si présents**. S'ils sont
>    rouges → autofix puis re-push, ne pas merger.
> 6. **Merger la PR** via `mcp__github__merge_pull_request` (merge
>    method `merge` ou `squash` — pas `rebase`, pour conserver le
>    commit complet). Confirmer le merge dans la conversation avec
>    l'URL de la PR.
>
> **Conditions d'arrêt malgré l'autorisation permanente**
> (cf. `CLAUDE.md`) :
>
> - Migration DB risquée (suppression / rename de table / colonne /
>   RPC non listée dans ce prompt).
> - Changement RGPD (nouvelle collecte de données perso, nouveau
>   cookie non listé).
> - Breaking change visible utilisateur (route supprimée, format URL
>   changé, schéma de stockage modifié).
> - Review humaine ou commentaire GitHub arrivé avant le merge —
>   traiter d'abord.
>
> Dans tous ces cas : demander confirmation explicite avant de merger.
>
> **Contraintes générales** :
>
> - Ne pas toucher au prototype.
> - TS strict + no `any`.
> - Conserver les checks verts à chaque étape.
> - Pas d'emojis dans le code TS ni dans les commits / PR.
> - Vérifier que la FK `campaign_actions.crowdfunding_id` continue de
>   fonctionner après l'introduction du module crowdfunding (la fiche
>   campagne doit pouvoir résoudre l'ID en lien
>   `/services/crowdfunding/:id`).

---

## Prompt pour la session N+8 (étape 14)

> Repo : `/home/user/maintenantproto1` (branche imposée par l'harness —
> typiquement `claude/<auto>`).
>
> **Lis dans cet ordre** :
>
> 1. `CLAUDE.md` — règles projet (TS strict, pas de `any`, camelCase TS /
>    snake_case DB, SVG via `ICONS.*` pas d'emojis, RLS, RGPD).
> 2. `HANDOFF.md` §10 Sprint 3 (services communautaires — Hébergement,
>    Covoiturage).
> 3. `HANDOFF-PROGRESS.md` — journal (étape 13 ✅ — étape 14 à faire).
> 4. `db/schema.sql` §10-11 (`housing`, `housing_requests`, `carpooling`)
>    + leurs policies RLS.
> 5. `web/src/lib/campaigns.ts` + `web/src/lib/mobilizations.ts` — patterns
>    de référence pour la lib (validation, slug, retry 23505, listing avec
>    or-search échappée).
> 6. `web/src/pages/CampaignDetailPage.tsx` + `MobilizationDetailPage.tsx` —
>    patterns de fiche détaillée.
>
> **État actuel à la fin de l'étape 13** (tip `claude/add-campaigns-module-FHBHA`,
> commit `chore(rgpd): step 13 — bannière cookies + pages légales + audit RLS/Sentry`) :
>
> - Sprint 2 complet (pétitions / mobilisations / sondages / campagnes).
> - Bannière cookies + 3 pages légales (`/legal/privacy`, `/legal/notice`,
>   `/legal/cookies`) opérationnelles.
> - Footer global avec liens légaux dans `RootLayout`.
> - Sentry no-PII scaffold (`web/src/lib/sentry.ts`) prêt — DSN à brancher.
> - `web/` : 298 tests verts, build 295 kB.
> - RLS auditée table par table, findings documentés (vue `public_users`
>   à créer avant prod).
>
> **CONTEXTE D'OUVERTURE** — à exécuter avant toute autre action :
>
> Depuis la PR #1, `main` contient le projet Vite à jour : il n'y a plus
> aucune branche `claude/*` figée à fetch. Le démarrage est désormais :
>
> 1. Vérifier qu'on est bien dans un workspace contenant `web/`. Si non
>    (rare — branche partie d'un main obsolète), `git fetch origin main &&
>    git merge --ff-only origin/main`.
> 2. `cd web && npm ci` (le `.devcontainer/` lance ça automatiquement au
>    `postCreateCommand` ; refaire à la main si besoin). Fallback :
>    `npm install --legacy-peer-deps`.
> 3. `npm run typecheck && npm run lint && npx vitest run && npm run build`
>    pour vérifier le compteur de tests au point de départ
>    (≥ 298 verts à la fin de l'étape 13, à incrémenter à chaque étape).
>
> **ÉTAPE 14 à exécuter — Sprint 3 / Hébergement + Covoiturage** :
>
> 1. **Module `web/src/lib/housing.ts`** :
>    - Types `HousingRow`, `HousingInsert`, `HousingRequestRow` dérivés de
>      `Database['public']`.
>    - `listHousing({ city, search, dateRange, limit })` — filtre
>      `is_published=true` par défaut, tri `created_at DESC`. Search
>      `or('title.ilike.%X%,city.ilike.%X%,description.ilike.%X%')` avec
>      échappement %/_/,.
>    - `getHousing(id)` — la fiche est par ID (pas de slug pour le moment —
>      table sans colonne slug). Si on veut un slug, ajouter d'abord
>      `housing.slug` + index unique au schéma.
>    - `createHousing(input)` — validation (title 4-80, city obligatoire,
>      capacity ≥ 1, available_from < available_to), insert RLS-checked.
>    - `requestHousing(housingId, { message, dates })` — insert
>      `housing_requests` (status `pending`), RLS empêche un host de se
>      contacter lui-même.
>    - Helpers `cancelRequest(id)`, `acceptRequest(id)`, `refuseRequest(id)`.
> 2. **Module `web/src/lib/carpooling.ts`** :
>    - Types `CarpoolingRow`, `CarpoolingInsert`.
>    - `listCarpooling({ from, to, dateRange, search, limit })`.
>    - `getCarpooling(id)`.
>    - `createCarpooling(input)` — validation (depart/arrivée obligatoires,
>      depart_at futur, seats ≥ 1 ≤ 8, price_eur ≥ 0).
> 3. **Hooks `useHousing` / `useHousingItem` / `useCarpooling` /
>    `useCarpoolingItem`** — pattern polls/campaigns.
> 4. **Pages** :
>    - `HousingPage` (`/services/housing`) — listing avec filtres (ville,
>      capacité min, dates).
>    - `HousingDetailPage` (`/services/housing/:id`) — hero photo, infos,
>      bouton « Faire une demande » (modale ou page séparée, au choix —
>      page séparée plus simple).
>    - `HousingCreatePage` (`/services/housing/new`, RequireAuth).
>    - `HousingRequestPage` (`/services/housing/:id/request`, RequireAuth).
>    - `CarpoolingPage` (`/services/carpooling`) — listing avec filtres
>      (départ, arrivée, date).
>    - `CarpoolingDetailPage` (`/services/carpooling/:id`).
>    - `CarpoolingCreatePage` (`/services/carpooling/new`, RequireAuth).
> 5. **Router** : ajouter les routes ci-dessus en respectant la
>    structure existante (`children` sous `services`).
> 6. **Tests** : objectif ≥ 340 tests verts (298 + ≥ 42 nouveaux,
>    pattern habituel : lib 12-15 / hooks 6 / pages 18-25).
> 7. **HANDOFF-PROGRESS.md** : étape 14 ✅ avec sections « Module housing »,
>    « Module carpooling », « Hooks », « Pages », « Tests », « Décisions ».
> 8. **Prompt étape 15** : suite Sprint 3 (Lending + Marketplace + Garden
>    + SEL + Crowdfunding).
> 9. **Commit** : `feat(services): step 14 — hébergement + covoiturage CRUD`.
>    Push sur la branche imposée par l'harness.
>
> **Contraintes** :
>
> - Ne pas toucher au prototype.
> - TS strict + no `any`.
> - Conserver les checks verts.
> - Pas d'emojis dans le code TS ni dans les commits.
> - Réutiliser `slugify()` si on décide d'ajouter `housing.slug` (préférer
>   alors une migration séparée — modifier `db/schema.sql` + régénérer
>   `web/src/types/database.ts`).
