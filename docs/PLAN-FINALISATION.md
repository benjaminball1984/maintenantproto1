# Plan de finalisation — Maintenant !

> Compagnon de `AUDIT-BETA-TESTEUR-2026-05-15.md`. Pour chaque finding
> 🔴 / 🟠 de l'audit, ce document propose 2 à 3 options de fix avec
> effort, impact, risque de régression, tradeoff et recommandation par
> défaut. Suit un plan en 3 vagues, puis 6 arbitrages produit à valider
> par l'équipe.
>
> Critère de succès : en lisant ce document pendant 5 min, l'équipe peut
> (1) cocher les options à valider pour la Vague 1, (2) connaître la
> séquence des prochaines étapes, (3) trancher les arbitrages en fin de
> doc.

---

## Index des findings

5 BLOCKERS (F1 à F5), 13 MAJORS (F6 à F18). Numérotation reprise depuis
l'audit.

---

## Section A — Options de fix (BLOCKERS)

### Finding F1 — Mentions légales incomplètes

- **Sévérité** : 🔴 BLOCKER
- **Persona** : 1 (visiteur)
- **Route(s)** : `/legal/notice`
- **Diagnostic** : 4 champs légaux obligatoires (siège social, SIRET,
  directeur de la publication, contact) affichés littéralement « À
  compléter avant mise en production » dans le rendu public. Violation
  article 6 LCEN, perte de crédibilité immédiate. C'est un blocker
  juridique, pas un bug technique.

**Option A — Compléter avec les vraies données de l'asso** (Recommandée)

- Description : récupérer auprès de Ben/Lilou les 4 informations
  (raison sociale, n° de l'immatriculation, contact officiel) et les
  injecter dans `LegalNoticePage.tsx:50-65`.
- Effort : XS (≈ 30 min code, dépend du délai admin)
- Impact attendu : fort
- Risque de régression : faible (changement de strings statiques)
- Tradeoff : nécessite l'enregistrement officiel de l'association loi
  1901 si pas déjà fait. Bloque tant que les données ne sont pas
  fournies.

**Option B — Utiliser un siège social provisoire (domicile fondateur·rice ou domiciliation associative)**

- Description : domiciliation temporaire chez un·e fondateur·rice ou
  via une domiciliation associative (≈ 30 €/an). SIRET issu du dossier
  RNA. Directeur de publication = nom du président·e d'asso. Contact
  = email officiel `contact@maintenant.org`.
- Effort : S (1/2 j si le statut juridique est déjà déposé, sinon
  bloquant)
- Impact attendu : fort
- Risque de régression : faible
- Tradeoff : domicile personnel exposé publiquement (risque de
  doxxing pour un mouvement militant) si pas de domiciliation
  associative payante.

**Option C — Différer la publication des mentions complètes via une page « En cours d'enregistrement »**

- Description : remplacer les 4 lignes « À compléter » par une note
  « Association en cours d'enregistrement (juin 2026), informations
  complètes publiées dans les 30 jours. Contact provisoire :
  contact@maintenant.org ».
- Effort : XS (≈ 15 min code)
- Impact attendu : moyen (transparent mais pas conforme LCEN)
- Risque de régression : faible
- Tradeoff : non-conformité LCEN persiste, juste mieux assumée.
  À éviter si le launch est public (les 4 champs sont obligatoires
  selon le code de la consommation).

👉 **Recommandation par défaut : Option A** — c'est la seule conforme.
Si bloquée par le délai d'enregistrement de l'asso, basculer Option B
avec domiciliation associative (≈ 30 €/an, retire le risque de
doxxing).

---

### Finding F2 — `<head>` sans description / OG meta / favicon

- **Sévérité** : 🔴 BLOCKER (silencieux mais critique pour un mouvement
  qui mise sur le bouche-à-oreille social)
- **Persona** : 1+2+3 (toutes routes)
- **Route(s)** : `web/index.html`
- **Diagnostic** : `index.html` ne contient ni `<meta name="description">`,
  ni `og:title`, ni `og:description`, ni `og:image`, ni
  `<link rel="icon">`, ni `<meta name="theme-color">`. Un partage
  Mastodon / WhatsApp / SMS affichera juste l'URL nue + le titre
  `Maintenant !`. Pour un mouvement militant, c'est une perte sèche
  de viralité.

**Option A — Meta statiques globales dans `index.html`** (Recommandée)

- Description : ajouter dans le `<head>` :
  - `<meta name="description" content="...">` (mission en 1 phrase,
    150-160 chars).
  - `<meta property="og:title" content="Maintenant ! Le pouvoir
    citoyen, à portée de clic">`.
  - `<meta property="og:description" content="...">`.
  - `<meta property="og:image" content="https://.../og-image.png">`
    (image 1200×630 statique, à designer en parallèle).
  - `<meta property="og:type" content="website">`.
  - `<meta name="twitter:card" content="summary_large_image">`.
  - `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`.
  - `<meta name="theme-color" content="#e11d74">`.
- Effort : S (1/2 j pour le code + design d'une OG image hero
  réutilisable + favicon SVG)
- Impact attendu : fort (multiplicateur de partages)
- Risque de régression : nulle (additif)
- Tradeoff : meta statiques = mêmes pour toutes les pages. Pour
  l'instant suffisant.

**Option B — Meta dynamiques par route via `react-helmet-async`**

- Description : installer `react-helmet-async`, wrapper l'app dans
  `<HelmetProvider>`, ajouter `<Helmet>` dans chaque page avec sa
  propre `<title>`, `<meta description>`, `og:title`, `og:image`.
- Effort : M (1 j installation + propagation 60+ pages)
- Impact attendu : très fort (SEO + partages contextuels par
  pétition / mobilisation / commune)
- Risque de régression : faible (pattern bien rodé)
- Tradeoff : surcoût de maintenance, mais nécessaire pour les
  pages détail (« Sign #la-petition-XYZ » génère un share avec
  preview spécifique).

**Option C — Meta statiques d'abord (Vague 1) + meta dynamiques en Vague 2**

- Description : combinaison séquentielle. Vague 1 = Option A,
  Vague 2 = Option B (uniquement sur les pages détail à fort enjeu
  de partage : `/petitions/:slug`, `/mobilizations/:slug`,
  `/campaigns/:slug`, `/communes/:slug`).
- Effort : S puis M
- Impact attendu : fort puis très fort
- Risque de régression : faible
- Tradeoff : effort total réparti sur 2 sprints, déblocage immédiat
  du minimum vital.

👉 **Recommandation par défaut : Option C** — meta statiques pour
ouvrir la porte du lancement, puis itérer en Vague 2 pour les pages
détail.

---

### Finding F3 — `ServicesHubPage` est un Placeholder

- **Sévérité** : 🔴 BLOCKER
- **Persona** : 3 (services solidaires)
- **Route(s)** : `/services`
- **Diagnostic** : `web/src/pages/services/ServicesHubPage.tsx`
  retourne juste `<Placeholder title="Services" description="Hub des
  services solidaires." />`. Tout visiteur qui clique l'item
  `Services` du menu nav arrive sur une page vide avec « Page
  placeholder — migration en cours ». Premier acte = cul-de-sac.

**Option A — Hub minimaliste : 7 cards de services** (Recommandée)

- Description : remplacer le Placeholder par une page avec :
  - Hero court (h1 + lead, 2 lignes).
  - Grille de 7 cards (housing, carpooling, marketplace, lending,
    garden, sel, crowdfunding) avec icône `ICONS.*` + titre + pitch
    1 ligne + CTA `Accéder` → `/services/{nom}`.
  - Section RGPD/confiance (1 paragraphe : `tous les échanges sont
    privés, T99CP utilisable comme monnaie locale, aucune commission`).
- Effort : S (1/2 j)
- Impact attendu : fort
- Risque de régression : nulle (additif)
- Tradeoff : hub simple sans illustrations — itérable en Vague 2.

**Option B — Hub riche : cards + compteurs live + témoignages**

- Description : Option A + compteurs de chaque service (« 12
  hébergements offerts cette semaine », « 3 covoiturages pour la
  prochaine manif »), + 1 ou 2 vrais témoignages d'utilisateurs.
- Effort : M (1 j code + 1/2 j contenu)
- Impact attendu : très fort
- Risque de régression : faible (les compteurs nécessitent une RPC
  Supabase additive — déjà fait pour `/transparence`).
- Tradeoff : nécessite des données réelles dans la DB pour avoir un
  rendu honnête.

**Option C — Hub avec illustrations / images stylisées par service**

- Description : Option A + illustration ou photo libre de droits
  par service (Unsplash → Supabase Storage).
- Effort : M (1 j code + 1 j images)
- Impact attendu : très fort
- Risque de régression : faible
- Tradeoff : nécessite un parti pris graphique (illustrations
  vectorielles vs photos).

👉 **Recommandation par défaut : Option A** d'abord (débloquer le
launch), itérer Option B puis C en Vague 2-3.

