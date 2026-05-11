# HANDOFF — Progression de la passation

> Journal des étapes franchies pendant la passation du prototype `project/app/Maintenant.html`
> vers la cible Vite + React + TypeScript + Supabase décrite dans [`HANDOFF.md`](./HANDOFF.md).
> Chaque étape laisse le prototype d'origine intact tant que la parité visuelle n'est pas atteinte.

## Process — Règle de continuité (à appliquer à CHAQUE session)

À la fin de chaque session de passation, **après** une livraison réussie (commit + push acceptés
par le remote), l'agent doit produire dans sa réponse finale **le prompt prêt-à-coller pour la
session suivante**. Ce prompt doit :

1. **Suivre la même structure** que les prompts précédents :
   - commencer par « Lis `HANDOFF-PROGRESS.md` puis exécute l'étape N : … »
   - décrire la tâche précise (livrables, fichiers à créer/modifier, contraintes),
   - rappeler les fichiers à NE PAS casser (`project/app/Maintenant.html`, `app/index.html`,
     toute entrée déjà livrée),
   - se terminer par : mise à jour de `HANDOFF-PROGRESS.md`, commit en
     [Conventional Commits](https://www.conventionalcommits.org/) (`chore(handoff): step N — <slug>`),
     push sur une branche `claude/<slug>`.
2. **Cibler l'étape suivante** telle qu'elle apparaît dans le tableau « État global » ci-dessous.
   Si l'étape suivante manque ou n'est plus pertinente, l'agent met d'abord à jour le tableau.
3. **Inclure lui-même cette règle de continuité** (par référence ou par copie de cette
   section), pour que la session N+1 produise à son tour le prompt de la session N+2, et
   ainsi de suite jusqu'à la mise en production (étape finale du tableau).

Cette règle est volontairement auto-réplicative : si elle est oubliée dans un prompt, l'agent
qui lit `HANDOFF-PROGRESS.md` la retrouve ici et l'applique quand même.

## État global

| # | Étape                                                       | Statut      | Branche                                    |
|---|-------------------------------------------------------------|-------------|--------------------------------------------|
| 1 | Initialisation du repo & structure `app/`                   | ✅ Terminé  | —                                          |
| 2 | Nouvelle entrée HTML `app/index.html` (CDN + modules)       | ✅ Terminé  | `claude/create-html-entry-point-W0eqi`     |
| 3 | Squelette Vite `web/` (à venir)                             | ⏳ À faire  | —                                          |
| 4 | Migration design system (`Theme.jsx` → `web/src/theme/`)    | ⏳ À faire  | —                                          |
| 5 | Auth Supabase + page profil                                 | ⏳ À faire  | —                                          |

---

## Étape 1 — Initialisation

- Repo Git initialisé, branches `main` (prod) et branches feature `claude/*` (travail courant).
- Sources de référence en place à la racine et sous `project/app/` :
  - `project/app/Maintenant.html` — entrée prototype (à NE PAS casser)
  - `project/app/*.jsx` — modules JSX du prototype (data, design system, pages)
  - `Theme.jsx`, `Pages_*.jsx`, `ReseauPage.jsx`, `CommunesLibres.jsx` — copies racine (legacy upload)
  - `HANDOFF.md`, `CLAUDE.md`, `README.md` — documentation passation
- Variables d'environnement modèle : `.env.example` (Supabase, Stripe, Postmark — non remplies).

## Étape 2 — Nouvelle entrée HTML `app/index.html`

**Objectif** : créer une seconde entrée HTML, parallèle à `project/app/Maintenant.html`, qui :
- charge React 18 + ReactDOM + Babel standalone + Supabase JS v2 via CDN,
- reprend l'intégralité des styles globaux et des balises `<meta>` du prototype,
- charge les modules JSX dans l'ordre documenté en §3 de `HANDOFF.md`,
- prépare l'intégration backend Supabase sans toucher au prototype.

**Réalisé** :
- Fichier `app/index.html` créé. Le prototype `project/app/Maintenant.html` reste inchangé.
- Libs CDN chargées dans le `<head>` :
  - `react@18.3.1` (UMD development, intégrité SRI préservée)
  - `react-dom@18.3.1` (UMD development, intégrité SRI préservée)
  - `@babel/standalone@7.29.0` (intégrité SRI préservée)
  - `@supabase/supabase-js@2.45.4` (UMD, expose `window.supabase`)
- Styles globaux et `<meta>` repris à l'identique depuis `project/app/Maintenant.html` (reset,
  scrollbar, breakpoints mobile/tablette/desktop, tweaks panel, `mn-reseau-grid`,
  `mn-messaging-grid`, animations `fadeUp`, polish responsive).
- Polices Google (`Inter` + `Sora`) avec `preconnect`.
- Modules chargés via `<script type="text/babel" src="…">` dans l'ordre du §3 du HANDOFF :
  1. `AppData.jsx` (données)
  2. `Theme.jsx` (design system, expose `T`, `ICONS`, `AppNav`, `BottomNav`, `AuthModal`, `ToastProvider`, `Btn`, `Card`, `Modal`, `Avatar`, `Badge`, etc.)
  3. `Compat.jsx` (shims legacy UIKit → Theme)
  4. Pages :
     - `Pages_Home.jsx`
     - `Pages_Services.jsx`
     - `Pages_Commerce.jsx`
     - `Pages_Media_Profile.jsx`
     - `CampaignPage.jsx`
     - `ReseauPage.jsx`
     - `PollsPage.jsx`
     - `AdminMessagingNotifs.jsx`
     - `AdminEmailsAPI.jsx`
     - `JoinMovement.jsx`
     - `CommunesLibres.jsx`
- Bootstrap `App()` inline conservé à l'identique (router `switch(page)`, persistance
  localStorage, tweaks panel, footer, BottomNav).
- Tous les `src=` pointent sur `../project/app/<module>.jsx` afin de réutiliser une seule
  source de vérité (pas de duplication tant que la migration TS n'est pas faite).

**Vérifications restantes (manuelles, hors de portée de cette étape)** :
- Ouvrir `app/index.html` dans un navigateur (servir via `python3 -m http.server` au minimum,
  car Babel standalone refuse `file://` pour la sécurité CORS).
- Vérifier que `window.supabase.createClient` est disponible (sera utilisé à l'étape Auth).
- Confirmer la parité visuelle avec `project/app/Maintenant.html`.

**Notes** :
- `Refonte.jsx` mentionné en §3 du HANDOFF n'est pas présent dans `project/app/` (déjà
  nettoyé) ; aucun chargement à prévoir.
- `Harmonize.css` mentionné en §3 du HANDOFF n'est pas présent non plus ; les styles
  globaux du `<style>` inline suffisent pour la parité prototype.
- Supabase JS est chargé mais NON initialisé : `createClient(url, anonKey)` sera appelé
  dans un script dédié à l'étape Auth, en lisant `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY` (cf. `.env.example`).

---

## Prochaine étape (3) — Squelette Vite `web/`

- `npm create vite@latest web -- --template react-ts`
- Configurer ESLint + Prettier + Vitest
- Mettre en place le routing (`react-router-dom`) avec URLs publiques préservées
  (`/petitions`, `/services/housing/:id`, …)
- Copier le design system (`Theme.jsx` → `web/src/theme/`) en TS strict
