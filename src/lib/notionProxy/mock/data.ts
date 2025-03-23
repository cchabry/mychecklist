
import { 
  ActionPriority, ActionProgress, ActionStatus, 
  ComplianceStatus, CorrectiveAction, Evaluation, 
  Exigence, ImportanceLevel, SamplePage 
} from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Module fournissant des données mock pour les endpoints de l'API Notion
 */
export const mockData = {
  /**
   * Récupère toutes les actions correctives
   */
  getActions(): CorrectiveAction[] {
    // Importer depuis le module central de mock
    return require('@/lib/mockData').mockActions;
  },

  /**
   * Récupère une action corrective par son ID
   */
  getAction(id: string): CorrectiveAction | null {
    const actions = this.getActions();
    return actions.find(action => action.id === id) || null;
  },

  /**
   * Crée une nouvelle action corrective
   */
  createAction(data: Partial<CorrectiveAction>): CorrectiveAction {
    const now = new Date().toISOString();
    const newAction: CorrectiveAction = {
      id: `action-${uuidv4()}`,
      evaluationId: data.evaluationId || '',
      pageId: data.pageId || '',
      targetScore: data.targetScore || ComplianceStatus.Compliant,
      priority: data.priority || ActionPriority.Medium,
      dueDate: data.dueDate || '',
      responsible: data.responsible || '',
      comment: data.comment || '',
      status: data.status || ActionStatus.ToDo,
      progress: data.progress || [],
      createdAt: now,
      updatedAt: now
    };

    // Ajouter à la liste des actions
    const actions = this.getActions();
    actions.push(newAction);

    return newAction;
  },

  /**
   * Met à jour une action corrective
   */
  updateAction(id: string, data: Partial<CorrectiveAction>): CorrectiveAction {
    const actions = this.getActions();
    const actionIndex = actions.findIndex(action => action.id === id);

    if (actionIndex === -1) {
      throw new Error(`Action corrective non trouvée: ${id}`);
    }

    const updatedAction = {
      ...actions[actionIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };

    actions[actionIndex] = updatedAction;
    return updatedAction;
  },

  /**
   * Supprime une action corrective
   */
  deleteAction(id: string): boolean {
    const actions = this.getActions();
    const actionIndex = actions.findIndex(action => action.id === id);

    if (actionIndex === -1) {
      return false;
    }

    actions.splice(actionIndex, 1);
    return true;
  },

  /**
   * Récupère toutes les évaluations
   */
  getEvaluations(): Evaluation[] {
    return require('@/lib/mockData').mockEvaluations;
  },

  /**
   * Récupère une évaluation par son ID
   */
  getEvaluation(id: string): Evaluation | null {
    const evaluations = this.getEvaluations();
    return evaluations.find(evaluation => evaluation.id === id) || null;
  },

  /**
   * Crée une nouvelle évaluation
   */
  createEvaluation(data: Partial<Evaluation>): Evaluation {
    const now = new Date().toISOString();
    const newEvaluation: Evaluation = {
      id: `eval-${uuidv4()}`,
      auditId: data.auditId || '',
      pageId: data.pageId || '',
      exigenceId: data.exigenceId || '',
      score: data.score || ComplianceStatus.NotEvaluated,
      comment: data.comment || '',
      attachments: data.attachments || [],
      createdAt: now,
      updatedAt: now
    };

    const evaluations = this.getEvaluations();
    evaluations.push(newEvaluation);

    return newEvaluation;
  },

  /**
   * Met à jour une évaluation
   */
  updateEvaluation(id: string, data: Partial<Evaluation>): Evaluation {
    const evaluations = this.getEvaluations();
    const evaluationIndex = evaluations.findIndex(evaluation => evaluation.id === id);

    if (evaluationIndex === -1) {
      throw new Error(`Évaluation non trouvée: ${id}`);
    }

    const updatedEvaluation = {
      ...evaluations[evaluationIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };

    evaluations[evaluationIndex] = updatedEvaluation;
    return updatedEvaluation;
  },

  /**
   * Supprime une évaluation
   */
  deleteEvaluation(id: string): boolean {
    const evaluations = this.getEvaluations();
    const evaluationIndex = evaluations.findIndex(evaluation => evaluation.id === id);

    if (evaluationIndex === -1) {
      return false;
    }

    evaluations.splice(evaluationIndex, 1);
    return true;
  },

  /**
   * Récupère des exigences par projet
   */
  getExigencesByProject(projectId: string): Exigence[] {
    const exigences = require('@/lib/mockData').mockExigences;
    return exigences.filter(exigence => exigence.projectId === projectId);
  },

  /**
   * Crée une nouvelle exigence
   */
  createExigence(data: Partial<Exigence>): Exigence {
    const newExigence: Exigence = {
      id: `exigence-${uuidv4()}`,
      projectId: data.projectId || '',
      itemId: data.itemId || '',
      importance: data.importance || ImportanceLevel.Medium,
      comment: data.comment || ''
    };

    const exigences = require('@/lib/mockData').mockExigences;
    exigences.push(newExigence);

    return newExigence;
  },

  /**
   * Récupère des pages d'échantillon par projet
   */
  getSamplePagesByProject(projectId: string): SamplePage[] {
    const pages = require('@/lib/mockData').mockPages;
    return pages.filter(page => page.projectId === projectId);
  }
};
