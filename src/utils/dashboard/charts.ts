
/**
 * Utilitaires pour les graphiques du tableau de bord
 */

/**
 * Crée un graphique de tendance interactif
 */
export function createInteractiveTrendChart(trends: any): string {
  if (!trends.dates || trends.dates.length === 0) {
    return '<div class="no-data">Données de tendance insuffisantes</div>';
  }
  
  // Créer un identifiant unique pour le graphique
  const chartId = `trend-chart-${Date.now()}`;
  
  // Préparer les données pour Chart.js
  const chartData = {
    labels: trends.dates,
    complianceRates: trends.complianceRates,
    issuesCounts: trends.issuesCounts,
    featuresCounts: trends.featuresCounts
  };
  
  // Convertir les données en JSON pour passer au script
  const chartDataJson = JSON.stringify(chartData);
  
  return `
    <div class="trend-chart-container">
      <div class="chart-controls">
        <select id="chart-type-selector" class="chart-selector">
          <option value="compliance">Taux de conformité</option>
          <option value="issues">Nombre de problèmes</option>
          <option value="features">Nombre de fonctionnalités</option>
        </select>
        <div class="chart-period-selector">
          <button data-period="7" class="period-button">7j</button>
          <button data-period="14" class="period-button">14j</button>
          <button data-period="30" class="period-button">30j</button>
          <button data-period="all" class="period-button active">Tout</button>
        </div>
      </div>
      <canvas id="${chartId}" width="600" height="300"></canvas>
    </div>
    
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        // Récupérer le contexte du canvas
        const ctx = document.getElementById('${chartId}').getContext('2d');
        
        // Récupérer les données du graphique
        const chartData = ${chartDataJson};
        
        // Couleurs pour les différentes séries
        const colors = {
          compliance: {
            borderColor: '#4361ee',
            backgroundColor: 'rgba(67, 97, 238, 0.1)'
          },
          issues: {
            borderColor: '#f44336',
            backgroundColor: 'rgba(244, 67, 54, 0.1)'
          },
          features: {
            borderColor: '#4caf50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)'
          }
        };
        
        // Créer le graphique initial avec les données de conformité
        let currentType = 'compliance';
        let currentPeriod = 'all';
        
        // Instance du graphique
        let chart = null;
        
        // Fonction pour mettre à jour le graphique
        function updateChart() {
          // Filtrer les données en fonction de la période sélectionnée
          let filteredLabels = [...chartData.labels];
          let filteredData = [];
          
          if (currentPeriod !== 'all' && chartData.labels.length > parseInt(currentPeriod)) {
            const periodDays = parseInt(currentPeriod);
            filteredLabels = chartData.labels.slice(-periodDays);
            
            switch (currentType) {
              case 'compliance':
                filteredData = chartData.complianceRates.slice(-periodDays);
                break;
              case 'issues':
                filteredData = chartData.issuesCounts.slice(-periodDays);
                break;
              case 'features':
                filteredData = chartData.featuresCounts.slice(-periodDays);
                break;
            }
          } else {
            switch (currentType) {
              case 'compliance':
                filteredData = chartData.complianceRates;
                break;
              case 'issues':
                filteredData = chartData.issuesCounts;
                break;
              case 'features':
                filteredData = chartData.featuresCounts;
                break;
            }
          }
          
          // Détruire le graphique existant s'il existe
          if (chart) {
            chart.destroy();
          }
          
          // Créer le nouveau graphique
          chart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: filteredLabels,
              datasets: [{
                label: getLabelForType(currentType),
                data: filteredData,
                borderColor: colors[currentType].borderColor,
                backgroundColor: colors[currentType].backgroundColor,
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: currentType === 'compliance' ? true : false,
                  ticks: {
                    callback: function(value) {
                      if (currentType === 'compliance') {
                        return value + '%';
                      }
                      return value;
                    }
                  }
                }
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      if (currentType === 'compliance') {
                        return \`Taux de conformité: \${context.raw}%\`;
                      } else if (currentType === 'issues') {
                        return \`Problèmes: \${context.raw}\`;
                      } else {
                        return \`Fonctionnalités: \${context.raw}\`;
                      }
                    }
                  }
                }
              }
            }
          });
        }
        
        // Obtenir l'étiquette appropriée pour le type de données
        function getLabelForType(type) {
          switch (type) {
            case 'compliance':
              return 'Taux de conformité (%)';
            case 'issues':
              return 'Nombre de problèmes';
            case 'features':
              return 'Nombre de fonctionnalités';
            default:
              return '';
          }
        }
        
        // Écouteurs d'événements pour le sélecteur de type de graphique
        document.getElementById('chart-type-selector').addEventListener('change', function(e) {
          currentType = e.target.value;
          updateChart();
        });
        
        // Écouteurs d'événements pour les boutons de période
        document.querySelectorAll('.period-button').forEach(button => {
          button.addEventListener('click', function(e) {
            // Mettre à jour l'état actif
            document.querySelectorAll('.period-button').forEach(b => {
              b.classList.remove('active');
            });
            e.target.classList.add('active');
            
            // Mettre à jour la période et le graphique
            currentPeriod = e.target.getAttribute('data-period');
            updateChart();
          });
        });
        
        // Initialiser le graphique
        updateChart();
      });
    </script>
  `;
}

/**
 * Crée un graphique à barres pour les catégories de fichiers
 */
export function createInteractiveBarChart(data: Record<string, number>): string {
  // Convertir les données en format adapté pour Chart.js
  const chartData = {
    labels: Object.keys(data),
    values: Object.values(data)
  };
  
  const chartId = `bar-chart-${Date.now()}`;
  const chartDataJson = JSON.stringify(chartData);
  
  return `
    <div class="bar-chart-container">
      <canvas id="${chartId}" width="600" height="400"></canvas>
    </div>
    
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        // Récupérer le contexte du canvas
        const ctx = document.getElementById('${chartId}').getContext('2d');
        
        // Récupérer les données du graphique
        const chartData = ${chartDataJson};
        
        // Générer des couleurs pour chaque catégorie
        const backgroundColors = chartData.labels.map((_, index) => {
          const hue = (index * 137) % 360; // Utiliser le nombre d'or pour une répartition uniforme des couleurs
          return \`hsla(\${hue}, 80%, 60%, 0.7)\`;
        });
        
        // Créer le graphique
        const chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: chartData.labels,
            datasets: [{
              label: 'Nombre de fichiers par catégorie',
              data: chartData.values,
              backgroundColor: backgroundColors,
              borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const total = chartData.values.reduce((sum, value) => sum + value, 0);
                    const percentage = Math.round((context.raw / total) * 100);
                    return \`\${context.raw} fichiers (\${percentage}%)\`;
                  }
                }
              }
            }
          }
        });
      });
    </script>
  `;
}
