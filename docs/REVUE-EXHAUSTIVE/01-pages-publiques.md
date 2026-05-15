# Inventaire — Pages publiques & légales

> Produit par sub-agent Explore Phase 0. Ne pas modifier — référence brute.

## HomePage (`/`)
**Fichier** : web/src/pages/HomePage.tsx

### Identité
- `home.meta.title` — À inférer du `<title>` HTML (non explicitement défini en TSX, utilise le titre du routeur)
- `home.h1` — "Maintenant ! Le pouvoir citoyen, à portée de clic." (ligne 403)

### Hero
- `home.hero.eyebrow` — texte : "La voix des 99 %" (ligne 401)
- `home.hero.title` — texte : "Maintenant ! Le pouvoir citoyen, à portée de clic." (ligne 403)
- `home.hero.lead` — texte : "Pétitions, mobilisations, services d'entraide, communes libres : la plateforme qui outille les citoyennes et citoyens pour peser ensemble." (lignes 405-407)
- `home.hero.cta-primary` — label : "Adhérer", icône : IconSpark, action : navigate('/join'), aria-label : "Adhérer au mouvement Maintenant !" (lignes 410-413)
- `home.hero.cta-secondary` — label : "Découvrir", icône : IconShare, action : navigate('/decouvrir'), aria-label : "Découvrir le mouvement Maintenant !" (lignes 414-421)

### Compteurs publics en temps réel
- `home.counters.title` — H2 sr-only : "Compteurs publics en temps réel" (lignes 427-429)
- `home.counters.label` — "Compteurs publics en temps réel" (ligne 430)
- `home.counter.signatures.value` — formaté en fr-FR, fallback "…" pendant le chargement (lignes 273-276, 391)
- `home.counter.signatures.label` — "Signataires" (ligne 274)
- `home.counter.signatures.icon` — IconPen (ligne 276)
- `home.counter.mobilizations.value` — formaté en fr-FR, fallback "…" (lignes 279-282, 392)
- `home.counter.mobilizations.label` — "Mobilisations en cours" (ligne 280)
- `home.counter.mobilizations.icon` — IconMegaphone (ligne 282)
- `home.counter.communes.value` — formaté en fr-FR, fallback "…" (lignes 285-289, 393)
- `home.counter.communes.label` — "Communes libres" (ligne 286)
- `home.counter.communes.icon` — IconUsers (ligne 288)
- `home.counter.t99cp.value` — formaté en fr-FR, fallback "…" (lignes 291-296, 382-385)
- `home.counter.t99cp.label` — "T99CP émis" (ligne 292)
- `home.counter.t99cp.icon` — IconBarChart (ligne 294)
- `home.counters.loading-state` — affiche "…" avec aria-label "Chargement…" lors du fetch (lignes 440-446)
- `home.counters.error-state` — affiche "—" si erreur (ligne 388)

### Section "Ce que tu peux faire dès maintenant"
- `home.actions.title` — H2 : "Ce que tu peux faire dès maintenant" (ligne 456-457)
- `home.actions.lead` — "Trois manières d'agir, ouvertes à toutes et tous, sans condition de revenu ni d'adhésion." (lignes 459-461)
- `home.action.petitions.title` — "Signer ou lancer une pétition" (ligne 311)
- `home.action.petitions.description` — "Pèse sur les décisions publiques : porte une demande citoyenne, ajoute ta signature à celles qui te parlent." (lignes 312-313)
- `home.action.petitions.cta` — label : "Voir les pétitions", action : navigate('/petitions') (lignes 314-315, 309)
- `home.action.petitions.icon` — IconPen (ligne 315)
- `home.action.mobilizations.title` — "Rejoindre une mobilisation" (ligne 320)
- `home.action.mobilizations.description` — "Manifestations, AG, actions locales : trouve un événement près de chez toi ou organise-le." (lignes 321-322)
- `home.action.mobilizations.cta` — label : "Voir les mobilisations", action : navigate('/mobilizations') (lignes 323-324, 318)
- `home.action.mobilizations.icon` — IconFlame (ligne 324)
- `home.action.services.title` — "Échanger via les services d'entraide" (ligne 329)
- `home.action.services.description` — "Hébergement, covoiturage, prêt, jardin partagé, SEL : des services pour s'entraider au quotidien." (lignes 330-331)
- `home.action.services.cta` — label : "Découvrir l'entraide", action : navigate('/services') (lignes 332-333, 327)
- `home.action.services.icon` — IconHome (ligne 333)

### Section Mission
- `home.mission.id` — "mission" (ligne 485)
- `home.mission.title` — H2 : "Notre mission" (lignes 487-489)
- `home.mission.body` — "Maintenant ! est un mouvement citoyen qui rassemble les outils nécessaires pour reprendre la main sur les décisions qui nous concernent. Sans publicité, sans pistage, sans intermédiaire — nos compteurs sont publics et la plateforme est ouverte à toutes et tous." (lignes 490-494)
- `home.mission.cta` — label : "Voir nos compteurs publics →", lien : "/transparence" (lignes 497-499)

### États de chargement et erreurs
- `home.counters.loading` — affichage de "…" avec role="status" aria-live="polite" (ligne 441)
- `home.counters.error` — affichage de "—" si fetch échoue (ligne 384)

---

## DecouvrirPage (`/decouvrir`)
**Fichier** : web/src/pages/DecouvrirPage.tsx

### Identité
- `decouvrir.meta.title` — À inférer du routeur
- `decouvrir.eyebrow` — "La voix des 99 %" (ligne 405)
- `decouvrir.h1` — "Découvre le mouvement Maintenant !" (ligne 406)

### Hero
- `decouvrir.hero.lead` — "Maintenant ! est une plateforme citoyenne sans publicité ni pistage, qui rassemble les outils nécessaires pour reprendre la main sur les décisions qui nous concernent. Voici comment ça marche, ce que tu peux faire, et où on va." (lignes 407-411)

### Section Mission
- `decouvrir.mission.title` — H2 : "Notre mission" (lignes 415-416)
- `decouvrir.mission.body-1` — "Nous sommes parti·es d'un constat simple : les outils numériques actuels concentrent l'attention et la donnée entre les mains de quelques plateformes publicitaires. Maintenant ! propose des outils citoyens, gratuits, sans tracking, et gouvernés par l'association des adhérent·es. L'objectif : rééquilibrer le rapport de force entre les 99 % et les décisions qui les concernent." (lignes 418-425)
- `decouvrir.mission.body-2` — "Tous nos compteurs sont publics (cf. page Transparence) et notre gouvernance est documentée dans les mentions légales." (lignes 427-439)
- `decouvrir.mission.link-transparency` — label : "page Transparence", URL : "/transparence" (lignes 429-430)
- `decouvrir.mission.link-legal` — label : "mentions légales", URL : "/legal/notice" (lignes 433-437)

### Section "Comment ça marche"
- `decouvrir.how.title` — H2 : "Comment ça marche" (lignes 443-445)
- `decouvrir.how.lead` — "Trois étapes pour rejoindre le mouvement et faire bouger les lignes." (ligne 447-448)
- `decouvrir.step-1.badge` — "Étape 1" (ligne 286)
- `decouvrir.step-1.title` — "Tu rejoins" (ligne 287)
- `decouvrir.step-1.description` — "Création de compte en moins d'une minute. Adhésion libre dès 1 € symbolique ou sans contribution si tu n'en as pas les moyens." (lignes 288-289)
- `decouvrir.step-2.badge` — "Étape 2" (ligne 292)
- `decouvrir.step-2.title` — "Tu utilises les outils" (ligne 293)
- `decouvrir.step-2.description` — "Pétitions, mobilisations, services d'entraide, communes libres. Les outils sont gratuits et ouverts à toutes et tous." (lignes 294-295)
- `decouvrir.step-3.badge` — "Étape 3" (ligne 299)
- `decouvrir.step-3.title` — "Tu fais bouger les lignes" (ligne 300)
- `decouvrir.step-3.description` — "Chaque action compte : signer, organiser, échanger. Les compteurs publics montrent la dynamique en temps réel." (lignes 301-302)

