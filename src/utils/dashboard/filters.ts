/**
 * Utilitaires pour les filtres et l'interactivité du tableau de bord
 * 
 * Ce module expose des fonctions pour créer des filtres interactifs
 * et des scripts pour améliorer l'expérience utilisateur.
 */

/**
 * Crée les scripts HTML pour les filtres
 */
export function createFilterScripts(): string {
  return `
    <div class="filters-container">
      <div class="filter-group">
        <label for="domain-filter">Domaine:</label>
        <select id="domain-filter" class="filter-select">
          <option value="all">Tous</option>
          <option value="feature">Features</option>
          <option value="service">Services</option>
          <option value="hook">Hooks</option>
          <option value="component">Composants</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="severity-filter">Sévérité:</label>
        <select id="severity-filter" class="filter-select">
          <option value="all">Toutes</option>
          <option value="low">Faible</option>
          <option value="medium">Moyenne</option>
          <option value="high">Haute</option>
          <option value="critical">Critique</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="search-input">Rechercher:</label>
        <input type="text" id="search-input" class="search-input" placeholder="Rechercher...">
      </div>
    </div>
  `;
}

/**
 * Crée les scripts JavaScript pour ajouter des fonctionnalités d'interactivité
 */
export function createInteractivityScripts(): string {
  return `
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        // Affichage/Masquage des fichiers affectés par les anti-patterns
        document.querySelectorAll('.toggle-affected-files').forEach(button => {
          button.addEventListener('click', function() {
            const ruleId = this.getAttribute('data-rule');
            const filesElement = document.getElementById('files-' + ruleId);
            
            if (filesElement.style.display === 'none') {
              filesElement.style.display = 'block';
              this.textContent = 'Masquer fichiers affectés';
            } else {
              filesElement.style.display = 'none';
              this.textContent = 'Voir fichiers affectés';
            }
          });
        });
        
        // Plier/Déplier les sections
        document.querySelectorAll('.toggle-section').forEach(button => {
          button.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            const contentElement = document.getElementById(sectionId);
            
            if (contentElement.style.display === 'none') {
              contentElement.style.display = 'block';
              this.textContent = '−';
            } else {
              contentElement.style.display = 'none';
              this.textContent = '+';
            }
          });
        });
        
        // Initialisation des graphiques si Chart.js est disponible
        if (typeof Chart !== 'undefined') {
          // Graphique de tendance de conformité
          const complianceCanvas = document.getElementById('compliance-trend-chart');
          if (complianceCanvas) {
            const ctx = complianceCanvas.getContext('2d');
            new Chart(ctx, {
              type: 'line',
              data: {
                labels: complianceData.dates,
                datasets: [{
                  label: 'Taux de conformité (%)',
                  data: complianceData.rates,
                  borderColor: '#4361ee',
                  backgroundColor: 'rgba(67, 97, 238, 0.1)',
                  fill: true,
                  tension: 0.3
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100
                  }
                }
              }
            });
          }
          
          // Graphique de distribution des fichiers
          const filesCanvas = document.getElementById('files-distribution-chart');
          if (filesCanvas && filesDistributionData) {
            const ctx = filesCanvas.getContext('2d');
            new Chart(ctx, {
              type: 'doughnut',
              data: {
                labels: filesDistributionData.categories,
                datasets: [{
                  data: filesDistributionData.counts,
                  backgroundColor: [
                    '#4361ee', '#3a0ca3', '#f72585', '#7209b7', '#4cc9f0', '#4caf50', '#ff9800'
                  ]
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right'
                  }
                }
              }
            });
          }
          
          // Graphique des problèmes par sévérité
          const issuesCanvas = document.getElementById('issues-severity-chart');
          if (issuesCanvas && issuesSeverityData) {
            const ctx = issuesCanvas.getContext('2d');
            new Chart(ctx, {
              type: 'bar',
              data: {
                labels: issuesSeverityData.severities,
                datasets: [{
                  label: 'Nombre de problèmes',
                  data: issuesSeverityData.counts,
                  backgroundColor: [
                    'rgba(33, 150, 243, 0.7)', // Low
                    'rgba(255, 152, 0, 0.7)',  // Medium
                    'rgba(244, 67, 54, 0.7)',  // High
                    'rgba(156, 39, 176, 0.7)'  // Critical
                  ]
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }
            });
          }
        }
        
        // Gestion des onglets de domaines
        document.querySelectorAll('.domain-tab').forEach(tab => {
          tab.addEventListener('click', function() {
            const domain = this.getAttribute('data-domain');
            
            // Mettre à jour les onglets actifs
            document.querySelectorAll('.domain-tab').forEach(t => {
              t.classList.remove('active');
            });
            this.classList.add('active');
            
            // Afficher le contenu correspondant
            document.querySelectorAll('.domain-content').forEach(content => {
              content.style.display = 'none';
            });
            document.getElementById('domain-' + domain).style.display = 'block';
          });
        });
        
        // Tri des tableaux
        document.querySelectorAll('th[data-sort]').forEach(th => {
          th.addEventListener('click', function() {
            const table = this.closest('table');
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            const columnIndex = Array.from(th.parentNode.children).indexOf(th);
            const sortKey = this.getAttribute('data-sort');
            
            // Tri des lignes
            rows.sort((a, b) => {
              const aValue = a.children[columnIndex].textContent.trim();
              const bValue = b.children[columnIndex].textContent.trim();
              
              if (sortKey === 'numeric') {
                return parseFloat(aValue) - parseFloat(bValue);
              } else {
                return aValue.localeCompare(bValue);
              }
            });
            
            // Inverser l'ordre si on clique sur la même colonne
            if (th.classList.contains('sort-asc')) {
              rows.reverse();
              th.classList.remove('sort-asc');
              th.classList.add('sort-desc');
            } else {
              th.classList.remove('sort-desc');
              th.classList.add('sort-asc');
            }
            
            // Réinsérer les lignes triées
            rows.forEach(row => tbody.appendChild(row));
          });
        });
      });
    </script>
  `;
}
