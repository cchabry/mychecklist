
// Interfaces principales du système

export interface Project {
  id: string;
  name: string;
  description?: string;
  client?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Audit {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  auditId: string;
  name: string;
  url: string;
  description?: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Checklist {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Exigence {
  id: string;
  checklistId: string;
  name: string;
  description?: string;
  importance?: ImportanceLevel;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export type ComplianceStatus = 'Conforme' | 'Partiellement conforme' | 'Non conforme' | 'Non applicable' | 'Non évalué';
export type ImportanceLevel = 'N/A' | 'Mineur' | 'Moyen' | 'Important' | 'Majeur';
export type ActionPriority = 'Faible' | 'Moyenne' | 'Haute' | 'Critique';
export type ActionStatus = 'A faire' | 'En cours' | 'Terminée' | 'Annulée';

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

export interface CorrectiveAction {
  id: string;
  evaluationId: string;
  targetScore: ComplianceStatus;
  priority: ActionPriority;
  dueDate?: string;
  responsible?: string;
  comment?: string;
  status: ActionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ActionProgress {
  id: string;
  actionId: string;
  date: string;
  responsible?: string;
  comment?: string;
  score?: ComplianceStatus;
  status: ActionStatus;
  createdAt: string;
  updatedAt: string;
}
