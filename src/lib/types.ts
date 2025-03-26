
import { ChecklistItem, Project } from './types/index';

// Redéfinition des types principaux pour assurer la compatibilité
export type {
  ChecklistItem,
  Project
};

// Types d'importance pour les exigences
export type ImportanceLevel = 'N/A' | 'mineur' | 'moyen' | 'important' | 'majeur';

// Types pour les exigences
export interface Exigence {
  id: string;
  projectId: string;
  itemId: string;
  importance: ImportanceLevel;
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Types pour les pages d'échantillon
export interface SamplePage {
  id: string;
  projectId: string;
  url: string;
  title: string;
  description?: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Types pour les audits
export interface Audit {
  id: string;
  projectId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Types de score pour les évaluations
export type ComplianceScore = 'conforme' | 'partiellement conforme' | 'non conforme' | 'non applicable';

// Types pour les évaluations
export interface Evaluation {
  id: string;
  auditId: string;
  pageId: string;
  exigenceId: string;
  score: ComplianceScore;
  comment?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Types de priorité pour les actions
export type PriorityLevel = 'faible' | 'moyenne' | 'haute' | 'critique';

// Types de statut pour les actions
export type ActionStatus = 'à faire' | 'en cours' | 'terminée';

// Types pour les actions correctives
export interface Action {
  id: string;
  evaluationId: string;
  targetScore: ComplianceScore;
  priority: PriorityLevel;
  dueDate: Date;
  responsible: string;
  comment?: string;
  status: ActionStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour le suivi des progrès
export interface Progress {
  id: string;
  actionId: string;
  date: Date;
  responsible: string;
  comment?: string;
  score: ComplianceScore;
  status: ActionStatus;
  createdAt: Date;
  updatedAt: Date;
}
