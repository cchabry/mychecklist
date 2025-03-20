
// Types pour l'application d'audit qualité

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  subsubcategory?: string;
  details?: string; // Détails supplémentaires à afficher à la demande
  metaRefs?: string;
  criteria?: string;
  profile?: string;
  phase?: string;
  effort?: string;
  priority?: string;
  requirementLevel?: string;
  scope?: string;
}

export interface Project {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  progress: number; // Pourcentage de complétion 0-100
  itemsCount: number;
  pagesCount?: number; // Nombre de pages dans l'échantillon
}

export enum ComplianceStatus {
  NonCompliant = "non-compliant",
  PartiallyCompliant = "partially-compliant",
  Compliant = "compliant",
  NotEvaluated = "not-evaluated",
  NotApplicable = "not-applicable"
}

export enum ImportanceLevel {
  NA = "N/A",
  Mineur = "Mineur",
  Moyen = "Moyen",
  Important = "Important",
  Majeur = "Majeur"
}

export enum ActionPriority {
  Faible = "faible",
  Moyenne = "moyenne",
  Haute = "haute",
  Critique = "critique"
}

export enum ActionStatus {
  ToDo = "à faire",
  InProgress = "en cours",
  Done = "terminée"
}

// Nouvelle structure: Page d'échantillon
export interface SamplePage {
  id: string;
  projectId: string;
  url: string;
  title: string;
  description?: string;
  order: number;
}

// Résultat d'évaluation pour une page spécifique
export interface PageResult {
  pageId: string;
  status: ComplianceStatus;
  comment?: string;
}

// Nouvelle structure: Exigence spécifique à un projet
export interface ProjectRequirement {
  id: string;
  projectId: string;
  itemId: string; // Référence à l'item de checklist
  importance: ImportanceLevel;
  comment?: string; // Commentaire expliquant cette exigence
}

// Action corrective
export interface CorrectiveAction {
  id: string;
  evaluationId: string; // Référence à l'évaluation
  targetScore: ComplianceStatus;
  priority: ActionPriority;
  dueDate: string;
  responsible: string;
  comment?: string;
  status: ActionStatus;
}

// Suivi d'une action corrective
export interface ActionProgress {
  id: string;
  actionId: string; // Référence à l'action corrective
  date: string;
  responsible: string;
  comment?: string;
  score: ComplianceStatus;
  status: ActionStatus;
}

// Évaluation d'un item pour un audit spécifique
export interface Evaluation {
  id: string;
  auditId: string;
  exigenceId: string; // Référence à l'exigence du projet
  pageId: string; // Référence à la page évaluée
  status: ComplianceStatus;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  actions?: CorrectiveAction[]; // Actions correctives associées
}

export interface AuditItem extends ChecklistItem {
  status: ComplianceStatus; // Overall status
  comment?: string; // Overall comment
  pageResults?: PageResult[]; // Results for each sample page
  // Propriétés spécifiques au projet
  importance?: ImportanceLevel | string; // Niveau d'importance pour ce projet
  projectRequirement?: string; // Exigence spécifique au projet
  projectComment?: string; // Commentaire détaillé sur l'exigence pour ce projet
  // Nouvelles propriétés
  actions?: CorrectiveAction[]; // Actions correctives associées
}

export interface Audit {
  id: string;
  projectId: string;
  name: string; // Nom spécifique de l'audit (nouvelle propriété)
  items: AuditItem[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  score: number; // Score global de conformité
  version?: string; // Numéro de version (nouvelle propriété)
}

// Valeurs pour le calcul du score
export const COMPLIANCE_VALUES = {
  [ComplianceStatus.NonCompliant]: 0,
  [ComplianceStatus.PartiallyCompliant]: 0.5,
  [ComplianceStatus.Compliant]: 1,
  [ComplianceStatus.NotEvaluated]: 0,
  [ComplianceStatus.NotApplicable]: 0
};