### Section "Les outils"
- `decouvrir.tools.title` — H2 : "Les outils" (lignes 461-463)
- `decouvrir.tools.lead` — "Six familles d'outils, gratuites et ouvertes à toutes et tous." (lignes 465-467)
- `decouvrir.tool-petitions.title` — "Pétitions" (ligne 315)
- `decouvrir.tool-petitions.description` — "Pèse sur les décisions publiques avec des demandes citoyennes." (ligne 316)
- `decouvrir.tool-petitions.link` — URL : "/petitions" (ligne 314)
- `decouvrir.tool-petitions.icon` — IconPen (ligne 317)
- `decouvrir.tool-mobilizations.title` — "Mobilisations" (ligne 321)
- `decouvrir.tool-mobilizations.description` — "Manifestations, AG, actions locales — trouve ou crée un événement." (ligne 322)
- `decouvrir.tool-mobilizations.link` — URL : "/mobilizations" (ligne 320)
- `decouvrir.tool-mobilizations.icon` — IconFlame (ligne 323)
- `decouvrir.tool-polls.title` — "Sondages citoyens" (ligne 327)
- `decouvrir.tool-polls.description` — "Mesure l'opinion sur les sujets qui comptent." (ligne 328)
- `decouvrir.tool-polls.link` — URL : "/polls" (ligne 326)
- `decouvrir.tool-polls.icon` — IconBarChart (ligne 329)
- `decouvrir.tool-campaigns.title` — "Campagnes" (ligne 333)
- `decouvrir.tool-campaigns.description` — "Coordonne des actions à plus grande échelle." (ligne 334)
- `decouvrir.tool-campaigns.link` — URL : "/campaigns" (ligne 332)
- `decouvrir.tool-campaigns.icon` — IconMegaphone (ligne 335)
- `decouvrir.tool-services.title` — "Services d'entraide" (ligne 339)
- `decouvrir.tool-services.description` — "Hébergement, covoiturage, prêt, jardin partagé, SEL, cagnottes." (ligne 340)
- `decouvrir.tool-services.link` — URL : "/services" (ligne 338)
- `decouvrir.tool-services.icon` — IconHome (ligne 341)
- `decouvrir.tool-communes.title` — "Communes libres" (ligne 345)
- `decouvrir.tool-communes.description` — "Carte des collectifs locaux qui composent le mouvement." (ligne 346)
- `decouvrir.tool-communes.link` — URL : "/communes" (ligne 344)
- `decouvrir.tool-communes.icon` — IconUsers (ligne 347)

### Section "Notre vision"
- `decouvrir.vision.title` — H2 : "Notre vision" (lignes 492-494)
- `decouvrir.vision.body-1` — "Nous croyons qu'une démocratie vivante a besoin d'infrastructure partagée, indépendante des intérêts privés. Maintenant ! veut devenir cette infrastructure pour les mouvements citoyens francophones, puis européens. Pas une plateforme de plus, mais un bien commun numérique — au sens où l'entendent les juristes spécialistes des communs." (lignes 496-502)
- `decouvrir.vision.body-2` — "La gouvernance est associative (loi 1901), les choix techniques sont ouverts (open source progressif, cf. roadmap), et toute donnée publique est documentée et accessible." (lignes 504-507)

### Testimonials (Demo)
- `decouvrir.testimonials.badge` — "Témoignage démo" (ligne 514)
- `decouvrir.testimonial-1.quote` — "Avec Maintenant !, j'ai lancé une pétition pour ma rue piétonne. En trois semaines, on a obtenu un rendez-vous en mairie." (lignes 358-359)
- `decouvrir.testimonial-1.author` — "Témoignage fictif — démo (remplacé à T+3 mois)" (ligne 360)
- `decouvrir.testimonial-2.quote` — "Le covoiturage solidaire m'a permis de monter chaque semaine à l'AG du collectif sans casser mon budget." (lignes 363-364)
- `decouvrir.testimonial-2.author` — "Témoignage fictif — démo (remplacé à T+3 mois)" (ligne 365)
- `decouvrir.testimonial-3.quote` — "On a publié notre commune libre la semaine dernière. Recevoir les premiers messages de voisin·es a tout changé." (lignes 368-369)
- `decouvrir.testimonial-3.author` — "Témoignage fictif — démo (remplacé à T+3 mois)" (ligne 370)

### Section "Roadmap publique"
- `decouvrir.roadmap.title` — H2 : "Roadmap publique" (lignes 523-525)
- `decouvrir.roadmap.lead` — "Les grands jalons connus à date — la roadmap détaillée est documentée dans les outils internes de l'association." (lignes 527-529)
- `decouvrir.roadmap-1.period` — "2026 S1" (ligne 381)
- `decouvrir.roadmap-1.label` — "Lancement public, ouverture du média militant, premières communes libres en France métropolitaine." (lignes 382-383)
- `decouvrir.roadmap-2.period` — "2026 S2" (ligne 386)
- `decouvrir.roadmap-2.label` — "Extension communes libres outre-mer et frontaliers, paiements solidaires Stripe en pleine charge." (ligne 387-388)
- `decouvrir.roadmap-3.period` — "2027" (ligne 391)
- `decouvrir.roadmap-3.label` — "API publique transparence + open data des compteurs, fédération de communes libres européennes." (lignes 392-393)
- `decouvrir.roadmap-4.period` — "2028" (ligne 396)
- `decouvrir.roadmap-4.label` — "Pacte citoyen national co-construit via les pétitions/mobilisations à fort impact." (lignes 397-398)

### Section CTA (Rejoindre)
- `decouvrir.cta.title` — H2 : "Prêt·e à rejoindre ?" (lignes 541-543)
- `decouvrir.cta.lead` — "L'adhésion est libre. Choisis ce qui correspond à tes moyens du moment." (lignes 545-547)
- `decouvrir.cta.primary-btn` — label : "Rejoindre le mouvement", icône : IconSpark, action : navigate('/join') (lignes 549-552)
- `decouvrir.cta.secondary-text` — "Tu préfères explorer d'abord ?" (ligne 554)
- `decouvrir.cta.secondary-link` — label : "Voir les compteurs publics", icône : IconShare, URL : "/transparence" (lignes 555-557)

---

## AboutPage (`/about`)
**Fichier** : web/src/pages/AboutPage.tsx

### Identité
- `about.eyebrow` — "Qui sommes-nous" (ligne 328)
- `about.h1` — "À propos de Maintenant !" (ligne 329)

### Hero
- `about.hero.lead` — "Maintenant ! est une association loi 1901 indépendante, sans publicité ni pistage, qui rassemble les outils numériques nécessaires à l'action citoyenne. Voici qui porte le projet, ce qui nous guide et d'où on vient." (lignes 330-334)

### Section Équipe
- `about.team.title` — H2 : "L'équipe" (lignes 337-339)
- `about.team.disclaimer` — "Une équipe restreinte au démarrage, élargie au fil des contributions. Les profils ci-dessous sont des placeholders pendant la phase de lancement : ils seront remplacés par les bios validées des membres au plus tard à T+3 mois." (lignes 341-345)
- `about.team-member-1.initials` — "B" (ligne 234)
- `about.team-member-1.name` — "Ben" (ligne 235)
- `about.team-member-1.role` — "Co-fondateur·rice — produit" (ligne 236)
- `about.team-member-1.bio` — "Pilote l'architecture produit, la roadmap et la relation avec la communauté des adhérent·es." (ligne 237)
- `about.team-member-1.demo-badge` — "Bio démo" (ligne 356)
- `about.team-member-2.initials` — "L" (ligne 240)
- `about.team-member-2.name` — "Lilou" (ligne 241)
- `about.team-member-2.role` — "Co-fondateur·rice — opérations" (ligne 242)
- `about.team-member-2.bio` — "Coordonne la modération, les communes libres et les partenariats locaux." (ligne 243)
- `about.team-member-2.demo-badge` — "Bio démo" (ligne 356)
- `about.team-member-3.initials` — "+" (ligne 246)
- `about.team-member-3.name` — "L'équipe bénévole" (ligne 247)
- `about.team-member-3.role` — "Contributions ponctuelles" (ligne 248)
- `about.team-member-3.bio` — "Une dizaine de bénévoles contribuent au code, à la modération et à l'organisation des mobilisations." (ligne 249)
- `about.team-member-3.demo-badge` — "Bio démo" (ligne 356)

