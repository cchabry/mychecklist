
/**
 * Types pour le service de gestion du mode de connexion
 * Remplace le système operationMode avec une approche simplifiée
 */

/**
 * Modes de connexion disponibles
 */
export enum ConnectionMode {
  REAL = 'real',
  DEMO = 'demo'
}

/**
 * État de santé de la connexion
 */
export interface ConnectionHealth {
  lastError: Error | null;
  lastSuccess: Date | null;
  consecutiveErrors: number;
  healthyConnection: boolean;
}

/**
 * Options de configuration du mode de connexion
 */
export interface ConnectionModeOptions {
  /**
   * Persister le mode dans le localStorage
   */
  persistMode?: boolean;
  
  /**
   * Clé de stockage local pour le mode
   */
  storageKey?: string;
  
  /**
   * Nombre d'erreurs consécutives avant de considérer la connexion comme non saine
   */
  healthThreshold?: number;
}

/**
 * Événement de changement de mode
 */
export interface ModeChangeEvent {
  previousMode: ConnectionMode;
  currentMode: ConnectionMode;
  reason: string;
}

/**
 * Type pour les abonnés aux changements de mode
 */
export type ModeChangeSubscriber = (event: ModeChangeEvent) => void;
