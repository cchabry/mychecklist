
import { OperationModeSettings } from './types';

/**
 * Clés de stockage pour le mode opérationnel
 */
export const STORAGE_KEYS = {
  MODE: 'operation_mode',
  REASON: 'operation_mode_reason',
  SETTINGS: 'operation_mode_settings'
};

/**
 * Paramètres par défaut du mode opérationnel
 */
export const DEFAULT_SETTINGS: OperationModeSettings = {
  showIndicators: true,
  showDetails: true,
  showNotifications: true,
  autoSwitchOnFailure: true,
  maxConsecutiveFailures: 3,
  reconnectInterval: 60 * 1000, // 1 minute
  useCacheInRealMode: true,
  persistentModeStorage: true,
  simulatedNetworkDelay: 300, // 300ms
  errorSimulationRate: 0
};
