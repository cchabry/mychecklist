
import { OperationModeSettings } from './types';

/**
 * Paramètres par défaut pour le système operationMode
 */
export const DEFAULT_SETTINGS: OperationModeSettings = {
  // Bascule automatique en mode démo après un certain nombre d'échecs - DÉSACTIVÉE
  autoSwitchOnFailure: false,
  
  // Nombre d'échecs consécutifs avant basculement automatique - considérablement augmenté
  maxConsecutiveFailures: 10,
  
  // Conserver le mode entre les sessions
  persistentModeStorage: true,
  
  // Afficher les notifications de changement de mode
  showNotifications: true,
  
  // Utiliser le cache en mode réel
  useCacheInRealMode: true,
  
  // Taux d'erreurs simulées en mode démo (pourcentage) - réduit
  errorSimulationRate: 3,
  
  // Délai réseau simulé en mode démo (ms)
  simulatedNetworkDelay: 300
};
