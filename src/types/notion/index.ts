
/**
 * Types communs pour les services et intégrations avec Notion
 */

import { ApiError } from '../api';

export enum ConnectionStatus {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Error = 'error',
  Loading = 'loading'
}

export interface NotionAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface NotionUser {
  id: string;
  name: string;
  avatarUrl?: string;
  type: string;
}

export interface NotionWorkspace {
  id: string;
  name: string;
  icon?: string;
}

export interface NotionTestResponse {
  user?: NotionUser;
  workspace?: NotionWorkspace | string;
  timestamp: number;
}

export interface NotionConnectionConfig {
  token?: string;
  projectsDbId?: string;
  checklistsDbId?: string;
  auditsDbId?: string;
  exigencesDbId?: string;
  pagesDbId?: string;
  evaluationsDbId?: string;
  actionsDbId?: string;
}

export interface NotionConnectionStatus {
  status: ConnectionStatus;
  lastChecked: number;
  user?: NotionUser;
  workspace?: NotionWorkspace | string;
  error?: string;
  isMockMode: boolean;
}

export interface NotionDatabaseInfo {
  id: string;
  name: string;
  url?: string;
  icon?: string;
  description?: string;
  createdTime?: string;
  lastEditedTime?: string;
}

export interface NotionRequestLogEntry {
  id: string;
  timestamp: number;
  endpoint: string;
  method: string;
  status?: number;
  success?: boolean;
  responseTime?: number;
  error?: string;
}
