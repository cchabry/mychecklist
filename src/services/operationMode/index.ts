
/**
 * Point d'entrée principal pour le système operationMode
 * Exporte le service et les hooks associés
 */

// Exporter le service
export { operationMode } from './operationModeService';

// Exporter le hook principal
export { useOperationMode } from './hooks/useOperationMode';

// Exporter les types
export type { OperationModeType } from './operationModeService';

// Exporter l'énumération OperationMode directement pour simplifier l'usage
export enum OperationMode {
  REAL = 'real',
  DEMO = 'demo',
  AUTO = 'auto'
}

// Exporter les utilitaires
export { operationModeUtils } from './utils';