---

### Finding F4 — Création commune verrouillée à `RequireAdmin`

- **Sévérité** : 🔴 BLOCKER (contradiction produit fondamentale)
- **Persona** : 2 (militant·e local·e)
- **Route(s)** : `/communes/new`
- **Diagnostic** : route protégée par `RequireAdmin` (cf.
  `web/src/router.tsx:262-271`). Le pitch produit (et le persona
  militant explicitement décrit dans le prompt : « je veux créer la
  commune libre de ma ville ») est en contradiction directe avec
  cette restriction. Décision produit nécessaire.

**Option A — Ouvrir la création à tout utilisateur authentifié, modération post-hoc admin** (Recommandée)

- Description : retirer `RequireAdmin` de la route, ajouter une
  colonne `communes.status` (`pending` / `approved` / `rejected`).
  Création par un user → status `pending`. Listing public ne montre
  que les `approved`. Admin voit les `pending` dans `/admin` →
  `Approuver` / `Rejeter`. Notification du créateur après décision.
- Effort : M (1 j code + migration DB additive)
- Impact attendu : très fort (débloque le pitch militant)
- Risque de régression : faible (migration additive, RLS à durcir
  pour ne montrer que `approved` aux non-admins).
- Tradeoff : charge de modération à organiser.

**Option B — Ouvrir la création librement, sans modération**

- Description : retirer `RequireAdmin`, pas de status. Toute
  création est immédiatement publique.
- Effort : XS (5 min)
- Impact attendu : fort
- Risque de régression : moyen (risque de spam, communes squat,
  doublons par ville).
- Tradeoff : ingérable à grande échelle, risque légal (LCEN art.
  6).

**Option C — Garder admin-only mais l'expliquer dans l'UI publique**

