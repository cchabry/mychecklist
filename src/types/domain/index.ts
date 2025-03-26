
/**
 * Types de domaine pour l'application
 */

// Projets
export interface Project {
  id: string;
  name: string;
  description?: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  progress?: number;
}

// Checklist
export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  reference?: string[];
  profil?: string[];
  phase?: string[];
  effort: string;
  priority: string;
}

// Niveaux d'importance
export type ImportanceLevel = 'N/A' | 'mineur' | 'moyen' | 'important' | 'majeur';

// Exigence
export interface Exigence {
  id: string;
  projectId: string;
  itemId: string;
  importance: ImportanceLevel;
  comment?: string;
}

// Page d'échantillon
export interface SamplePage {
  id: string;
  projectId: string;
  url: string;
  title: string;
  description?: string;
  order: number;
}

// Audit
export interface Audit {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

// États de conformité
export type ComplianceStatus = 'conforme' | 'partiel' | 'non_conforme' | 'non_applicable';

// Évaluation
export interface Evaluation {
  id: string;
  auditId: string;
  pageId: string;
  exigenceId: string;
  score: ComplianceStatus;
  comment: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

// Priorités d'action
export type ActionPriority = 'faible' | 'moyenne' | 'haute' | 'critique';

// États d'action
export type ActionStatus = 'a_faire' | 'en_cours' | 'terminee';

// Action corrective
export interface CorrectiveAction {
  id: string;
  evaluationId: string;
  targetScore: ComplianceStatus;
  priority: ActionPriority;
  dueDate: string;
  responsible: string;
  comment: string;
  status: ActionStatus;
  createdAt: string;
  updatedAt: string;
}

// Suivi d'action
export interface ActionProgress {
  id: string;
  actionId: string;
  date: string;
  responsible: string;
  comment: string;
  score: ComplianceStatus;
  status: ActionStatus;
}
