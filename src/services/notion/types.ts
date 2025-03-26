
/**
 * Types pour le service Notion
 */

export enum ConnectionStatus {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Error = 'error'
}

export interface NotionConfig {
  apiKey?: string;
  projectsDbId?: string;
  checklistsDbId?: string;
  mockMode?: boolean;
  debug?: boolean;
}

export interface NotionError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface NotionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: NotionError;
}

export interface ConnectionTestResult {
  success: boolean;
  user?: string;
  workspaceName?: string;
  projectsDbName?: string;
  checklistsDbName?: string;
  error?: string;
  details?: any;
}
