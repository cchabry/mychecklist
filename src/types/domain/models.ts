
/**
 * Types pour les entités du domaine
 */
import { 
  ImportanceLevel, 
  ComplianceLevel, 
  PriorityLevel, 
  StatusType 
} from '../enums';

// Re-export des types présents dans le fichier lib/types.ts
export type {
  Project
} from './project';

export interface ChecklistItem {
  id: string;
  consigne: string;
  description: string;
  category: string;
  subcategory: string;
  reference: string[];
  profil: string[];
  phase: string[];
  effort: number;
  priority: number;
}

export interface Exigence {
  id: string;
  projectId: string;
  itemId: string;
  importance: ImportanceLevel;
  comment?: string;
}

export interface SamplePage {
  id: string;
  projectId: string;
  url: string;
  title: string;
  description?: string;
  order: number;
}

export interface Evaluation {
  id: string;
  auditId: string;
  pageId: string;
  exigenceId: string;
  score: ComplianceLevel;
  comment: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CorrectiveAction {
  id: string;
  evaluationId: string;
  targetScore: ComplianceLevel;
  priority: PriorityLevel;
  dueDate: string;
  responsible: string;
  comment: string;
  status: StatusType;
  createdAt: string;
  updatedAt: string;
}

export interface ActionProgress {
  id: string;
  actionId: string;
  date: string;
  responsible: string;
  comment: string;
  score: ComplianceLevel;
  status: StatusType;
}
