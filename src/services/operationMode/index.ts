
/**
 * Point d'entrée principal pour le système operationMode
 * Exporte le service et les hooks associés
 */

// Exporter les types
export { OperationMode } from './types';
export type { OperationModeType } from './operationModeService';

// Exporter le service
export { operationMode } from './operationModeService';

// Exporter le hook principal
export { useOperationMode } from './hooks/useOperationMode';

// Exporter les utilitaires
export { operationModeUtils } from './utils';
