
import { operationModeService } from './operationModeService';
import { useOperationMode } from './useOperationMode';
import { OperationMode } from './types';

// Réexporter les types avec le mot-clé "type" pour éviter les erreurs TS1205
export { OperationMode };
export type { OperationModeSettings, OperationModeState } from './types';

// Exporter le hook
export { useOperationMode };

// Créer et exporter un objet avec toutes les méthodes et propriétés du service,
// pour plus de commodité et rétrocompatibilité avec le code existant
export const operationMode = {
  // Propriétés d'état
  get mode() { return operationModeService.mode; },
  get isDemoMode() { return operationModeService.isDemoMode; },
  get isRealMode() { return operationModeService.isRealMode; },
  get switchReason() { return operationModeService.switchReason; },
  get lastError() { return operationModeService.lastError; },
  get failures() { return operationModeService.failures; },
  
  // Actions
  enableDemoMode: operationModeService.enableDemoMode,
  enableRealMode: operationModeService.enableRealMode,
  toggle: operationModeService.toggle,
  handleConnectionError: operationModeService.handleConnectionError,
  handleSuccessfulOperation: operationModeService.handleSuccessfulOperation,
  
  // Gestion des paramètres
  get settings() { return operationModeService.settings; },
  updateSettings: operationModeService.updateSettings,
  
  // Abonnement aux changements
  subscribe: operationModeService.subscribe
};
