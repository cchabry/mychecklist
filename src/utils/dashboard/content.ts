/**
 * Générateurs de contenu pour le tableau de bord
 * 
 * Ce module contient les fonctions pour générer les différentes sections
 * du tableau de bord des métriques d'architecture.
 */
import { 
  ArchitectureMetrics, 
  DetectedAntiPattern, 
  ThresholdViolation 
} from './index';

/**
 * Crée la section de résumé
 */
export function createSummarySection(metrics: ArchitectureMetrics): string {
  const issueBySeverityHtml = Object.entries(metrics.summary.issuesBySeverity || {})
    .map(([severity, count]) => {
      const colorClass = severity === 'critical' ? 'text-red-600' : 
                        severity === 'high' ? 'text-orange-500' :
                        severity === 'medium' ? 'text-yellow-500' : 'text-blue-400';
      return `<span class="${colorClass}">${severity}: ${count}</span>`;
    })
    .join(' | ');

  return `
    <section class="summary-section dashboard-card">
      <h2>Résumé de la conformité</h2>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-value ${metrics.summary.complianceRate < 70 ? 'text-red-500' : metrics.summary.complianceRate < 90 ? 'text-yellow-500' : 'text-green-500'}">${metrics.summary.complianceRate}%</div>
          <div class="metric-label">Conformité architecturale</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${metrics.summary.featuresCompliant}/${metrics.summary.featuresTotal}</div>
          <div class="metric-label">Features conformes</div>
        </div>
        <div class="metric-card">
          <div class="metric-value ${metrics.summary.issuesTotal > 10 ? 'text-red-500' : metrics.summary.issuesTotal > 5 ? 'text-yellow-500' : 'text-green-500'}">${metrics.summary.issuesTotal}</div>
          <div class="metric-label">Problèmes détectés</div>
          <div class="metric-details">${issueBySeverityHtml}</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${metrics.antiPatterns.detectedPatterns.length}</div>
          <div class="metric-label">Anti-patterns détectés</div>
        </div>
      </div>
    </section>
  `;
}

/**
 * Crée la section des tendances
 */
export function createTrendsSection(trends: any, variations: any): string {
  const complianceChangeClass = variations.complianceChange >= 0 ? 'text-green-500' : 'text-red-500';
  const issuesChangeClass = variations.issuesChange <= 0 ? 'text-green-500' : 'text-red-500';
  const featuresChangeClass = variations.featuresChange >= 0 ? 'text-green-500' : 'text-red-500';
  
  const complianceChange = variations.complianceChange >= 0 ? `+${variations.complianceChange}` : variations.complianceChange;
  const issuesChange = variations.issuesChange <= 0 ? `${variations.issuesChange}` : `+${variations.issuesChange}`;
  const featuresChange = variations.featuresChange >= 0 ? `+${variations.featuresChange}` : variations.featuresChange;
  
  return `
    <section class="trends-section dashboard-card" id="trendsSection">
      <h2>Tendances</h2>
      <div class="trends-controls">
        <select id="trendPeriod" class="trend-select">
          <option value="7">7 jours</option>
          <option value="14">14 jours</option>
          <option value="30" selected>30 jours</option>
        </select>
      </div>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-value">
            <span class="${complianceChangeClass}">${complianceChange}%</span>
          </div>
          <div class="metric-label">Évolution conformité</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">
            <span class="${issuesChangeClass}">${issuesChange}</span>
          </div>
          <div class="metric-label">Évolution problèmes</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">
            <span class="${featuresChangeClass}">${featuresChange}</span>
          </div>
          <div class="metric-label">Évolution features</div>
        </div>
      </div>
      <div class="chart-container">
        <canvas id="trendsChart"></canvas>
      </div>
    </section>
  `;
}

/**
 * Crée la section de distribution des fichiers
 */
