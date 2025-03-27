#!/usr/bin/env node;
/**
 * Script de génération du tableau de bord de métriques architecturales
 * 
 * Ce script génère un tableau de bord HTML interactif à partir des métriques
 * architecturales générées par le script architecture-metrics.ts.
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { getArchitectureTrends, getMetricsVariations } from '../utils/tracking/architecture-tracker';
import { 
  createSummarySection, 
  createTrendsSection, 
  createFilesDistributionSection, 
  createFeaturesSection, 
  createIssuesSection, 
  createInteractivityScripts, 
  generateDashboardStyles, 
  createFilterScripts,
  ArchitectureMetrics
} from '../utils/dashboard';

// Chemins principaux
const ROOT_DIR = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(ROOT_DIR, '..', 'reports');
const METRICS_FILE = path.join(REPORTS_DIR, 'architecture-metrics.json');
const OUTPUT_FILE = path.join(REPORTS_DIR, 'architecture-dashboard.html');

/**
 * Génère le contenu HTML du tableau de bord
 */
function generateDashboardContent(metrics: ArchitectureMetrics): string {
  // Récupérer les données de tendance et les variations
  const trends = getArchitectureTrends();
  const variations = getMetricsVariations();
  
  // Générer les différentes sections
  const summarySection = createSummarySection(metrics);
  const trendsSection = createTrendsSection(trends, variations);
  const filesDistributionSection = createFilesDistributionSection(metrics.summary.filesByCategory);
  const featuresSection = createFeaturesSection(metrics.domainDetails.features);
  const issuesSection = createIssuesSection(metrics.issues);
  
  // Générer le contenu complet
  return `
    <div class="dashboard">
      <header>
        <h1>Tableau de bord de conformité architecturale</h1>
        <p class="timestamp">Généré le ${new Date(metrics.timestamp).toLocaleString()}</p>
      </header>
      
      <div class="dashboard-grid">
        ${summarySection}
        ${trendsSection}
        ${filesDistributionSection}
        ${featuresSection}
        ${issuesSection}
      </div>
    </div>
  `;
}

/**
 * Génère le document HTML complet
 */
function generateHtmlDocument(metrics: ArchitectureMetrics): string {
  const styles = generateDashboardStyles();
  const content = generateDashboardContent(metrics);
  const filterScripts = createFilterScripts();
  const interactivityScripts = createInteractivityScripts();
  
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tableau de bord de conformité architecturale</title>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      ${styles}
    </head>
    <body>
      ${content}
      ${filterScripts}
      ${interactivityScripts}
    </body>
    </html>
  `;
}

/**
 * Point d'entrée principal
 */
function main() {
  console.log(chalk.bold('Génération du tableau de bord d\'architecture'));
  console.log(chalk.gray('=========================================='));
  
  // Vérifier si le fichier de métriques existe
  if (!fs.existsSync(METRICS_FILE)) {
    console.error(chalk.red(`Erreur: Le fichier de métriques ${METRICS_FILE} n'existe pas.`));
    console.log(chalk.yellow('Exécutez d\'abord "npm run architecture:metrics" pour générer les métriques.'));
    process.exit(1);
  }
  
  try {
    // Lire les métriques
    const metricsData = fs.readFileSync(METRICS_FILE, 'utf8');
    const metrics: ArchitectureMetrics = JSON.parse(metricsData);
    
    // Créer le répertoire de sortie s'il n'existe pas
    if (!fs.existsSync(REPORTS_DIR)) {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
    }
    
    // Générer le tableau de bord
    const dashboardHtml = generateHtmlDocument(metrics);
    fs.writeFileSync(OUTPUT_FILE, dashboardHtml);
    
    console.log(chalk.green(`\nTableau de bord généré avec succès dans ${OUTPUT_FILE}`));
    console.log(`Ouvrez ce fichier dans un navigateur pour visualiser le tableau de bord.`);
  } catch (error) {
    console.error(chalk.red('Erreur lors de la génération du tableau de bord:'));
    console.error(error);
    process.exit(1);
  }
}

main();
