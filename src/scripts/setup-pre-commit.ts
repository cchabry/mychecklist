#!/usr/bin/env node
/**
 * Script de configuration du hook pre-commit
 * 
 * Ce script installe un hook pre-commit Git qui exécute l'analyse d'architecture
 * avant chaque commit pour s'assurer que les changements respectent l'architecture définie.
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

// Chemins principaux
const ROOT_DIR = path.resolve(__dirname, '../..');
const GIT_DIR = path.join(ROOT_DIR, '.git');
const HOOKS_DIR = path.join(GIT_DIR, 'hooks');
const PRE_COMMIT_PATH = path.join(HOOKS_DIR, 'pre-commit');

// Contenu du hook pre-commit
const PRE_COMMIT_CONTENT = `#!/bin/sh
# Hook pre-commit pour l'analyse d'architecture
# Installé automatiquement par le script setup-pre-commit.ts

echo "🔍 Exécution de l'analyse d'architecture..."

# Sauvegarde des fichiers modifiés qui ne sont pas encore commités
git stash -q --keep-index

# Exécute l'analyse architecturale rapide (version simplifiée pour le pre-commit)
npx ts-node src/scripts/quick-architecture-check.ts
RESULT=$?

# Restauration des fichiers stashés
git stash pop -q

# Si l'analyse échoue, on arrête le commit
if [ $RESULT -ne 0 ]; then
  echo "❌ L'analyse d'architecture a échoué. Le commit est annulé."
  echo "📝 Consultez le rapport d'analyse pour plus de détails."
  exit 1
fi

echo "✅ L'analyse d'architecture a réussi."
exit 0
`;

/**
 * Vérifie si Git est initialisé dans le projet
 */
function checkGitInitialized(): boolean {
  if (!fs.existsSync(GIT_DIR)) {
    console.error(chalk.red('Erreur: Ce projet n\'utilise pas Git.'));
    console.error(chalk.yellow('Initialisez Git avec "git init" avant d\'installer le hook pre-commit.'));
    return false;
  }
  return true;
}

/**
 * Crée le répertoire des hooks Git s'il n'existe pas
 */
function ensureHooksDirectory(): void {
  if (!fs.existsSync(HOOKS_DIR)) {
    console.log(chalk.blue('Création du répertoire hooks...'));
    fs.mkdirSync(HOOKS_DIR, { recursive: true });
  }
}

/**
 * Installe le hook pre-commit
 */
function installPreCommitHook(): void {
  console.log(chalk.blue('Installation du hook pre-commit...'));
  
  // Écrire le fichier de hook
  fs.writeFileSync(PRE_COMMIT_PATH, PRE_COMMIT_CONTENT);
  
  // Rendre le hook exécutable
  fs.chmodSync(PRE_COMMIT_PATH, '755');
  
  console.log(chalk.green('✓ Hook pre-commit installé avec succès'));
}

/**
 * Point d'entrée principal
 */
function main(): void {
  console.log(chalk.bold('Configuration du hook pre-commit pour l\'analyse d\'architecture'));
  console.log(chalk.gray('============================================================='));
  
  if (!checkGitInitialized()) {
    process.exit(1);
  }
  
  ensureHooksDirectory();
  installPreCommitHook();
  
  // Créer le script d'analyse rapide s'il n'existe pas
  const quickCheckPath = path.join(__dirname, 'quick-architecture-check.ts');
  if (!fs.existsSync(quickCheckPath)) {
    console.log(chalk.blue('Création du script d\'analyse rapide...'));
    
    // Ce script sera implémenté séparément
    console.log(chalk.yellow('Note: Assurez-vous de créer le script quick-architecture-check.ts'));
  }
  
  console.log(chalk.green('\nConfiguration terminée!'));
  console.log('Le hook pre-commit exécutera automatiquement l\'analyse d\'architecture avant chaque commit.');
}

main();
