# 📋 Audit Maintenant ! — Document de passation entre sessions

> **À lire en premier dans la nouvelle session.** Ce document récapitule **toute la session d'audit** (méthodologie, décisions, modifications) et permet de reprendre proprement sans relire l'historique.

---

## 0. Comment reprendre dans une nouvelle session

```bash
cd /home/user/maintenantproto1
git status           # Doit être clean
git log --oneline -8 # Doit afficher les 4 commits "audit bloc ..."
git branch --show-current  # claude/refactor-for-review-7iBj8
```

**Première instruction à donner à Claude dans la nouvelle session :**

> Lis `/home/user/maintenantproto1/AUDIT-HANDOFF.md` en entier puis reprends le Bloc 3 (Pétitions) à l'étape 4 — refonte du composant `PetitionCard` selon les décisions Q1-Q12 documentées dans la section Bloc 3.

---

## 1. Demande utilisateur originale

L'utilisateur (Benjamin Ball) a demandé : *« peux tu reprendre ce code pour que l'on puisse refaire un passage en profondeur pour modifier page par page, fonctionnalité par fonctionnalité, fenêtre par fenêtre »* puis *« audit guidé ultra exhaustif et détaillé »*, *« ce n'est pas un problème que cela prenne plusieurs jours de travail »*.

**Méthode validée** : audit bloc par bloc, avec arbitrage utilisateur entre chaque bloc. Cosmétiques inclus (« Tout signaler »).

---

## 2. Branche & commits

**Branches** : travail historique sur `claude/refactor-for-review-7iBj8`, suite poussée sur `claude/review-audit-handoff-sAVU6` (toutes deux sur le remote `benjaminball1984/maintenantproto1`).

**Commits effectués pendant cette session** (du plus ancien au plus récent) :

| Hash | Bloc | Résumé |
|---|---|---|
| `e2cdb9f` | Bloc 1 R1 | Header/BottomNav/Footer — bugs purs + a11y minimum (15 correctifs) |
| `8c2a68f` | Bloc 1 R2 | Décisions Q2/Q5/Q6/Q7/Q8/Q9/Q10/Q11/Q13 (Communes gradient T99CP, mega-menu, footer enrichi, pages légales, …) |
| `b40ed3c` | Bloc 2 | Refonte HomePage complète selon Q1-Q11 (hero T99CP/noir, 3 stats, sections actu, services colorés, newsletter, T99CP blanc) |
| `ec23c94` | Bloc 3 étapes 1-3 | AppData enrichi (3 pétitions featured) + helpers Theme (`generateMockNames`, `getStatusTag`, `ShareModal`, `SignAnonymousModal`) + ce HANDOFF |
| `1121f7b` | Bloc 3 étapes 4-6 | Refonte PetitionCard + PetitionDetail + PetitionsPage selon Q1-Q12 — câblage helpers, signature anonyme, FAB mobile, search/tri étendus |
| `ff30699` | Bloc 4 | AppData mobs enrichi (5 mobs) + helpers `exportICS`, `ParticipateAnonymousModal` + refonte MobilizationsPage (Card + Detail + List) selon Q1-Q10 |
| _(à venir)_ | Bloc 5 | Refonte Crowdfunding : CFCard + CFFeaturedCard + CFDetailPage (modal → page) + CrowdfundingPage selon Q1-Q4 — tags statut dynamiques, similaires, ShareModal, FAB mobile |

---

## 3. Plan d'audit — 22 blocs

| # | Bloc | Fichier(s) | Statut |
|---|---|---|---|
| 1 | Globaux : Header (AppNav) + BottomNav + Footer | `Pages_Home.jsx:5-253`, `Maintenant.html` (footer + tweaks) | ✅ **Fait** (2 commits) |
| 2 | Home (HomePage) | `Pages_Home.jsx:255-440` | ✅ **Fait** (1 commit) |
| 3 | Pétitions (List + Card + Detail) | `Pages_Services.jsx:5-389` | ✅ **Fait** (2 commits — étapes 1-3 puis 4-6) |
| 4 | Mobilisations | `Pages_Media_Profile.jsx:441-...` (MobilizationsPage + extraction Card/Detail) | ✅ **Fait** (1 commit) |
| 5 | Cagnottes (crowdfunding) | `Pages_Commerce.jsx:253-871` (CFCard + CFFeaturedCard + CFDetailPage + CFCreateModal + CrowdfundingPage) | ✅ **Fait** (1 commit) |
| 6 | Sondages | `PollsPage.jsx` (1367 lignes) | ⏳ |
| 7 | Médias | `Pages_Media_Profile.jsx` | ⏳ |
| 8 | Réseau social | `ReseauPage.jsx` (635 lignes) | ⏳ |
| 9 | Campagnes | `CampaignPage.jsx` (1224 lignes) | ⏳ |
| 10 | Hub Services + CreerPage | `Pages_Home.jsx:442-...` | ⏳ |
| 11 | Commerce (SEL/Marketplace/Lending/Carpooling/Housing/Garden) | `Pages_Commerce.jsx` (1066 lignes) | ⏳ |
| 12 | Adhérer | `JoinMovement.jsx` | ⏳ |
| 13 | Communes Libres | `CommunesLibres.jsx` (1427 lignes) | ⏳ |
| 14 | Profil utilisateur | `Pages_Media_Profile.jsx` | ⏳ |
| 15 | Messagerie + Notifications | `AdminMessagingNotifs.jsx` | ⏳ |
| 16 | Admin Dashboard | `AdminEmailsAPI.jsx` + `AdminMessagingNotifs.jsx` | ⏳ |
| 17 | Modals globaux (Auth/Pay/Edit/Create + Share/SignAnon nouveaux) | `Theme.jsx` | ⏳ |
| 18 | Toast + Tweaks panel + App routing | `Theme.jsx` + `Maintenant.html` | ⏳ |
| 19 | Theme (tokens, UI kit) | `Theme.jsx` | ⏳ |
| 20 | Compat shims | `Compat.jsx` | ⏳ |
| 21 | Pages légales | `LegalPages.jsx` (créé Bloc 1) | ⏳ revue |
| 22 | Passe finale (copy + a11y générale + responsive) | tous fichiers | ⏳ |

