
/**
 * Point d'entrée principal pour le système operationMode
 * Exporte le service et les hooks associés
 */

// Exporter le service
export { operationMode } from './operationModeService';

// Exporter le hook principal
export { useOperationMode } from './hooks/useOperationMode';

// Exporter les types
export type { 
  OperationModeSettings, 
  SwitchReason,
  IOperationModeService,
  OperationModeHook 
} from './types';

// Exporter l'énumération OperationMode directement pour simplifier l'usage
export { OperationMode } from './types';

// Exporter les utilitaires
export { operationModeUtils } from './utils';

// Exporter les constantes pour les personnes qui en ont besoin
export { DEFAULT_SETTINGS } from './constants';
