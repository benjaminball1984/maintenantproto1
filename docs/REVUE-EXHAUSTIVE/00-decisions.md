# Décisions de revue — Items à modifier / reporter / corriger

> Renseigné en cours de Phase 1. Chaque entrée correspond à une décision
> utilisateur sur un item de l'inventaire (cf. `01..04-*.md`).
>
> **Légende action** :
> - **FIX_NOW** — à corriger dans la PR de finalisation de la revue
> - **TODO_PROD** — à inscrire dans la checklist pré-prod (HANDOFF-PROGRESS.md)
> - **IGNORE** — décision explicite de ne rien faire (avec justification)
> - **DEMO** — placeholder volontaire pendant la phase démo

## AboutPage (`/about`)

### D-017 — `about.eyebrow` — low — wording — FIX_NOW
- **Avant** : « Qui sommes-nous »
- **Après** : « Le projet en quelques mots »

### D-018 — `about.h1` — — — OK
- Conserver « À propos de Maintenant ! ».

### D-019 — `about.hero.lead` — medium — wording — FIX_NOW
- **Supprimer** le lead du hero (« Maintenant ! est une association loi 1901 indépendante… »).

### D-020 — `about.team.*` (section entière) — medium — UX — FIX_NOW
- **Supprimer la section Équipe** : H2, disclaimer, et les 3 cartes équipier (Ben / Lilou / L'équipe bénévole).
- Implique de retirer tout le bloc `<section id="team">` + composant `TeamMemberCard` si seul à utiliser cette donnée.

### D-021 — `about.values.*` (section entière) — high — UX — FIX_NOW
- **Supprimer la section Valeurs intégralement** : H2 « Nos valeurs », lead « Cinq piliers… », et les 5 cartes (`value-1` à `value-5`).
- Implique de retirer le bloc `<section id="values">` + composant carte Valeur s'il n'est pas réutilisé ailleurs.

### D-022 — **TRANSVERSE / Architecture navigation** — high — IA — FIX_NOW
- **Déplacer la rubrique « Réseau social » dans l'espace « S'informer »**, aux côtés de **Sondages** et **Média**.
- Impact : `AppNav` (menu principal et footer), `HANDOFF.md` §IA, routing, sitemap, ariane.
- À répercuter sur **toutes les pages** où la taxonomie est mentionnée (Home « Nos outils », About si conservée, page Aide, etc.).

### D-023 — **TRANSVERSE / Adhésion plancher** — high — produit/RGPD — FIX_NOW
- **Adhésion libre à partir de 0 €** (et non plus « dès 1 € »).
- Impact : page Adhérer (formulaire, slider montant, libellés), Home (mentions « dès 1 € »), Footer, About si conservé, FAQ, CGU/mentions.
- Implique d'autoriser le montant **0 €** dans le pricing/Stripe (ou le retirer du flow paiement quand `montant = 0`).
- Vérifier wording RGPD : « adhésion gratuite » ↔ « adhésion à prix libre » selon contexte.

---

## Règles transverses

### D-T01 — Redirection globale `/decouvrir` → espaces thématiques — high — routing — FIX_NOW
Suite à D-016 (suppression de DecouvrirPage), **tout CTA ou lien interne pointant vers `/decouvrir`** doit être redirigé vers l'un des 4 espaces thématiques définis dans D-012 :
- **S'informer** (Média + Sondages)
- **Mobiliser** (Campagnes + Pétitions + Mobilisations)
- **S'entraider** (Marketplace + Ki prête tout + SEL + Jardin + Hébergement + Covoiturage)
- **Agir** (Adhérer + Communes Libres + Moments solidaires)

Le mapping précis (CTA → cible) sera défini par le contexte du CTA (ex. `about.cta.btn` « Découvrir le mouvement » → probablement « Agir » ou page d'accueil, à confirmer cas par cas).

Concernés à ce stade :
- `about.cta.btn` (à statuer en revue détaillée AboutPage)
- Footer (à statuer Phase 1)
- Toute autre occurrence à scanner via `grep -rn "/decouvrir"`.

---

## DecouvrirPage (`/decouvrir`)

### D-016 — `decouvrir.*` (page entière) — high — UX + routing — FIX_NOW
- **Supprimer intégralement la page `/decouvrir`** (composant `DecouvrirPage.tsx` + route + tests associés).
- Couvre les 6 sections : Identité, Hero, Mission, Comment ça marche, Les outils, Notre vision, Témoignages démo, Roadmap, CTA Rejoindre (≈ 50 items inventaire).
- À nettoyer en parallèle :
  - lien `Découvrir` dans `AppNav` (s'il existe)
  - lien `decouvrir` dans footer (à vérifier en Phase 1)
  - références dans Home : ancien `home.hero.cta-secondary` déjà supprimé (cf. D-005), s'assurer qu'aucun autre lien `/decouvrir` ne subsiste
  - redirection 404 ou `/about` si l'URL est partagée ailleurs ? — à statuer en passe finale.

---

## HomePage (`/`)

### D-001 — `home.h1` — high — wording — FIX_NOW
- **Avant** : « Maintenant ! Le pouvoir citoyen, à portée de clic. »
- **Après** : « Maintenant ! La voix des 99% »

### D-002 — `home.hero.eyebrow` — high — wording — FIX_NOW
- **Avant** : « La voix des 99 % » (intégré désormais dans le H1)
- **Après** : « S'informer, s'outiller, s'organiser, mobiliser, agir, s'entre aider, résister, ensemble. »
- Note : la position « eyebrow » est conservée (au-dessus du H1).

### D-003 — `home.hero.lead` — high — wording — FIX_NOW
- **Avant** : « Pétitions, mobilisations, services d'entraide, communes libres : la plateforme qui outille les citoyennes et citoyens pour peser ensemble. »
- **Après** : « Pour une vie digne et heureuse pour toutes et tous dans un monde vivable. Face aux oppressions systémiques nos luttes doivent devenir systémiques. »

### D-005 — `home.hero.cta-secondary` — medium — UX — FIX_NOW
- **Avant** : bouton « Découvrir » + IconShare → `/decouvrir`.
- **Après** : **supprimer** ce bouton secondaire du hero (la pétition à la une remplit le hero, cf. D-004).

### D-006 — `home.counters.title` (sr-only) — medium — accessibility — FIX_NOW
- Le H2 sr-only doit refléter le nouveau contenu du bloc compteurs (cf. D-007).
- Proposition : « Compteurs publics : signataires, abonnées à la newsletter, membres » (à valider en passe finale).

### D-007 — `home.counters.label` — high — UX + DB — FIX_NOW + TODO_PROD
**Refonte du bloc compteurs** :
- **Avant** : 4 compteurs (Signataires / Mobilisations en cours / Communes libres / T99CP émis), grands, dans le hero.
- **Après** :
  - 3 compteurs : **Signataires** · **Abonnées à la newsletter** · **Membres**
  - Styling : « plus petit avec le fond coloré dégradé » (encart compact sous le hero, avec le gradient `--mn-gradient`).
- Implications DB :
  - Compteur « Abonnées à la newsletter » → nouvelle table `newsletter_subscriptions` (ou similaire) + UI d'inscription publique.
  - Compteur « Membres » → vue / RPC sur `members` ou `users` (selon définition de « membre » à clarifier).
- À supprimer / déplacer : compteur **Mobilisations en cours**, compteur **Communes libres**, compteur **T99CP émis** (le T99CP reste sur `/transparence`).

### D-008 — `home.counter.signatures.label` — — — OK
- Conserver « Signataires » + IconPen.

### D-009 — `home.counter.mobilizations.label` + `home.counter.communes.label` + `home.counter.t99cp.label` — — — FIX_NOW
- **Supprimer les 3 compteurs de la home** (cf. D-007). Le T99CP reste accessible sur `/transparence` (à vérifier en Phase 1).

### D-010 — `home.actions.title` — — — implicite OK
- Le H2 « Ce que tu peux faire dès maintenant » reste (formulation à reconfirmer en passe finale si besoin).

### D-011 — `home.actions.lead` — medium — wording — FIX_NOW
- **Supprimer** le lead « Trois manières d'agir, ouvertes à toutes et tous, sans condition de revenu ni d'adhésion. ».

### D-013 — `home.action.*` (Pétitions, Mobilisations, Services) — — — FIX_NOW
- Rendus **obsolètes** par D-012 (refonte en 4 cartes thématiques). Toutes les chaînes `home.action.petitions.*`, `home.action.mobilizations.*`, `home.action.services.*` sont **supprimées** du code de la home.

### D-014 — `home.mission.*` — medium — wording + UX — FIX_NOW
- **Supprimer intégralement le bloc Mission** de la home : H2, paragraphe et CTA « Voir nos compteurs publics → ».
- La transparence reste accessible via la navigation principale (à vérifier en Phase 1).

### D-015 — `home.counters.loading` + `home.counters.error` — medium — UX + a11y — Bug (à diagnostiquer)
- Marqué comme **Bug** par l'utilisateur. Diagnostic à préciser :
  - placeholders « … » et « — » jugés peu lisibles ?
  - bouton retry manquant en cas d'erreur ?
  - skeleton/spinner attendu plutôt qu'une ellipse ?
  - annonce a11y incomplète ?
- À reclarifier en Phase 2 (analyse approfondie) avant correction.

### D-012 — `home.actions.cards` — high — UX + IA — FIX_NOW
**Refonte structurelle : passage de 3 cartes par feature → 4 cartes thématiques.**

| # | Titre | Renvoie vers (routes / pages) |
|---|---|---|
| 1 | **S'informer** | Média + Sondages |
| 2 | **Mobiliser** | Campagnes + Pétitions + Mobilisations |
| 3 | **S'entraider** | Marketplace solidaire + Ki prête tout + Système d'Échange Libre + Partage de surplus de jardins + Hébergement et colocation solidaire + Covoiturage solidaire |
| 4 | **Agir** | Adhérer + Communes Libres + Moments solidaires |

Notes :
- Wording exact des descriptions et icônes à statuer dans la PR de finalisation.
- Chaque carte mène probablement vers une **page d'index thématique** (à statuer : nouvelle page index ou menu déroulant ?).
- Implique de revoir `AppNav` (mégamenu thématique cohérent ?) — à traiter en `TODO_PROD` séparé.
- Supprime de fait : `home.action.mobilizations.*` (la pétition feature ne fait plus partie d'une carte dédiée mais d'un thème), `home.action.adherer.*` (rebasculé sous « Agir »).

---

### D-004 — `home.hero.cta-primary` — high — UX + DB — TODO_PROD
**Refonte structurelle du hero accueil** :
- **Avant** : bouton « Adhérer » + icône IconSpark → `/join`
- **Après** : remplacer le bloc CTA hero par une **pétition mise à la une**, avec :
  - photo
  - titre de la pétition
  - description
  - bouton « Signer la pétition »
- Sélection : **manuelle par un admin** (jamais automatique).
- Implications DB : nouvelle colonne `petitions.is_featured` (ou table de config) + UI admin dédiée.
- À garder en vue : fallback si la pétition est dépubliée / archivée.

