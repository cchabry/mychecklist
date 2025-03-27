/**
 * Utilitaires pour les styles du tableau de bord
 */

/**
 * Génère les styles CSS pour le tableau de bord
 */
export function generateDashboardStyles(): string {
  return `
    <style>
      /* Styles généraux */
      :root {
        --primary-color: #4361ee;
        --secondary-color: #3a0ca3;
        --success-color: #4caf50;
        --warning-color: #ff9800;
        --danger-color: #f44336;
        --info-color: #2196f3;
        --light-color: #f8f9fa;
        --dark-color: #343a40;
        --border-color: #dee2e6;
        --text-color: #333;
        --bg-color: #fff;
        --section-bg: #f7f9fc;
        --hover-bg: #eaecef;
      }
      
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
          Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        color: var(--text-color);
        background-color: var(--bg-color);
        line-height: 1.6;
        padding: 0;
        margin: 0;
      }
      
      /* Dashboard layout */
      .dashboard {
        max-width: 1800px;
        margin: 0 auto;
        padding: 20px;
      }
      
      header {
        margin-bottom: 20px;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 10px;
      }
      
      header h1 {
        font-size: 28px;
        color: var(--primary-color);
      }
      
      .timestamp {
        font-size: 14px;
        color: var(--dark-color);
        opacity: 0.7;
      }
      
      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(600px, 1fr));
        gap: 20px;
        align-items: start;
      }
      
      /* Sections */
      .dashboard-section {
        background: var(--section-bg);
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        padding: 20px;
        margin-bottom: 20px;
      }
      
      .dashboard-section h2 {
        font-size: 20px;
        margin-bottom: 15px;
        color: var(--secondary-color);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .dashboard-section h2 button.toggle-section {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: var(--text-color);
      }
      
      /* Summary cards */
      .summary-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
      }
      
      .summary-card {
        background: var(--bg-color);
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        padding: 15px;
        display: flex;
        flex-direction: column;
      }
      
      .summary-card-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--dark-color);
        margin-bottom: 5px;
      }
      
      .summary-card-value {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 10px;
      }
      
      .summary-card-trend {
        font-size: 12px;
        display: flex;
        align-items: center;
      }
      
      .trend-up {
        color: var(--success-color);
      }
      
      .trend-down {
        color: var(--danger-color);
      }
      
      .trend-neutral {
        color: var(--info-color);
      }
      
      /* Charts */
      .chart-container {
        height: 300px;
        position: relative;
        margin-bottom: 20px;
      }
      
      /* Tables */
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
        font-size: 14px;
      }
      
      thead th {
        background-color: var(--light-color);
        text-align: left;
        padding: 10px;
        border-bottom: 2px solid var(--border-color);
        position: sticky;
        top: 0;
      }
      
      tbody td {
        padding: 10px;
        border-bottom: 1px solid var(--border-color);
      }
      
      tbody tr:hover {
        background-color: var(--hover-bg);
      }
      
      /* Features section */
      .feature-status {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
      }
      
      .status-compliant {
        background-color: rgba(76, 175, 80, 0.2);
        color: var(--success-color);
      }
      
      .status-non-compliant {
        background-color: rgba(244, 67, 54, 0.2);
        color: var(--danger-color);
      }
      
      /* Issues section */
      .issues-container {
        max-height: 600px;
        overflow-y: auto;
      }
      
      .severity-low {
        border-left: 4px solid var(--info-color);
      }
      
      .severity-medium {
        border-left: 4px solid var(--warning-color);
      }
      
      .severity-high {
        border-left: 4px solid var(--danger-color);
      }
      
      .severity-critical {
        border-left: 4px solid #9c27b0;
        background-color: rgba(156, 39, 176, 0.05);
      }
      
      /* Anti-patterns section */
      .toggle-affected-files {
        background-color: var(--light-color);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 12px;
        cursor: pointer;
      }
      
      .affected-files {
        margin-top: 10px;
        padding: 10px;
        background-color: var(--light-color);
        border-radius: 4px;
        font-size: 12px;
      }
      
      .affected-files ul {
        margin-left: 20px;
      }
      
      /* Threshold violations section */
      .threshold-failure {
        background-color: rgba(244, 67, 54, 0.05);
      }
      
      .status-success {
        color: var(--success-color);
        font-weight: 500;
      }
      
      .status-failure {
        color: var(--danger-color);
        font-weight: 500;
      }
      
      /* Filters */
      .filters-container {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 15px;
      }
      
      .filter-group {
        display: flex;
        align-items: center;
      }
      
      .filter-group label {
        margin-right: 5px;
        font-size: 14px;
        font-weight: 500;
      }
      
      .filter-select {
        padding: 6px 10px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background-color: var(--bg-color);
        font-size: 14px;
      }
      
      .search-input {
        padding: 6px 10px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        font-size: 14px;
        width: 200px;
      }
      
      /* Period selector */
      .period-selector {
        display: flex;
        gap: 5px;
        margin-bottom: 15px;
      }
      
      .period-btn {
        padding: 5px 10px;
        border: 1px solid var(--border-color);
        background-color: var(--light-color);
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
      }
      
      .period-btn.active {
        background-color: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }
      
      /* Responsive adjustments */
      @media (max-width: 768px) {
        .dashboard-grid {
          display: block;
        }
        
        .summary-cards {
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        }
        
        .chart-container {
          height: 250px;
        }
      }
      
      /* Domaine rules section */
      .domain-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-bottom: 15px;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 5px;
      }
      
      .domain-tab {
        padding: 8px 15px;
        background: var(--light-color);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
      }
      
      .domain-tab.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }
      
      .domain-content {
        margin-top: 15px;
      }
      
      .domain-content h3 {
        font-size: 16px;
        margin-bottom: 10px;
        color: var(--secondary-color);
      }
      
      /* Threshold tables */
      .thresholds-table th,
      .thresholds-table td {
        text-align: center;
      }
      
      .thresholds-table td:first-child,
      .thresholds-table th:first-child {
        text-align: left;
      }
    </style>
  `;
}
