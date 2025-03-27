
/**
 * Utilitaires pour les filtres du tableau de bord
 */

/**
 * Génère le HTML pour les filtres de sévérité
 */
export function createSeverityFilters(): string {
  return `
    <div class="filter-group">
      <h4 class="filter-title">Filtrer par sévérité</h4>
      <div class="filter-options">
        <label class="filter-option">
          <input type="checkbox" class="severity-filter" value="high" checked> 
          <span class="severity-badge high">Haute</span>
        </label>
        <label class="filter-option">
          <input type="checkbox" class="severity-filter" value="medium" checked> 
          <span class="severity-badge medium">Moyenne</span>
        </label>
        <label class="filter-option">
          <input type="checkbox" class="severity-filter" value="low" checked> 
          <span class="severity-badge low">Basse</span>
        </label>
      </div>
    </div>
  `;
}

/**
 * Génère le HTML pour les filtres de catégorie
 */
export function createCategoryFilters(categories: string[]): string {
  const categoryOptions = categories.map(category => `
    <label class="filter-option">
      <input type="checkbox" class="category-filter" value="${category}" checked> 
      ${category}
    </label>
  `).join('');

  return `
    <div class="filter-group">
      <h4 class="filter-title">Filtrer par catégorie</h4>
      <div class="filter-options category-options">
        ${categoryOptions}
      </div>
    </div>
  `;
}

/**
 * Génère le HTML pour les contrôles de filtrage
 */
export function createFilterControls(): string {
  return `
    <div class="filter-controls">
      <button id="reset-filters" class="filter-button">Réinitialiser les filtres</button>
      <button id="toggle-all-categories" class="filter-button">Tout sélectionner/désélectionner</button>
    </div>
  `;
}

/**
 * Script JavaScript pour gérer les filtres côté client
 */
export function createFilterScripts(): string {
  return `
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        // Récupérer les éléments DOM
        const severityFilters = document.querySelectorAll('.severity-filter');
        const categoryFilters = document.querySelectorAll('.category-filter');
        const resetButton = document.getElementById('reset-filters');
        const toggleCategoriesButton = document.getElementById('toggle-all-categories');
        const issuesTable = document.querySelector('.issues-table');
        const issuesRows = issuesTable ? issuesTable.querySelectorAll('tbody tr') : [];
        
        // Fonction pour appliquer les filtres
        function applyFilters() {
          // Récupérer les sévérités sélectionnées
          const selectedSeverities = Array.from(severityFilters)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
          
          // Récupérer les catégories sélectionnées
          const selectedCategories = Array.from(categoryFilters)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
          
          // Filtrer les lignes du tableau
          issuesRows.forEach(row => {
            const severityCell = row.querySelector('td:nth-child(3)');
            const categoryCell = row.querySelector('td:nth-child(2)');
            
            const severity = severityCell?.querySelector('.severity-badge')?.textContent?.toLowerCase() || '';
            const category = categoryCell?.textContent?.trim() || '';
            
            // Vérifier si la ligne correspond aux filtres
            const matchesSeverity = selectedSeverities.some(s => severity.includes(s));
            const matchesCategory = selectedCategories.includes(category);
            
            // Afficher ou masquer la ligne
            if (matchesSeverity && matchesCategory) {
              row.style.display = '';
            } else {
              row.style.display = 'none';
            }
          });
          
          // Mettre à jour le compteur d'éléments visibles
          updateVisibleCount();
        }
        
        // Fonction pour mettre à jour le compteur d'éléments visibles
        function updateVisibleCount() {
          const visibleIssues = Array.from(issuesRows).filter(row => row.style.display !== 'none').length;
          const totalIssues = issuesRows.length;
          const countElement = document.getElementById('visible-issues-count');
          
          if (countElement) {
            countElement.textContent = \`\${visibleIssues} sur \${totalIssues} problèmes affichés\`;
          }
        }
        
        // Ajouter les écouteurs d'événements pour les filtres
        severityFilters.forEach(filter => {
          filter.addEventListener('change', applyFilters);
        });
        
        categoryFilters.forEach(filter => {
          filter.addEventListener('change', applyFilters);
        });
        
        // Réinitialiser les filtres
        resetButton?.addEventListener('click', function() {
          severityFilters.forEach(filter => {
            filter.checked = true;
          });
          
          categoryFilters.forEach(filter => {
            filter.checked = true;
          });
          
          applyFilters();
        });
        
        // Tout sélectionner/désélectionner
        let allCategoriesSelected = true; // Par défaut, toutes les catégories sont sélectionnées
        toggleCategoriesButton?.addEventListener('click', function() {
          allCategoriesSelected = !allCategoriesSelected;
          
          categoryFilters.forEach(filter => {
            filter.checked = allCategoriesSelected;
          });
          
          applyFilters();
        });
        
        // Appliquer les filtres au chargement
        applyFilters();
      });
    </script>
  `;
}
