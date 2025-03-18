
// Importing shared types from the main types file
import type { Audit, AuditItem, Project } from '../types';
import { ComplianceStatus, COMPLIANCE_VALUES } from '../types';

// Re-export types that are used in the Notion services
export type { ComplianceStatus, Audit, AuditItem, Project };

// Re-export values
export { COMPLIANCE_VALUES };

// Project data from Notion
export interface ProjectData extends Project {
  // Any additional Notion-specific fields can be added here
  description?: string;
  status?: string;
}

// Collection of projects
export interface ProjectsData {
  projects: ProjectData[];
}

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
