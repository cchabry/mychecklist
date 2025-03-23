
/**
 * Types pour le service operationMode
 */

/**
 * Modes opérationnels possibles
 */
export enum OperationMode {
  REAL = 'real',
  DEMO = 'demo'
}

/**
 * Raison du changement de mode
 */
export type SwitchReason = string;

/**
 * Type de fonction de rappel pour les événements de mode opérationnel
 */
export type OperationModeSubscriber = (mode: OperationMode, reason: SwitchReason | null) => void;

/**
 * Paramètres du mode opérationnel
 */
export interface OperationModeSettings {
  /**
   * Afficher les indicateurs de mode opérationnel dans l'UI
   */
  showIndicators: boolean;
  
  /**
   * Afficher les détails du mode opérationnel
   */
  showDetails: boolean;
  
  /**
   * Afficher les notifications lors des changements de mode
   */
  showNotifications: boolean;
  
  /**
   * Basculer automatiquement en mode démo en cas d'erreur
   */
  autoSwitchOnFailure?: boolean;
  
  /**
   * Tentatives maximales avant de basculer en mode démo
   */
  maxConsecutiveFailures?: number;
  
  /**
   * Durée (en ms) entre les tentatives de reconnexion au mode réel
   */
  reconnectInterval?: number;
  
  /**
   * Utiliser le cache en mode réel
   * Si false, les données seront toujours rechargées depuis l'API
   */
  useCacheInRealMode?: boolean;
  
  /**
   * Persistance du mode opérationnel dans le stockage local
   */
  persistentModeStorage?: boolean;
  
  /**
   * Délai simulé pour les opérations réseau (en ms)
   */
  simulatedNetworkDelay?: number;
  
  /**
   * Taux d'erreurs simulées (en pourcentage)
   */
  errorSimulationRate?: number;
}

/**
 * État du mode opérationnel
 */
export interface OperationModeState {
  /**
   * Indique si le mode démo est actif
   */
  isDemoMode: boolean;
  
  /**
   * Raison pour laquelle le mode démo est activé (le cas échéant)
   */
  demoModeReason?: string;
  
  /**
   * Horodatage de l'activation du mode démo
   */
  demoModeActivatedAt?: number;
  
  /**
   * Nombre d'erreurs consécutives
   */
  consecutiveErrors: number;
  
  /**
   * Nombre de tentatives échouées
   */
  failedAttempts: number;
  
  /**
   * Dernières erreurs rencontrées
   */
  lastErrors: OperationModeError[];
}

/**
 * Structure d'une erreur enregistrée
 */
export interface OperationModeError {
  /**
   * Message d'erreur
   */
  message: string;
  
  /**
   * Contexte de l'erreur
   */
  context?: string;
  
  /**
   * Horodatage de l'erreur
   */
  timestamp: number;
}

/**
 * Options pour l'activation du mode démo
 */
export interface EnableDemoModeOptions {
  /**
   * Raison de l'activation du mode démo
   */
  reason?: string;
  
  /**
   * Afficher une notification à l'utilisateur
   */
  notify?: boolean;
  
  /**
   * Tentatives échouées à incrémenter
   */
  incrementFailedAttempts?: boolean;
  
  /**
   * Erreurs consécutives à incrémenter
   */
  incrementConsecutiveErrors?: boolean;
}

/**
 * Interface pour le service de mode opérationnel
 */
export interface IOperationModeService {
  readonly isDemoMode: boolean;
  readonly isRealMode: boolean;
  getMode(): OperationMode;
  getSwitchReason(): SwitchReason | null;
  getSettings(): OperationModeSettings;
  getConsecutiveFailures(): number;
  getLastError(): Error | null;
  subscribe(subscriber: OperationModeSubscriber): () => void;
  enableDemoMode(reason?: SwitchReason): void;
  enableRealMode(): void;
  toggle(): void;
  handleConnectionError(error: Error, context?: string): void;
  handleSuccessfulOperation(): void;
  updateSettings(partialSettings: Partial<OperationModeSettings>): void;
  reset(): void;
}

/**
 * Interface du hook useOperationMode
 */
export interface OperationModeHook {
  mode: OperationMode;
  switchReason: string | null;
  failures: number;
  lastError: Error | null;
  settings: OperationModeSettings;
  isDemoMode: boolean;
  isRealMode: boolean;
  enableDemoMode: (reason?: string) => void;
  enableRealMode: () => void;
  toggle: () => void;
  handleConnectionError: (error: Error, context?: string) => void;
  handleSuccessfulOperation: () => void;
  updateSettings: (settings: Partial<OperationModeSettings>) => void;
  reset: () => void;
}
