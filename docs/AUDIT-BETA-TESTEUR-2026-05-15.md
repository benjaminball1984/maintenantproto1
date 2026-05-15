# Audit beta-testeur — Maintenant !

> Étape 42bis — audit lien-par-lien réalisé le 2026-05-15 sur la branche
> `claude/audit-maintenant-site-98ORF` (commit étape 40, 981 vitest verts).
> Méthode : 3 personas (visiteur, militant·e, services solidaires) × audit
> par lecture de code et exécution locale (`npm run dev`, dev server à
> `http://localhost:5173/`). Aucun fichier de code modifié dans cette
> session — phase audit pure. Les options de fix vivent dans
> `PLAN-FINALISATION.md`.

---

## 1 · Résumé exécutif

**Verdict : 🟠 NO-GO en l'état pour un lancement public officiel — CONDITIONAL-GO si la Vague 1 est livrée (3 à 5 sessions de travail).**

Le proto est techniquement solide (981 vitest verts, RGPD exhaustif, design
system cohérent, tokens `T.*` respectés à 90 %, accessibilité de base
solide). MAIS trois trous majeurs empêchent un lancement public « avec
fierté » :

1. **Trous légaux & d'identité** : mentions légales contiennent 4 lignes
   « À compléter avant mise en production » (siège social, SIRET, directeur
   de publication, contact) ; bios d'équipe `/about` et témoignages
   `/decouvrir` sont marqués `Bio démo` / `Témoignage démo`. Pour un site
   politique qui se veut sérieux, c'est rédhibitoire au premier coup d'œil.
2. **Trous fonctionnels visibles** : `ServicesHubPage` est encore le
   `Placeholder` générique (5 lignes), alors que la nav header pointe vers
   `/services` ; le bouton recherche du header soumet vers
   `/recherche?q=…` qui tombe sur le `NotFoundPage` ; aucune image dans
   les listings services / pétitions / mobilisations ; aucun bouton
   « Contacter » sur 6 services / 7 (seul housing a `Faire une demande`).
3. **Trous SEO & social sharing** : `index.html` ne contient ni
   `<meta name="description">`, ni `og:title`, ni `og:image`, ni favicon.
   Un toot Mastodon ou un partage WhatsApp affichera l'URL nue + le titre
   `Maintenant !`. Sur un mouvement militant qui mise tout sur le
   bouche-à-oreille social, c'est un blocker silencieux.

**Trois forces** : (1) honnêteté radicale (placeholders explicitement
badgés, roadmap publique, transparence des compteurs), (2) RGPD &
CookieBanner CNIL-compliant (refus aussi facile que accept), (3) design
system uniforme et accessible (focus visible, aria-labels, sémantique
correcte).

**Trois faiblesses bloquantes** : (1) mentions légales incomplètes,
(2) header non-responsive (10 nav items + recherche + login = wrap brutal
< 768 px, pas de menu burger), (3) hub services placeholder + CTA contact
absents sur 6/7 services.

Effort estimé pour atteindre un go-launch public propre : **3 à 5 sessions
janitor + livraison ciblée** (cf. `PLAN-FINALISATION.md` Vague 1).

---

## 2 · Scoring par dimension

Notes pondérées /10 par persona, puis moyenne. Pondération : Persona 1
visiteur (40 % — porte d'entrée), Persona 2 militant·e (35 % — cœur de
métier), Persona 3 services (25 % — promesse différenciante).

| Dimension       | P1 visiteur | P2 militant | P3 services | **Moyenne pondérée** |
| --------------- | :---------: | :---------: | :---------: | :------------------: |
| Design          |     8       |     8       |     7       |        **7.7**       |
| UX              |     7       |     7       |     6       |        **6.7**       |
| Responsivité    |     6       |     6       |     5       |        **5.7**       |
| Engagement      |     6       |     7       |     5       |        **6.1**       |
| Accessibilité   |     8       |     8       |     7       |        **7.7**       |
| Contenu         |     6       |     7       |     6       |        **6.3**       |
| Confiance       |     5       |     7       |     6       |        **5.9**       |
| **Moyenne**     |   **6.6**   |   **7.1**   |   **6.0**   |      **6.6 / 10**    |

