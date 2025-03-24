
import { operationMode, operationModeUtils, useOperationMode } from '@/services/operationMode';
import { OperationMode, SwitchReason, OperationModeState, OperationModeHook, OperationModeSettings } from '@/services/operationMode/types';

// Exporter les objets et hooks principaux
export { operationMode, operationModeUtils, useOperationMode };

// Exporter les types
export type { OperationModeState, OperationModeHook, OperationModeSettings };

// Exporter les enums
export { OperationMode, SwitchReason };

// Exportation par défaut
export default {
  operationMode,
  operationModeUtils,
  useOperationMode,
};
