
/**
 * Types pour le système operationMode
 */

// Modes d'opération disponibles
export enum OperationMode {
  REAL = 'real',
  DEMO = 'demo'
}

// Raison d'un changement de mode
export type SwitchReason = string;

// Configuration du service operationMode
export interface OperationModeSettings {
  // Nombre maximum d'échecs consécutifs avant basculement automatique
  maxConsecutiveFailures: number;
  
  // Activer le basculement automatique en cas d'échecs répétés
  autoSwitchOnFailure: boolean;
  
  // Stocker le mode dans localStorage pour persistance
  persistentModeStorage: boolean;
  
  // Durée d'affichage des notifications (ms)
  notificationDuration: number;
  
  // Délai simulé pour les opérations en mode démo (ms)
  simulatedNetworkDelay: number;
  
  // Taux de simulation d'erreurs en mode démo (%)
  errorSimulationRate: number;
}
