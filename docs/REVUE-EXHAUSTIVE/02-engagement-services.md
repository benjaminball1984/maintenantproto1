# Inventaire — Engagement militant & Services solidaires

> Produit par sub-agents Explore Phase 0 (2 passes). Ne pas modifier — référence brute.
>
> Note : 3 pages listing services (Carpooling, Lending, Garden, Sel, Crowdfunding listing)
> sont décrites à partir des patterns observés sur les autres listings — les fichiers
> existent dans `web/src/pages/services/` et seront proposés à la revue tels quels.
> Toutes les pages Detail / Create / Contribute / Request sont issues de lecture directe.

## CATÉGORIE 1: ENGAGEMENT MILITANT

### PetitionsPage (`/petitions`)
**Fichier** : web/src/pages/PetitionsPage.tsx

#### Identité
- `petitions.h1` — H1 « Pétitions citoyennes » (ligne 188)

#### Hero
- `petitions.hero.title` — « Pétitions citoyennes » (ligne 188) | fontFamily 'Sora', fontSize clamp(24px, 4vw, 36px)
- `petitions.hero.lead` — « Signez les pétitions du mouvement. Ajoutez votre voix aux luttes, aux revendications, aux initiatives qu'on porte ensemble. » (ligne 191-194)

#### Toolbar
- `petitions.toolbar.search.label` — « Rechercher une pétition » (ligne 247)
- `petitions.toolbar.search.input` — Input type="search", placeholder « Mot-clé… », aria-label « Rechercher une pétition » (ligne 272-278)
- `petitions.toolbar.category.label` — « Catégorie » (ligne 259)
- `petitions.toolbar.category.input` — Input type="text", placeholder « Catégorie », aria-label « Catégorie » (ligne 259-265)
- `petitions.toolbar.cta.button` — Link vers `/petitions/new`, label « Créer une pétition » | icône IconPen (ligne 287-290)

#### Grille
- `petitions.grid.counter.label` — « {count} pétition{s} » avec IconFlame (ligne 331-334)
- `petitions.grid.item.tag` — Catégorie badge avec couleur brand-light (ligne 195)
- `petitions.grid.item.title` — Titre pétition (ligne 199)
- `petitions.grid.item.summary` — Description limitée à 3 lignes (ligne 200)
- `petitions.grid.item.signCount` — « {count} signature{s} » avec IconUsers (ligne 210-215)
- `petitions.grid.item.target` — « sur {target} demandées » (ligne 210-215)
- `petitions.grid.item.progressBar` — Progress bar (ligne 206-209)

#### États
- `petitions.state.loading` — role="status" aria-live="polite" « Chargement des pétitions… » (ligne 301-302)
- `petitions.state.empty` — EmptyState avec IconFlame, title « Aucune pétition pour le moment », description « Lancez la première pétition de votre territoire. », cta « Créer une pétition » (ligne 306-313)
- `petitions.state.error` — role="alert" avec message postgrestErrorMessage (ligne 294-298)

---

### PetitionDetailPage (`/petitions/:slug`)
**Fichier** : web/src/pages/PetitionDetailPage.tsx

#### Identité
- `petition-detail.h1` — H1 `{petition.title}` (ligne 224)

#### Navigation
- `petition-detail.back-link` — Link vers `/petitions`, label « Toutes les pétitions » avec IconArrowLeft (ligne 216-218)

#### Hero Header
- `petition-detail.hero.tag` — Badge « Pétition » avec brand-light (ligne 220-221)
- `petition-detail.hero.title` — H1 title (ligne 224)
- `petition-detail.hero.summary` — p contenant le résumé (ligne 227)
- `petition-detail.hero.signCount` — « {count} signature{s} » avec IconUsers (ligne 231-233)
- `petition-detail.hero.target` — « sur {target} demandées » (ligne 231-233)
- `petition-detail.hero.progressBar` — Progress bar (ligne 230)

#### Actions
- `petition-detail.actions.sign-button` — Bouton « Signer cette pétition » ou « Retirer ma signature » (ligne 239-250)
  - Si anonymous : aria-label « Vous devez être connecté pour signer »
  - Busy state : « Signature… »
- `petition-detail.actions.share-button` — Bouton « Partager » avec IconShare (ligne 251-252)
- `petition-detail.actions.share-confirm` — role="status" « Lien copié. » (ligne 253-257)

#### Info Box
- `petition-detail.info.anonymous` — role="alert" « Vous devez être connecté pour signer cette pétition. » avec Link vers `/auth/login` (ligne 258-263)

#### Body Section
- `petition-detail.section.title` — « La cause en détail » avec id="petition-cause-title" (ligne 269)
- `petition-detail.section.body` — p contenant petition.body avec whitespace pre-wrap (ligne 270)

#### États
- `petition-detail.state.notfound` — Navigate to `/petitions` (ligne 161)
- `petition-detail.state.loading` — role="status" « Chargement de la pétition… » (ligne 165-172)
- `petition-detail.state.error` — role="alert" avec postgrestErrorMessage + Link back (ligne 175-185)
- `petition-detail.error.sign-failed` — role="alert" errorBoxStyle avec postgrestErrorMessage (ligne 265-269)

---

### PetitionCreatePage (`/petitions/new`)
**Fichier** : web/src/pages/PetitionCreatePage.tsx

#### Identité
- `petition-create.h1` — H1 « Lancer une pétition » (ligne 239)
- `petition-create.lead` — « Faites circuler une demande, recueillez des signatures, mobilisez pour une revendication. » (ligne 240-241)

#### Navigation
- `petition-create.back-link` — Link vers `/petitions`, label « Retour aux pétitions » avec IconArrowLeft (ligne 238)

#### Champ Titre
- `petition-create.form.title.label` — « Titre » (ligne 250)
- `petition-create.form.title.input` — id="petition-title", required, placeholder « Ex: Réclamer l'indexation des salaires sur l'inflation », minLength PETITION_TITLE_MIN=80, maxLength PETITION_TITLE_MAX=200 (ligne 251-259)
- `petition-create.form.title.help` — « 80 à 200 caractères » (ligne 260-262)
- `petition-create.form.title.error` — span error message (ligne 263)

#### Champ Catégorie
- `petition-create.form.category.label` — « Catégorie » (ligne 266)
- `petition-create.form.category.select` — Options : « Salaires et conditions », « Écologie », « Libertés », « Femmes », « Migrations », « Institutions », « Autre » (ligne 267-275)
- `petition-create.form.category.error` — span error (ligne 276)

#### Champ Résumé
- `petition-create.form.summary.label` — « Résumé » (ligne 279)
- `petition-create.form.summary.textarea` — id="petition-summary", placeholder « Expliquez en 2-3 phrases pourquoi cette pétition compte », min 50 / max 300 chars (ligne 280-287)
- `petition-create.form.summary.help` — « 50 à 300 caractères » (ligne 288-290)
- `petition-create.form.summary.error` — span error (ligne 291)

#### Champ Body
- `petition-create.form.body.label` — « La cause en détail » (ligne 294)
- `petition-create.form.body.textarea` — id="petition-body", placeholder « Détaillez le contexte, les enjeux, les solutions… », min 200 chars (ligne 295-303)
- `petition-create.form.body.help` — « 200 caractères minimum » (ligne 304-306)
- `petition-create.form.body.error` — span error (ligne 307)

#### Champ Target
- `petition-create.form.target.label` — « Objectif de signatures » (ligne 310)
- `petition-create.form.target.input` — type="number" id="petition-target", min 100, max 100000 (ligne 311-318)
- `petition-create.form.target.help` — « 100 à 100 000 » (ligne 319-321)
- `petition-create.form.target.error` — span error (ligne 322)

#### Champ Cover
- `petition-create.form.cover.label` — « Image de couverture (optionnel) » (ligne 325)
- `petition-create.form.cover.input` — type="url" id="petition-cover", placeholder « https://example.com/image.jpg » (ligne 326-330)
- `petition-create.form.cover.error` — span error (ligne 331)

#### Submit
- `petition-create.form.submit` — type="submit" label « Publier la pétition » ou « Publication... » (ligne 334-340)
- `petition-create.error.global` — role="alert" globalError (ligne 338-342)

---

### MobilizationsPage (`/mobilizations`)
**Fichier** : web/src/pages/MobilizationsPage.tsx

#### Identité
- `mobilizations.h1` — H1 « Mobilisations & événements » (ligne 244)

#### Hero
- `mobilizations.hero.title` — « Mobilisations & événements » (ligne 244)
- `mobilizations.hero.lead` — « Organisez une manifestation, un AG, une formation, une action locale. Coordonnez-vous, gagnez en visibilité. » (ligne 245-248)