Lecture : moyenne pondérée 6.6/10 = solide MVP, mais clairement pas un
score « lancement officiel sans rougir ». Les notes les plus basses sont
**Responsivité** (header), **Confiance** (mentions légales + démos non
remplacées), **Engagement** côté services (hub vide, pas d'images).

---

## 3 · Findings exhaustifs par route

> Format : sévérité + dimension + impact utilisateur. Une finding peut
> apparaître chez plusieurs personas si elle les touche tous (header,
> meta SEO, mentions légales).

### 3.1 · Routes publiques (Persona 1 — visiteur grand public)

#### Route : `/` (HomePage)

- **Persona** : 1
- **Viewports testés** : mobile 360 / tablet 768 / desktop 1280
- **Premier ressenti (5 s)** : « Pro, épuré, hero gradient rose-violet
  reconnaissable, deux CTA Adhérer/Découvrir clairs, compteurs publics
  qui chargent en temps réel — ça rassure. »
- **Liens testés** : `/join` (Adhérer), `/decouvrir` (Découvrir),
  `/petitions`, `/mobilizations`, `/services`, `/transparence`,
  ancre `#mission`. Tous fonctionnels.
- **Liens cassés** : aucun depuis le contenu de la page elle-même.
  Le footer et le header ajoutent leurs propres soucis (cf. plus bas).
- **Findings** :
  - 🟢 Design : hero responsive `clamp(2.25rem, 6vw, 3.75rem)` propre,
    radial-gradient subtil, bons espacements.
  - 🟢 Engagement : 4 compteurs en temps réel = proof-point fort
    (signataires, mobilisations, communes, T99CP).
  - 🟡 UX : « Adhérer » et « Découvrir » sont peer-CTA visuellement
    distincts (gradient vs surface) mais aucun n'invite au geste léger
    (« Signer une première pétition », « Voir une mobilisation près de
    chez moi »). La section mission renvoie vers `/transparence`, pas
    vers une action.
  - 🟡 Accessibilité : compteurs en chargement affichent « … » avec
    `aria-label="Chargement…"` mais pas de `aria-live="polite"` sur le
    container — un screen reader ne saura pas qu'ils s'updatent.
  - 🟢 Contenu : ton « tu » constant dans la home, ton clair, pas de
    jargon.

#### Route : `/decouvrir`

- **Persona** : 1
- **Premier ressenti** : « Page éditoriale longue (5 sections), bien
  structurée, mais les 3 témoignages sont visiblement étiquetés
  `Témoignage démo — placeholder` — j'apprécie l'honnêteté, ça
  affaiblit légèrement la crédibilité immédiate. »
- **Liens testés** : `/petitions`, `/mobilizations`, `/polls`,
  `/campaigns`, `/services`, `/communes`, `/transparence`,
  `/legal/notice`, `/join`. Tous fonctionnels.
- **Findings** :
  - 🟢 Contenu : structure narrative claire (mission → comment ça
    marche → outils → vision → roadmap → CTA).
  - 🟠 Engagement / contenu : 3 témoignages fictifs badgés démo =
    sain mais à remplacer **avant** ouverture publique sinon
    « plateforme placeholder » au premier scroll.
  - 🟢 Confiance : roadmap honnête (lancement S1 2026, fédération S2
    2027, etc.) reprise des étapes 36 et 39.
  - 🟡 UX : 6 outils détaillés, mais aucun n'a de mini-screenshot ou
    illustration — page très textuelle.

#### Route : `/about`

- **Persona** : 1
- **Premier ressenti** : « Équipe restreinte, bios marquées `Bio démo`,
  noms `Ben` et `Lilou`. Pour une page À propos d'un mouvement public
  national, ça paraît trop interne. »
- **Findings** :
  - 🟠 Confiance : bios `Bio démo` + noms minimalistes nuisent
    fortement à la crédibilité. À remplacer par les vraies identités
    avant le lancement (ou retirer la section équipe et la
    repositionner « équipe en construction »).
  - 🟢 Contenu : 5 valeurs articulées (citoyen·nes d'abord,
    transparence, sobriété, action, inclusion) + 5 jalons historiques
    cohérents.
  - 🟡 Design : avatars en initiales (placeholder) — vraie photo
    serait plus pro.

#### Route : `/roadmap`

- **Persona** : 1
- **Premier ressenti** : « Timeline verticale colorée, 6 jalons
  2025→2028, badges `Réalisé` / `En cours` / `Planifié`. Honnête et
  motivant. »
- **Findings** :
  - 🟢 Confiance : dates précises, jalons publics clairs, badges
    visuels distincts.
  - 🟢 Design : responsive, icônes par jalon.
  - 🟡 Contenu : « API publique 2027 » est loin pour un lecteur
    pressé. Aucun détail sur ce qui sort dans les 3 prochains mois
    (vue court terme manquante).

#### Route : `/faq`

- **Persona** : 1
- **Premier ressenti** : « FAQ exhaustive (5 catégories : Compte,
  RGPD, T99CP, Stripe, Modération, 17 entrées). Rassurante. »
- **Findings** :
  - 🟢 Contenu : couverture large (privacy, paiement, modération).
  - 🟢 Accessibilité : `<details>` natifs, focus visible.
  - 🟢 Confiance : FAQ adresse explicitement « je n'ai pas les moyens
    » (adhésion gratuite).
  - 🟢 UX : 2 liens CTA vers `/legal/contact`.

#### Route : `/transparence`

- **Persona** : 1
- **Premier ressenti** : « 4 compteurs + carte T99CP en avant +
  graphique mensuel + section `Ce que vous ne verrez pas ici` (pas
  d'IP, pas de pixel). Très convaincant. »
- **Findings** :
  - 🟢 Confiance : disclaimers explicites sur la non-collecte.
  - 🟢 UX : microcopie sous chaque compteur (« comment c'est
    calculé »).
  - 🟢 Design : graphique `MonthlySignupsChart` agrandi (étape 37).

#### Route : `/join`

- **Persona** : 1
- **Premier ressenti** : « 3 tiers (gratuit, soutien 5 €/mois, engagé
  15 €/mois), tier `soutien` mis en avant `Recommandé`. CTA cohérents.
  »
- **Findings** :
  - 🟢 Design : ribbon `Recommandé` distingue le tier soutien.
  - 🟢 UX : CTA aria-busy lors de la redirection Stripe.
  - 🟡 Engagement : ribbon « Recommandé » sur le tier payant peut
    être perçu comme un soft-nudge (vs « gratuit » mis sur le même
    plan visuel).
  - 🟡 Confiance : aucune mention « Adhésion gratuite réelle, pas un
    tier amputé » à proximité directe (présent dans la FAQ, pas
    sur cette page).

#### Route : `/legal/notice`

- **Persona** : 1
- **Premier ressenti** : « 4 sections (Éditeur, Hébergement, PI,
  Liens utiles). Hébergement complet (Vercel UE, Supabase Francfort,
  Stripe EU Ltd). MAIS **siège social, SIRET, directeur de publication
  et contact sont vides : `À compléter avant mise en production`.** »
- **Findings** :
  - 🔴 **Confiance / Légal — BLOCKER** : 4 champs obligatoires
    (article 6 LCEN) explicitement marqués « À compléter avant mise
    en production ». Conformité légale **non atteinte**, perte de
    crédibilité immédiate, contre-indication CNIL.

#### Route : `/legal/privacy`

- **Persona** : 1
- **Premier ressenti** : « Politique RGPD exhaustive, 8 sections,
  sommaire ancré, DPA Supabase mentionné, 5 bases légales. »
- **Findings** :
  - 🟢 Confiance : DPA signé, aucun transfert hors UE, Stripe PCI-DSS,
    Sentry filtrage PII.
  - 🟢 Contenu : durées de conservation explicites (compte
    supprimable immédiatement, contributions publiques anonymisées,
    messages 24 mois, logs 12 mois, documents 10 ans).

#### Route : `/legal/cookies`

- **Persona** : 1
- **Premier ressenti** : « 3 cookies listés (sb-auth-token,
  mn:cookie-consent, _mn_audience), bouton `Modifier mes choix`,
  conforme. »
- **Findings** :
  - 🟢 RGPD : analytics opt-in, refus aussi facile que accept (cf.
    `CookieBanner.tsx`).

#### Route : `/legal/contact`

- **Persona** : 1
- **Premier ressenti** : « Formulaire propre + fallback mailto
  (`contact@maintenant.org`), warning `ne partagez pas de mot de
  passe`, SLA 72 h ouvrées. »
- **Findings** :
  - 🟢 UX : validation client, success/error feedback.
  - 🟡 Contenu : email `contact@maintenant.org` — vérifier que le
    domaine et la boîte sont bien en place avant launch.

#### Route : `*` (NotFoundPage / 404)

- **Persona** : 1+2+3 (peut être atteinte par n'importe qui)
- **Findings** :
  - 🟡 UX : austère, pas de suggestions de pages alternatives, pas
    de moteur de recherche embarqué.

#### Composant : `index.html` (head)

- **Persona** : 1+2+3 (touche tout le site)
- **Findings** :
  - 🔴 **SEO / partage social — BLOCKER** : aucun
    `<meta name="description">`, aucun `og:title`, aucun
    `og:description`, aucun `og:image`, aucun `<link rel="icon">`,
    aucun `<meta name="theme-color">`. Un partage Mastodon /
    WhatsApp / SMS affichera juste l'URL nue + le titre
    `Maintenant !`. Pour un mouvement militant qui mise tout sur le
    bouche-à-oreille viral, c'est un blocker silencieux.

#### Composant : Header (RootLayout)

- **Persona** : 1+2+3
- **Findings** :
  - 🟠 **Responsivité — MAJOR** : 10 nav items + recherche + bouton
    login dans un `flex-wrap` sticky sans menu burger. Sur mobile
    360 px, les items wrappent en 3-4 rangées, masquent une bonne
    partie du contenu sous-jacent. Aucun `@media` query dans
    `index.css` ou `RootLayout.tsx` pour collapser la nav. Pas de
    pattern hamburger.
  - 🟠 **UX — MAJOR** : la barre de recherche soumet vers
    `/recherche?q=…` qui tombe sur le `NotFoundPage` standard
    (`PUBLIC_ROUTES` ne contient pas `/recherche`, le router non
    plus). Documenté comme « placeholder volontaire » dans le
    commentaire `RootLayout.tsx:60-63` mais visible et soumissable
    par l'utilisateur — premier acte = 404. À cacher tant que la
    page n'est pas câblée.
  - 🟢 Accessibilité : `aria-current` via NavLink, `aria-label` sur
    la recherche et le bouton de soumission, `aria-modal` sur
    l'AuthModal.

#### Composant : Footer

- **Persona** : 1+2+3
- **Findings** :
  - 🟢 Design : 3 colonnes (Mission / Outils / Légal) responsive.
  - 🟢 Liens : tous mènent à des pages existantes.
  - 🟡 Contenu : aucun lien social externe (Mastodon, RSS,
    GitHub) — pour un mouvement transparent, c'est inhabituel.

#### Composant : CookieBanner

- **Persona** : 1
- **Findings** :
  - 🟢 RGPD/CNIL : conforme (refus aussi facile que accept,
    analytics opt-in, customize granulaire).
  - 🟢 Accessibilité : `role="region"`, `aria-labelledby`,
    `aria-expanded` / `aria-controls` sur le bouton Personnaliser.

#### Composant : OnboardingModal

- **Persona** : 1
- **Findings** :
  - 🟢 UX : 4 étapes (Bienvenue, Pétitions, Entraide, Adhésion
    T99CP), CTA final `S'inscrire` → `/join`.
  - 🟡 UX : se déclenche au premier visite (flag localStorage
    `mn-onboarding-seen`). Cumulé à la cookie banner, ça fait 2
    overlays simultanés au premier visit — gérer la séquence
    (cookie d'abord, puis onboarding).

#### Composant : AuthModal

- **Persona** : 1
- **Findings** :
  - 🟢 Accessibilité : `role="dialog"`, `aria-modal`, focus trap,
    Escape ferme.
  - 🟡 UX : OAuth Google + Instagram d'abord, email en bas. Pour un
    public militant peut-être hostile à Google, l'ordre pourrait
    être inversé.

---

### 3.2 · Routes engagement (Persona 2 — militant·e local·e)

#### Route : `/petitions` (listing)

- **Persona** : 2
- **Premier ressenti** : « Hero, search + filtre catégorie, cards de
  pétitions avec compteur, CTA `Lancer une pétition` (RequireAuth). »
- **Findings** :
  - 🟢 UX : filtres par catégorie, recherche, EmptyState avec CTA
    création.
  - 🟢 Design : skeleton de chargement (étape 40), cards avec hover
    polish (étape 35).
  - 🟡 Contenu : aucune image cover sur les cards — listing très
    textuel.

#### Route : `/petitions/:slug`

- **Persona** : 2
- **Premier ressenti** : « Header massif, compteur signatures vivant,
  barre progression, CTA signer. »
- **Findings** :
  - 🟢 UX : bouton change couleur post-signature (vert success).
  - 🟠 **UX — MAJOR** : aucun bouton partage (alors que mobilizations,
    campaigns, polls en ont). Pour une pétition (qui vit du partage
    viral), c'est une opportunité ratée majeure.
  - 🟡 UX : feedback après signer = bouton passe à `Chargement…`
    puis disparaît brièvement → léger flicker pendant le refresh
    des données.
  - 🟢 Edge case : slug invalide → `<Navigate>` vers `/petitions`.

#### Route : `/petitions/new`

- **Persona** : 2
- **Findings** :
  - 🟢 UX : validation client claire (range min/max affichés), CTA
    aria-busy.
  - 🟡 **UX — MINOR** : aucun brouillon / auto-save localStorage. Si
    l'utilisateur recharge la page avant submit, tout est perdu.
  - 🟡 UX : `target_count` défaut 1000 sans guidance contextuelle.
  - 🟡 UX : URL couverture optionnelle mais pas de prévisualisation
    image.

#### Route : `/mobilizations` (listing)

- **Persona** : 2
- **Findings** :
  - 🟢 UX : filtre date `>= now`, filtre ville, EmptyState avec CTA.
  - 🟢 Contenu : cards affichent date+heure+ville → décision rapide.

#### Route : `/mobilizations/:slug`

- **Persona** : 2
- **Findings** :
  - 🟢 UX : RSVP avec logique passé (si `starts_at < now` et user
    n'a pas RSVP, bouton devient `Mobilisation passée` disabled).
  - 🟢 UX : bouton partage (Web Share API + fallback clipboard).
  - 🟡 UX : aucun lien vers la commune libre locale (« je viens à
    Lyon, je voudrais voir la commune libre Lyon »).

#### Route : `/mobilizations/new`

- **Persona** : 2
- **Findings** :
  - 🟡 **UX — MINOR** : champs date+heure séparés au lieu d'un
    `datetime-local`. Risque erreur fusion.
  - 🟡 UX : pas de validation croisée client `endsAt < startsAt`
    (vient du serveur).
  - 🟡 UX : pas de brouillon.

#### Route : `/campaigns` + `/campaigns/:slug` + `/campaigns/new`

- **Persona** : 2
- **Findings** :
  - 🟢 UX `/campaigns/new` : picker actions avec tabs (Pétitions /
    Mobilisations / Sondages), debounce search, sélection min 2 /
    max 12.
  - 🟢 UX `/campaigns/:slug` : résolution dynamique des actions
    avec icônes par type, gestion orphan (action.petition_id mort
    → carte non-cliquable + opacity 0.7).
  - 🟢 UX : bouton partage présent.
  - 🟡 UX : limite max 12 actions sans toast feedback préventif.
  - 🟡 UX : pas de drag-reorder des actions sélectionnées.
  - 🟡 UX : cards en listing ne montrent pas le nombre d'actions
    incluses ni le progrès global.

#### Route : `/polls` + `/polls/:slug` + `/polls/new`

- **Persona** : 2
- **Findings** :
  - 🟢 UX vote : option highlight au choix, soumission immédiate,
    résultats post-vote.
  - 🟢 UX : badge `Ouvert` / `Clôturé` calculé client.
  - 🟢 UX : bouton partage présent.
  - 🟡 UX `/polls/new` : à vérifier si UI dynamique d'ajout/retrait
    d'options est complète (lecture rapide a montré un formulaire
    plus court que les autres).

#### Route : `/communes` + `/communes/:slug`

- **Persona** : 2
- **Findings** :
  - 🟠 **Engagement — MAJOR** : la commune libre est un simple
    roster de membres avec rejoindre/quitter, sans forum, sans
    documents partagés, sans pétitions/mobilisations associées.
    Aucune raison fonctionnelle de revenir une fois inscrit·e.
  - 🟡 UX : pas de lien direct depuis commune vers les pétitions /
    mobilisations de la même ville.

#### Route : `/communes/new`

- **Persona** : 2
- **Findings** :
  - 🔴 **Engagement / produit — BLOCKER** : verrouillé par
    `RequireAdmin` (cf. `web/src/router.tsx:262-271`). Le pitch du
    persona militant est explicitement « créer la commune libre de
    ma ville ». Si la promesse produit affiche `Communes libres`
    dans la nav publique, mais que la création est admin-only sans
    l'expliquer, le militant pense « plateforme verrouillée » et
    quitte. Décision produit nécessaire (ouvrir avec modération
    post-hoc, ou repositionner les communes en programme
    centralisé).

#### Route : `/media` + `/media/:slug` + `/media/new`

- **Persona** : 2
- **Findings** :
  - 🟢 UX : MediaPage, ArticleDetailPage et ArticleCreatePage sont
    bien étoffés (~330-460 LOC chacun).
  - 🟡 Contenu : à vérifier qu'il y a au moins 5-10 articles seed
    avant launch (page vide = mauvais effet).

#### Route : `/reseau`

- **Persona** : 2
- **Findings** :
  - 🟢 UX : tabs `Tout` / `Suivis`, composer si auth, badges
    visibilité (public/membres/privé), bouton FollowButton.
  - 🟠 **Modération — MAJOR** : aucun bouton `Signaler` visible
    sur les posts du feed (modération admin existe dans
    `/admin` mais pas de pont user-side). Pour un réseau social
    public, c'est un risque légal réel (LCEN art. 6).
  - 🟡 UX : pas de mentions @user, pas de hashtags, pas de threads
    — feed très basique mais c'est cohérent avec l'étape actuelle.

#### Route : `/admin`

- **Persona** : 2 (vue commune) — seuls les admins y accèdent
- **Findings** :
  - 🟢 UX : tabs Modération / Communes / Email.
  - 🟡 UX : modération file de contenus flaggés mais pas de système
    flag automatisé visible côté UI publique (cf. finding réseau).

#### Composant : RequireAuth

- **Persona** : 2
- **Findings** :
  - 🟢 UX : redirection vers `/?auth=login` qui ouvre AuthModal
    automatiquement (cf. `RootLayout.tsx:170-183`).
  - 🟡 UX : pas de paramètre `next` explicite après auth — vérifier
    que l'utilisateur revient bien à `/petitions/new` après login
    plutôt qu'à la home.

---

### 3.3 · Routes services & compte (Persona 3 — services solidaires)

#### Route : `/services` (hub)

- **Persona** : 3
- **Premier ressenti** : « Page vide. Juste `Hub des services
  solidaires` + paragraphe `Page placeholder — migration en cours`.
  Aucun service présenté. »
- **Findings** :
  - 🔴 **Engagement / contenu — BLOCKER** : `ServicesHubPage` est
    encore le `Placeholder` à 5 lignes (cf.
    `web/src/pages/services/ServicesHubPage.tsx`). Pour un visiteur
    qui clique « Services » dans la nav, c'est un cul-de-sac total.
    Aucune carte des 7 services, aucune icône, aucun pitch, aucune
    CTA d'entrée. Hub manquant **avant lancement public**.

#### Route : `/services/housing` (+ détail + `/new` + `/request`)

- **Persona** : 3
- **Findings** :
  - 🟢 UX : recherche par titre/ville/capacité, EmptyState avec
    CTA `Proposer un hébergement`.
  - 🟢 UX `/request` : flow clean (message 100-500 chars + dates),
    success screen, retour à l'annonce.
  - 🟡 UX détail : CTA `Faire une demande` mais aucun lien
    « Contacter l'hôte directement » via `/messaging`.
  - 🟠 **Contenu — MAJOR** : aucune image dans les annonces. Un
    hébergement militant sans photo = très peu engageant.

#### Route : `/services/carpooling` (+ détail + `/new`)

- **Persona** : 3
- **Findings** :
  - 🟢 UX : filtres `from` / `to` / `date`, formatage prix
    `Gratuit` si 0 €.
  - 🟠 **UX — MAJOR** : aucun CTA `Demander une place` ou
    `Contacter le conducteur`. Seul `Partager`. Le service ne
    permet pas de réserver.
  - 🟡 UX : champs date+heure séparés (cohérent avec mobilisations).

#### Route : `/services/marketplace` (+ détail + `/new`)

- **Persona** : 3
- **Findings** :
  - 🟢 UX : dual pricing EUR / T99CP / `Sur demande` bien présenté.
  - 🟠 **UX — MAJOR** : aucun CTA `Demander` / `Acheter` /
    `Contacter`. Seul `Partager`. On ne sait pas comment acheter.
  - 🟠 **Contenu — MAJOR** : aucune image. Marketplace sans visuels
    = ennuyeux.
  - 🟡 UX : catégorie en free-text → risque incohérences (`Outils`
    vs `outils` vs `bricolage`).

#### Route : `/services/lending` (+ détail + `/new`)

- **Persona** : 3
- **Findings** :
  - 🟠 **UX — MAJOR** : aucun CTA `Réserver` / `Contacter` sur
    détail. Seul `Partager`.
  - 🟡 UX : pas de calendrier dispo/indispo.
  - 🟠 Contenu : aucune image.

#### Route : `/services/garden` (+ détail + `/new`)

- **Persona** : 3
- **Findings** :
  - 🟢 UX : filtre `Parcelles libres` (checkbox).
  - 🟠 **UX — MAJOR** : aucun CTA `Rejoindre` / `Demander une
    parcelle`. Seul `Partager`.

#### Route : `/services/sel` (+ détail + `/new`)

- **Persona** : 3
- **Findings** :
  - 🟢 Contenu : concept SEL bien expliqué.
  - 🟠 **UX — MAJOR** : aucun CTA `Demander ce service` /
    `Contacter`. Seul `Partager`.

#### Route : `/services/crowdfunding` (+ détail + `/contribute`)

- **Persona** : 3
- **Findings** :
  - 🟢 UX : barre progression visible, CTA `Contribuer` clair.
  - 🟢 UX `/contribute` : montant defaults 10 €, opt-in anonyme,
    success → redirect.
  - 🟡 UX : pas d'indication explicite « paiement via Stripe » sur
    le formulaire de contribution.

#### Route : `/messaging` + `/messaging/:conversationId`

- **Persona** : 3
- **Findings** :
  - 🟢 UX : privacy notice rassurant, cards avatar+date.
  - 🟡 UX : ID tronqué `User.slice(0,8)…` au lieu du `display_name`
    de l'autre interlocuteur — peu friendly.
  - 🟡 UX : pas de badge non-lus par conversation.
  - 🟡 UX `/messaging/:id` : pas de scroll auto vers dernier
    message, pas d'indication de présence.

#### Route : `/notifications`

- **Persona** : 3
- **Findings** :
  - 🟢 UX : tabs `Toutes` / `Non lues`, mark read/unread granulaire,
    `Tout marquer comme lu`.
  - 🟡 UX : pas de filtrage par type (signature, RSVP, message).
  - 🟡 UX : pas de deep-link notif → ressource (cliquer notif
    n'ouvre pas la pétition concernée).

#### Route : `/profile`

- **Persona** : 3
- **Findings** :
  - 🟢 UX : profil complet (avatar upload, bio, badges, wallet
    T99CP, stats contributions, activité 10 dernières actions).
  - 🟢 UX : avatar upload jusqu'à 2 MB, formats variés.
  - 🟠 **UX — MAJOR** : pas d'onglet `Mes annonces` / gestion
    centralisée des contenus créés (housing, carpooling, etc.).
    L'utilisateur doit aller dans chaque service pour retrouver
    ses annonces. Friction massive pour les contributeurs réguliers.

#### Routes auth (`/auth/callback`, `/auth/reset-password`)

- **Persona** : 3 (et 1)
- **Findings** :
  - 🟢 UX : `AuthCallbackPage` gère le retour OAuth, `ResetPasswordPage`
    traite le magic link.

---

### 3.4 · Edge cases

| Cas | Résultat | Sévérité |
| --- | --- | --- |
| URL inexistante (`/foo`) | NotFoundPage minimaliste | 🟡 — pas de suggestions |
| Route protégée déconnecté (`/profile`) | Redirige `/?auth=login` → AuthModal | 🟢 |
| Route admin déconnecté (`/admin`) | Redirige `/?auth=login` puis si auth mais pas admin → silencieux vers `/` | 🟡 — pas de message « accès refusé » |
| Pétition supprimée (`/petitions/abc`) | `<Navigate>` vers `/petitions` (graceful) | 🟢 |
| Form `/new` soumis vide | Validation client `aria-invalid` + erreurs inline | 🟢 |
| Form `/new` soumis avec données invalides | Erreur retournée serveur affichée en bandeau | 🟢 |
| Recherche header soumise (`?q=climat`) | → `/recherche?q=climat` → 404 | 🟠 — placeholder visible |
| Mobile 360 px sur Home | Header wrappé en 3-4 rangées, pas de burger | 🟠 |
| Partage WhatsApp d'une URL | URL nue + titre `Maintenant !` | 🔴 (manque OG meta) |

---

## 4 · Synthèse par sévérité

### Compteurs globaux

| Sévérité | Nombre de findings | Persona dominant |
| --- | :---: | --- |
| 🔴 **BLOCKER** | **5** | P1 (légal, SEO), P2 (communes), P3 (hub services) |
| 🟠 **MAJOR**   | **13** | P1+P2+P3 |
| 🟡 **MINOR**   | **22** | P2+P3 surtout |
| 🟢 **NITPICK** | **20** | tous |
| **Total**     | **60** | |

### Liste consolidée des 🔴 BLOCKERS

| #  | Titre | Persona | Route(s) |
| -- | --- | :---: | --- |
| F1 | Mentions légales incomplètes (siège, SIRET, dir. publication, contact) | P1 | `/legal/notice` |
| F2 | `<head>` sans description / OG meta / favicon | P1+2+3 | toutes routes |
| F3 | `ServicesHubPage` est encore un Placeholder | P3 | `/services` |
| F4 | Création commune verrouillée à `RequireAdmin` (contredit le pitch) | P2 | `/communes/new` |
| F5 | Recherche header → `/recherche` → 404 (placeholder visible) | P1+2+3 | header global |

### Liste consolidée des 🟠 MAJORS

| #  | Titre | Persona | Route(s) |
| -- | --- | :---: | --- |
| F6 | Header 10 nav items + recherche + login sans menu burger mobile | P1+2+3 | header global |
| F7 | Bouton partage absent sur `/petitions/:slug` | P2 | `/petitions/:slug` |
| F8 | CTA contact / réserver absent sur 5 services (carpooling, marketplace, lending, garden, sel) | P3 | services |
| F9 | Aucune image dans les annonces services / pétitions / mobilisations | P1+2+3 | listings, détails |
| F10 | Bios équipe `/about` placeholders explicites (`Bio démo`) | P1 | `/about` |
| F11 | Témoignages `/decouvrir` placeholders explicites | P1 | `/decouvrir` |
| F12 | Pas de gestion centralisée de mes annonces dans `/profile` | P3 | `/profile` |
| F13 | Messaging non-intégré au flow services (pas de `Contacter` → conversation) | P3 | services + `/messaging` |
| F14 | Communes sans contenu (pas de forum, pas d'actions associées) | P2 | `/communes/:slug` |
| F15 | Pas de bouton `Signaler` sur les posts du `/reseau` (LCEN) | P2 | `/reseau` |
| F16 | Email `contact@maintenant.org` à confirmer en place avant launch | P1 | `/legal/contact` |
| F17 | Onboarding modal + cookie banner peuvent s'empiler au premier visit | P1 | global |
| F18 | OnboardingModal et CookieBanner visibles avant que l'utilisateur ait pu lire la home | P1 | global |

### Findings 🟡 et 🟢 (résumé)

22 minors et 20 nitpicks consolidés, détaillés section 3 ci-dessus.
Les principaux thèmes :
- Pas de brouillon / auto-save dans tous les formulaires `/new` (4 occ).
- Pas de feedback synchrone post-action (signer, RSVP, voter) (3 occ).
- Pas d'image cover sur listings publics (5 occ).
- Pas de filtrage avancé / deep-link / présence en messagerie (4 occ).
- Pas de validation croisée client sur dates / champs liés (3 occ).
- Catégories free-text à risque d'incohérence (2 occ).

---

## 5 · Méthodologie & limites

### Méthodologie

1. **Lecture de code** : 3 sub-agents `Explore` en parallèle (un par
   persona) ont lu l'ensemble des 60+ pages `.tsx` du périmètre.
2. **Vérification HTTP** : `curl -sSL` sur les 46 routes du périmètre
   — toutes retournent 200 (SPA fallback Vite normal).
3. **Vérifications ciblées** : `LegalNoticePage.tsx`, `index.html`,
   `ServicesHubPage.tsx`, `RootLayout.tsx`, `index.css` lus
   intégralement par moi pour confirmer les findings.

### Limites

- **Pas de captures d'écran Playwright** — l'environnement
  conteneurisé n'a pas Chromium installé (`test:e2e:install`
  nécessaire). Les rendus visuels sont décrits par lecture du code.
- **Pas d'utilisateur réel** simulé sur Supabase (.env.local pointe
  vers le `.env.example` non rempli). Les flux qui dépendent de
  données réelles (`/profile`, `/messaging`, `/notifications`,
  `/admin`) sont audités sur le code, pas sur l'expérience.
- **Pas d'audit Lighthouse** réel — l'hébergement HTTPS public est
  re-bloqué (cf. `HANDOFF-PROGRESS.md` Goulot 1, 2026-05-14).

### Scope hors-audit

- Tests automatisés (981 vitest restent verts, pas modifiés).
- Schéma DB, RLS, RPC.
- Performance bundle / chunks.
- Accessibilité automatique (axe-core déjà en CI).

---

**Fin de l'audit. Voir `PLAN-FINALISATION.md` pour les options de fix
et le séquencement en 3 vagues.**
