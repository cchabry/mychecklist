
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
export interface Action {
  id: string;
  auditId: string;
  pageId: string;
  title: string;
  description: string;
  priority: ActionPriority;
  dueDate?: string;
  assignee?: string;
  status: ActionStatus;
  createdAt: string;
  updatedAt: string;
}
