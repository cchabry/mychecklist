
/**
 * @deprecated Utilisez les importations directes depuis les types du domaine
 * import { ImportanceLevel, ComplianceStatus, ActionPriority, ActionStatus } from '@/types/domain';
 */

import { 
  ImportanceLevel as DomainImportanceLevel,
  ComplianceStatus as DomainComplianceStatus,
  ActionPriority as DomainActionPriority,
  ActionStatus as DomainActionStatus
} from './domain';

/**
 * Niveaux d'importance pour les exigences
 * @deprecated Utilisez ImportanceLevel depuis '@/types/domain'
 */
export const ImportanceLevel = DomainImportanceLevel;
export type ImportanceLevel = DomainImportanceLevel;

/**
 * Niveaux de conformité pour les évaluations
 * @deprecated Utilisez ComplianceStatus depuis '@/types/domain'
 */
export const ComplianceLevel = DomainComplianceStatus;
export type ComplianceLevel = DomainComplianceStatus;

/**
 * Priorités pour les actions correctives
 * @deprecated Utilisez ActionPriority depuis '@/types/domain'
 */
export const PriorityLevel = DomainActionPriority;
export type PriorityLevel = DomainActionPriority;

/**
 * Statuts pour les actions et progrès
 * @deprecated Utilisez ActionStatus depuis '@/types/domain'
 */
export const StatusType = DomainActionStatus;
export type StatusType = DomainActionStatus;

/**
 * Profils utilisateurs
 */
export enum UserProfile {
  ProductOwner = "Product Owner",
  UXDesigner = "UX designer",
  UIDesigner = "UI designer",
  Developer = "Développeur",
  Contributor = "Contributeur"
}

/**
 * Phases de projet
 */
export enum ProjectPhase {
  Design = "Design",
  Development = "Développement",
  Testing = "Tests",
  Production = "Production"
}

/**
 * Types de référence
 */
export enum ReferenceType {
  RGAA = "RGAA",
  RGESN = "RGESN",
  OPQUAST = "OPQUAST"
}
