
export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  metaRefs?: string;
  criteria: string;
  profile: string;
  phase: string;
  effort: string;
  priority: string;
  requirementLevel: string;
  scope: string;
  consigne: string;
  status: ComplianceStatus; // Make sure status is required, not optional
  pageResults?: PageResult[];
  importance?: ImportanceLevel;
  projectRequirement?: string;
  projectComment?: string;
  actions?: CorrectiveAction[];
  comment?: string;
  reference?: string;
  profil?: string;
  details?: string; // Pour remplacer les références à subsubcategory et autres détails
}

export interface Project {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  itemsCount: number;
  pagesCount: number;
  description?: string;
  status?: string;
}

export interface Audit {
  id: string;
  projectId: string;
  name: string;
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  score: number;
  version: string;
}

// Alias pour la compatibilité avec le code existant
export type AuditItem = ChecklistItem;
export type ProjectRequirement = Exigence;

export enum ComplianceStatus {
  Compliant = "Compliant",
  NonCompliant = "NonCompliant",
  PartiallyCompliant = "PartiallyCompliant",
  NotEvaluated = "NotEvaluated",
  NotApplicable = "NotApplicable"
}

// Ajout de l'alias ComplianceLevel pour compatibilité
export type ComplianceLevel = ComplianceStatus;

// Valeurs numériques pour les statuts de conformité (pour les calculs de score)
export const COMPLIANCE_VALUES = {
  [ComplianceStatus.Compliant]: 1,
  [ComplianceStatus.PartiallyCompliant]: 0.5,
  [ComplianceStatus.NonCompliant]: 0,
  [ComplianceStatus.NotEvaluated]: 0,
  [ComplianceStatus.NotApplicable]: 0
};

export enum ImportanceLevel {
  Majeur = "Majeur",
  Important = "Important",
  Moyen = "Moyen",
  Mineur = "Mineur",
  NA = "N/A"
}

export interface PageResult {
  pageId: string;
  status: ComplianceStatus;
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

export enum ActionPriority {
  High = "High",
  Medium = "Medium",
  Low = "Low",
  Critical = "Critical"
}

export enum ActionStatus {
  Open = "Open",
  InProgress = "In Progress",
  Done = "Done",
  Blocked = "Blocked",
  ToDo = "To Do"
}

// Structure d'évaluation pour le suivi des audits
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

// Structure d'action corrective
export interface CorrectiveAction {
  id: string;
  evaluationId: string;
  pageId: string; // Ajout du champ pageId manquant
  targetScore: ComplianceStatus;
  priority: ActionPriority;
  dueDate: string;
  responsible: string;
  comment: string;
  status: ActionStatus;
  createdAt: string;
  updatedAt: string;
  progress: ActionProgress[];
}

export interface ActionProgress {
  id: string;
  actionId: string;
  date: string;
  responsible: string;
  comment: string;
  score: ComplianceStatus;
  status: ActionStatus;
}

// Type pour les exigences spécifiques à un projet
export interface Exigence {
  id: string;
  projectId: string;
  itemId: string;
  importance: ImportanceLevel;
  comment?: string;
}
