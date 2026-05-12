# Tests E2E Playwright

Suite end-to-end exécutée contre l'app buildée (`npm run preview`).

## Lancer en local

1. Une fois : installer les navigateurs (`chromium`).
   ```bash
   npm run test:e2e:install
   ```
2. Lancer la suite (le `webServer` Playwright build + sert l'app).
   ```bash
   npm run test:e2e
   ```

## Variables d'environnement

- `PLAYWRIGHT_BASE_URL` (optionnel) — URL d'une instance déjà servie.
- `PLAYWRIGHT_PORT` (optionnel, défaut `4173`) — port pour le `preview` serveur.
- `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` — l'app les exige au runtime ;
  en CI/E2E, on injecte des valeurs factices et on intercepte les requêtes
  réseau via `page.route()` (cf. `e2e/utils/mockSupabase.ts`).

## Couverture

- `public-pages.spec.ts` — smoke test + axe-core sur les pages publiques
  (`/`, `/petitions`, `/communes`, `/media`, `/services`, `/legal/*`).
- `auth-flow.spec.ts` — ouverture / fermeture de la modale auth, validations
  client.
- `petition-signature.spec.ts` — signature d'une pétition avec stub Supabase.
- `mobilization-rsvp.spec.ts` — RSVP mobilisation avec stub Supabase.
- `poll-vote.spec.ts` — vote sondage avec stub Supabase.
- `admin-moderation.spec.ts` — login admin (stub) → unflag d'un item.
