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
| 4. Schéma DB Supabase + RLS                             |   ⬜   |
| 5. Brancher Supabase Auth sur `AuthModal`               |   ⬜   |
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