### Section Valeurs
- `about.values.title` — H2 : "Nos valeurs" (lignes 364-366)
- `about.values.lead` — "Cinq piliers qui orientent toutes nos décisions, des choix de design aux décisions de gouvernance." (lignes 368-370)
- `about.value-1.icon` — IconUsers
- `about.value-1.title` — "Citoyen·nes d'abord" (ligne 262)
- `about.value-1.description` — "Le mouvement appartient à ses adhérent·es. Aucune publicité, aucun investisseur, aucune dépendance commerciale." (lignes 263-264)
- `about.value-2.icon` — IconShare
- `about.value-2.title` — "Transparence radicale" (ligne 268)
- `about.value-2.description` — "Tous les compteurs sont publics. Les décisions de modération sont documentées. Le code source est ouvert progressivement." (lignes 269-270)
- `about.value-3.icon` — IconBadge
- `about.value-3.title` — "Sobriété & éthique" (ligne 274)
- `about.value-3.description` — "Pas de tracking, pas de profilage, pas de notifications agressives. Hébergement EU, données minimales." (lignes 275-276)
- `about.value-4.icon` — IconFlame
- `about.value-4.title` — "Action concrète" (ligne 280)
- `about.value-4.description` — "Les outils servent à agir : signer, organiser, échanger. Pas à scroller indéfiniment." (lignes 281-282)
- `about.value-5.icon` — IconUser
- `about.value-5.title` — "Inclusion sans condition" (ligne 286)
- `about.value-5.description` — "L'adhésion est libre dès 1 €. Personne n'est exclu pour des raisons financières." (lignes 287-288)

### Section Historique
- `about.history.title` — H2 : "Historique" (lignes 387-389)
- `about.history.lead` — "Quelques jalons clés de la naissance du mouvement et des étapes à venir." (lignes 391-393)
- `about.history-1.date` — "2024" (ligne 299)
- `about.history-1.label` — "Premières discussions entre Ben, Lilou et un cercle de proches autour du besoin d'outils citoyens indépendants." (lignes 300-301)
- `about.history-2.date` — "2025 S1" (ligne 304)
- `about.history-2.label` — "Conception du prototype et choix techniques : Vite + React + Supabase, hébergement EU, design system propre." (lignes 305-306)
- `about.history-3.date` — "2025 S2" (ligne 309)
- `about.history-3.label` — "Statuts associatifs déposés. Première version privée testée par un cercle d'adhérent·es." (ligne 310-311)
- `about.history-4.date` — "2026 S1" (ligne 314)
- `about.history-4.label` — "Lancement public du site et de l'adhésion T99CP. Ouverture progressive des outils (pétitions, mobilisations, services)." (lignes 315-316)
- `about.history-5.date` — "2026 S2" (ligne 319)
- `about.history-5.label` — "Première communauté de communes libres, ouverture du média militant, premiers partenariats locaux." (ligne 320-321)

### Section CTA (Découvrir)
- `about.cta.title` — H2 : "Envie d'en savoir plus ?" (lignes 415-417)
- `about.cta.lead` — "Découvre la mission complète, les outils et la roadmap publique." (ligne 426)
- `about.cta.btn` — label : "Découvrir le mouvement", icône : IconSpark, action : navigate('/decouvrir') (lignes 428-445)

---

## RoadmapPage (`/roadmap`)
**Fichier** : web/src/pages/RoadmapPage.tsx

### Identité
- `roadmap.eyebrow` — "Roadmap publique" (ligne 218)
- `roadmap.h1` — "Là où on va" (ligne 219)

### Hero
- `roadmap.hero.lead` — "Les jalons connus à date — du lancement public à la fédération européenne. La roadmap est mise à jour chaque trimestre selon la dynamique du mouvement et les retours des adhérent·es." (lignes 220-223)

### Timeline
- `roadmap.timeline.aria-label` — "Jalons de la roadmap Maintenant !" (ligne 226)
- `roadmap.timeline-item-1.date` — "2025 S2" (ligne 166)
- `roadmap.timeline-item-1.title` — "Conception et statuts associatifs" (ligne 167)
- `roadmap.timeline-item-1.description` — "Choix techniques (Vite + React + Supabase, hébergement EU), design system propre, dépôt des statuts loi 1901." (lignes 168-169)
- `roadmap.timeline-item-1.state` — "done" (ligne 170)
- `roadmap.timeline-item-1.icon` — IconCheckCircle (ligne 171)
- `roadmap.timeline-item-1.state-badge` — "Réalisé" (ligne 149)
- `roadmap.timeline-item-2.date` — "2026 S1" (ligne 174)
- `roadmap.timeline-item-2.title` — "Lancement public — outils de base" (ligne 175)
- `roadmap.timeline-item-2.description` — "Adhésion T99CP, pétitions, mobilisations, sondages, campagnes, services d'entraide, communes libres, transparence publique." (lignes 176-177)
- `roadmap.timeline-item-2.state` — "in-progress" (ligne 178)
- `roadmap.timeline-item-2.icon` — IconFlame (ligne 179)
- `roadmap.timeline-item-2.state-badge` — "En cours" (ligne 150)
- `roadmap.timeline-item-3.date` — "2026 S2" (ligne 182)
- `roadmap.timeline-item-3.title` — "Communes libres & média militant" (ligne 183)
- `roadmap.timeline-item-3.description` — "Première vague de communes libres en France métropolitaine, ouverture du média militant, premiers partenariats locaux." (lignes 184-185)
- `roadmap.timeline-item-3.state` — "planned" (ligne 186)
- `roadmap.timeline-item-3.icon` — IconUsers (ligne 187)
- `roadmap.timeline-item-3.state-badge` — "Planifié" (ligne 151)
- `roadmap.timeline-item-4.date` — "2027 S1" (ligne 190)
- `roadmap.timeline-item-4.title` — "API publique & open data" (ligne 191)
- `roadmap.timeline-item-4.description` — "Mise à disposition d'une API publique pour les compteurs de transparence, ouverture progressive du code source." (lignes 192-193)
- `roadmap.timeline-item-4.state` — "planned" (ligne 194)
- `roadmap.timeline-item-4.icon` — IconShare (ligne 195)
- `roadmap.timeline-item-5.date` — "2027 S2" (ligne 198)
- `roadmap.timeline-item-5.title` — "Fédération européenne" (ligne 199)
- `roadmap.timeline-item-5.description` — "Extension à des communes libres outre-mer et frontalières, échanges avec des collectifs européens." (lignes 200-201)
- `roadmap.timeline-item-5.state` — "planned" (ligne 202)
- `roadmap.timeline-item-5.icon` — IconBarChart (ligne 203)
- `roadmap.timeline-item-6.date` — "2028" (ligne 206)
- `roadmap.timeline-item-6.title` — "Pacte citoyen national" (ligne 207)
- `roadmap.timeline-item-6.description` — "Co-construction d'un pacte citoyen national à partir des pétitions et mobilisations à plus fort impact." (lignes 208-209)
- `roadmap.timeline-item-6.state` — "planned" (ligne 210)
- `roadmap.timeline-item-6.icon` — IconSpark (ligne 211)

### Section CTA (Rejoindre ou Découvrir)
- `roadmap.cta.title` — H2 : "Tu veux contribuer ?" (lignes 267-269)
- `roadmap.cta.lead` — "Adhère pour soutenir le développement, ou découvre comment le mouvement fonctionne avant de te lancer." (lignes 278-279)
- `roadmap.cta.primary-btn` — label : "Rejoindre", action : navigate('/join') (lignes 289-302)
- `roadmap.cta.secondary-btn` — label : "Découvrir", action : navigate('/decouvrir') (lignes 303-317)

---

## FaqPage (`/faq`)
**Fichier** : web/src/pages/FaqPage.tsx

### Identité
- `faq.eyebrow` — "Centre d'aide" (ligne 219)
- `faq.h1` — "Questions fréquentes" (ligne 220)

### Hero
- `faq.hero.lead` — "Compte, RGPD, T99CP, paiement, modération : les réponses aux questions qu'on nous pose le plus souvent. Tu ne trouves pas ta réponse ? Contacte-nous." (lignes 221-228)
- `faq.hero.link-contact` — label : "Contacte-nous", URL : "/legal/contact" (lignes 225-227)

### Catégorie "Compte & connexion"
- `faq.cat-compte.title` — H2 : "Compte & connexion" (ligne 118)
- `faq.cat-compte.item-1.q` — "Comment créer un compte sur Maintenant ! ?" (ligne 121)
- `faq.cat-compte.item-1.a` — "Clique sur « Rejoindre » dans le menu, puis renseigne ton e-mail et un mot de passe. Tu peux aussi te connecter via Google ou Instagram si tu préfères. Aucune information autre que ton e-mail n'est obligatoire." (lignes 122-123)
- `faq.cat-compte.item-2.q` — "J'ai oublié mon mot de passe, comment le réinitialiser ?" (ligne 125)
- `faq.cat-compte.item-2.a` — "Sur l'écran de connexion, clique sur « Mot de passe oublié ». Tu recevras un lien sécurisé par e-mail (valable 1 heure) pour en définir un nouveau." (ligne 126-127)
- `faq.cat-compte.item-3.q` — "Puis-je changer mon adresse e-mail ou mon nom public ?" (ligne 129)
- `faq.cat-compte.item-3.a` — "Oui — depuis ta page profil, tu peux modifier ton nom d'affichage à tout moment. Le changement d'e-mail nécessite une confirmation par e-mail (sécurité)." (lignes 130-131)

