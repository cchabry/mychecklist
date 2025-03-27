
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

// Mappages pour la compatibilité entre les types d'énumérations
import { ComplianceLevel, PriorityLevel, StatusType } from '../enums';

/**
 * Mappages pour la conversion entre ComplianceStatus et ComplianceLevel
 */
export const complianceStatusToLevel: Record<ComplianceStatus, ComplianceLevel> = {
  [ComplianceStatus.Compliant]: ComplianceLevel.Compliant,
  [ComplianceStatus.PartiallyCompliant]: ComplianceLevel.PartiallyCompliant,
  [ComplianceStatus.NonCompliant]: ComplianceLevel.NonCompliant,
  [ComplianceStatus.NotApplicable]: ComplianceLevel.NotApplicable
};

/**
 * Mappages pour la conversion entre ActionPriority et PriorityLevel
 */
export const actionPriorityToLevel: Record<ActionPriority, PriorityLevel> = {
  [ActionPriority.Low]: PriorityLevel.Low,
  [ActionPriority.Medium]: PriorityLevel.Medium,
  [ActionPriority.High]: PriorityLevel.High,
  [ActionPriority.Critical]: PriorityLevel.Critical
};

/**
 * Mappages pour la conversion entre ActionStatus et StatusType
 */
export const actionStatusToType: Record<ActionStatus, StatusType> = {
  [ActionStatus.Todo]: StatusType.Todo,
  [ActionStatus.InProgress]: StatusType.InProgress,
  [ActionStatus.Done]: StatusType.Done
};
