
/**
 * Enums pour le domaine métier
 */

/**
 * Niveau d'importance d'une exigence
 */
export enum ImportanceLevel {
  Majeur = "Majeur",
  Important = "Important",
  Moyen = "Moyen",
  Mineur = "Mineur",
  NA = "N/A"
}

/**
 * Statut de conformité pour une évaluation
 */
export enum ComplianceLevel {
  Compliant = "Compliant",
  PartiallyCompliant = "PartiallyCompliant",
  NonCompliant = "NonCompliant",
  NotEvaluated = "NotEvaluated",
  NotApplicable = "NotApplicable"
}

/**
 * Niveau de priorité d'une action
 */
export enum PriorityLevel {
  Critical = "Critical",
  High = "High",
  Medium = "Medium",
  Low = "Low"
}

/**
 * Statut d'une action
 */
export enum StatusType {
  Open = "Open",
  InProgress = "In Progress",
  Done = "Done",
  Blocked = "Blocked",
  ToDo = "To Do"
}
