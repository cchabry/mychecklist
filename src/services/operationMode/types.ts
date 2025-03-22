
/**
 * Types pour le service de mode opérationnel
 */

// Énumération des modes opérationnels
export enum OperationMode {
  REAL = 'real',
  DEMO = 'demo',
  TRANSITIONING = 'transitioning'
}

// État du mode opérationnel
export interface OperationModeState {
  mode: OperationMode;
  switchReason: string | null;
  consecutiveFailures: number;
  lastError: Error | null;
  failures: number; // Nombre total d'échecs
}

// Paramètres du mode opérationnel
export interface OperationModeSettings {
  autoSwitch: boolean;          // Bascule automatique en mode démo en cas d'échec
  autoFallbackEnabled: boolean; // Synonyme de autoSwitch pour compatibilité
  persistMode: boolean;         // Conserver le mode entre les sessions
  switchThreshold: number;      // Nombre d'échecs consécutifs avant bascule
  showNotifications: boolean;   // Afficher des notifications lors des changements de mode
}

// Paramètres par défaut
export const defaultSettings: OperationModeSettings = {
  autoSwitch: true,
  autoFallbackEnabled: true,
  persistMode: true,
  switchThreshold: 2,
  showNotifications: true
};
