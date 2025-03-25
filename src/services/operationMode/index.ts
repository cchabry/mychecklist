
/**
 * Point d'entrée pour le système de mode opérationnel (demo vs real)
 * 
 * Cette version utilise maintenant un adaptateur pour assurer la compatibilité 
 * avec le nouveau système connectionModeService
 */

// Exporter l'adaptateur comme remplaçant du service operationMode
export { operationMode } from './operationModeAdapter';

// Exporter les constantes et types
export * from './constants';
export * from './types';

// Hook pour utiliser le mode opérationnel
export { useOperationMode } from './useOperationMode';
