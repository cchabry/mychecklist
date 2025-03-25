
/**
 * Point d'entrée pour le système de mode opérationnel (demo vs real)
 */

// Exporter le service principal
export { operationMode } from './operationModeService';

// Exporter les constantes et types
export * from './constants';
export * from './types';

// Hook pour utiliser le mode opérationnel
export { useOperationMode } from './useOperationMode';
