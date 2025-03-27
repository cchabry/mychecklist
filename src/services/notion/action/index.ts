
/**
 * Point d'entrée pour les services d'actions correctives
 * 
 * Ce module centralise tous les services, utilitaires et types liés aux actions correctives.
 * Il facilite l'accès aux fonctionnalités d'actions depuis d'autres parties de l'application.
 */

// Exporter le service principal d'action
export { actionService } from './actionService';

// Exporter le service de progrès
export { progressService } from './progressService';

// Exporter les mappeurs
export { actionMappers } from './actionMappers';
export { progressMappers } from './progressMappers';

// Exporter les utilitaires pour la génération et manipulation des actions
export * from './utils';

// Exporter les types spécifiques aux actions
export * from './types';
