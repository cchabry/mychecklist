
// Import des types nécessaires
import { ComplianceStatus } from './evaluation';

/**
 * Niveau de priorité d'une action corrective
 */
export enum ActionPriority {
  Low = "Faible",
  Medium = "Moyenne",
  High = "Haute",
  Critical = "Critique"
}

/**
 * Statut d'une action corrective
 */
export enum ActionStatus {
  ToDo = "À faire",
  InProgress = "En cours",
  Done = "Terminée",
  Cancelled = "Annulée"
}

/**
 * Type représentant une action corrective
 */
export interface CorrectiveAction {
  id: string;
  evaluationId: string;
  targetScore: ComplianceStatus;
  priority: ActionPriority;
  dueDate?: string;
  responsible?: string;
  comment?: string;
  status: ActionStatus;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Type représentant le suivi de progression d'une action
 */
export interface ActionProgress {
  id: string;
  actionId: string;
  date: string;
  comment: string;
  responsible?: string;
  score?: ComplianceStatus;
  newStatus?: ActionStatus;
  attachments?: string[];
  author?: string;
}
