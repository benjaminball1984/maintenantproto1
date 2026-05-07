# pasdepesticidespournosenfants.fr

Site de mobilisation pour la pétition **Pas de pesticides pour nos enfants**, portée par
[Bio Consom'acteurs](https://bioconsomacteurs.org).

> Une initiative citoyenne pour la sortie des pesticides dans les cantines scolaires françaises.

---

## État d'avancement

| Phase | Périmètre | Statut |
|---|---|---|
| **1 — MVP signatures** | Site, pétition, signature, mail de remerciement, pages légales | ✅ Code livré |
| **2 — Commande matériel** | Sélecteur, frais de port, Stripe Checkout, webhook | 🔁 Reportée — code prêt sur la branche `claude/phase-2-commande-materiel`. Page `/commander` actuellement en placeholder « bientôt disponible ». |
| **3 — Distributions** | Autocomplétion établissements (58 972), formulaire, fiche pratique, rappels J-1/J-0 | ✅ Code livré |
| **4 — Carte & chiffres** | Carte MapLibre + OSM, agenda, tableau de bord public, top 10 départements | ✅ Code livré |
| **5 — Qui sommes-nous + finitions** | Page BCA + premiers signataires + partenaires, lazy loading, code splitting | ✅ Code livré |

---

## Stack

- **Vite + React 18 + TypeScript** + React Router v6 (lazy loading par route)
- **Tailwind CSS** (charte BCA dans `tailwind.config.ts` + `src/styles/theme.css`)
- **Supabase** (Postgres EU) — `@supabase/supabase-js`
- **Resend** pour les emails transactionnels (Netlify Functions)
- **MapLibre GL JS** + tuiles OpenStreetMap — page `/carte` (chargé à la demande)
- **date-fns** + locale `fr` pour le formatage français
- **Netlify** : hébergement + functions serverless (TypeScript, esbuild) + scheduled function cron
- **Validation** : Zod + React Hook Form
- **Icônes** : lucide-react

---

## Démarrer en local

```bash
# 1. Installer les dépendances
npm install

# 2. Copier les variables d'environnement
cp .env.example .env
# puis renseigner VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, RESEND_API_KEY, etc.

# 3. Lancer le dev server
npm run dev
# → http://localhost:5173

# 4. Pour tester les Netlify Functions en local : installer netlify-cli
npm install -g netlify-cli
netlify dev
# → http://localhost:8888 (proxy Vite + functions)
```

### Scripts utiles

| Commande | Description |
|---|---|
| `npm run dev` | Démarre Vite (front uniquement, pas de functions) |
| `npm run build` | Build production (TS check + Vite bundle) |
| `npm run preview` | Sert le build local |
| `npm run typecheck` | Vérifie le typage |
| `netlify dev` | Lance front + Netlify Functions ensemble |

---

## Structure du projet

```
.
├── public/                  Assets servis tels quels (favicon, _redirects, /images)
├── src/
│   ├── components/          UI réutilisable (Header, Footer, Layout, decor SVG…)
│   ├── pages/               Une route = un fichier
│   ├── data/                Texte de la pétition (JSX), futurs firstSigners…
│   ├── lib/                 supabase, validation Zod, storage local, cn utility
│   ├── styles/              theme.css (Tailwind + variables charte BCA)
│   └── App.tsx, main.tsx
├── netlify/functions/       Functions serverless (Resend, Stripe, …)
├── supabase/migrations/     Schéma SQL versionné
├── data/raw/                CSV établissements (non versionné, ~38 Mo)
├── netlify.toml             Config build + redirections + headers sécurité
└── .env.example             Variables d'env (à copier en .env)
```

---

## Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com) en région EU (Frankfurt).
2. Dans **SQL Editor**, exécuter `supabase/migrations/0001_init.sql`.
3. Récupérer `Project URL` + `anon public key` → `.env` (`VITE_SUPABASE_*`).
4. Récupérer `service_role secret` → variable d'env Netlify (jamais exposé au client).

La table `signatures` a une RLS qui n'autorise que l'`insert` côté `anon`, avec
contraintes serveur (longueur prénom/nom/email, regex code postal). La vue
`public_signature_count` est lisible publiquement et n'expose aucune PII.

## Configuration Resend

1. Créer un compte sur [resend.com](https://resend.com).
2. Vérifier le domaine `pasdepesticidespournosenfants.fr` (DNS DKIM + SPF).
3. Créer une API key → variable d'env Netlify `RESEND_API_KEY`.
4. Définir l'expéditeur : `RESEND_FROM_EMAIL=campagne@pasdepesticidespournosenfants.fr`.
5. Définir l'adresse de réception du formulaire de contact : `CONTACT_TO_EMAIL=contact@bioconsomacteurs.org`.

---

## Charte graphique

| Variable | Hex | Usage |
|---|---|---|
| `bca-green-dark` | `#1F3F2C` | Fond principal, header/footer |
| `bca-green-light` | `#9DBE6F` | Feuilles, accents végétaux |
| `bca-yellow` | `#F2C53D` | CTA principal, accents fort |
| `bca-orange` | `#E76F4A` | Boutons secondaires, drapeaux |
| `bca-cream` | `#FAF7F0` | Fond pages, texte sur fond foncé |
| `alert` | `#C53030` | Messages d'erreur, sanctions |

**Fonts** (Google Fonts) :
- `Bagel Fat One` — titres principaux (display)
- `Caveat Brush` — accent manuscrit (slogan hero)
- `Inter` — corps de texte

---

## Assets manquants à fournir

⚠️ Les visuels suivants ne sont pas encore dans le repo. Le client (BCA) doit les
fournir avant la mise en ligne :

| Chemin attendu | Description |
|---|---|
| `public/images/home-hero.jpg` | Bannière d'accueil (enfant + panier de légumes + titre) |
| `public/images/petition-flyer.jpg` | Visuel partage social / OG image |
| `public/images/logo-bca.svg` | Logo Bio Consom'acteurs |
| `public/favicon.ico` | (optionnel) favicon ICO classique. Le `favicon.svg` est déjà fourni. |

Tant que ces fichiers ne sont pas présents, l'app fonctionne mais le hero affiche
un fond uni vert sans photo, et le footer masque automatiquement le logo BCA.

---

## Données établissements scolaires (Phase 3)

Les CSV `etablissements_scolaires_FR.csv` (63 454 lignes, 20 Mo) et
`cantines_scolaires_FR.csv` (59 217 lignes, 19 Mo) sont placés dans `data/raw/`
**hors versioning Git** (voir `.gitignore`).

**Deux usages côté projet :**

1. **Autocomplétion côté client** (page `/organiser`) — JSON allégé compact
   `public/data/etablissements.min.json` (5,46 Mo / 1,66 Mo gzippé) contenant
   58 972 établissements avec cantine. Régénération :
   ```bash
   npm run build:establishments
   ```
   (lit `data/raw/cantines_scolaires_FR.csv`, écrit `public/data/…`).

2. **Table Supabase `establishments`** (utilisée par les vues publiques pour la
   carte / agenda) — peuplée via :
   ```bash
   export VITE_SUPABASE_URL=...
   export SUPABASE_SERVICE_ROLE_KEY=...
   npm run seed:establishments
   ```
   Insertion par batches de 1 000 lignes. Idempotent (upsert sur la PK `uai`).

---

## Sécurité & RGPD

- Case **newsletter décochée par défaut** (exigence CNIL / arrêt CJUE Planet49) ;
  case « campagne » pré-cochée car relevant de l'intérêt légitime, lié à l'objet
  exact de la pétition.
- Aucun cookie traceur. Stockage local technique uniquement (pré-remplissage
  des étapes d'engagement post-signature), ne quitte jamais le navigateur.
- En-têtes de sécurité par défaut dans `netlify.toml` (`X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`).
- Validation côté serveur sur toutes les Netlify Functions, jamais de confiance
  aveugle aux paramètres URL.
- Honeypot `hp` invisible sur les formulaires (signature et contact).

À ajouter en Phase 2/3 : rate limiting (3 signatures par IP / heure), CAPTCHA
invisible (hCaptcha) en cas de pic d'abus, vérification signature webhook
Stripe.

---

## Déploiement Netlify

1. Connecter le repo GitHub à Netlify.
2. **Build settings** sont déjà dans `netlify.toml`, rien à ajouter.
3. Renseigner les variables d'environnement dans **Site settings → Environment
   variables** (clés du `.env.example`, partie privée + partie publique).
4. Configurer le domaine custom `pasdepesticidespournosenfants.fr` (DNS pointant
   sur Netlify).
5. Push sur `main` → déploiement auto.

---

## Crédits

Pétition portée par **Bio Consom'acteurs** — 10 rue Beaumarchais, 93100 Montreuil.

Code initial scaffold par Claude Code (Anthropic) sur la base du brief produit
fourni par le client.
