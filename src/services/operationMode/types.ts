
/**
 * Types pour le système de gestion des modes opérationnels
 */

/**
 * Modes d'opération disponibles
 */
export enum OperationMode {
  REAL = "real",
  DEMO = "demo"
}

/**
 * Raisons du changement de mode
 */
export enum SwitchReason {
  // Changements manuels
  MANUAL = "Changement manuel",
  MANUAL_API = "Activation manuelle via API",
  MANUAL_TOGGLE = "Basculement manuel",
  AFTER_ERROR = "Basculement manuel après erreur",
  
  // Changements automatiques
  AUTO_SWITCH = "Basculement automatique après échecs",
  API_ERROR = "Erreur API Notion",
  NETWORK_ERROR = "Problème de connexion réseau",
  REPEATED_ERRORS = "Basculement automatique suite à des erreurs répétées",
  CONNECTION_TEST = "Mode restauré après test de connexion réussi",
  MANUAL_TEST = "Test manuel depuis diagnostics",
  SAVE_ERROR = "Sauvegarde impossible - problème de connexion à l'API",
  PROJECT_LOAD_ERROR = "Erreur lors du chargement des projets"
}

/**
 * Paramètres du système
 */
export interface OperationModeSettings {
  // Basculer automatiquement en mode démo après un certain nombre d'échecs
  autoSwitchOnFailure: boolean;
  
  // Nombre d'échecs consécutifs avant basculement automatique
  maxConsecutiveFailures: number;
  
  // Conserver le mode entre les sessions
  persistentModeStorage: boolean;
  
  // Afficher les notifications de changement de mode
  showNotifications: boolean;
  
  // Utiliser le cache en mode réel
  useCacheInRealMode: boolean;
  
  // Taux d'erreurs simulées en mode démo (pourcentage)
  errorSimulationRate: number;
  
  // Délai réseau simulé en mode démo (ms)
  simulatedNetworkDelay: number;
}

/**
 * Type for operation mode subscribers
 */
export type OperationModeSubscriber = (mode: OperationMode, reason?: SwitchReason | null) => void;

/**
 * Interface for the Operation Mode Service
 */
export interface IOperationModeService {
  // Getters
  getMode(): OperationMode;
  getSwitchReason(): SwitchReason | null;
  getSettings(): OperationModeSettings;
  getConsecutiveFailures(): number;
  getLastError(): Error | null;
  
  // Computed properties
  readonly isDemoMode: boolean;
  readonly isRealMode: boolean;
  
  // Mode management
  enableDemoMode(reason?: SwitchReason): void;
  enableRealMode(): void;
  toggle(): void;
  switchMode(newMode: OperationMode, reason?: SwitchReason): void;
  
  // Error handling
  handleConnectionError(error: Error, context?: string): void;
  handleSuccessfulOperation(): void;
  registerFailure(error: Error, context?: string): void;
  resetFailures(): void;
  
  // Settings management
  updateSettings(partialSettings: Partial<OperationModeSettings>): void;
  reset(): void;
  
  // State utilities
  getState(): {
    mode: OperationMode;
    reason: SwitchReason | null;
    failures: number;
    lastError: Error | null;
    settings: OperationModeSettings;
  };
  
  // Subscription
  subscribe(subscriber: OperationModeSubscriber): () => void;
  onModeChange(subscriber: (isDemoMode: boolean) => void): () => void;
  offModeChange(subscriber: (isDemoMode: boolean) => void): void;
}

/**
 * Hook interface
 */
export interface OperationModeHook {
  // État
  mode: OperationMode;
  switchReason: SwitchReason | null;
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
