# Procédure de modération — Maintenant !

Ce document est destiné aux **admins** du mouvement (`is_admin=true`
dans `public.users`). Il décrit la procédure de modération des contenus
signalés, les escalades, et la traçabilité requise.

Pour les utilisateurs, voir [USER-GUIDE.md § Signalement](./USER-GUIDE.md#comment-je-signale-un-contenu--utilisateur).

---

## Principes

1. **Transparence** : toute action de modération est tracée dans
   `admin_logs` (table append-only, lecture admin uniquement). Le
   compte qui agit est identifié (`actor_id`).
2. **Proportionnalité** : avertissement → masquage → suppression →
   suspension de compte → bannissement. On ne saute pas d'étape sauf
   urgence (haine, doxxing, mineur exposé).
3. **Délai cible** : signalement traité sous **24 h ouvrées** pour
   les contenus standards, **2 h** pour les contenus à risque
   (haine, mineur, doxxing, menaces).
4. **Subsidiarité** : un·e modérateur·rice ne décide pas seul·e sur
   un cas politique ou ambigu — escalade vers le binôme de référence
   (cf. § Escalation).

---

## Charte du mouvement (référence)

Sont **interdits** sur la plateforme :

- **Haine, discrimination** : propos racistes, antisémites, sexistes,
  LGBTphobes, validistes, classistes.
- **Désinformation** : fake news, théories complotistes, négationnisme.
- **Violences** : appels à la violence, menaces, intimidation, doxxing.
- **Harcèlement** : ciblage répété d'un·e utilisateur·rice.
- **Spam, scams, publicité** : promotion commerciale non autorisée,
  chaînes de messages, schémas pyramidaux.
- **Contenus illégaux** : pédopornographie, apologie du terrorisme,
  partage de données personnelles tierces sans consentement.
- **Doublons** : pétitions / mobilisations identiques (regrouper).
- **Hors-sujet** : contenu sans rapport avec le mouvement (sport, etc.).

Sont **encouragés** :

- Désaccord argumenté, débat factuel.
- Critique du mouvement (interne et publique).
- Initiatives locales (communes libres, mobilisations).

---

## Workflow d'un signalement

```
┌─────────────────┐
│  Signalement    │
│  (utilisateur)  │
└────────┬────────┘
         │
         ▼
┌────────────────────────┐
│ Page admin              │
│ /admin/reports          │
│ (filtre: open / closed) │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Triage (modérateur)    │
│  - Lit le contenu       │
│  - Vérifie la charte    │
│  - Décide               │
└────────┬───────────────┘
         │
         ├──► Légitime ──┐
         │               ▼
         │      ┌────────────────────┐
         │      │  Action graduée    │
         │      │  (cf. § Sanctions) │
         │      └────────┬───────────┘
         │               │
         │               ▼
         │      ┌────────────────────┐
         │      │  admin_logs entry  │
         │      └────────────────────┘
         │
         └──► Non légitime ─► Marquer « closed_no_action »
```

---

## Sanctions et procédures

### 1. Avertissement (warning)

**Quand** : première infraction mineure (ton agressif sans haine,
hors-sujet, doublon).

**Comment** :

- Aller sur la page de l'utilisateur depuis `/admin/users/<id>`.
- Cliquer sur **« Avertir »** → motif + message (200 caractères max).
- Le message est envoyé à l'utilisateur via `notifications` (kind
  `moderation_warning`) ET par email.

**Trace** : `admin_logs` → `action='warn_user'`, `target_id=<user_id>`,
`payload={ reason, message }`.

### 2. Masquage du contenu (`is_published=false`)

**Quand** : contenu litigieux qui ne mérite pas suppression définitive
(faute factuelle corrigeable, doublon recoupable).

**Comment** : sur la fiche du contenu, bouton **« Dépublier »** →
motif obligatoire. Le contenu n'est plus visible publiquement mais
reste accessible aux admins pour audit. L'auteur·rice reçoit une
notification.

