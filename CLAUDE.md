# Instructions Claude Code — Projet Maintenant !

## Contexte

Tu prends en charge ce projet en passation. C'est un **prototype HTML/JSX** que tu vas faire passer en **production** : Vite + React + TypeScript + Supabase.

**Avant toute modification** : lis [HANDOFF.md](./HANDOFF.md) intégralement. Il contient l'archi, le design system, le schéma DB, les sprints, la sécurité.

## Priorités

1. **Ne casse jamais le prototype `app/Maintenant.html`** tant que la version Vite n'est pas en parité visuelle. Crée la nouvelle version dans un dossier `web/` séparé.
2. **Conserve le design** — tokens `T.*` (Theme.jsx), composants UI (`Btn`, `Card`, `Modal`, `AppNav`), responsive (breakpoints 767/1023).
3. **Sécurité d'abord** : RLS Supabase stricte sur toutes les tables avec données privées.
4. **RGPD** : EU region Supabase, pas de tracking pub, bannière cookies minimale.

## Conventions

### Code
- TypeScript strict (`strict: true`, pas de `any`)
- Composants en `.tsx`, hooks en `.ts`
- Pas d'inline styles pour le nouveau code → CSS Modules ou Tailwind (choix à valider)
- Pas d'emojis dans le code → SVG via `ICONS.*` (cf. Theme.jsx)
- Variables `snake_case` côté DB, `camelCase` côté TS

### Commits (Conventional Commits)
- `feat:` nouvelle fonctionnalité
- `fix:` correction
- `chore:` outillage, deps
- `refactor:` sans changement comportemental
- `docs:` documentation
- `test:` tests

### Branches
- `main` → prod
- `staging` → preview
- `feat/<sprint>-<feature>` → travail courant

## Avant de coder

1. Initialise le repo : `git init && git branch -M main`
2. Crée le squelette Vite : `npm create vite@latest web -- --template react-ts`
3. Copie `.env.example` → `.env.local` et remplis les variables
4. Initialise Supabase : `npx supabase init && npx supabase start`
5. Applique le schéma : `psql < db/schema.sql`

## Migration progressive (recommandée)

Plutôt que tout réécrire, migre **page par page** :

1. Sprint 0 : setup Vite + design system de base (tokens, composants `Btn`, `Card`, `Modal`)
2. Sprint 1 : Auth + Home + Profil
3. Sprint 2 : Pétitions + Mobilisations + Sondages + Campagnes
4. Sprint 3 : Hébergement + Covoiturage + Marketplace + Lending + Jardins + SEL
5. Sprint 4 : Réseau social + Messagerie + Notifications + Média
6. Sprint 5 : Admin + Communes libres + Pages légales
7. Sprint 6 : Optim, tests, mise en prod

Détails par sprint dans `HANDOFF.md` §10.

## Tests

- **Unit** : Vitest sur la logique métier (compteurs, validation, transformations)
- **Composants** : React Testing Library
- **E2E** : Playwright sur les flows critiques (signup, signature pétition, paiement adhésion)
- Objectif : ≥ 70 % de couverture, 100 % sur les flows critiques

## Performance

- Lighthouse ≥ 95 sur toutes les pages publiques
- LCP < 2,5 s, CLS < 0,1, TBT < 200 ms
- Images : Next.js Image ou bibliothèque équivalente, lazy par défaut
- Code-splitting par route (`React.lazy`)

## Accessibilité

- Audit axe-core ≥ 95
- Navigation clavier complète
- Contrastes AA minimum (AAA pour le texte courant)
- `aria-label` sur tous les boutons icônes
- `prefers-reduced-motion` respecté (déjà dans `Harmonize.css`)

## Sécurité (checklist avant mise en prod)

- [ ] RLS activée sur toutes les tables Supabase
- [ ] Pas de clé service-role dans le bundle front
- [ ] CSP stricte (headers via Vercel)
- [ ] Rate-limiting sur les endpoints d'écriture
- [ ] Sanitisation contenu utilisateur (DOMPurify)
- [ ] HTTPS partout, HSTS
- [ ] Bannière cookies + consent manager
- [ ] Page RGPD accessible et conforme
- [ ] Procédure de signalement/modération opérationnelle
- [ ] Sauvegardes DB automatiques Supabase (point-in-time)
- [ ] Sentry configuré (sans données perso dans les logs)

## Communication

- Questions produit : ouvre une issue GitHub avec le label `question/product`
- Questions tech : label `question/tech`

## Politique de PR (autorisation permanente jusqu'à la session 50 incluse)

À partir de l'étape 14 et **jusqu'à la fin de la 50ème session du projet incluse**,
l'équipe Maintenant! autorise Claude à enchaîner ouverture **et merge** de PR
sans demander confirmation à chaque étape. Concrètement, à la fin de chaque
étape :

1. **Commit + push** sur la branche imposée par l'harness (déjà obligatoire).
2. **Ouvrir une PR** vers `main` avec titre `feat/fix/chore(...): step N — ...`
   et un body qui suit le template (Summary + Décisions + Test plan).
3. **Merger la PR** dès qu'elle est verte (typecheck + lint + vitest + build,
   plus les checks GitHub Actions si présents).

Conditions impératives pour le merge automatique :

- Tous les checks locaux verts AVANT push (typecheck, lint, vitest, build).
- Jamais de `--force` / `--force-with-lease` vers `main`.
- Jamais de `--no-verify` / `--no-gpg-sign` ni de bypass de hook.
- Jamais de suppression ou rename de table / colonne / RPC en DB sans
  l'avoir explicitement listé dans le prompt de l'étape.
- Si une review humaine ou un commentaire de PR arrive AVANT le merge,
  l'attendre et traiter les remarques d'abord.
- En cas de doute sur une migration DB risquée, un changement RGPD, ou un
  breaking change visible utilisateur, **demander confirmation explicite**
  malgré l'autorisation permanente.

Au-delà de la session 50, revenir au workflow « pas de PR mergée sans review ».
Le compteur de sessions vit dans `HANDOFF-PROGRESS.md` (« État global » +
« Prompt pour la session N+X »).

## Recopie systématique du prompt de la session suivante

À la **fin de chaque session / étape**, et même quand l'utilisateur n'en
fait pas explicitement la demande, Claude doit :

1. **Écrire** le prompt complet pour la session N+1 dans
   `HANDOFF-PROGRESS.md` sous une section dédiée
   « Prompt pour la session N+X (étape Y) » (déjà couvert par les
   instructions « ÉTAPE à exécuter »).
2. **Recopier** intégralement ce même prompt dans la **réponse de chat
   finale** de la session, juste après la confirmation du merge de la PR.
   Format suggéré : un titre `## Prompt pour la session suivante (étape Y)`
   puis le prompt entre guillemets de citation Markdown (`> `).

Cette règle est **récursive** : chaque prompt généré pour une session
N+1 doit lui-même inclure cette instruction de recopie pour que la
session N+2 continue de la respecter. Concrètement, chaque prompt
généré doit comporter une ligne du type :

> À la clôture de cette étape, recopier le prompt pour la session N+X+1
> à la fois dans `HANDOFF-PROGRESS.md` ET dans la réponse de chat finale.

Objectif : ne plus jamais avoir à demander manuellement « peux-tu me
donner le prompt pour la session suivante ? ».

---

**Bonne migration. Tout est dans `HANDOFF.md`.**
