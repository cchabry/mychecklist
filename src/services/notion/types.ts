
/**
 * Types pour les services Notion
 */

/**
 * État de connexion
 */
export enum ConnectionStatus {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Error = 'error',
  Testing = 'testing'
}

/**
 * Configuration pour l'API Notion
 */
export interface NotionConfig {
  apiKey?: string;
  mockMode?: boolean;
  debug?: boolean;
  projectsDbId?: string;
  checklistsDbId?: string;
  exigencesDbId?: string;
  samplePagesDbId?: string;
  auditsDbId?: string;
  evaluationsDbId?: string;
  actionsDbId?: string;
  progressDbId?: string;
}

/**
 * Options pour l'API Notion
 */
export interface NotionAPIOptions {
  token?: string;
  projectsDbId?: string;
  checklistsDbId?: string;
  exigencesDbId?: string;
  samplePagesDbId?: string;
  auditsDbId?: string;
  evaluationsDbId?: string;
  actionsDbId?: string;
  progressDbId?: string;
  useMockData?: boolean;
}

/**
 * Résultat d'un test de connexion
 */
export interface ConnectionTestResult {
  success: boolean;
  user?: string;
  error?: string;
  details?: any;
}

/**
 * Réponse de l'API Notion
 */
export interface NotionResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: any;
    code?: string;
  };
}

/**
 * Type pour la réponse de l'API Notion
 */
export type NotionAPIResponse<T> = NotionResponse<T>;
