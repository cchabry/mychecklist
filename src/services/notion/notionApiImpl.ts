/**
 * Implémentation complète de l'interface NotionAPI
 * Cet objet fournit une interface unifiée conforme à la définition NotionAPI
 */

import { NotionAPI, NotionTestResponse } from '@/types/api/notionApi';
import { 
  Project, 
  Audit, 
  ChecklistItem, 
  Exigence, 
  SamplePage, 
  Evaluation, 
  CorrectiveAction, 
  ActionProgress 
} from '@/types/domain';

import { notionService } from './notionService';
import { checklistService } from './checklistService';
import { exigenceService } from './exigenceService';
import { samplePageService } from './samplePageService';
import { auditService } from './auditService';
import { evaluationService } from './evaluationService';
import { actionService } from './action';
import { notionClient } from './notionClient';

/**
 * Implémentation complète de l'interface NotionAPI
 * qui délègue aux services spécialisés
 */
class NotionApiImplementation implements NotionAPI {
  // Méthodes pour les projets
  async getProjects(): Promise<Project[]> {
    const response = await notionService.getProjects();
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la récupération des projets");
    }
    return response.data || [];
  }
  
  async getProjectById(id: string): Promise<Project> {
    const response = await notionService.getProjectById(id);
    if (!response.success) {
      throw new Error(response.error?.message || `Projet #${id} non trouvé`);
    }
    return response.data as Project;
  }
  
  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const response = await notionService.createProject(project);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la création du projet");
    }
    return response.data as Project;
  }
  
  async updateProject(project: Project): Promise<Project> {
    const response = await notionService.updateProject(project.id, {
      name: project.name,
      url: project.url,
      description: project.description
    });
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la mise à jour du projet");
    }
    return response.data as Project;
  }
  
  async deleteProject(id: string): Promise<boolean> {
    const response = await notionService.deleteProject(id);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la suppression du projet");
    }
    return true;
  }
  
  // Méthodes pour les items de checklist
  async getChecklistItems(): Promise<ChecklistItem[]> {
    const response = await checklistService.getChecklistItems();
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la récupération des items de checklist");
    }
    return response.data || [];
  }
  
  async getChecklistItemById(id: string): Promise<ChecklistItem> {
    const response = await checklistService.getChecklistItemById(id);
    if (!response.success) {
      throw new Error(response.error?.message || `Item de checklist #${id} non trouvé`);
    }
    return response.data as ChecklistItem;
  }
  
  // Méthodes pour les exigences
  async getExigences(projectId: string): Promise<Exigence[]> {
    const response = await exigenceService.getExigences(projectId);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la récupération des exigences");
    }
    return response.data || [];
  }
  
  async getExigenceById(id: string): Promise<Exigence> {
    const response = await exigenceService.getExigenceById(id);
    if (!response.success) {
      throw new Error(response.error?.message || `Exigence #${id} non trouvée`);
    }
    return response.data as Exigence;
  }
  
  async createExigence(exigence: Omit<Exigence, 'id'>): Promise<Exigence> {
    const response = await exigenceService.createExigence(exigence);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la création de l'exigence");
    }
    return response.data as Exigence;
  }
  
  async updateExigence(exigence: Exigence): Promise<Exigence> {
    const response = await exigenceService.updateExigence(exigence);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la mise à jour de l'exigence");
    }
    return response.data as Exigence;
  }
  
  async deleteExigence(id: string): Promise<boolean> {
    const response = await exigenceService.deleteExigence(id);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la suppression de l'exigence");
    }
    return true;
  }
  
  // Méthodes pour les pages d'échantillon
  async getSamplePages(projectId: string): Promise<SamplePage[]> {
    const response = await samplePageService.getSamplePages(projectId);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la récupération des pages d'échantillon");
    }
    return response.data || [];
  }
  
  async getSamplePageById(id: string): Promise<SamplePage> {
    const response = await samplePageService.getSamplePageById(id);
    if (!response.success) {
      throw new Error(response.error?.message || `Page d'échantillon #${id} non trouvée`);
    }
    return response.data as SamplePage;
  }
  
  async createSamplePage(page: Omit<SamplePage, 'id'>): Promise<SamplePage> {
    const response = await samplePageService.createSamplePage(page);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la création de la page d'échantillon");
    }
    return response.data as SamplePage;
  }
  
  async updateSamplePage(page: SamplePage): Promise<SamplePage> {
    const response = await samplePageService.updateSamplePage(page);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la mise à jour de la page d'échantillon");
    }
    return response.data as SamplePage;
  }
  
  async deleteSamplePage(id: string): Promise<boolean> {
    const response = await samplePageService.deleteSamplePage(id);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la suppression de la page d'échantillon");
    }
    return true;
  }
  
  // Méthodes pour les audits
  async getAudits(projectId: string): Promise<Audit[]> {
    const response = await auditService.getAudits(projectId);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la récupération des audits");
    }
    return response.data || [];
  }
  
  async getAuditById(id: string): Promise<Audit> {
    const response = await auditService.getAuditById(id);
    if (!response.success) {
      throw new Error(response.error?.message || `Audit #${id} non trouvé`);
    }
    return response.data as Audit;
  }
  
  async createAudit(audit: Omit<Audit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Audit> {
    const response = await auditService.createAudit(audit);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la création de l'audit");
    }
    return response.data as Audit;
  }
  
  async updateAudit(audit: Audit): Promise<Audit> {
    const response = await auditService.updateAudit(audit);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la mise à jour de l'audit");
    }
    return response.data as Audit;
  }
  
  async deleteAudit(id: string): Promise<boolean> {
    const response = await auditService.deleteAudit(id);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la suppression de l'audit");
    }
    return true;
  }
  
  // Méthodes pour les évaluations
  async getEvaluations(auditId: string, pageId?: string, exigenceId?: string): Promise<Evaluation[]> {
    const response = await evaluationService.getEvaluations(auditId, pageId, exigenceId);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la récupération des évaluations");
    }
    return response.data || [];
  }
  
  async getEvaluationById(id: string): Promise<Evaluation> {
    const response = await evaluationService.getEvaluationById(id);
    if (!response.success) {
      throw new Error(response.error?.message || `Évaluation #${id} non trouvée`);
    }
    return response.data as Evaluation;
  }
  
  async createEvaluation(evaluation: Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Evaluation> {
    const response = await evaluationService.createEvaluation(evaluation);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la création de l'évaluation");
    }
    return response.data as Evaluation;
  }
  
  async updateEvaluation(evaluation: Evaluation): Promise<Evaluation> {
    const response = await evaluationService.updateEvaluation(evaluation);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la mise à jour de l'évaluation");
    }
    return response.data as Evaluation;
  }
  
  async deleteEvaluation(id: string): Promise<boolean> {
    const response = await evaluationService.deleteEvaluation(id);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la suppression de l'évaluation");
    }
    return true;
  }
  
  // Méthodes pour les actions correctives
  async getActions(evaluationId: string): Promise<CorrectiveAction[]> {
    const response = await actionService.getActionsByEvaluation(evaluationId);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la récupération des actions correctives");
    }
    return response.data || [];
  }
  
  async getActionById(id: string): Promise<CorrectiveAction> {
    const action = await actionService.getAction(id);
    if (!action) {
      throw new Error(`Action corrective #${id} non trouvée`);
    }
    return action;
  }
  
  async createAction(action: Omit<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'>): Promise<CorrectiveAction> {
    const response = await actionService.createAction(action);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la création de l'action corrective");
    }
    return response.data as CorrectiveAction;
  }
  
  async updateAction(action: CorrectiveAction): Promise<CorrectiveAction> {
    const response = await actionService.updateAction(action.id, {
      targetScore: action.targetScore,
      priority: action.priority,
      status: action.status,
      dueDate: action.dueDate,
      responsible: action.responsible,
      comment: action.comment
    });
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la mise à jour de l'action corrective");
    }
    return response.data as CorrectiveAction;
  }
  
  async deleteAction(id: string): Promise<boolean> {
    const response = await actionService.deleteAction(id);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la suppression de l'action corrective");
    }
    return response.data as boolean;
  }
  
  // Méthodes pour les suivis de progrès
  async getActionProgress(actionId: string): Promise<ActionProgress[]> {
    const response = await actionService.getActionProgress(actionId);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la récupération des suivis de progrès");
    }
    return response.data || [];
  }
  
  async getActionProgressById(id: string): Promise<ActionProgress> {
    const response = await actionService.getActionProgressById(id);
    if (!response.success) {
      throw new Error(response.error?.message || `Suivi de progrès #${id} non trouvé`);
    }
    return response.data as ActionProgress;
  }
  
  async createActionProgress(progress: Omit<ActionProgress, 'id'>): Promise<ActionProgress> {
    const response = await actionService.createActionProgress(progress);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la création du suivi de progrès");
    }
    return response.data as ActionProgress;
  }
  
  async updateActionProgress(progress: ActionProgress): Promise<ActionProgress> {
    const response = await actionService.updateActionProgress(progress);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la mise à jour du suivi de progrès");
    }
    return response.data as ActionProgress;
  }
  
  async deleteActionProgress(id: string): Promise<boolean> {
    const response = await actionService.deleteActionProgress(id);
    if (!response.success) {
      throw new Error(response.error?.message || "Erreur lors de la suppression du suivi de progrès");
    }
    return response.data as boolean;
  }
  
  // Méthode de test de connexion
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
}

// Exporter une instance singleton
export const notionApi = new NotionApiImplementation();

// Export par défaut
export default notionApi;
