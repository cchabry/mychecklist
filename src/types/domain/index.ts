
/**
 * Export des types du domaine
 */

export * from './project';
export * from './audit';
export * from './action';
export * from './checklist';
export * from './evaluation';
export * from './exigence';
export * from './samplePage';

// Re-export les enums du domaine pour uniformiser avec les enums globaux
import { ComplianceStatus } from './evaluation';
import { ImportanceLevel } from './exigence';
import { ActionPriority, ActionStatus } from './action';

// Aliasing des types pour compatibilité
export { 
  ComplianceStatus,
  ImportanceLevel,
  ActionPriority,
  ActionStatus
};

// Type aliases for backward compatibility
export type ComplianceLevel = ComplianceStatus;
export type PriorityLevel = ActionPriority;
export type StatusType = ActionStatus;
