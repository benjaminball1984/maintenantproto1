# Maintenant ! — La voix des 99%

Plateforme citoyenne francophone : mobilisation civique, services solidaires, espace communautaire, adhésion.

## Démarrage rapide (prototype actuel)

```bash
# Ouvrir directement dans un navigateur
open app/Maintenant.html
# ou servir un dossier statique
npx serve app
```

Aucune dépendance à installer — React et Babel sont chargés via CDN.

## Documentation

- **[HANDOFF.md](./HANDOFF.md)** — Dossier de passation complet (stack, archi, schéma DB, sprints, déploiement)
- **[CLAUDE.md](./CLAUDE.md)** — Instructions pour Claude Code
- **[.env.example](./.env.example)** — Variables d'environnement requises
- **[db/schema.sql](./db/schema.sql)** — Schéma Supabase Postgres
- **[web/package.json](./web/package.json)** — Projet Vite + React 19 + TS (production)
- **[docs/package.template.json](./docs/package.template.json)** — Template historique des deps cibles (planification, plus utilisé par les outils)

## Structure

```
.
├── web/                  ← Projet Vite + React 19 + TS (production) — `cd web && npm install`
├── db/                   ← Schéma Postgres + migrations
├── supabase/             ← Config locale Supabase (CLI)
├── app/                  ← Prototype HTML/JSX legacy (entrée : Maintenant.html) — référence visuelle
├── docs/                 ← Documents historiques (template package.json, etc.)
├── .devcontainer/        ← Config conteneur dev (postCreateCommand → npm ci dans web/)
├── HANDOFF.md            ← Passation tech
├── HANDOFF-PROGRESS.md   ← Journal de migration sprint par sprint
├── CLAUDE.md             ← Instructions agent
├── README.md             ← Ce fichier
└── .env.example          ← Variables d'env (à copier en .env.local)
```

## Stack cible (prod)

- **Frontend** : Vite + React 18 + TypeScript
- **Backend** : Supabase (Postgres + Auth + Storage + Realtime + RLS)
- **Paiements** : Stripe (adhésions + financement participatif)
- **Email** : Resend ou Postmark
- **Hébergement** : Vercel/Netlify (front) + Supabase (back) + Cloudflare (DNS/WAF)
- **Monitoring** : Sentry + Plausible

## Marque

- Couleurs : rose `#E11D74`, violet `#7C3AED`, fond `#FAFAF9`
- Typographies : Sora (titres), Inter (corps)
- Pas de pub, pas de tracking, RGPD-first, EU-hosted

## Licence

À définir — recommandation AGPL v3 pour un projet à mission citoyenne (forks ouverts mais obligation d'ouverture).

---

**Voir [HANDOFF.md](./HANDOFF.md) pour tout le reste.**
