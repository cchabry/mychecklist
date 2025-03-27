
/**
 * Utilitaires pour générer le contenu du tableau de bord
 */

import { createInteractiveBarChart, createInteractiveTrendChart } from './charts';
import { createCategoryFilters, createFilterControls, createFilterScripts, createSeverityFilters } from './filters';

export interface IssueMetric {
  domain: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface ArchitectureMetrics {
  timestamp: string;
  summary: {
    featuresTotal: number;
    featuresCompliant: number;
    complianceRate: number;
    issuesTotal: number;
    filesByCategory: Record<string, number>;
  };
  domainDetails: {
    features: any[];
    services: any[];
    hooks: any[];
    components: any[];
  };
  issues: IssueMetric[];
}

/**
 * Crée une section du tableau de bord
 */
export function createDashboardSection(title: string, content: string, id: string, collapsible: boolean = true): string {
  const toggleButton = collapsible 
    ? `<button class="toggle-button" data-target="${id}"><span class="toggle-icon"></span></button>` 
    : '';
  
  return `
    <div id="${id}" class="card">
      <div class="card-header">
        <h2>${title}</h2>
        ${toggleButton}
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
export function createGauge(value: number, label: string): string {
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
export function createTable(headers: string[], rows: string[][], id: string): string {
  const headerRow = headers.map((header, index) => 
    `<th data-sort-col="${index}">${header}</th>`
  ).join('');
  
  const tableRows = rows.map(row => {
    const cells = row.map(cell => `<td>${cell}</td>`).join('');
    return `<tr>${cells}</tr>`;
  }).join('');
  
  return `
    <div class="table-responsive">
      <table id="${id}" class="table issues-table">
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
 * Crée un résumé des problèmes par sévérité
 */
export function createIssuesSummary(issues: IssueMetric[]): string {
  const severityCounts = {
    high: issues.filter(issue => issue.severity === 'high').length,
    medium: issues.filter(issue => issue.severity === 'medium').length,
    low: issues.filter(issue => issue.severity === 'low').length
  };
  
  return `
    <div class="issues-summary">
      <div class="severity high" data-severity="high">
        <span class="severity-count">${severityCounts.high}</span>
        <span class="severity-label">Sévérité haute</span>
      </div>
      <div class="severity medium" data-severity="medium">
        <span class="severity-count">${severityCounts.medium}</span>
        <span class="severity-label">Sévérité moyenne</span>
      </div>
      <div class="severity low" data-severity="low">
        <span class="severity-count">${severityCounts.low}</span>
        <span class="severity-label">Sévérité basse</span>
      </div>
    </div>
  `;
}

/**
 * Crée une carte de variation des métriques
 */
export function createVariationCard(variations: any): string {
  const getVariationClass = (value: number) => {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  };
  
  const getVariationIndicator = (value: number) => {
    if (value > 0) return '↑';
    if (value < 0) return '↓';
    return '→';
  };
  
  return `
    <div class="variations-container">
      <div class="variation-card ${getVariationClass(variations.complianceChange)}">
        <div class="variation-title">Conformité</div>
        <div class="variation-value">
          ${getVariationIndicator(variations.complianceChange)} 
          ${Math.abs(variations.complianceChange).toFixed(2)}%
        </div>
      </div>
      
      <div class="variation-card ${getVariationClass(-variations.issuesChange)}">
        <div class="variation-title">Problèmes</div>
        <div class="variation-value">
          ${getVariationIndicator(-variations.issuesChange)} 
          ${Math.abs(variations.issuesChange)}
        </div>
      </div>
      
      <div class="variation-card ${getVariationClass(variations.featuresChange)}">
        <div class="variation-title">Features</div>
        <div class="variation-value">
          ${getVariationIndicator(variations.featuresChange)} 
          ${Math.abs(variations.featuresChange)}
        </div>
      </div>
    </div>
  `;
}

/**
 * Crée la section de résumé
 */
export function createSummarySection(metrics: ArchitectureMetrics): string {
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
  
  return createDashboardSection('Résumé', summaryContent, 'summary-section', false);
}

/**
 * Crée la section de tendances
 */
export function createTrendsSection(trends: any, variations: any): string {
  const trendsContent = `
    ${createInteractiveTrendChart(trends)}
    <div class="variations-section">
      <h3>Variations depuis la dernière analyse</h3>
      ${createVariationCard(variations)}
    </div>
  `;
  
  return createDashboardSection('Tendances', trendsContent, 'trends-section');
}

/**
 * Crée la section de répartition des fichiers
 */
export function createFilesDistributionSection(filesByCategory: Record<string, number>): string {
  return createDashboardSection(
    'Répartition des fichiers', 
    createInteractiveBarChart(filesByCategory), 
    'files-distribution-section'
  );
}

/**
 * Crée la section des features
 */
export function createFeaturesSection(features: any[]): string {
  const featureRows = features.map(feature => [
    feature.name,
    feature.compliant ? '✅' : '❌',
    feature.missingFiles.length.toString(),
    feature.missingExports.length.toString()
  ]);
  
  const featuresContent = createTable(
    ['Feature', 'Conforme', 'Fichiers manquants', 'Exports manquants'],
    featureRows,
    'features-table'
  );
  
  return createDashboardSection('État des features', featuresContent, 'features-section');
}

/**
 * Crée la section des problèmes
 */
export function createIssuesSection(issues: IssueMetric[]): string {
  // Extraire toutes les catégories uniques
  const categories = [...new Set(issues.map(issue => issue.category))];
  
  const issuesRows = issues.map(issue => [
    issue.domain,
    issue.category,
    `<span class="severity-badge ${issue.severity}">${issue.severity}</span>`,
    issue.description
  ]);
  
  const filterSection = `
    <div class="filter-section">
      <h3 class="filter-title">Filtres</h3>
      <div class="filter-groups">
        ${createSeverityFilters()}
        ${createCategoryFilters(categories)}
        ${createFilterControls()}
      </div>
      <div id="visible-issues-count" class="issues-count">
        ${issues.length} problèmes affichés
      </div>
    </div>
  `;
  
  const issuesContent = `
    ${createIssuesSummary(issues)}
    ${filterSection}
    ${createTable(
      ['Domaine', 'Catégorie', 'Sévérité', 'Description'],
      issuesRows,
      'issues-table'
    )}
  `;
  
  return createDashboardSection('Problèmes détectés', issuesContent, 'issues-section');
}

/**
 * Script JavaScript pour gérer les actions côté client
 */
export function createInteractivityScripts(): string {
  return `
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        // ====== Gestion des cartes repliables ======
        document.querySelectorAll('.toggle-button').forEach(button => {
          button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const card = document.getElementById(targetId);
            card.classList.toggle('card-collapsed');
          });
        });
        
        // ====== Gestion du tri des tableaux ======
        document.querySelectorAll('th[data-sort-col]').forEach(header => {
          header.addEventListener('click', function() {
            const columnIndex = parseInt(this.getAttribute('data-sort-col') || '0');
            const tableId = this.closest('table').id;
            const tbody = document.querySelector(\`#\${tableId} tbody\`);
            const rows = Array.from(tbody.querySelectorAll('tr'));
            
            // Déterminer la direction du tri
            const currentDirection = this.classList.contains('sort-asc') ? 'desc' : 'asc';
            
            // Réinitialiser tous les en-têtes
            document.querySelectorAll(\`#\${tableId} th\`).forEach(th => {
              th.classList.remove('sort-asc', 'sort-desc');
            });
            
            // Appliquer la classe de tri à l'en-tête actuel
            this.classList.add(\`sort-\${currentDirection}\`);
            
            // Trier les lignes
            rows.sort((a, b) => {
              const aValue = a.querySelectorAll('td')[columnIndex].textContent.trim();
              const bValue = b.querySelectorAll('td')[columnIndex].textContent.trim();
              
              // Essayer de convertir en nombre si possible
              const aNum = parseFloat(aValue);
              const bNum = parseFloat(bValue);
              
              if (!isNaN(aNum) && !isNaN(bNum)) {
                return currentDirection === 'asc' ? aNum - bNum : bNum - aNum;
              }
              
              // Sinon, comparer en tant que chaînes
              if (currentDirection === 'asc') {
                return aValue.localeCompare(bValue);
              } else {
                return bValue.localeCompare(aValue);
              }
            });
            
            // Réorganiser les lignes dans le tableau
            rows.forEach(row => {
              tbody.appendChild(row);
            });
          });
        });
        
        // ====== Filtrage rapide par sévérité via le résumé ======
        document.querySelectorAll('.severity[data-severity]').forEach(severityBox => {
          severityBox.addEventListener('click', function() {
            const severity = this.getAttribute('data-severity');
            
            // Cocher uniquement cette sévérité
            document.querySelectorAll('.severity-filter').forEach(checkbox => {
              checkbox.checked = checkbox.value === severity;
            });
            
            // Déclencher l'événement de changement pour appliquer les filtres
            document.querySelector('.severity-filter').dispatchEvent(new Event('change'));
          });
        });
      });
    </script>
  `;
}
