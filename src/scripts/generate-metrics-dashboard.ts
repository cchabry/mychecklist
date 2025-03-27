
#!/usr/bin/env node

/**
* Script de génération du tableau de bord de métriques d'architecture
* 
* Ce script génère un tableau de bord HTML interactif à partir des
* métriques d'architecture collectées par les scripts d'analyse.
*/
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ArchitectureMetrics } from '../utils/dashboard';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemins des fichiers
const METRICS_PATH = path.join(__dirname, '..', 'reports', 'architecture-metrics.json');
const DASHBOARD_PATH = path.join(__dirname, '..', 'reports', 'architecture-dashboard.html');

/**
 * Génère le tableau de bord des métriques d'architecture
 */
export async function generateDashboard(): Promise<void> {
  console.log('Génération du tableau de bord des métriques d\'architecture...');
  
  // Vérifier que le dossier reports existe
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Vérifier que le fichier de métriques existe
  if (!fs.existsSync(METRICS_PATH)) {
    console.error('Fichier de métriques non trouvé. Exécutez d\'abord l\'analyse d\'architecture.');
    process.exit(1);
  }
  
  // Lire les métriques
  const metricsData = fs.readFileSync(METRICS_PATH, 'utf8');
  const metrics = JSON.parse(metricsData) as ArchitectureMetrics;
  
  // Générer le HTML du tableau de bord
  const dashboardHtml = generateDashboardHtml(metrics);
  
  // Écrire le fichier HTML
  fs.writeFileSync(DASHBOARD_PATH, dashboardHtml);
  
  console.log(`Tableau de bord généré avec succès: ${DASHBOARD_PATH}`);
}

/**
 * Génère le HTML du tableau de bord
 */
function generateDashboardHtml(metrics: ArchitectureMetrics): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tableau de bord d'architecture</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .dashboard-header {
      background-color: #f5f5f5;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .metrics-section {
      margin-bottom: 30px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }
    .metric-card {
      background-color: #fff;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .metric-card h3 {
      margin-top: 0;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    .compliance-bar {
      height: 20px;
      background-color: #e9ecef;
      border-radius: 5px;
      margin: 10px 0;
      overflow: hidden;
    }
    .compliance-bar .fill {
      height: 100%;
      background-color: #28a745;
    }
    .low-compliance {
      background-color: #dc3545;
    }
    .med-compliance {
      background-color: #ffc107;
    }
    .high-compliance {
      background-color: #28a745;
    }
    .issues-list {
      max-height: 300px;
      overflow-y: auto;
      background-color: #f8f9fa;
      padding: 10px;
      border-radius: 5px;
    }
    .issue-item {
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid #eee;
    }
    .severity-critical {
      color: #dc3545;
      font-weight: bold;
    }
    .severity-high {
      color: #fd7e14;
    }
    .severity-medium {
      color: #ffc107;
    }
    .severity-low {
      color: #20c997;
    }
  </style>
</head>
<body>
  <div class="dashboard-header">
    <h1>Tableau de bord d'architecture</h1>
    <p>Dernière analyse: ${new Date(metrics.timestamp).toLocaleString()}</p>
  </div>
  
  <div class="metrics-section">
    <h2>Résumé de conformité</h2>
    <div class="metrics-grid">
      <div class="metric-card">
        <h3>Taux de conformité</h3>
        <div class="compliance-bar">
          <div class="fill ${getComplianceClass(metrics.summary.complianceRate)}" style="width: ${metrics.summary.complianceRate}%"></div>
        </div>
        <p>${metrics.summary.complianceRate}% (${metrics.summary.featuresCompliant}/${metrics.summary.featuresTotal} features)</p>
      </div>
      <div class="metric-card">
        <h3>Problèmes par sévérité</h3>
        <ul>
          ${Object.entries(metrics.summary.issuesBySeverity).map(([severity, count]) => `
            <li><span class="severity-${severity.toLowerCase()}">${severity}</span>: ${count}</li>
          `).join('')}
        </ul>
      </div>
      <div class="metric-card">
        <h3>Fichiers par catégorie</h3>
        <ul>
          ${Object.entries(metrics.summary.filesByCategory).map(([category, count]) => `
            <li>${category}: ${count}</li>
          `).join('')}
        </ul>
      </div>
    </div>
  </div>
  
  <div class="metrics-section">
    <h2>Problèmes identifiés</h2>
    <div class="issues-list">
      ${metrics.issues.map(issue => `
        <div class="issue-item">
          <span class="severity-${issue.severity}">[${issue.severity}]</span>
          <strong>${issue.domain}/${issue.category}:</strong> ${issue.description}
        </div>
      `).join('')}
    </div>
  </div>
  
  <div class="metrics-section">
    <h2>Anti-patterns détectés</h2>
    <div class="issues-list">
      ${metrics.antiPatterns.detectedPatterns.map(pattern => `
        <div class="issue-item">
          <strong>${pattern.ruleName}</strong> (${pattern.severity}): 
          ${pattern.occurrences} occurrences
          <div>Fichiers affectés: ${pattern.affectedFiles.join(', ')}</div>
        </div>
      `).join('')}
    </div>
  </div>
  
  <script>
    // JavaScript pour interactivité future
    document.addEventListener('DOMContentLoaded', function() {
      console.log('Tableau de bord chargé');
    });
  </script>
</body>
</html>`;
}

/**
 * Détermine la classe CSS selon le taux de conformité
 */
function getComplianceClass(rate: number): string {
  if (rate < 50) return 'low-compliance';
  if (rate < 80) return 'med-compliance';
  return 'high-compliance';
}

// Exécuter le script si appelé directement
if (require.main === module) {
  generateDashboard().catch(console.error);
}
