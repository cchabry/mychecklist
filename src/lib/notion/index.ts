
// Re-export all Notion-related functionality from a single entry point

// Core client functionality
export {
  isNotionConfigured,
  configureNotion,
  extractNotionDatabaseId,
  testNotionConnection
} from './notionClient';

// Project-related operations
export {
  getProjectsFromNotion,
  getProjectById,
  createProjectInNotion
} from './projectsService';

// Audit-related operations
export {
  getAuditForProject,
  saveAuditToNotion
} from './auditService';

// Types re-export
export type { ComplianceStatus } from '../types';
export { COMPLIANCE_VALUES } from '../types';
