
import { OperationModeSettings } from './types';

/**
 * Paramètres par défaut du service de mode opérationnel
 */
export const DEFAULT_SETTINGS: OperationModeSettings = {
  maxConsecutiveFailures: 3,
  autoSwitchOnFailure: true,
  persistentModeStorage: true,
  notificationDuration: 5000
};

/**
 * Clés de stockage local pour le mode opérationnel
 */
export const STORAGE_KEYS = {
  MODE: 'operation_mode',
  REASON: 'operation_mode_reason'
};
