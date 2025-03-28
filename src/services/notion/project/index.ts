
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
  notionPageToProject,
  mapStringToProjectStatus,
  isValidProjectStatus
} from './utils';

// Exporter les implémentations API
export {
  getAllProjectsNotionImplementation,
  getProjectByIdNotionImplementation,
  createProjectNotionImplementation,
  updateProjectNotionImplementation,
  deleteProjectNotionImplementation,
  mockGetProjects,
  mockCreateProject,
  mockUpdateProject,
  mockDeleteProject
} from './apiImplementations';
