# Instructions Claude — Projet Maintenant ! (post-reset 2026-05-17)

## Contexte

Le repo a été remis à zéro le 2026-05-17. Lis [HANDOFF.md](./HANDOFF.md)
en intégralité avant toute action. Le protocole de redev est explicite
et **doit être respecté à la lettre**.

## Règles dures (résumé)

1. **Pas de code en session de description / planification.** L'ordre
   imposé est : besoin utilisateur → archi → maquette → plan d'étapes
   → code. Jamais de code avant que les 4 premières étapes soient
   validées par l'utilisateur.
2. **Une PR = une décision atomique.** Une seule fonctionnalité
   observable par PR. Pas de mélange wording + structure + DB + nav.
3. **Capture avant merge.** Tout changement visuel passe par une
   capture d'écran validée par l'utilisateur avant fusion. Si Claude
   ne peut pas capturer (env restreinte), il décrit en français
   précisément ce qui change et demande l'utilisateur de tester en
   local.
4. **Pas d'auto-merge.** Claude ouvre la PR en draft. C'est
   l'utilisateur qui fusionne après validation visuelle.
5. **Pas de migration DB sans confirmation explicite.** Aucune table,
   RPC, RLS ne se crée sans discussion préalable.
6. **Pas de dépendance NPM nouvelle sans justification.** Chaque ajout
   dans `package.json` doit être nommé et justifié dans le body de la
   PR.
7. **Pas d'auto-narration cumulative.** Pas de fichier
   `HANDOFF-PROGRESS.md` qui grossit indéfiniment. Le seul document de
   référence vivant est `HANDOFF.md`, **réécrit** à chaque jalon majeur
   pour refléter l'état actuel — pas pour empiler l'historique.
   L'historique est dans `git log`.

## Conventions code (quand on en sera là)

- TypeScript strict (`strict: true`, pas de `any`).
- Composants en `.tsx`, hooks en `.ts`.
- Tokens design dans `web/src/index.css` (variables `--mn-*`). Pas de
  valeur de couleur en dur dans le code applicatif.
- Icônes via `@/components/icons` (33 SVG dispo). Pas d'emoji.
- snake_case côté DB (si DB), camelCase côté TS, PascalCase pour les
  composants React.

## Branches & PR

- `main` → seule branche stable. Déployée sur Netlify.
- `feat/<sujet>` → branche de travail courant. Une branche = une PR.
- Pas de force-push sur `main`. Pas de `--no-verify`.

## Récupération de l'ancien projet

Le travail pré-reset (Stripe, auth, CRUD, services, ~1000 tests) reste
accessible sur la branche `backup-pre-reset-2026-05-17`. Voir
`HANDOFF.md §Restaurer l'ancien projet` si l'utilisateur change d'avis.

---

**Bonne reconstruction. Tout est dans `HANDOFF.md`.**