**Trace** : `admin_logs` → `action='unpublish_<table>'`,
`target_table=<table>`, `target_id=<id>`, `payload={ reason }`.

### 3. Suppression définitive

**Quand** : contenu illégal, haine, doxxing, spam massif. **Une seconde
opinion d'admin est requise** (deux admins distincts doivent valider).

**Comment** :

- Première validation : marquer le contenu `pending_deletion` (via le
  bouton **« Proposer la suppression »**).
- Seconde validation : un·e autre admin clique sur **« Confirmer la
  suppression »** dans `/admin/pending`.
- Le contenu est supprimé via `delete from <table> where id=...`
  (cascade applique aux signatures/likes/comments selon les FK).

**Trace** : deux entrées `admin_logs` (proposition + confirmation), avec
les `actor_id` distincts. La payload contient le contenu supprimé (en
JSON) pour audit éventuel (RGPD : 1 an de rétention max).

### 4. Suspension temporaire (`account_status='suspended'`)

**Quand** : récidive après avertissement, comportement répété de
trolling / harcèlement. Durée : 7 / 30 / 90 jours.

**Comment** : page `/admin/users/<id>` → **« Suspendre »** → durée +
motif. L'utilisateur peut se connecter (pour télécharger ses données,
résilier son adhésion) mais ne peut pas créer / signer / publier.

**Trace** : `admin_logs` → `action='suspend_user'`, payload avec durée
et raison. La fin de suspension est automatique (cron quotidien).

### 5. Bannissement définitif

**Quand** : haine ouverte récidiviste, harcèlement organisé, contenus
illégaux, identité fausse. **Validation à 3 admins requise**.

**Comment** : workflow similaire à la suppression définitive (proposer
→ valider → confirmer). Le compte passe en `account_status='banned'`.
Toutes les sessions sont invalidées. L'email est blacklisté (pour
empêcher la recréation immédiate sous le même email — bypass possible
avec un autre email mais on aura tracé l'historique).

**Trace** : trois entrées `admin_logs` distinctes.

---

## Cas spéciaux

### Contenus impliquant des mineur·es

