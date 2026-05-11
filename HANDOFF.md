# Maintenant ! — Dossier de passation pour Claude Code

> **But du document** : permettre à Claude Code (ou tout dev frontend) de prendre en charge ce projet — refactorisation propre, backend, mise en production, déploiement — sans avoir à reconstruire le contexte.

---

## 1 · Vue d'ensemble

**Maintenant !** est une plateforme citoyenne francophone qui combine :
- **Mobilisation civique** : pétitions, manifestations, sondages, campagnes
- **Services solidaires** : hébergement, covoiturage, prêt d'objets, marketplace, jardins, SEL, financement participatif
- **Espace communautaire** : réseau social interne, médias indépendants, messagerie, notifications
- **Adhésion & gouvernance** : adhésion mouvement, communes libres, profil unifié

Cible : **mobile-first**, accessible, sans pub, sans tracking publicitaire.

**Statut actuel** : prototype HTML/JSX cliquable, complet visuellement. Données en mémoire (`AppData.jsx`). Aucune persistance backend.

---

## 2 · Stack du prototype

| Composant | Technologie |
|---|---|
| Rendu | React 18.3.1 (UMD via CDN) + Babel standalone |
| Style | CSS-in-JS inline + 2 stylesheets globaux (`Maintenant.html` `<style>` + `Harmonize.css`) |
| Typo | Inter + Sora (Google Fonts) |
| Icônes | SVG inline (`ICONS` dans `Theme.jsx`) — **pas d'emoji en prod** |
| Images | Unsplash hotlink (à remplacer par CDN propre en prod) |
| Persistance locale | `localStorage` (page courante, user simulé) |

### Pourquoi pas un bundler ?
C'est un prototype de design. Pour la prod, **migrer vers Vite + React + TypeScript**. Voir §7.

---

## 3 · Arborescence

```
app/
├── Maintenant.html          ← Entrée : <style> globaux, ordre de chargement, App root, Tweaks panel
├── Harmonize.css            ← Couche d'harmonisation UX (boutons, inputs, modaux, responsive)
│
├── AppData.jsx              ← Données mock (pétitions, logements, articles, etc.)
├── Theme.jsx                ← Design system : tokens T.*, ICONS, AuthModal, Btn, Card, Modal, AppNav, BottomNav, Avatar, Badge, Toast…
├── Compat.jsx               ← Shims rétrocompatibilité ancien UIKit → Theme
├── UIKit.jsx                ← (legacy — à supprimer après migration de Pages_*.jsx vers Theme.jsx)
├── Refonte.jsx              ← Injection auto d'images Unsplash + overrides visuels finaux
│
├── Pages_Home.jsx           ← HomePage, AuthModal, ToastProvider, AppNav consolidée
├── Pages_Services.jsx       ← ServicesHub, PetitionsPage, MobilizationsPage, CrowdfundingPage
├── Pages_Commerce.jsx       ← HousingPage, CarpoolingPage, LendingPage, MarketplacePage
├── Pages_Media_Profile.jsx  ← MediaPage, GardenPage, SELPage, NewsletterPage, ProfilePage, CreerPage
│
├── CampaignPage.jsx         ← Campagnes ciblées (regroupement multi-actions)
├── ReseauPage.jsx           ← Réseau social militant (feed, posts, médias)
├── PollsPage.jsx            ← Sondages internes
├── AdminMessagingNotifs.jsx ← Messagerie + Notifications (utilisateur et admin)
├── AdminEmailsAPI.jsx       ← Console admin : campagnes email, API publique
├── JoinMovement.jsx         ← Tunnel d'adhésion (gratuit / soutien / engagé)
├── CommunesLibres.jsx       ← Communes libres / fédération territoriale
├── LegalPages.jsx           ← Mentions légales, CGU, RGPD, Contact
│
```

**Note** : les fichiers legacy (`HomePage.jsx`, `HousingPage.jsx`, `CarpoolingPage.jsx`, `LendingPage.jsx`, `MarketplacePage.jsx`, `MediaPage.jsx`, `PetitionsPage.jsx`, `MobilizationsPage.jsx`, `GardenSELCrowdfunding.jsx`, `ProfilePage.jsx`, `UIKit.jsx`, `CommunesLibres.v1.backup.jsx`, `Maintenant_legacy.html`) ont été supprimés. Toutes les pages actives sont désormais regroupées dans `Pages_*.jsx` + les fichiers `*Page.jsx` listés ci-dessus.

