
export type ComplianceStatus = 'conforme' | 'non-conforme' | 'partiellement-conforme' | 'non-évalué' | 'non-applicable';
export type ActionPriority = 'basse' | 'moyenne' | 'haute' | 'critique';
export type ActionStatus = 'à faire' | 'en-cours' | 'terminée' | 'annulée';

export interface PageResult {
  pageId: string;
  status: ComplianceStatus;
  comment?: string;
}

export interface AuditItem extends ChecklistItem {
  status: ComplianceStatus;
  importance: string;
  profile: string[];
  pageResults: PageResult[];
  projectRequirement?: string;
  projectComment?: string;
}

export interface CorrectiveAction {
  id: string;
  evaluationId: string;
  pageId: string;
  description: string;
  priority: ActionPriority;
  status: ActionStatus;
  dueDate: string;
  assignee: string;
  progress: number;
}
