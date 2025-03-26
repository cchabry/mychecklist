
/**
 * Implémentation complète de l'interface NotionAPI
 * Cet objet fournit une interface unifiée conforme à la définition NotionAPI
 */

import { NotionAPI, NotionTestResponse } from '@/types/api/notionApi';
import { notionClient } from './notionClient';

// Import des APIs spécifiques à chaque domaine
import {
  projectsApi,
  auditsApi,
  checklistsApi,
  exigencesApi,
  samplePagesApi,
  evaluationsApi,
  actionsApi
} from './api';

/**
 * Implémentation de l'API Notion qui délègue aux APIs spécifiques à chaque domaine
 */
class NotionApiImplementation implements NotionAPI {
  // Test de connexion
  async testConnection(): Promise<NotionTestResponse> {
    const response = await notionClient.testConnection();
    
    if (!response.success) {
      throw new Error(response.error || "Erreur lors du test de connexion");
    }
    
    return {
      user: { 
        id: "user-id", 
        name: response.user || "Utilisateur Notion", 
        type: "person" 
      },
      workspace: response.workspaceName || "Workspace Notion",
      timestamp: Date.now()
    };
  }

  // === Délégation vers les APIs spécifiques ===

  // Projets
  getProjects = projectsApi.getProjects.bind(projectsApi);
  getProjectById = projectsApi.getProjectById.bind(projectsApi);
  createProject = projectsApi.createProject.bind(projectsApi);
  updateProject = projectsApi.updateProject.bind(projectsApi);
  deleteProject = projectsApi.deleteProject.bind(projectsApi);
  
  // Audits
  getAudits = auditsApi.getAudits.bind(auditsApi);
  getAuditById = auditsApi.getAuditById.bind(auditsApi);
  createAudit = auditsApi.createAudit.bind(auditsApi);
  updateAudit = auditsApi.updateAudit.bind(auditsApi);
  deleteAudit = auditsApi.deleteAudit.bind(auditsApi);
  
  // Checklist
  getChecklistItems = checklistsApi.getChecklistItems.bind(checklistsApi);
  getChecklistItemById = checklistsApi.getChecklistItemById.bind(checklistsApi);
  
  // Exigences
  getExigences = exigencesApi.getExigences.bind(exigencesApi);
  getExigenceById = exigencesApi.getExigenceById.bind(exigencesApi);
  createExigence = exigencesApi.createExigence.bind(exigencesApi);
  updateExigence = exigencesApi.updateExigence.bind(exigencesApi);
  deleteExigence = exigencesApi.deleteExigence.bind(exigencesApi);
  
  // Pages d'échantillon
  getSamplePages = samplePagesApi.getSamplePages.bind(samplePagesApi);
  getSamplePageById = samplePagesApi.getSamplePageById.bind(samplePagesApi);
  createSamplePage = samplePagesApi.createSamplePage.bind(samplePagesApi);
  updateSamplePage = samplePagesApi.updateSamplePage.bind(samplePagesApi);
  deleteSamplePage = samplePagesApi.deleteSamplePage.bind(samplePagesApi);
  
  // Évaluations
  getEvaluations = evaluationsApi.getEvaluations.bind(evaluationsApi);
  getEvaluationById = evaluationsApi.getEvaluationById.bind(evaluationsApi);
  createEvaluation = evaluationsApi.createEvaluation.bind(evaluationsApi);
  updateEvaluation = evaluationsApi.updateEvaluation.bind(evaluationsApi);
  deleteEvaluation = evaluationsApi.deleteEvaluation.bind(evaluationsApi);
  
  // Actions correctives
  getActions = actionsApi.getActions.bind(actionsApi);
  getActionById = actionsApi.getActionById.bind(actionsApi);
  createAction = actionsApi.createAction.bind(actionsApi);
  updateAction = actionsApi.updateAction.bind(actionsApi);
  deleteAction = actionsApi.deleteAction.bind(actionsApi);
  
  // Progrès d'actions
  getActionProgress = actionsApi.getActionProgress.bind(actionsApi);
  getActionProgressById = actionsApi.getActionProgressById.bind(actionsApi);
  createActionProgress = actionsApi.createActionProgress.bind(actionsApi);
  updateActionProgress = actionsApi.updateActionProgress.bind(actionsApi);
  deleteActionProgress = actionsApi.deleteActionProgress.bind(actionsApi);
}

// Exporter une instance singleton
export const notionApi = new NotionApiImplementation();

// Export par défaut
export default notionApi;
