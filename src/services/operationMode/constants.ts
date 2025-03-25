
import { OperationModeSettings } from './types';

/**
 * Paramètres par défaut pour le système operationMode
 */
export const DEFAULT_SETTINGS: OperationModeSettings = {
  // Bascule automatique en mode démo après un certain nombre d'échecs
  autoSwitchOnFailure: true,
  
  // Nombre d'échecs consécutifs avant basculement automatique
  maxConsecutiveFailures: 1, // Réduit à 1 pour basculer plus rapidement
  
  // Conserver le mode entre les sessions
  persistentModeStorage: true,
  
  // Afficher les notifications de changement de mode
  showNotifications: true,
  
  // Utiliser le cache en mode réel
  useCacheInRealMode: true,
  
  // Taux d'erreurs simulées en mode démo (pourcentage)
  errorSimulationRate: 10,
  
  // Délai réseau simulé en mode démo (ms)
  simulatedNetworkDelay: 300,
  
  // Démarrer en mode démo par défaut
  startInDemoMode: true
};

// Identifiants par défaut pour le mode démo
export const DEMO_DATABASE_ID = 'demo-database-1234';
export const DEMO_CHECKLIST_DATABASE_ID = 'demo-checklist-db-5678';

// Chaînes de remplacement pour les placeholders
export const PLACEHOLDER_DATABASE_ID = 'YOUR_DATABASE_ID';
export const PLACEHOLDER_CHECKLIST_DATABASE_ID = 'YOUR_CHECKLIST_DATABASE_ID';
