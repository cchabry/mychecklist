
/**
 * Types de domaine principaux de l'application
 */

// Checklist - Référentiel de bonnes pratiques
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

// Projet - Site web à auditer
export interface Project {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
}

// Exigence - Spécification des bonnes pratiques retenues pour un projet
export interface Exigence {
  id: string;
  projectId: string;
  itemId: string;
  importance: 'N/A' | 'mineur' | 'moyen' | 'important' | 'majeur';
  comment?: string;
}

// Page - Échantillon de pages du projet
export interface SamplePage {
  id: string;
  projectId: string;
  url: string;
  title: string;
  description?: string;
  order: number;
}

// Audit - Informations générales d'un audit pour un projet
export interface Audit {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Évaluation - Résultats d'évaluation par page et par exigence
export interface Evaluation {
  id: string;
  auditId: string;
  pageId: string;
  exigenceId: string;
  score: 'Conforme' | 'Partiellement conforme' | 'Non conforme' | 'Non Applicable';
  comment?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

// Action corrective - Actions à entreprendre sur une évaluation
export interface CorrectiveAction {
  id: string;
  evaluationId: string;
  targetScore: 'Conforme' | 'Partiellement conforme';
  priority: 'faible' | 'moyenne' | 'haute' | 'critique';
  dueDate: string;
  responsible: string;
  comment?: string;
  status: 'à faire' | 'en cours' | 'terminée';
}

// Suivi des corrections - Suivi des actions correctives
export interface Progress {
  id: string;
  actionId: string;
  date: string;
  responsible: string;
  comment?: string;
  score: 'Conforme' | 'Partiellement conforme' | 'Non conforme';
  status: 'à faire' | 'en cours' | 'terminée';
}
