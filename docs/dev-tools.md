
# Outils de développement

Ce document décrit les outils de développement disponibles pour faciliter le respect des règles d'architecture du projet.

## Hook Pre-commit

Un hook pre-commit est disponible pour vérifier automatiquement la conformité architecturale avant chaque commit.

### Installation

```bash
npm run setup-pre-commit
```

Cette commande installe automatiquement le hook pre-commit dans votre dépôt Git local.

### Fonctionnement

Lors d'un commit, le hook exécute une version légère de l'analyse d'architecture, ciblant uniquement les fichiers modifiés dans le commit en cours. Si des problèmes sont détectés, le commit est bloqué avec un message explicatif.

### Désactivation temporaire

Si nécessaire, vous pouvez contourner la vérification avec l'option `--no-verify`:

```bash
git commit -m "Message de commit" --no-verify
```

## Extension VS Code

Une extension VS Code est fournie pour visualiser les problèmes d'architecture directement dans l'éditeur.

### Installation

1. Générer le package de l'extension:
```bash
npm run vscode:package
```

2. Installer l'extension dans VS Code:
   - Dans VS Code, ouvrez la palette de commandes (Ctrl+Shift+P)
   - Tapez "Extensions: Install from VSIX"
   - Sélectionnez le fichier .vsix généré dans le dossier `vscode-extension/dist`

### Fonctionnalités

- Diagnostic en temps réel des problèmes d'architecture
- Signalement des anti-patterns directement dans le code
- Vue dédiée pour explorer tous les problèmes du projet
- Accès direct au tableau de bord d'architecture

### Commandes disponibles

- `Architecture Analyzer: Analyser l'architecture` - Analyse manuelle du fichier actif
- `Architecture Analyzer: Afficher le tableau de bord` - Ouvre le tableau de bord d'architecture dans VS Code

## Analyse et rapports

### Analyse rapide de l'architecture

Pour vérifier rapidement la conformité architecturale des fichiers modifiés:

```bash
npm run architecture:quick
```

Cette commande exécute l'analyse uniquement sur les fichiers modifiés depuis le dernier commit.

### Analyse complète de l'architecture

Pour une analyse complète du projet:

```bash
npm run architecture:full
```

Cette commande génère:
- Un rapport détaillé des métriques (JSON)
- Un tableau de bord visuel (HTML)

### Visualisation du tableau de bord

Pour visualiser le tableau de bord d'architecture dans un navigateur:

```bash
npm run architecture:serve
```

Cette commande lance un serveur local et ouvre automatiquement le tableau de bord dans votre navigateur par défaut.

## Documentation et partage des rapports

### Référence des règles d'architecture

Une documentation complète des règles d'architecture et de leur justification est disponible:

```bash
npm run architecture:docs
```

Cette commande copie la documentation dans le dossier `reports` pour un accès facile.

### Export des rapports

Pour exporter les rapports d'architecture dans différents formats:

```bash
npm run architecture:export [format] [options]
```

Formats disponibles:
- `html` (par défaut): Format HTML interactif
- `json`: Données brutes au format JSON
- `markdown`: Format Markdown pour documentation
- `pdf`: Document PDF (nécessite puppeteer)

Options:
- `--timestamp` ou `-t`: Inclut un horodatage dans le nom du fichier
- `--project=<nom>`: Spécifie le nom du projet dans le rapport
- `--output=<chemin>`: Définit le répertoire de sortie
- `--open` ou `-o`: Ouvre automatiquement le rapport exporté

Exemples:
```bash
npm run architecture:export
npm run architecture:export -- markdown --timestamp
npm run architecture:export -- pdf --project="Mon Projet" --open
```

### Partage des rapports

Pour partager les rapports avec l'équipe via différents canaux:

```bash
npm run architecture:share [options]
```

Options:
- `--format=<format>`: Format d'export (html, json, markdown, pdf)
- `--configure-email`: Configure le partage par e-mail
- `--recipients=<emails>`: Liste d'e-mails séparés par des virgules
- `--subject=<sujet>`: Sujet de l'e-mail
- `--message=<message>`: Corps de l'e-mail
- `--configure-slack`: Configure le partage Slack
- `--configure-teams`: Configure le partage Teams

Exemples:
```bash
# Configuration du partage par e-mail
npm run architecture:share -- --configure-email --recipients=equipe@example.com

# Partage d'un rapport
npm run architecture:share -- --format=pdf --project="Mon Projet"
```

### Intégration CI/CD

Le workflow GitHub Actions dans `.github/workflows/architecture-analysis.yml` exécute automatiquement l'analyse:
- À chaque push sur la branche main
- À chaque pull request vers main
- Une fois par semaine (tous les lundis à 9h00)
- Manuellement via l'interface GitHub Actions

Les rapports sont disponibles en tant qu'artifacts de workflow et un commentaire est ajouté aux pull requests avec le statut de l'analyse.
