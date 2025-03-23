
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

// Interface pour les abonnés au service de mode opérationnel
export interface OperationModeSubscriber {
  (mode: OperationMode, reason: SwitchReason | null): void;
}

// Interface exposée par le hook useOperationMode
export interface OperationModeHook {
  // État
  mode: OperationMode;
  switchReason: SwitchReason | null;
  failures: number;
  lastError: Error | null;
  settings: OperationModeSettings;
  
  // Raccourcis d'état
  isDemoMode: boolean;
  isRealMode: boolean;
  
  // Actions
  enableDemoMode: (reason?: SwitchReason) => void;
  enableRealMode: () => void;
  toggle: () => void;
  updateSettings: (settings: Partial<OperationModeSettings>) => void;
  reset: () => void;
  
  // Gestion des erreurs
  handleConnectionError: (error: Error, context?: string) => void;
  handleSuccessfulOperation: () => void;
}

// Interface du service operationMode public
export interface IOperationModeService {
  // État actuel
  getMode(): OperationMode;
  getSwitchReason(): SwitchReason | null;
  getSettings(): OperationModeSettings;
  getConsecutiveFailures(): number;
  getLastError(): Error | null;
  
  // Propriétés calculées
  readonly isDemoMode: boolean;
  readonly isRealMode: boolean;
  
  // Abonnement aux changements
  subscribe(subscriber: OperationModeSubscriber): () => void;
  
  // Actions
  enableDemoMode(reason?: SwitchReason): void;
  enableRealMode(): void;
  toggle(): void;
  reset(): void;
  
  // Gestion des erreurs
  handleConnectionError(error: Error, context?: string): void;
  handleSuccessfulOperation(): void;
  
  // Configuration
  updateSettings(partialSettings: Partial<OperationModeSettings>): void;
}
