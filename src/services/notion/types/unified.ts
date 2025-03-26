
/**
 * Types unifiés pour les services Notion et les erreurs
 */

// Types pour les erreurs Notion
export enum NotionErrorType {
  AUTH = "AUTH",
  API = "API",
  RATE_LIMIT = "RATE_LIMIT",
  DATABASE = "DATABASE", 
  PERMISSION = "PERMISSION",
  TIMEOUT = "TIMEOUT",
  NETWORK = "NETWORK",
  INTERNAL = "INTERNAL",
  UNKNOWN = "UNKNOWN"
}

export enum NotionErrorSeverity {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL"
}

// Interface pour les erreurs Notion
export interface NotionError {
  id: string;
  message: string;
  type: NotionErrorType;
  timestamp: number;
  context?: string | Record<string, any>;
  operation?: string;
  severity: NotionErrorSeverity;
  retryable: boolean;
  original?: Error;
}

// Types pour les réponses de l'API Notion
export interface NotionApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

// Types pour les bases de données Notion
export interface NotionDatabase {
  id: string;
  properties: Record<string, any>;
  title?: string;
  url?: string;
  name?: string;
}

// Types pour les résultats de recherche Notion
export interface NotionSearchResults {
  results: any[];
  has_more: boolean;
  next_cursor: string | null;
}

// Types pour les utilisateurs Notion
export interface NotionUser {
  id: string;
  name: string;
  type?: string;
  avatar_url?: string;
}
