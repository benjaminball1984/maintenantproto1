# Runbook de mise en production — Maintenant !

Ce document décrit la procédure de **provisionnement initial** des
services externes nécessaires à la mise en prod. Ces opérations
nécessitent des comptes/permissions humaines et **ne peuvent pas être
exécutées par Claude** depuis la CI. À dérouler manuellement par un·e
membre de l'équipe technique avec les accès appropriés.

Pour les opérations quotidiennes (modération, support), voir
[MODERATION.md](./MODERATION.md) et [USER-GUIDE.md](./USER-GUIDE.md).

Pour le contexte projet et la roadmap, voir
[HANDOFF.md](../HANDOFF.md).

---

## Ordre de provisionnement

1. **Supabase** (DB + Auth + Storage + Edge Functions) → première car
   tout dépend de l'URL et de l'anon key.
2. **Stripe** (produits + webhook) → dépend de l'URL du webhook
   Supabase Edge Functions.
3. **Vercel** (front-end) → dépend des env vars Supabase + Stripe.
4. **Sentry** (monitoring) → en dernier, le DSN est ajouté à Vercel.

---

## 1. Supabase

### 1.1 Création du projet

1. Compte Supabase → **New project**.
2. Paramètres :
   - **Name** : `maintenant-prod`
   - **Database password** : généré avec un gestionnaire de mots de
     passe (1Password, Bitwarden). **À stocker dans le coffre partagé
     équipe technique uniquement.**
   - **Region** : `eu-west-3` (Paris) **ou** `eu-central-1` (Francfort)
     — RGPD oblige, jamais hors UE.
   - **Pricing plan** : **Pro** (25 $/mois) pour Point-in-Time Recovery
     + bandwidth dédiée + supports SLA.

### 1.2 Application du schéma

```bash
# Depuis le repo local
psql "postgresql://postgres:<password>@db.<project-id>.supabase.co:5432/postgres" \
  < db/schema.sql
```

**Vérifications post-application** :

```sql
-- Toutes les tables présentes (43 tables attendues)
\dt public.*

-- RLS activée sur les tables sensibles
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and rowsecurity = false;
-- Doit retourner 0 ligne hors tables techniques.

-- Au moins une policy par table sensible
select tablename, count(*) as policy_count
from pg_policies
where schemaname = 'public'
group by tablename
order by policy_count;
-- Toutes les tables avec données privées doivent avoir ≥ 1 policy.

-- Fonctions SECURITY DEFINER OK
\df+ public.credit_t99cp
\df+ public.debit_t99cp
\df+ public.is_admin
-- Étape 23 : RPC publique d'agrégation des inscriptions mensuelles
-- (security definer, grant execute to anon + authenticated, bornée
-- à p_months_back ∈ [1, 60] côté DB). Appelée par TransparencePage.
\df+ public.users_signups_monthly

-- Sanity check 1 — exécution côté admin (psql connecté en superuser) :
-- vérifie que la RPC répond et que le format est OK. Ne valide PAS les
-- grants `anon` car superuser bypasse les ACLs Postgres.
select * from public.users_signups_monthly() limit 3;

-- Sanity check 2 — exécution côté anon (via PostgREST + anon JWT) :
-- vérifie réellement les grants execute. Doit retourner 12 lignes JSON
-- (mois UTC, count >= 0), jamais 401/403 « permission denied ».
-- $ANON_KEY = clé `anon` (Project Settings → API).
-- $SUPABASE_URL = https://<project-id>.supabase.co
--   curl -s -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" \
--        "$SUPABASE_URL/rest/v1/rpc/users_signups_monthly"

-- Étape 24 : RPC publique de comptage signatures par pétition
-- (security definer, scalaire integer, grant execute to anon +
-- authenticated, base de la dette M2-sec). Ne projette aucun user_id.
\df+ public.signatures_count_for_petition

-- Sanity check 3 — admin (psql superuser) : la fonction renvoie un int.
-- Remplacer `<PETITION_UUID>` par un id réel ; si la table signatures
-- est vide, la fonction renvoie 0 (jamais NULL).
select public.signatures_count_for_petition('<PETITION_UUID>'::uuid);

-- Sanity check 4 — anon (PostgREST + anon JWT) : grants execute OK.
-- Doit renvoyer un body JSON contenant un nombre, jamais 401/403.
--   curl -s -X POST \
--        -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" \
--        -H "Content-Type: application/json" \
--        -d '{"p_petition":"<PETITION_UUID>"}' \
--        "$SUPABASE_URL/rest/v1/rpc/signatures_count_for_petition"

-- Étape 30 : RPC publique de cumul T99CP émis (security definer,
-- scalaire bigint, grant execute to anon + authenticated, alimente la
-- carte « T99CP émis (cumulé) » sur /transparence). Aucune PII —
-- coalesce(sum(amount), 0) sur t99cp_transactions where kind = 'credit'.
-- Migration **non-bloquante côté UI** : si la RPC manque, la carte est
-- silencieusement masquée côté front (cf. TransparencePage.tsx +
-- test E2E « masque la carte T99CP en cas d'erreur RPC »).
\df+ public.transparency_t99cp_total

-- Sanity check 5 — admin (psql superuser) : la fonction renvoie un
-- bigint. Sur projet sans crédit T99CP : 0. Sur projet avec adhésions
-- payées : multiple de 60 (= monthlyT99cpBonus() par invoice Stripe).
select public.transparency_t99cp_total();

-- Sanity check 6 — anon (PostgREST + anon JWT) : grants execute OK.
-- Doit renvoyer un body JSON contenant un nombre (ou la chaîne d'un
-- bigint si > 2^53, cas hors scope humain), jamais 401/403/404.
--   curl -s -X POST \
--        -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" \
--        -H "Content-Type: application/json" \
--        -d '{}' \
--        "$SUPABASE_URL/rest/v1/rpc/transparency_t99cp_total"
```