#### Toolbar
- `mobilizations.toolbar.search.input` — type="search" placeholder « Mot-clé… », aria-label « Rechercher une mobilisation » (ligne 269-276)
- `mobilizations.toolbar.city.input` — type="text" placeholder « Ville » (ligne 259-265)
- `mobilizations.toolbar.date.input` — type="date" aria-label « À partir du » (ligne 277-283)
- `mobilizations.toolbar.cta.button` — Link vers `/mobilizations/new`, label « Créer un événement » avec IconPen (ligne 289-292)

#### Grille
- `mobilizations.grid.counter` — « {count} mobilisation{s} » avec IconCalendar (ligne 319-322)
- `mobilizations.grid.item.tag` — Date tag avec formatMobilizationDate (ligne 196-201)
- `mobilizations.grid.item.title` — Titre mobilization (ligne 202)
- `mobilizations.grid.item.summary` — Description 3-line clamp (ligne 203)
- `mobilizations.grid.item.city` — avec IconPin (ligne 206-209)
- `mobilizations.grid.item.time` — « {start} - {end} » avec IconClock (ligne 210-214)
- `mobilizations.grid.item.participants` — « {count} inscrit(e)(s) » avec IconUsers (ligne 215-218)

#### États
- `mobilizations.state.loading` — « Chargement des mobilisations… » (ligne 298-299)
- `mobilizations.state.empty` — EmptyState « Aucune mobilisation trouvée », description « Essayez d'autres filtres, ou organisez la première sur votre territoire. », cta « Organiser une mobilisation » (ligne 303-310)
- `mobilizations.state.error` — role="alert" postgrestErrorMessage (ligne 295-297)

---

### MobilizationDetailPage (`/mobilizations/:slug`)
**Fichier** : web/src/pages/MobilizationDetailPage.tsx

#### Navigation
- `mobilization-detail.back-link` — Link vers `/mobilizations`, label « Tous les événements » avec IconArrowLeft (ligne 216-218)

#### Hero Header
- `mobilization-detail.hero.tag` — Badge « Mobilisation » (ligne 220-221)
- `mobilization-detail.hero.title` — H1 (ligne 224)
- `mobilization-detail.hero.summary` — p résumé (ligne 227)
- `mobilization-detail.hero.date.tag` — formatMobilizationDate (ligne 230-232)
- `mobilization-detail.hero.city` — avec IconPin (ligne 235-238)
- `mobilization-detail.hero.time` — avec IconClock (ligne 239-246)
- `mobilization-detail.hero.participants` — « {count} inscrit(e)(s) » avec IconUsers (ligne 247-250)

#### Actions
- `mobilization-detail.actions.join-button` — « Rejoindre » ou « Annuler ma participation » | aria-pressed (ligne 255-270)
- `mobilization-detail.actions.share-button` — « Partager » avec IconShare (ligne 271-272)
- `mobilization-detail.actions.share-confirm` — role="status" « Lien copié. » (ligne 273-277)

#### Info Box
- `mobilization-detail.info.anonymous` — role="alert" « Vous devez être connecté pour rejoindre une mobilisation. » avec Link vers `/auth/login` (ligne 278-283)

#### Body Section
- `mobilization-detail.section.title` — « En détail » (ligne 287)
- `mobilization-detail.section.body` — p mobilization.body (ligne 288)

---

### MobilizationCreatePage (`/mobilizations/new`)
**Fichier** : web/src/pages/MobilizationCreatePage.tsx

#### Identité
- `mobilization-create.h1` — H1 « Créer un événement » (ligne 258)
- `mobilization-create.lead` — « Organisez une manifestation, une formation, une AG, une action locale. Coordonnez-vous dans votre territoire. » (ligne 259-260)

#### Champs
- `mobilization-create.form.title.label` — « Titre » | input min 80 / max 200, placeholder « Ex: Manifestation pour l'indexation des salaires » (ligne 273-282) | help « 80 à 200 caractères »
- `mobilization-create.form.summary.label` — « Résumé » | textarea min 80 / max 500, placeholder « Expliquez en quelques lignes l'objet de cette mobilisation » (ligne 289-297) | help « 80 à 500 caractères »
- `mobilization-create.form.body.label` — « Description (optionnel) » | textarea min 50 if present, placeholder « Contexte, enjeux, ce qui se passera… » (ligne 304-312) | help « 50 caractères minimum »
- `mobilization-create.form.city.label` — « Ville » | input min 1 / max 50 placeholder « Ex: Lyon » (ligne 319-328) | help « 1 à 50 caractères »
- `mobilization-create.form.address.label` — « Adresse (optionnel) » | placeholder « Ex: Place Bellecour » (ligne 335-342)
- `mobilization-create.form.startDate.label` — « Date de début » | type="date" required (ligne 346-354)
- `mobilization-create.form.startTime.label` — « Heure de début » | type="time" required default « 10:00 » (ligne 357-364)
- `mobilization-create.form.endDate.label` — « Date de fin (optionnel) » | type="date" (ligne 367-372)
- `mobilization-create.form.endTime.label` — « Heure de fin (optionnel) » | type="time" (ligne 375-380)
- `mobilization-create.form.cover.label` — « Image de couverture (optionnel) » | type="url" placeholder « https://example.com/image.jpg » (ligne 383-388)

#### Submit
- `mobilization-create.form.submit` — « Publier la mobilisation » ou « Publication... » (ligne 392-398)
- `mobilization-create.error.global` — role="alert" globalError (ligne 359-363)

---

### CampaignsPage (`/campaigns`)
**Fichier** : web/src/pages/CampaignsPage.tsx

#### Identité
- `campaigns.h1` — H1 « Campagnes citoyennes » (ligne 224)

#### Hero
- `campaigns.hero.lead` — « Coordonnez des actions : pétitions, mobilisations, sondages, cagnottes. Faites cluster pour amplifier. » (ligne 225-226)

#### Toolbar
- `campaigns.toolbar.search.input` — placeholder « Mot-clé… » aria-label « Rechercher une campagne » (ligne 265-272)
- `campaigns.toolbar.status.select` — Options « Tous », « En cours », « Publiées », « Archivées » (ligne 252-263)
- `campaigns.toolbar.cta.button` — Link vers `/campaigns/new`, label « Lancer une campagne » avec IconMegaphone (ligne 273-276)

#### Grille
- `campaigns.grid.counter` — « {count} campagne{s} » avec IconMegaphone (ligne 283-286)
- `campaigns.grid.item.tag` — « Campagne citoyenne » badge (ligne 187)
- `campaigns.grid.item.title` — Titre campaign (ligne 188)
- `campaigns.grid.item.summary` — 3-line clamp (ligne 189)
- `campaigns.grid.item.cta` — « Voir le plan d'action → » (ligne 190)

#### États
- `campaigns.state.loading` — « Chargement des campagnes… » (ligne 280-281)
- `campaigns.state.empty` — EmptyState « Aucune campagne disponible », description « Lancez la première campagne sur votre territoire. », cta « Lancer une campagne » (ligne 288-295)

---

### CampaignDetailPage (`/campaigns/:slug`)
**Fichier** : web/src/pages/CampaignDetailPage.tsx

#### Navigation
- `campaign-detail.back-link` — Link vers `/campaigns`, « Toutes les campagnes » avec IconArrowLeft (ligne 212-214)

#### Hero
- `campaign-detail.hero.tag` — « Campagne citoyenne » (ligne 216-217)
- `campaign-detail.hero.title` — H1 (ligne 220)
- `campaign-detail.hero.summary` — p résumé (ligne 223)
- `campaign-detail.hero.body` — p body si présent (ligne 224)

#### Actions
- `campaign-detail.actions.share-button` — « Partager » avec IconShare (ligne 227-228)
- `campaign-detail.actions.share-confirm` — role="status" « Lien copié. » (ligne 229-233)

#### Section Actions
- `campaign-detail.section.title` — « Actions de la campagne » avec count « {count} action{s} » (ligne 237-241)
- `campaign-detail.section.item.icon` — Icon variant par type d'action (ligne 245-252)
- `campaign-detail.section.item.type-label` — « Pétition », « Mobilisation », « Sondage », « Cagnotte » (ligne 253)
- `campaign-detail.section.item.title` — Titre action (ligne 254)
- `campaign-detail.section.item.state` — opacity 0.5 si orphaned, aria-label « Action supprimée » (ligne 255-256)

---

### CampaignCreatePage (`/campaigns/new`)
**Fichier** : web/src/pages/CampaignCreatePage.tsx

#### Identité
- `campaign-create.h1` — H1 « Lancer une campagne » (ligne 244)
- `campaign-create.lead` — « Regroupez jusqu'à 12 actions pour amplifier un message. » (ligne 245-246)

#### Champs
- `campaign-create.form.title.label` — « Titre » | input min 80 / max 200, placeholder « Ex: Un salaire minimum à 1600€ net » (ligne 259-268) | help « 80 à 200 caractères »
- `campaign-create.form.summary.label` — « Résumé » | textarea min 80 / max 500, placeholder « Expliquez l'enjeu et le plan d'action » (ligne 275-283) | help « 80 à 500 caractères »
- `campaign-create.form.body.label` — « Description (optionnel) » | textarea min 50 if present, placeholder « Contexte, enjeux détaillés, solutions… » (ligne 290-298) | help « 50 caractères minimum »

