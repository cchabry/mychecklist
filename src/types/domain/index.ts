
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

// Exporter les enums pour qu'ils soient disponibles via l'import depuis domain
export { ActionPriority, ActionStatus } from './action';
export { ComplianceStatus } from './evaluation';
export { ImportanceLevel } from './exigence';

// Mettre à jour les alias pour compatibilité
export type PriorityLevel = ActionPriority;
export type StatusType = ActionStatus;
export type ComplianceLevel = ComplianceStatus;