### 1.3 Régénération des types TypeScript

```bash
npx supabase login
npx supabase gen types typescript --project-id <project-id> \
  > web/src/types/database.ts
git diff web/src/types/database.ts
```

**Diff attendu** : aucun (le schéma local et le projet prod doivent
être identiques). Si diff → quelqu'un a modifié le schéma local sans
appliquer en prod (ou vice-versa). Investiguer avant de commit.

### 1.4 Point-in-Time Recovery

Dans le dashboard Supabase :

- **Project Settings → Database → Point-in-Time Recovery** → **Enable**
  (inclus dans le plan Pro).
- Choisir la **fenêtre de rétention** : 7 jours minimum.
- Tester la procédure de restauration sur un projet de **staging** :
  créer un backup, supprimer une table, restaurer → vérifier que la
  table revient.

### 1.5 Alertes

**Project Settings → Alerts** :

- **Database CPU > 80 %** sur 10 min → Slack `#alerts-prod`.
- **Database memory > 85 %** sur 10 min → Slack.
- **API requests > 80 % du quota** sur 1 h → Slack + email.
- **Auth signups anormaux** (> 100/h) → Slack (signal de bot/spam).

### 1.6 Bucket Storage `avatars`

Le bucket est créé par le schéma SQL (`db/schema.sql` §19). Vérifier :

```sql
select * from storage.buckets where id = 'avatars';
-- public = true attendu.

select * from pg_policies
where schemaname = 'storage' and tablename = 'objects'
  and policyname like 'avatars_%';
-- 4 policies attendues : public_read, authenticated_insert/update/delete.
```

### 1.7 Edge Functions

```bash
# Lier le projet local au projet prod
npx supabase link --project-ref <project-id>

# Déployer les fonctions
npx supabase functions deploy create-checkout-session --no-verify-jwt
npx supabase functions deploy stripe-webhook --no-verify-jwt
```

> **Pourquoi `--no-verify-jwt` sur `stripe-webhook` ?** Stripe ne sait
> pas signer un JWT Supabase. La sécurité du endpoint repose sur la
> vérification HMAC de l'en-tête `stripe-signature` via
> `STRIPE_WEBHOOK_SECRET` (cf. `handle()` lignes 110-125). Sans ce
> flag, l'Edge Function rejetterait tout appel sans Bearer Supabase
> et le webhook ne pourrait jamais entrer. Toute modification future
> doit conserver le check signature côté `handle()`.
>
> **Pourquoi sur `create-checkout-session` ?** Cette fonction peut
> être appelée par un utilisateur·rice authentifié·e (Bearer
> Supabase optionnel transmis automatiquement) ou anonyme (premier
> paiement avant compte). Le check d'autorisation business (tier
> valide, idempotence client_reference_id) est fait dans le corps de
> la fonction. À durcir si on veut forcer l'auth Supabase.

