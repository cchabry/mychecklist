
/**
 * Service Notion
 * Ce service expose les méthodes de haut niveau pour interagir avec l'API Notion
 */

import { notionBaseService } from './notionBaseService';
import { projectService } from './project/projectService';

/**
 * Façade unifiant les différents services Notion
 */
class NotionService {
  // Déléguer les méthodes de base au service de base
  configure = notionBaseService.configure.bind(notionBaseService);
  isConfigured = notionBaseService.isConfigured.bind(notionBaseService);
  getConfig = notionBaseService.getConfig.bind(notionBaseService);
  setMockMode = notionBaseService.setMockMode.bind(notionBaseService);
  isMockMode = notionBaseService.isMockMode.bind(notionBaseService);
  testConnection = notionBaseService.testConnection.bind(notionBaseService);
  
  // Méthodes liées aux projets
  getProjects = projectService.getProjects.bind(projectService);
  getProjectById = projectService.getProjectById.bind(projectService);
  createProject = projectService.createProject.bind(projectService);
  updateProject = projectService.updateProject.bind(projectService);
  deleteProject = projectService.deleteProject.bind(projectService);
}

// Exporter une instance singleton
export const notionService = new NotionService();

// Export par défaut
export default notionService;
