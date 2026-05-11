# HANDOFF-PROGRESS — Migration prototype → site fonctionnel

> **À lire en premier au début de chaque session Claude Code.**
> Ce document trace l'avancement étape par étape du chantier de mise en production
> du site Maintenant !. Chaque session traite **une étape** du plan ci-dessous,
> puis met à jour ce document avant de pousser sur la branche.

---

## 0 · Cadre de travail

- **Branche** : `claude/complete-website-functionality-Akkh0`
- **Repo** : `benjaminball1984/maintenantproto1`
- **Architecture choisie** : HTML/JSX (CDN Babel) enrichi, pas de bundler.
  Sources dans `app/` à la racine ; modules `app/lib/`.
- **Persistance** : Supabase (cible) avec **fallback localStorage automatique**
  si les clés ne sont pas fournies dans `app/lib/config.local.js`.
- **Édition admin** : pictos crayon partout en mode admin, toutes les
  propriétés de chaque entité éditables (titre, slug, image, contenu, champs).
- **Cadence** : 1 étape = 1 session. À la fin d'une session :
  1. mettre à jour ce fichier (cocher l'étape, noter l'état)
  2. mettre à jour `package.template.json` / autres si pertinent
  3. commit `chore(handoff): step N — <titre>`
  4. `git push -u origin claude/complete-website-functionality-Akkh0`

---

## 1 · Comment reprendre dans une nouvelle session

1. Lire ce fichier en entier.
2. Lire `CLAUDE.md` (overrides comportement).
3. Lire `HANDOFF.md` (passation produit complète).
4. Identifier la **prochaine étape non cochée** dans le plan §3.
5. Lire les fichiers listés dans **"État courant"** de cette étape.
6. Implémenter cette étape **uniquement**.
7. Mettre à jour ce fichier : cocher, mettre `Date de réalisation`,
   ajouter notes éventuelles.
8. Commit + push.

---

## 2 · Stack technique

| Couche | Choix | Notes |
|---|---|---|
| Rendu | React 18.3 via CDN UMD | pas de bundler |
| Transform | Babel standalone | `<script type="text/babel">` |
| Routing | hash-based custom (`app/lib/Router.jsx`) | URLs `#/petitions/:id` |
| State | Hooks + window globals via `Db.jsx` | pas de Redux |
| Persist | Supabase si configuré, sinon localStorage | abstraction `Db.jsx` |
| Auth | Supabase Auth ou fallback localStorage | `Auth.jsx` |
| Storage media | Supabase Storage ou base64 LS | `Media.jsx` |
| Paiements | Stripe (test) ou mock | adhésion + cagnottes |
| Email | Supabase Edge Functions ou Resend (à brancher) | `AdminEmailsAPI.jsx` |

---

## 3 · Plan en 50 étapes — État

> Légende : ✅ fait · 🟡 en cours · ⬜ à faire

### Phase 1 — Fondation (10 étapes)