**Variables d'environnement** des fonctions (Project Settings →
Edge Functions → Environment Variables) :

| Var | Valeur | Source |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe → Webhooks → Signing secret |
| `SUPABASE_URL` | auto-injecté | Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | auto-injecté | Supabase |

**Test du webhook** : depuis Stripe CLI :

```bash
stripe listen --forward-to https://<project-id>.supabase.co/functions/v1/stripe-webhook
stripe trigger checkout.session.completed
```

Vérifier dans Supabase → SQL Editor :

```sql
select * from public.stripe_events order by received_at desc limit 5;
-- Doit montrer l'event avec processed_at non null.
```

### 1.8 Sauvegarde initiale

**AVANT** d'autoriser le trafic public, dump complet :

```bash
pg_dump "postgresql://postgres:<password>@db.<project-id>.supabase.co:5432/postgres" \
  --no-owner --no-acl \
  > maintenant-prod-initial-$(date +%Y%m%d).sql
```

Upload dans un bucket privé Supabase Storage (`backups`) ou dans le
S3 chiffré de l'équipe technique. Rétention 1 an.

---

## 2. Stripe

### 2.1 Création des produits

Stripe Dashboard → **Products** :

| Produit | Description | Prix |
| --- | --- | --- |
| Adhésion gratuite | Membre du mouvement, 0 € | 0 € (pas de prix Stripe — gérée en DB) |
| Adhésion soutien | 2 € / mois récurrent | Prix `price_soutien_2eur_month` |
| Adhésion engagé·e | 5 € / mois récurrent | Prix `price_engage_5eur_month` |

**Métadonnées** sur chaque prix (clé/valeur) :

- `tier` = `soutien` ou `engage`
- `monthly_t99cp_bonus` = `30` ou `60`

Reporter les **price IDs** dans `web/src/lib/membership.ts` (constante
`STRIPE_PRICE_IDS`).

### 2.2 Webhook

Stripe Dashboard → **Developers → Webhooks → Add endpoint** :

- **Endpoint URL** : `https://<project-id>.supabase.co/functions/v1/stripe-webhook`
- **API version** : la plus récente.
- **Events to send** :
  - `checkout.session.completed`
  - `customer.subscription.deleted`
  - `customer.subscription.updated`
  - `invoice.payment_succeeded`

Récupérer le **Signing secret** (`whsec_...`) → l'enregistrer dans la
variable d'env `STRIPE_WEBHOOK_SECRET` de l'Edge Function (cf. 1.7).

### 2.3 Tests

1. **Mode test** : créer un compte test avec une carte `4242 4242 4242 4242`.
   Vérifier que :
   - Une ligne `adhesions` est créée (`status='active'`, `tier='soutien'`).
   - Une ligne `stripe_events` est créée (`processed_at` non null).
   - Le solde T99CP de l'utilisateur a été crédité de 30 (soutien) ou
     60 (engagé).

2. **Mode live** (après sécurisation) : un·e admin teste avec sa
   propre carte (1 € pour vérifier que le webhook fire). Annule
   immédiatement. Vérifier idempotence : Stripe peut renvoyer le même
   event, on doit lire `idempotent: true` dans la réponse.

---

## 3. Netlify

### 3.1 Création du site

1. Se connecter à **https://app.netlify.com** (plan payant, équipe
   `Maintenant!`).
2. **Team → Sites → Add new site → Import an existing project**.
3. Provider Git : **GitHub** (autoriser l'app Netlify à lire le repo
   `benjaminball1984/maintenantproto1` la première fois).
4. Sélectionner le repo `maintenantproto1`.
5. Build settings : Netlify détecte automatiquement `netlify.toml` à
   la racine et applique :
   - **Base directory** : `web`
   - **Build command** : `npm ci && npm run build`
   - **Publish directory** : `dist` (résolu en `web/dist`)
6. **Deploy site** → le premier build démarre. ~2-3 min pour
   `npm ci` (premier passage) + `npm run build` (~30 s).
7. Récupérer l'URL générée du type `https://<nom-aléatoire>.netlify.app`
   (renommable dans **Site settings → Site information → Change site
   name**, ex. `maintenantproto1-staging.netlify.app`).

### 3.2 Variables d'environnement

Netlify Dashboard → **Site configuration → Environment variables** →
**Add a variable** (cocher « Same value for all deploy contexts » ou
distinguer Production / Deploy preview / Branch deploys selon les
besoins) :

