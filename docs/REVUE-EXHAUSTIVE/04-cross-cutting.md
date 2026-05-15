# Inventaire — Cross-cutting (header / footer / modales / e-mails / rôles)

> Produit par sub-agent Explore Phase 0. Ne pas modifier — référence brute.

## Header & Navigation
**Fichier** : web/src/layouts/RootLayout.tsx

### Structure globale
- `header.sticky` — sticky header avec z-index: 10 (web/src/layouts/RootLayout.tsx:42-57)
- `header.fallback.loading` — texte « Chargement… » affiché pendant la suspension des routes (web/src/layouts/RootLayout.tsx:25)

### Logo & Branding
- *Aucun logo textuel ou image dans RootLayout — branding implémenté au niveau du CSS/design system*

### Navigation principale (baseNavItems) — web/src/layouts/RootLayout.tsx:29-40
- `nav.item.home` — libellé « Accueil » → `/` (line 30)
- `nav.item.petitions` — libellé « Pétitions » → `/petitions` (line 31)
- `nav.item.mobilizations` — libellé « Mobilisations » → `/mobilisations` (line 32)
- `nav.item.campaigns` — libellé « Campagnes » → `/campaigns` (line 33)
- `nav.item.services` — libellé « Services » → `/services` (line 34)
- `nav.item.media` — libellé « Média » → `/media` (line 35)
- `nav.item.network` — libellé « Réseau » → `/reseau` (line 36)
- `nav.item.polls` — libellé « Sondages » → `/polls` (line 37)
- `nav.item.communes` — libellé « Communes » → `/communes` (line 38)
- `nav.item.join` — libellé « Rejoindre » → `/join` (line 39)
- `nav.item.profile` — libellé « Profil » → `/profile` (ajouté si authentifié, line 210)
- `nav.item.admin` — libellé « Admin » → `/admin` (ajouté si admin, line 211)

### Recherche globale (web/src/layouts/RootLayout.tsx:239-265)
- `search.form.label` — texte caché « Rechercher » (line 246)
- `search.input.placeholder` — texte « Rechercher… » (line 251)
- `search.button.label` — aria-label « Lancer la recherche » (line 260)
- `search.submit.disabled` — bouton submit désactivé si query vide (line 261)
- Comportement : soumission redirige vers `/recherche?q={query}` (line 203) — la page est placeholder

### User Menu (authentifié) — web/src/layouts/RootLayout.tsx:267-297
- `usermenu.profile.button.label` — aria-label « Ouvrir mon profil » (line 278)
- `usermenu.profile.display.text` — affiche le `display_name` de l'utilisateur ou premier segment email ou fallback « Compte » (line 156-161)
- `usermenu.logout.button.text` — texte « Se déconnecter » (line 285)
- `usermenu.logout.button.label` — aria-label non explicite (line 283)

### Login Button (anonyme) — web/src/layouts/RootLayout.tsx:289-297
- `login.button.text` — texte « Se connecter » (line 295)
- `login.button.disabled` — désactivé pendant `status === 'loading'` (line 293)

---

## AuthModal
**Fichier** : web/src/components/AuthModal.tsx

### Wrapper & Accessibilité
- `auth.modal.overlay.role` — role="presentation" sur div overlay (line 354)
- `auth.modal.dialog.role` — role="dialog" aria-modal="true" (line 359)
- `auth.modal.dialog.labelledby` — aria-labelledby={titleId} (line 359)

### Modes de la modale (web/src/components/AuthModal.tsx:20, 22-27)
1. **Mode `login`**
   - `auth.modal.login.title` — titre « Connexion » (line 23)
   - `auth.modal.login.submit.text` — bouton « Se connecter » (line 30)
2. **Mode `signup`**
   - `auth.modal.signup.title` — titre « Créer un compte » (line 24)
   - `auth.modal.signup.submit.text` — bouton « Créer mon compte » (line 31)