#### Action Picker
- `campaign-create.actions-picker.title` — « Sélectionnez vos actions (max 12) » (ligne 305)
- `campaign-create.actions-picker.tabs` — role="tablist" : Tab « Pétitions », Tab « Mobilisations », Tab « Sondages » (ligne 308-333)
- `campaign-create.actions-picker.search.input` — type="search" placeholder « Rechercher… » (ligne 336-343)
- `campaign-create.actions-picker.selected.title` — « Actions sélectionnées » (ligne 384)
- `campaign-create.actions-picker.selected.item.type-badge` — « Pétition », « Mobilisation », « Sondage » (ligne 393)
- `campaign-create.actions-picker.selected.item.title` — Titre action (ligne 394)
- `campaign-create.actions-picker.selected.item.remove-button` — IconClose (ligne 395-396)

#### Submit
- `campaign-create.form.submit` — « Publier la campagne » ou « Publication... » (ligne 404-410)
- `campaign-create.error.global` — role="alert" globalError (ligne 378-382)

---

### PollsPage (`/polls`)
**Fichier** : web/src/pages/PollsPage.tsx

#### Identité
- `polls.h1` — H1 « Sondages citoyens » (ligne 214)

#### Hero
- `polls.hero.lead` — « Interrogez le mouvement de manière anonyme. Pas de vente de données, pas de pub. Juste votre avis. » (ligne 215-216)

#### Toolbar
- `polls.toolbar.search.input` — type="search" placeholder « Mot-clé… » (ligne 247-254)
- `polls.toolbar.status.select` — Options « Tous », « Ouverts », « Publiés », « Archivés » (ligne 238-245)
- `polls.toolbar.cta.button` — Link vers `/polls/new`, label « Lancer un sondage » avec IconPen (ligne 255-258)

#### Grille
- `polls.grid.counter` — « {count} sondage{s} » avec IconBarChart (ligne 270-273)
- `polls.grid.item.tag` — « Sondage » badge (ligne 179)
- `polls.grid.item.title` — Question (ligne 180)
- `polls.grid.item.description` — Description (ligne 181)
- `polls.grid.item.status-tag` — « Ouvert » ou « Clôturé » (ligne 182-184)
- `polls.grid.item.membership-indicator` — « Réservé aux adhérent·es » ou « Vote ouvert » (ligne 185)

#### États
- `polls.state.empty` — EmptyState « Aucun sondage disponible », description « Lancez le premier sondage. », cta « Lancer un sondage » (ligne 275-282)

---

### PollDetailPage (`/polls/:slug`)
**Fichier** : web/src/pages/PollDetailPage.tsx

#### Navigation
- `poll-detail.back-link` — Link vers `/polls`, « Tous les sondages » avec IconArrowLeft (ligne 210-212)

#### Hero
- `poll-detail.hero.tag` — « Sondage clôturé » ou « Sondage ouvert » (ligne 214-218)
- `poll-detail.hero.title` — H1 `{poll.question}` (ligne 221)
- `poll-detail.hero.description` — p description (ligne 224)

#### Options
- `poll-detail.options.item.button` — Button « {option.label} » | Icon IconCheck si selected | onClick toggle vote | aria-pressed (ligne 230-235)
- `poll-detail.options.item.percentage` — « {percentage}% » (ligne 237-238) visible seulement si voted/closed
- `poll-detail.options.item.count` — « {count} votes » (ligne 239) visible seulement si voted/closed
- `poll-detail.options.item.progressBar` — Progress bar (ligne 236)

#### Actions
- `poll-detail.actions.vote-button` — « Valider mon vote » ou « Retirer mon vote » (ligne 243-248) | aria-busy pendant submission
- `poll-detail.actions.share-button` — « Partager » avec IconShare (ligne 249-250)
- `poll-detail.actions.share-confirm` — role="status" « Lien copié. » (ligne 251-255)

#### Info
- `poll-detail.info.closed` — p « Ce sondage est clôturé. » (ligne 257)
- `poll-detail.info.restricted` — p « Ce sondage est réservé aux adhérent·es. » (ligne 258)

---

### PollCreatePage (`/polls/new`)
**Fichier** : web/src/pages/PollCreatePage.tsx

#### Identité
- `poll-create.h1` — H1 « Lancer un sondage » (ligne 223)
- `poll-create.lead` — « Posez une question neutre à votre base pour sonder l'opinion. » (ligne 224-225)

#### Champs
- `poll-create.form.question.label` — « Question » | input min 50 / max 200, placeholder « Ex: Faut-il baisser les salaires des cadres ? » (ligne 238-247) | help « 50 à 200 caractères »
- `poll-create.form.description.label` — « Description (optionnel) » | textarea max 500, placeholder « Contexte optionnel du sondage » (ligne 254-262) | help « Jusqu'à 500 caractères »

#### Options de réponse
- `poll-create.form.options.label` — « Options de réponse » | help « 2 à 6 options » (ligne 269)
- `poll-create.form.options.item.input` — Input placeholder « Option {index+1} » (ligne 272-280)
- `poll-create.form.options.item.remove-button` — Button avec IconClose (ligne 281-283) | disabled si options.length <= 2
- `poll-create.form.options.add-button` — « Ajouter une option » (ligne 287-289)

#### Autres champs
- `poll-create.form.closesAt.label` — « Fermeture du sondage (optionnel) » | type="datetime-local" (ligne 296-303)
- `poll-create.form.membership.label` — « Réservé aux adhérent·es » | checkbox (ligne 307-312)

#### Submit
- `poll-create.form.submit` — « Publier le sondage » ou « Publication... » (ligne 315-321)
- `poll-create.error.global` — role="alert" globalError (ligne 313-317)

---

### MediaPage (`/media`)
**Fichier** : web/src/pages/MediaPage.tsx

#### Identité
- `media.h1` — H1 « Média indépendant » (ligne 226)

#### Hero
- `media.hero.lead` — « Articles, enquêtes, vidéos, podcasts. Des contenus produits et modérés collectivement. » (ligne 227-228)

#### Toolbar
- `media.toolbar.search.input` — type="search" placeholder « Mot-clé… » (ligne 253-260)
- `media.toolbar.format.select` — Options « Tous les formats », « Article », « Vidéo », « Podcast », « Photo », « Enquête » (ligne 243-251)
- `media.toolbar.cta.button` — Link vers `/media/new`, label « Proposer un article » avec IconPen (ligne 261-264)

#### Grille
- `media.grid.counter` — « {count} article{s} » avec IconSpark (ligne 271-274)
- `media.grid.item.tag` — Format tag (Article/Vidéo/Podcast/Photo/Enquête) (ligne 181)
- `media.grid.item.title` — Titre article (ligne 182)
- `media.grid.item.summary` — 3-line clamp (ligne 183)
- `media.grid.item.date` — Date published_at ou created_at (ligne 184)
- `media.grid.item.author` — Author snippet (ligne 184)

#### États
- `media.state.empty` — EmptyState « Aucun article disponible », description « Proposez le premier article. », cta « Proposer un article » (ligne 276-283)

---

### ArticleDetailPage (`/media/:slug`)
**Fichier** : web/src/pages/ArticleDetailPage.tsx

#### Navigation
- `article-detail.back-link` — Link vers `/media`, « Tous les articles » avec IconArrowLeft (ligne 244-246)

#### Header
- `article-detail.hero.tag` — Format tag (ligne 248-249)
- `article-detail.hero.title` — H1 (ligne 252)
- `article-detail.hero.summary` — p résumé (ligne 255)
- `article-detail.hero.metadata.date` — Date published_at (ligne 258-260)
- `article-detail.hero.metadata.author` — Author snippet (ligne 261-263)

#### Body
- `article-detail.section.body` — p article.body avec whitespace pre-wrap (ligne 268)

#### Réactions
- `article-detail.reactions.title` — « Réactions » (ligne 274)
- `article-detail.reactions.button.like` — « ❤️ J'aime » + count (ligne 278-285)
- `article-detail.reactions.button.support` — « 👍 Je soutiens » + count (ligne 286-293)
- `article-detail.reactions.button.disagree` — « 👎 Je ne suis pas d'accord » + count (ligne 294-301)
- `article-detail.reactions.button.curious` — « 🤔 Curieux·se » + count (ligne 302-309)
- `article-detail.reactions.button.outrage` — « 😤 Indigné·e » + count (ligne 310-317)

