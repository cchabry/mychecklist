
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
}

export interface ChecklistItem {
  id: string;
  name: string;
  consigne: string;
  description: string;
  category: string;
  subcategory: string;
  metaRefs: string[];
  profil: string[];  // Notez: profil, pas profile
  phase: string[];
  effort: string;
  priority: string;
  reference: string[];
  requirementLevel?: string;
  scope?: string;
  details?: string;
  title?: string;  // Alias pour consigne
  criteria?: string;
  status?: string;
  comment?: string;
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

export interface Audit {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  items?: AuditItem[];  // ajout du champ items
  score?: number;       // ajout du champ score
  version?: string;     // ajout du champ version
}

export interface PageResult {
  pageId: string;
  score: ComplianceStatus;
  comment?: string;
  attachments?: string[];
}

export interface AuditItem {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  metaRefs: string;
  profile: string;
  phase: string;
  effort: string;
  priority: string;
  requirementLevel: string;
  scope: string;
  consigne: string;
  status: string;
  comment: string;
  pageResults: PageResult[];
  actions: CorrectiveAction[];
  details: string;
  criteria?: string;
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

// Types d'énumération
export type ComplianceStatus = 'conforme' | 'non-conforme' | 'partiellement-conforme' | 'non-applicable' | 'non-évalué';

export const COMPLIANCE_VALUES: ComplianceStatus[] = [
  'conforme',
  'non-conforme',
  'partiellement-conforme',
  'non-applicable',
  'non-évalué'
];

export type ImportanceLevel = 'N/A' | 'mineur' | 'moyen' | 'important' | 'majeur';

export type ActionPriority = 'faible' | 'moyenne' | 'haute' | 'critique';

export type ActionStatus = 'à faire' | 'en cours' | 'terminée' | 'annulée';

// Type pour la configuration Notion
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
