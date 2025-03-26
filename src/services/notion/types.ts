
/**
 * Types communs pour les services Notion
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

export enum ConnectionStatus {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Error = 'error',
  Loading = 'loading'
}

export interface NotionUser {
  id: string;
  name: string;
  avatarUrl?: string;
  type: string;
}

export interface NotionTestResponse {
  user?: NotionUser;
  workspace?: string;
  timestamp: number;
}
