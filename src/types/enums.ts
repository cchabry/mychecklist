
/**
 * Énumérations utilisées dans l'application
 */

/**
 * Statut d'un projet
 */
export type ProjectStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';

/**
 * Niveau d'importance d'une exigence
 */
export enum ImportanceLevel {
  /** Majeur - niveau le plus élevé */
  Major = 'MAJOR',
  /** Important */
  Important = 'IMPORTANT',
  /** Moyen */
  Medium = 'MEDIUM',
  /** Mineur */
  Minor = 'MINOR',
  /** Non applicable */
  NotApplicable = 'NOT_APPLICABLE'
}

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
export enum PriorityLevel {
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
export enum StatusType {
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

/**
 * Mapping entre statuts de projet pour assurer la compatibilité
 */
export const PROJECT_STATUS_MAPPING: Record<string, ProjectStatus> = {
  'active': 'IN_PROGRESS',
  'completed': 'COMPLETED',
  'pending': 'NEW',
  'archived': 'CANCELLED',
  'En cours': 'IN_PROGRESS',
  'Terminé': 'COMPLETED',
  'Nouveau': 'NEW',
  'En pause': 'PAUSED',
  'Annulé': 'CANCELLED',
  'NEW': 'NEW',
  'IN_PROGRESS': 'IN_PROGRESS',
  'COMPLETED': 'COMPLETED',
  'PAUSED': 'PAUSED',
  'CANCELLED': 'CANCELLED'
};
