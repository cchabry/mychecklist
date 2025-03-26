
/**
 * Types communs pour les services Notion
 * Utilisés dans toute l'application pour assurer la cohérence des données
 * Date dernière mise à jour: 26/03/2025
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
