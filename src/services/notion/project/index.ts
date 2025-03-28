
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
  extractTextProperty,
  notionPageToProject
} from './utils';

// Exporter les implémentations API
export {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from './apiImplementations';

// Exporter les implémentations mock
export {
  getMockProjects,
  mockCreateProject,
  mockUpdateProject
} from './mockImplementations';