---

## 4. Méthodologie d'audit (à respecter)

### 4.1 Format de chaque audit (5 sections)

Pour chaque bloc, produire **dans cet ordre** :

1. **CARTOGRAPHIE** — arborescence des composants en code-block ASCII avec `fichier:lignes`
2. **INCOHÉRENCES INTERNES** — table avec colonnes `# | Étiquette | Description | Ligne`. Étiquettes : `[BUG]`, `[DATA]`, `[A11Y]`, `[RESPONSIVE]`
3. **ÉCART vs INTENTION** — table avec étiquette `[BRIEF]` (vs décisions verrouillées)
4. **UX / DESIGN à arbitrer** — table avec étiquettes `[UX]`, `[COPY]`
5. **DÉCISIONS À PRENDRE** — questions Q numérotées avec options A/B/C/D

### 4.2 Application des décisions

- **⚙️ À fixer sans discussion** : bugs purs, dead code, incohérences évidentes — corriger sans demander
- **Q1, Q2, ...** : choix design ou UX qui appellent l'arbitrage utilisateur

### 4.3 Pose des questions

L'utilisateur a demandé **explicitement** d'utiliser le tool `AskUserQuestion` (boutons cliquables) — il a dit *« Peux tu refaire un système où je clique sur les différentes options, c'est beaucoup plus pratique pour moi pour les arbitrages »*.

**Format imposé** :
- Max 4 questions par appel (limite du tool)
- Batch logique (regrouper questions par thème)
- Toujours marquer la recommandation `(Recommandé)` dans le label
- Mettre la recommandation en première position
- Description claire de chaque option

### 4.4 Workflow de commit

Après arbitrage **complet** d'un bloc :
1. Implémenter toutes les modifs
2. `git add <fichiers>`
3. Commit avec message structuré (heredoc) : `audit bloc N — <résumé>` + détail par section
4. Push automatiquement avec `git push origin claude/refactor-for-review-7iBj8`
5. Mettre à jour le TodoWrite

---

## 5. Contexte verrouillé (à respecter sans rediscussion)

### 5.1 Palette T99CP (chats verrouillés)

```
brand:     '#E11D74'  // magenta vif (point central)
accent:    '#7C3AED'  // violet (côté gauche du gradient)
hue:       '#DC2654'  // rouge framboise (côté droit)
grad:      'linear-gradient(135deg, #7C3AED 0%, #E11D74 50%, #DC2654 100%)'
gradR:     'linear-gradient(to right, #7C3AED, #E11D74, #DC2654)'
gradSoft:  'linear-gradient(135deg, #F3EBFE 0%, #FDE9F2 50%, #FCE7EE 100%)'
```

Fond crème `#FAFAF9`, texte `#1A1A18`. **Pas de dark mode.**

Couleurs hub (différenciation par service dans le spectre violet→magenta→rouge) : voir `T.hub.*` dans `Theme.jsx:37-49`.

### 5.2 Vocabulaire (à respecter)

- **T99CP** : monnaie de l'écosystème. **1 T99CP = 1 € = 1 minute de travail**. 1h de service = 60 T99CP.
- **Polygon** : blockchain pour frais de port marketplace en T99CP.
- **adhérent·e / adhérent·es** : écriture inclusive obligatoire (point médian). Différent d'un simple *user*.
- **Commune Libre** : unité de base. 1 personne suffit pour créer ; **5+ minimum** pour envoyer un binôme à l'Assemblée.
- **Fédération** : 2+ communes voisines fédérées.
- **Confédération territoriale** : 2+ fédérations ou communes.
- **Assemblée Confédérale des Communes et Territoires Libres** : 2 chambres — Chambre des Communes (binômes élus) + Chambre du Tirage au Sort.
- **Campagne** : agrégation drag & drop de **1 à 12 services/fonctionnalités**.
- **SEL** : Système d'Échange Libre.
- **Ki Prête Tout** : nom du service de prêt entre particuliers.
- **the99coinproject.org** : site externe pour wallet — **toute action paiement y redirige**.

### 5.3 Décisions de design fortes (chats)

- Typographie : **Sora 800** pour titres, **Inter 400/600** pour corps.
- **Zéro emoji comme icône** (système SVG `ICONS.*`).
- Inscription en 1 clic : Google Connect / Insta Connect / email.
- Profil unifié transverse à tous les services.
- Paiements en T99CP **avec alternative obligatoire « Je préfère payer en euros »** + mention « le vendeur recevra ses T99CP envoyés par la plateforme ».
- Marketplace : frais de port en € si paiement €, en Polygon si T99CP.
- Prix affichés uniquement en T99CP, calculés sur prix marché − 45 %.
- **Mode admin global** : bouton « Modifier » sur **toutes** les publications.
- Wallet → redirection systématique vers `the99coinproject.org`.

### 5.4 Architecture du prototype

