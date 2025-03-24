
import { ComplianceStatus, ImportanceLevel, ActionStatus, ActionPriority } from '../types';

export interface SamplePage {
  id: string;
  projectId: string;
  url: string;
  title: string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRequirement {
  id: string;
  projectId: string;
  itemId: string;
  importance: ImportanceLevel;
  comment: string;
}

export interface AuditItem {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  metaRefs?: string;
  profile?: string[];
  phase?: string[];
  effort?: string;
  priority?: string;
  requirementLevel?: string;
  scope?: string;
  criteria?: string;
  status: string;
  importance: string;
  projectRequirement: string;
  projectComment: string;
  pageResults: PageResult[];
}

export interface PageResult {
  pageId: string;
  status: string;
  comment?: string;
  attachments?: string[];
}

export interface NotionConfig {
  apiKey: string;
  databaseId: string;
  checklistsDbId?: string;
  projectsDbId?: string;
  auditsDbId?: string;
  exigencesDbId?: string;
  samplePagesDbId?: string;
  evaluationsDbId?: string;
  actionsDbId?: string;
  pagesDbId?: string;
}
