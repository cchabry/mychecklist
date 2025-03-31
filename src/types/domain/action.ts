
/**
 * Enum représentant les statuts possibles d'une action
 */
export enum ActionStatus {
  ToDo = "To Do",
  InProgress = "In Progress",
  Done = "Done",
  Blocked = "Blocked",
  Open = "Open"
}

/**
 * Enum représentant les priorités possibles d'une action
 */
export enum ActionPriority {
  High = "High",
  Medium = "Medium",
  Low = "Low",
  Critical = "Critical"
}

/**
 * Type représentant une action corrective
 */
export interface CorrectiveAction {
  id: string;
  evaluationId: string;
  targetScore: ComplianceStatus;
  priority: ActionPriority;
  dueDate: string;
  responsible: string;
  comment?: string;
  status: ActionStatus;
}

/**
 * Type représentant le suivi d'une action corrective
 */
export interface ActionProgress {
  id: string;
  actionId: string;
  date: string;
  responsible: string;
  comment?: string;
  score: ComplianceStatus;
  status: ActionStatus;
}