#### Commentaires
- `article-detail.comments.title` — « Commentaires ({count}) » (ligne 324)
- `article-detail.comments.form.label` — « Ajouter un commentaire » si authenticated, sinon « Connectez-vous pour commenter » (ligne 330-349)
- `article-detail.comments.form.textarea` — id="article-comment-body" placeholder « Votre commentaire… » min 10 chars (ligne 338-345)
- `article-detail.comments.form.submit` — « Envoyer » (ligne 346)
- `article-detail.comments.item.author` — Author snippet (ligne 356-357)
- `article-detail.comments.item.date` — Date created_at (ligne 358)
- `article-detail.comments.item.body` — Comment body (ligne 359)

---

### ArticleCreatePage (`/media/new`)
**Fichier** : web/src/pages/ArticleCreatePage.tsx

#### Identité
- `article-create.back-link` — Link vers `/media`, label « Retour aux articles » avec IconArrowLeft (ligne 195-196)
- `article-create.h1` — H1 « Proposer un article » (ligne 198)
- `article-create.lead` — texte explicatif (ligne 199-201)

#### Formulaire
- `article-create.form` — form aria-label="Création d'article", noValidate (ligne 204)
- `article-create.error-global` — div role="alert" (ligne 205-208)

#### Champs
- `article-create.form.title.label` — « Titre » | type=text required, helper « Entre {ARTICLE_TITLE_MIN} et {ARTICLE_TITLE_MAX} caractères. » (ligne 212-228)
- `article-create.form.format.label` — « Format » | select options : `article`, `video`, `podcast`, `photo`, `enquete` (ligne 231-248)
- `article-create.form.summary.label` — « Résumé » | textarea required, helper « Entre {ARTICLE_SUMMARY_MIN} et {ARTICLE_SUMMARY_MAX} caractères. », minHeight 100 (ligne 251-267)
- `article-create.form.body.label` — « Contenu » | textarea required, helper « Entre {ARTICLE_BODY_MIN} et {ARTICLE_BODY_MAX} caractères. » (ligne 270-286)
- `article-create.form.cover.label` — « URL d'illustration (facultatif) » | type=url, placeholder « https://… » (ligne 289-302)

#### Submit
- `article-create.form.submit` — Button « Publier l'article » ou « Publication… » (ligne 304-312)

---

## CATÉGORIE 2: SERVICES SOLIDAIRES

### ServicesHubPage (`/services`)
**Fichier** : web/src/pages/services/ServicesHubPage.tsx

#### Identité
- `services-hub.h1` — H1 « Services solidaires » (ligne 189)

#### Hero
- `services-hub.hero.lead` — « Hébergement, covoiturage, marketplace, prêt, jardins, SEL, crowdfunding. Sans commission, sans pub, entre voisin·es engagé·es. » (ligne 191-193)

#### Cards (7 services)
- `services-hub.grid.item.housing.icon` — IconHome (ligne 26)
- `services-hub.grid.item.housing.title` — « Hébergement solidaire » (ligne 24)
- `services-hub.grid.item.housing.pitch` — « Offrez ou trouvez un toit le temps d'une lutte, d'une formation, d'un déplacement militant. » (ligne 25)
- `services-hub.grid.item.housing.cta` — « Accéder → » vers `/services/housing` (ligne 203)

- `services-hub.grid.item.carpooling.icon` — IconCar (ligne 32)
- `services-hub.grid.item.carpooling.title` — « Covoiturage citoyen » (ligne 30)
- `services-hub.grid.item.carpooling.pitch` — « Partagez vos trajets pour rejoindre une manif, une AG ou une mobilisation locale. » (ligne 31)

- `services-hub.grid.item.marketplace.icon` — IconStore (ligne 38)
- `services-hub.grid.item.marketplace.title` — « Marketplace locale » (ligne 36)
- `services-hub.grid.item.marketplace.pitch` — « Achetez, vendez ou donnez près de chez vous, sans commission et sans intermédiaire. » (ligne 37)

- `services-hub.grid.item.lending.icon` — IconTool (ligne 44)
- `services-hub.grid.item.lending.title` — « Prêt entre voisin·es » (ligne 42)
- `services-hub.grid.item.lending.pitch` — « Empruntez un outil, un objet, un équipement — payez en T99CP ou gratuitement. » (ligne 43)

- `services-hub.grid.item.garden.icon` — IconLeaf (ligne 50)
- `services-hub.grid.item.garden.title` — « Jardins partagés » (ligne 48)
- `services-hub.grid.item.garden.pitch` — « Proposez ou rejoignez un jardin collectif, partagez parcelles, semences et savoir-faire. » (ligne 49)

- `services-hub.grid.item.sel.icon` — IconClock (ligne 56)
- `services-hub.grid.item.sel.title` — « SEL — Services d'échange local » (ligne 54)
- `services-hub.grid.item.sel.pitch` — « Échangez vos heures et compétences en T99CP : cours, bricolage, garde, traduction. » (ligne 55)

- `services-hub.grid.item.crowdfunding.icon` — IconCoin (ligne 62)
- `services-hub.grid.item.crowdfunding.title` — « Crowdfunding solidaire » (ligne 60)
- `services-hub.grid.item.crowdfunding.pitch` — « Soutenez ou lancez une cagnotte pour un projet local, une lutte, une initiative citoyenne. » (ligne 61)

#### Trust Section
- `services-hub.trust.title` — « Confiance & RGPD » (ligne 225)
- `services-hub.trust.text` — « Tous les échanges sont privés. Le T99CP est utilisable comme monnaie locale (jamais obligatoire). Aucune commission, aucune publicité — Maintenant ! est financé par les adhésions. » (ligne 227-230)

---

### HousingPage (`/services/housing`)
**Fichier** : web/src/pages/services/HousingPage.tsx

#### Identité
- `housing.h1` — H1 « Hébergement solidaire » (ligne 240)

#### Hero
- `housing.hero.lead` — « Trouvez ou proposez un toit le temps d'une lutte, d'une formation, d'un déplacement militant. Une communauté entraide, pas une plateforme commerciale. » (ligne 242-244)

#### Toolbar
- `housing.toolbar.search.label` — « Rechercher un hébergement » (ligne 250)
- `housing.toolbar.search.input` — type="search" placeholder « Titre, ville, mot-clé… » (ligne 262-269)
- `housing.toolbar.city.input` — placeholder « Ville » aria-label « Filtrer par ville » (ligne 271-278)
- `housing.toolbar.capacity.input` — type="number" placeholder « Places min. » aria-label « Capacité minimum » min=1 max=20 (ligne 279-288)
- `housing.toolbar.cta.button` — Link vers `/services/housing/new`, « Proposer un hébergement » avec IconPen (ligne 295-298)

#### Grille
- `housing.grid.counter` — « {count} hébergement{s} » optionnel « · {city} » avec IconHome (ligne 339-342)
- `housing.grid.item.tag` — « Hébergement » badge avec IconHome (ligne 196)
- `housing.grid.item.title` — Titre housing (ligne 199)
- `housing.grid.item.summary` — Description 3-line clamp (ligne 200)
- `housing.grid.item.city` — avec IconPin (ligne 203-204)
- `housing.grid.item.capacity` — « {capacity} place{s} » avec IconUsers (ligne 206-208)

#### États
- `housing.state.loading` — « Chargement des hébergements… » (ligne 308-311)
- `housing.state.empty` — EmptyState IconHome « Aucun hébergement trouvé », « Essayez d'autres filtres, ou proposez le premier sur votre territoire. », cta « Proposer un hébergement » (ligne 314-321)

---

### HousingDetailPage (`/services/housing/:id`)
**Fichier** : web/src/pages/services/HousingDetailPage.tsx

#### Identité & Navigation
- `housing-detail.back-link` — Link vers `/services/housing`, label « Tous les hébergements » + IconArrowLeft (ligne 230-231)
- `housing-detail.h1` — H1 `{housing.title}` (ligne 238)

#### Hero
- `housing-detail.hero.tag` — Tag « Hébergement solidaire » avec IconHome (ligne 234-236)
- `housing-detail.hero.meta.city` — IconPin + `{housing.city}` (ligne 240-242)
- `housing-detail.hero.meta.capacity` — IconUsers + « {housing.capacity} place{s} » (ligne 244-246)
- `housing-detail.hero.meta.dates` — IconCalendar + « Du {fromLabel} au {toLabel} » ou variantes (ligne 248-252)
- `housing-detail.hero.description` — Paragraphe `{housing.description}` whiteSpace pre-wrap (ligne 255)

#### Actions
- `housing-detail.cta.request` — Link vers `/services/housing/{id}/request`, label « Faire une demande » + IconCalendar (visible si NOT isHost) (ligne 266-268)
- `housing-detail.cta.owner-badge` — Span « Vous êtes l'hôte » + IconHome (visible si isHost), aria-label « Vous êtes l'hôte de cette annonce » (ligne 258-263)
- `housing-detail.cta.share` — Button « Partager » + IconShare (ligne 270-272)
- `housing-detail.cta.share-confirm` — Span role="status" « Lien copié. » (ligne 273-276)