3. **Mode `forgot`**
   - `auth.modal.forgot.title` — titre « Réinitialiser le mot de passe » (line 25)
   - `auth.modal.forgot.submit.text` — bouton « Envoyer le lien » (line 32)
4. **Mode `magic`**
   - `auth.modal.magic.title` — titre « Lien magique par email » (line 26)
   - `auth.modal.magic.submit.text` — bouton « M'envoyer le lien » (line 33)
   - `auth.modal.magic.helper.text` — descriptif « Entrez votre email : un lien de connexion vous sera envoyé sans mot de passe. » (line 429)

### Champs de saisie

**Email** (web/src/components/AuthModal.tsx:457-477)
- `auth.form.email.label` — texte « Email » en uppercase (line 458)
- `auth.form.email.placeholder` — texte « vous@email.fr » (line 472)
- `auth.form.email.required` — attribut HTML required (line 474)

**Nom (signup uniquement)** (web/src/components/AuthModal.tsx:433-454)
- `auth.form.name.label` — texte « Prénom & nom » en uppercase (line 436)
- `auth.form.name.placeholder` — texte « Camille Dupont » (line 449)
- `auth.form.name.required` — attribut HTML required (line 451)

**Mot de passe** (web/src/components/AuthModal.tsx:479-501)
- `auth.form.password.label` — texte « Mot de passe » en uppercase (line 481)
- `auth.form.password.placeholder` — texte « •••••••• » (line 494)
- `auth.form.password.required` — attribut HTML required (line 497)
- `auth.form.password.min-length` — minLength=8 en signup mode (line 495)
- `auth.form.password.autocomplete` — « current-password » (login) ou « new-password » (signup) (line 491)

### Fournisseurs OAuth

**Google** (web/src/components/AuthModal.tsx:383-391)
- `auth.oauth.google.button.text` — texte « Continuer avec Google » (line 390)
- `auth.oauth.google.button.disabled` — désactivé si submitting (line 386)

**Instagram** (web/src/components/AuthModal.tsx:392-400)
- `auth.oauth.instagram.button.text` — texte « Continuer avec Instagram » (line 399)
- `auth.oauth.instagram.button.disabled` — désactivé si submitting (line 394)

**Magic Link (dans login uniquement)** (web/src/components/AuthModal.tsx:401-410)
- `auth.oauth.magic-link.button.text` — texte « Lien magique par email » (line 409)
- `auth.oauth.magic-link.button.icon` — IconLink (line 408)

### Divider & Texte
- `auth.form.divider.text` — texte « ou par email » flanqué de règles (line 414)

### Messages d'erreur & succès

**Erreur** (web/src/components/AuthModal.tsx:370-374)
- `auth.message.error.role` — role="alert" (line 371)
- `auth.message.error.text` — affiche `errorText` retourné par `authErrorMessage()` (line 372)

**Succès** (web/src/components/AuthModal.tsx:375-379)
- `auth.message.success.role` — role="status" (line 376)
- `auth.message.success.text.signup` — « Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse. » (line 311)
- `auth.message.success.text.magic-link` — « Lien envoyé. Vérifiez votre boîte mail pour finaliser la connexion. » (line 318)
- `auth.message.success.text.forgot` — « Si un compte existe avec cet email, un lien de réinitialisation vient de partir. » (line 325-327)

### Navigation inter-modes

**Depuis login** (web/src/components/AuthModal.tsx:516-525)
- `auth.nav.signup.text` — bouton link « Créer un compte » (line 518)
- `auth.nav.forgot.text` — bouton link « Mot de passe oublié ? » (line 522)

**Depuis signup** (web/src/components/AuthModal.tsx:527-530)
- `auth.nav.login.text` — bouton link « Déjà inscrit·e ? Se connecter » (line 529)

**Depuis forgot** (web/src/components/AuthModal.tsx:532-535)
- `auth.nav.back.text` — bouton link « Retour à la connexion » (line 534)

**Depuis magic** (web/src/components/AuthModal.tsx:537-540)
- `auth.nav.back.text` — bouton link « Retour à la connexion » (line 539)

