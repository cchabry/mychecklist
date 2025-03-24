
/**
 * Modes de fonctionnement de l'application
 */
export enum OperationMode {
  REAL = 'real',  // Mode réel, données depuis l'API
  DEMO = 'demo'   // Mode démo, données simulées
}

/**
 * Types de raisons pour le changement de mode
 */
export type SwitchReason = string | null;

/**
 * Paramètres du mode opérationnel
 */
export interface OperationModeSettings {
  // Mode opérationnel actuel
  mode: OperationMode;
  
  // Bascule automatique en mode démo après un certain nombre d'échecs
  autoSwitchEnabled: boolean;
  
  // Nombre d'échecs consécutifs avant basculement automatique
  failuresThreshold: number;
  
  // Gestion des erreurs (auto ou manuel)
  errorHandling: 'auto' | 'manual';
  
  // Basculer automatiquement en mode démo lors d'erreurs
  autoSwitchOnErrors: boolean;
}

/**
 * Fonction appelée lors des changements de mode
 */
export type OperationModeSubscriber = (mode: OperationMode, reason: SwitchReason) => void;

/**
 * Interface pour le service de mode opérationnel
 */
export interface IOperationModeService {
  // Propriétés calculées
  isDemoMode: boolean;
  isRealMode: boolean;
  
  // Accesseurs d'état
  getMode: () => OperationMode;
  getSwitchReason: () => SwitchReason;
  getSettings: () => OperationModeSettings;
  getConsecutiveFailures: () => number;
  getLastError: () => Error | null;
  
  // Gestion des abonnements
  subscribe: (subscriber: OperationModeSubscriber) => () => void;
  onModeChange: (subscriber: (isDemoMode: boolean) => void) => () => void;
  offModeChange: (subscriber: (isDemoMode: boolean) => void) => void;
  
  // Méthodes de changement de mode
  enableDemoMode: (reason?: SwitchReason) => void;
  enableRealMode: () => void;
  toggle: () => void;
  toggleMode: () => void;
  setDemoMode: (value: boolean) => void;
  
  // Gestion des erreurs
  handleConnectionError: (error: Error, context?: string) => void;
  handleSuccessfulOperation: () => void;
  
  // Configuration
  updateSettings: (partialSettings: Partial<OperationModeSettings>) => void;
  
  // Réinitialisation
  reset: () => void;
}

/**
 * Interface pour le hook useOperationMode
 */
export interface OperationModeHook {
  // État
  mode: OperationMode;
  switchReason: SwitchReason;
  failures: number;
  lastError: Error | null;
  settings: OperationModeSettings;
  
  // Propriétés calculées
  isDemoMode: boolean;
  isRealMode: boolean;
  
  // Actions
  enableDemoMode: (reason?: SwitchReason) => void;
  enableRealMode: () => void;
  toggle: () => void;
  handleConnectionError: (error: Error, context?: string) => void;
  handleSuccessfulOperation: () => void;
  updateSettings: (partialSettings: Partial<OperationModeSettings>) => void;
  reset: () => void;
}