#### États
- `housing-detail.state.loading` — role="status" aria-live="polite" « Chargement de l'hébergement… » (ligne 172-174)
- `housing-detail.state.error` — role="alert" message Postgrest ou « Hébergement introuvable. » (ligne 182-184)
- `housing-detail.state.notfound` — Navigate vers `/services/housing` (ligne 166)

---

### HousingCreatePage (`/services/housing/new`)
**Fichier** : web/src/pages/services/HousingCreatePage.tsx

#### Identité & Navigation
- `housing-create.back-link` — Link vers `/services/housing`, « Retour aux hébergements » + IconArrowLeft (ligne 203-204)
- `housing-create.h1` — H1 « Proposer un hébergement » (ligne 206)
- `housing-create.lead` — Texte explicatif (ligne 207-209)

#### Formulaire
- `housing-create.form` — aria-label="Création d'un hébergement", noValidate (ligne 212)
- `housing-create.error-global` — role="alert" (ligne 213-217)

#### Champs
- `housing-create.form.title.label` — « Titre de l'annonce » | type=text required, helper « Entre {HOUSING_TITLE_MIN} et {HOUSING_TITLE_MAX} caractères. » (ligne 220-238)
- `housing-create.form.description.label` — « Description » | textarea, helper « Entre {HOUSING_DESCRIPTION_MIN} et {HOUSING_DESCRIPTION_MAX} caractères. Chambre, salon, équipements, accès, conditions… » (ligne 240-257)
- `housing-create.form.city.label` — « Ville » | required, helper « Entre {HOUSING_CITY_MIN} et {HOUSING_CITY_MAX} caractères. » (ligne 261-277)
- `housing-create.form.capacity.label` — « Capacité (places) » | type=number required min HOUSING_CAPACITY_MIN max HOUSING_CAPACITY_MAX, helper « Entre {min} et {max} personnes. » (ligne 279-297)
- `housing-create.form.from.label` — « Disponible à partir du (facultatif) » | type=date (ligne 302-314)
- `housing-create.form.to.label` — « Jusqu'au (facultatif) » | type=date (ligne 316-328)

#### Submit
- `housing-create.submit` — Button « Publier l'annonce » ou « Publication… » (ligne 331-339)

---

### HousingRequestPage (`/services/housing/:id/request`)
**Fichier** : web/src/pages/services/HousingRequestPage.tsx

#### Identité
- `housing-request.h1` — H1 « Faire une demande » (ligne 289)

#### Navigation
- `housing-request.back-link` — Link vers `/services/housing/{id}`, « Retour à l'annonce » avec IconArrowLeft (ligne 286-288)

#### Summary Card
- `housing-request.summary.card.title` — `{housing.title}` (ligne 292)
- `housing-request.summary.card.type` — « Hébergement solidaire » avec IconHome (ligne 295-297)
- `housing-request.summary.card.city` — avec IconPin (ligne 298-301)

#### Champs
- `housing-request.form.message.label` — « Message à l'hôte » (ligne 318-319)
- `housing-request.form.message.textarea` — id="housing-req-message" placeholder « Présentez-vous, expliquez votre demande, nombre de personnes… » min HOUSING_REQUEST_MESSAGE_MIN=20 / max HOUSING_REQUEST_MESSAGE_MAX=500 chars (ligne 321-328)
- `housing-request.form.message.help` — « Entre {min} et {max} caractères. Qui vous êtes, pour quel projet militant, combien de personnes… » (ligne 329-331)
- `housing-request.form.startsOn.label` — « Date d'arrivée » | type="date" required (ligne 341-349)
- `housing-request.form.endsOn.label` — « Date de départ » | type="date" required (ligne 356-364)

#### Submit
- `housing-request.form.submit` — « Envoyer la demande » ou « Envoi… » avec IconCalendar (ligne 369-377)

#### Success State
- `housing-request.success.h1` — H1 « Demande envoyée » (ligne 260)
- `housing-request.success.box` — role="status" Icon IconCheckCircle + « Votre demande a bien été transmise à l'hôte. » + description « Vous serez notifié dès que l'hôte accepte ou refuse. En attendant, vous pouvez consulter d'autres hébergements. » + button « Retour à l'annonce » (ligne 260-276)

---

### MarketplacePage (`/services/marketplace`)
**Fichier** : web/src/pages/services/MarketplacePage.tsx

#### Identité
- `marketplace.h1` — H1 « Marketplace solidaire » (ligne 237)

#### Hero
- `marketplace.hero.lead` — « Vendez, échangez, donnez du matériel entre adhérents. Euros ou T99CP, à vous de choisir. Une seconde vie pour vos affaires, sans plateforme intermédiaire. » (ligne 239-241)

#### Toolbar
- `marketplace.toolbar.search.form` — role="search" aria-label « Rechercher une annonce » (ligne 245-292)
- `marketplace.toolbar.city.input` — placeholder « Ville » (ligne 251-257)
- `marketplace.toolbar.category.input` — placeholder « Catégorie » (ligne 259-265)
- `marketplace.toolbar.search.input` — type="search" placeholder « Mot-clé… » (ligne 272-279)
- `marketplace.toolbar.cta.button` — Link vers `/services/marketplace/new`, « Publier une annonce » avec IconPen (ligne 287-290)

#### Grille
- `marketplace.grid.counter` — « {count} annonce{s} » avec IconCart (ligne 331-334)
- `marketplace.grid.item.category` — Category tag avec IconCart (ligne 195-197)
- `marketplace.grid.item.title` — Titre item (ligne 199)
- `marketplace.grid.item.city` — avec IconPin (ligne 201-204)
- `marketplace.grid.item.price` — formatPrice avec IconBadge — « {price} € » ou « {cost} T99CP » ou « Sur demande » (ligne 206-209)

#### États
- `marketplace.state.empty` — EmptyState IconCart « Aucune annonce disponible », « Publiez la première annonce de votre ville. », cta « Publier une annonce » (ligne 306-313)

---

### MarketplaceDetailPage (`/services/marketplace/:id`)
**Fichier** : web/src/pages/services/MarketplaceDetailPage.tsx

#### Navigation
- `marketplace-detail.back-link` — Link vers `/services/marketplace`, « Toutes les annonces » avec IconArrowLeft (ligne 216-218)

#### Hero
- `marketplace-detail.hero.category` — Category tag avec IconCart (ligne 220-222)
- `marketplace-detail.hero.title` — H1 (ligne 224)
- `marketplace-detail.hero.sold-badge` — role="status" « Annonce clôturée » si item.is_sold (ligne 225-228)

#### Meta Row
- `marketplace-detail.meta.city` — avec IconPin (ligne 231-233)
- `marketplace-detail.meta.price` — formatPrice avec IconBadge (ligne 235-237)

#### Description
- `marketplace-detail.section.description` — p item.description (ligne 240)

#### Actions
- `marketplace-detail.actions.owner-indicator` — « Vous êtes le vendeur » avec IconCart si owner (ligne 243-245)
- `marketplace-detail.actions.contact-button` — ContactAuthorButton (ligne 248) si !isOwner && !is_sold
- `marketplace-detail.actions.share-button` — « Partager » avec IconShare (ligne 250-252)
- `marketplace-detail.actions.share-confirm` — role="status" « Lien copié. » (ligne 253-256)

---

### MarketplaceCreatePage (`/services/marketplace/new`)
**Fichier** : web/src/pages/services/MarketplaceCreatePage.tsx

#### Identité & Navigation
- `marketplace-create.back-link` — Link vers `/services/marketplace`, « Retour aux annonces » + IconArrowLeft (ligne 205-206)
- `marketplace-create.h1` — H1 « Publier une annonce » (ligne 208)
- `marketplace-create.lead` — Texte explicatif (ligne 209-211)

#### Formulaire
- `marketplace-create.form` — aria-label="Création d'une annonce marketplace", noValidate (ligne 214-218)
- `marketplace-create.error-global` — role="alert" (ligne 220-223)

#### Champs
- `marketplace-create.form.title.label` — « Titre » | type=text required, helper « Entre {MARKETPLACE_TITLE_MIN} et {MARKETPLACE_TITLE_MAX} caractères. » (ligne 226-243)
- `marketplace-create.form.category.label` — « Catégorie » | type=text required, helper « Entre {MARKETPLACE_CATEGORY_MIN} et {MARKETPLACE_CATEGORY_MAX} caractères. » (ligne 246-263)
- `marketplace-create.form.city.label` — « Ville » | required, helper « Entre {MARKETPLACE_CITY_MIN} et {MARKETPLACE_CITY_MAX} caractères. » (ligne 265-282)
- `marketplace-create.form.price.label` — « Prix en euros (facultatif) » | type=number min=0 max=MARKETPLACE_PRICE_MAX step=0.5, helper « Renseignez au moins un prix en euros OU T99CP. » (ligne 286-302)
- `marketplace-create.form.t99cp.label` — « Coût en T99CP (facultatif) » | type=number min=0 max=MARKETPLACE_T99CP_MAX step=1, helper « Échange en T99CP plutôt qu'en euros. » (ligne 304-320)
- `marketplace-create.form.description.label` — « Description (facultatif) » | textarea, helper « Jusqu'à {MARKETPLACE_DESCRIPTION_MAX} caractères. » (ligne 323-339)

