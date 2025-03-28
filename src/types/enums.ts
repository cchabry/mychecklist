
/**
 * Énumérations utilisées dans l'application
 */

/**
 * Statut d'un projet
 */
export type ProjectStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';

/**
 * Niveau de conformité d'une évaluation
 */
export enum ComplianceLevel {
  /** Conforme aux exigences */
  Compliant = 'COMPLIANT',
  /** Partiellement conforme */
  PartiallyCompliant = 'PARTIALLY_COMPLIANT',
  /** Non conforme */
  NonCompliant = 'NON_COMPLIANT',
  /** Non applicable */
  NotApplicable = 'NOT_APPLICABLE'
}

/**
 * Priorité d'une action corrective
 */
export enum ActionPriority {
  /** Priorité basse */
  Low = 'LOW',
  /** Priorité moyenne */
  Medium = 'MEDIUM',
  /** Priorité haute */
  High = 'HIGH',
  /** Priorité critique */
  Critical = 'CRITICAL'
}

/**
 * Statut d'une action corrective
 */
export enum ActionStatus {
  /** À faire */
  Todo = 'TODO',
  /** En cours */
  InProgress = 'IN_PROGRESS',
  /** Terminée */
  Done = 'DONE',
  /** Bloquée */
  Blocked = 'BLOCKED',
  /** Annulée */
  Cancelled = 'CANCELLED'
}
