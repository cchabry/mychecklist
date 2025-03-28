
/**
 * Service Notion
 * Ce service expose les méthodes de haut niveau pour interagir avec l'API Notion
 */

import { notionBaseService } from './notionBaseService';
import { projectService } from './project/projectService';
import { exigenceServiceImpl } from './exigence/ExigenceServiceImpl';
import { samplePageServiceImpl } from './samplePage/SamplePageServiceImpl';

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
  
  // ---- Méthodes standardisées ----
  
  // Projets
  getProjectsAll = projectService.getAll.bind(projectService);
  getProjectByIdStd = projectService.getById.bind(projectService);
  createProjectStd = projectService.create.bind(projectService);
  updateProjectStd = projectService.update.bind(projectService);
  deleteProjectStd = projectService.delete.bind(projectService);
  
  // Exigences
  getExigences = exigenceServiceImpl.getExigences.bind(exigenceServiceImpl);
  getExigenceById = exigenceServiceImpl.getExigenceById.bind(exigenceServiceImpl);
  createExigence = exigenceServiceImpl.createExigence.bind(exigenceServiceImpl);
  updateExigence = exigenceServiceImpl.updateExigence.bind(exigenceServiceImpl);
  deleteExigence = exigenceServiceImpl.deleteExigence.bind(exigenceServiceImpl);
  
  // Pages d'échantillon
  getSamplePages = samplePageServiceImpl.getSamplePages.bind(samplePageServiceImpl);
  getSamplePageById = samplePageServiceImpl.getSamplePageById.bind(samplePageServiceImpl);
  createSamplePage = samplePageServiceImpl.createSamplePage.bind(samplePageServiceImpl);
  updateSamplePage = samplePageServiceImpl.updateSamplePage.bind(samplePageServiceImpl);
  deleteSamplePage = samplePageServiceImpl.deleteSamplePage.bind(samplePageServiceImpl);
}

// Exporter une instance singleton
export const notionService = new NotionService();

// Export par défaut
export default notionService;
