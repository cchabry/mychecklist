
# Architecture Analyzer for VS Code

Cette extension VS Code permet de visualiser les problèmes d'architecture directement dans l'éditeur.

## Fonctionnalités

- Analyse en temps réel des fichiers ouverts
- Détection des anti-patterns définis dans le projet
- Soulignement des problèmes d'architecture
- Vue dédiée pour explorer tous les problèmes
- Quick-fixes pour les problèmes courants

## Installation

1. Téléchargez le fichier VSIX depuis le dossier `dist` de ce dépôt
2. Dans VS Code, ouvrez la palette de commandes (Ctrl+Shift+P)
3. Tapez "Extensions: Install from VSIX" et sélectionnez le fichier téléchargé

## Utilisation

L'extension s'active automatiquement pour les projets contenant une structure d'analyse d'architecture.

Pour analyser manuellement, utilisez la commande "Analyser l'architecture" depuis la palette de commandes.

## Développement

1. Clonez ce dépôt
2. Exécutez `npm install`
3. Ouvrez le dossier dans VS Code
4. Appuyez sur F5 pour lancer une instance de développement avec l'extension