### Submit Button
- `auth.form.submit.text.normal` — « Se connecter », « Créer mon compte », etc. (line 512)
- `auth.form.submit.text.loading` — texte « Veuillez patienter… » (line 512)
- `auth.form.submit.disabled` — désactivé si submitting (line 505)

### Close Button
- `auth.modal.close.button.label` — aria-label « Fermer » (line 364)

---

## OnboardingModal
**Fichier** : web/src/components/OnboardingModal.tsx

### Wrapper & Accessibilité
- `onboarding.modal.overlay.role` — role="presentation" (line 260)
- `onboarding.modal.dialog.role` — role="dialog" aria-modal="true" (line 268)
- `onboarding.modal.dialog.labelledby` — aria-labelledby={titleId} (line 270)
- `onboarding.modal.dialog.describedby` — aria-describedby={descId} (line 271)

### Header
- `onboarding.modal.header.text` — texte « Découverte » (line 278)
- `onboarding.modal.close.button.text` — aria-label « Passer l'onboarding » (line 284)

### Étapes (4 étapes) — web/src/components/OnboardingModal.tsx:160-185

**Étape 1 : Welcome**
- `onboarding.step.1.icon` — IconSpark (line 162)
- `onboarding.step.1.title` — « Bienvenue sur Maintenant ! » (line 163)
- `onboarding.step.1.description` — « Une plateforme citoyenne sans publicité ni pistage, qui rassemble les outils pour reprendre la main sur les décisions qui nous concernent. » (line 164-165)

**Étape 2 : Pétitions & Sondages**
- `onboarding.step.2.icon` — IconPen (line 168)
- `onboarding.step.2.title` — « Pèse sur les décisions » (line 169)
- `onboarding.step.2.description` — « Lance ou signe des pétitions, vote sur des sondages locaux, coordonne des campagnes : les compteurs publics montrent la dynamique en temps réel. » (line 170-171)

**Étape 3 : Services d'entraide**
- `onboarding.step.3.icon` — IconFlame (line 174)
- `onboarding.step.3.title` — « Organise et entraide-toi » (line 175)
- `onboarding.step.3.description` — « Mobilisations, hébergement solidaire, covoiturage, prêt d'objets, jardins partagés : tout est gratuit et ouvert. » (line 176-177)

**Étape 4 : Adhésion & Mouvement**
- `onboarding.step.4.icon` — IconUsers (line 180)
- `onboarding.step.4.title` — « Rejoins le mouvement » (line 181)
- `onboarding.step.4.description` — « L'adhésion est libre dès 1 € symbolique. Tu reçois 1 jeton T99CP par adhésion — sans valeur monétaire, juste un marqueur d'engagement. » (line 182-183)

### Indicateurs (Dots)
- `onboarding.dots.group.role` — role="group" aria-label « Étape {index} sur {total} » (line 300-301)

