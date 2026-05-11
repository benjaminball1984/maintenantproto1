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
- **[package.template.json](./package.template.json)** — Template `package.json` pour la migration Vite

## Structure

```
.
├── app/                  ← Prototype HTML/JSX (entrée : Maintenant.html)
├── db/                   ← Schéma Postgres + migrations
├── HANDOFF.md            ← Passation tech
├── CLAUDE.md             ← Instructions agent
├── README.md             ← Ce fichier
├── .env.example          ← Variables d'env (à copier en .env.local)
└── package.template.json ← Base package.json pour Vite+React+TS
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
