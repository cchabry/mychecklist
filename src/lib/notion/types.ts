
// Importing shared types from the main types file
import { ComplianceStatus, Audit, AuditItem, Project } from '../types';

// Re-export types that are used in the Notion services
export type { ComplianceStatus, Audit, AuditItem, Project };

// Helper constant for compliance values calculation
export const COMPLIANCE_VALUES = {
  [ComplianceStatus.NonCompliant]: 0,
  [ComplianceStatus.PartiallyCompliant]: 0.5,
  [ComplianceStatus.Compliant]: 1,
  [ComplianceStatus.NotEvaluated]: 0
};

// Notion-specific type definitions
export interface NotionProperty {
  id: string;
  type: string;
  [key: string]: any;
}

export interface NotionProperties {
  [key: string]: NotionProperty;
}

export interface NotionPage {
  id: string;
  properties: NotionProperties;
  created_time: string;
  last_edited_time: string;
  [key: string]: any;
}
