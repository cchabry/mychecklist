
/**
 * Types pour les statuts d'actions correctives
 */

/**
 * Statut d'une action corrective
 */
export enum ActionStatus {
  Todo = 0,
  InProgress = 1,
  Done = 2
}

/**
 * Priorité d'une action corrective
 */
export enum ActionPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3
}

/**
 * Statut de conformité
 */
export enum ComplianceStatus {
  NonCompliant = 0,
  PartiallyCompliant = 1,
  Compliant = 2,
  NotApplicable = 3
}
