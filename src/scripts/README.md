
# Scripts d'analyse architecturale

Ce dossier contient tous les scripts utilisés pour l'analyse et la vérification de l'architecture du projet.

## Important: Conventions de codage

Tous les scripts dans ce dossier suivent les conventions suivantes:

1. **Format ES Modules**: Tous les scripts utilisent la syntaxe ES Modules (`import` et `export`), **pas** la syntaxe CommonJS (`require()` et `module.exports`).
2. **Pas de lignes vides** au début des fichiers.
3. **Shebang** en première ligne pour les scripts exécutables: `#!/usr/bin/env node`

## Scripts disponibles

### Scripts d'analyse

- `analyze-architecture.js`: Analyse la structure du code et vérifie sa conformité avec l'architecture définie.
- `architecture-metrics.js`: Génère des métriques détaillées sur l'architecture.
- `generate-metrics-dashboard.js`: Crée un tableau de bord HTML à partir des métriques.
- `run-architecture-analysis.js`: Point d'entrée principal qui exécute l'analyse complète.

### Scripts de vérification

- `verify-architecture-phase.js`: Vérifie une phase spécifique du plan d'alignement architectural.
- `verify-phase2.js`: Script spécifique pour la phase 2, plus simple à utiliser.

### Scripts utilitaires

- `add-npm-scripts.js`: Ajoute les commandes npm dans package.json.
- `add-verification-scripts.js`: Ajoute les commandes de vérification des phases.
- `add-cicd-scripts.js`: Ajoute les commandes pour l'intégration CI/CD.
- `fix-script-files.js`: Utilitaire pour corriger les problèmes courants dans les fichiers de scripts.

## Exécution des scripts

La plupart des scripts peuvent être exécutés avec la commande `node`:

```bash
node src/scripts/analyze-architecture.js
```

Mais il est recommandé d'utiliser les commandes npm définies dans le fichier package.json:

```bash
npm run analyze-architecture
npm run verify:phase2
npm run architecture:full
```

## En cas de problème

Si vous rencontrez des problèmes avec les scripts:

1. Exécutez `node src/scripts/fix-script-files.js` pour corriger les problèmes courants.
2. Assurez-vous que tous les fichiers sont au format ES Modules (import/export).
3. Vérifiez qu'il n'y a pas de lignes vides au début des fichiers.
