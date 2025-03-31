
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

// Exporter directement les enums pour s'assurer qu'ils sont utilisés correctement
export { 
  ComplianceStatus, 
  type ComplianceLevel
} from './evaluation';

export {
  ImportanceLevel
} from './exigence';

export {
  ActionPriority,
  ActionStatus,
} from './action';

// Mettre à jour les alias pour compatibilité
export type PriorityLevel = ActionPriority;
export type StatusType = ActionStatus;
