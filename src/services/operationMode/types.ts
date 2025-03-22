
/**
 * Types pour le système de mode opérationnel
 */

/**
 * Types de mode de fonctionnement de l'application
 */
export enum OperationMode {
  /**
   * Mode réel - connexion directe à l'API Notion
   */
  REAL = 'real',
  
  /**
   * Mode démo - utilise des données fictives
   */
  DEMO = 'demo',
  
  /**
   * Mode transitoire - en cours de tentative de connexion
   */
  TRANSITIONING = 'transitioning'
}

/**
 * Paramètres de configuration du mode opérationnel
 */
export interface OperationModeSettings {
  autoSwitch: boolean;     // Basculement automatique vers le mode démo en cas d'erreur
  notifyOnSwitch: boolean; // Notification lors du basculement automatique
  persistMode: boolean;    // Mémoriser le mode entre les sessions
  autoFallbackEnabled: boolean; // Pour la compatibilité avec le code existant
}

/**
 * État du mode opérationnel
 */
export interface OperationModeState {
  mode: OperationMode;
  switchReason: string | null;
  consecutiveFailures: number;
  lastError: Error | null;
  failures: number; // Pour la compatibilité avec le code existant
}

/**
 * Paramètres par défaut du mode opérationnel
 */
export const defaultSettings: OperationModeSettings = {
  autoSwitch: true,
  notifyOnSwitch: true,
  persistMode: true,
  autoFallbackEnabled: true
};
