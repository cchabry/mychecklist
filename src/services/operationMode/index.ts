
/**
 * Point d'entrée pour le module OperationMode
 * Expose les types et fonctions principales
 */

import { operationMode } from './operationModeAdapter';
import { 
  OperationMode, 
  OperationModeSettings, 
  OperationModeHook, 
  SwitchReason 
} from './types';
import { DEFAULT_SETTINGS } from './constants';

// Utilitaires pour le mode opérationnel
const operationModeUtils = {
  isAutoSwitchEnabled: (): boolean => {
    return operationMode.settings.autoSwitchToDemo;
  },
  getFailureThreshold: (): number => {
    return operationMode.settings.errorThreshold;
  }
};

export {
  operationMode,
  operationModeUtils,
  OperationMode,
  OperationModeSettings,
  OperationModeHook,
  SwitchReason,
  DEFAULT_SETTINGS
};
