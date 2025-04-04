
/**
 * Types du domaine de l'application
 */

// Réexporter les types spécifiques
export * from './project';
export * from './audit';
export * from './checklist';

// Importer les énumérations depuis le fichier central
import { 
  ImportanceLevel,
  ComplianceLevel as ComplianceStatus,
  PriorityLevel as ActionPriority,
  StatusType as ActionStatus
} from '../enums';

// Re-exporter avec des alias pour maintenir la compatibilité
export { ImportanceLevel, ComplianceStatus, ActionPriority, ActionStatus };

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
