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
  status?: ComplianceStatus;
  pageResults?: PageResult[];
  importance?: ImportanceLevel;
  projectRequirement?: string;
  projectComment?: string;
  actions?: CorrectiveAction[];
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

export enum ComplianceStatus {
  Compliant = "Compliant",
  NonCompliant = "NonCompliant",
  PartiallyCompliant = "PartiallyCompliant",
  NotEvaluated = "NotEvaluated"
}

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
  Low = "Low"
}

export enum ActionStatus {
  Open = "Open",
  InProgress = "In Progress",
  Done = "Done",
  Blocked = "Blocked"
}

export interface CorrectiveAction {
  id: string;
  evaluationId: string;
  pageId: string;
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
