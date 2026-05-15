# Inventaire — Compte utilisateur & Admin

> Produit par sub-agent Explore Phase 0. Ne pas modifier — référence brute.

## ProfilePage (`/profile`)
**Fichier** : web/src/pages/ProfilePage.tsx

### Identité
- `profile.h1` — H1 : `{profile.display_name}` (file:672)
- `profile.page-title` — Meta title : implicitement "Profil" (route `/profile`)

### Hero / Header
- `profile.header.avatar` — Avatar circulaire 96x96px, gradient bg, initiale ou image (file:639-653)
- `profile.header.avatar-label` — Aria-label : "Changer la photo de profil" (file:657)
- `profile.header.avatar-input` — Input file, accepts JPEG/PNG/WebP/GIF (file:661-669)
- `profile.header.display-name` — H1 texte : `{profile.display_name}` (file:672)
- `profile.header.email` — Icône + email affiché (file:673-676)
- `profile.header.bio` — Biographie si présente (file:677)
- `profile.header.badges` — Liste badges avec aria-label "Badges" (file:678-687)
- `profile.header.badge-icon` — IconBadge pour chaque badge (file:682)
- `profile.header.edit-btn` — Bouton "Modifier" primaire si !editing (file:690-697), label "Modifier le profil"
- `profile.header.avatar-change-btn` — Bouton "Changer l'avatar" ou "Envoi…" si uploading (file:699-708)

### Section Informations
- `profile.info.section-title` — H2 : "Informations" (file:712-713)
- `profile.info.display-name.label` — "Nom d'affichage *" (file:720)
- `profile.info.display-name.input` — Input type text, id "profile-display-name", required (file:722-730)
- `profile.info.display-name.validation` — "Le nom d'affichage est obligatoire." (file:581)
- `profile.info.city.label` — "Ville" (file:733-734)
- `profile.info.city.input` — Input type text, id "profile-city", optional (file:736-742)
- `profile.info.city.display` — Affichage en lecture : `{profile.city ?? '—'}` (file:802)
- `profile.info.postal-code.label` — "Code postal" (file:745-746)
- `profile.info.postal-code.input` — Input type text, id "profile-postal-code", inputMode numeric, pattern [0-9]* (file:748-756)
- `profile.info.postal-code.display` — Affichage en lecture : `{profile.postal_code ?? '—'}` (file:806)
- `profile.info.member-since.label` — "Membre depuis" (file:809)
- `profile.info.member-since.value` — Formaté fr-FR long/year (file:810)
- `profile.info.bio.label` — "Présentation" (file:761)
- `profile.info.bio.textarea` — Textarea 4 rows, id "profile-bio" (file:763-769)
- `profile.info.submit-btn` — Bouton "Enregistrer" ou "Enregistrement…" primaire (file:782-784)
- `profile.info.cancel-btn` — Bouton "Annuler" secondaire (file:786-794)
- `profile.info.form-error` — Boîte rouge erreur (file:771-775)
- `profile.info.form-success` — Boîte verte succès (file:776-780, 813-817)
- `profile.info.avatar-hint` — "La taille maximale d'un avatar est de X Mo (JPEG, PNG, WebP ou GIF)." (file:825-828)

### Section Wallet
- `profile.wallet.section-title` — H2 : "Wallet T99CP" (file:832-833)
- `profile.wallet.balance` — Solde T99CP affiché en gros texte 42px (file:835)
- `profile.wallet.description` — "T99CP — monnaie solidaire du mouvement." (file:836-838)

