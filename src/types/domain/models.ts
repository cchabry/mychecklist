
/**
 * Interfaces du modèle de domaine pour l'application d'audit
 */

import { 
  ImportanceLevel, 
  ComplianceStatus, 
  ActionPriority, 
  ActionStatus,
  UserProfile,
  ProjectPhase,
  ReferenceType
} from '../enums';

/**
 * Identifiant unique
 */
export type ID = string;

/**
 * Projet - Site web à auditer
 */
export interface Project {
  id: ID;
  name: string;
  description?: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  progress?: number;
}

/**
 * Item de checklist - Critère d'évaluation
 */
export interface ChecklistItem {
  id: ID;
  consigne: string;
  description: string;
  category: string;
  subcategory: string;
  reference: ReferenceType[];
  profil: UserProfile[];
  phase: ProjectPhase[];
  effort: number;
  priority: number;
}

/**
 * Exigence - Version spécifique d'un item de checklist pour un projet
 */
export interface Exigence {
  id: ID;
  projectId: ID;
  itemId: ID;
  importance: ImportanceLevel;
  comment?: string;
}

/**
 * Page d'échantillon - Page à évaluer dans le cadre d'un projet
 */
export interface SamplePage {
  id: ID;
  projectId: ID;
  url: string;
  title: string;
  description?: string;
  order: number;
}

/**
 * Audit - Évaluation d'un projet à un moment donné
 */
export interface Audit {
  id: ID;
  projectId: ID;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  version?: string;
  completedAt?: string;
}

/**
 * Évaluation - Résultat d'évaluation pour une page et une exigence
 */
export interface Evaluation {
  id: ID;
  auditId: ID;
  pageId: ID;
  exigenceId: ID;
  score: ComplianceStatus;
  comment: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Action corrective - Action à entreprendre suite à une évaluation
 */
export interface CorrectiveAction {
  id: ID;
  evaluationId: ID;
  targetScore: ComplianceStatus;
  priority: ActionPriority;
  dueDate: string;
  responsible: string;
  comment: string;
  status: ActionStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Suivi d'action - Historique des mises à jour d'une action corrective
 */
export interface ActionProgress {
  id: ID;
  actionId: ID;
  date: string;
  responsible: string;
  comment: string;
  score: ComplianceStatus;
  status: ActionStatus;
}

/**
 * Item d'audit - Regroupement d'évaluations pour un item de checklist
 */
export interface AuditItem {
  id: ID;
  itemId: ID;
  evaluations: Evaluation[];
}

/**
 * Résultat par page - Synthèse des évaluations pour une page
 */
export interface PageResult {
  pageId: ID;
  status: ComplianceStatus;
  comment?: string;
}