### Catégorie "Données personnelles & RGPD"
- `faq.cat-rgpd.title` — H2 : "Données personnelles & RGPD" (ligne 136)
- `faq.cat-rgpd.item-1.q` — "Quelles données collectez-vous ?" (ligne 139)
- `faq.cat-rgpd.item-1.a` — "Strict minimum : e-mail (obligatoire pour le compte), nom d'affichage (modifiable), et les contributions publiques que tu choisis de faire (signatures, posts, RSVP). Aucun cookie publicitaire, aucun pistage tiers. Détail complet dans la page Confidentialité." (lignes 140-141)
- `faq.cat-rgpd.item-2.q` — "Puis-je exporter mes données ?" (ligne 143)
- `faq.cat-rgpd.item-2.a` — "Oui, depuis ta page profil — bouton « Exporter mes données ». Tu reçois un fichier JSON avec l'intégralité de tes données personnelles sous 30 jours (en pratique sous 48 h)." (lignes 144-145)
- `faq.cat-rgpd.item-3.q` — "Comment supprimer mon compte ?" (ligne 147)
- `faq.cat-rgpd.item-3.a` — "Sur ta page profil, bouton « Supprimer mon compte ». La suppression est définitive sous 30 jours (délai légal pour annulation accidentelle). Tes contributions publiques antérieures sont anonymisées (le nom est remplacé par « Compte supprimé »), elles ne disparaissent pas du registre public car elles font partie d'une démarche citoyenne." (lignes 148-149)
- `faq.cat-rgpd.item-4.q` — "Mes données sont-elles hébergées en Europe ?" (ligne 151)
- `faq.cat-rgpd.item-4.a` — "Oui : l'intégralité de la base de données et des fichiers est hébergée dans la région Supabase EU (Francfort, Allemagne). Aucun transfert hors UE n'est effectué. Stripe est notre seul sous-traitant non-UE et son traitement est limité aux données de paiement, conformément aux clauses contractuelles types validées par la CNIL." (lignes 152-153)

### Catégorie "T99CP — jetons d'adhésion"
- `faq.cat-t99cp.title` — H2 : "T99CP — jetons d'adhésion" (ligne 158)
- `faq.cat-t99cp.item-1.q` — "Qu'est-ce qu'un T99CP ?" (ligne 161)
- `faq.cat-t99cp.item-1.a` — "Le T99CP (« Token 99 % Citoyen Participatif ») est l'unité d'adhésion symbolique du mouvement. À chaque adhésion (libre, dès 1 €), tu reçois 1 T99CP — c'est un jeton interne, sans valeur monétaire, qui matérialise ton statut d'adhérent·e. Le compteur cumulé est public sur la page Transparence." (lignes 162-163)
- `faq.cat-t99cp.item-2.q` — "Comment obtenir des T99CP ?" (ligne 165)
- `faq.cat-t99cp.item-2.a` — "Une seule façon : l'adhésion via la page « Rejoindre ». Trois tiers libres : 1 € symbolique, 12 € standard, 60 € soutien. Tu reçois 1 T99CP par adhésion (renouvelable annuellement)." (lignes 166-167)
- `faq.cat-t99cp.item-3.q` — "Les T99CP me donnent-ils des avantages ?" (ligne 169)
- `faq.cat-t99cp.item-3.a` — "Pas d'avantage matériel : le T99CP est un marqueur d'engagement, pas une monnaie. Certaines fonctionnalités (création d'une commune libre, vote sur les sondages internes du mouvement) requièrent d'être adhérent·e. Le détail des droits est dans les statuts associatifs." (lignes 170-171)
- `faq.cat-t99cp.item-4.q` — "Que se passe-t-il si je n'ai pas les moyens d'adhérer ?" (ligne 173)
- `faq.cat-t99cp.item-4.a` — "L'adhésion à 1 € symbolique reste accessible. Si même cette somme est un obstacle, contacte-nous via le formulaire dédié : nous accordons des adhésions gratuites au cas par cas, sans justification demandée. La règle du mouvement : jamais d'exclusion pour des raisons financières." (lignes 174-175)

### Catégorie "Paiements & Stripe"
- `faq.cat-stripe.title` — H2 : "Paiements & Stripe" (ligne 180)
- `faq.cat-stripe.item-1.q` — "Mon paiement est-il sécurisé ?" (ligne 183)
- `faq.cat-stripe.item-1.a` — "Oui : les paiements sont traités par Stripe (PCI DSS niveau 1, le standard le plus élevé du secteur). Maintenant ! ne stocke jamais ton numéro de carte ; seul Stripe le voit. Nous ne conservons que le statut « adhésion confirmée » et un identifiant technique anonyme." (lignes 184-185)
- `faq.cat-stripe.item-2.q` — "Puis-je obtenir un remboursement ?" (ligne 187)
- `faq.cat-stripe.item-2.a` — "Oui, sous 14 jours (droit de rétractation légal pour une transaction en ligne). Au-delà, contacte-nous via le formulaire dédié — les demandes justifiées sont étudiées au cas par cas." (ligne 188-189)
- `faq.cat-stripe.item-3.q` — "Mon adhésion est-elle déductible des impôts ?" (ligne 191)
- `faq.cat-stripe.item-3.a` — "Pas pour le moment. Maintenant ! n'a pas le statut d'association d'intérêt général — c'est un objectif à moyen terme une fois le seuil d'activité atteint." (lignes 192-193)

### Catégorie "Modération & signalement"
- `faq.cat-moderation.title` — H2 : "Modération & signalement" (ligne 198)
- `faq.cat-moderation.item-1.q` — "Comment signaler un contenu inapproprié ?" (ligne 201)
- `faq.cat-moderation.item-1.a` — "Chaque pétition, post, mobilisation et profil dispose d'un bouton « Signaler ». Le signalement déclenche une revue manuelle par l'équipe de modération sous 48 h. Tu peux aussi nous contacter directement via le formulaire de la page Contact." (lignes 202-203)
- `faq.cat-moderation.item-2.q` — "Quelles sont les règles de la communauté ?" (ligne 205)
- `faq.cat-moderation.item-2.a` — "Trois règles essentielles : respect de la personne (pas d'insulte, pas de harcèlement), respect de la loi (pas d'incitation à la haine, pas d'apologie de violence), et bonne foi militante (pas de désinformation manifeste, pas d'astroturfing). Le détail complet est dans la charte communautaire (lien dans le footer)." (lignes 206-207)
- `faq.cat-moderation.item-3.q` — "Que se passe-t-il en cas d'infraction ?" (ligne 209)
- `faq.cat-moderation.item-3.a` — "Trois niveaux : (1) avertissement avec retrait du contenu, (2) suspension temporaire de 7 à 30 jours, (3) bannissement définitif sur récidive grave. Toute sanction est notifiée par e-mail et est contestable via la page Contact." (lignes 210-211)

### Section CTA (Nous contacter)
- `faq.cta.title` — H2 : "Une question reste sans réponse ?" (lignes 256-258)
- `faq.cta.lead` — "L'équipe répond sous 48 heures via le formulaire de contact. Pour les sujets sensibles (RGPD, modération), tu reçois systématiquement un accusé de réception." (lignes 260-263)
- `faq.cta.btn` — label : "Nous contacter", action : navigate('/legal/contact') (lignes 265-278)

### Accessibilité
- `faq.item-toggler.aria-expanded` — "true" si ouvert, "false" si fermé (ligne 242)
- `faq.item-toggler.aria-controls` — références l'ID de la réponse (ligne 242)

---

## TransparencePage (`/transparence`)
**Fichier** : web/src/pages/TransparencePage.tsx

### Identité
- `transparence.h1` — "Transparence" (ligne 239)

### Subtitle et contexte
- `transparence.subtitle` — "Plateforme mise en service le [GO_LIVE_DATE]. Les compteurs ci-dessous sont calculés en temps réel depuis la base de données, sans tracking ni publicité." (lignes 240-243)