| Var | Production | Deploy preview / Branch | Local (`.env.local`) |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | prod URL | staging URL | localhost |
| `VITE_SUPABASE_ANON_KEY` | prod anon key | staging anon key | local key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | `pk_test_...` | `pk_test_...` |
| `VITE_SENTRY_DSN` | prod DSN | staging DSN | (vide) |
| `VITE_SUPPORT_USER_ID` | UUID du compte support | idem | idem |
| `VITE_SUPPORT_EMAIL` | `contact@maintenant.org` | idem | idem |
| `VITE_APP_URL` | `https://maintenant.org` | URL Netlify | `http://localhost:5173` |
| `VITE_APP_ENV` | `production` | `staging` | `development` |

**⚠️ Aucune variable `service_role`, aucun secret Stripe (`sk_live_*`,
`whsec_*`), aucun token Supabase service role côté Netlify (toutes
les opérations sensibles passent par les Supabase Edge Functions qui
ont leurs propres env vars).**

Après ajout : **Deploys → Trigger deploy → Clear cache and deploy
site** pour que les nouvelles variables soient prises en compte.

### 3.3 Vérification headers CSP

Une fois la première deploy en ligne :

```bash
curl -I https://<site-name>.netlify.app/
```

Doit contenir :

- `content-security-policy: default-src 'self'; ...`
- `strict-transport-security: max-age=63072000; includeSubDomains; preload`
- `x-content-type-options: nosniff`
- `x-frame-options: DENY`
- `referrer-policy: strict-origin-when-cross-origin`
- `permissions-policy: geolocation=(), microphone=(), camera=(), payment=(self "https://js.stripe.com")`

Si une directive manque → revoir `netlify.toml` racine (section
`[[headers]]`).

### 3.4 Protection mot de passe sur staging

**Tant que le site n'est pas public** (plan Pro requis) :

Netlify Dashboard → **Site configuration → Visitor access →
Password protection** → activer un mot de passe partagé pour les
déploiements de **branche** et **deploy previews** (pas sur
production une fois lancé).

Alternative gratuite : laisser le site public mais ajouter un
`robots.txt` qui interdit l'indexation (`User-agent: * / Disallow: /`)
jusqu'au go-live.

### 3.5 Domaine custom

- **Site configuration → Domain management → Add domain alias** →
  ajouter `maintenant.org` (prod) et `staging.maintenant.org`
  (branche `staging` ou deploy preview).
- Configurer les DNS chez le registrar :
  - **Option 1 (Netlify DNS, recommandé)** : déléguer les
    nameservers du domaine à Netlify (`dns1.p01.nsone.net`,
    `dns2.p01.nsone.net`, etc. — Netlify donne les valeurs
    exactes). Tout le DNS est ensuite géré dans le dashboard
    Netlify, et le certificat TLS est généré automatiquement.
  - **Option 2 (DNS externe)** :
    - Apex (`maintenant.org`) : `ALIAS` ou `ANAME` → `apex-loadbalancer.netlify.com`
      (ou `A` → 4 IPs fournies par Netlify si registrar sans ALIAS).
    - Sous-domaines (`staging.maintenant.org`) : `CNAME` → le nom du
      site Netlify (ex. `maintenantproto1-staging.netlify.app`).
- Attendre la délivrance du certificat TLS Let's Encrypt (auto via
  Netlify, ~1-5 min après propagation DNS).

### 3.6 Première mise en prod

1. Push sur `main` → trigger CI GitHub Actions (unit + e2e).
2. Si CI verte → Netlify crée le déploiement production automatiquement
   (branche de production configurée dans **Site configuration → Build
   & deploy → Branches → Production branch**).
3. Smoke test manuel sur `https://maintenant.org` :
   - Page d'accueil charge en < 2 s.
   - Inscription + confirmation email fonctionnent.
   - Pétition publique signable.
   - Adhésion soutien (mode live, 1 €) puis annulation.
4. Si OK → annoncer publiquement (réseaux, mailing).

---

## 4. Sentry

### 4.1 Création du projet

Sentry → **Create project** :

- **Platform** : `Browser JavaScript` (React).
- **Project name** : `maintenant-web`.
- **Team** : `maintenant-tech`.

Récupérer le **DSN** → ajouter dans Vercel env vars (cf. 3.2).

### 4.2 Configuration

- **Environments** : `production`, `preview`, `development`.
- **Inbound filters** : activer **Filter out errors known to be caused
  by browser extensions / web crawlers**.
