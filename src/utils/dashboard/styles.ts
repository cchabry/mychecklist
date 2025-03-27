
/**
 * Utilitaires pour les styles du tableau de bord
 */

/**
 * Génère les styles CSS pour le tableau de bord interactif
 */
export function generateDashboardStyles(): string {
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
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .card-header h2 {
        margin: 0;
        font-size: 18px;
      }
      
      .card-header .toggle-button {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 18px;
      }
      
      .card-body {
        padding: 20px;
      }
      
      .card-collapsed .card-body {
        display: none;
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
        cursor: pointer;
      }
      
      .table th:hover {
        background-color: #e1e7ff;
      }
      
      .table th.sort-asc::after {
        content: " ▲";
        font-size: 12px;
      }
      
      .table th.sort-desc::after {
        content: " ▼";
        font-size: 12px;
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
        cursor: pointer;
        transition: transform 0.2s;
      }
      
      .severity:hover {
        transform: scale(1.05);
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
      
      /* Trend chart styles */
      .trend-chart-container {
        margin-bottom: 20px;
      }
      
      .chart-controls {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
      }
      
      .chart-selector {
        padding: 6px 12px;
        border-radius: 4px;
        border: 1px solid var(--border-color);
        background-color: white;
      }
      
      .chart-period-selector {
        display: flex;
        gap: 5px;
      }
      
      .period-button {
        padding: 6px 12px;
        border-radius: 4px;
        border: 1px solid var(--border-color);
        background-color: white;
        cursor: pointer;
      }
      
      .period-button.active {
        background-color: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }
      
      .no-data {
        padding: 30px;
        text-align: center;
        color: #666;
        font-style: italic;
      }
      
      /* Variations styles */
      .variations-container {
        display: flex;
        justify-content: space-around;
        margin-top: 20px;
      }
      
      .variation-card {
        width: 120px;
        padding: 15px;
        border-radius: 8px;
        text-align: center;
      }
      
      .variation-title {
        font-weight: bold;
        margin-bottom: 10px;
      }
      
      .variation-value {
        font-size: 18px;
        font-weight: bold;
      }
      
      .variation-card.positive {
        background-color: #e8f5e9;
      }
      
      .variation-card.positive .variation-value {
        color: var(--success-color);
      }
      
      .variation-card.negative {
        background-color: #ffebee;
      }
      
      .variation-card.negative .variation-value {
        color: var(--danger-color);
      }
      
      .variation-card.neutral {
        background-color: #f5f5f5;
      }
      
      .variation-card.neutral .variation-value {
        color: #666;
      }
      
      .variations-section h3 {
        text-align: center;
        margin: 20px 0;
        color: var(--primary-color);
      }
      
      /* Filtres */
      .filter-section {
        margin-bottom: 20px;
        padding: 15px;
        background-color: #f5f7ff;
        border-radius: 8px;
        border: 1px solid var(--border-color);
      }
      
      .filter-title {
        margin-top: 0;
        margin-bottom: 10px;
        font-weight: bold;
        color: var(--primary-color);
      }
      
      .filter-group {
        margin-bottom: 15px;
      }
      
      .filter-options {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      
      .category-options {
        max-height: 120px;
        overflow-y: auto;
        padding-right: 5px;
      }
      
      .filter-option {
        display: flex;
        align-items: center;
        gap: 5px;
        cursor: pointer;
      }
      
      .filter-controls {
        display: flex;
        justify-content: space-between;
        margin-top: 15px;
      }
      
      .filter-button {
        padding: 6px 12px;
        border-radius: 4px;
        border: 1px solid var(--border-color);
        background-color: white;
        cursor: pointer;
      }
      
      .filter-button:hover {
        background-color: #f0f0f0;
      }
      
      .issues-count {
        margin: 10px 0;
        font-style: italic;
        color: #666;
      }
      
      /* Chart.js tooltip customization */
      #chartjs-tooltip {
        opacity: 1;
        position: absolute;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border-radius: 3px;
        -webkit-transition: all .1s ease;
        transition: all .1s ease;
        pointer-events: none;
        -webkit-transform: translate(-50%, 0);
        transform: translate(-50%, 0);
        padding: 5px 10px;
      }
      
      /* Toggle card */
      .toggle-icon::before {
        content: '−'; /* Minus sign for expanded */
      }
      
      .card-collapsed .toggle-icon::before {
        content: '+'; /* Plus sign for collapsed */
      }
    </style>
  `;
}
