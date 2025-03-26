
/**
 * Types principaux du domaine pour l'application d'audit
 */

// Niveaux d'importance pour les exigences
export type ImportanceLevel = 'N/A' | 'mineur' | 'moyen' | 'important' | 'majeur';

// Statuts de conformité pour les évaluations
export type ComplianceStatus = 'conforme' | 'partiel' | 'non-conforme' | 'non-applicable';

// Priorités pour les actions correctives
export type ActionPriority = 'faible' | 'moyenne' | 'haute' | 'critique';

// Statuts pour les actions correctives
export type ActionStatus = 'à faire' | 'en cours' | 'terminée';

// Projet
export interface Project {
  id: string;
  name: string;
  description?: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  progress?: number;
}

// Item de checklist
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
