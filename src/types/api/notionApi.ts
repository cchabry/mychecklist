
/**
 * Types pour l'API Notion
 */

import {
  Project,
  ChecklistItem,
  Exigence,
  SamplePage,
  Audit,
  Evaluation,
  CorrectiveAction,
  ActionProgress
} from '../domain';

/**
 * Interface unifiée pour l'API Notion
 */
export interface NotionAPI {
  // Projets
  getProjects(): Promise<Project[]>;
  getProjectById(id: string): Promise<Project>;
  createProject(project: Omit<Project, 'id'>): Promise<Project>;
  updateProject(project: Project): Promise<Project>;
  
  // Checklists
  getChecklistItems(): Promise<ChecklistItem[]>;
  
  // Exigences
  getExigences(projectId: string): Promise<Exigence[]>;
  updateExigence(exigence: Exigence): Promise<Exigence>;
  
  // Échantillons de pages
  getSamplePages(projectId: string): Promise<SamplePage[]>;
  addSamplePage(page: Omit<SamplePage, 'id'>): Promise<SamplePage>;
  
  // Audits
  getAudits(projectId: string): Promise<Audit[]>;
  createAudit(audit: Omit<Audit, 'id'>): Promise<Audit>;
  
  // Évaluations
  getEvaluations(auditId: string): Promise<Evaluation[]>;
  updateEvaluation(evaluation: Evaluation): Promise<Evaluation>;
  
  // Actions correctives
  getActions(evaluationId: string): Promise<CorrectiveAction[]>;
  updateAction(action: CorrectiveAction): Promise<CorrectiveAction>;
  
  // Progrès
  getActionProgress(actionId: string): Promise<ActionProgress[]>;
  addActionProgress(progress: Omit<ActionProgress, 'id'>): Promise<ActionProgress>;
}

/**
 * Options de configuration pour l'API Notion
 */
export interface NotionAPIOptions {
  apiKey?: string;
  databaseId?: string;
  checklistsDbId?: string;
  mockMode?: boolean;
  debug?: boolean;
}

/**
 * Résultat d'une opération API
 */
export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}
