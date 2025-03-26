
/**
 * Types relatifs aux API et aux services
 */

import { 
  Project, 
  Audit, 
  ChecklistItem, 
  Exigence, 
  SamplePage, 
  Evaluation, 
  CorrectiveAction, 
  Progress 
} from '../domain';

// Interfaces pour les services API
export interface ApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  context?: any;
}

// Interfaces pour les requêtes
export interface ProjectCreateRequest {
  name: string;
  url: string;
}

export interface ProjectUpdateRequest {
  name?: string;
  url?: string;
  progress?: number;
}

export interface AuditCreateRequest {
  projectId: string;
  name: string;
}

export interface ExigenceCreateRequest {
  projectId: string;
  itemId: string;
  importance: 'N/A' | 'mineur' | 'moyen' | 'important' | 'majeur';
  comment?: string;
}

export interface SamplePageCreateRequest {
  projectId: string;
  url: string;
  title: string;
  description?: string;
  order?: number;
}

export interface EvaluationCreateRequest {
  auditId: string;
  pageId: string;
  exigenceId: string;
  score: 'Conforme' | 'Partiellement conforme' | 'Non conforme' | 'Non Applicable';
  comment?: string;
  attachments?: string[];
}

export interface CorrectiveActionCreateRequest {
  evaluationId: string;
  targetScore: 'Conforme' | 'Partiellement conforme';
  priority: 'faible' | 'moyenne' | 'haute' | 'critique';
  dueDate: string;
  responsible: string;
  comment?: string;
}

export interface ProgressUpdateRequest {
  actionId: string;
  score: 'Conforme' | 'Partiellement conforme' | 'Non conforme';
  comment?: string;
  responsible: string;
}

// Interfaces pour les services
export interface IProjectsService {
  getAll(): Promise<ApiResponse<Project[]>>;
  getById(id: string): Promise<ApiResponse<Project>>;
  create(data: ProjectCreateRequest): Promise<ApiResponse<Project>>;
  update(id: string, data: ProjectUpdateRequest): Promise<ApiResponse<Project>>;
  delete(id: string): Promise<ApiResponse<void>>;
}

export interface IAuditsService {
  getByProject(projectId: string): Promise<ApiResponse<Audit[]>>;
  getById(id: string): Promise<ApiResponse<Audit>>;
  create(data: AuditCreateRequest): Promise<ApiResponse<Audit>>;
  delete(id: string): Promise<ApiResponse<void>>;
}

export interface IChecklistService {
  getAll(): Promise<ApiResponse<ChecklistItem[]>>;
  getById(id: string): Promise<ApiResponse<ChecklistItem>>;
}

export interface IExigencesService {
  getByProject(projectId: string): Promise<ApiResponse<Exigence[]>>;
  create(data: ExigenceCreateRequest): Promise<ApiResponse<Exigence>>;
  update(id: string, data: Partial<Exigence>): Promise<ApiResponse<Exigence>>;
  delete(id: string): Promise<ApiResponse<void>>;
}

export interface ISamplePagesService {
  getByProject(projectId: string): Promise<ApiResponse<SamplePage[]>>;
  create(data: SamplePageCreateRequest): Promise<ApiResponse<SamplePage>>;
  update(id: string, data: Partial<SamplePage>): Promise<ApiResponse<SamplePage>>;
  delete(id: string): Promise<ApiResponse<void>>;
}

export interface IEvaluationsService {
  getByAudit(auditId: string): Promise<ApiResponse<Evaluation[]>>;
  getByAuditAndPage(auditId: string, pageId: string): Promise<ApiResponse<Evaluation[]>>;
  create(data: EvaluationCreateRequest): Promise<ApiResponse<Evaluation>>;
  update(id: string, data: Partial<Evaluation>): Promise<ApiResponse<Evaluation>>;
}

export interface IActionsService {
  getByEvaluation(evaluationId: string): Promise<ApiResponse<CorrectiveAction[]>>;
  create(data: CorrectiveActionCreateRequest): Promise<ApiResponse<CorrectiveAction>>;
  update(id: string, data: Partial<CorrectiveAction>): Promise<ApiResponse<CorrectiveAction>>;
  getProgressByAction(actionId: string): Promise<ApiResponse<Progress[]>>;
  createProgress(data: ProgressUpdateRequest): Promise<ApiResponse<Progress>>;
}