### Compteurs publics
- `transparence.counters.title` — H2 : "Activité de la plateforme" (ligne 246)
- `transparence.counter-members.label` — "Comptes créés" (ligne 113)
- `transparence.counter-members.hint` — "count(*) sur public.users — RLS publique, aucune PII exposée." (ligne 114)
- `transparence.counter-petitions.label` — "Pétitions publiées" (ligne 118)
- `transparence.counter-petitions.hint` — "count(*) sur public.petitions où status = « published »." (ligne 119)
- `transparence.counter-signatures.label` — "Signatures cumulées" (ligne 123)
- `transparence.counter-signatures.hint` — "count(*) sur public.signatures — cumulé toutes pétitions." (ligne 124)
- `transparence.counter-mobilizations.label` — "Mobilisations publiées" (ligne 128)
- `transparence.counter-mobilizations.hint` — "count(*) sur public.mobilizations où status = « published »." (ligne 129)
- `transparence.counter-campaigns.label` — "Campagnes publiées" (ligne 133)
- `transparence.counter-campaigns.hint` — "count(*) sur public.campaigns où status = « published »." (ligne 134)
- `transparence.counter-communes.label` — "Communes libres" (ligne 138)
- `transparence.counter-communes.hint` — "count(*) sur public.communes où status = « published »." (ligne 139)
- `transparence.counter-t99cp.label` — "T99CP émis (cumulé)" (ligne 272)
- `transparence.counter-t99cp.hint` — "sum(amount) sur t99cp_transactions où kind = « credit » (RPC publique, SECURITY DEFINER)." (lignes 273-275)

### États de chargement et erreur
- `transparence.loading-state` — affiche "Chargement des compteurs…" avec role="status" aria-live="polite" (ligne 250)
- `transparence.error-state` — affiche "Impossible de charger les compteurs ([message]). Réessayez plus tard." avec role="alert" (lignes 254-256)

### Graphique
- `transparence.chart.title` — H2 : "Inscriptions par mois (12 derniers mois)" (ligne 282)
- `transparence.chart.lead` — "Évolution agrégée du nombre de comptes créés. Les données sont anonymisées (seule la date de création est utilisée)." (lignes 283-285)
- `transparence.chart.loading-state` — affiche "Chargement du graphique…" avec role="status" aria-live="polite" (ligne 290)
- `transparence.chart.error-state` — affiche "Graphique indisponible pour le moment." avec role="alert" (ligne 295)

### Section "Ce que vous ne verrez pas ici"
- `transparence.privacy.title` — H2 : "Ce que vous ne verrez pas ici" (ligne 302)
- `transparence.privacy.body` — "Conformément à notre politique de confidentialité, aucune donnée nominative, aucune adresse IP, aucun pixel publicitaire n'est exposé sur cette page. Les compteurs ne donnent qu'une vue agrégée." (lignes 303-306)
- `transparence.privacy.link` — label : "politique de confidentialité", URL : "/legal/privacy" (ligne 308)

### Section Modération
- `transparence.moderation.title` — H2 : "Modération" (ligne 311)
- `transparence.moderation.body` — "Les signalements ouverts par les adhérent·es ne sont pas comptabilisés publiquement pour préserver la confidentialité des dossiers en cours (procédure détaillée dans le document de modération interne, accessible sur demande à l'équipe). Un rapport annuel agrégé sera publié." (lignes 312-316)

### Section Erreur et Support
- `transparence.footer.error-text` — "Vous voyez une donnée qui vous semble incorrecte ?" (lignes 319-321)
- `transparence.footer.error-link` — label : "Contactez-nous", URL : "/legal/contact" (ligne 322)
- `transparence.footer.discovery-text` — "En savoir plus sur le mouvement →" (lignes 324-325)
- `transparence.footer.discovery-link` — label : "Découvrir Maintenant !", URL : "/decouvrir" (ligne 326)

---

## JoinPage (`/join`)
**Fichier** : web/src/pages/JoinPage.tsx

### Identité
- `join.h1` — "Adhérez au mouvement Maintenant !" (lignes 311-312)

### Hero
- `join.hero.title` — "Adhérez au mouvement Maintenant !" (ligne 312)
- `join.hero.lead` — "L'adhésion donne accès à l'espace adhérent·es, aux Communes Libres et à l'Assemblée Confédérale. Choisissez la formule qui vous convient — les paiements sont sécurisés par Stripe, hébergés en zone UE." (lignes 314-317)

### Messages (Annulation, Erreur, Succès, Info)
- `join.message.canceled` — role="status" — "Paiement annulé. Aucun prélèvement n'a été effectué." (lignes 321-324)
- `join.message.error` — role="alert" — affiche errorText (lignes 326-330)
- `join.message.success` — role="status" — affiche successText (lignes 331-335)
- `join.message.unauthenticated` — role="note" — "Connectez-vous pour activer une adhésion. La création de compte est libre et gratuite ; elle ne vous engage à rien." (lignes 336-341)

### Tiers d'adhésion
- `join.tiers.label` — aria-label : "Formules d'adhésion" (ligne 344)

#### Tier Gratuit
- `join.tier-gratuit.title` — "Adhésion libre" (ligne 30)
- `join.tier-gratuit.price` — "Gratuit" (ligne 31)
- `join.tier-gratuit.blurb` — "Rejoignez le mouvement sans contribuer financièrement." (ligne 33)
- `join.tier-gratuit.perk-1` — "Accès à l'espace adhérent·e" (ligne 35)
- `join.tier-gratuit.perk-2` — "Vote aux sondages des Communes Libres" (ligne 36)
- `join.tier-gratuit.perk-3` — "Profil public Membre du mouvement" (ligne 37)
- `join.tier-gratuit.cta` — label : "Devenir adhérent·e" (ligne 39)
- `join.tier-gratuit.cta-busy` — "Activation…" (ligne 399)
- `join.tier-gratuit.cta-icon` — IconSpark (ligne 398)

#### Tier Soutien
- `join.tier-soutien.title` — "Adhésion soutien" (ligne 44)
- `join.tier-soutien.price` — "5 €" (ligne 45)
- `join.tier-soutien.price-period` — "/ mois" (ligne 46)
- `join.tier-soutien.blurb` — "Financez la plateforme et recevez vos 60 T99CP mensuels." (ligne 47)
- `join.tier-soutien.perk-1` — "Tout le tier libre" (ligne 49)
- `join.tier-soutien.perk-2` — "60 T99CP crédités chaque mois" (ligne 50)
- `join.tier-soutien.perk-3` — "Accès aux Cagnottes et Marketplace solidaire" (ligne 51)
- `join.tier-soutien.cta` — label : "Devenir soutien" (ligne 53)
- `join.tier-soutien.cta-busy` — "Redirection Stripe…" (ligne 404)
- `join.tier-soutien.cta-icon` — IconCart (ligne 403)
- `join.tier-soutien.ribbon` — "Recommandé" (ligne 360)
- `join.tier-soutien.highlight` — true (ligne 54)

#### Tier Engagé
- `join.tier-engage.title` — "Adhésion engagée" (ligne 58)
- `join.tier-engage.price` — "15 €" (ligne 59)
- `join.tier-engage.price-period` — "/ mois" (ligne 60)
- `join.tier-engage.blurb` — "Pour les militant·es qui veulent porter le mouvement." (ligne 61)
- `join.tier-engage.perk-1` — "Tout le tier soutien" (ligne 63)
- `join.tier-engage.perk-2` — "60 T99CP / mois + bonus de bienvenue" (ligne 64)
- `join.tier-engage.perk-3` — "Candidature à l'Assemblée Confédérale" (ligne 65)
- `join.tier-engage.cta` — label : "Devenir engagé·e" (ligne 67)
- `join.tier-engage.cta-busy` — "Redirection Stripe…" (ligne 404)
- `join.tier-engage.cta-icon` — IconCart (ligne 403)

### Tier actuel (authenticated users)
- `join.tier-current.tag` — "Tier actuel" (ligne 358)

### Button disabled state
- `join.tier.cta-disabled-locked` — "Déjà adhérent·e", icône : IconLock (lignes 391-395)

### Footer Info
- `join.footer.stripe-info` — "Les paiements transitent par Stripe (3D Secure obligatoire en zone UE). Vous pouvez résilier à tout moment depuis votre profil : l'adhésion reste active jusqu'à la fin de la période en cours. Les T99CP crédités à chaque renouvellement sont visibles dans votre portefeuille." (lignes 423-426)

---

## ReseauPage (`/reseau`)
**Fichier** : web/src/pages/ReseauPage.tsx

### Identité
- `reseau.h1` — "Réseau militant" (ligne 327)