**Ordre de chargement obligatoire** (cf. `Maintenant.html`) :
1. `AppData.jsx` (données)
2. `Theme.jsx` (design system)
3. `Compat.jsx` (alias legacy)
4. `Pages_*.jsx`, `*Page.jsx` (pages)
5. `Refonte.jsx` (overrides — **doit rester le dernier des JSX**)
6. `Harmonize.css` (déjà chargé via `<link>` dans `<head>`)

---

## 4 · Design system & tokens

Tout est centralisé dans `Theme.jsx` → objet `T` global :

```js
T = {
  // Couleurs marque
  brand: '#E11D74',          // rose Maintenant
  brand2: '#7C3AED',          // violet secondaire
  gradR: 'linear-gradient(135deg, #E11D74 0%, #7C3AED 100%)',

  // Texte (hiérarchie)
  text1: '#1A1A18',  // titres
  text2: '#4A4840',  // corps
  text3: '#6B6962',  // secondaire
  text4: '#9C9A93',  // tertiaire / placeholder

  // Surfaces
  bg: '#FAFAF9',
  surface: '#FFFFFF',
  surface2: '#F5F4F2',
  border: '#E8E6E1',

  // Sémantique
  success: '#16A34A', warn: '#D97706', danger: '#DC2626', info: '#2563EB',

  // Radius, shadow…
}
```

Tokens dupliqués comme variables CSS dans `Harmonize.css` (préfixe `--mn-*`) pour un usage CSS hors JS.

**Composants UI réutilisables** (dans `Theme.jsx`) :
- `<Btn variant="gradient|outline|ghost|white|dark|success|danger" size="xs|sm|md|lg" full icon>`
- `<Card>`, `<Modal>`, `<Badge>`, `<Avatar>`, `<Progress>`, `<Toast>`, `<EmptyState>`
- `<AuthModal>` (login/signup/forgot)
- `<AppNav>`, `<BottomNav>` (mobile)

⚠️ Convention nommage props : `size="md"` partout — ne pas inventer `size="medium"`.

---

## 5 · Patterns à respecter

### Responsive
3 breakpoints :
- **Mobile** ≤ 767px (1 colonne, BottomNav active, modaux fullscreen)
- **Tablette** 768–1023px (densité moyenne)
- **Desktop** ≥ 1024px

Attributs data utilisés par la CSS globale (cf. `Maintenant.html` + `Harmonize.css`) :
- `data-mn-grid="2|3|4|services|auto"` — grille auto-responsive
- `data-mn-card` — radius/shadow harmonisés
- `data-mn-hero` — adaptation titres
- `data-mn-section` — padding section
- `data-mn-page` — container page
- `data-mn-stack-mob` — flex-row → flex-col en mobile
- `data-mn-chips` — chips scrollables horizontalement
- `data-mn-modal` — modal fullscreen mobile
- `data-mn-no-print`, `data-mn-no-tap`, `data-mn-icon-btn` — opt-out règles globales

### Accessibilité (déjà couverte)
- Focus ring brand sur tous les interactifs (`:focus-visible`)
- Inputs ≥ 16px (no-zoom iOS) et ≥ 44px de hauteur sur mobile
- `prefers-reduced-motion` respecté
- `aria-label` requis sur les `<button>` sans texte

### Anti-patterns à éviter
- ❌ `borderRadius: '12px'` inline → utiliser `var(--mn-radius-md)` ou un token
- ❌ Emojis dans le code (📰 ✊ 🤝 etc.) → utiliser `ICONS.*` SVG. Le legacy en contient encore, à nettoyer.
- ❌ `<img>` sans `alt` (RGAA)
- ❌ Couleurs hexadécimales en dur → passer par `T.*`
- ❌ `scrollIntoView` → préférer `window.scrollTo`

---

## 6 · État des données

Toutes les données vivent dans `AppData.jsx` → `window.AppData` :
```js
AppData = {
  petitions, mobilizations, articles, housing, carpooling,
  lending, marketplace, garden, sel, crowdfunding, polls,
  campaigns, communes, members, posts, conversations, notifications
}
```

**Aucune persistance** sauf `localStorage` pour la page courante et l'utilisateur simulé.

---

## 7 · Migration prod recommandée

### 7.1 · Phase « techniquement viable »
1. **Bundle** : Vite + React + TypeScript. Conserver l'arborescence des fichiers JSX comme base, renommer en `.tsx`.
2. **Typage** : générer les types à partir des structures `AppData` (Zod ou similaire).
3. **Routing** : remplacer le `switch(page)` par `react-router` (`/petitions`, `/services/housing/:id`, etc.). Préserver les URLs pour SEO et partage social.
4. **State** : Zustand ou Context API pour `user`, `toast`, `auth`. Pas besoin de Redux.
5. **Styles** : conserver l'inline + le `Harmonize.css`. Migration progressive vers CSS Modules ou Tailwind si souhaité — pas urgent.
6. **Auth** : Supabase Auth ou Clerk (mail + magic link + OAuth). Mappez sur le `AuthModal` existant.