- Description : ajouter un bandeau sur `/communes` :
  « Les communes libres sont créées par l'équipe nationale. Vous
  voulez démarrer une commune ? Contactez-nous via [contact] ». Sur
  `/communes/new` (si jamais quelqu'un y arrive), même message.
- Effort : XS (1 h)
- Impact attendu : moyen (sauve la cohérence mais ne tient pas la
  promesse militante)
- Risque de régression : nulle
- Tradeoff : positionnement plus prudent, contradiction restante
  avec le pitch.

👉 **Recommandation par défaut : Option A** — c'est la seule qui tient
la promesse produit. Effort raisonnable, risque maîtrisable.

---

### Finding F5 — Recherche header → `/recherche` → 404

- **Sévérité** : 🔴 BLOCKER (UX, pas légal — mais visiteur premier
  acte = 404)
- **Persona** : 1+2+3
- **Route(s)** : header global → `/recherche?q=…`
- **Diagnostic** : la barre de recherche du header soumet vers
  `/recherche?q=…`, route inexistante. Tombe sur le `NotFoundPage`.
  Le commentaire `RootLayout.tsx:60-63` documente le placeholder mais
  l'utilisateur n'a pas accès à ce contexte.

**Option A — Cacher la recherche tant que la page n'est pas câblée** (Recommandée)

- Description : retirer le `<form role="search">` du header
  (`RootLayout.tsx:239-265`). Réintroduire quand `/recherche` sera
  implémenté.
- Effort : XS (5 min)
- Impact attendu : fort (élimine la 404 visible)
- Risque de régression : faible (pas de tests E2E sur la recherche
  globale)
- Tradeoff : retire un signal visuel de fonctionnalité — mais c'est
  préférable à une fonctionnalité cassée.

**Option B — Rediriger `/recherche?q=…` vers une page « Bientôt disponible »**

- Description : créer une route `/recherche` qui affiche « La
  recherche globale arrive bientôt ! En attendant, utilisez les
  filtres de chaque section. Liens vers /petitions, /mobilizations,
  etc. ».
- Effort : XS (30 min)
- Impact attendu : moyen (gère le cas mais n'apporte rien)
- Risque de régression : nulle
- Tradeoff : fonctionnellement décevant.

**Option C — Implémenter une recherche globale réelle**

- Description : page `/recherche` qui lance des requêtes sur
  pétitions / mobilisations / campagnes / sondages / communes / médias
  via Supabase full-text (`tsvector`). Affichage tabulaire.
- Effort : L (2-3 j code + migration index DB + tests)
- Impact attendu : très fort
- Risque de régression : moyen (full-text Postgres à valider
  performance, RLS à respecter)
- Tradeoff : effort hors Vague 1.

👉 **Recommandation par défaut : Option A** — débloquer immédiatement
en Vague 1, basculer Option C en Vague 3 (backlog UX phase 2).

---

## Section B — Options de fix (MAJORS)

### Finding F6 — Header non-responsive (10 nav items + recherche + login)

- **Sévérité** : 🟠 MAJOR
- **Persona** : 1+2+3
- **Route(s)** : header global, toutes routes
- **Diagnostic** : `RootLayout.tsx` utilise `flex-wrap: wrap` sans
  `@media` queries ni menu burger. Sur mobile 360 px, les 10 items
  + recherche + login wrappent en 3-4 rangées, masquant le contenu
  utile sous-jacent.

**Option A — Menu burger mobile classique** (Recommandée)

- Description : ajouter un état `navOpen` qui collapse les nav items
  derrière un bouton burger (icône `IconMenu`) en dessous de 768 px.
  Le menu s'affiche en drawer overlay, refermable par Escape ou
  clic sur l'overlay.
- Effort : S (1/2 j code + tests)
- Impact attendu : fort
- Risque de régression : faible
- Tradeoff : un nouveau pattern d'UI à maintenir.

**Option B — Réduire le nombre d'items du nav header**

- Description : passer de 10 items à 5-6 (Pétitions, Mobilisations,
  Services, Réseau, Rejoindre). Les 4-5 autres (Campagnes, Média,
  Sondages, Communes) accessibles via un lien `Plus` dropdown ou via
  `/decouvrir`.
- Effort : XS (30 min)
- Impact attendu : moyen
- Risque de régression : moyen (perte de découvrabilité de 4 sections)
- Tradeoff : choix éditorial difficile.

**Option C — Combinaison : nav réduite (Option B) + burger mobile (Option A)**

- Description : Option B sur desktop, Option A pour le menu réduit
  encore en burger sur mobile.
- Effort : S + XS (1/2 j total)
- Impact attendu : très fort
- Risque de régression : faible
- Tradeoff : meilleur compromis UX desktop + mobile.

👉 **Recommandation par défaut : Option C** — combine simplification
desktop et burger mobile.

---

### Finding F7 — Bouton partage absent sur `/petitions/:slug`

- **Sévérité** : 🟠 MAJOR
- **Persona** : 2 (militant·e)
- **Route(s)** : `/petitions/:slug`
- **Diagnostic** : toutes les autres pages détail (mobilisations,
  campagnes, sondages, communes) ont un bouton partage utilisant Web
  Share API + fallback clipboard. Pétition = la page la plus virale
  par essence — l'absence est une perte sèche.

**Option A — Reprendre le composant share existant et le placer sur la pétition** (Recommandée)

- Description : extraire le pattern share déjà utilisé (Web Share API
  + clipboard fallback + toast) en composant `<ShareButton url=…
  title=… />` réutilisable, puis le placer dans `PetitionDetailPage`
  à côté du bouton signer.
- Effort : XS (1 h)
- Impact attendu : fort
- Risque de régression : nulle (additif)
- Tradeoff : aucune.

**Option B — Boutons réseaux sociaux dédiés (Twitter/X, Mastodon, WhatsApp)**

- Description : ajouter 3-4 boutons distincts vers les composer
  URLs des réseaux ciblés.
- Effort : S (1/2 j)
- Impact attendu : très fort
- Risque de régression : faible
- Tradeoff : multiplie les boutons, design à soigner.

👉 **Recommandation par défaut : Option A** — reprend le pattern
existant. L'Option B s'envisage en Vague 2.

---

### Finding F8 — CTA contact / réserver absent sur 5 services

- **Sévérité** : 🟠 MAJOR
- **Persona** : 3 (services solidaires)
- **Route(s)** : `/services/carpooling/:id`, `/services/marketplace/:id`,
  `/services/lending/:id`, `/services/garden/:id`,
  `/services/sel/:id`
- **Diagnostic** : seul housing a un flow `Faire une demande` propre.
  Les 5 autres services n'ont qu'un bouton `Partager`. Comment je
  réserve un covoiturage, achète un objet, emprunte un outil, demande
  une parcelle ou un service SEL ? Réponse aujourd'hui : pas via le
  produit.

**Option A — Bouton `Contacter` qui ouvre une nouvelle conversation `/messaging`** (Recommandée)

- Description : sur chaque détail service, ajouter un bouton
  `Contacter [proposeur·se]` qui crée une conversation avec
  l'auteur·rice de l'annonce et redirige vers
  `/messaging/:newConvId`. Si déjà une conv, redirection vers
  l'existante.
- Effort : M (1 j — fonction `getOrCreateConversationWith(userId)`
  + intégration dans 5 pages détail)
- Impact attendu : très fort (débloque le contact pour 5 services
  sur 7)
- Risque de régression : faible (pattern messaging déjà en place)
- Tradeoff : aucun.

**Option B — Pattern « request » par service (comme housing)**

- Description : créer une table `*_requests` par service, avec form
  dédié, status (pending/accepted/rejected), notification.
- Effort : L (2-3 j par service × 5 services = 2-3 semaines)
- Impact attendu : très fort
- Risque de régression : moyen (charge DB + RLS à dupliquer)
- Tradeoff : effort prohibitif pour Vague 1.

**Option C — Combiner : bouton `Contacter` Vague 1 (Option A) + flow `request` dédié Vague 2 pour les services à enjeu (carpooling/lending)**

- Description : Option A immédiat pour les 5 services. Option B
  ensuite pour carpooling et lending qui bénéficient d'un statut
  formel (réservation).
- Effort : M puis L
- Impact attendu : très fort
- Risque de régression : faible
- Tradeoff : meilleur séquencement.

👉 **Recommandation par défaut : Option A** pour Vague 1, puis
Option C en Vague 2 si nécessaire.

---

### Finding F9 — Aucune image dans annonces / pétitions / mobilisations

- **Sévérité** : 🟠 MAJOR
- **Persona** : 1+2+3
- **Route(s)** : listings et détails de presque tout
- **Diagnostic** : les services (housing, carpooling, marketplace,
  lending, garden, sel) n'ont pas de champ image. Pétitions et
  mobilisations ont un champ `cover_url` optionnel mais aucune
  prévisualisation. Marketplace sans photo = problème d'engagement.

**Option A — Ajouter champ `cover_url` à tous les services + upload Supabase Storage**

- Description : migration DB additive (`ALTER TABLE ... ADD COLUMN
  cover_url text NULL`), ajout d'un widget upload sur chaque
  formulaire `/new`, affichage de la cover dans listing + détail.
- Effort : L (2 j — migration + bucket storage + UI upload + display
  × 6 services)
- Impact attendu : très fort
- Risque de régression : faible (additif)
- Tradeoff : modération des images à organiser (porn / violence).

**Option B — Marketplace seul d'abord, autres en Vague 2** (Recommandée)

- Description : Option A appliquée uniquement à marketplace en
  Vague 1 (le service où l'absence d'image est la plus pénalisante).
  Les autres en Vague 2.
- Effort : M (1 j)
- Impact attendu : fort sur marketplace
- Risque de régression : faible
- Tradeoff : déphasage entre services.

**Option C — Pas d'upload image, juste champ URL externe avec preview**

- Description : champ `cover_url` rempli par l'utilisateur (URL
  externe), preview affichée. Pas de bucket storage. Risque
  d'images perdues / hotlink banni.
- Effort : S (1/2 j)
- Impact attendu : moyen
- Risque de régression : moyen (dépendance externes)
- Tradeoff : moins propre que l'upload mais beaucoup plus rapide.

👉 **Recommandation par défaut : Option B** pour Vague 1 (marketplace
en priorité), puis Option A pour les autres en Vague 2.

---

### Finding F10 — Bios équipe `/about` placeholders explicites

- **Sévérité** : 🟠 MAJOR
- **Persona** : 1
- **Route(s)** : `/about`
- **Diagnostic** : 3 cartes équipe avec noms minimalistes (« Ben »,
  « Lilou ») et badges `Bio démo` explicitement affichés. Honnête mais
  affaiblit la crédibilité immédiate.

**Option A — Remplacer par les vraies identités de l'équipe** (Recommandée)

- Description : récupérer noms complets, photos, bios de Ben/Lilou +
  bénévoles actifs, et remplacer le contenu démo dans
  `AboutPage.tsx`.
- Effort : XS (1 h dev + collecte contenu)
- Impact attendu : fort
- Risque de régression : nulle
- Tradeoff : nécessite que l'équipe consente à être identifiée
  publiquement (sensible pour un mouvement militant).

**Option B — Retirer la section équipe, repositionner « équipe en construction »**

- Description : supprimer les 3 cartes équipe. Ajouter un paragraphe
  « L'équipe se constitue, rejoignez-nous » avec lien vers
  `/legal/contact`.
- Effort : XS (15 min)
- Impact attendu : moyen
- Risque de régression : nulle
- Tradeoff : moins de réassurance sur la légitimité humaine du
  projet.

**Option C — Cartes équipe avec pseudonymes assumés (« le collectif fondateur »)**

- Description : garder le format mais expliciter « pour des raisons
  de sécurité, l'équipe communique sous pseudonymes. Vous pouvez
  nous contacter via [contact] ».
- Effort : XS (30 min)
- Impact attendu : moyen
- Risque de régression : nulle
- Tradeoff : peut paraître méfiant pour certains visiteurs.

👉 **Recommandation par défaut : Option A** si l'équipe est OK pour
l'identification publique, sinon Option C.

---

### Finding F11 — Témoignages `/decouvrir` placeholders explicites

- **Sévérité** : 🟠 MAJOR
- **Persona** : 1
- **Route(s)** : `/decouvrir`
- **Diagnostic** : 3 témoignages explicitement badgés `Témoignage
  démo — placeholder` (introduits étape 36 pour respect RGPD avant de
  vraies données).

**Option A — Remplacer par 3 vrais témoignages d'utilisateurs réels** (Recommandée)

- Description : recruter 3 utilisateurs (membres bénévoles, beta-
  testeurs) pour rédiger un témoignage court (50-80 mots) avec
  prénom + ville + rôle. Consentement RGPD écrit.
- Effort : S (1/2 j collecte) + XS (1 h dev)
- Impact attendu : fort
- Risque de régression : nulle
- Tradeoff : nécessite des utilisateurs réels existants.

**Option B — Retirer la section témoignages**

- Description : supprimer les 3 cartes. Ajouter un paragraphe
  « Vos retours seront publiés ici dès que la communauté grandira ».
- Effort : XS (15 min)
- Impact attendu : moyen
- Risque de régression : nulle
- Tradeoff : page un peu plus courte, perd un proof-point fort.

**Option C — Garder les témoignages démos sans le badge, mais avec mention « scénarios représentatifs basés sur les retours beta »**

- Description : retirer le badge `Témoignage démo`, ajouter une
  mention en pied de section.
- Effort : XS (15 min)
- Impact attendu : faible (limite de l'honnêteté)
- Risque de régression : nulle (pas de RGPD violé car pas de
  fausses identités)
- Tradeoff : moins transparent que B, peut paraître malhonnête.

👉 **Recommandation par défaut : Option A** si on a 3 utilisateurs
recrutables d'ici le launch, sinon Option B.

---

### Finding F12 — Pas de gestion centralisée de mes annonces dans `/profile`

- **Sévérité** : 🟠 MAJOR
- **Persona** : 3
- **Route(s)** : `/profile`
- **Diagnostic** : aucun onglet ou section « Mes annonces »
  rassemblant les contenus créés par l'utilisateur. Doit naviguer
  service par service pour gérer.

**Option A — Onglet `Mes contributions` dans `/profile`** (Recommandée)

- Description : ajouter une section dans `ProfilePage.tsx` listant
  toutes les ressources créées par l'utilisateur (pétitions,
  mobilisations, sondages, campagnes, annonces services), avec
  filtres par type et actions `Modifier` / `Supprimer` / `Voir`.
- Effort : M (1 j — N requêtes parallèles, agrégation, UI tabs)
- Impact attendu : fort
- Risque de régression : faible (queries existantes, pattern
  réutilisé d'`Activité récente`)
- Tradeoff : N requêtes peuvent ralentir la page profil.

**Option B — Bouton `Mes annonces` sur chaque page service**

- Description : sur `/services/housing`, `/services/carpooling`,
  etc., ajouter un toggle `Voir uniquement les miennes` (filtre
  par `created_by = auth.uid()`).
- Effort : S (1/2 j × 7 services = 3-4 j)
- Impact attendu : moyen
- Risque de régression : faible
- Tradeoff : décentralisé, friction (besoin d'aller dans chaque
  service).

**Option C — Hybride : Option B + raccourci dans `/profile`**

- Description : Option B + un bloc dans `/profile` listant les 7
  raccourcis vers chaque service en mode `Mes annonces`.
- Effort : M (1-1,5 j)
- Impact attendu : fort
- Risque de régression : faible
- Tradeoff : meilleur compromis UX.

👉 **Recommandation par défaut : Option A** — centralisation directe,
moins de navigation pour l'utilisateur.

---

### Finding F13 — Messaging non-intégré au flow services

- **Sévérité** : 🟠 MAJOR (lié à F8)
- **Persona** : 3
- **Route(s)** : services + `/messaging`
- **Diagnostic** : pour contacter quelqu'un suite à une annonce, il
  faut quitter le service et aller manuellement créer une conversation
  dans `/messaging`. Friction massive.

**Option A — Bouton `Contacter` qui crée la conversation et redirige** (cf. F8 Option A)

- Description : voir Finding F8 Option A. Cette option couvre F13
  par effet de bord.
- Effort, impact, risque, tradeoff : voir F8.

**Option B — Modal de message intégré au détail service**

- Description : bouton `Envoyer un message` ouvre une modale avec
  un textarea, soumission crée la conversation et envoie le 1er
  message sans naviguer.
- Effort : M (1 j)
- Impact attendu : très fort
- Risque de régression : faible
- Tradeoff : modale supplémentaire à designer.

👉 **Recommandation par défaut : Option A** (couvre F8 et F13
ensemble), Option B à envisager si l'UX modal s'avère plus naturelle
en test.

---

### Finding F14 — Communes sans contenu (pas de forum, pas d'actions)

- **Sévérité** : 🟠 MAJOR
- **Persona** : 2
- **Route(s)** : `/communes/:slug`
- **Diagnostic** : une commune libre = juste un roster de membres
  avec rejoindre/quitter. Aucune raison de revenir une fois inscrit.

**Option A — Lier les pétitions/mobilisations de la même ville à la commune** (Recommandée)

- Description : sur `/communes/:slug`, ajouter une section
  « Actions locales » qui liste les pétitions et mobilisations
  filtrées par `city = commune.city` ou `commune_id = communes.id`
  (selon décision DB). Cliquer une action ouvre la pétition /
  mobilisation.
- Effort : M (1 j — query agrégée + UI section)
- Impact attendu : fort (donne une raison de revenir, contextualise)
- Risque de régression : faible
- Tradeoff : nécessite décision : lien `commune_id` explicite sur
  pétitions/mobilisations OU filtre par ville (moins propre).

**Option B — Forum interne par commune (posts internes)**

- Description : ajouter une table `commune_posts` permettant aux
  membres d'une commune de poster des messages internes (private
  to commune members). UI tabbed dans `/communes/:slug`.
- Effort : L (2-3 j — DB + RLS + UI)
- Impact attendu : très fort
- Risque de régression : moyen (RLS commune-membership à valider)
- Tradeoff : effort hors Vague 1.

**Option C — Documents partagés par commune (uploads PDF/images)**

- Description : ajouter un bucket Storage par commune,
  permettre aux membres d'uploader/télécharger des PDF/images
  (statuts, comptes-rendus AG, etc.).
- Effort : M (1 j — bucket + UI + RLS)
- Impact attendu : fort
- Risque de régression : moyen (modération d'uploads à organiser)
- Tradeoff : nécessite décision sur stockage et RGPD.

👉 **Recommandation par défaut : Option A** pour Vague 2 (premier
contenu de commune), Option B en Vague 3.

---

### Finding F15 — Pas de bouton `Signaler` sur les posts du `/reseau` (LCEN)

- **Sévérité** : 🟠 MAJOR (légal)
- **Persona** : 2
- **Route(s)** : `/reseau`
- **Diagnostic** : aucun pont user → modération admin sur le réseau
  social interne. Risque LCEN art. 6 (obligation de mécanisme de
  signalement accessible).

**Option A — Bouton `Signaler` simple, crée une entrée dans `reports` table** (Recommandée)

- Description : sur chaque post du feed, bouton menu (3 dots) avec
  option `Signaler`. Modale de confirmation avec textarea
  (raison). Insert dans table `post_reports`. Admin voit dans
  `/admin → Modération`.
- Effort : M (1 j — UI + DB additive + RLS)
- Impact attendu : fort (conformité LCEN)
- Risque de régression : faible
- Tradeoff : nécessite migration additive et workflow modération.

**Option B — Lien `Signaler ce contenu` qui pré-remplit le formulaire de contact**

- Description : moins propre mais XS effort : un lien `Signaler ce
  contenu` ouvre `/legal/contact?subject=Signalement&ref=post:abc123`.
- Effort : XS (1 h)
- Impact attendu : moyen (LCEN partiellement couvert)
- Risque de régression : nulle
- Tradeoff : pas idéal pour un volume important.

👉 **Recommandation par défaut : Option A** — la conformité LCEN ne
peut pas attendre un workflow ad-hoc.

---

### Finding F16 — Email `contact@maintenant.org` à confirmer en place avant launch

- **Sévérité** : 🟠 MAJOR
- **Persona** : 1
- **Route(s)** : `/legal/contact`
- **Diagnostic** : le fallback mailto pointe vers
  `contact@maintenant.org`. Si le domaine ou la boîte n'est pas
  configuré (DNS MX, alias Gmail/Postmark), les emails reçus se
  perdent.

**Option A — Vérifier la configuration DNS + boîte avant launch** (Recommandée)

- Description : tâche admin (hors code). Configurer MX records,
  alias inbox (Postmark, Gmail asso, ProtonMail), tester avec un
  email réel.
- Effort : XS (1 h tâche admin)
- Impact attendu : fort
- Risque de régression : nulle
- Tradeoff : aucune.

**Option B — Remplacer par l'email réel d'un fondateur le temps de configurer le domaine**

- Description : remplacer `contact@maintenant.org` par un email
  personnel temporaire, ajouter une note « Cet email sera remplacé
  par un alias officiel d'ici fin juin ».
- Effort : XS (10 min)
- Impact attendu : moyen
- Risque de régression : nulle
- Tradeoff : expose un email personnel.

👉 **Recommandation par défaut : Option A** — la boîte officielle est
indispensable pour la confiance.

---

### Finding F17 + F18 — Onboarding modal + cookie banner s'empilent au premier visit

- **Sévérité** : 🟠 MAJOR
- **Persona** : 1
- **Route(s)** : global
- **Diagnostic** : à la première visite, l'utilisateur voit
  simultanément la cookie banner (bottom) ET la modale onboarding
  (centre). Double interruption avant même de pouvoir lire la home.

**Option A — Séquencer : cookie banner d'abord, onboarding seulement après choix cookies** (Recommandée)

- Description : modifier `OnboardingModal.tsx` pour ne s'afficher
  que si `localStorage[mn:cookie-consent]` existe (donc choix cookie
  effectué). Empêche l'overlap.
- Effort : XS (30 min)
- Impact attendu : fort
- Risque de régression : faible
- Tradeoff : aucune.

**Option B — Désactiver l'onboarding modal par défaut, le déclencher uniquement via un CTA explicite**

- Description : retirer le déclenchement automatique
  `OnboardingModal`. Ajouter un bouton `Commencer la visite` dans
  la home pour le déclencher.
- Effort : S (1/2 j)
- Impact attendu : moyen (perd l'effet onboarding spontané)
- Risque de régression : faible
- Tradeoff : moins d'utilisateurs verront l'onboarding.

**Option C — Combiner cookie banner + onboarding en une seule modale séquentielle**

- Description : modale unique qui présente cookies en step 1, puis
  onboarding en steps 2-5.
- Effort : M (1 j)
- Impact attendu : fort
- Risque de régression : moyen (refacto importante)
- Tradeoff : modale très longue.

👉 **Recommandation par défaut : Option A** — fix simple, effet
immédiat.

---

## Section C — Plan en 3 vagues

### Vague 1 — Must-fix avant lancement public (≈ 5 sessions)

**But** : éliminer les 5 BLOCKERS et les 8 MAJORS qui touchent
directement les parcours adhésion (P1) et création commune (P2).

| # | Finding | Option recommandée | Effort | Étape proposée |
| -- | --- | --- | :---: | --- |
| 1 | F1 — Mentions légales | A (compléter) | XS | étape 43 — Vague 1.A : conformité légale |
| 2 | F2 — Meta SEO/OG | C (statique en V1, dynamique en V2) | S | étape 43 — Vague 1.A |
| 3 | F5 — Recherche header → 404 | A (cacher la barre) | XS | étape 43 — Vague 1.A |
| 4 | F17/F18 — Empilement cookie + onboarding | A (séquencer) | XS | étape 43 — Vague 1.A |
| 5 | F3 — Hub services placeholder | A (7 cards minimal) | S | étape 44 — Vague 1.B : hub services |
| 6 | F8 — CTA contact 5 services | A (bouton Contacter → messaging) | M | étape 44 — Vague 1.B |
| 7 | F13 — Messaging non-intégré services | (couvert par F8 A) | — | étape 44 — Vague 1.B |
| 8 | F4 — Communes admin-only | A (modération post-hoc) | M | étape 45 — Vague 1.C : ouverture communes |
| 9 | F15 — Pas de signalement réseau (LCEN) | A (bouton + table reports) | M | étape 45 — Vague 1.C |
| 10 | F6 — Header non-responsive | C (réduire + burger) | S | étape 46 — Vague 1.D : responsive header |
| 11 | F7 — Partage absent pétitions | A (composant ShareButton) | XS | étape 46 — Vague 1.D |
| 12 | F10 — Bios équipe placeholders | A (vraies identités) | XS | étape 46 — Vague 1.D |
| 13 | F11 — Témoignages placeholders | A (vrais témoignages) | S | étape 46 — Vague 1.D |
| 14 | F16 — Email contact en place | A (config DNS) | XS | étape 47 — Vague 1.E : check launch |

**Estimation totale Vague 1** : ≈ **5 sessions de travail** (XS×6 +
S×4 + M×4) — peut être condensé à 4 sessions si l'équipe enchaîne.

**Ordonnancement par dépendances** :
- 43 (légal + SEO + cache search + séquençage modal) — indépendant.
- 44 (hub services + CTA contact) — dépend du pattern messaging
  (déjà OK).
- 45 (communes + signalement réseau) — implique 2 migrations DB
  additives (status communes, table post_reports) — demande
  confirmation explicite par CLAUDE.md.
- 46 (header responsive + share + équipe + témoignages) —
  indépendant.
- 47 (vérifications & launch checklist) — final.

### Vague 2 — Post-lancement immédiat (2 semaines)

**But** : écraser les 🟠 restants (F9 F12 F14) + les 🟡 critiques
sur les services (P3).

| # | Finding | Option recommandée | Effort |
| -- | --- | --- | :---: |
| 1 | F9 — Images annonces (étendre marketplace → autres services) | A | L |
| 2 | F12 — Onglet `Mes contributions` profil | A | M |
| 3 | F14 — Lier pétitions/mobilisations à commune locale | A | M |
| 4 | F2 — Meta dynamiques par route détail | B | M |
| 5 | Brouillons localStorage formulaires `/new` | (à arbitrer) | M |
| 6 | Catégories services en enum (vs free-text) | (à arbitrer) | S |
| 7 | NotFoundPage — suggestions de routes proches | (à arbitrer) | S |
| 8 | Validation client croisée dates startsAt/endsAt | (à arbitrer) | S |
| 9 | display_name vs ID truncated dans `/messaging` | (à arbitrer) | S |
| 10 | Filtres par type sur `/notifications` + deep-link | (à arbitrer) | M |

**Estimation totale Vague 2** : ≈ **6-8 sessions**.

### Vague 3 — Backlog UX phase 2 (≥ 1 mois)

**But** : 🟡 confort + 🟢 nitpicks pour atteindre un produit poli.

| # | Finding | Effort |
| -- | --- | :---: |
| 1 | F5 — Implémenter une vraie recherche globale (full-text Postgres) | L |
| 2 | F14 Option B — Forum commune interne | L |
| 3 | F14 Option C — Documents partagés par commune | M |
| 4 | F8 Option C — Flow `request` formel pour carpooling/lending | L |
| 5 | Drag-reorder actions campagne | S |
| 6 | Calendrier dispo/indispo lending | M |
| 7 | Mentions @user, hashtags, threads sur réseau | L |
| 8 | Présence en ligne / scroll auto messaging | M |
| 9 | Badge non-lus par conversation messaging | S |
| 10 | OG image dynamique par pétition (génération SSR ou edge function) | L |

**Estimation totale Vague 3** : ≥ **15 sessions** (selon priorités).

---

## Section D — Arbitrages produit à valider

> Ces 6 questions touchent à des choix produit que Claude ne peut pas
> trancher seul. Format `AskUserQuestion` prêt à poser à l'équipe.

### Q1 — Communes libres : qui peut en créer ?

- **Header** : Communes libres
- **Question** : Qui peut créer une commune libre sur Maintenant ! ?
- **Options** :
  1. (Recommandé) Tout adhérent·e authentifié·e, avec modération
     post-création par l'équipe nationale (status pending →
     approved/rejected).
  2. Tout utilisateur·rice authentifié·e sans modération (libre
     comme Mastodon — risque spam mais maximise l'adoption).
  3. Uniquement l'équipe nationale, avec un formulaire de demande
     publique (status quo + transparence sur le process).
  4. Adhérent·e avec parrainage de 3 autres adhérent·e·s déjà
     membres d'une commune (modération communautaire).

### Q2 — Mentions légales : siège social

- **Header** : Siège social asso
- **Question** : Quelle adresse de siège social affichez-vous dans
  les mentions légales ?
- **Options** :
  1. (Recommandé) Domiciliation associative payante (≈ 30 €/an,
     évite l'exposition d'un domicile personnel).
  2. Domicile d'un·e fondateur·rice (gratuit, mais expose à un
     risque de doxxing pour un mouvement militant).
  3. Une adresse partagée avec une autre association partenaire
     (gratuit, dépend d'un accord).
  4. Différer le launch jusqu'à la finalisation du dossier asso
     (3-4 semaines minimum).

### Q3 — Bios équipe sur `/about`

- **Header** : Bios équipe
- **Question** : Comment présentez-vous l'équipe sur `/about` ?
- **Options** :
  1. (Recommandé) Vraies identités avec photo, prénom, rôle, bio
     courte (3-4 lignes).
  2. Pseudonymes assumés avec mention explicite « pour des raisons
     de sécurité, l'équipe communique sous pseudonymes ».
  3. Retirer la section équipe et la remplacer par « L'équipe se
     constitue, rejoignez-nous ».
  4. Mix : 2-3 visages publics + mention « + une dizaine de
     bénévoles qui préfèrent rester anonymes ».

### Q4 — CTA hero home : équilibre adhérer / découvrir

- **Header** : CTA home
- **Question** : Quels CTA voulez-vous mettre en avant sur la home
  hero ?
- **Options** :
  1. (Recommandé) Statu quo : « Adhérer » (gradient) + « Découvrir »
     (outline) — équilibre engagement/exploration.
  2. Inverser : « Signer une pétition » (gradient) + « Adhérer »
     (outline) — premier acte plus léger, conversion à long terme.
  3. CTA unique « Voir une pétition près de chez moi » (gradient)
     — focus sur l'action concrète, retire la pression d'adhésion.
  4. 3 CTA : « Signer », « Adhérer », « Découvrir » — multiplie
     les portes d'entrée mais dilue le message.

### Q5 — Images dans les annonces services

- **Header** : Images annonces
- **Question** : Comment gérer les images dans les annonces services
  (housing, marketplace, lending, etc.) ?
- **Options** :
  1. (Recommandé) Upload via Supabase Storage avec modération admin
     (≈ 2-3 j de dev, propre et sécurisé).
  2. Champ URL externe + preview seulement (rapide ≈ 1 j, mais
     dépend du hotlink des utilisateurs).
  3. Pas d'images du tout (statu quo, mais marketplace stagne).
  4. Marketplace seul d'abord avec upload, autres services en V2.

### Q6 — Recherche globale `/recherche`

- **Header** : Recherche globale
- **Question** : Que faire de la barre de recherche du header tant
  que `/recherche` n'est pas implémentée ?
- **Options** :
  1. (Recommandé) La cacher complètement jusqu'à ce que la page
     soit câblée (Vague 3).
  2. Rediriger vers une page « Bientôt disponible » avec liens vers
     les sections pour l'instant.
  3. Implémenter la recherche full-text Postgres en Vague 1
     (effort L, retarde le launch).
  4. Garder la barre visible avec un placeholder « Recherche
     bientôt disponible » mais désactivée.

### Q7 — Témoignages `/decouvrir`

- **Header** : Témoignages
- **Question** : Que faire des 3 témoignages démo affichés sur
  `/decouvrir` ?
- **Options** :
  1. (Recommandé) Recruter 3 vrais utilisateurs (beta-testeurs ou
     bénévoles) pour des témoignages réels avec consentement RGPD.
  2. Retirer la section et la remplacer par « Vos retours seront
     publiés ici dès que la communauté grandira ».
  3. Garder les démos en retirant le badge `Témoignage démo` (moins
     transparent mais plus engageant).
  4. Garder les démos avec le badge actuel jusqu'à la collecte de
     vrais témoignages (statu quo).

### Q8 — Header navigation : nombre d'items

- **Header** : Items nav header
- **Question** : Combien d'items voulez-vous garder dans la nav
  header (desktop) ?
- **Options** :
  1. (Recommandé) 5-6 items principaux (Pétitions, Mobilisations,
     Services, Réseau, Rejoindre) + un dropdown `Plus`.
  2. Garder les 10 items actuels (Pétitions, Mobilisations,
     Campagnes, Services, Média, Réseau, Sondages, Communes,
     Rejoindre) + burger mobile.
  3. 3 items seulement (Agir, Entraide, S'informer) avec
     mega-menu hover.
  4. Pas de nav horizontale, juste un menu burger constant
     (toutes tailles d'écran).

---

**Fin du plan. Au lecteur : pour passer à la Vague 1, validez les
options recommandées (ou choisissez vos préférences via les
arbitrages Q1-Q8), puis ouvrez l'étape 43 selon le séquencement
proposé section C.**
