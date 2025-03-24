
import { OperationModeSettings } from './types';

export const DEFAULT_SETTINGS: OperationModeSettings = {
  // Paramètres comportementaux
  autoSwitchOnFailure: true,
  persistentModeStorage: true,
  showNotifications: true,
  
  // Paramètres de simulation
  errorSimulationRate: 20,
  simulatedNetworkDelay: 800,
  
  // Paramètres de sécurité
  maxConsecutiveFailures: 3
};
