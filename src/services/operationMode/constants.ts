
import { OperationModeSettings } from './types';

/**
 * Paramètres par défaut du service de mode opérationnel
 */
export const DEFAULT_SETTINGS: OperationModeSettings = {
  maxConsecutiveFailures: 3,
  autoSwitchOnFailure: true,
  persistentModeStorage: true,
  notificationDuration: 5000,
  simulatedNetworkDelay: 500,
  errorSimulationRate: 0
};

/**
 * Clés de stockage local pour le mode opérationnel
 */
export const STORAGE_KEYS = {
  MODE: 'operation_mode',
  REASON: 'operation_mode_reason',
  SETTINGS: 'operation_mode_settings'
};

/**
 * Messages standards utilisés par le service
 */
export const MESSAGES = {
  MANUAL_ACTIVATION: 'Mode démo activé manuellement',
  CONNECTION_ERROR: 'Erreur de connexion à Notion',
  AUTO_SWITCH: (failures: number) => `Basculement automatique après ${failures} échecs consécutifs`
};