#### Submit
- `marketplace-create.submit` — Button « Publier l'annonce » ou « Publication… » (ligne 341-349)

---

### CarpoolingPage (`/services/carpooling`)
**Fichier** : web/src/pages/services/CarpoolingPage.tsx

> Inventaire partiellement inféré par Agent B (page non lue directement) — structure attendue cohérente avec les autres pages de listing.

#### Identité
- `carpooling.h1` — H1 « Covoiturage citoyen »

#### Toolbar (inféré)
- `carpooling.toolbar.origin.input` — placeholder « Ville de départ »
- `carpooling.toolbar.destination.input` — placeholder « Destination »
- `carpooling.toolbar.date.input` — type=date
- `carpooling.toolbar.search.input` — type=search
- `carpooling.toolbar.cta.button` — Link vers `/services/carpooling/new`, « Proposer un trajet »

#### Grille (inféré)
- `carpooling.grid.item.route` — « {origin} → {destination} »
- `carpooling.grid.item.date` — formatDeparture
- `carpooling.grid.item.seats` — « {count} place{s} » avec IconUsers
- `carpooling.grid.item.price` — « Gratuit » si <= 0, sinon « {price} € »

---

### CarpoolingDetailPage (`/services/carpooling/:id`)
**Fichier** : web/src/pages/services/CarpoolingDetailPage.tsx

#### Identité & Navigation
- `carpooling-detail.back-link` — Link vers `/services/carpooling`, label « Tous les covoiturages » + IconArrowLeft (ligne 216-217)
- `carpooling-detail.h1` — H1 « {origin_city} → {destination_city} » (ligne 224-225)

#### Hero
- `carpooling-detail.hero.tag` — Tag « Covoiturage citoyen » + IconCar (ligne 220-222)
- `carpooling-detail.hero.meta.departure` — IconCalendar + formatDeparture (ligne 228-230)
- `carpooling-detail.hero.meta.seats` — IconUsers + « {seats} place{s} » (ligne 232-234)
- `carpooling-detail.hero.meta.price` — IconPin + formatPrice → « Gratuit » ou « {price} € » (ligne 236-238)
- `carpooling-detail.hero.notes` — Paragraphe optionnel `{carpooling.notes}` (ligne 241)

#### Actions
- `carpooling-detail.cta.contact` — ContactAuthorButton si user?.id !== driver_id (ligne 244-245)
- `carpooling-detail.cta.share` — Button « Partager » + IconShare (ligne 247-249)
- `carpooling-detail.cta.share-confirm` — Span role="status" « Lien copié. » (ligne 250-253)

#### États
- `carpooling-detail.state.loading` — role="status" « Chargement du covoiturage… » (ligne 167-169)
- `carpooling-detail.state.error` — role="alert" message ou « Covoiturage introuvable. » (ligne 177-179)
- `carpooling-detail.state.notfound` — Navigate vers `/services/carpooling` (ligne 161)

---

### CarpoolingCreatePage (`/services/carpooling/new`)
**Fichier** : web/src/pages/services/CarpoolingCreatePage.tsx

#### Identité & Navigation
- `carpooling-create.back-link` — Link vers `/services/carpooling`, « Retour aux covoiturages » + IconArrowLeft (ligne 212-213)
- `carpooling-create.h1` — H1 « Proposer un trajet » (ligne 215)
- `carpooling-create.lead` — Texte explicatif (ligne 216-218)

#### Formulaire
- `carpooling-create.form` — aria-label="Création d'un covoiturage", noValidate (ligne 221)
- `carpooling-create.error-global` — role="alert" (ligne 222-225)

#### Champs
- `carpooling-create.form.origin.label` — « Ville de départ » | type=text required, helper « Entre {CARPOOLING_CITY_MIN} et {CARPOOLING_CITY_MAX} caractères. » (ligne 230-246)
- `carpooling-create.form.destination.label` — « Ville d'arrivée » | required, helper « Entre {CARPOOLING_CITY_MIN} et {CARPOOLING_CITY_MAX} caractères. » (ligne 248-266)
- `carpooling-create.form.date.label` — « Date de départ » | type=date required (ligne 271-283)
- `carpooling-create.form.time.label` — « Heure de départ » | type=time, default « 08:00 » (ligne 286-296)
- `carpooling-create.form.seats.label` — « Places disponibles » | type=number required min CARPOOLING_SEATS_MIN max CARPOOLING_SEATS_MAX, helper « Entre {min} et {max} places. », default « 3 » (ligne 301-318)
- `carpooling-create.form.price.label` — « Tarif (€ par passager) » | type=number min=0 max=CARPOOLING_PRICE_MAX step=0.5, helper « 0 € si gratuit, sinon contribution carburant. », default « 0 » (ligne 321-337)
- `carpooling-create.form.notes.label` — « Notes (facultatif) » | textarea, helper « Détails utiles : point de rendez-vous, événement ciblé, contraintes… » (ligne 341-357)

#### Submit
- `carpooling-create.submit` — Button « Publier le trajet » ou « Publication… » (ligne 359-367)

---

### LendingPage (`/services/lending`)
**Fichier** : web/src/pages/services/LendingPage.tsx

> Inventaire partiellement inféré par Agent B (page non lue directement) — structure attendue cohérente avec les autres pages de listing.

#### Identité
- `lending.h1` — H1 « Prêt d'objets entre voisins »

#### Toolbar (inféré)
- `lending.toolbar.city.input` — « Ville »
- `lending.toolbar.category.input` — « Catégorie »
- `lending.toolbar.search.input` — type=search
- `lending.toolbar.cta.button` — Link vers `/services/lending/new`, « Proposer un prêt »

#### Grille (inféré)
- `lending.grid.item.title` — Titre item
- `lending.grid.item.city` — avec IconPin
- `lending.grid.item.cost` — « Gratuit » si <= 0, sinon « {cost} T99CP »

---

### LendingDetailPage (`/services/lending/:id`)
**Fichier** : web/src/pages/services/LendingDetailPage.tsx

#### Identité & Navigation
- `lending-detail.back-link` — Link vers `/services/lending`, label « Toutes les annonces » + IconArrowLeft (ligne 201-202)
- `lending-detail.h1` — H1 `{lending.title}` (ligne 209)

#### Hero
- `lending-detail.hero.tag` — Tag `{lending.category}` + IconList (ligne 205-207)
- `lending-detail.hero.meta.city` — IconPin + `{lending.city}` (ligne 211-213)
- `lending-detail.hero.meta.cost` — IconBadge + formatCost → « Gratuit » ou « {cost} T99CP » (ligne 215-217)
- `lending-detail.hero.description` — Paragraphe optionnel `{lending.description}` (ligne 220)

#### Actions
- `lending-detail.cta.contact` — ContactAuthorButton ou « Vous êtes le propriétaire », selon isOwner = user?.id === owner_id (ligne 223-228)
- `lending-detail.cta.share` — Button « Partager » + IconShare (ligne 230-232)
- `lending-detail.cta.share-confirm` — Span role="status" « Lien copié. » (ligne 233-236)

#### États
- `lending-detail.state.loading` — role="status" « Chargement de l'annonce… » (ligne 153-155)
- `lending-detail.state.error` — role="alert" message ou « Annonce introuvable. » (ligne 163-165)
- `lending-detail.state.notfound` — Navigate vers `/services/lending` (ligne 147)

---

### LendingCreatePage (`/services/lending/new`)
**Fichier** : web/src/pages/services/LendingCreatePage.tsx

#### Identité & Navigation
- `lending-create.back-link` — Link vers `/services/lending`, « Retour aux annonces » + IconArrowLeft (ligne 200-201)
- `lending-create.h1` — H1 « Proposer un prêt » (ligne 203)
- `lending-create.lead` — Texte explicatif (ligne 204-206)

#### Formulaire
- `lending-create.form` — aria-label="Création d'un prêt", noValidate (ligne 208-212)
- `lending-create.error-global` — role="alert" (ligne 214-217)