**Action immédiate** : masquer le contenu (étape 2), créer une entrée
`admin_logs` avec `priority=critical`, et alerter l'équipe sécurité
par email (`security@maintenant.org`). Si le contenu est manifestement
illégal (pédopornographie, exposition d'un·e mineur·e), **signalement
PHAROS** (https://www.internet-signalement.gouv.fr/) sous 24 h.

### Doxxing / données personnelles tierces

**Action immédiate** : suppression définitive (étape 3) avec
validation à 1 admin (urgence > seconde opinion). Notification à la
victime si on peut l'identifier. Conservation d'un snapshot dans
`admin_logs.payload` (chiffré côté Supabase, accès admin uniquement) en
cas de demande judiciaire.

### Menaces de mort / suicide

**Action immédiate** :

1. Masquage du contenu menaçant.
2. Pour menaces de suicide : message privé via le compte support
   (`VITE_SUPPORT_USER_ID`) avec ressources (3114, SOS Amitié,
   psychologues bénévoles du mouvement).
3. Pour menaces de mort contre un tiers : signalement police +
   suppression définitive + bannissement.

### Demandes de retrait RGPD (droit à l'oubli)

Reçues par email à `dpo@maintenant.org`. Procédure :

1. Vérifier l'identité (email du compte ou pièce d'identité).
2. Si la demande est légitime → suppression définitive du compte
   (anonymisation des signatures/posts qui restent en compteur public).
3. **Purger aussi `public.stripe_events`** où le `payload jsonb`
   contient le `customer_email` ou le `customer` ID Stripe de
   l'utilisateur·rice (la table archive les évènements Stripe bruts
   pour audit ; le payload peut contenir des PII). Requête type :
   `delete from public.stripe_events where payload->'data'->'object'->>'customer_email' = '<email>';`
   (à adapter selon la forme exacte de l'event). À exécuter avec une
   double validation admin.
4. Délai légal : **30 jours** max. Trace dans `admin_logs`.

> **Dette technique** : on devrait purger `stripe_events` plus
> agressivement (TTL 90 jours par exemple) plutôt que de garder les
> events Stripe bruts indéfiniment. À traiter dans une étape
> dédiée — soit cron de purge, soit scrubbing du payload avant
> insertion (garder seulement `id`, `type`, `subscription`,
> `metadata.user_id` — pas d'email ni adresse).

---

## Escalation

| Niveau | Qui | Décide quoi |
| --- | --- | --- |
| **L1** | Modérateur·rice de garde | Avertissements, masquages, signalement de doublons |
| **L2** | Binôme de référence (2 admins distincts) | Suppressions définitives, suspensions |
| **L3** | Bureau du mouvement (3+ admins) | Bannissements, cas politiques sensibles, recours utilisateurs |
| **L4** | Conseil de modération + juriste externe | Cas judiciaires, demandes police, RGPD complexes |

Le binôme de référence change chaque mois (planning publié dans le
canal interne `#moderation`).

---

## Recours utilisateur

Un·e utilisateur·rice sanctionné·e peut contester par email à
`recours@maintenant.org` dans un délai de **15 jours**. La décision
de recours est prise par un·e admin distinct·e de celui·celle qui a
appliqué la sanction initiale. Notification de la décision dans les
**10 jours** ouvrables.

En cas de désaccord persistant, le dossier monte au **Conseil de
modération** (L4) qui décide en dernier ressort. Le compte peut
saisir la **CNIL** ou le tribunal compétent pour les sanctions liées
au RGPD.

---

## Audit et statistiques

Page `/admin/dashboard` (admin only) :

- Nombre de signalements (par semaine, par catégorie).
- Nombre d'actions de modération (par type).
- Temps médian de traitement (objectif : < 24 h).
- Top 10 des utilisateurs signalés (anonymisé pour le rapport public
  mensuel publié sur `/transparence`).

Le rapport public mensuel est généré le 1er du mois suivant, agrégé
sans identifier personne.

---

## Outils

**État** : à la livraison de l'étape 19, seule la route `/admin` existe
côté front — elle agrège les onglets « signalements / utilisateurs / logs
/ dashboard » dans une seule page (cf. `web/src/pages/AdminPage.tsx`).
Les chemins listés ci-dessous sont une **roadmap d'évolution** : à mesure
que le volume de modération augmentera, on les éclatera en sous-routes
dédiées. Pour l'instant, tout est accessible depuis `/admin`.

- `/admin/reports` *(roadmap)* — file des signalements. Pour l'instant
  onglet « Signalements » sur `/admin`.
- `/admin/users/<id>` *(roadmap)* — fiche utilisateur (avertir,
  suspendre, bannir). Pour l'instant onglet « Utilisateurs » sur
  `/admin`.
- `/admin/pending` *(roadmap)* — file des suppressions / bannissements
  en attente de seconde / troisième validation. Pour l'instant
  validation manuelle en équipe avant action.
- `/admin/logs` *(roadmap)* — consultation `admin_logs` filtrable par
  date / actor / action. Pour l'instant requête SQL directe côté
  Supabase Studio.
- `/admin/dashboard` *(roadmap)* — KPIs (modération, trafic,
  signalements). Pour l'instant rapport manuel mensuel.

Toutes ces routes requièrent `is_admin=true` (cf. RLS `admin_*_admin`
policies + composant `RequireAdmin`).

---

## Mise à jour de ce document

Ce document est versionné dans Git (`docs/MODERATION.md`). Toute
modification suit le workflow PR standard (review d'au moins un·e admin
distinct·e de l'auteur·rice). Les changements substantiels sont
annoncés dans `#moderation` et discutés en conseil de modération.
