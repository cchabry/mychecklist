
/**
 * Types pour l'API Notion
 */

export enum ConnectionStatus {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Error = 'error',
  Loading = 'loading'
}

/**
 * Structure des erreurs Notion
 */
export interface NotionError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

/**
 * Structure des réponses de l'API Notion
 */
export interface NotionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: NotionError;
}

/**
 * Informations sur un utilisateur Notion
 */
export interface NotionUser {
  id: string;
  name?: string;
  avatarUrl?: string;
  email?: string;
  type?: 'person' | 'bot';
}

/**
 * Configuration du client Notion
 */
export interface NotionConfig {
  apiKey?: string;
  projectsDbId?: string; 
  checklistsDbId?: string;
  mockMode?: boolean;
  debug?: boolean;
}

/**
 * Résultat du test de connexion Notion
 */
export interface ConnectionTestResult {
  success: boolean;
  user?: string;
  workspaceName?: string;
  projectsDbName?: string; 
  checklistsDbName?: string;
  error?: string;
  details?: any;
}