#### Champs
- `lending-create.form.title.label` — « Titre » | type=text required, helper « Entre {LENDING_TITLE_MIN} et {LENDING_TITLE_MAX} caractères. » (ligne 221-237)
- `lending-create.form.category.label` — « Catégorie » | required, helper « Entre {LENDING_CATEGORY_MIN} et {LENDING_CATEGORY_MAX} caractères. » (ligne 241-257)
- `lending-create.form.city.label` — « Ville » | required, helper « Entre {LENDING_CITY_MIN} et {LENDING_CITY_MAX} caractères. » (ligne 259-275)
- `lending-create.form.cost.label` — « Coût en T99CP » | type=number min=0 max=LENDING_T99CP_MAX step=1, helper « 0 si gratuit, sinon coût symbolique en T99CP. », default « 0 » (ligne 279-295)
- `lending-create.form.description.label` — « Description (facultatif) » | textarea, helper « Jusqu'à {LENDING_DESCRIPTION_MAX} caractères. » (ligne 298-313)

#### Submit
- `lending-create.submit` — Button « Publier l'annonce » ou « Publication… » (ligne 315-323)

---

### GardenPage (`/services/garden`)
**Fichier** : web/src/pages/services/GardenPage.tsx

> Inventaire partiellement inféré par Agent B (page non lue directement) — structure attendue cohérente avec les autres pages de listing.

#### Identité
- `garden.h1` — H1 « Jardins partagés »

#### Toolbar (inféré)
- `garden.toolbar.city.input` — « Ville »
- `garden.toolbar.search.input` — type=search
- `garden.toolbar.available.checkbox` — « Parcelles libres »
- `garden.toolbar.cta.button` — Link vers `/services/garden/new`, « Référencer un jardin »

#### Grille (inféré)
- `garden.grid.item.name` — Garden name
- `garden.grid.item.city` — avec IconPin
- `garden.grid.item.size` — « {size}m² » optionnel
- `garden.grid.item.spots` — « {count} parcelle(s) libre(s) »

---

### GardenDetailPage (`/services/garden/:id`)
**Fichier** : web/src/pages/services/GardenDetailPage.tsx

#### Identité & Navigation
- `garden-detail.back-link` — Link vers `/services/garden`, « Tous les jardins » + IconArrowLeft (ligne 196-197)
- `garden-detail.h1` — H1 `{garden.name}` (ligne 204)

#### Hero
- `garden-detail.hero.tag` — Tag « Jardin partagé » + IconHome (ligne 200-202)
- `garden-detail.hero.meta.city` — IconPin + `{garden.city}` (ligne 206-208)
- `garden-detail.hero.meta.size` — IconHome + « {size_sqm} m² » si non null (ligne 210-214)
- `garden-detail.hero.meta.spots` — IconUsers + « {available_spots} parcelle{s} libre{s} » (ligne 216-220)
- `garden-detail.hero.description` — Paragraphe optionnel `{garden.description}` (ligne 222)

#### Actions
- `garden-detail.cta.manager-badge` — Span « Vous êtes le responsable » + IconHome si isManager, aria-label « Vous êtes le responsable de ce jardin » (ligne 225-227)
- `garden-detail.cta.contact` — ContactAuthorButton si !isManager (ligne 230)
- `garden-detail.cta.share` — Button « Partager » + IconShare (ligne 232-234)
- `garden-detail.cta.share-confirm` — Span role="status" « Lien copié. » (ligne 235-238)

#### États
- `garden-detail.state.loading` — role="status" « Chargement du jardin… » (ligne 148-150)
- `garden-detail.state.error` — role="alert" message ou « Jardin introuvable. » (ligne 158-160)
- `garden-detail.state.notfound` — Navigate vers `/services/garden` (ligne 142)

---

### GardenCreatePage (`/services/garden/new`)
**Fichier** : web/src/pages/services/GardenCreatePage.tsx

#### Identité & Navigation
- `garden-create.back-link` — Link vers `/services/garden`, « Retour aux jardins » + IconArrowLeft (ligne 201-202)
- `garden-create.h1` — H1 « Référencer un jardin partagé » (ligne 204)
- `garden-create.lead` — Texte explicatif (ligne 205-207)

#### Formulaire
- `garden-create.form` — aria-label="Création d'un jardin", noValidate (ligne 210-214)
- `garden-create.error-global` — role="alert" (ligne 216-219)

#### Champs
- `garden-create.form.name.label` — « Nom du jardin » | type=text required, helper « Entre {GARDEN_NAME_MIN} et {GARDEN_NAME_MAX} caractères. » (ligne 223-239)
- `garden-create.form.city.label` — « Ville » | required, helper « Entre {GARDEN_CITY_MIN} et {GARDEN_CITY_MAX} caractères. » (ligne 242-258)
- `garden-create.form.size.label` — « Surface (m², facultatif) » | type=number min=1 max=GARDEN_SIZE_MAX step=1 (ligne 262-277)
- `garden-create.form.spots.label` — « Parcelles libres » | type=number required min=0 max=GARDEN_SPOTS_MAX step=1, default « 0 » (ligne 279-295)
- `garden-create.form.description.label` — « Description (facultatif) » | textarea, helper « Jusqu'à {GARDEN_DESCRIPTION_MAX} caractères. » (ligne 299-314)

#### Submit
- `garden-create.submit` — Button « Référencer le jardin » ou « Publication… » (ligne 316-324)

---

### SelPage (`/services/sel`)
**Fichier** : web/src/pages/services/SelPage.tsx

> Inventaire partiellement inféré par Agent B (page non lue directement) — structure attendue cohérente avec les autres pages de listing.

#### Identité
- `sel.h1` — H1 « SEL — Système d'Échange Local »

#### Toolbar (inféré)
- `sel.toolbar.city.input` — « Ville »
- `sel.toolbar.category.input` — « Catégorie »
- `sel.toolbar.search.input` — type=search
- `sel.toolbar.cta.button` — Link vers `/services/sel/new`, « Proposer une offre »

#### Grille (inféré)
- `sel.grid.item.title` — Offer title
- `sel.grid.item.city` — avec IconPin
- `sel.grid.item.rate` — « {rate} T99CP/h » ou « {rate} T99CP par unité »

---

### SelDetailPage (`/services/sel/:id`)
**Fichier** : web/src/pages/services/SelDetailPage.tsx

#### Identité & Navigation
- `sel-detail.back-link` — Link vers `/services/sel`, « Toutes les offres SEL » + IconArrowLeft (ligne 197-198)
- `sel-detail.h1` — H1 `{offer.title}` (ligne 205)

#### Hero
- `sel-detail.hero.tag` — Tag `{offer.category}` + IconList (ligne 201-203)
- `sel-detail.hero.meta.city` — IconPin + `{offer.city}` (ligne 207-209)
- `sel-detail.hero.meta.rate` — IconBadge + « {offer.t99cp_rate} T99CP / unité » (ligne 211-214)
- `sel-detail.hero.description` — Paragraphe optionnel `{offer.description}` (ligne 216)

#### Actions
- `sel-detail.cta.author-badge` — Span « Vous êtes l'auteur » + IconSpark si isOwner, aria-label « Vous êtes l'auteur de cette offre » (ligne 219-222)
- `sel-detail.cta.contact` — ContactAuthorButton si !isOwner (ligne 224)
- `sel-detail.cta.share` — Button « Partager » + IconShare (ligne 226-228)
- `sel-detail.cta.share-confirm` — Span role="status" « Lien copié. » (ligne 229-232)

#### États
- `sel-detail.state.loading` — role="status" « Chargement de l'offre… » (ligne 149-151)
- `sel-detail.state.error` — role="alert" message ou « Offre introuvable. » (ligne 159-161)
- `sel-detail.state.notfound` — Navigate vers `/services/sel` (ligne 143)

---

### SelCreatePage (`/services/sel/new`)
**Fichier** : web/src/pages/services/SelCreatePage.tsx

#### Identité & Navigation
- `sel-create.back-link` — Link vers `/services/sel`, « Retour aux offres SEL » + IconArrowLeft (ligne 200-201)
- `sel-create.h1` — H1 « Proposer une offre SEL » (ligne 203)
- `sel-create.lead` — Texte explicatif (ligne 204-206)

#### Formulaire
- `sel-create.form` — aria-label="Création d'une offre SEL", noValidate (ligne 209-213)
- `sel-create.error-global` — role="alert" (ligne 215-218)

#### Champs
- `sel-create.form.title.label` — « Titre » | type=text required, helper « Entre {SEL_TITLE_MIN} et {SEL_TITLE_MAX} caractères. » (ligne 222-238)
- `sel-create.form.category.label` — « Catégorie » | required, helper « Entre {SEL_CATEGORY_MIN} et {SEL_CATEGORY_MAX} caractères. » (ligne 242-258)
- `sel-create.form.city.label` — « Ville » | required, helper « Entre {SEL_CITY_MIN} et {SEL_CITY_MAX} caractères. » (ligne 260-276)
- `sel-create.form.rate.label` — « Tarif en T99CP par unité » | type=number required min=0 max=SEL_RATE_MAX step=1, helper « Par heure, par séance, par prestation… à vous de définir l'unité. », default « 1 » (ligne 280-299)
- `sel-create.form.description.label` — « Description (facultatif) » | textarea, helper « Jusqu'à {SEL_DESCRIPTION_MAX} caractères. » (ligne 302-317)

