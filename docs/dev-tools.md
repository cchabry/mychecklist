
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

## Analyse rapide de l'architecture

Pour vérifier rapidement la conformité architecturale des fichiers modifiés:

```bash
npm run architecture:quick
```

Cette commande exécute l'analyse uniquement sur les fichiers modifiés depuis le dernier commit.

## Analyse complète de l'architecture

Pour une analyse complète du projet:

```bash
npm run architecture:full
```

Cette commande génère:
- Un rapport détaillé des métriques (JSON)
- Un tableau de bord visuel (HTML)

## Visualisation du tableau de bord

Pour visualiser le tableau de bord d'architecture dans un navigateur:

```bash
npm run architecture:serve
```

Cette commande lance un serveur local et ouvre automatiquement le tableau de bord dans votre navigateur par défaut.
