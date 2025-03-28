
/**
 * Point d'entrée pour le service de projets
 * 
 * Ce module centralise tous les exports liés aux projets
 */

// Exporter les services
export { projectService } from './projectService';
export { projectServiceImpl } from './ProjectServiceImpl';
export type { CreateProjectInput, UpdateProjectInput } from './ProjectServiceImpl';

// Exporter les utilitaires (si nécessaire)
// export * from './utils';

// Exporter les types (si nécessaire)
// export * from './types';
