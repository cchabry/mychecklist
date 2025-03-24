
/**
 * Shared utility functions
 */

/** 
 * Project representation
 */
export interface Project {
  id: string;
  name: string;
  url: string;
  description?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  itemsCount: number;
  pagesCount: number;
  samplePages?: SamplePage[];
}

/**
 * Sample Page in a project
 */
export interface SamplePage {
  id: string;
  projectId: string;
  url: string;
  title: string;
  description: string;
  order: number;
}

/**
 * Checklist item (from reference checklist)
 */
export interface ChecklistItem {
  id: string;
  consigne: string;
  description: string;
  category: string;
  subcategory: string;
  reference: string[];
  profil: string[];
  phase: string[];
  effort: string;
  priority: string;
}

/**
 * Project-specific exigence based on checklist item
 */
export interface Exigence {
  id: string;
  projectId: string;
  itemId: string;
  importance: 'N/A' | 'Mineur' | 'Moyen' | 'Important' | 'Majeur';
  comment: string;
}

/**
 * Audit information
 */
export interface Audit {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Evaluation for a specific page against an exigence
 */
export interface Evaluation {
  id: string;
  auditId: string;
  pageId: string;
  exigenceId: string;
  score: 'Conforme' | 'Partiellement conforme' | 'Non conforme' | 'Non Applicable';
  comment: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Corrective action for an evaluation
 */
export interface Action {
  id: string;
  evaluationId: string;
  targetScore: 'Conforme' | 'Partiellement conforme' | 'Non conforme' | 'Non Applicable';
  priority: 'Faible' | 'Moyenne' | 'Haute' | 'Critique';
  dueDate: string;
  responsible: string;
  comment: string;
  status: 'À faire' | 'En cours' | 'Terminée';
  createdAt: string;
  updatedAt: string;
}

/**
 * Progress update on an action
 */
export interface Progress {
  id: string;
  actionId: string;
  date: string;
  responsible: string;
  comment: string;
  score: 'Conforme' | 'Partiellement conforme' | 'Non conforme' | 'Non Applicable';
  status: 'À faire' | 'En cours' | 'Terminée';
}