### Section Contributions (Stats)
- `profile.stats.section-title` — H2 : "Contributions" (file:842-843)
- `profile.stats.loading` — "Chargement des compteurs…" role=status (file:846-848)
- `profile.stats.error` — "Compteurs indisponibles pour le moment." role=status (file:850-853)
- `profile.stats.list` — Liste ul avec aria-label "Mes contributions" (file:856)
- `profile.stats.signatures.value` — Nombre `{statsState.stats.signatures}` (file:858)
- `profile.stats.signatures.label` — "Pétitions signées" (file:859)
- `profile.stats.participations.value` — Nombre `{statsState.stats.participations}` (file:862)
- `profile.stats.participations.label` — "Mobilisations rejointes" (file:863)
- `profile.stats.votes.value` — Nombre `{statsState.stats.votes}` (file:866)
- `profile.stats.votes.label` — "Votes émis" (file:867)
- `profile.stats.posts.value` — Nombre `{statsState.stats.posts}` (file:870)
- `profile.stats.posts.label` — "Publications" (file:871)

### Section Activité récente
- `profile.activity.section-title` — H2 : "Activité récente" (file:878-879)
- `profile.activity.loading` — "Chargement de l'historique…" role=status (file:882-884)
- `profile.activity.error` — "Historique indisponible pour le moment." role=status (file:886-889)
- `profile.activity.empty` — "Aucune action enregistrée pour l'instant. Vos signatures, RSVP, votes et publications apparaîtront ici dès la première contribution." (file:891-894)
- `profile.activity.list` — Liste ul avec aria-label "10 dernières actions" (file:898)
- `profile.activity.item` — Chaque item avec icône, kind label, label (clickable si href), date (file:899-915)
- `profile.activity.item.kind-icon` — Icône conditionnelle : CheckCircle/Calendar/List/Pen selon kind (file:427-437)
- `profile.activity.item.kind-label` — "SIGNATURE"/"PARTICIPATION"/"VOTE"/"POST" uppercase (file:907)
- `profile.activity.item.date` — Format "DD MMM YYYY" fr-FR (file:911, 413-425)

### États & Validations
- `profile.loading-state` — "Chargement du profil…" role=status (file:529-532)
- `profile.error-state` — Boîte rouge + bouton "Réessayer" (file:536-546)
- `profile.error-btn-retry` — Bouton "Réessayer" (file:542-544)
- `profile.unavailable` — "Profil indisponible." (file:552)

---

## NotificationsPage (`/notifications`)
**Fichier** : web/src/pages/NotificationsPage.tsx

### Identité
- `notifications.h1` — H1 : "Notifications" (file:212)
- `notifications.subtitle` — "X non lue(s)." ou "Vous êtes à jour." (file:213-216)

### Header Actions
- `notifications.mark-all-read-btn` — Bouton "Tout marquer comme lu" (file:220-229) avec IconCheckCircle
- `notifications.mark-all-read-disabled` — Désactivé si unreadCount === 0 (file:226)

### Tabs / Filtres
- `notifications.tabs.all` — Tab "Toutes" (file:234-241)
- `notifications.tabs.unread` — Tab "Non lues" (file:243-251)
- `notifications.tabs.role` — role=tablist aria-label="Filtre des notifications" (file:233)

### Notifications List
- `notifications.error-box` — Boîte rouge erreur si postgrestError (file:254-258)
- `notifications.loading` — "Chargement des notifications…" role=status (file:260-263)
- `notifications.empty.all` — "Aucune notification" + "Vos alertes... s'afficheront ici." (file:268-275)
- `notifications.empty.unread` — "Aucune notification non lue" + "Tout est lu, beau travail." (file:269-273)
- `notifications.list` — ul aria-label="Liste des notifications" (file:280-282)
- `notifications.card.background` — Gradient brand-light si !read, sinon surface (file:84-91)
- `notifications.card.icon` — Icône conditionnelle : Megaphone/Spark/Badge selon kind (file:289-296)
- `notifications.card.title` — Titre notif extrait de payload.title ou KIND_LABELS (file:299)
- `notifications.card.kind-label` — KIND_LABELS[n.kind] : "Pétition", "Mobilisation", "Message", "Commentaire", "Réaction", "Campagne", "Système", "Admin" (file:146-155)
- `notifications.card.date` — Format "DD MMM HH:MM" fr-FR (file:157-164)
- `notifications.card.toggle-btn` — Bouton "Marquer lu" / "Marquer non lu" (file:306-314)

