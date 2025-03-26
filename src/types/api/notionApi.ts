
/**
 * Types pour l'API Notion
 */

import {
  Project,
  Audit,
  ChecklistItem,
  Exigence,
  SamplePage,
  Evaluation,
  CorrectiveAction,
  ActionProgress
} from '../domain';

/**
 * Résultat d'une opération API Notion
 */
export interface NotionAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    status?: number;
    details?: any;
  };
}

/**
 * Statut de connexion Notion
 */
export enum ConnectionStatus {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Error = 'error',
  Loading = 'loading'
}

/**
 * Utilisateur Notion
 */
export interface NotionUser {
  id: string;
  name: string;
  avatarUrl?: string;
  type: string;
}

/**
 * Réponse de test de connexion Notion
 */
export interface NotionTestResponse {
  user?: NotionUser;
  workspace?: string;
  timestamp: number;
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
  
  // Test de connexion
  testConnection(): Promise<NotionTestResponse>;
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