- **Data scrubbing** : activer **Default scrubbing** (Sentry scrub
  côté serveur en plus du `beforeSend` côté front qui passe par
  `scrubEvent` dans `web/src/lib/sentry.ts`).

### 4.3 Alertes

Sentry → **Alerts → Create alert** :

- **Issue alert** : `New issue + error event` → Slack `#alerts-prod`
  avec seuil **10 events / 1 h** (pour éviter le bruit).
- **Metric alert** : `error rate > 1 %` sur 15 min → Slack.

### 4.4 Tests

Au premier déploiement avec DSN configuré :

1. Vérifier dans Sentry → **Issues** qu'un event apparaît au boot
   (Sentry SDK envoie un event de session start).
2. Provoquer une erreur volontaire dans une page de test (e.g.
   `throw new Error('sentry-canary')`) → vérifier que l'event arrive
   avec **user = `[Filtered]`** (PII strippée par `scrubEvent`).
3. Supprimer la page de test.

---

## 5. Audit Lighthouse

Avant l'annonce publique, lancer un audit complet :

```bash
# Sur staging password-protected (compte temporaire)
npx unlighthouse --site https://staging.maintenant.org --routes /,/petitions,/communes,/media,/services,/join

# Ou DevTools Lighthouse manuel (mode Incognito, throttling 4G)
```

**Cibles** (cf. CLAUDE.md) :

| Métrique | Cible |
| --- | --- |
| Performance | ≥ 95 |
| Accessibility | ≥ 95 |
| Best Practices | ≥ 95 |
| SEO | ≥ 95 |
| LCP | < 2.5 s |
| CLS | < 0.1 |
| TBT | < 200 ms |

Documenter les résultats dans `HANDOFF-PROGRESS.md` section « Audit
Lighthouse ». Si une cible n'est pas atteinte → bug bloquant, corriger
avant de retirer la protection mot de passe.

---

## 6. Checklist de mise en prod

À cocher avant d'annoncer publiquement :

- [ ] Supabase prod en région EU, plan Pro, PITR activé.
- [ ] `db/schema.sql` appliqué intégralement. RLS active sur toutes
      les tables.
- [ ] `web/src/types/database.ts` identique au schéma prod.
- [ ] Backup initial `pg_dump` stocké hors-Supabase.
- [ ] Edge Functions `create-checkout-session` et `stripe-webhook`
      déployées.
- [ ] Stripe webhook configuré + testé en mode live (carte test puis
      carte réelle 1 €).
- [ ] Vercel env vars renseignées pour `production` et `preview`.
      Aucune clé secret côté front.
- [ ] CSP / HSTS / X-Frame-Options vérifiés via `curl -I`.
- [ ] Domaine `maintenant.org` lié, certificat TLS OK.
- [ ] Sentry projet créé, DSN dans Vercel, alertes Slack actives.
- [ ] Lighthouse ≥ 95 sur les 6 pages clés.
- [ ] Page `/transparence` mise à jour avec date de mise en prod.
- [ ] Procédure de modération diffusée à l'équipe (cf.
      [MODERATION.md](./MODERATION.md)).
- [ ] DPO informé·e, registre RGPD à jour.
- [ ] Sauvegardes automatiques Supabase configurées (PITR + dumps
      quotidiens hors-site).
- [ ] Plan d'astreinte technique (qui appeler en cas de panne ?).

---

## 7. En cas de panne

Voir le **runbook d'astreinte** (à venir, hors périmètre étape 19) :

- **Supabase down** : statuspage Supabase → si rouge, attendre. Sinon
  vérifier `supabase status --project-ref <id>`. Restauration PITR
  uniquement après autorisation du Bureau du mouvement.
- **Vercel down** : statuspage Vercel. Switch DNS vers une page
  statique de maintenance hébergée sur CDN externe (à préparer).
- **Stripe down** : page `/join` doit afficher un message
  d'indisponibilité — bouton « Adhérer » désactivé. Code à ajouter
  (FF `payments_enabled` à créer).
- **Sentry down** : pas critique, on perd la télémétrie mais le site
  fonctionne. Vérifier qu'on ne dépasse pas le quota du plan.

Toute panne > 5 min → poster dans `#status-public` (canal Mastodon /
réseaux du mouvement) avec un descriptif honnête (sans détails techniques
exploitables par un attaquant).