- **Pas de build** : HTML monopage avec React + Babel-standalone via CDN.
- 14 fichiers JSX dans `project/app/` chargés par `<script type="text/babel" src="...">` dans `Maintenant.html:245-265`.
- Chaque fichier .jsx déclare ses propres React hooks au top : `const { useState, useEffect, useRef } = React;`.
- Composants exposés sur `window.*` pour usage cross-fichier (ex: `window.HomePage = HomePage;`).
- Données dans `window.AppData` (12 collections + `defaultUser`).
- Persistance utilisateur : **localStorage uniquement** (pas de backend).

---

## 6. Détails de chaque bloc audité

### 6.1 BLOC 1 — Globaux (Header + BottomNav + Footer) ✅

**Audit** : 26 incohérences/bugs internes, 8 écarts vs intention, 14 points UX, 13 décisions à prendre.

#### ⚙️ Bugs corrigés sans arbitrage (commit `e2cdb9f`)

1. `navLinks` dead code supprimé (`Pages_Home.jsx:36`)
2. `navLinkStyle` doublons (padding/borderRadius qui s'écrasaient) nettoyés
3. Tautologie `'#FFD93D'==='#FFD93D'` corrigée
4. `bouton "Services"` desktop refactoré pour utiliser `navCommerce[0]`
5. Wallet T99CP redirige vers `https://the99coinproject.org` (target=_blank) au lieu de `/profile`
6. Filtre item "Admin" du dropdown profil quand `!user.is_admin`
7. Toggle "Mode admin" retiré du dropdown profil
8. Aria-labels sur cloche, chat, burger, FAB BottomNav, Avatar
9. `aria-expanded` sur burger
10. `role="menu"` + `role="menuitem"` sur dropdown profil et menu mobile
11. `aria-current="page"` sur tab BottomNav actif
12. Backdrop click-outside-to-close sur menu mobile
13. Copy unifié "VERROUILLÉ" → "ADHÉRENT·ES"
14. "Messages" → "Messagerie" (cohérence)
15. Footer `<span>` → `<a>` (focusables, sémantique)
16. Aria-label sur lien T99CP Wallet externe
17. Copyright "© 2026 THE99COINPROJECT" → "© 2026 Maintenant ! — La voix des 99%"
18. Tweaks panel : nouveau bouton "Adhérent·e" pour simuler `is_member=true`
19. Bouton Admin set `is_member: true` automatiquement
20. **JoinMovement.jsx** : ajout `setUser` en prop + propagation `is_member`/`member_tier`/`member_since` sur le user au step 4 (avant ce fix, le flow `/join` ne propageait JAMAIS l'adhésion — bug critique)

#### 🎨 Décisions Q-arbitrées (commit `8c2a68f`)

| Q | Choix utilisateur | Implémentation |
|---|---|---|
| **Q2** | Gradient T99CP pour Communes Libres (header + badge + mobile menu) | `Pages_Home.jsx` — bouton Communes en `T.gradR`, badge ADHÉRENT·ES en gradient |
| **Q5** | Rename "Connexion / Inscription" gradient + "★ Adhérer au mouvement" outline | `Pages_Home.jsx` |
| **Q6** | Chip orange discret dans le header (plus de barre permanente) | Suppression bandeau MODE ADMIN ligne 48-52, ajout chip dans Right block |
| **Q7** | Footer mobile compact (copyright + Mentions + wallet) | Restructure footer en 2 zones (top desktop / strip mobile), CSS `.mn-footer-top { display:none }` mobile |
| **Q8** | 4 pages stub : `/legal`, `/cgu`, `/rgpd`, `/contact` | Nouveau fichier `LegalPages.jsx` créé avec `LegalStubPage` générique + 4 composants spécifiques |
| **Q9** | 4 socials dans footer (Instagram, Mastodon, X, YouTube) | Section "Nous suivre" avec 4 logos + lien T99CP |
| **Q10** | Mega-menu Commerce desktop (7 entrées en grille 2 col) | State `commerceOpen`, ref + click-outside, panneau dropdown 540px |
| **Q11** | Tap targets 42px partout (cloche/chat) | Padding 8→12 |
| **Q13** | Pastille rouge sur Profil BottomNav si user connecté | BottomNav reçoit `user` prop, dot conditionnel sur tab Profil |

#### Bonus

- Ajout `garden` (Surplus Jardin) à `navCommerce` qui le manquait
- ContactPage avec formulaire fonctionnel (mock localStorage)
- Tweaks panel "Marie Dupont" mock a maintenant `is_member: false` explicite

---

### 6.2 BLOC 2 — Home (HomePage) ✅

**Audit** : 16 bugs/incohérences, 8 écarts brief, 15 points UX, 11 décisions.

#### Décisions Q-arbitrées (commit `b40ed3c`)

| Q | Choix utilisateur | Implémentation |
|---|---|---|
| **Q1** | 3 stats : Membres (946) + Abonnés newsletter (10583) + Signatures cumulées (live) | Avec hint contextuel par stat (`adhérent·es actif·ves`, `rendez-vous hebdomadaire`, `sur N pétitions actives`) |
| **Q2** | Hero 70vh (au lieu de 92vh) | `minHeight: '70vh'` |
| **Q3** | T99CP pur sur fond noir | `background: T.text1` + overlay `T.grad` opacity 0.78 |
| **Q4** | T99CP section blanche + accents gradient | `background: T.surface` + halo gradient subtil + H2 avec mots clés en `background-clip: text` gradient |
| **Q5** | Actu d'abord (Pétitions → Mobs → Cagnottes → Services → Média → Newsletter → T99CP) | Ordre des sections inversé |
| **Q6** | Ajouter Mobs + Cagnottes (3 cards chacun) | 2 nouvelles sections "Prochaines mobilisations" + "Cagnottes en cours" |
| **Q7** | Newsletter mi-page (avant T99CP) | Bandeau plein largeur fond `T.gradSoft`, form fonctionnel + écran confirmation + toast |
| **Q8** | CTA hero #2 → `/join` direct si déconnecté | `setPage('join')` au lieu de `onAuth()` |
| **Q9** | Cards en `<a>` (pas `<button>`, pas `<div onClick>`) | Toutes les cards passent en `<a href="#service">` avec preventDefault |
| **Q10** | Icônes colorées par service (palette `T.hub.*`) | Pastille 38px à fond `${color}1A` + icône en couleur |
| **Q11** | Skip copy hero (passe finale) | Baselines hero gardées tel quel |

#### ⚙️ Bugs corrigés en passant

- "Pétitions actives" calculait length total → filter status === 'active'
- latestMedia trié par date desc avant slice(0,3)
- Featured petitions : utilise `p.image` avec fallback robuste (plus de crash si 4e featured)
- T99CP grid mobile responsive
- Hero img : `loading="eager"` + `fetchpriority="high"`
- `e.stopPropagation()` sur bouton "Signer" interne aux cards
- `onMouseEnter`/`onMouseLeave` JS remplacés par CSS `.mn-card-hover` (a11y tactile)
- Nouveau CSS `.mn-card-hover` avec `:hover` et `:focus-visible` ajouté à `Maintenant.html`

---

### 6.3 BLOC 3 — Pétitions ✅ FAIT

**Audit** : 30 incohérences/bugs (PetitionDetail, PetitionCard, PetitionsPage), 7 écarts brief, 12 points UX, 12 décisions.

#### Décisions Q-arbitrées (12 questions, toutes implémentées)

| Q | Choix utilisateur | Implémentation | Statut |
|---|---|---|---|
| **Q1** | About = description + context + quote (3 champs optionnels AppData) | AppData enrichi + PetitionDetail tab About avec EmptyState fallback | ✅ |
| **Q2** | Updates : EmptyState si pas de data (au lieu de 3 mockés identiques) | `data.updates \|\| []` + EmptyState | ✅ |
| **Q3** | Comments : EmptyState + form fonctionnel (au lieu de 3 mockés identiques) | State + persist `mn_comments_pet_${id}` + bouton Publier | ✅ |
| **Q4** | Signataires générés par seed (déterministe par p.id) | `window.generateMockNames(data.id, 5)` câblé | ✅ |
| **Q5** | Adhésion → lien vers /join (au lieu de bouton inline qui duplique le flow) | 1 seul bouton « ★ En savoir plus sur l'adhésion » → `setPage('join')` | ✅ |
| **Q6** | Tags status colorés (active=success dot / won=gradient ✨ Victoire / closed=default Clôturée / archived=warning Archivée) | `window.getStatusTag(status)` câblé sur Card + Detail | ✅ |
| **Q7** | **CHANGEMENT MAJEUR** : <br>• Soutien T99CP **optionnel** par pétition (`p.support_enabled`) <br>• Signature SANS compte (email seulement) <br>• Signature 1-clic si user connecté <br>• Adhésion exige toujours un compte | `handleSignClick` route user/anon + `SignAnonymousModal` + bloc Soutien gated par `data.support_enabled` avec presets 5/10/20/50 T99CP | ✅ |
| **Q8** | Permalink #petitions/{id} + ShareModal multi-réseaux (X, Facebook, WhatsApp, Mastodon, Instagram) | `permalink = origin + pathname + #petitions/${id}` + ShareModal câblé | ✅ |
| **Q9** | Search dans tous les champs (titre + description + lieu + auteur + tags) | Filter sur `[title, description, location, author, ...tags]` | ✅ |
| **Q10** | Dropdown 4 tris : ✨ Plus pertinentes / Plus récentes / Plus de signatures / Bientôt clôturées | `<select>` + objet `sorters` + ordre canonique des catégories | ✅ |
| **Q11** | FAB bottom mobile pour bouton Signer (sticky en bas d'écran sur mobile) | Classe `.mn-petition-fab` (Maintenant.html, `@media max-width:767px`) + Btn rendu si `!signed` | ✅ |
| **Q12** | Bloc "Mêmes signataires" en bas du détail (3 cards) | 3 PetitionCards filtrées par catégorie + callback `onSelectPetition` | ✅ |

#### Modifications déjà faites (WIP non encore committé au moment de l'écriture du doc)

**`AppData.jsx`** — 3 pétitions featured enrichies (lignes 8-10 → 8-66 environ) avec :
- `image` (URLs Unsplash thématiques : hôpital, climat, manif sociale)
- `quote` (citation éditoriale par pétition)
- `context` (paragraphe complémentaire à description)
- `updates[]` (2-3 par pétition, dates réalistes)
- `comments[]` (2 par pétition, prénoms variés)
- `support_enabled` (true pour pet 1 et 2, false pour pet 3 — pour démontrer le toggle)

Pétitions 4-13 : non touchées. Les nouveaux champs seront `undefined` → traités en EmptyState par le code.

**`Theme.jsx`** — 4 helpers/composants ajoutés juste avant `useLocalStore` :

```js
window.generateMockNames(seed, count)  // génère N noms FR déterministes
window.getStatusTag(status)             // {variant, label, dot} mappé sur status
window.ShareModal(open, onClose, title, url, text)  // modal partage 5 réseaux + permalink
window.SignAnonymousModal(open, onClose, onSign, petitionTitle)  // signature email-only sans compte
```

#### ⏳ Étapes restantes pour finir Bloc 3

**Étape 4** : Refondre `PetitionCard` (Pages_Services.jsx:209-238) :
- Passer `<div onClick>` → `<a href="#petitions/{id}">` avec preventDefault
- Photo : utiliser `p.image` avec fallback dark gradient (style `cardPhoto` de HomePage)
- Supprimer `onMouseEnter`/`onMouseLeave` → utiliser className `mn-card-hover`
- Tag de status conditionnel via `window.getStatusTag(p.status)` (au lieu de tag hardcoded)
- Pas de regression sur le badge admin et UserBadge

**Étape 5** : Refondre `PetitionDetail` (Pages_Services.jsx:5-207) — c'est le **plus gros morceau** :

1. **Hero** :
   - Photo via `data.image` avec fallback dark gradient (plus d'URL Unsplash hardcoded `1573164713988-...`)
   - Tag de status conditionnel via `getStatusTag(data.status)` (plus toujours "Active")

2. **Tab About** :
   - Supprimer Lorem ipsum (ligne 89)
   - Supprimer citation hardcoded (ligne 91)
   - Afficher `data.description` toujours
   - Afficher `data.context` si présent (paragraphe complémentaire avec style éditorial)
   - Afficher `data.quote` si présent (bloc citation `T.brandLight` border-left, style déjà existant)
   - EmptyState si description vide (cas userCreated)

3. **Tab Updates** :
   - Utiliser `data.updates || []`
   - EmptyState si vide : "Aucune mise à jour pour le moment. L'auteur·rice publiera ici les avancées de la mobilisation."
   - Plus de mock global hardcoded

4. **Tab Comments** :
   - Utiliser `data.comments || []` au load
   - EmptyState si vide : "Soyez le·la premier·ère à laisser un commentaire."
   - Form fonctionnel (input + bouton submit) qui ajoute en localStorage par pétition (clé `mn_comments_pet_${id}`) — état React local + persist
   - Submit ajoute le commentaire en tête de liste avec nom de l'utilisateur connecté ou "Anonyme"

5. **Sidebar — bloc adhésion** :
   - Remplacer les 2 boutons "Adhérer gratuitement" + "Adhérer · 12 T99CP / an" par **1 bouton** "★ En savoir plus sur l'adhésion" → `setPage('join')`
   - Garder le bloc remerciement vert mais avec `T.successLight` / `T.success` (pas hardcoded `#DCFCE7`)
   - Garder le badge ★ ADHÉRENT·E si `user?.is_member` mais en gradient T99CP (`T.gradR`) au lieu du jaune `#FEF3C7`/`#B45309`

6. **Sidebar — bouton Signer (Q7)** :
   - Si user connecté : `<Btn>Signer cette pétition</Btn>` → `handleSign()` direct (1 clic)
   - Si user déconnecté : `<Btn>Signer cette pétition</Btn>` → ouvre `SignAnonymousModal`
     - `SignAnonymousModal` propriétés : `onSign={(formData) => { increment signature, persist en localStorage 'mn_sign_anon_pet_${id}', toast bienvenue }`
     - Persister la signature anonyme avec email pour ne pas re-signer (vérif au mount)

7. **Sidebar — bouton Soutenir (Q7)** :
   - **Conditionnel sur `data.support_enabled === true`**
   - Label : "Faire un don pour amplifier la campagne"
   - PayModal avec montants prédéfinis (5/10/20/50 T99CP) — actuellement amount fixe à 5

8. **Sidebar — Partager (Q8)** :
   - Bouton ouvre `ShareModal` avec `title={data.title}`, `url={window.location.origin + '#petitions/' + data.id}`, `text={data.title + ' — Maintenant !'}`
   - Pas juste copier l'URL home

9. **Bloc "Derniers signataires" (Q4)** :
   - Utiliser `window.generateMockNames(data.id, 5)` pour avoir 5 noms uniques par pétition
   - Garder le format actuel (avatar + nom + "il y a Xh")

10. **Bloc "Mêmes signataires" (Q12)** — NOUVEAU :
    - En bas de la page (après les 2 colonnes)
    - 3 cards de pétitions de la même catégorie (autres que la courante), random ou par date
    - Header : "Aussi signées par les militant·es de cette pétition"
    - Utilise PetitionCard simplifié

11. **FAB bottom mobile (Q11)** — NOUVEAU :
    - Sur mobile (`@media (max-width: 767px)`), afficher un bouton fixe `position: fixed; bottom: 80px; (au-dessus de la BottomNav 64px); right: 16px; left: 16px;`
    - Si `signed`, FAB caché ou remplacé par "✓ Signé"
    - Sinon, "Signer cette pétition" full-width gradient
    - CSS à ajouter dans `Maintenant.html` ou inline avec media query JS

12. **Permalink** :
    - Le `partager` doit copier `window.location.origin + '#petitions/' + data.id`
    - Bonus : à terme, gérer le hash dans le routing pour qu'on arrive direct sur la pétition

**Étape 6** : Refondre `PetitionsPage` (Pages_Services.jsx:240-300) :

1. **Search étendue (Q9)** :
   ```js
   const filtered = data.filter(p => {
     const ms = !search || [
       p.title, p.description, p.location, p.author,
       ...(p.tags || [])
     ].some(s => s && s.toLowerCase().includes(search.toLowerCase()));
     ...
   });
   ```

2. **Tri dropdown (Q10)** :
   - Ajouter state `sort` ('relevance' default | 'recent' | 'signatures' | 'closing')
   - Ajouter dropdown sous SearchInput (composant select natif ou custom)
   - Pour 'closing' : il faut un champ `p.deadline` ou `p.closes_at` qu'on n'a pas dans AppData → soit ajouter, soit filtrer "haut % atteint = bientôt clôturé"
   - Pour 'relevance' : combiner score (featured + signatures + recent)

3. **Catégories ordonnées** :
   - Au lieu de `[...new Set(data.map(p => p.category))]`, utiliser un ordre canonique :
     ```js
     const CAT_ORDER = ['Toutes', 'Santé', 'Écologie', 'Démocratie', 'Économie', 'Solidarité', 'Social', 'Justice', 'Transport', 'Logement', 'Droits', 'Éducation', 'Autre'];
     const cats = CAT_ORDER.filter(c => c === 'Toutes' || new Set(data.map(p => p.category)).has(c));
     ```

#### Format du commit Bloc 3 (à utiliser quand fini)

```
audit bloc 3 (pétitions) — décisions Q1-Q12 + signature anonyme

AppData (3 pétitions featured enrichies)
- Champs ajoutés : image, quote, context, updates[], comments[], support_enabled
...

Theme (4 nouveaux helpers/composants)
- generateMockNames(seed, count) : génère N noms FR déterministes
- getStatusTag(status) : map status → variant/label/dot
- ShareModal : partage permalink + 5 réseaux (X, FB, WhatsApp, Mastodon, Instagram)
- SignAnonymousModal : signature sans compte (email + nom + code postal optionnel)

PetitionCard
...

PetitionDetail
...

PetitionsPage
...

[Q7] Changement majeur de flow signature :
- Pas obligatoire d'être connecté pour signer (email seulement)
- Signature 1-clic si compte créé
- Adhésion exige toujours un compte
- Soutien T99CP optionnel par pétition (data.support_enabled)
```

---

### 6.4 BLOC 4 — Mobilisations ✅ FAIT

**Audit** : 23 incohérences/bugs, 5 écarts brief, 13 points UX, 10 décisions.

#### Décisions Q-arbitrées (10 questions)

| Q | Choix utilisateur | Implémentation | Statut |
|---|---|---|---|
| **Q1** | Garder layout 1 col actuelle (refactor inside) | Card extraite (`MobilizationCard`), `<a>` semantic, mn-card-hover | ✅ |
| **Q2** | Tri date proche d'abord + dropdown 4 options | `<select>` + `MOB_SORTS` (date_close / date_far / participants / relevance) | ✅ |
| **Q3** | Toutes mobs mélangées + tag « Passée » sur les anciennes | `isMobPast()` helper + `Tag variant="warning"` + opacity .78 sur cards | ✅ |
| **Q4** | Search étendue (titre + description + lieu + organisateur·rice + tags) | Filter sur tous les champs concaténés | ✅ |
| **Q5** | Participation 1-clic si connecté, sinon modal email-only sans compte | `handleJoinClick` + `ParticipateAnonymousModal` + persist `mn_join_anon_mob_${id}` | ✅ |
| **Q6** | Bouton « Contribuer » conditionnel sur `m.support_enabled` activé par le créateur + presets 5/10/20/50 T99CP | Bloc Contribuer affiché si `support_enabled`, picker amount + PayModal | ✅ |
| **Q7** | Enrichir 5 mobs avec image + context + quote (cohérence Bloc 3) | AppData : mobs 1-5 enrichies + tags + support_enabled (true sur 4/5) | ✅ |
| **Q8** | Bouton « Ajouter à mon agenda » export .ics sur détail | `window.exportICS(mob)` génère un fichier ICS RFC 5545 téléchargeable | ✅ |
| **Q9** | Bloc « Mobilisations similaires » en bas du détail (3 cards même type ou même ville) | Filter par type ou cityOf(location) puis slice(0, 3) | ✅ |
| **Q10** | Garder copy « Participer à cette mobilisation » | Pas de changement de wording sur le CTA | ✅ |

#### Bonus / cohérence Bloc 3

- ShareModal câblé sur le bouton Partager (permalink `#mobs/{id}`)
- FAB mobile : généralisation de `.mn-petition-fab` → `.mn-detail-fab` (réutilisable)
- Inclusivité : « organisateur·rice » partout (CreateModal + EditModal + détail)
- TYPE_COLOR enrichi : « Action directe » → `#DC2654` (avant : fallback brand)
- `_userCreated` UserBadge déplacé en `top: 10, left: 80` pour ne plus chevaucher AdminBtn
- Mob 6 : `organizer: "THE99COINPROJECT"` → `"Collectif Politique des 99%"`
- `EditModal` options synchronisées avec CreateModal (constante `MOB_FIELDS`)
- `EmptyState` quand aucun résultat (cohérence Bloc 3)
- `Tag variant="dark"` workaround supprimé → spans inline propres dans le hero
- CreateModal : nouveau champ `support_enabled` (Oui/Non)

#### Composants extraits

```
Pages_Media_Profile.jsx :
- MobilizationCard      (composant standalone, `<a>` + admin/userBadge)
- MobilizationDetail    (composant standalone, hero + stats + context/quote + CTAs + similaires + FAB)
- MobilizationsPage     (liste : search + tri + filter type)
```

#### Helpers globaux ajoutés (Theme.jsx)

```js
window.ParticipateAnonymousModal({ open, onClose, onParticipate, mobTitle, mobDate })
window.exportICS(mob)  // télécharge mobilisation-${mob.id}.ics au format RFC 5545
```

---

### 6.5 BLOC 5 — Cagnottes / Crowdfunding ✅ FAIT

**Audit** : 18 incohérences/bugs (CFCard, CFFeaturedCard, CFDetailModal, CrowdfundingPage), 4 écarts brief, 11 points UX, 4 décisions clés.

#### Décisions Q-arbitrées (4 questions)

| Q | Choix utilisateur | Implémentation | Statut |
|---|---|---|---|
| **Q1** | Page dédiée (cohérence Pétitions/Mobs) | `CFDetailModal` → `CFDetailPage` (modal → page route via `setDetail`) | ✅ |
| **Q2** | Compte requis pour donner (statu quo, pas de don anonyme) | `handleContribute` garde `if (!user) onAuth()` — pas de modal anonyme | ✅ |
| **Q3** | Tags statut visuels Atteint / Clôturée | `cfStatus()` helper : pct≥1 → ✨ Atteint (gradient), days_left≤0 → Clôturée (warning) | ✅ |
| **Q4** | Bloc « Cagnottes similaires » en bas | 3 cagnottes filtrées par catégorie OU organizer | ✅ |

#### Bonus / cohérence Bloc 3-4

- Cards (CFCard + CFFeaturedCard) : `<div onClick>` → `<a href="#cagnottes/{id}">` + `mn-card-hover` (suppression onMouseEnter/Leave JS)
- Tag `variant="warn"` (n'existe pas) → tag dynamique via `CF_CAT_VARIANT` (Luttes/Solidaires/Participatif/Grandes Caisses)
- `cfStatus()` helper exposé localement : pct≥100 → 'won' / days_left≤0 → 'closed' / sinon null
- Cover : fallback `picsum.photos/seed/...` aléatoire → fond `T.text1` + image opacity 0.92
- ShareModal câblé sur le détail (permalink `#cagnottes/{id}`, cohérence Bloc 3/4)
- FAB mobile `.mn-detail-fab` : « Contribuer · X T99CP » si !past
- Footer contribution : si past → message « Cagnotte clôturée » + remerciement contributeur·ices, sinon presets + bouton + mention frais
- Stats globales : `active` ne compte plus que les cagnottes avec `days_left > 0`
- Featured filtrées par catégorie (avant : ignorait le filtre)
- Search étendue : titre + description + organizer + category + story (avant : titre + description seulement)
- Cagnotte #2 organizer « THE99COINPROJECT » → « Camp Climat Larzac (collectif) »
- AdminBtn déjà preventDefault depuis Bloc 3 — fonctionne dans `<a>`
- EditModal : ajout du champ `cover` (URL de la cover) + sync de `detail` si l'item édité est ouvert

#### Composants extraits / refactorés

```
Pages_Commerce.jsx (cagnottes) :
- CFCard            (<a> + mn-card-hover + tag statut + variants par cat)
- CFFeaturedCard    (<a> + mn-card-hover + tag statut sur top-right + variants)
- CFDetailPage      (NEW — remplace CFDetailModal, page complète + ShareModal + similaires + FAB)
- CFCreateModal     (inchangé — wizard 4 steps)
- CrowdfundingPage  (search étendue + featured filtré + routing detail page)
```

#### Décisions techniques

- Statut calculé dynamiquement (pas de champ `status` ajouté à AppData) — formule pure
- Le footer contribution n'est pas dans une sidebar sticky (différent de PetitionDetail) car le contenu cagnotte est moins long et la consultation linéaire (story → fonds → équipe → updates) se prête mieux à un footer accumulé en bas
- Past est dérivé de `c.days_left <= 0` — pas de `Date` calc nécessaire
- `cfStatus` non exposé sur `window` (utilisé localement à Pages_Commerce.jsx)

---

## 7. Dette traçable (à traiter dans les blocs concernés)

| # | Item | Bloc cible |
|---|---|---|
| D1 | 2 occurrences `#FFD93D` jaune dans ServicesHub (`Pages_Home.jsx:688, 711`) — passer en gradient T99CP | Bloc 10 (Hub Services) |
| D2 | `defaultUser.petitions_signed: 8` mais badge `"Signataire ×10"` (incohérence dans `AppData.jsx:563-564`) | Bloc 14 (Profil) |
| D3 | Copy hero Home (baselines redondantes "oppressions systémiques", 6 verbes infinitifs) | Bloc 22 (passe finale copy) |
| D4 | Pétition `id: 8` IVG date `2025-11-12` (5 mois avant `currentDate`) avec 103 400 signatures — vraisemblance OK mais à noter | Bloc 14 ou data review |
| D5 | Sondage `pronostic-municipales-paris-2026` avec `closes` antérieur à `created` (`AppData.jsx:520-526`) | Bloc 6 (Sondages) |
| D6 | Ambiguïté nommage `image` vs `cover` entre collections AppData | Bloc 22 ou data refactor |
| D7 | URLs Unsplash hardcodées dans AppData.crowdfunding et AppData.polls (~30 URLs fragiles) | Bloc 5 et 6 |
| D8 | `defaultUser.petitions_signed` ne tient pas compte des signatures réelles en localStorage (`mn_join_petitions_signed`) | Bloc 14 |
| D9 | Pas de tri sur la plupart des listes (mobs, cagnottes, etc.) — à vérifier bloc par bloc | Chaque bloc |
| D10 | A11y des modals (`focus trap`, `Escape` pour fermer) | Bloc 17 (Modals) |
| D11 | Comments anonymes : devrait stocker email pour modération | À discuter, peut-être Bloc 17 |
| D12 | `ProfilePage` reçoit potentiellement `user === null` → afficher fallback (cf. audit Bloc 1 #22) | Bloc 14 (Profil) |

---

## 8. Pointeurs fichiers (carte rapide)

```
project/app/
├── Maintenant.html          : entry point + routing + CSS responsive + Tweaks panel + Footer
├── AppData.jsx              : window.AppData = 12 collections (petitions, mobs, ..., polls) + defaultUser
├── Theme.jsx                : design tokens T.* + UI kit + modals globaux + helpers (généreMockNames, getStatusTag, ShareModal, SignAnonymousModal, PayModal, AuthModal, EditModal, CreateModal, Toast, useLocalStore, addUserCreation, toggleUserJoin, isUserJoined)
├── Compat.jsx               : alias vers anciens noms (Badge→Tag, Progress→ProgressBar, T99→TokenDisplay, etc.)
├── Pages_Home.jsx           : AppNav (header) + BottomNav + HomePage + ServicesHub + CreerPage
├── Pages_Services.jsx       : PetitionsPage/PetitionCard/PetitionDetail + HousingPage/HousingCard/HousingDetail
├── Pages_Commerce.jsx       : SEL/Marketplace/Lending/Carpooling/Garden
├── Pages_Media_Profile.jsx  : MediaPage + ProfilePage
├── PollsPage.jsx            : Sondages (1367 lignes, gros)
├── ReseauPage.jsx           : Réseau social
├── CampaignPage.jsx         : Campagnes + Builder
├── CommunesLibres.jsx       : Communes Libres + Assemblée
├── JoinMovement.jsx         : Adhésion
├── AdminEmailsAPI.jsx       : Admin (Resend, API)
├── AdminMessagingNotifs.jsx : Admin + Messagerie + Notifications
└── LegalPages.jsx           : NEW (Bloc 1) — LegalStubPage + LegalPage + CguPage + RgpdPage + ContactPage
```

---

## 9. Tools utilisés

- `Read` (file_path obligatoire absolu)
- `Edit` avec `old_string` / `new_string` exacts (besoin de relire le fichier après chaque branche-Edit)
- `Bash` pour git, grep, find
- `Write` pour les nouveaux fichiers
- `TodoWrite` pour tracker progression (à maintenir au fur et à mesure)
- `AskUserQuestion` pour les Q-arbitrages **par batch de max 4** avec recommandation en première position
- `Agent` (subagents) pour audits volumineux ou recherches multi-fichiers (utilisé en début de session pour AppData inventory + chats summary)

---

## 10. Comment l'utilisateur communique

- Réponses souvent **très courtes** ("Bloc 2", "B", "ok continuons")
- Quand il veut détailler il le fait : voir Q7 du Bloc 3 où il a écrit un paragraphe explicatif
- Quand il veut cliquer sur des options : explicitement demandé via `AskUserQuestion`
- Quand il interrompt avec `[Request interrupted by user]` : prendre en compte sa nouvelle direction
- Style : tutoiement, accepte les recommandations sauf cas spécifiques

---

## 11. Reprise concrète de Bloc 3

**Première chose à faire** dans la nouvelle session après lecture de ce doc :

1. `git status` (vérifier clean)
2. `git log --oneline -5` (voir les 4 commits)
3. Lire les fichiers concernés :
   - `Pages_Services.jsx` lignes 5-301 (3 composants pétitions à refondre)
   - `Theme.jsx` lignes 498-700 environ (les helpers/modals déjà créés à utiliser)
   - `AppData.jsx` lignes 7-70 (les 3 pétitions featured enrichies)
4. Implémenter dans cet ordre :
   1. PetitionCard (court, ~30 lignes finales)
   2. PetitionDetail (long, ~250 lignes finales) — partir des 12 sous-tâches de l'Étape 5 ci-dessus
   3. PetitionsPage (moyen, ~80 lignes finales)
5. Vérifier syntaxiquement (`grep` pour résidus, `wc -l`)
6. Commit + push avec le format documenté section 6.3
7. Mettre à jour ce HANDOFF avec : `🟡 EN COURS` → `✅ Fait` pour Bloc 3
8. Demander à l'utilisateur s'il veut tester visuellement avant Bloc 4 ou enchaîner

---

## 12. À NE PAS FAIRE

- ❌ Ne pas démarrer un nouveau bloc sans avoir fini d'arbitrer le précédent
- ❌ Ne pas committer sans message structuré (heredoc avec sections)
- ❌ Ne pas re-discuter les décisions verrouillées (palette T99CP, vocabulaire, brief)
- ❌ Ne pas demander à l'utilisateur "le plan vous convient ?" — utiliser `ExitPlanMode` ou `AskUserQuestion` selon le contexte
- ❌ Ne pas perdre le ton concis du commit (l'utilisateur lit les commits sur GitHub)
- ❌ Ne pas oublier de pousser après chaque commit (`git push origin claude/refactor-for-review-7iBj8`)
- ❌ Ne pas mettre d'emojis dans le code sauf si l'utilisateur le demande (toast icons OK car il les a validés)
- ❌ Ne pas créer de docs markdown sans demande explicite — celui-ci est l'exception, c'est une demande explicite

---

_Document généré à la transition de session. À mettre à jour à chaque fin de bloc._
