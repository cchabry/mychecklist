
/**
 * Types pour les services Notion
 */

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
