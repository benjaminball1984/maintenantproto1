# HANDOFF — Suivi d'avancement

> Journal de bord de la migration prototype → production (Vite + React + TS + Supabase).
> Référence : [HANDOFF.md](./HANDOFF.md) — [CLAUDE.md](./CLAUDE.md)

---

## État global

| Étape                                                   | Statut |
| ------------------------------------------------------- | :----: |
| 1. Initialisation repo + branche                        |   ✅   |
| 2. `.env.example` + `package.template.json` à la racine |   ✅   |
| 3. Squelette Vite + React + TS dans `web/`              |   ✅   |
| 4. Schéma DB Supabase + RLS                             |   ✅   |
| 5. Brancher Supabase Auth sur `AuthModal`               |   ✅   |
| 6. Migration page par page (cf. sprints HANDOFF §10)    |   ⬜   |

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