---

## MessagingPage (`/messaging`)
**Fichier** : web/src/pages/MessagingPage.tsx

### Identité
- `messaging.h1` — H1 : "Messagerie" (file:170)
- `messaging.subtitle` — "Échanges directs entre adhérents. Strictement privés." (file:171)

### Notice
- `messaging.notice` — Boîte info grise (file:173-177)
- `messaging.notice.text` — "Données personnelles. Les messages directs sont privés et chiffrés en transit. Seul·e·s les deux personnes... La modération admin n'intervient qu'en cas de signalement." (file:174-176)

### Conversations List
- `messaging.error-box` — Boîte rouge si postgrestError (file:179-183)
- `messaging.loading` — "Chargement des conversations…" role=status (file:185-188)
- `messaging.empty` — "Aucune conversation" + "Les messages échangés... apparaîtront ici." (file:191-199)
- `messaging.count` — "X conversation(s)" avec IconSpark (file:204-209)
- `messaging.list` — ul aria-label="Liste des conversations" (file:210-212)
- `messaging.conversation-card` — Lien vers `/messaging/{conversation.id}` (file:143)
- `messaging.conversation-card.avatar` — Initiales 2 chars de l'autre partie (file:144-146)
- `messaging.conversation-card.title` — "Conversation avec {other.slice(0, 8)}…" (file:148)
- `messaging.conversation-card.meta` — "Dernier message : {date}" (file:149-151)

---

## MessagingConversationPage (`/messaging/:conversationId`)
**Fichier** : web/src/pages/MessagingConversationPage.tsx

### Navigation
- `messaging-conv.back-link` — Lien "Retour aux conversations" vers `/messaging` (file:264-266)
- `messaging-conv.back-link.icon` — IconArrowLeft (file:265)

### Header
- `messaging-conv.header.avatar` — Initiales 2 chars otherId (file:283-285)
- `messaging-conv.header.title` — H1 : "Conversation avec {otherId.slice(0, 8)}…" (file:287)
- `messaging-conv.header.subtitle` — "Échanges privés — RLS stricte côté serveur." (file:288)

### Conversation Loading States
- `messaging-conv.loading` — "Chargement de la conversation…" role=status (file:268-271)
- `messaging-conv.conv-error` — "Conversation inaccessible. Réessayez plus tard." (file:274-277)

### Messages Thread
- `messaging-conv.error-box` — Boîte rouge si postgrestError (file:292-296)
- `messaging-conv.messages-loading` — "Chargement des messages…" role=status (file:298-301)
- `messaging-conv.messages-empty` — "Aucun message pour l'instant. Lancez la discussion !" (file:304-307)
- `messaging-conv.messages-list` — ul aria-label="Fil des messages" (file:311-319)
- `messaging-conv.message-bubble-self` — Bulle droite gradient bg (file:320-327)
- `messaging-conv.message-bubble-other` — Bulle gauche surface-2 bg (file:327)
- `messaging-conv.message.body` — Texte avec whitespace pre-wrap (file:327)
- `messaging-conv.message.date` — Format "DD MMM HH:MM" fr-FR (file:334)

### Message Form
- `messaging-conv.form` — form aria-label="Envoyer un message" (file:342)
- `messaging-conv.form.label` — "Votre message" (file:343-347)
- `messaging-conv.form.textarea` — id "message-body", maxLength=MESSAGE_BODY_MAX, placeholder "Tapez votre message…" (file:349-358)
- `messaging-conv.form.error-text` — Erreur champ rouge (file:359)
- `messaging-conv.form.error-box` — Boîte rouge erreur globale (file:360-364)
- `messaging-conv.form.submit-btn` — Bouton "Envoyer" ou "Envoi…" avec IconMail (file:365-373)
- `messaging-conv.form.submit-disabled` — Style grisé si busy (file:146-152)

---

## AuthCallbackPage (`/auth/callback`)
**Fichier** : web/src/pages/AuthCallbackPage.tsx

