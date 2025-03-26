
/**
 * Types pour l'API et les opérations de requête
 */

import { Project, Audit, ChecklistItem, Exigence, SamplePage, Evaluation, CorrectiveAction, ActionProgress } from '../domain/models';

/**
 * Options pour les requêtes API
 */
export interface ApiRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
  cache?: RequestCache;
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

/**
 * Options communes pour les hooks d'API
 */
export interface QueryOptions<TData = any> {
  enabled?: boolean;
  cacheTime?: number;
  staleTime?: number;
  refetchInterval?: number | false;
  refetchOnWindowFocus?: boolean;
  retry?: boolean | number;
  retryDelay?: number;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  onSettled?: (data: TData | undefined, error: Error | null) => void;
}

/**
 * Interface unifiée pour l'API Notion
 */
export interface NotionAPI {
  // Projets
  getProjects(): Promise<Project[]>;
  getProjectById(id: string): Promise<Project>;
  createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project>;
  updateProject(project: Project): Promise<Project>;
  deleteProject(id: string): Promise<boolean>;
  
  // Checklists
  getChecklistItems(): Promise<ChecklistItem[]>;
  getChecklistItemById(id: string): Promise<ChecklistItem>;
  
  // Exigences
  getExigences(projectId: string): Promise<Exigence[]>;
  getExigenceById(id: string): Promise<Exigence>;
  createExigence(exigence: Omit<Exigence, 'id'>): Promise<Exigence>;
  updateExigence(exigence: Exigence): Promise<Exigence>;
  deleteExigence(id: string): Promise<boolean>;
  
  // Échantillons de pages
  getSamplePages(projectId: string): Promise<SamplePage[]>;
  getSamplePageById(id: string): Promise<SamplePage>;
  createSamplePage(page: Omit<SamplePage, 'id'>): Promise<SamplePage>;
  updateSamplePage(page: SamplePage): Promise<SamplePage>;
  deleteSamplePage(id: string): Promise<boolean>;
  
  // Audits
  getAudits(projectId: string): Promise<Audit[]>;
  getAuditById(id: string): Promise<Audit>;
  createAudit(audit: Omit<Audit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Audit>;
  updateAudit(audit: Audit): Promise<Audit>;
  deleteAudit(id: string): Promise<boolean>;
  
  // Évaluations
  getEvaluations(auditId: string, pageId?: string, exigenceId?: string): Promise<Evaluation[]>;
  getEvaluationById(id: string): Promise<Evaluation>;
  createEvaluation(evaluation: Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Evaluation>;
  updateEvaluation(evaluation: Evaluation): Promise<Evaluation>;
  deleteEvaluation(id: string): Promise<boolean>;
  
  // Actions correctives
  getActions(evaluationId: string): Promise<CorrectiveAction[]>;
  getActionById(id: string): Promise<CorrectiveAction>;
  createAction(action: Omit<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'>): Promise<CorrectiveAction>;
  updateAction(action: CorrectiveAction): Promise<CorrectiveAction>;
  deleteAction(id: string): Promise<boolean>;
  
  // Progrès d'actions
  getActionProgress(actionId: string): Promise<ActionProgress[]>;
  getActionProgressById(id: string): Promise<ActionProgress>;
  createActionProgress(progress: Omit<ActionProgress, 'id'>): Promise<ActionProgress>;
  updateActionProgress(progress: ActionProgress): Promise<ActionProgress>;
  deleteActionProgress(id: string): Promise<boolean>;
}

/**
 * Options de configuration pour l'API Notion
 */
export interface NotionAPIOptions {
  apiKey?: string;
  databaseId?: string;
  checklistsDbId?: string;
  projectsDbId?: string;
  auditsDbId?: string;
  pagesDbId?: string;
  exigencesDbId?: string;
  evaluationsDbId?: string;
  actionsDbId?: string;
  progressDbId?: string;
  mockMode?: boolean;
  debug?: boolean;
}
