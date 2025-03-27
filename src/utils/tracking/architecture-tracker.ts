
/**
 * Utilitaire de suivi des tendances architecturales
 * 
 * Cet utilitaire permet de suivre l'évolution des métriques d'architecture
 * au fil du temps et de générer des indicateurs de tendance.
 */

import fs from 'fs';
import path from 'path';

// Définition des types pour le suivi des métriques
export interface ArchitectureTrend {
  dates: string[];
  complianceRates: number[];
  issuesCounts: number[];
  featuresCounts: number[];
}

export interface ArchitectureHistoryEntry {
  timestamp: string;
  complianceRate: number;
  issuesCount: number;
  featuresCount: number;
}

const HISTORY_FILE = path.resolve(__dirname, '../../../reports/architecture-history.json');

/**
 * Sauvegarde les métriques actuelles dans l'historique
 */
export function saveCurrentMetrics(
  complianceRate: number,
  issuesCount: number,
  featuresCount: number
): void {
  const timestamp = new Date().toISOString();
  const entry: ArchitectureHistoryEntry = {
    timestamp,
    complianceRate,
    issuesCount,
    featuresCount
  };
  
  let history: ArchitectureHistoryEntry[] = [];
  
  // Charger l'historique existant s'il existe
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      const data = fs.readFileSync(HISTORY_FILE, 'utf8');
      history = JSON.parse(data);
    } catch (error) {
      console.error('Erreur lors de la lecture de l\'historique:', error);
    }
  }
  
  // Ajouter la nouvelle entrée
  history.push(entry);
  
  // Limiter l'historique aux 30 dernières entrées
  if (history.length > 30) {
    history = history.slice(history.length - 30);
  }
  
  // Sauvegarder l'historique mis à jour
  const dirPath = path.dirname(HISTORY_FILE);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

/**
 * Récupère les tendances des métriques d'architecture
 */
export function getArchitectureTrends(): ArchitectureTrend {
  const trend: ArchitectureTrend = {
    dates: [],
    complianceRates: [],
    issuesCounts: [],
    featuresCounts: []
  };
  
  if (!fs.existsSync(HISTORY_FILE)) {
    return trend;
  }
  
  try {
    const data = fs.readFileSync(HISTORY_FILE, 'utf8');
    const history: ArchitectureHistoryEntry[] = JSON.parse(data);
    
    history.forEach(entry => {
      // Convertir le timestamp en date lisible
      const date = new Date(entry.timestamp).toLocaleDateString();
      trend.dates.push(date);
      trend.complianceRates.push(entry.complianceRate);
      trend.issuesCounts.push(entry.issuesCount);
      trend.featuresCounts.push(entry.featuresCount);
    });
  } catch (error) {
    console.error('Erreur lors de la lecture des tendances:', error);
  }
  
  return trend;
}

/**
 * Calcule les variations des métriques par rapport à la dernière mesure
 */
export function getMetricsVariations(): {
  complianceChange: number;
  issuesChange: number;
  featuresChange: number;
} {
  const defaultResult = { complianceChange: 0, issuesChange: 0, featuresChange: 0 };
  
  if (!fs.existsSync(HISTORY_FILE)) {
    return defaultResult;
  }
  
  try {
    const data = fs.readFileSync(HISTORY_FILE, 'utf8');
    const history: ArchitectureHistoryEntry[] = JSON.parse(data);
    
    if (history.length < 2) {
      return defaultResult;
    }
    
    const current = history[history.length - 1];
    const previous = history[history.length - 2];
    
    return {
      complianceChange: current.complianceRate - previous.complianceRate,
      issuesChange: current.issuesCount - previous.issuesCount,
      featuresChange: current.featuresCount - previous.featuresCount
    };
  } catch (error) {
    console.error('Erreur lors du calcul des variations:', error);
    return defaultResult;
  }
}