### Callback Flow
- `auth-callback.h1` — H1 : "Connexion en cours…" (file:98)
- `auth-callback.exchanging` — "Validation du lien d'authentification. Cette opération prend quelques secondes." (file:100-102)
- `auth-callback.success` — "Connexion réussie. Redirection vers votre profil…" (file:105-107)
- `auth-callback.error-box` — Boîte rouge : "{errorText ?? 'Une erreur est survenue lors de la connexion. Réessayez.'}" (file:109-112)
- `auth-callback.error-no-payload` — "Lien d'authentification invalide ou expiré. Recommencez la connexion." (file:66)

---

## ResetPasswordPage (`/auth/reset-password?code=...`)
**Fichier** : web/src/pages/ResetPasswordPage.tsx

### Page Title & Subtitle
- `reset-password.h1` — H1 : "Nouveau mot de passe" (file:190)
- `reset-password.subtitle` — "Choisissez un mot de passe d'au moins 8 caractères pour sécuriser votre compte." (file:191-193)

### Error / Success Messages
- `reset-password.error-box` — Boîte rouge si error (file:195-199)
- `reset-password.success-box` — Boîte verte "Mot de passe mis à jour. Redirection vers votre profil…" (file:200-204)

### Code Exchange Status
- `reset-password.checking-link` — "Vérification du lien…" role=status (file:206-209)
- `reset-password.code-invalid` — "Lien invalide ou expiré. Demandez un nouveau lien depuis la page de connexion." (file:143)
- `reset-password.code-expired` — "Lien expiré. Demandez un nouveau lien de réinitialisation." (file:154-156)

### Form Fields (status === 'ready')
- `reset-password.form.password.label` — "Nouveau mot de passe" (file:215-216)
- `reset-password.form.password.input` — id "reset-password", type password, minLength 8, required (file:222-232)
- `reset-password.form.password.icon` — IconLock (file:220)
- `reset-password.form.password.validation-min` — Min 8 chars (file:168-170)
- `reset-password.form.confirm.label` — "Confirmer le mot de passe" (file:236-237)
- `reset-password.form.confirm.input` — id "reset-password-confirm", type password, minLength 8, required (file:243-253)
- `reset-password.form.confirm.icon` — IconLock (file:241)
- `reset-password.form.confirm.validation-mismatch` — "Les deux mots de passe ne correspondent pas." (file:172-174)
- `reset-password.form.submit-btn` — "Mettre à jour le mot de passe" ou "Mise à jour…" avec IconCheck (file:256-259)

---

## AdminPage (`/admin`)
**Fichier** : web/src/pages/AdminPage.tsx

### Page Header
- `admin.h1` — H1 : "Panel admin" (file:597)
- `admin.subtitle` — "Modération des contenus signalés, gestion des communes et campagnes email. Toutes les actions sont historisées dans `admin_logs`." (file:598-601)

### Tab Navigation
- `admin.tabs.nav` — nav aria-label="Sections admin" (file:604)
- `admin.tabs.moderation` — Tab "Modération" avec IconFlame (file:605-612)
- `admin.tabs.communes` — Tab "Communes" avec IconUsers (file:613-620)
- `admin.tabs.email` — Tab "Email" avec IconMail (file:621-628)

### MODERATION TAB
- `admin.moderation.section-title` — H2 : "File de modération" (file:323-328)
- `admin.moderation.error-box` — Boîte rouge si postgrestError (file:329-333)
- `admin.moderation.loading` — "Chargement…" role=status aria-live (file:334-338)
- `admin.moderation.empty` — "Aucun contenu en attente de modération." (file:339-343)
- `admin.moderation.list` — ul aria-label="Contenus modérés" (file:345-348)

