
/**
 * Point d'entrée central pour les services d'API
 */

// Exporter les services spécifiques
export { projectsService } from './projectsService';
export { auditsService } from './auditsService';
export { pagesService } from './pagesService';
export { checklistService } from './checklistService';
export { exigencesService } from './exigencesService';

// Exporter les types
export * from './types';

// Exporter la classe de base pour permettre l'extension
export { BaseService } from './baseService';
