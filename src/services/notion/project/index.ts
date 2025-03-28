/**
 * Point d'entrée pour le service de projets
 * 
 * Ce module centralise tous les exports liés aux projets
 */

// Exporter les services
export { projectService } from './projectService';
export { projectServiceImpl } from './ProjectServiceImpl';

// Exporter les types
export type { CreateProjectInput, UpdateProjectInput } from './types';

// Exporter les utilitaires
export { 
  notionPageToProject
} from './utils';

// Note: Nous avons supprimé les exportations manquantes qui causaient des erreurs