### 7.2 · Backend
Choix recommandé : **Supabase** (Postgres + Auth + Storage + Realtime + RLS).

| Table | Description |
|---|---|
| `users` | profil unifié, `t99cp_balance`, badges, adhésion |
| `petitions`, `signatures` | pétitions + signatures (1 user / 1 sign) |
| `mobilizations`, `participations` | actions + participants |
| `housing`, `housing_requests` | offres + demandes |
| `carpooling`, `lending`, `marketplace_items` | services |
| `garden_plots`, `sel_offers`, `sel_demands` | jardins + SEL |
| `crowdfunding_campaigns`, `contributions` | dons |
| `articles`, `comments`, `reactions` | média |
| `posts`, `post_likes`, `post_comments` | réseau social |
| `polls`, `poll_options`, `votes` | sondages |
| `campaigns`, `campaign_actions` | campagnes ciblées |
| `communes`, `commune_members` | communes libres |
| `conversations`, `messages`, `notifications` | messagerie |
| `members`, `adhesions`, `t99cp_transactions` | adhésion + monnaie |
| `admin_logs`, `email_campaigns` | admin |

**RLS** : règles ligne-par-ligne strictes. Voir §8.

### 7.3 · Stockage media
- Images uploadées (logements, marketplace, posts) → Supabase Storage avec CDN.
- Suppression du hotlink Unsplash : convertir `Refonte.jsx` en script de génération d'images de placeholder/seed initial.

### 7.4 · Email transactionnel
- **Postmark** ou **Resend** pour les confirmations, notifications, reset password.
- `AdminEmailsAPI.jsx` contient déjà la maquette de l'éditeur de campagne — connecter à l'API.

### 7.5 · Paiements
- **Stripe** pour adhésions (gratuit/soutien/engagé) et financement participatif.
- Webhooks → mise à jour `adhesions` et `contributions`.

### 7.6 · Realtime (optionnel mais conseillé)
- Messagerie, notifications, feed réseau social → Supabase Realtime (canal par utilisateur).

---

## 8 · Sécurité & RGPD (à NE PAS oublier)

- **RLS Supabase strict** : un utilisateur ne lit que ses propres données privées (messages, notifs, contributions).
- **CSRF** : géré par Supabase si on utilise les SDK officiels.
- **Sanitisation** : tout contenu utilisateur (posts, commentaires, descriptions) → `DOMPurify` côté front + escape côté SQL.
- **Bannière cookies** : pas encore présente, à ajouter (consent manager simple, pas de pub donc minimal).
- **Page RGPD** : déjà rédigée (`LegalPages.jsx` → `RgpdPage`). Vérifier conformité avec le DPO.
- **Données sensibles** : pas de carte bancaire en clair (Stripe Elements), pas de localisation précise sans consentement.
- **Modération** : prévoir un panneau admin pour les posts/commentaires signalés. Squelette existant dans `AdminMessagingNotifs.jsx`.

---

## 9 · Déploiement

### Hébergement recommandé
- **Frontend** : Vercel ou Netlify (build Vite, env vars Supabase).
- **Backend** : Supabase (managé, EU region pour RGPD).
- **DNS** : Cloudflare (proxy + WAF gratuit).

### CI/CD
- GitHub Actions : lint + typecheck + test + deploy preview sur chaque PR.
- Branche `main` → prod, `staging` → preview.

### Monitoring
- **Sentry** pour les erreurs JS.
- **Plausible** ou **Umami** pour les stats (RGPD-friendly, pas de cookies).
- Logs Supabase pour les requêtes.

