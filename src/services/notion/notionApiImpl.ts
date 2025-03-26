
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

  // Projets
  getProjects = projectsApi.getProjects;
  getProjectById = projectsApi.getProjectById;
  createProject = projectsApi.createProject;
  updateProject = projectsApi.updateProject;
  deleteProject = projectsApi.deleteProject;
  
  // Audits
  getAudits = auditsApi.getAudits;
  getAuditById = auditsApi.getAuditById;
  createAudit = auditsApi.createAudit;
  updateAudit = auditsApi.updateAudit;
  deleteAudit = auditsApi.deleteAudit;
  
  // Checklist
  getChecklistItems = checklistsApi.getChecklistItems;
  getChecklistItemById = checklistsApi.getChecklistItemById;
  
  // Exigences
  getExigences = exigencesApi.getExigences;
  getExigenceById = exigencesApi.getExigenceById;
  createExigence = exigencesApi.createExigence;
  updateExigence = exigencesApi.updateExigence;
  deleteExigence = exigencesApi.deleteExigence;
  
  // Pages d'échantillon
  getSamplePages = samplePagesApi.getSamplePages;
  getSamplePageById = samplePagesApi.getSamplePageById;
  createSamplePage = samplePagesApi.createSamplePage;
  updateSamplePage = samplePagesApi.updateSamplePage;
  deleteSamplePage = samplePagesApi.deleteSamplePage;
  
  // Évaluations
  getEvaluations = evaluationsApi.getEvaluations;
  getEvaluationById = evaluationsApi.getEvaluationById;
  createEvaluation = evaluationsApi.createEvaluation;
  updateEvaluation = evaluationsApi.updateEvaluation;
  deleteEvaluation = evaluationsApi.deleteEvaluation;
  
  // Actions correctives
  getActions = actionsApi.getActions;
  getActionById = actionsApi.getActionById;
  createAction = actionsApi.createAction;
  updateAction = actionsApi.updateAction;
  deleteAction = actionsApi.deleteAction;
  
  // Progrès d'actions
  getActionProgress = actionsApi.getActionProgress;
  getActionProgressById = actionsApi.getActionProgressById;
  createActionProgress = actionsApi.createActionProgress;
  updateActionProgress = actionsApi.updateActionProgress;
  deleteActionProgress = actionsApi.deleteActionProgress;
}

// Exporter une instance singleton
export const notionApi = new NotionApiImplementation();

// Export par défaut
export default notionApi;
