
/**
 * Types pour l'API Notion
 */

import {
  ProjectApi, 
  AuditApi, 
  ChecklistApi, 
  ExigenceApi, 
  SamplePageApi, 
  EvaluationApi, 
  ActionApi
} from './domain';

/**
 * Résultat d'une opération API Notion
 */
export interface NotionAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    status?: number;
    details?: any;
  };
}

/**
 * Statut de connexion Notion
 */
export enum ConnectionStatus {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Error = 'error',
  Loading = 'loading'
}

/**
 * Utilisateur Notion
 */
export interface NotionUser {
  id: string;
  name: string;
  avatarUrl?: string;
  type: string;
}

/**
 * Réponse de test de connexion Notion
 */
export interface NotionTestResponse {
  user?: NotionUser;
  workspace?: string;
  timestamp: number;
}

/**
 * Interface unifiée pour l'API Notion
 * Agrège toutes les APIs par domaine métier
 */
export interface NotionAPI extends 
  ProjectApi,
  AuditApi,
  ChecklistApi,
  ExigenceApi,
  SamplePageApi,
  EvaluationApi,
  ActionApi {
  
  // Test de connexion
  testConnection(): Promise<NotionTestResponse>;
}

/**
 * Options de configuration pour l'API Notion
 */
export interface NotionAPIOptions {
  apiKey?: string;
  databaseId?: string;
  checklistsDbId?: string;
  projectsDbId?: string;
  auditsDbId?: string;
  pagesDbId?: string;
  exigencesDbId?: string;
  evaluationsDbId?: string;
  actionsDbId?: string;
  progressDbId?: string;
  mockMode?: boolean;
  debug?: boolean;
}
