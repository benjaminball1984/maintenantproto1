# Guide utilisateur — Maintenant !

Ce guide s'adresse aux adhérent·es du mouvement. Pour les questions
de modération, voir [MODERATION.md](./MODERATION.md). Pour la procédure
de mise en prod, voir [PROD-RUNBOOK.md](./PROD-RUNBOOK.md).

---

## Compte et adhésion

### Comment je crée un compte ?

Clique sur **« Se connecter »** en haut à droite, puis sur l'onglet
**« Inscription »**. Renseigne ton email, un mot de passe d'au moins
8 caractères, et ton prénom. Tu reçois un email de confirmation — clique
sur le lien dans les 24 h pour activer ton compte. Sans confirmation, tu
ne peux pas signer de pétition ni participer aux mobilisations.

### Comment j'adhère au mouvement ?

Va sur **`/join`** (menu **« Adhérer »**). Trois niveaux :

| Niveau | Prix | Crédit T99CP mensuel |
| --- | --- | --- |
| **Gratuit** | 0 € | 10 |
| **Soutien** | 2 €/mois | 30 |
| **Engagé·e** | 5 €/mois | 60 |

Le paiement passe par Stripe — tu ne renseignes jamais ta carte sur notre
site. Tu peux résilier à tout moment depuis ton profil. Le crédit T99CP
est débloqué dès la première facture payée.

### À quoi servent les T99CP ?

Les T99CP sont la monnaie interne du mouvement. Tu en gagnes :

- en adhérant (crédit mensuel automatique) ;
- en publiant du contenu validé (pétition, mobilisation, article média) ;
- en parrainant un·e nouvel·le adhérent·e.

Tu en dépenses pour :

- emprunter un objet (lending) ou un service (SEL) ;
- réserver un trajet en covoiturage ;
- contribuer à une cagnotte (crowdfunding) sans passer par Stripe.

Le solde est strictement positif (impossible d'aller dans le rouge). En
cas de débit refusé, le message **« solde insuffisant »** s'affiche.

### Combien de T99CP ont été distribués au total ?

Le total cumulé de T99CP crédités depuis l'ouverture du mouvement
n'est **pas affiché publiquement** sur la page `/transparence` à
ce stade.

**Pourquoi** : la table interne `t99cp_transactions` est protégée
par une politique RLS « self-only » (chaque adhérent·e ne voit
que ses propres lignes), ce qui empêche un·e visiteur·euse
anonyme de sommer publiquement les crédits. Une fonction
serveur dédiée (RPC `SECURITY DEFINER`) serait techniquement
possible pour exposer un seul scalaire agrégé, mais cette
décision produit n'a pas encore été validée (la valeur
informationnelle de ce nombre brut, hors contexte d'usage, est
discutable — un total de « 1,2 M T99CP émis » n'aide pas à
comprendre comment ils circulent).

**Ce qu'on affiche déjà** sur `/transparence` :

- nombre de membres inscrits ;
- pétitions / mobilisations / campagnes publiées ;
- communes libres actives ;
- total cumulé de signatures ;
- évolution mensuelle des inscriptions sur 12 mois (graphique).

Si tu trouves ce manque gênant ou pertinent pour ta confiance
dans la transparence du mouvement, écris à
`contact@maintenant.org` — la décision pourra être ré-évaluée
sur la base des retours utilisateur·rices.

### Transparence du mouvement

Toutes les statistiques publiques agrégées sont visibles sur la
page `/transparence`. Elle est mise à jour en temps réel à chaque
chargement (compteurs SQL côté serveur, aucune mise en cache côté
CDN). Les buckets mensuels du graphique d'inscriptions sont
calculés en **UTC** — un compte créé le 31 mai à 23 h 30 (Europe/
Paris, soit 21 h 30 UTC) apparaît dans le bucket de mai ; créé à
01 h 30 le 1er juin (Europe/Paris, soit 23 h 30 UTC le 31 mai) il
apparaît également dans le bucket de mai.

### Comment je récupère mes données / supprime mon compte ?

Va dans **Profil → Données personnelles** :

- **Export JSON** : télécharge un fichier `.json` contenant l'ensemble
  de tes données (compte, pétitions signées, posts, messages…). Conforme
  au droit de portabilité RGPD.
- **Supprimer mon compte** : suppression définitive sous 72 h. Tes posts
  et signatures restent (anonymisés en `Utilisateur supprimé`) car
  ils participent à des compteurs publics (nombre de signatures sur
  une pétition).

Pour toute autre demande RGPD (rectification, opposition au traitement),
écris à l'adresse indiquée dans la **page mentions légales** (`/legal/notice`).

---

## Pétitions

### Comment je signe une pétition ?

Va sur la fiche pétition (`/petitions/<slug>`), clique sur **« Signer
cette pétition »**. Si tu n'es pas connecté·e, on te demande de te
connecter d'abord. Une signature = un compte. Tu peux retirer ta
signature à tout moment depuis le même bouton (« Retirer ma signature »).

### Comment je crée une pétition ?

Tu dois être connecté·e et avoir confirmé ton email. Va sur
`/petitions/new`. Remplis :

