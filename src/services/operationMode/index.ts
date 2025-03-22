
import { operationModeService } from './operationModeService';
import { useOperationMode } from './useOperationMode';
import { OperationMode, OperationModeSettings, OperationModeState } from './types';

// Exporter pour rétrocompatibilité avec le code existant
export const operationMode = operationModeService;

// Exporter tous les modules et types
export {
  useOperationMode,
  OperationMode,
  OperationModeSettings,
  OperationModeState
};
