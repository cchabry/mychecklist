
/**
 * Types pour le système de gestion des erreurs Notion
 */

// Types d'erreurs possibles
export enum NotionErrorType {
  NETWORK = 'network',
  AUTH = 'auth',
  PERMISSION = 'permission',
  RATE_LIMIT = 'rate_limit',
  VALIDATION = 'validation',
  DATABASE = 'database',
  UNKNOWN = 'unknown'
}

// Niveaux de gravité
export enum NotionErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Structure d'une erreur Notion enrichie
export interface NotionError extends Error {
  // Propriétés standard Error
  name: string;
  message: string;
  stack?: string;
  
  // Propriétés spécifiques Notion
  type: NotionErrorType;
  severity: NotionErrorSeverity;
  context: Record<string, any>;
  timestamp: Date;
  recoverable: boolean;
  recoveryActions: string[];
}

// Options pour la création d'erreurs
export interface NotionErrorOptions {
  type?: NotionErrorType;
  severity?: NotionErrorSeverity;
  cause?: Error;
  context?: Record<string, any>;
  recoverable?: boolean;
  recoveryActions?: string[];
}

// Type pour les abonnés aux erreurs
export type NotionErrorSubscriber = (error: NotionError) => void;