### Hero
- `reseau.hero.lead` — "Le fil interne du mouvement : annonces, témoignages, idées d'action. Pas de publicité, pas de tracking, modération communautaire." (lignes 330-332)

### Navigation par onglets
- `reseau.tabs.aria-label` — "Filtre du feed" (ligne 336)
- `reseau.tab-all.label` — "Tout", icône : IconMegaphone (lignes 343-344)
- `reseau.tab-all.role` — "tab", aria-selected basé sur état (lignes 339-342)
- `reseau.tab-following.label` — "Suivis", icône : IconUsers (lignes 353-354)
- `reseau.tab-following.role` — "tab", aria-selected basé sur état, disabled si unauthenticated (lignes 348-352)

### Formulaire de composition (authenticated users only)
- `reseau.composer.aria-label` — "Publier un post" (ligne 359)
- `reseau.composer.label` — "Publier" (ligne 361)
- `reseau.composer.textarea.id` — "post-body" (ligne 364)
- `reseau.composer.textarea.placeholder` — "Quoi de neuf ?" (ligne 367)
- `reseau.composer.textarea.max-length` — POST_BODY_MAX (ligne 368)
- `reseau.composer.textarea.min-length` — POST_BODY_MIN (ligne 369)
- `reseau.composer.textarea.aria-invalid` — si composerError (ligne 372)
- `reseau.composer.visibility-label` — "Visibilité" (ligne 383)
- `reseau.composer.visibility.option-public` — "Publique" (ligne 393)
- `reseau.composer.visibility.option-members` — "Adhérents" (ligne 394)
- `reseau.composer.visibility.option-private` — "Privée (moi)" (ligne 395)
- `reseau.composer.visibility.aria-label` — "Visibilité du post" (ligne 391)
- `reseau.composer.submit.label` — label : "Publier", icône : IconPen, busy state : "Publication…" (lignes 404-405)
- `reseau.composer.error.field` — "Validation error text" (ligne 374)
- `reseau.composer.error.global` — affiche composerGlobalError avec role="alert" (lignes 375-379)

### Feed
- `reseau.feed.error` — affiche errorText avec role="alert" (lignes 411-415)
- `reseau.feed.loading-state` — affiche "Chargement du feed…" avec role="status" aria-live="polite" (lignes 417-420)
- `reseau.feed.empty-state.title` — "Aucun post pour le moment" (ligne 425)
- `reseau.feed.empty-state.description` — conditional : "Suivez d'autres militants pour voir leurs posts ici." (tab=following) ou "Soyez le premier à publier sur le réseau." (tab=all) (lignes 429-431)
- `reseau.feed.count-label` — affiche "X post(s)" (lignes 440-442)
- `reseau.feed.aria-label` — "Fil de posts" (ligne 444)

### Post Card
- `reseau.post.visibility-badge` — affiche post.visibility ("public", "members", "private") (ligne 249)
- `reseau.post.created-at` — formaté en locale fr-FR (ligne 250)
- `reseau.post.body` — texte du post avec whitespace-pre-wrap (ligne 252)
- `reseau.post.follow-button` — visible si viewerId et viewerId !== post.author_id (lignes 245, 253-260)

---

## CommunesPage (`/communes`)
**Fichier** : web/src/pages/CommunesPage.tsx

### Identité
- `communes.h1` — "Communes libres" (ligne 187)

### Hero
- `communes.hero.lead` — "Cellules locales du mouvement Maintenant ! Une commune libre regroupe les adhérents d'un même territoire pour s'organiser, mobiliser et porter des actions concrètes." (lignes 190-193)

### Recherche
- `communes.search.form.role` — "search" (ligne 198)
- `communes.search.form.aria-label` — "Rechercher une commune" (ligne 199)
- `communes.search.input.type` — "search" (ligne 209)
- `communes.search.input.placeholder` — "Nom, ville, description…" (ligne 212)
- `communes.search.input.aria-label` — "Rechercher une commune" (ligne 214)
- `communes.search.icon` — IconSearch (ligne 205)
- `communes.search.cta` — label : "Créer une commune", icône : IconPen, action : navigate('/communes/new'), visible si isAdmin (lignes 217-221)

### États
- `communes.error-state` — affiche errorText avec role="alert" (lignes 227-231)
- `communes.loading-state` — affiche SkeletonCardList (ligne 234)
- `communes.empty-state.icon` — IconUsers (ligne 239)
- `communes.empty-state.title` — "Aucune commune publiée" (ligne 240)
- `communes.empty-state.description` — "La carte des communes libres se construira progressivement. Revenez plus tard." (ligne 241)

### Grille de communes
- `communes.count-label` — affiche "X commune(s)" (ligne 263)
- `communes.list.aria-label` — "Liste des communes libres" (ligne 267)

### Carte Commune
- `commune-card.city-badge` — affiche commune.city, icône : IconPin (lignes 164-167)
- `commune-card.title` — H2 : commune.name (ligne 168)
- `commune-card.description` — texte truncated à 3 lignes si présent (ligne 169)
- `commune-card.link` — action : navigate(`/communes/${commune.slug}`) (ligne 163)

---

## CommuneDetailPage (`/communes/:slug`)
**Fichier** : web/src/pages/CommuneDetailPage.tsx

### Identité
- `commune-detail.h1` — commune.name (ligne 237)

### Breadcrumbs
- `commune-detail.breadcrumbs` — items : [Accueil, Communes, commune.name] (lignes 221-226)

### Back Link
- `commune-detail.back-link` — label : "Retour aux communes", icône : IconArrowLeft (lignes 228-230)

### Header
- `commune-detail.city-badge` — affiche commune.city, icône : IconPin (lignes 233-236)
- `commune-detail.description` — affiche commune.description si présent (ligne 240)

### Erreur d'action
- `commune-detail.action-error` — affiche actionError ou postgrestErrorMessage(error) avec role="alert" (lignes 242-246)

### Loading State
- `commune-detail.loading-state` — affiche "Chargement de la commune…" avec role="status" aria-live="polite" (lignes 171-173)

### Not Found State
- `commune-detail.not-found.title` — "Commune introuvable" (ligne 184)
- `commune-detail.not-found.description` — "Cette commune n'existe pas ou a été retirée. Consultez la liste pour repartir." (lignes 185-187)

### Boutons d'action
- `commune-detail.join.button` — label : "Rejoindre cette commune", icône : IconUsers, action : handleJoin (lignes 262-272)
- `commune-detail.join.button.busy-state` — "En cours…" (ligne 270)
- `commune-detail.leave.button` — label : "Quitter cette commune", icône : IconCheckCircle, action : handleLeave (lignes 251-260)
- `commune-detail.leave.button.busy-state` — "..." (ligne 259)
- `commune-detail.login.button` — label : "Se connecter pour rejoindre", action : navigate('/?auth=login') (lignes 274-276)
- `commune-detail.button.disabled-state` — "Déjà adhérent·e" (ligne 394)

### Section Membres
- `commune-detail.members.title` — H2 + icône IconUsers : "{N} membre(s)" (lignes 282-284)
- `commune-detail.members.empty` — "Soyez le ou la première à rejoindre cette commune." (lignes 287-289)
- `commune-detail.member.role-label` — affiche ROLE_LABELS[member.role] (ligne 295)
- `commune-detail.member.joined-date` — formaté en locale fr-FR (lignes 296-300)
- `commune-detail.role-labels.member` — "Membre" (ligne 138)
- `commune-detail.role-labels.referent` — "Référent·e" (ligne 139)
- `commune-detail.role-labels.treasurer` — "Trésorier·e" (ligne 140)
- `commune-detail.role-labels.admin` — "Admin" (ligne 141)

---

## CommuneCreatePage (`/communes/new`)
**Fichier** : web/src/pages/CommuneCreatePage.tsx

### Identité
- `commune-create.h1` — "Créer une commune libre" (ligne 197)

### Back Link
- `commune-create.back-link` — label : "Retour aux communes", icône : IconArrowLeft (lignes 194-196)

### Info
- `commune-create.lead` — "Réservé aux administrateurs du mouvement. Une commune libre regroupe les adhérents d'un même territoire. Toute création est historisée." (lignes 198-201)

### Formulaire
- `commune-create.form.aria-label` — "Création d'une commune" (ligne 206)

#### Champ Nom
- `commune-create.field-name.label` — "Nom de la commune" (ligne 216)
- `commune-create.field-name.input.id` — "commune-name" (ligne 219)
- `commune-create.field-name.help` — "Entre {min} et {max} caractères." (lignes 228-229)
- `commune-create.field-name.error` — affiche errors.name si présent (ligne 231)

