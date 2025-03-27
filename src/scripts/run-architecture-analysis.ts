
#!/usr/bin/env node
/**
 * Script d'exécution de l'analyse architecturale complète
 * 
 * Ce script exécute l'analyse architecturale et génère tous les rapports associés.
 * Il est conçu pour être utilisé dans un environnement CI/CD.
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';

// Chemins principaux
const ROOT_DIR = path.resolve(__dirname, '../..');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports');

/**
 * Crée le répertoire des rapports s'il n'existe pas
 */
function ensureReportsDirectory() {
  if (!fs.existsSync(REPORTS_DIR)) {
    console.log(chalk.blue('Création du répertoire des rapports...'));
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
}

/**
 * Exécute une commande et affiche le résultat
 */
function runCommand(command: string, description: string): boolean {
  console.log(chalk.blue(`\n${description}...`));
  try {
    execSync(command, { stdio: 'inherit', cwd: ROOT_DIR });
    console.log(chalk.green(`✓ ${description} terminé avec succès`));
    return true;
  } catch (error) {
    console.error(chalk.red(`✗ Échec lors de l'exécution de: ${description}`));
    console.error(chalk.red((error as Error).message));
    return false;
  }
}

/**
 * Génère un fichier de rapport de statut pour le CI/CD
 */
function generateStatusReport(success: boolean) {
  const timestamp = new Date().toISOString();
  const statusData = {
    timestamp,
    success,
    reportUrl: success ? './architecture-dashboard.html' : null,
    metricsUrl: success ? './architecture-metrics.json' : null
  };
  
  fs.writeFileSync(
    path.join(REPORTS_DIR, 'analysis-status.json'),
    JSON.stringify(statusData, null, 2)
  );
  
  console.log(chalk.blue(`Rapport de statut généré: ${path.join(REPORTS_DIR, 'analysis-status.json')}`));
}

/**
 * Point d'entrée principal
 */
function main() {
  console.log(chalk.bold('Exécution de l\'analyse architecturale complète'));
  console.log(chalk.gray('=========================================='));
  
  ensureReportsDirectory();
  
  // Exécuter l'analyse d'architecture
  const analyzeSuccess = runCommand(
    'npx ts-node src/scripts/architecture-metrics.ts',
    'Génération des métriques d\'architecture'
  );
  
  if (!analyzeSuccess) {
    console.error(chalk.red('Échec de l\'analyse d\'architecture, impossible de continuer'));
    generateStatusReport(false);
    process.exit(1);
  }
  
  // Générer le tableau de bord
  const dashboardSuccess = runCommand(
    'npx ts-node src/scripts/generate-metrics-dashboard.ts',
    'Génération du tableau de bord'
  );
  
  if (!dashboardSuccess) {
    console.error(chalk.red('Échec de la génération du tableau de bord'));
    generateStatusReport(false);
    process.exit(1);
  }
  
  // Générer le rapport de statut final
  generateStatusReport(true);
  
  console.log(chalk.green('\nAnalyse architecturale complète terminée avec succès!'));
  console.log(chalk.white(`Rapports disponibles dans: ${REPORTS_DIR}`));
}

main();