### Variables d'environnement (à fournir au CI)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=  (serveur uniquement)
STRIPE_SECRET_KEY=          (serveur uniquement)
POSTMARK_TOKEN=             (serveur uniquement)
```

---

## 10 · TODO priorisé pour Claude Code

### Sprint 0 — Préparation (1 semaine)
- [ ] Migrer le repo vers Vite + React + TS, conserver l'organisation fichiers
- [ ] Configurer ESLint, Prettier, Vitest
- [ ] Initialiser Supabase + schéma DB (cf. §7.2)
- [ ] Configurer Stripe en mode test
- [ ] Mettre en place CI/CD GitHub Actions

### Sprint 1 — Auth & profil (1 semaine)
- [ ] Brancher Supabase Auth sur `AuthModal`
- [ ] Page profil — vrai utilisateur, vraies données
- [ ] Adhésion (3 tiers) avec Stripe
- [ ] Persistance T99CP balance

### Sprint 2 — Contenu militant (2 semaines)
- [ ] Pétitions : création + signature + compteur live
- [ ] Mobilisations : RSVP, partage, comptage participants
- [ ] Campagnes : regroupement multi-actions
- [ ] Sondages : votes membres uniquement, résultats live

### Sprint 3 — Services solidaires (2 semaines)
- [ ] Hébergement : annonces + demandes + messagerie
- [ ] Covoiturage : trajets + réservation
- [ ] Marketplace + Lending : annonces + transactions T99CP
- [ ] Jardins + SEL : offres/demandes locales

### Sprint 4 — Communautaire (1,5 semaine)
- [ ] Réseau social : feed, posts, médias, réactions, commentaires
- [ ] Messagerie : conversations 1-1, realtime
- [ ] Notifications : centre + email opt-in
- [ ] Média : articles, vidéos, podcasts, soumission lecteurs

### Sprint 5 — Admin & polish (1 semaine)
- [ ] Panel admin : modération, campagnes email, stats
- [ ] Communes libres : gestion locale
- [ ] Page contact connectée
- [ ] Optim SEO (meta, sitemap, Open Graph dynamique)
- [ ] Tests e2e (Playwright) sur les flows critiques

### Sprint 6 — Production (3 jours)
- [ ] Audit Lighthouse ≥ 95 sur toutes les pages clés
- [ ] Audit accessibilité (axe-core ≥ 95)
- [ ] Charge de test (k6) sur les endpoints critiques
- [ ] Bannière cookies conforme
- [ ] Documentation utilisateur (FAQ, guide modération)
- [ ] Mise en ligne

---

## 11 · Points d'attention spécifiques

### 11.1 · Nettoyage emojis (legacy)
Les fichiers `HomePage.jsx`, `PetitionsPage.jsx`, `HousingPage.jsx`, `MobilizationsPage.jsx`, `GardenSELCrowdfunding.jsx`, `MarketplacePage.jsx`, `CarpoolingPage.jsx`, `LendingPage.jsx`, `MediaPage.jsx`, `ProfilePage.jsx`, `CommunesLibres.v1.backup.jsx` (legacy) contiennent encore des emojis dans les boutons et badges (✊ 🏠 🚀 ✍️ etc.). `Refonte.jsx` les masque visuellement mais pas tous. **À supprimer du code source au profit des SVG `ICONS.*`** lors de la migration TS.

### 11.2 · Doublons legacy / nouvelles pages
Les pages historiques (`HomePage.jsx`, `PetitionsPage.jsx`, etc.) ont été remplacées par les `Pages_*.jsx`. **Supprimer les anciens** une fois la migration TS effectuée et la couverture vérifiée. Le `switch` dans `Maintenant.html` pointe déjà sur les nouvelles versions.

### 11.3 · Tweaks panel
Le `Tweaks` (en bas à droite) est un outil de dev pour basculer entre utilisateurs simulés et pages. **À supprimer en prod** ou à mettre derrière un flag `?dev=1`.

### 11.4 · Images Unsplash
Tout le mapping image dans `Refonte.jsx` (200+ règles regex) est utile pour le seed initial mais doit être remplacé par de vraies images (libres de droit ou contribution communauté) avant la prod publique. Sinon : risque de blocage Unsplash + dépendance externe.

### 11.5 · T99CP (monnaie interne)
Référencée partout (`t99cp_balance` user) mais aucune logique de transaction. Décision produit nécessaire : monnaie virtuelle simple ou vraie blockchain ? Si simple → table `t99cp_transactions` (ledger append-only). Si blockchain → intégration `the99coinproject.org`.

### 11.6 · Réseau social
La page `ReseauPage.jsx` contient un feed avec posts, médias, réactions, commentaires. **Modération obligatoire** avant ouverture publique. Prévoir : signalement, masquage automatique sur N signalements, file de modération admin.

---

## 12 · Contacts & ressources

- Design system : `Theme.jsx`
- Données mock : `AppData.jsx`
- Maquette interactive : `app/Maintenant.html` (ouvrir dans navigateur)
- Charte visuelle : marque rose `#E11D74` + violet `#7C3AED`, typo Sora (titres) + Inter (corps)

---

**Dernière mise à jour** : 11 mai 2026
**Version prototype** : v2
