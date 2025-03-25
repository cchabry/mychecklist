
/**
 * Constantes pour le système de mode opérationnel
 */

import { OperationModeSettings } from './types';

// Paramètres par défaut pour le mode opérationnel
export const DEFAULT_SETTINGS: OperationModeSettings = {
  // Bascule automatique en mode démo après un certain nombre d'échecs
  autoSwitchOnFailure: true,
  
  // Nombre d'échecs consécutifs avant basculement automatique
  maxConsecutiveFailures: 3,
  
  // Conserver le mode entre les sessions
  persistentModeStorage: true,
  
  // Afficher les notifications de changement de mode
  showNotifications: true,
  
  // Utiliser le cache en mode réel
  useCacheInRealMode: true,
  
  // Taux d'erreurs simulées en mode démo (pourcentage)
  errorSimulationRate: 10,
  
  // Délai réseau simulé en mode démo (ms)
  simulatedNetworkDelay: 500,
};
