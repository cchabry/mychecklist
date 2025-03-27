#!/usr/bin/env node;
/**
 * Script de génération du tableau de bord de métriques architecturales
 * 
 * Ce script génère un tableau de bord HTML à partir des métriques
 * architecturales générées par le script architecture-metrics.ts.
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

// Chemins principaux
const ROOT_DIR = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(ROOT_DIR, '..', 'reports');
const METRICS_FILE = path.join(REPORTS_DIR, 'architecture-metrics.json');
const OUTPUT_FILE = path.join(REPORTS_DIR, 'architecture-dashboard.html');

// Interface pour les métriques
interface ArchitectureMetrics {
  timestamp: string;
  summary: {
    featuresTotal: number;
    featuresCompliant: number;
    complianceRate: number;
    issuesTotal: number;
    filesByCategory: Record<string, number>;
  };
  domainDetails: {
    features: FeatureMetric[];
    services: ServiceMetric[];
    hooks: HookMetric[];
    components: ComponentMetric[];
  };
  issues: IssueMetric[];
}

interface FeatureMetric {
  name: string;
  compliant: boolean;
  missingFiles: string[];
  missingExports: string[];
}

interface ServiceMetric {
  name: string;
  hasClearInterface: boolean;
  hasTypeDefs: boolean;
}

interface HookMetric {
  name: string;
  compliant: boolean;
  issues: string[];
}

interface ComponentMetric {
  name: string;
  hasPropsType: boolean;
  isExported: boolean;
}

interface IssueMetric {
  domain: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

/**
 * Crée une partie du tableau de bord
 */
function createDashboardSection(title: string, content: string): string {
  return `
    <div class="card">
      <div class="card-header">
        <h2>${title}</h2>
      </div>
      <div class="card-body">
        ${content}
      </div>
    </div>
  `;
}

/**
 * Crée une jauge pour visualiser un pourcentage
 */
function createGauge(value: number, label: string): string {
  // Détermination de la couleur selon la valeur
  let color = 'red';
  if (value >= 80) color = 'green';
  else if (value >= 50) color = 'orange';
  
  return `
    <div class="gauge-container">
      <div class="gauge">
        <div class="gauge-value" style="width: ${value}%; background-color: ${color};"></div>
      </div>
      <div class="gauge-label">${label}: ${value}%</div>
    </div>
  `;
}

/**
 * Crée un tableau HTML
 */
