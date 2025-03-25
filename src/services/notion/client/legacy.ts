
/**
 * Types et définitions hérités de l'ancien système
 * Conservés pour assurer la compatibilité
 */

// Types d'état de connexion Notion
export enum ConnectionStatus {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Error = 'error'
}

// Interface pour les réponses de l'API Notion (ancien format)
export interface NotionAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface NotionAPIListResponse {
  object: 'list';
  results: any[];
  next_cursor: string | null;
  has_more: boolean;
  [key: string]: any;
}

export interface NotionAPIPage {
  id: string;
  object: 'page';
  properties: {
    [key: string]: any;
  };
  url: string;
  created_time: string;
  last_edited_time: string;
  [key: string]: any;
}