#### Champ Ville
- `commune-create.field-city.label` — "Ville" (ligne 235)
- `commune-create.field-city.input.id` — "commune-city" (ligne 238)
- `commune-create.field-city.help` — "Entre {min} et {max} caractères." (lignes 247-248)
- `commune-create.field-city.error` — affiche errors.city si présent (ligne 250)

#### Champ Description
- `commune-create.field-description.label` — "Description (facultatif)" (ligne 254)
- `commune-create.field-description.input.id` — "commune-description" (ligne 257)
- `commune-create.field-description.help` — "Jusqu'à {max} caractères." (ligne 265)
- `commune-create.field-description.error` — affiche errors.description si présent (lignes 266-268)

### Bouton Submit
- `commune-create.submit.label` — label : "Créer la commune", icône : IconPen (ligne 277)
- `commune-create.submit.busy-state` — "Création…" (ligne 278)
- `commune-create.submit.disabled-state` — s'affiche lors du processing (ligne 275)

### Erreur Globale
- `commune-create.error.global` — affiche globalError avec role="alert" (lignes 209-213)

---

## PrivacyPage (`/legal/privacy`)
**Fichier** : web/src/pages/PrivacyPage.tsx

### Identité
- `privacy.h1` — "Politique de confidentialité" (ligne 66)
- `privacy.subtitle` — "Dernière mise à jour : 11 mai 2026 — version 1.0" (ligne 67)

### Sommaire
- `privacy.toc.aria-label` — "Sommaire" (ligne 69)
- `privacy.toc.title` — "Sommaire" (ligne 70)
- `privacy.toc.section-1` — label : "Responsable de traitement", anchor : "#responsable" (ligne 53)
- `privacy.toc.section-2` — label : "Finalités", anchor : "#finalites" (ligne 54)
- `privacy.toc.section-3` — label : "Base légale", anchor : "#base-legale" (ligne 55)
- `privacy.toc.section-4` — label : "Données collectées", anchor : "#donnees" (ligne 56)
- `privacy.toc.section-5` — label : "Durées de conservation", anchor : "#conservation" (ligne 57)
- `privacy.toc.section-6` — label : "Sous-traitants", anchor : "#sous-traitants" (ligne 58)
- `privacy.toc.section-7` — label : "Vos droits RGPD", anchor : "#droits" (ligne 59)
- `privacy.toc.section-8` — label : "Contact DPO", anchor : "#dpo" (ligne 60)

### Section 1 : Responsable de traitement
- `privacy.responsable.text` — "Le traitement des données à caractère personnel collectées sur le site Maintenant ! est sous la responsabilité de l'association Maintenant !, domiciliée en France." (lignes 82-84)
- `privacy.responsable.link` — label : "mentions légales", URL : "/legal/notice" (ligne 85)

### Section 2 : Finalités du traitement
- `privacy.finalites.item-1` — "Gestion des comptes utilisateurs (inscription, authentification, profil)." (ligne 92)
- `privacy.finalites.item-2` — "Permettre la publication et la consultation des contenus militants : pétitions, mobilisations, sondages, campagnes." (lignes 93-95)
- `privacy.finalites.item-3` — "Permettre l'accès aux services communautaires (hébergement, covoiturage, partage, jardins, SEL, marketplace, cagnottes)." (lignes 97-100)
- `privacy.finalites.item-4` — "Gestion des adhésions et du dispositif T99CP." (ligne 101)
- `privacy.finalites.item-5` — "Communication entre membres (messagerie privée, notifications)." (ligne 102)
- `privacy.finalites.item-6` — "Mesure d'audience anonymisée (uniquement avec votre consentement)." (ligne 103)
- `privacy.finalites.item-7` — "Modération, sécurité, prévention des abus." (ligne 104)

### Section 3 : Base légale
- `privacy.base-legale.lead` — "Les traitements reposent sur trois fondements distincts selon les finalités :" (ligne 110)
- `privacy.base-legale.contract.label` — "Contrat" (ligne 112)
- `privacy.base-legale.contract.desc` — "Création de compte, services rendus, adhésion : exécution des conditions d'utilisation auxquelles vous avez souscrit." (lignes 113-115)
- `privacy.base-legale.consent.label` — "Consentement" (ligne 117)
- `privacy.base-legale.consent.desc` — "Mesure d'audience anonymisée, signature de pétition, réception de notifications. Le consentement peut être retiré à tout moment." (lignes 118-120)
- `privacy.base-legale.interest.label` — "Intérêt légitime" (ligne 122)
- `privacy.base-legale.interest.desc` — "Modération, sécurité, prévention des abus, journaux techniques d'exploitation, anti-fraude." (lignes 123-125)

### Section 4 : Données collectées
- `privacy.donnees.item-1` — "Identité : nom affiché, ville, photo de profil (facultative)." (ligne 133)
- `privacy.donnees.item-2` — "Coordonnées : email (obligatoire), téléphone (facultatif)." (ligne 134)
- `privacy.donnees.item-3` — "Contenus publiés : pétitions, mobilisations, sondages, campagnes, articles, posts, commentaires, messages privés." (lignes 135-137)
- `privacy.donnees.item-4` — "Engagements : signatures, votes, participations — incluant l'identifiant utilisateur (transparence des soutiens publics)." (lignes 140-142)
- `privacy.donnees.item-5` — "Données techniques : journaux d'authentification, horodatages, identifiants de session. Aucune adresse IP n'est conservée après la session sauf pour la sécurité (incidents)." (lignes 143-146)
- `privacy.donnees.item-6` — "Paiement : aucune donnée bancaire n'est stockée chez nous — la transaction est intégralement opérée par Stripe." (lignes 148-150)

### Section 5 : Durées de conservation
- `privacy.conservation.item-1` — "Compte utilisateur : actif tant que le compte existe ; supprimé sur demande (effacement complet sous 30 jours)." (lignes 158-160)
- `privacy.conservation.item-2` — "Contenus publiés : conservés tant que l'auteur ne les retire pas." (lignes 161-162)
- `privacy.conservation.item-3` — "Signatures et votes : conservés pour l'intégrité du compteur, anonymisés au retrait du compte." (lignes 163-165)
- `privacy.conservation.item-4` — "Messages privés : 24 mois après le dernier échange." (ligne 167)
- `privacy.conservation.item-5` — "Journaux techniques de sécurité : 12 mois maximum." (ligne 168)
- `privacy.conservation.item-6` — "Documents comptables (adhésions) : 10 ans (obligation légale)." (ligne 169)

### Section 6 : Sous-traitants
- `privacy.sous-traitants.item-1` — "Supabase — hébergement base de données + authentification. Région UE (Francfort). Contrat DPA signé." (lignes 176-178)
- `privacy.sous-traitants.item-2` — "Vercel — hébergement front. Région UE." (lignes 180-181)
- `privacy.sous-traitants.item-3` — "Stripe — traitement des paiements adhésion. PCI-DSS niveau 1." (lignes 183-184)
- `privacy.sous-traitants.item-4` — "Sentry — supervision des erreurs applicatives. Données personnelles filtrées avant envoi (aucun email, téléphone, adresse)." (lignes 186-188)
- `privacy.sous-traitants.disclaimer` — "Aucun transfert hors UE n'est effectué pour les données de comptes ou de contenus militants." (lignes 191-193)

### Section 7 : Vos droits RGPD
- `privacy.droits.lead` — "Vous disposez à tout moment des droits suivants :" (ligne 199)
- `privacy.droits.item-1` — "Droit d'accès, de rectification et d'effacement." (ligne 201)
- `privacy.droits.item-2` — "Droit à la limitation et à l'opposition au traitement." (ligne 202)
- `privacy.droits.item-3` — "Droit à la portabilité (export des données au format JSON)." (ligne 203)
- `privacy.droits.item-4` — "Droit de retirer votre consentement à tout moment." (ligne 204)
- `privacy.droits.item-5` — "Droit d'introduire une réclamation auprès de la CNIL (cnil.fr)." (lignes 205-210)

### Section 8 : Contact DPO
- `privacy.dpo.text` — "Pour exercer vos droits ou pour toute question relative à la protection des données, contactez notre délégué à la protection des données à l'adresse indiquée dans les mentions légales." (lignes 217-220)

---

## LegalNoticePage (`/legal/notice`)
**Fichier** : web/src/pages/LegalNoticePage.tsx

### Identité
- `legal-notice.h1` — "Mentions légales" (ligne 47)
- `legal-notice.subtitle` — "Dernière mise à jour : 11 mai 2026" (ligne 48)

