# 📦 Comment pousser ce projet sur GitHub

## Étape 1 — Récupère l'archive

Le fichier `maintenant-prototype-export.tar.gz` (1,4 Mo) contient tout le projet.

**Comment le télécharger ?**

Dans ton interface Claude Code (claude.ai/code), regarde sur le côté gauche dans l'arborescence des fichiers. Tu devrais voir :

- soit un bouton **« Télécharger »** ou **icône ⬇** quand tu cliques sur le fichier
- soit un menu **⋯** (trois points) à côté du fichier
- soit un clic-droit qui propose **« Download »**

Cherche le fichier `maintenant-prototype-export.tar.gz` à la racine du workspace.

Si tu ne trouves vraiment pas, dis-le-moi et on essaiera autre chose.

## Étape 2 — Décompresse chez toi

Une fois téléchargé sur ton ordi, double-clique l'archive (Mac/Windows extraient automatiquement). Sur Linux :

```bash
tar xzf maintenant-prototype-export.tar.gz
```

Tu obtiens un dossier `repo/` avec à l'intérieur `project/`, `chats/`, `README.md`.

## Étape 3 — Initialise git et pousse

Ouvre un terminal dans le dossier `repo/` extrait, puis :

```bash
# Initialise un dépôt local
git init
git add .
git commit -m "Maintenant ! — prototype complet"

# Connecte-le à ton repo GitHub
git branch -M main
git remote add origin https://github.com/benjaminball1984/maintenantproto1.git
git push -u origin main
```

GitHub te demandera tes identifiants (ou un token). Le repo `maintenantproto1` doit être **vide** pour que ça marche du premier coup. Si tu y as déjà mis quelque chose, remplace `git push -u origin main` par `git push -u origin main --force` (⚠ ça écrase ce qu'il y avait avant — fais-le seulement si le repo n'a rien d'important dedans).

## Étape 4 — Charge dans Claude Design

Sur claude.ai/design (nouvelle conversation OU la conversation Maintenant ! existante), demande :

> *« Charge mes fichiers depuis https://github.com/benjaminball1984/maintenantproto1/tree/main/project/app et fais-moi un preview de Maintenant.html »*

Claude Design devrait pouvoir lire le repo (il a une intégration GitHub) et afficher le résultat.

## En cas de pépin

- **« git command not found »** sur ton ordi → installe git via [git-scm.com](https://git-scm.com/) (Windows) ou `brew install git` (Mac)
- **« remote rejected »** → c'est probablement parce que ton repo a déjà des fichiers. Solution : utilise `--force` ou crée un nouveau repo vide.
- **« authentication failed »** → GitHub demande un Personal Access Token (PAT) au lieu du mot de passe. Génère-le sur github.com → Settings → Developer settings → Personal access tokens.

## Ce que tu vas pousser

```
repo/
├── README.md                       (handoff README de Claude Design)
├── chats/                          (transcripts de design)
│   ├── chat1.md
│   ├── chat2.md
│   └── chat3.md
└── project/
    ├── README.md                   (design system Maintenant !)
    ├── SKILL.md
    ├── colors_and_type.css
    ├── uploads/                    (4 images de référence)
    ├── preview/                    (composants design system en HTML)
    └── app/                        ⭐ LE PROTOTYPE PRINCIPAL
        ├── Maintenant.html         (point d'entrée)
        ├── AppData.jsx             (données mock)
        ├── Theme.jsx               (système de design)
        ├── Compat.jsx              (alias legacy)
        ├── Pages_Home.jsx
        ├── Pages_Services.jsx
        ├── Pages_Commerce.jsx
        ├── Pages_Media_Profile.jsx
        ├── CampaignPage.jsx
        ├── ReseauPage.jsx
        ├── PollsPage.jsx
        ├── AdminMessagingNotifs.jsx
        ├── AdminEmailsAPI.jsx
        ├── JoinMovement.jsx
        └── CommunesLibres.jsx
```

15 fichiers `.jsx`/`.html` actifs, environ 9 000 lignes de code en tout.

---

**Bon courage ! Si tu coinces, reviens me voir, on debug ensemble.**
