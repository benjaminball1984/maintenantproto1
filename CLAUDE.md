# Instructions Claude — Projet Maintenant ! (post-reset 2026-05-17)

## Contexte

Le repo a été remis à zéro le 2026-05-17. Lis [HANDOFF.md](./HANDOFF.md)
en intégralité avant toute action. Le protocole de redev est explicite
et **doit être respecté à la lettre**.

---

## Les 6 règles dures (à respecter sans exception)

### 1. Ne jamais inventer de wording

Sauf demande explicite de l'utilisateur (« propose-moi 3 phrases pour le
hero »), Claude **ne crée pas de texte de son propre chef** :

- Pas de slogan inventé.
- Pas de microcopie inventée (boutons, formulaires, messages d'erreur).
- Pas de description de page rédigée par anticipation.

Si un texte manque, Claude **demande** à l'utilisateur quoi mettre, ou
laisse un `TODO_WORDING` visible en attendant.

### 2. Toujours demander avant de coder

**Aucune ligne de code applicatif** n'est écrite sans une question
préalable explicite et une réponse claire de l'utilisateur. Le code
arrive **après** :

- (a) une description en langage naturel du besoin ;
- (b) la validation de l'architecture proposée ;
- (c) une maquette / capture d'écran approuvée ;
- (d) un plan d'étapes accepté.

Si l'une de ces 4 étapes manque, Claude **n'écrit pas de code**, il
revient à l'étape manquante.

### 3. Toujours proposer des options expliquées simplement

Quand un choix se présente (technique ou produit), Claude présente
**2 à 4 options**, chacune avec :

- Un **nom court** compréhensible.
- Une **explication en français courant** (pas de jargon).
- Les **conséquences concrètes** pour l'utilisateur (« si tu choisis
  ça, voilà ce qui change pour toi »).
- Une **recommandation** si Claude en a une, avec le pourquoi.

L'utilisateur n'est **pas censé connaître** les termes techniques. Si
Claude doit utiliser un mot technique, il le définit en une phrase
juste après (« Supabase = la base de données qui stocke les comptes
utilisateurs et les pétitions »).

### 4. Validation par capture d'écran avant tout code

Une fois une option choisie, Claude **ne code pas tout de suite**. Il
produit d'abord une **maquette visuelle** :

- Une capture d'écran d'un prototype HTML statique (rapide à générer).
- Ou un mockup simple (Excalidraw, Figma, ou même un schéma ASCII).
- Ou une description très précise du rendu (couleurs, position des
  blocs, taille des textes) avec les tokens de la charte.

L'utilisateur valide la maquette. Si elle ne convient pas, on itère
**sur la maquette uniquement**, jamais sur du code React déjà branché.

### 5. Mémoriser la version validée + proposer un plan de code

Une fois la maquette validée, Claude :

- **Mémorise** la décision dans `HANDOFF.md` (section « Décisions
  validées ») avec la date, le contexte, et un lien vers la capture
  validée (si applicable).
- **Propose un plan de code** étape par étape :
  - Chaque étape = une seule fonctionnalité observable.
  - Chaque étape = une seule PR.
  - Chaque étape liste explicitement ce qu'elle **n'inclut PAS**
    (anti-scope-creep).
  - Chaque étape précise comment l'utilisateur la validera (capture
    avant merge).

L'utilisateur valide le plan d'ensemble. **Ensuite**, et seulement
ensuite, Claude commence à coder l'étape 1.

### 6. Récursivité : chaque session termine par un prompt + handoff

À la **fin de chaque session**, Claude doit, **sans qu'on ait à le
demander** :

1. **Écrire** le prompt complet pour la session N+1 dans
   `HANDOFF.md` sous une section dédiée « Prompt pour la session
   N+X ».
2. **Recopier** intégralement ce même prompt dans la **dernière
   réponse de chat** de la session.
3. **Inclure dans ce prompt N+1 cette même consigne de récursivité**,
   pour que la session N+2 la respecte aussi (et N+3, et N+4…).

Concrètement, chaque prompt généré doit contenir une ligne du type :

> À la clôture de cette session, recopier le prompt pour la session
> N+X+1 à la fois dans HANDOFF.md ET dans la dernière réponse de chat.
> Inclure dans ce prompt la même consigne de récursivité pour N+X+2.

Cette règle est **auto-réplicante** : une fois posée, chaque session
la perpétue toute seule.

---

## Conventions code (quand on en sera là)

- TypeScript strict (`strict: true`, pas de `any`).
- Composants en `.tsx`, hooks en `.ts`.
- Tokens design dans `web/src/index.css` (variables `--mn-*`). Pas de
  valeur de couleur en dur dans le code applicatif.
- Icônes via `@/components/icons` (33 SVG dispo). Pas d'emoji.
- snake_case côté DB (si DB), camelCase côté TS, PascalCase pour les
  composants React.

## Branches & PR

- `main` → seule branche stable. Déployée sur Netlify (deploys
  actuellement en pause).
- `feat/<sujet>` → branche de travail courant. Une branche = une PR.
- Pas de force-push sur `main`. Pas de `--no-verify`. Pas d'auto-merge.
- Une PR = une décision atomique avec capture validée.

## Récupération de l'ancien projet

Le travail pré-reset (Stripe, auth, CRUD, services, ~1000 tests) reste
accessible sur la branche `backup-pre-reset-2026-05-17`. Voir
`HANDOFF.md §Restaurer l'ancien projet` si l'utilisateur change d'avis.

---

**Bonne reconstruction. Tout est dans `HANDOFF.md`.**
