
/**
 * Types pour le mode d'opération
 */

/**
 * Mode d'opération de l'application
 */
export type OperationMode = 'real' | 'demo';

/**
 * État du mode d'opération
 */
export interface OperationModeState {
  /** Mode d'opération actuel */
  mode: OperationMode;
  /** Source du mode (manuel, auto, default) */
  source?: 'user' | 'auto' | 'default' | 'error';
  /** Raison du mode actuel */
  reason?: string;
  /** Horodatage du changement */
  timestamp?: string;
}

/**
 * Retour du hook useOperationMode
 */
export interface UseOperationMode {
  /** Mode d'opération actuel */
  mode: OperationMode;
  /** État complet du mode d'opération */
  state: OperationModeState;
  /** Si le mode est réel */
  isRealMode: boolean;
  /** Si le mode est démo */
  isDemoMode: boolean;
  /** Passer en mode réel */
  enableRealMode: (reason?: string) => void;
  /** Passer en mode démo */
  enableDemoMode: (reason: string) => void;
  /** Réinitialiser le mode */
  reset: () => void;
}