#### Flagged Item Row
- `admin.moderation.item.kind-badge` — Badge texte uppercase : "{item.kind.replace('_', ' ')}" (file:274)
- `admin.moderation.item.title` — Strong titre si present (file:275-277)
- `admin.moderation.item.body` — Premier 600 chars body (file:278)
- `admin.moderation.item.date` — "DD/MM/YYYY HH:MM" fr-FR (file:279-281)
- `admin.moderation.item.error-box` — Boîte rouge d'erreur action (file:282-286)
- `admin.moderation.item.unflag-btn` — Bouton "Lever le flag" avec IconCheck (file:287-296)
- `admin.moderation.item.delete-btn` — Bouton danger "Supprimer" (file:298-306)
- `admin.moderation.item.view-article-link` — Lien "Voir l'article" si kind=article + slug (file:307-311)

### COMMUNES TAB
- `admin.communes.section-title` — H2 : "Communes libres" avec IconUsers (file:368-380)
- `admin.communes.description` — "Vous pouvez créer une nouvelle commune ou consulter la liste publique pour gérer les membres existants." (file:381-384)
- `admin.communes.create-link` — Lien "Créer une commune" vers `/communes/new` (file:386-388)
- `admin.communes.list-link` — Lien "Voir la liste" vers `/communes` avec IconList (file:389-392)

### EMAIL TAB
- `admin.email.section-title` — H2 : "Campagnes email" avec IconMail (file:533-546)

#### Email Campaign Form
- `admin.email.form` — form aria-label="Nouvelle campagne email" (file:459)
- `admin.email.form.error-box` — Boîte rouge globalError (file:460-464)
- `admin.email.form.subject.label` — "Sujet" (file:466-467)
- `admin.email.form.subject.input` — id "campaign-subject", type text, required (file:469-477)
- `admin.email.form.subject.help` — "Au moins X caractères." où X=EMAIL_SUBJECT_MIN (file:478)
- `admin.email.form.subject.error` — Erreur validation (file:479)
- `admin.email.form.audience.label` — "Audience" (file:482-483)
- `admin.email.form.audience.input` — id "campaign-audience", type text, required (file:485-492)
- `admin.email.form.audience.help` — "Étiquette d'audience (ex. `members`, `adherents`)." (file:494-496)
- `admin.email.form.audience.error` — Erreur validation (file:497)
- `admin.email.form.body.label` — "Corps HTML" (file:500-501)
- `admin.email.form.body.textarea` — id "campaign-body", required, minHeight 120 (file:503-510)
- `admin.email.form.body.help` — "Au moins X caractères." où X=EMAIL_BODY_MIN (file:511)
- `admin.email.form.body.error` — Erreur validation (file:512)
- `admin.email.form.submit-btn` — "Créer le brouillon" ou "Création…" avec IconMail (file:514-522)

#### Email Campaigns List
- `admin.email.campaigns.loading` — "Chargement des campagnes…" role=status (file:559-562)
- `admin.email.campaigns.empty` — "Aucune campagne. Créez le premier brouillon ci-dessus." (file:565-567)
- `admin.email.campaigns.list` — ul de campagnes (file:570-582)
- `admin.email.campaign.item.subject` — Strong titre campaign.subject (file:573-574)
- `admin.email.campaign.item.meta` — "status · audience X · DATE" fr-FR (file:576-579)

### États Généraux
- `admin.states.not-admin` — Non affiché si !isAdmin ou adminStatus !== 'ready' (file:592)
- `admin.states.loading` — Non affiché pendant charge (implicite via enabled check, file:592)

---

## Récapitulatif Section

**Pages couvertes** (7 fichiers) :
1. **ProfilePage** — ~45 items (avatar, infos, wallet, stats, activité)
2. **NotificationsPage** — ~23 items (tabs, filtres, liste notifications)
3. **MessagingPage** — ~14 items (conversations, notice, liste)
4. **MessagingConversationPage** — ~20 items (header, thread, form)
5. **AuthCallbackPage** — ~4 items
6. **ResetPasswordPage** — ~18 items
7. **AdminPage** — ~60+ items (3 tabs : modération, communes, email)

**Total section** : ~180+ items granulaires.
