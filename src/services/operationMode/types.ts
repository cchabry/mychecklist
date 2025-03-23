
/**
 * Types pour le service operationMode
 */

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
  autoSwitchOnError: boolean;
  
  /**
   * Tentatives maximales avant de basculer en mode démo
   */
  maxRetryAttempts: number;
  
  /**
   * Seuil d'erreurs consécutives avant de basculer en mode démo
   */
  errorThreshold: number;
  
  /**
   * Durée (en ms) entre les tentatives de reconnexion au mode réel
   */
  reconnectInterval: number;
  
  /**
   * Utiliser le cache en mode réel
   * Si false, les données seront toujours rechargées depuis l'API
   */
  useCacheInRealMode?: boolean;
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