- [x] **Étape 1** — `app/lib/Config.jsx` + `app/lib/config.example.js` + ce fichier HANDOFF-PROGRESS.
  - **État courant** : Config.jsx créé, lit `window.MN_CONFIG`, fallback offline,
    init client Supabase si dispo. Template `config.example.js` documenté.
  - **Fichiers** : `app/lib/Config.jsx`, `app/lib/config.local.js` (gitignoré, à créer par l'utilisateur).
  - **Date** : 2026-05-11.
- [ ] **Étape 2** — Nouvelle entrée `app/index.html` :
  - Charge React 18, ReactDOM, Babel, Supabase JS (CDN UMD).
  - Charge dans l'ordre : `lib/Config.jsx` → `lib/config.local.js` (optionnel) → `lib/Toast.jsx` → `lib/Db.jsx` → `lib/Seed.jsx` → `lib/Auth.jsx` → `lib/Router.jsx` → `lib/Media.jsx` → `lib/EditFramework.jsx` → `Theme.jsx` → `Compat.jsx` → `AppData.jsx` → `Pages_*.jsx` → `*Page.jsx` → root App.
  - Style global identique à `project/app/Maintenant.html` (reprendre tel quel).
  - Meta tags SEO + OG par défaut basés sur `MN.config`.
- [ ] **Étape 3** — `app/lib/Db.jsx` :
  - API unifiée : `Db.list(table, opts)`, `Db.get(table, id)`, `Db.insert`, `Db.update`, `Db.delete`, `Db.upsert`.
  - Backend Supabase si `MN.config.ONLINE`, sinon localStorage (clé = `LS_PREFIX + table`).
  - Hooks React : `useCollection(table, query?)`, `useDoc(table, id)`, retournent `{data, loading, error, mutate}`.
  - Pub/sub local (events) pour invalider les hooks après mutation.
- [ ] **Étape 4** — `db/schema.sql` : tables Postgres avec RLS conformes au §7.2 du HANDOFF.
  - users, petitions/signatures, mobilizations/participations, housing/housing_requests,
    carpooling_offers/carpooling_requests, lending, marketplace_items, garden_plots,
    sel_offers/sel_demands, crowdfunding_campaigns/contributions, articles/comments/reactions,
    posts/post_likes/post_comments, polls/poll_options/votes, campaigns/campaign_actions,
    communes/commune_members, conversations/messages, notifications, members, adhesions,
    t99cp_transactions, admin_logs, email_campaigns, site_settings.
  - Policies RLS strictes (un user ne lit que ses données privées ; admin = bypass).
  - Triggers : updated_at, count caches, signature dedup.
- [ ] **Étape 5** — `app/lib/Seed.jsx` :
  - Convertit `AppData.jsx` → graine compatible schéma.
  - `Seed.installIfEmpty()` au premier démarrage (mode offline).
  - Garde un flag `mn_v3_seeded` pour ne pas refaire.
- [ ] **Étape 6** — `app/lib/Router.jsx` :
  - Parse `window.location.hash` → `{route, params, query}`.
  - `Router.navigate(path, opts)`, `Router.back()`, `Router.replace(path)`.
  - Stack d'historique en mémoire (back-nav reliable même en hash).
  - Hook `useRoute()` qui re-render à chaque changement.
  - Liste des routes au même endroit (mapping → composants Page).
- [ ] **Étape 7** — `app/lib/Auth.jsx` :
  - `Auth.signup({email, password, name})`, `Auth.signin`, `Auth.signout`, `Auth.requestReset`, `Auth.updatePassword`.
  - En mode online : Supabase Auth. En offline : table `users` LS + hash SHA-256 mot de passe.
  - Hook `useAuth()` → `{user, profile, role, signin, signout, ...}`.
  - Rôles : `visitor` (pas connecté), `member`, `admin`. Détection via flag `is_admin` ou colonne `role`.
- [ ] **Étape 8** — `app/lib/Media.jsx` :
  - `Media.pickImage()` → ouvre file picker, valide MIME + taille, retourne `{url, file}`.
  - En online : `Media.upload(file, folder)` → Supabase Storage, retourne URL publique.
  - En offline : compression côté client (canvas) puis base64 → LS (avec quota guard).
  - Composant `<MediaPicker value onChange />` réutilisable.
- [ ] **Étape 9** — `app/lib/EditFramework.jsx` :
  - `<Editable entity onChange children>` : wrappeur générique. En admin mode, hover affiche un crayon top-right.
  - `<EditField field value onSave type="text|textarea|select|number|date|url|slug|color">`.
  - `<EditImage value onSave>` : intégration Media picker.
  - `<EditList items onChange itemSchema>` : ajout/suppression/réordonnancement (drag).
  - `<CrudModal schema entity onSave onDelete>` : génère un formulaire complet à partir d'un schéma.
  - `useAdminMode()` : booléen global.
- [ ] **Étape 10** — `app/lib/Toast.jsx` + `app/lib/Confirm.jsx` :
  - Toast queue avec types (info/success/warn/error) ; auto-dismiss 4s ; `toast(msg, type)`.
  - `confirm({title, body, danger, confirmLabel})` → Promise<boolean>.

### Phase 2 — Layout & navigation (5 étapes)

- [ ] **Étape 11** — AppNav enrichi (recherche globale, dropdown user, bell notif, admin badge).
- [ ] **Étape 12** — BottomNav mobile avec badges + lien Créer central.
- [ ] **Étape 13** — Footer fonctionnel (liens légal, navigation, réseaux, langue).
- [ ] **Étape 14** — BackButton + Breadcrumb + safe-area.
- [ ] **Étape 15** — Page 404 + ErrorBoundary + skeletons de chargement.

### Phase 3 — Auth & Profil (5 étapes)

- [ ] **Étape 16** — AuthModal complet (signup, login, forgot, magic link), validations.
- [ ] **Étape 17** — Page Profil édition complète (avatar, bio, badges, liens sociaux, T99CP).
- [ ] **Étape 18** — Page Paramètres (préférences notif, RGPD export, suppression compte).
- [ ] **Étape 19** — Annuaire des membres + recherche + filtres.
- [ ] **Étape 20** — Page profil public + actions (suivre, message, signaler).

### Phase 4 — Espace civique (6 étapes)

- [ ] **Étape 21** — Pétitions : liste + filtres + tri + recherche.
- [ ] **Étape 22** — Pétition détail : signatures live, signataires, partage, commentaires.
- [ ] **Étape 23** — Pétition create + admin edit complet.
- [ ] **Étape 24** — Mobilisations : liste + détail + RSVP + agenda + .ics.
- [ ] **Étape 25** — Sondages : vote + résultats live + commentaires.
- [ ] **Étape 26** — Campagnes : regroupement multi-actions + progression.

### Phase 5 — Services solidaires (8 étapes)

- [ ] **Étape 27** — Hub Services 100% fonctionnel.
- [ ] **Étape 28** — Hébergement : filtres ville/dates, détail, demande, messagerie hôte.
- [ ] **Étape 29** — Covoiturage : recherche from/to/date, détail, réservation.
- [ ] **Étape 30** — Marketplace : catégories, photos multiples, achat T99CP, messagerie.
- [ ] **Étape 31** — Lending : demande, retour, caution T99CP.
- [ ] **Étape 32** — Jardins : carte/liste, détail parcelle.
- [ ] **Étape 33** — SEL : offres/demandes, transactions heures.
- [ ] **Étape 34** — Crowdfunding : campagnes, dons, contributeurs, paliers.

### Phase 6 — Communautaire (6 étapes)

- [ ] **Étape 35** — Réseau feed : post, image, like, comment, share, hashtags.
- [ ] **Étape 36** — Détail post + thread commentaires.
- [ ] **Étape 37** — Messagerie : conversations, envoi, lu/non lu.
- [ ] **Étape 38** — Notifications : liste, lu, navigation source.
- [ ] **Étape 39** — Média : articles, vidéos, podcasts, soumission lecteur.
- [ ] **Étape 40** — Détail article + commentaires + réactions.

### Phase 7 — Adhésion & Local (4 étapes)

- [ ] **Étape 41** — Adhésion 3 tiers + tunnel Stripe (mock + real).
- [ ] **Étape 42** — Communes libres : liste, détail, members, créer, rejoindre.
- [ ] **Étape 43** — Newsletter (inscription, gestion préférences).
- [ ] **Étape 44** — Page "Créer" (hub d'actions).

### Phase 8 — Admin Dashboard (3 étapes)

- [ ] **Étape 45** — Admin dashboard onglets : modération, users, contenu, emails, stats, logs.
- [ ] **Étape 46** — Audit "tout éditable" — passe complète par page.
- [ ] **Étape 47** — Campagnes email + console API + paramètres globaux (hero, branding).

### Phase 9 — Légal & RGPD (2 étapes)

- [ ] **Étape 48** — Mentions, CGU, RGPD, Cookies (éditables admin).
- [ ] **Étape 49** — Bannière cookies + consent manager + export données.

### Phase 10 — Polish & livraison (1 étape)

- [ ] **Étape 50** — Audit responsive, a11y, perf, smoke tests, doc finale, tag de release.

---

## 4 · Conventions techniques pour les prochaines sessions

### Imports / globals
Tous les modules `lib/*.jsx` exposent sur `window.MN.*` :
- `window.MN.config` (Config)
- `window.MN.supabase` (client si online)
- `window.MN.db` (Db.jsx)
- `window.MN.auth` (Auth.jsx)
- `window.MN.router` (Router.jsx)
- `window.MN.media` (Media.jsx)
- `window.MN.toast` (Toast.jsx)
- `window.MN.confirm` (Confirm.jsx)
- `window.MN.edit` (EditFramework.jsx exports)

### Style
- Couleurs/typo : tokens `T.*` (cf. `app/Theme.jsx`)
- Pas d'emojis dans le code → SVG via `ICONS.*`
- Responsive : data-attrs (`data-mn-grid`, `data-mn-card`, etc.) + classes existantes

### Édition admin
- Toute donnée affichée doit être enveloppée dans `<Editable>` ou utiliser `EditField`
  lorsqu'en mode admin
- L'icône crayon doit n'apparaître que :
  - en `admin mode` actif (toggle via tweaks ou auto si `user.is_admin`)
  - au hover du conteneur parent (pas toujours visible, pour pas polluer)

### Sécurité
- Pas de clé service_role dans le bundle
- DOMPurify sur tout contenu user
- RLS strict sur Supabase
- Pas de PII dans les logs (console + Sentry)

### Commits
Format `<type>(<scope>): <message>` ex :
- `feat(petitions): page détail + signature live`
- `fix(router): back-nav cassée en mobile`
- `chore(handoff): step 12 — bottom nav`

---

## 5 · État des fichiers

Voir `app/` :
- `app/Theme.jsx`, `app/Compat.jsx`, `app/AppData.jsx` (existants, à conserver)
- `app/Pages_Home.jsx`, `Pages_Services.jsx`, `Pages_Commerce.jsx`, `Pages_Media_Profile.jsx`
- `app/CampaignPage.jsx`, `ReseauPage.jsx`, `PollsPage.jsx`, `CommunesLibres.jsx`
- `app/AdminMessagingNotifs.jsx`, `AdminEmailsAPI.jsx`, `JoinMovement.jsx`
- `app/lib/Config.jsx`, `app/lib/config.example.js` ✨ nouveau

À créer aux étapes suivantes :
- `app/index.html` (étape 2 — entrée moderne, remplacera l'ouverture de Maintenant.html)
- `app/lib/Db.jsx`, `Seed.jsx`, `Router.jsx`, `Auth.jsx`, `Media.jsx`, `EditFramework.jsx`,
  `Toast.jsx`, `Confirm.jsx`
- `db/schema.sql`

---

## 6 · Comment lancer le proto en local

```bash
# Aucune installation requise — tout est en CDN.
# Servir le dossier statique :
cd app && npx serve .
# puis ouvrir http://localhost:3000/index.html (à partir de l'étape 2)
```

Pour brancher Supabase : copier `app/lib/config.example.js` en
`app/lib/config.local.js` (gitignoré) et remplir les clés.
