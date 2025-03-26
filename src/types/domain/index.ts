
/**
 * Types du domaine de l'application
 */

// Réexporter les types spécifiques
export * from './project';
export * from './audit';
export * from './checklist';

/**
 * Niveaux d'importance pour les exigences
 */
export enum ImportanceLevel {
  NotApplicable = 'N/A',
  Minor = 'mineur',
  Medium = 'moyen',
  Important = 'important',
  Major = 'majeur'
}

/**
 * Exigence de projet
 */
export interface Exigence {
  id: string;
  projectId: string;
  itemId: string;
  importance: ImportanceLevel;
  comment?: string;
}

/**
 * Page d'échantillon
 */
export interface SamplePage {
  id: string;
  projectId: string;
  url: string;
  title: string;
  description?: string;
  order: number;
}

/**
 * Niveaux de conformité pour les évaluations
 */
export enum ComplianceStatus {
  Compliant = 'Conforme',
  PartiallyCompliant = 'Partiellement conforme',
  NonCompliant = 'Non conforme',
  NotApplicable = 'Non Applicable'
}

/**
 * Évaluation d'une page pour une exigence
 */
export interface Evaluation {
  id: string;
  auditId: string;
  pageId: string;
  exigenceId: string;
  score: ComplianceStatus;
  comment?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Niveaux de priorité pour les actions
 */
export enum ActionPriority {
  Low = 'faible',
  Medium = 'moyenne',
  High = 'haute',
  Critical = 'critique'
}

/**
 * Statuts des actions
 */
export enum ActionStatus {
  Todo = 'à faire',
  InProgress = 'en cours',
  Done = 'terminée'
}

/**
 * Action corrective
 */
export interface CorrectiveAction {
  id: string;
  evaluationId: string;
  targetScore: ComplianceStatus;
  priority: ActionPriority;
  dueDate: string;
  responsible: string;
  comment?: string;
  status: ActionStatus;
}

/**
 * Suivi des corrections
 */
export interface ActionProgress {
  id: string;
  actionId: string;
  date: string;
  responsible: string;
  comment?: string;
  score: ComplianceStatus;
  status: ActionStatus;
}