- **Titre** (4–80 caractères) — clair, impératif (« Pour la création
  d'une zone piétonne rue Voltaire »).
- **Description** — argumentaire factuel. Lien vers les sources.
- **Objectif** (nombre de signatures cible) — réaliste, atteignable.
- **Échéance** (optionnelle) — date limite.

Une pétition publiée est immédiatement visible. Tu peux la modifier
tant qu'aucune signature n'a été collectée. Au-delà, seul un·e admin peut
corriger une faute (la modification crée une entrée dans `admin_logs`).

### Quand est-ce qu'une pétition est dépubliée ?

Une pétition peut être dépubliée par un·e admin si elle viole la charte
(cf. [MODERATION.md](./MODERATION.md)) : appel à la haine, fake news,
diffamation, doublon. Tu reçois une notification expliquant la décision.
Tu peux contester par message à `contact@maintenant.org` (ou via le
formulaire `/contact`).

---

## Mobilisations et événements

### Comment je RSVP à une mobilisation ?

Sur la fiche mobilisation, clique sur **« Je viens »**. Tu peux annuler
ta participation tant que la date de départ n'est pas passée. Le
compteur de participants est en temps réel — il aide l'organisateur·rice
à dimensionner la logistique.

### Je n'ai pas pu venir, mon RSVP compte ?

Non. Le compteur reflète les intentions, pas la présence réelle. Sans
système de check-in (pas dans le périmètre actuel), les chiffres
sont une estimation.

---

## Services communautaires

### Hébergement, covoiturage, prêt, marketplace, jardin, SEL

Toutes ces fonctionnalités suivent le même modèle :

1. **Listing public** : tu peux consulter sans compte.
2. **Demande / réservation** : nécessite un compte confirmé. Pour
   l'hébergement et le covoiturage, tu envoies une demande au·à la
   propriétaire qui accepte/refuse.
3. **Paiement** : en T99CP (lending, SEL, garden) ou en euros via le
   propriétaire (housing, carpooling). Maintenant ! ne joue pas de
   rôle d'intermédiaire financier pour les paiements en euros entre
   utilisateurs.

### Crowdfunding

Tu peux contribuer à une cagnotte en euros (via Stripe) ou en T99CP.
Les contributions en euros sont collectées par l'organisateur·rice (ou
le mouvement si le projet est porté collectivement). Voir la fiche
campagne pour les modalités exactes.

---

## Réseau social et messagerie

### Comment je publie un post ?

Va sur `/reseau`, clique sur **« Nouveau post »**. Texte uniquement
(pas d'image dans la v1). Les posts sont publics par défaut — tous les
adhérent·es peuvent les lire et y réagir.

### Comment je discute en privé avec quelqu'un ?

Sur le profil de la personne, clique sur **« Message privé »**. Une
conversation s'ouvre. Les messages sont chiffrés en transit (TLS) mais
**pas en bout-en-bout** : un·e admin peut accéder à une conversation en
cas de signalement, sous traçabilité (entrée dans `admin_logs`).

### Comment je signale un contenu / utilisateur ?

Sur n'importe quel contenu (post, commentaire, message, pétition), tu
trouveras un lien **« Signaler »**. Renseigne la raison (haine, spam,
fake, harcèlement, autre) et un message optionnel. L'équipe de
modération reçoit une notification (cf. [MODERATION.md](./MODERATION.md)).

---

## Communes libres

### Qu'est-ce qu'une commune libre ?

Une **commune libre** est un groupe local d'adhérent·es organisé·es
autour d'un territoire (ville, quartier, école…). Elle a :

- une page publique (description, photos) ;
- une liste de membres (visibles publiquement) ;
- un fil interne de discussion (visible uniquement par les membres) ;
- éventuellement ses propres pétitions / mobilisations / SEL.

### Comment je rejoins une commune ?

Va sur `/communes`, choisis ta ville, clique sur **« Rejoindre cette
commune »**. Tu deviens membre instantanément (pas de validation).
Tu peux quitter à tout moment depuis ton profil.

---

## Problèmes techniques

### J'ai oublié mon mot de passe

Sur l'écran de connexion, clique sur **« Mot de passe oublié »**. Tu
reçois un email avec un lien de réinitialisation valable 1 h.

### Le site rame / un bouton ne marche pas

Recharge la page (Ctrl+F5 ou Cmd+Shift+R). Si le problème persiste :

- Ouvre la console développeur (F12 → onglet **Console**) — capture
  d'écran utile pour le support.
- Envoie un email à `contact@maintenant.org` avec ta version de
  navigateur (Aide → À propos) et un descriptif du bouton qui rate.

### Je ne reçois pas l'email de confirmation

- Vérifie le dossier **Spam**.
- Patiente 5 min (les envois sont throttle pour éviter le spam).
- Si rien dans 30 min : `contact@maintenant.org` avec ton email
  d'inscription. L'équipe peut renvoyer manuellement le lien.

---

## Confidentialité et sécurité

- Les serveurs sont hébergés en **Union européenne** (région Paris,
  Supabase EU). Aucun transfert hors UE.
- Le site est en **HTTPS** uniquement (HSTS preload). Aucune donnée ne
  transite en clair.
- Nous **n'utilisons pas** de tracker publicitaire (pas de Google
  Analytics, pas de Facebook Pixel). La bannière cookies te demande
  uniquement le consentement pour les **mesures d'audience anonymisées**
  (opt-in).
- Les **mots de passe** sont stockés hashés (bcrypt via Supabase Auth).
  Personne au sein de l'équipe ne peut les lire en clair.
- Voir aussi la page **politique de confidentialité** (`/legal/privacy`)
  pour le détail des traitements RGPD.

---

## Contact

- Support produit : `contact@maintenant.org`
- Signalement abus / modération : `moderation@maintenant.org`
- Bug technique / sécurité : `tech@maintenant.org` (PGP key sur la page
  contact)
