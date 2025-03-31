
// Importing shared types from the main types file
import type { 
  Audit, 
  AuditItem, 
  Project, 
  SamplePage,
  ProjectRequirement,
  CorrectiveAction,
  ActionProgress,
  Evaluation
} from '../types';
import { 
  ComplianceStatus, 
  COMPLIANCE_VALUES, 
  ImportanceLevel,
  ActionPriority,
  ActionStatus
} from '../types';

// Re-export types that are used in the Notion services
export type { 
  ComplianceStatus, 
  ImportanceLevel, 
  ActionPriority,
  ActionStatus,
  Audit, 
  AuditItem, 
  Project, 
  SamplePage,
  ProjectRequirement,
  CorrectiveAction,
  ActionProgress,
  Evaluation
};

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

// Sample pages collection
export interface SamplePagesData {
  pages: SamplePage[];
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

// Notion block types for rich content and file attachments
export interface NotionBlock {
  id: string;
  type: string;
  [key: string]: any;
}

export interface NotionRichText {
  type: string;
  text?: {
    content: string;
    link?: { url: string } | null;
  };
  annotations?: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  plain_text?: string;
  href?: string | null;
}

// Types pour les pièces jointes
export interface NotionAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  created_time: string;
}
