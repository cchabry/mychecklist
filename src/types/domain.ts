
/**
 * Types de domaine pour l'application
 */

export interface Project {
  id: string;
  name: string;
  url?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  itemsCount?: number;
  pagesCount?: number;
}

export interface ChecklistItem {
  id: string;
  consigne: string;
  description?: string;
  category: string;
  subcategory?: string;
  reference?: string[];
  profil?: string[];
  phase?: string[];
  effort?: number;
  priority?: number;
}

export interface Exigence {
  id: string;
  projectId: string;
  itemId: string;
  importance: string;
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

export interface Audit {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Evaluation {
  id: string;
  auditId: string;
  pageId: string;
  exigenceId: string;
  score: string;
  comment?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CorrectiveAction {
  id: string;
  evaluationId: string;
  pageId?: string;
  targetScore: string;
  priority: string;
  dueDate?: string;
  responsible?: string;
  comment?: string;
  status: string;
  progress?: ActionProgress[];
  createdAt: string;
  updatedAt: string;
}

export interface ActionProgress {
  id: string;
  actionId: string;
  date: string;
  responsible?: string;
  comment?: string;
  score?: string;
  status: string;
}
