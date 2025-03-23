
import { OperationModeSettings } from './types';

/**
 * Paramètres par défaut pour le système operationMode
 */
export const DEFAULT_SETTINGS: OperationModeSettings = {
  // Nombre d'échecs consécutifs avant basculement automatique
  maxConsecutiveFailures: 3,
  
  // Activer le basculement automatique en cas d'échecs répétés
  autoSwitchOnFailure: true,
  
  // Stocker le mode dans localStorage pour persistance
  persistentModeStorage: true,
  
  // Durée d'affichage des notifications (ms)
  notificationDuration: 5000,
  
  // Délai simulé pour les opérations en mode démo (ms)
  simulatedNetworkDelay: 500,
  
  // Taux de simulation d'erreurs en mode démo (%)
  errorSimulationRate: 10
};