function createTable(headers: string[], rows: string[][]): string {
  const headerRow = headers.map(header => `<th>${header}</th>`).join('');
  const tableRows = rows.map(row => {
    const cells = row.map(cell => `<td>${cell}</td>`).join('');
    return `<tr>${cells}</tr>`;
  }).join('');
  
  return `
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>${headerRow}</tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Crée un graphique à barres pour les catégories de fichiers
 */
function createBarChart(data: Record<string, number>): string {
  // Calculer le total pour la normalisation
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);
  
  // Créer les barres
  const bars = Object.entries(data).map(([category, count]) => {
    const percentage = Math.round((count / total) * 100);
    return `
      <div class="bar-container">
        <div class="bar-label">${category}</div>
        <div class="bar">
          <div class="bar-value" style="width: ${percentage}%"></div>
        </div>
        <div class="bar-count">${count} (${percentage}%)</div>
      </div>
    `;
  }).join('');
  
  return `
    <div class="bar-chart">
      ${bars}
    </div>
  `;
}

/**
 * Crée un résumé des problèmes par sévérité
 */
function createIssuesSummary(issues: IssueMetric[]): string {
  const severityCounts = {
    high: issues.filter(issue => issue.severity === 'high').length,
    medium: issues.filter(issue => issue.severity === 'medium').length,
    low: issues.filter(issue => issue.severity === 'low').length
  };
  
  return `
    <div class="issues-summary">
      <div class="severity high">
        <span class="severity-count">${severityCounts.high}</span>
        <span class="severity-label">Sévérité haute</span>
      </div>
      <div class="severity medium">
        <span class="severity-count">${severityCounts.medium}</span>
        <span class="severity-label">Sévérité moyenne</span>
      </div>
      <div class="severity low">
        <span class="severity-count">${severityCounts.low}</span>
        <span class="severity-label">Sévérité basse</span>
      </div>
    </div>
  `;
}

/**
 * Génère le contenu HTML du tableau de bord
 */
function generateDashboardContent(metrics: ArchitectureMetrics): string {
  // Section résumé
  const summaryContent = `
    ${createGauge(metrics.summary.complianceRate, 'Taux de conformité')}
    <div class="summary-stats">
      <div class="stat-item">
        <span class="stat-value">${metrics.summary.featuresTotal}</span>
        <span class="stat-label">Total features</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${metrics.summary.featuresCompliant}</span>
        <span class="stat-label">Features conformes</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${metrics.summary.issuesTotal}</span>
        <span class="stat-label">Problèmes détectés</span>
      </div>
    </div>
  `;
  
  // Section répartition des fichiers
  const filesDistributionContent = createBarChart(metrics.summary.filesByCategory);
  
  // Section features
  const featureRows = metrics.domainDetails.features.map(feature => [
    feature.name,
    feature.compliant ? '✅' : '❌',
    feature.missingFiles.length.toString(),
    feature.missingExports.length.toString()
  ]);
  
  const featuresContent = createTable(
    ['Feature', 'Conforme', 'Fichiers manquants', 'Exports manquants'],
    featureRows
  );
  
  // Section problèmes
  const issuesSummaryContent = createIssuesSummary(metrics.issues);
  const issuesRows = metrics.issues.map(issue => [
    issue.domain,
    issue.category,
    `<span class="severity-badge ${issue.severity}">${issue.severity}</span>`,
    issue.description
  ]);
  
  const issuesContent = `
    ${issuesSummaryContent}
    ${createTable(
      ['Domaine', 'Catégorie', 'Sévérité', 'Description'],
      issuesRows
    )}
  `;
  
  // Génération du contenu complet
  return `
    <div class="dashboard">
      <header>
        <h1>Tableau de bord de conformité architecturale</h1>
        <p class="timestamp">Généré le ${new Date(metrics.timestamp).toLocaleString()}</p>
      </header>
      
      <div class="dashboard-grid">
        ${createDashboardSection('Résumé', summaryContent)}
        ${createDashboardSection('Répartition des fichiers', filesDistributionContent)}
        ${createDashboardSection('État des features', featuresContent)}
        ${createDashboardSection('Problèmes détectés', issuesContent)}
      </div>
    </div>
  `;
}

/**
 * Génère les styles CSS pour le tableau de bord
 */
function generateDashboardStyles(): string {
  return `
    <style>
      :root {
        --primary-color: #4361ee;
        --success-color: #4caf50;
        --warning-color: #ff9800;
        --danger-color: #f44336;
        --info-color: #2196f3;
        --dark-color: #333;
        --light-color: #f8f9fa;
        --border-color: #ddd;
      }
      
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f5f7ff;
        margin: 0;
        padding: 20px;
      }
      
      .dashboard {
        max-width: 1200px;
        margin: 0 auto;
      }
      
      header {
        text-align: center;
        margin-bottom: 40px;
      }
      
      h1 {
        color: var(--primary-color);
        margin-bottom: 10px;
      }
      
      .timestamp {
        color: #666;
        font-style: italic;
      }
      
      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
        gap: 20px;
      }
      
      .card {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        margin-bottom: 20px;
      }
      
      .card-header {
        background-color: var(--primary-color);
        color: white;
        padding: 15px 20px;
      }
      
      .card-header h2 {
        margin: 0;
        font-size: 18px;
      }
      
      .card-body {
        padding: 20px;
      }
      
      /* Gauge styles */
      .gauge-container {
        margin-bottom: 20px;
      }
      
      .gauge {
        height: 24px;
        background-color: #eee;
        border-radius: 12px;
        overflow: hidden;
        margin-bottom: 5px;
      }
      
      .gauge-value {
        height: 100%;
        border-radius: 12px;
      }
      
      .gauge-label {
        font-weight: bold;
        text-align: center;
      }
      
      /* Summary stats */
      .summary-stats {
        display: flex;
        justify-content: space-around;
        text-align: center;
        margin-top: 20px;
      }
      
      .stat-item {
        display: flex;
        flex-direction: column;
      }
      
      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: var(--primary-color);
      }
      
      .stat-label {
        font-size: 14px;
        color: #666;
      }
      
      /* Bar chart */
      .bar-chart {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      
      .bar-container {
        display: grid;
        grid-template-columns: 120px 1fr 80px;
        align-items: center;
        gap: 10px;
      }
      
      .bar-label {
        font-weight: bold;
        text-align: right;
      }
      
      .bar {
        height: 20px;
        background-color: #eee;
        border-radius: 10px;
        overflow: hidden;
      }
      
      .bar-value {
        height: 100%;
        background-color: var(--primary-color);
        border-radius: 10px;
      }
      
      .bar-count {
        font-size: 14px;
        color: #666;
      }
      
      /* Table styles */
      .table-responsive {
        overflow-x: auto;
      }
      
      .table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .table th, .table td {
        padding: 12px 15px;
        border-bottom: 1px solid var(--border-color);
        text-align: left;
      }
      
      .table th {
        background-color: #f5f7ff;
        font-weight: bold;
      }
      
      .table tr:hover {
        background-color: #f5f7ff;
      }
      
      /* Issues summary */
      .issues-summary {
        display: flex;
        justify-content: space-around;
        margin-bottom: 20px;
      }
      
      .severity {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 10px;
        border-radius: 4px;
      }
      
      .severity.high {
        background-color: #ffebee;
      }
      
      .severity.medium {
        background-color: #fff8e1;
      }
      
      .severity.low {
        background-color: #e8f5e9;
      }
      
      .severity-count {
        font-size: 24px;
        font-weight: bold;
      }
      
      .severity.high .severity-count {
        color: var(--danger-color);
      }
      
      .severity.medium .severity-count {
        color: var(--warning-color);
      }
      
      .severity.low .severity-count {
        color: var(--success-color);
      }
      
      .severity-badge {
        padding: 3px 6px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        color: white;
      }
      
      .severity-badge.high {
        background-color: var(--danger-color);
      }
      
      .severity-badge.medium {
        background-color: var(--warning-color);
      }
      
      .severity-badge.low {
        background-color: var(--success-color);
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .dashboard-grid {
          grid-template-columns: 1fr;
        }
        
        .bar-container {
          grid-template-columns: 80px 1fr 60px;
        }
      }
    </style>
  `;
}

/**
 * Génère le document HTML complet
 */
function generateHtmlDocument(metrics: ArchitectureMetrics): string {
  const styles = generateDashboardStyles();
  const content = generateDashboardContent(metrics);
  
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tableau de bord de conformité architecturale</title>
      ${styles}
    </head>
    <body>
      ${content}
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

