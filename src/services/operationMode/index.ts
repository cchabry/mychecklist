
/**
 * Point d'entrée pour le système de mode opérationnel (demo vs real)
 * 
 * Cette version utilise maintenant un adaptateur pour assurer la compatibilité 
 * avec le nouveau système connectionModeService
 */

// Exporter l'adaptateur comme remplaçant du service operationMode
import { operationMode } from './operationModeAdapter';
export { operationMode };

// Exporter les constantes et types
export * from './constants';
export * from './types';

// Exporter les utilitaires pour compatibilité avec les imports existants
import { operationModeUtils } from './utils';
export { operationModeUtils };

// Hook pour utiliser le mode opérationnel
export { useOperationMode } from './useOperationMode';

// Exporter également l'énumération OperationMode pour les imports qui en ont besoin
export { OperationMode } from './types';
