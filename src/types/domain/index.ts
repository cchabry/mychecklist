
/**
 * Types de domaine communs pour toute l'application
 * Basés sur l'architecture définie dans ARCHITECTURE.md
 */

// Types d'ID
export type ID = string;
export type ProjectID = ID;
export type AuditID = ID;
export type ChecklistItemID = ID;
export type ExigenceID = ID;
export type SamplePageID = ID;
export type EvaluationID = ID;
export type ActionID = ID;

// Énumérations
export enum ImportanceLevel {
  NA = 'N/A',
  Mineur = 'mineur',
  Moyen = 'moyen',
  Important = 'important',
  Majeur = 'majeur'
}

export enum ComplianceStatus {
  NotEvaluated = 'not_evaluated',
  Compliant = 'compliant',
  PartiallyCompliant = 'partially_compliant',
  NonCompliant = 'non_compliant',
  NotApplicable = 'not_applicable'
}

export enum ActionPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical'
}

export enum ActionStatus {
  ToDo = 'todo',
  InProgress = 'in_progress',
  Done = 'done',
  Canceled = 'canceled'
}

// Types des entités principales
export interface Project {
  id: ProjectID;
  name: string;
  description?: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  progress?: number;
}

export interface ChecklistItem {
  id: ChecklistItemID;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  reference?: string[];
  profile?: string[];
  phase?: string[];
  effort: string;
  priority: string;
  // Champs additionnels utilisés dans l'application existante
  consigne?: string;
  criteria?: string;
  requirementLevel?: string;
  scope?: string;
  status?: ComplianceStatus;
}

export interface Exigence {
  id: ExigenceID;
  projectId: ProjectID;
  itemId: ChecklistItemID;
  importance: ImportanceLevel;
  comment?: string;
}

export interface SamplePage {
  id: SamplePageID;
  projectId: ProjectID;
  url: string;
  title: string;
  description?: string;
  order: number;
}

export interface Audit {
  id: AuditID;
  projectId: ProjectID;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
  score?: number;
  version?: string;
  items?: any[]; // Type à préciser selon l'implémentation
}

export interface Evaluation {
  id: EvaluationID;
  auditId: AuditID;
  pageId: SamplePageID;
  exigenceId: ExigenceID;
  score: ComplianceStatus;
  comment: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ActionProgress {
  id: ID;
  date: string;
  responsible: string;
  comment: string;
  score: ComplianceStatus;
  status: ActionStatus;
}

export interface CorrectiveAction {
  id: ActionID;
  evaluationId: EvaluationID;
  pageId?: SamplePageID;
  targetScore: ComplianceStatus;
  priority: ActionPriority;
  dueDate?: string;
  responsible?: string;
  comment: string;
  status: ActionStatus;
  progress?: ActionProgress[];
  createdAt: string;
  updatedAt: string;
}
