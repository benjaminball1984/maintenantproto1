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
| 6. Page profil + reset password + avatars bucket        |   ✅   |
| 7. Adhésion Stripe (3 tiers) + RPC T99CP (Sprint 1)     |   ✅   |
| 8. OAuth Google/Instagram + magic link (fin Sprint 1)   |   ⬜   |

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
> 8. **Commit** : `feat(auth): step 8 — OAuth Google + Instagram + magic
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
> Le prompt de l'étape 9 doit impérativement contenir la même consigne
> récursive : « écrire le prompt de l'étape 10 dans `HANDOFF-PROGRESS.md`
> avant le commit final ». Cette boucle s'arrête uniquement quand le
> Sprint 2 (contenu militant — pétitions, mobilisations, campagnes) est
> complet, point auquel le prompt généré peut basculer sur le Sprint 3
> (services communautaires).

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
