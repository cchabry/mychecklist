
/**
 * Point d'entrée principal pour le système operationMode
 * Exporte le service et les hooks associés
 */

export { operationMode } from './operationModeService';
export { useOperationMode } from './hooks/useOperationMode';
export type { OperationMode, OperationModeSettings, SwitchReason } from './types';

// Réexporter les utilitaires
export { operationModeUtils } from './utils';
