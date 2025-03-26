
/**
 * Types pour le modèle de données de l'application
 */

// Type de base pour les identifiants
export type ID = string;

// Niveaux d'importance pour les exigences
export type ImportanceLevel = 'N/A' | 'mineur' | 'moyen' | 'important' | 'majeur';

// Niveaux de conformité pour les évaluations
export type ComplianceLevel = 'Conforme' | 'Partiellement conforme' | 'Non conforme' | 'Non Applicable';

// Priorités pour les actions correctives
export type PriorityLevel = 'faible' | 'moyenne' | 'haute' | 'critique';

// Statuts pour les actions et progrès
export type StatusType = 'à faire' | 'en cours' | 'terminée';

// Profils utilisateurs
export type UserProfile = 'Product Owner' | 'UX designer' | 'UI designer' | 'Développeur' | 'Contributeur';

// Phases de projet
export type ProjectPhase = 'Conception' | 'Design' | 'Développement' | 'Tests' | 'Production';

// Type pour les références aux référentiels
export type ReferenceType = {
  code: string;
  name: string;
};

// Modèle pour un item de checklist
export interface ChecklistItem {
  id: ID;
  consigne: string;
  description: string;
  category: string;
  subcategory: string;
  reference: ReferenceType[];
  profil: UserProfile[];
  phase: ProjectPhase[];
  effort: number;
  priority: number;
}

// Modèle pour un projet
export interface Project {
  id: ID;
  name: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
}

// Modèle pour une exigence
export interface Exigence {
  id: ID;
  projectId: ID;
  itemId: ID;
  importance: ImportanceLevel;
  comment: string;
}

// Modèle pour une page d'échantillon
export interface SamplePage {
  id: ID;
  projectId: ID;
  url: string;
  title: string;
  description: string;
  order: number;
}

// Modèle pour un audit
export interface Audit {
  id: ID;
  projectId: ID;
  name: string;
  createdAt: string;
  updatedAt: string;
  items: AuditItem[];
}

// Modèle pour un item d'audit (regroupement d'évaluations)
export interface AuditItem {
  id: ID;
  itemId: ID;
  evaluations: Evaluation[];
}

// Modèle pour une évaluation
export interface Evaluation {
  id: ID;
  auditId: ID;
  pageId: ID;
  exigenceId: ID;
  score: ComplianceLevel;
  comment: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

// Modèle pour une action corrective
export interface Action {
  id: ID;
  evaluationId: ID;
  targetScore: ComplianceLevel;
  priority: PriorityLevel;
  dueDate: string;
  responsible: string;
  comment: string;
  status: StatusType;
  progress: Progress[];
}

// Modèle pour un suivi de progression
export interface Progress {
  id: ID;
  actionId: ID;
  date: string;
  responsible: string;
  comment: string;
  score: ComplianceLevel;
  status: StatusType;
}