### Section Éditeur
- `legal-notice.editor.raison-sociale.label` — "Raison sociale" (ligne 53)
- `legal-notice.editor.raison-sociale.value` — "Association Maintenant !" (ligne 54)
- `legal-notice.editor.forme-juridique.label` — "Forme juridique" (ligne 55)
- `legal-notice.editor.forme-juridique.value` — "Association loi 1901" (ligne 56)
- `legal-notice.editor.siege-social.label` — "Siège social" (ligne 57)
- `legal-notice.editor.siege-social.value` — "À compléter avant mise en production" (ligne 58)
- `legal-notice.editor.siret.label` — "SIRET" (ligne 59)
- `legal-notice.editor.siret.value` — "À compléter avant mise en production" (ligne 60)
- `legal-notice.editor.directeur.label` — "Directeur de la publication" (ligne 61)
- `legal-notice.editor.directeur.value` — "À compléter avant mise en production" (ligne 62)
- `legal-notice.editor.contact.label` — "Contact" (ligne 63)
- `legal-notice.editor.contact.value` — "À compléter avant mise en production" (ligne 64)

### Section Hébergement
- `legal-notice.hosting.front.label` — "Front (site web)" (ligne 71)
- `legal-notice.hosting.front.value` — "Vercel Inc. — région UE." (ligne 72)
- `legal-notice.hosting.db.label` — "Base de données et authentification" (ligne 73)
- `legal-notice.hosting.db.value` — "Supabase Inc. — région UE (Francfort)." (ligne 74)
- `legal-notice.hosting.payments.label` — "Paiements" (ligne 75)
- `legal-notice.hosting.payments.value` — "Stripe Payments Europe Ltd." (ligne 76)

### Section Propriété Intellectuelle
- `legal-notice.pi.text` — "Les marques, logos, signes distinctifs et contenus éditoriaux affichés sur ce site appartiennent à leurs détenteurs respectifs. Toute reproduction sans autorisation préalable est interdite. Les contributions des utilisateurs restent la propriété de leurs auteurs." (lignes 82-86)

### Section Liens Utiles
- `legal-notice.useful-links.text` — "Pour en savoir plus sur le traitement de vos données, consultez la politique de confidentialité et la page cookies." (lignes 92-96)
- `legal-notice.useful-links.privacy` — label : "politique de confidentialité", URL : "/legal/privacy" (ligne 94)
- `legal-notice.useful-links.cookies` — label : "page cookies", URL : "/legal/cookies" (ligne 95)

---

## CookiesPage (`/legal/cookies`)
**Fichier** : web/src/pages/CookiesPage.tsx

### Identité
- `cookies.h1` — "Cookies" (ligne 99)

### Intro
- `cookies.intro` — "Cette page détaille les cookies déposés par Maintenant ! et la manière de modifier votre choix." (lignes 100-102)

### Section "Votre choix actuel"
- `cookies.current-choice.title` — H2 id="cookies-current" : "Votre choix actuel" (lignes 105-108)
- `cookies.current-choice.summary.all` — "Vous avez accepté tous les cookies (essentiels + audience)." (ligne 74)
- `cookies.current-choice.summary.essential` — "Vous avez refusé la mesure d'audience. Seuls les cookies essentiels sont actifs." (ligne 76)
- `cookies.current-choice.summary.custom-on` — "Choix personnalisé : audience activée." (ligne 78)
- `cookies.current-choice.summary.custom-off` — "Choix personnalisé : audience désactivée." (ligne 79)
- `cookies.current-choice.summary.none` — "Aucun choix enregistré pour le moment." (ligne 71)
- `cookies.current-choice.recorded-date` — "Choix enregistré le [date]." (ligne 113)
- `cookies.current-choice.reset-btn` — label : "Modifier mes choix" (ligne 117)
- `cookies.current-choice.success-msg` — role="status" — "Choix réinitialisé. La bannière de consentement réapparaîtra au prochain chargement." (ligne 125)

### Section "Liste des cookies"
- `cookies.list.title` — H2 id="cookies-list" : "Liste des cookies" (lignes 130-132)
- `cookies.list.table-header.name` — "Nom" (ligne 137)
- `cookies.list.table-header.purpose` — "Finalité" (ligne 138)
- `cookies.list.table-header.duration` — "Durée" (ligne 139)
- `cookies.list.table-header.category` — "Catégorie" (ligne 140)
- `cookies.list.cookie-1.name` — "sb-auth-token" (ligne 145)
- `cookies.list.cookie-1.purpose` — "Session d'authentification Supabase." (ligne 146)
- `cookies.list.cookie-1.duration` — "1 heure (rafraîchi automatiquement)." (ligne 147)
- `cookies.list.cookie-1.category` — "Strictement nécessaire" (ligne 148)
- `cookies.list.cookie-2.name` — "mn:cookie-consent" (ligne 151)
- `cookies.list.cookie-2.purpose` — "Mémorisation de votre choix de consentement." (ligne 152)
- `cookies.list.cookie-2.duration` — "12 mois." (ligne 153)
- `cookies.list.cookie-2.category` — "Strictement nécessaire" (ligne 154)
- `cookies.list.cookie-3.name` — "_mn_audience" (ligne 157)
- `cookies.list.cookie-3.purpose` — "Mesure d'audience anonymisée (visites agrégées, sans identifiant publicitaire)." (lignes 158-159)
- `cookies.list.cookie-3.duration` — "13 mois." (ligne 161)
- `cookies.list.cookie-3.category` — "Soumis à consentement" (ligne 162)

### Section "En savoir plus"
- `cookies.more.title` — H2 : "En savoir plus" (ligne 169)
- `cookies.more.text` — "Pour le détail des traitements, consultez la politique de confidentialité." (lignes 170-172)
- `cookies.more.link` — label : "politique de confidentialité", URL : "/legal/privacy" (ligne 172)

---

## ContactPage (`/legal/contact`)
**Fichier** : web/src/pages/ContactPage.tsx

### Identité
- `contact.h1` — "Nous contacter" (ligne 231)

### Back Link
- `contact.back-link` — label : "Retour aux mentions légales", icône : IconArrowLeft (lignes 228-230)

### Hero
- `contact.hero.lead` — "Une question, un signalement, une demande d'exercice de vos droits RGPD ? Écrivez-nous via le formulaire ci-dessous (transmis à l'équipe support) ou par email à support@email." (lignes 232-236)

### Formulaire de contact
- `contact.form.aria-label` — "Formulaire de contact" (ligne 238)
- `contact.form.global-error` — affiche globalError avec role="alert" (lignes 239-243)
- `contact.form.success-msg` — affiche successText avec role="status" (lignes 244-248)

#### Champ Sujet
- `contact.field-subject.label` — "Sujet (facultatif)" (ligne 251)
- `contact.field-subject.input.id` — "contact-subject" (ligne 254)
- `contact.field-subject.placeholder` — "Sujet de votre message" (ligne 260)

#### Champ Message
- `contact.field-body.label` — "Message" (ligne 265)
- `contact.field-body.textarea.id` — "contact-body" (ligne 268)
- `contact.field-body.aria-invalid` — si bodyError (ligne 274)
- `contact.field-body.max-length` — MESSAGE_BODY_MAX + 50 (ligne 275)
- `contact.field-body.help` — "Entre {min} et {max} caractères. Ne partagez aucun identifiant, mot de passe ou information bancaire dans ce formulaire." (lignes 277-279)
- `contact.field-body.error` — affiche bodyError si présent (lignes 281-282)

### Bouton Submit
- `contact.submit.in-app.label` — label : "Envoyer via la messagerie interne", icône : IconMail, visible si canSendInApp (lignes 285-293)
- `contact.submit.in-app.busy-state` — "Envoi…" (ligne 292)
- `contact.submit.email.label` — label : "Envoyer par email", icône : IconMail, fallback si non-authenticated (lignes 295-299)

### Footer Info
- `contact.footer.email-fallback` — "Vous préférez écrire directement par email ? {email} répond en moins de 72 h ouvrées." (lignes 302-304)
- `contact.footer.email-link` — URL : `mailto:{email}?subject=[subject]&body=[body]` (lignes 163-169)

---

## NotFoundPage (404)
**Fichier** : web/src/pages/NotFoundPage.tsx

### Identité
- `404.h1` — "404 — Page introuvable" (ligne 6)

### Body
- `404.body` — "Cette page n'existe pas ou a été déplacée." (ligne 7)

### Back Link
- `404.back-link` — label : "Retour à l'accueil", URL : "/" (lignes 9-10)