### Navigation footer
- `onboarding.nav.skip.text` — bouton « Passer » (line 310)
- `onboarding.nav.next.text` — bouton « Suivant » (line 332)
- `onboarding.nav.signup.text` — lien « S'inscrire » (sur étape final seulement) (line 323)
- `onboarding.nav.signup.icon` — IconSpark (line 323)
- `onboarding.nav.signup.to` — lien vers `/join` (line 315)
- `onboarding.nav.back.text` — bouton « ← Revenir » (visible à partir de l'étape 2) (line 344)

### Comportement
- LocalStorage flag : `mn-onboarding-seen` (line 11, 233, 245)
- Auto-show : si flag absent au premier render (line 204)
- Fermeture : flag posé au skip, Escape, ou validation étape finale (line 233, 318)

---

## CookieBanner
**Fichier** : web/src/components/CookieBanner.tsx

### Header
- `cookies.banner.title` — texte « Cookies et confidentialité » (line 177)
- `cookies.banner.description` — « Nous utilisons des cookies strictement nécessaires au fonctionnement du site (session, sécurité) et, sur consentement, une mesure d'audience anonymisée. Aucun cookie publicitaire, aucun profilage. Vous pouvez modifier votre choix à tout moment depuis la page [cookies](/legal/cookies). » (line 180-184)

### Catégories de consentement

**Strictement nécessaires (toujours actif)** (web/src/components/CookieBanner.tsx:209-223)
- `cookies.category.essential.label` — « Strictement nécessaires » (line 216)
- `cookies.category.essential.description` — « Indispensables : session d'authentification, sécurité CSRF. Toujours actifs. » (line 219-220)
- `cookies.category.essential.input.disabled` — checkbox disabled (line 212)

**Mesure d'audience anonymisée (opt-in)** (web/src/components/CookieBanner.tsx:225-242)
- `cookies.category.analytics.label` — « Mesure d'audience anonymisée » (line 234)
- `cookies.category.analytics.description` — « Comptage agrégé des visites (pages vues, durée moyenne). Pas d'identifiant publicitaire, pas de partage avec des tiers. » (line 237-239)

### CTA
- `cookies.button.accept.text` — « Tout accepter » (line 189)
- `cookies.button.refuse.text` — « Tout refuser » (line 192)
- `cookies.button.customize.text` — « Personnaliser » (line 197)
- `cookies.button.customize.aria-expanded` — aria-expanded={customize} (line 197)

### Panneau personnalisation (optionnel)
- `cookies.customize.button.save.text` — « Enregistrer mes choix » (line 251)

### Rangement localStorage
- `consent.store.key` — localStorage « mn-consent »
- `consent.store.choice` — 'all' | 'essential' | 'custom'
- `consent.store.analytics` — boolean

---

## Footer
**Fichier** : web/src/components/Footer.tsx

### Wrapper & Meta
- `footer.year.text` — année dynamique `new Date().getFullYear()` (line 88)
- `footer.baseline.copyright` — « Maintenant ! — {year} » (line 147)
- `footer.baseline.claim` — « Plateforme citoyenne, sans publicité ni pistage. » (line 148)

### Section Mission
- `footer.mission.section.label` — aria-labelledby="footer-mission-title" (line 93)
- `footer.mission.title` — texte « Mission » en uppercase (line 94)
- `footer.mission.description` — « Maintenant ! rassemble les outils citoyens pour peser ensemble sur les décisions publiques : pétitions, mobilisations, services d'entraide, communes libres. » (line 97-100)
- `footer.mission.join.link.text` — lien « Rejoindre le mouvement → » (line 102)
- `footer.mission.discover.link.text` — lien « Découvrir » (line 106)
- `footer.mission.about.link.text` — lien « À propos » (line 111)

### Colonne Outils
- `footer.tools.title` — texte « Outils » en uppercase (line 118)
- `footer.tools.item.petitions` — lien « Pétitions » → `/petitions` (line 68)
- `footer.tools.item.mobilizations` — lien « Mobilisations » → `/mobilizations` (line 69)
- `footer.tools.item.campaigns` — lien « Campagnes » → `/campaigns` (line 70)
- `footer.tools.item.polls` — lien « Sondages » → `/polls` (line 71)
- `footer.tools.item.services` — lien « Services entraide » → `/services` (line 72)
- `footer.tools.item.media` — lien « Média » → `/media` (line 73)
- `footer.tools.item.communes` — lien « Communes libres » → `/communes` (line 74)
- `footer.tools.item.roadmap` — lien « Roadmap » → `/roadmap` (line 75)

### Colonne Légal
- `footer.legal.title` — texte « Légal » en uppercase (line 133)
- `footer.legal.item.privacy` — lien « Confidentialité » → `/legal/privacy` (line 79)
- `footer.legal.item.notice` — lien « Mentions légales » → `/legal/notice` (line 80)
- `footer.legal.item.cookies` — lien « Cookies » → `/legal/cookies` (line 81)
- `footer.legal.item.contact` — lien « Contact » → `/legal/contact` (line 82)
- `footer.legal.item.transparency` — lien « Transparence » → `/transparence` (line 83)
- `footer.legal.item.faq` — lien « FAQ » → `/faq` (line 84)

---

## Toast (Notifications)
**Fichier** : web/src/components/Toast.tsx

### Provider
- `toast.provider.wrapper.role` — role="region" aria-label="Notifications" (line 139-140)
- `toast.provider.wrapper.position` — position: fixed, bottom: 16, right: 16 (line 25-32)

### Variantes de toast

**Success**
- `toast.success.aria-role` — role="status" aria-live="polite" (line 146)
- `toast.success.label` — « Succès » (line 56)

**Error**
- `toast.error.aria-role` — role="alert" aria-live="assertive" (line 146)
- `toast.error.label` — « Erreur » (line 58)

**Info**
- `toast.info.aria-role` — role="status" aria-live="polite" (line 146)
- `toast.info.label` — « Information » (line 57)

### Élements
- `toast.close.button.label` — aria-label « Fermer la notification » (line 169)
- `toast.message.text` — contenu du message (line 163)

### Configuration
- `toast.default.duration` — 4000ms (web/src/lib/toast.ts)
- `toast.default.variant` — 'info' (line 110)

---

## Breadcrumbs
**Fichier** : web/src/components/Breadcrumbs.tsx

- `breadcrumbs.nav.label` — aria-label="Fil d'Ariane" (line 59)
- `breadcrumbs.nav.list.role` — ol (ordered list) (line 60)
- `breadcrumbs.item.current.aria-current` — aria-current="page" si dernier item (line 71)
- `breadcrumbs.separator.text` — « › » (line 78)
- `breadcrumbs.separator.aria-hidden` — aria-hidden="true" (line 77)

---

## EmptyState
**Fichier** : web/src/components/EmptyState.tsx

- `empty-state.wrapper.role` — role="note" (line 87)
- `empty-state.icon.aria-hidden` — aria-hidden="true" (line 91)
- `empty-state.cta.style` — padding: 10px 18px, background: var(--mn-gradient), color: #ffffff (line 63-75)

---

## Skeleton / Chargement
**Fichier** : web/src/components/Skeleton.tsx

### SkeletonCardList
- `skeleton.card-list.role` — role="status" aria-live="polite" (line 89-90)
- `skeleton.card-list.aria-label` — « Chargement… » (line 91)
- `skeleton.card-list.count` — 3 cartes par défaut (line 69)

---

## RouteErrorBoundary
**Fichier** : web/src/components/RouteErrorBoundary.tsx

### Écran d'erreur
- `error.boundary.role` — role="alert" (line 91)
- `error.boundary.title.chunk-load` — « Mise à jour disponible » (line 93)
- `error.boundary.title.generic` — « Une erreur est survenue » (line 93)
- `error.boundary.message.chunk-load` — « La page n'a pas pu être chargée car une nouvelle version a été déployée pendant votre navigation. Rechargez pour récupérer la dernière version. » (line 97)
- `error.boundary.message.generic` — « Une erreur inattendue est survenue. Rechargez la page pour réessayer. » (line 98)
- `error.boundary.button.text` — « Recharger » (line 101)

### Détection ChunkLoadError
- Pattern détection : regex « loading chunk \d+ failed » ou « failed to fetch dynamically imported module » (line 88-89)

---

## ContactAuthorButton
**Fichier** : web/src/components/ContactAuthorButton.tsx

### États
1. Loading auth — button disabled, aria-busy="true" (line 95)
2. Anonyme — button anonymousStyle, redirect vers `?auth=login` (line 104-116)
3. Auteur du contenu — null (ne s'affiche pas) (line 121)
4. Authentifié·e — button primary style, onClick handler (line 141-154)

### Textes
- `contact.button.loading.text` — « Chargement… » (line 95)
- `contact.button.loading.label` — aria-label « Se connecter pour contacter [author] » (line 107-111)
- `contact.button.authenticated.text` — « Contacter » (line 153)
- `contact.button.authenticated.label` — aria-label « Contacter [author] » (line 149)
- `contact.button.loading-operation.text` — « Ouverture… » (line 153)

### Comportement
- Trigger : crée/retrouve conversation avec `authorUserId` (line 127)
- Redirection : vers `/messaging/{convId}` (line 138)
- Toast erreur : si `getOrCreateConversationWith` échoue (line 131-135)

---

## FollowButton
**Fichier** : web/src/components/FollowButton.tsx

### États
- `follow.button.not-following` — bordure brand, fond transparent, texte « Suivre » (line 57-61)
- `follow.button.following` — fond brand, texte blanc « Suivi·e » (line 51-55)

### Icônes
- `follow.button.not-following.icon` — IconUsers (line 115)
- `follow.button.following.icon` — IconCheck (line 115)

### Accessibilité
- `follow.button.aria-pressed` — aria-pressed={following} (line 111)
- `follow.button.aria-busy` — aria-busy={busy} si busy (line 112)
- `follow.button.aria-label` — « Ne plus suivre » ou « Suivre » (line 113)

---

## RequireAuth & RequireAdmin

### RequireAuth (web/src/components/RequireAuth.tsx)
- `require-auth.loading.text` — « Chargement… » (line 38)
- `require-auth.redirect` — vers `/?auth=login` (line 44) ou redirectTo custom
- `require-auth.state.from` — localStorage « from » pour post-login (line 44)

### RequireAdmin (web/src/components/RequireAdmin.tsx)
- `require-admin.loading.text` — « Chargement… » (line 45)
- `require-admin.redirect.no-auth` — vers `/?auth=login` (line 51)
- `require-admin.redirect.not-admin` — vers `/` (line 55) ou redirectTo custom
- `require-admin.state.from` — localStorage « from » (line 55)

---

## MonthlySignupsChart
**Fichier** : web/src/components/MonthlySignupsChart.tsx

### Wrapper
- `chart.empty.text` — « Aucune inscription enregistrée sur la période. Le graphique apparaîtra dès la première inscription publique. » (line 73-75)
- `chart.empty.role` — role="status" (line 72)

### SVG
- `chart.svg.role` — role="img" (line 92)
- `chart.svg.aria-label` — « Inscriptions par mois sur les 12 derniers mois » (default) (line 93, 56)

### Axes & Labels
- `chart.axis.x.labels` — formatMonthShortFr(bucket.monthIso) sous chaque barre (line 149)
- `chart.axis.y.max` — étiquette « {max} » en haut (line 114)
- `chart.axis.y.min` — étiquette « 0 » en bas (line 124)

---

## Icônes SVG
**Fichier** : web/src/components/icons.tsx

### Icônes standard (currentColor)
- IconClose, IconMail, IconLock, IconUser, IconLogout, IconEdit, IconCheck, IconUpload, IconCheckCircle, IconCart, IconSpark, IconLink, IconFlame, IconPen, IconSearch, IconArrowLeft, IconUsers, IconBadge, IconCalendar, IconPin, IconBarChart, IconShare, IconMegaphone, IconList, IconHome, IconCar, IconStore, IconTool, IconLeaf, IconClock, IconCoin

### Icônes OAuth (couleurs fixes)
- `icon.google` — IconGoogle (line 213-241) — couleurs officielles Google
- `icon.instagram` — IconInstagram (line 243-268) — gradient Instagram officiel

---

# E-MAILS TRANSACTIONNELS

> Sources : Supabase Auth (config.toml) + Edge Functions + webhooks Stripe

## E-mails Supabase Auth

Les e-mails d'authentification sont gérés par **Supabase Auth** avec les templates par défaut (non customisés dans le projet).

### Signup Confirmation Email
- `email.signup-confirm.trigger` — Action : utilisateur clique « Créer mon compte » dans AuthModal mode=signup (web/src/components/AuthModal.tsx:301-312)
- `email.signup-confirm.recipient` — Email de l'utilisateur (adresse saisie)
- `email.signup-confirm.template` — Template Supabase Auth standard (non customisé dans config.toml — sections commentées line 242-244)
- Contenu attendu (par défaut Supabase) :
  - Sujet : « Confirm your email address »
  - Body : lien de confirmation email avec token
  - Configurable via `[auth.email.template.invite]` ou notification templates (line 242-244, 247-250)

### Magic Link Email
- `email.magic-link.trigger` — Action : utilisateur clique « Lien magique par email » dans AuthModal (web/src/components/AuthModal.tsx:313-319)
- `email.magic-link.recipient` — Email de l'utilisateur
- `email.magic-link.template` — Template Supabase Auth OTP standard
- Contenu attendu : lien avec token OTP (6 chiffres par défaut, configurable via `otp_length=6` line 227)

### Password Reset Email
- `email.password-reset.trigger` — Action : utilisateur clique « Mot de passe oublié ? » dans AuthModal mode=forgot (web/src/components/AuthModal.tsx:320-329)
- `email.password-reset.recipient` — Email de l'utilisateur
- `email.password-reset.template` — Template Supabase Auth standard
- `email.password-reset.redirect-url` — Redirige vers `window.location.origin/auth/reset-password` (web/src/lib/auth.ts:76-77)
- Contenu attendu : lien de réinitialisation avec token

## E-mails de Webhooks

### Stripe Adhesion Notification (transactionnel)
- `email.stripe.adhesion.trigger` — Event Stripe webhook reçu et traité par supabase/functions/stripe-webhook/ (supabase/functions/stripe-webhook/index.ts:40-105)
- `email.stripe.adhesion.recipient` — Email associé au customer Stripe → utilisateur (résolvable via stripe_subscription_id → adhesions.user_id)
- Type d'événements : charge initiale, renouvellement, échec
- Contenu : récapitulatif adhésion, tier, dates, montant
- Remarque : Non implémenté en wording UI custom dans le projet — utilise les emails transactionnels Stripe par défaut

---

# SCHÉMA DB — RÔLES & RLS
**Fichier** : db/schema.sql

## Rôles applicatifs

### Rôles explicites
- `role.anonymous` — Non authentifié (anon dans Supabase Auth)
- `role.authenticated` — Authentifié via email/OAuth/magic link (authenticated dans Supabase Auth)
- `role.admin` — Flag `is_admin = true` sur users table (db/schema.sql:103)

### Rôles implicites (tables)
- `role.member` — Enregistrement dans `public.members` table (db/schema.sql:866-875)
- `role.commune-member` — Enregistrement dans `public.commune_members` avec rôle='member'|'referent'|'treasurer'|'admin' (db/schema.sql:814-823)

## Énums de contenu

### Tiers d'adhésion
- `enum.adhesion_tier.gratuit` — Adhésion gratuite (db/schema.sql:61)
- `enum.adhesion_tier.soutien` — Adhésion de soutien
- `enum.adhesion_tier.engage` — Adhésion engagée

### Statuts d'adhésion
- `enum.adhesion_status.pending` — En attente (défaut) (db/schema.sql:65)
- `enum.adhesion_status.active` — Active
- `enum.adhesion_status.cancelled` — Annulée
- `enum.adhesion_status.expired` — Expirée

### Statuts de contenu
- `enum.content_status.draft` — Brouillon (db/schema.sql:84)
- `enum.content_status.published` — Publié (défaut)
- `enum.content_status.archived` — Archivé
- `enum.content_status.flagged` — Signalé (modération)

### Visibilité des posts réseau
- `enum.post_visibility.public` — Visible par tous (défaut) (db/schema.sql:73)
- `enum.post_visibility.members` — Membres uniquement
- `enum.post_visibility.private` — Privé (auteur seul)

### Types de notifications
- `enum.notification_kind.petition_signed` — Quelqu'un a signé ma pétition (db/schema.sql:77-80)
- `enum.notification_kind.mobilization_rsvp` — RSVP mobilisation
- `enum.notification_kind.message` — Message privé
- `enum.notification_kind.comment` — Commentaire
- `enum.notification_kind.reaction` — Réaction (article)
- `enum.notification_kind.campaign` — Info campagne
- `enum.notification_kind.system` — Info système
- `enum.notification_kind.admin` — Annonce admin

### Mouvements T99CP
- `enum.t99cp_kind.credit` — Crédit (gains) (db/schema.sql:69)
- `enum.t99cp_kind.debit` — Débit (dépenses)

## Matrice de permissions RLS

### PUBLIC READ (anonymous + authenticated)
- `petitions` — si status='published' OU auth.uid()=author_id OU is_admin (db/schema.sql:1053-1054)
- `signatures` — lecture publique de compteurs (db/schema.sql:1077)
- `mobilizations` — si status='published' OU organizer_id=auth.uid() OU is_admin (db/schema.sql:1093-1094)
- `participations` — lecture publique (db/schema.sql:1113)
- `housing`, `carpooling`, `lending`, `marketplace_items` — lecture publique (db/schema.sql:1117-1133)
- `articles` — si status='published' OU author_id=auth.uid() OU is_admin (db/schema.sql:1177-1178)
- `users` — profil public (display_name, avatar_url, bio, city, created_at) ; email caché sauf propriétaire/admin (db/schema.sql:1028-1031)
- `posts` — si visibility='public' OU author_id=auth.uid() OU is_admin (db/schema.sql:1192-1193)
- `follows`, `polls`, `campaigns` — lecture publique conditionnelle (db/schema.sql:1207, 1226-1227, 1273-1274)

### PRIVATE READ (auteur/destinataire)
- `messages` — si conversation.user_a=auth.uid() OU conversation.user_b=auth.uid() (db/schema.sql:1611-1622)
- `conversations` — si user_a=auth.uid() OU user_b=auth.uid() (db/schema.sql:1585)
- `notifications` — si recipient_id=auth.uid() (db/schema.sql:1635)
- `adhesions` — si user_id=auth.uid() OU is_admin (db/schema.sql:1686-1687)

### WRITE (authenticated only, avec vérifications)
- `petitions` INSERT — auth.uid()=author_id (db/schema.sql:1058-1059)
- `petitions` UPDATE/DELETE — auth.uid()=author_id OU is_admin (db/schema.sql:1063-1069)
- `signatures` INSERT — auth.uid()=user_id (db/schema.sql:1081-1082)
- `mobilizations` INSERT — auth.uid()=organizer_id (db/schema.sql:1097-1098)
- `housing_requests` INSERT — auth.uid()=requester_id (db/schema.sql:1147)
- `messages` INSERT — auth.uid()=sender_id (db/schema.sql:1627)
- `posts` INSERT — auth.uid()=author_id (db/schema.sql:1196)
- `votes` INSERT — auth.uid()=user_id (db/schema.sql:1243)

### WRITE ADMIN-ONLY
- `users` DELETE — is_admin(auth.uid()) (db/schema.sql:1045-1046)
- Toutes les tables : UPDATE par admin (cf. policies with `OR is_admin()`)

## RPC & Fonctions

### is_admin(uuid)
- Purpose : Lit le flag `is_admin` de l'utilisateur (db/schema.sql:116-124)
- Security : SECURITY DEFINER (exécuté comme owner, pas sujet aux policies)
- Grant : anon + authenticated (db/schema.sql:127)

### credit_t99cp(p_user, p_amount, p_reason, p_source_event_id)
- Purpose : Crédite le wallet T99CP de l'utilisateur (appelé par stripe-webhook)
- Idempotence : source_event_id unique en index partiel (db/schema.sql:918-920)

### slugify(text)
- Purpose : Génère un slug stable pour URLs (pétitions, sondages, etc.)
- Grant : anon + authenticated (db/schema.sql:240)
