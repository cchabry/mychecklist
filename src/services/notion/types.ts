
/**
 * Types pour les services Notion
 */

import { Project } from '@/types/domain';

export interface NotionConfig {
  apiKey?: string;
  projectsDbId?: string;
  checklistsDbId?: string;
  mockMode?: boolean;
}

export enum ConnectionStatus {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Error = 'error'
}

export interface ConnectionTestResult {
  success: boolean;
  user?: string;
  workspaceName?: string;
  projectsDbName?: string;
  checklistsDbName?: string;
  error?: string;
}

// Adding NotionResponse type for use across services
export interface NotionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

// Project response types
export interface ProjectsResponse extends NotionResponse<Project[]> {}
export interface ProjectResponse extends NotionResponse<Project> {}
export interface DeleteResponse extends NotionResponse<boolean> {}