export function createFilesDistributionSection(filesByCategory: Record<string, number>): string {
  const categoriesHtml = Object.entries(filesByCategory)
    .map(([category, count]) => `
      <div class="file-category">
        <div class="category-name">${category}</div>
        <div class="category-count">${count}</div>
        <div class="category-bar-container">
          <div class="category-bar" style="width: ${Math.min(count * 2, 100)}%"></div>
        </div>
      </div>
    `)
    .join('');
  
  return `
    <section class="files-section dashboard-card">
      <h2>Distribution des fichiers</h2>
      <div class="file-distribution">
        ${categoriesHtml}
      </div>
      <div class="chart-container">
        <canvas id="filesDistributionChart"></canvas>
      </div>
    </section>
  `;
}

/**
 * Crée la section des features
 */
export function createFeaturesSection(features: any[]): string {
  const featuresHtml = features
    .map(feature => `
      <tr class="${feature.compliant ? 'compliant-row' : 'non-compliant-row'}">
        <td>${feature.name}</td>
        <td class="text-center">${feature.compliant ? '✅' : '❌'}</td>
        <td class="text-center">${feature.missingFiles.length}</td>
        <td class="text-center">${feature.missingExports.length}</td>
      </tr>
    `)
    .join('');
  
  return `
    <section class="features-section dashboard-card">
      <div class="section-header">
        <h2>Features</h2>
        <div class="section-controls">
          <select id="featureSort" class="sort-select">
            <option value="name">Nom</option>
            <option value="status">Statut</option>
          </select>
          <button id="toggleFeatures" class="toggle-btn">▼</button>
        </div>
      </div>
      <div id="featuresContent" class="section-content">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Conforme</th>
              <th>Fichiers manquants</th>
              <th>Exports manquants</th>
            </tr>
          </thead>
          <tbody>
            ${featuresHtml}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

/**
 * Crée la section des problèmes
 */
export function createIssuesSection(issues: any[]): string {
  const categorizedIssues: Record<string, typeof issues> = {};
  
  issues.forEach(issue => {
    if (!categorizedIssues[issue.category]) {
      categorizedIssues[issue.category] = [];
    }
    categorizedIssues[issue.category].push(issue);
  });
  
  const categoryTabs = Object.keys(categorizedIssues)
    .map((category, index) => `
      <button class="category-tab ${index === 0 ? 'active' : ''}" data-category="${category}">
        ${category} (${categorizedIssues[category].length})
      </button>
    `)
    .join('');
  
  const categoryContents = Object.entries(categorizedIssues)
    .map(([category, categoryIssues], index) => {
      const issuesHtml = categoryIssues
        .map(issue => {
          const severityClass = issue.severity === 'critical' ? 'severity-critical' : 
                               issue.severity === 'high' ? 'severity-high' : 
                               issue.severity === 'medium' ? 'severity-medium' : 
                               'severity-low';
          
          return `
            <tr>
              <td>${issue.domain}</td>
              <td><span class="severity-badge ${severityClass}">${issue.severity}</span></td>
              <td>${issue.description}</td>
            </tr>
          `;
        })
        .join('');
      
      return `
        <div class="category-content ${index === 0 ? 'active' : ''}" id="category-${category}">
          <table class="data-table issues-table">
            <thead>
              <tr>
                <th>Domaine</th>
                <th>Sévérité</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${issuesHtml}
            </tbody>
          </table>
        </div>
      `;
    })
    .join('');
  
  return `
    <section class="issues-section dashboard-card">
      <div class="section-header">
        <h2>Problèmes détectés</h2>
        <div class="issue-filters">
          <select id="severityFilter" class="filter-select">
            <option value="all">Toutes sévérités</option>
            <option value="critical">Critique</option>
            <option value="high">Importante</option>
            <option value="medium">Moyenne</option>
            <option value="low">Faible</option>
          </select>
          <button id="toggleIssues" class="toggle-btn">▼</button>
        </div>
      </div>
      <div id="issuesContent" class="section-content">
        <div class="category-tabs">
          <button class="category-tab active" data-category="all">Tous (${issues.length})</button>
          ${categoryTabs}
        </div>
        <div class="category-contents">
          <div class="category-content active" id="category-all">
            <table class="data-table issues-table">
              <thead>
                <tr>
                  <th>Domaine</th>
                  <th>Sévérité</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody id="issuesTableBody">
                ${issues.map(issue => {
                  const severityClass = issue.severity === 'critical' ? 'severity-critical' : 
                                       issue.severity === 'high' ? 'severity-high' : 
                                       issue.severity === 'medium' ? 'severity-medium' : 
                                       'severity-low';
                  
                  return `
                    <tr data-severity="${issue.severity}" data-category="${issue.category}">
                      <td>${issue.domain}</td>
                      <td><span class="severity-badge ${severityClass}">${issue.severity}</span></td>
                      <td>${issue.description}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
          ${categoryContents}
        </div>
      </div>
    </section>
  `;
}

/**
 * Crée la section des anti-patterns
 */
export function createAntiPatternsSection(detectedPatterns: DetectedAntiPattern[]): string {
  if (detectedPatterns.length === 0) {
    return `
      <section class="anti-patterns-section dashboard-card">
        <h2>Anti-patterns détectés</h2>
        <div class="empty-state">
          <p>Aucun anti-pattern détecté. Bravo! 🎉</p>
        </div>
      </section>
    `;
  }
  
  const patternsHtml = detectedPatterns
    .map(pattern => {
      const severityClass = pattern.severity === 'critical' ? 'severity-critical' : 
                           pattern.severity === 'high' ? 'severity-high' : 
                           pattern.severity === 'medium' ? 'severity-medium' : 
                           'severity-low';
      
      const affectedFilesHtml = pattern.affectedFiles.length > 0
        ? `
          <details>
            <summary>Fichiers affectés (${pattern.affectedFiles.length})</summary>
            <ul class="affected-files-list">
              ${pattern.affectedFiles.slice(0, 5).map(file => `<li>${file}</li>`).join('')}
              ${pattern.affectedFiles.length > 5 ? `<li>et ${pattern.affectedFiles.length - 5} autres...</li>` : ''}
            </ul>
          </details>
        `
        : '';
      
      return `
        <tr>
          <td>${pattern.ruleName}</td>
          <td><span class="severity-badge ${severityClass}">${pattern.severity}</span></td>
          <td>${pattern.occurrences}</td>
          <td>${affectedFilesHtml}</td>
        </tr>
      `;
    })
    .join('');
  
  return `
    <section class="anti-patterns-section dashboard-card">
      <div class="section-header">
        <h2>Anti-patterns détectés</h2>
        <button id="toggleAntiPatterns" class="toggle-btn">▼</button>
      </div>
      <div id="antiPatternsContent" class="section-content">
        <table class="data-table">
          <thead>
            <tr>
              <th>Anti-pattern</th>
              <th>Sévérité</th>
              <th>Occurrences</th>
              <th>Détails</th>
            </tr>
          </thead>
          <tbody>
            ${patternsHtml}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

/**
 * Crée la section des seuils de conformité par domaine
 */
export function createDomainThresholdsSection(violations: ThresholdViolation[]): string {
  const domainSpecificViolations = violations.filter(violation => 
    violation.thresholdId.includes('-') && 
    ['audit', 'project', 'action', 'checklist', 'evaluation', 'notion'].some(
      domain => violation.thresholdId.includes(domain)
    )
  );
  
  if (domainSpecificViolations.length === 0) {
    return '';
  }
  
  let htmlContent = `
    <section class="dashboard-section domain-thresholds-section">
      <h2>Seuils de conformité par domaine</h2>
      <table class="thresholds-table">
        <thead>
          <tr>
            <th>Domaine</th>
            <th>Seuil</th>
            <th>Valeur attendue</th>
            <th>Valeur actuelle</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  domainSpecificViolations.forEach(violation => {
    const domain = violation.thresholdId.split('-')[0];
    const status = violation.actualValue >= violation.expectedValue ? 'success' : 'failure';
    
    htmlContent += `
      <tr class="threshold-${status}">
        <td>${domain}</td>
        <td>${violation.thresholdName}</td>
        <td>${violation.expectedValue}${violation.thresholdId.includes('rate') ? '%' : ''}</td>
        <td>${violation.actualValue}${violation.thresholdId.includes('rate') ? '%' : ''}</td>
        <td class="status-${status}">
          ${status === 'success' ? '✓ Conforme' : '✗ Non conforme'}
        </td>
      </tr>
    `;
  });
  
  htmlContent += `
        </tbody>
      </table>
    </section>
  `;
  
  return htmlContent;
}

/**
 * Crée la section de règles spécifiques au domaine
 */
export function createDomainRulesSection(detectedPatterns: DetectedAntiPattern[]): string {
  const domainSpecificPatterns = detectedPatterns.filter(pattern => 
    pattern.ruleId.includes('-') && 
    ['checklist', 'audit', 'project', 'evaluation', 'action', 'notion', 'samplePage'].some(
      domain => pattern.ruleId.includes(domain)
    )
  );
  
  if (domainSpecificPatterns.length === 0) {
    return '';
  }
  
  // Regrouper par domaine
  const patternsByDomain: Record<string, DetectedAntiPattern[]> = {};
  
  domainSpecificPatterns.forEach(pattern => {
    const domain = pattern.ruleId.split('-')[0];
    if (!patternsByDomain[domain]) {
      patternsByDomain[domain] = [];
    }
    patternsByDomain[domain].push(pattern);
  });
  
  let htmlContent = `
    <section class="dashboard-section domain-rules-section">
      <h2>Règles spécifiques au domaine</h2>
      <div class="domain-rules-container">
  `;
  
  // Créer un onglet pour chaque domaine
  const domainTabs = Object.keys(patternsByDomain).map((domain, index) => 
    `<button class="domain-tab ${index === 0 ? 'active' : ''}" data-domain="${domain}">${domain}</button>`
  ).join('');
  
  htmlContent += `
    <div class="domain-tabs">
      ${domainTabs}
    </div>
  `;
  
  // Créer le contenu pour chaque domaine
  Object.entries(patternsByDomain).forEach(([domain, patterns], index) => {
    htmlContent += `
      <div class="domain-content" id="domain-${domain}" ${index === 0 ? '' : 'style="display:none;"'}>
        <h3>Anti-patterns du domaine ${domain}</h3>
        <table class="patterns-table">
          <thead>
            <tr>
              <th>Règle</th>
              <th>Sévérité</th>
              <th>Occurrences</th>
              <th>Détails</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    patterns.forEach(pattern => {
      htmlContent += `
        <tr class="severity-${pattern.severity}">
          <td>${pattern.ruleName}</td>
          <td>${pattern.severity}</td>
          <td>${pattern.occurrences}</td>
          <td>
            <button class="toggle-affected-files" data-rule="${pattern.ruleId}">
              Voir fichiers affectés
            </button>
            <div class="affected-files" id="files-${pattern.ruleId}" style="display:none;">
              <ul>
                ${pattern.affectedFiles.map(file => `<li>${file}</li>`).join('')}
              </ul>
            </div>
          </td>
        </tr>
      `;
    });
    
    htmlContent += `
          </tbody>
        </table>
      </div>
    `;
  });
  
  htmlContent += `
      </div>
    </section>
  `;
  
  return htmlContent;
}

/**
 * Crée la section des violations de seuils
 */
export function createThresholdViolationsSection(violations: ThresholdViolation[]): string {
  if (violations.length === 0) {
    return `
      <section class="threshold-violations-section dashboard-card">
        <h2>Violations de seuils</h2>
        <div class="empty-state">
          <p>Aucune violation de seuil détectée. Bravo! 🎉</p>
        </div>
      </section>
    `;
  }
  
  const violationsHtml = violations
    .map(violation => `
      <tr>
        <td>${violation.thresholdName}</td>
        <td>${violation.expectedValue}</td>
        <td>${violation.actualValue}</td>
        <td>${violation.description}</td>
      </tr>
    `)
    .join('');
  
  return `
    <section class="threshold-violations-section dashboard-card">
      <div class="section-header">
        <h2>Violations de seuils</h2>
        <button id="toggleViolations" class="toggle-btn">▼</button>
      </div>
      <div id="violationsContent" class="section-content">
        <table class="data-table">
          <thead>
            <tr>
              <th>Seuil</th>
              <th>Valeur attendue</th>
              <th>Valeur actuelle</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${violationsHtml}
          </tbody>
        </table>
      </div>
    </section>
  `;
}
