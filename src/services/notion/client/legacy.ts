
/**
 * Types et interfaces legacy pour la rétrocompatibilité
 */

export enum ConnectionStatus {
  Disconnected = 'disconnected',
  Connected = 'connected',
  Error = 'error'
}

export interface NotionAPIError {
  message: string;
  code?: string;
  details?: any;
}

export interface NotionAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: NotionAPIError;
  user?: string; // Champ optionnel pour la compatibilité
}

export interface NotionAPIListResponse {
  results: any[];
  next_cursor?: string;
  has_more?: boolean;
}

export interface NotionAPIPage {
  id: string;
  properties: Record<string, any>;
  [key: string]: any;
}
