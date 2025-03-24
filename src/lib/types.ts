// Types de base pour l'application

export interface Project {
  id: string;
  name: string;
  url: string;
  description?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  itemsCount?: number;
  pagesCount?: number;
  client?: string;
  startDate?: string;
  endDate?: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  consigne: string;
  description: string;
  category: string;
  subcategory: string;
  metaRefs?: string;
  profil?: string[];
  phase?: string[];
  effort?: string;
  priority?: string;
  reference?: string[];
  profile?: string[];
  requirementLevel?: string;
  scope?: string;
  details?: string;
  criteria?: string;
  status?: string;
  comment?: string;
  pageResults?: PageResult[];
  actions?: CorrectiveAction[];
  importance?: string;
  projectRequirement?: string;
  projectComment?: string;
}

export interface SamplePage {
  id: string;
  projectId: string;
  url: string;
  title: string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Exigence {
  id: string;
  projectId: string;
  itemId: string;
  importance: ImportanceLevel;
  comment?: string;
}

export interface ProjectRequirement {
  id: string;
  projectId: string;
  itemId: string;
  importance: ImportanceLevel;
  comment: string;
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
  status?: string;
}

export interface Audit {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  items?: AuditItem[];
  score?: number;
  version?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  progress?: number;
}

export interface PageResult {
  pageId: string;
  score?: string;
  status?: string;
  comment?: string;
  attachments?: string[];
}

export interface AuditItem {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  metaRefs?: string;
  profile: string;
  phase: string;
  effort: string;
  priority: string;
  requirementLevel: string;
  scope: string;
  consigne: string;
  status: string;
  comment?: string;
  pageResults?: PageResult[];
  actions?: CorrectiveAction[];
  details?: string;
  criteria?: string;
  importance?: string;
  projectRequirement?: string;
  projectComment?: string;
}

export interface CorrectiveAction {
  id: string;
  evaluationId: string;
  pageId: string;
  targetScore: string;
  priority: string;
  dueDate: string;
  responsible: string;
  comment: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  progress: ActionProgress[];
  description?: string;
}

export interface ActionProgress {
  id: string;
  actionId: string;
  date: string;
  responsible: string;
  comment: string;
  score: string;
  status: string;
}

export const ComplianceStatus = {
  Compliant: 'conforme',
  NonCompliant: 'non-conforme',
  PartiallyCompliant: 'partiellement-conforme',
  NotApplicable: 'non-applicable',
  NotEvaluated: 'non-évalué'
} as const;

export type ComplianceStatus = typeof ComplianceStatus[keyof typeof ComplianceStatus];

export const COMPLIANCE_VALUES: Record<string, number> = {
  'conforme': 1,
  'partiellement-conforme': 0.5,
  'non-conforme': 0,
  'non-applicable': 0,
  'non-évalué': 0
};

export const ImportanceLevel = {
  NA: 'N/A',
  Mineur: 'mineur',
  Moyen: 'moyen',
  Important: 'important',
  Majeur: 'majeur'
} as const;

export type ImportanceLevel = typeof ImportanceLevel[keyof typeof ImportanceLevel];

export const ActionPriority = {
  Low: 'faible',
  Medium: 'moyenne',
  High: 'haute',
  Critical: 'critique'
} as const;

export type ActionPriority = typeof ActionPriority[keyof typeof ActionPriority];

export const ActionStatus = {
  ToDo: 'à faire',
  InProgress: 'en cours',
  Done: 'terminée',
  Cancelled: 'annulée',
  Blocked: 'bloquée',
  Open: 'ouverte'
} as const;

export type ActionStatus = typeof ActionStatus[keyof typeof ActionStatus];

export interface NotionConfig {
  apiKey: string;
  databaseId: string;
  checklistsDbId?: string;
  projectsDbId?: string;
  auditsDbId?: string;
  exigencesDbId?: string;
  samplePagesDbId?: string;
  evaluationsDbId?: string;
  actionsDbId?: string;
  pagesDbId?: string;
}

export type ComplianceLevel = ComplianceStatus;