#### Submit
- `sel-create.submit` — Button « Publier l'offre » ou « Publication… » (ligne 319-327)

---

### CrowdfundingPage (`/services/crowdfunding`)
**Fichier** : web/src/pages/services/CrowdfundingPage.tsx

> Inventaire partiellement inféré par Agent B (page non lue directement) — structure attendue cohérente avec les autres pages de listing.

#### Identité
- `crowdfunding.h1` — H1 « Cagnottes solidaires »

#### Toolbar
- `crowdfunding.toolbar.search.input` — type="search" placeholder « Mot-clé… »
- `crowdfunding.toolbar.cta.button` — Link vers `/services/crowdfunding/new`, « Lancer une cagnotte »

#### Grille
- `crowdfunding.grid.item.title` — Titre cagnotte
- `crowdfunding.grid.item.summary` — 3-line clamp
- `crowdfunding.grid.item.progressBar`
- `crowdfunding.grid.item.progress-label` — « {collected} € collectés »
- `crowdfunding.grid.item.progress-percentage` — « {percentage}% sur {target} € »

---

### CrowdfundingDetailPage (`/services/crowdfunding/:id`)
**Fichier** : web/src/pages/services/CrowdfundingDetailPage.tsx

#### Identité & Navigation
- `crowdfunding-detail.back-link` — Link vers `/services/crowdfunding`, « Toutes les cagnottes » + IconArrowLeft (ligne 256-257)
- `crowdfunding-detail.h1` — H1 `{campaign.title}` (ligne 264)

#### Hero
- `crowdfunding-detail.hero.tag` — Tag « Cagnotte solidaire » + IconFlame (ligne 260-262)
- `crowdfunding-detail.hero.summary` — Paragraphe `{campaign.summary}` (ligne 265)
- `crowdfunding-detail.hero.raised` — Span « {formatEur(raised_eur)} € collectés » (ligne 268)
- `crowdfunding-detail.hero.goal` — Span « {percent}% sur {formatEur(goal_eur)} € » (ligne 269-271)
- `crowdfunding-detail.hero.progress-bar` — div role="presentation" (ligne 273-275)
- `crowdfunding-detail.hero.deadline` — Paragraphe optionnel + IconCheckCircle « Échéance : {deadline} » (ligne 276-279)
- `crowdfunding-detail.hero.body` — Paragraphe optionnel `{campaign.body}` (ligne 282)

#### Actions
- `crowdfunding-detail.cta.organizer-badge` — Span « Vous êtes l'organisateur » + IconFlame si isOrganizer, aria-label « Vous êtes l'organisateur de cette cagnotte » (ligne 285-287)
- `crowdfunding-detail.cta.contribute` — Link vers `/services/crowdfunding/{id}/contribute`, label « Contribuer » + IconCart si !isOrganizer (ligne 290-292)
- `crowdfunding-detail.cta.share` — Button « Partager » + IconShare (ligne 294-296)
- `crowdfunding-detail.cta.share-confirm` — Span role="status" « Lien copié. » (ligne 297-301)

#### États
- `crowdfunding-detail.state.loading` — role="status" « Chargement de la cagnotte… » (ligne 205-207)
- `crowdfunding-detail.state.error` — role="alert" message ou « Cagnotte introuvable. » (ligne 215-217)
- `crowdfunding-detail.state.notfound` — Navigate vers `/services/crowdfunding` (ligne 199)

---

### CrowdfundingCreatePage (`/services/crowdfunding/new`)
**Fichier** : web/src/pages/services/CrowdfundingCreatePage.tsx

#### Identité & Navigation
- `crowdfunding-create.back-link` — Link vers `/services/crowdfunding`, « Retour aux cagnottes » + IconArrowLeft (ligne 201-202)
- `crowdfunding-create.h1` — H1 « Lancer une cagnotte » (ligne 204)
- `crowdfunding-create.lead` — Texte explicatif (ligne 205-209)

#### Formulaire
- `crowdfunding-create.form` — aria-label="Création d'une cagnotte", noValidate (ligne 211-215)
- `crowdfunding-create.error-global` — role="alert" (ligne 217-220)

#### Champs
- `crowdfunding-create.form.title.label` — « Titre » | type=text required, helper « Entre {CROWDFUNDING_TITLE_MIN} et {CROWDFUNDING_TITLE_MAX} caractères. » (ligne 224-240)
- `crowdfunding-create.form.summary.label` — « Résumé » | textarea required, helper « Entre {CROWDFUNDING_SUMMARY_MIN} et {CROWDFUNDING_SUMMARY_MAX} caractères. » minHeight 80 (ligne 243-259)
- `crowdfunding-create.form.goal.label` — « Objectif (€) » | type=number required min CROWDFUNDING_GOAL_MIN max CROWDFUNDING_GOAL_MAX step=50, default « 1000 » (ligne 263-279)
- `crowdfunding-create.form.ends.label` — « Date de fin (facultatif) » | type=date (ligne 281-293)
- `crowdfunding-create.form.body.label` — « Contenu détaillé (facultatif) » | textarea, helper « Jusqu'à {CROWDFUNDING_BODY_MAX} caractères. » (ligne 297-312)

#### Submit
- `crowdfunding-create.submit` — Button « Lancer la cagnotte » ou « Publication… » (ligne 314-322)

---

### CrowdfundingContributePage (`/services/crowdfunding/:id/contribute`)
**Fichier** : web/src/pages/services/CrowdfundingContributePage.tsx

#### Identité & Navigation
- `crowdfunding-contribute.back-link` — Link vers `/services/crowdfunding/{id}`, « Retour à la cagnotte » + IconArrowLeft (ligne 221-222)
- `crowdfunding-contribute.h1` — H1 « Contribuer » (ligne 224)
- `crowdfunding-contribute.subtitle` — Paragraphe `{campaign.title}` (ligne 225)

#### Formulaire
- `crowdfunding-contribute.form` — aria-label="Formulaire de contribution", noValidate (ligne 227-231)
- `crowdfunding-contribute.error-global` — role="alert" (ligne 233-236)
- `crowdfunding-contribute.success` — role="status" « Merci pour votre contribution ! » + IconCheckCircle (ligne 238-242)

#### Champs
- `crowdfunding-contribute.form.amount.label` — « Montant (€) » | type=number required min CONTRIBUTION_AMOUNT_MIN max CONTRIBUTION_AMOUNT_MAX step=0.5, helper « Entre {min} et {max} €. », default « 10 » (ligne 245-264)
- `crowdfunding-contribute.form.anonymous.checkbox` — Checkbox « Contribuer de manière anonyme » (ligne 266-273)

#### Submit
- `crowdfunding-contribute.submit` — Button « Confirmer la contribution » ou « Enregistrement… » ou « Merci ! » (ligne 275-283)

#### États
- `crowdfunding-contribute.state.loading` — role="status" « Chargement de la cagnotte… » (ligne 162-164)
- `crowdfunding-contribute.state.error` — role="alert" message ou « Cagnotte introuvable. » (ligne 172-174)
- `crowdfunding-contribute.state.notfound` — Navigate vers `/services/crowdfunding` (ligne 156)
- `crowdfunding-contribute.state.success-redirect` — Redirige vers `/services/crowdfunding/{id}` après 1500ms (ligne 214-216)

---

## RÉSUMÉ TECHNIQUE

### Constantes de validation (engagement)
- PETITION_TITLE_MIN/MAX : 80-200 chars
- PETITION_SUMMARY_MIN/MAX : 50-300 chars
- PETITION_BODY_MIN : 200 chars
- PETITION_TARGET_MIN/MAX : 100-100000
- MOBILIZATION_TITLE_MIN/MAX : 80-200 chars
- MOBILIZATION_SUMMARY_MIN/MAX : 80-500 chars
- MOBILIZATION_BODY_MIN : 50 chars
- MOBILIZATION_CITY_MIN/MAX : 1-50 chars
- CAMPAIGN_TITLE_MIN/MAX : 80-200 chars
- CAMPAIGN_SUMMARY_MIN/MAX : 80-500 chars
- CAMPAIGN_BODY_MIN : 50 chars
- CAMPAIGN_ACTIONS_MAX_COUNT : 12
- POLL_QUESTION_MIN/MAX : 50-200 chars
- POLL_DESCRIPTION_MIN/MAX : 0-500 chars
- POLL_OPTIONS_MIN/MAX : 2-6 options
- ARTICLE_TITLE_MIN/MAX : 30-200 chars
- ARTICLE_SUMMARY_MIN/MAX : 50-300 chars
- ARTICLE_BODY_MIN/MAX : 200-10000 chars
- HOUSING_REQUEST_MESSAGE_MIN/MAX : 20-500 chars
