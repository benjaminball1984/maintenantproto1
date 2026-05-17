# Maintenant ! — La voix des 99%

> Reset complet 2026-05-17 — le repo a été remis à zéro pour repartir
> sur de meilleures bases. Lis **[HANDOFF.md](./HANDOFF.md)** avant
> toute action. La version pré-reset reste accessible via la branche
> `backup-pre-reset-2026-05-17`.

## Démarrage rapide (état actuel)

```bash
cd web
npm install
npm run dev
```

Le site affiche un **placeholder** (charte graphique chargée, pas
encore de code applicatif). Voir `web/src/App.tsx`.

## Ce qui reste

- `web/src/index.css` — tokens CSS (`--mn-*`).
- `web/src/components/icons.tsx` — 33 icônes SVG.
- `project/`, `Theme.jsx`, `Pages_*.jsx`, `*.css`, archives ZIP —
  prototype d'origine, références visuelles.
- `chats/` — exports des conversations initiales.

## Stack visée (à reconstruire)

- **Frontend** : Vite + React 19 + TypeScript strict.
- **Backend** : à définir selon les besoins validés en session 1 (cf.
  HANDOFF.md §Étape A).
- **Hébergement** : Netlify (déjà configuré côté CI).

## Protocole de redev

Voir [HANDOFF.md](./HANDOFF.md). Résumé : description en langage
naturel → archi validée → maquettes validées → plan d'étapes → code,
**une étape à la fois avec capture-avant-merge**.

## Licence

À définir.
