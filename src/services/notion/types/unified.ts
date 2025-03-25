
/**
 * Types unifiés pour l'écosystème Notion
 * Ce fichier sert de source unique de vérité pour toutes les définitions de types
 */

// Niveaux de log
export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

// Types d'erreur Notion
export enum NotionErrorType {
  UNKNOWN = 'unknown',
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  AUTH = 'auth',
  PERMISSION = 'permission',
  RATE_LIMIT = 'rate_limit',
  SERVER = 'server',
  DATABASE = 'database',
  VALIDATION = 'validation',
  CORS = 'cors',
  PROXY = 'proxy',
  CONFIG = 'config',
  NOT_FOUND = 'not_found',
  API = 'api'
}

// Sévérités d'erreur
export enum NotionErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Interface unifiée pour StructuredLog
export interface StructuredLog {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  data?: any;
  source?: string;
  context?: Record<string, any> | string;
  tags?: string[];
  error?: Error | string;
}

// Interface unifiée pour NotionError
export interface NotionError {
  id: string;
  message: string;
  type: NotionErrorType;
  severity: NotionErrorSeverity;
  timestamp: number;
  context?: Record<string, any> | string;
  originalError?: Error;
  retryable: boolean;
  metadata?: Record<string, any>;
  
  // Propriétés supplémentaires
  name?: string;
  stack?: string;
  operation?: string;
  details?: Record<string, any> | string;
  cause?: Error | unknown;
  recoverable?: boolean;
  recoveryActions?: Array<{ label: string, action: () => void }>;
}

// Types pour la gestion des erreurs
export type ErrorSubscriber = (errors: NotionError[]) => void;

export interface ErrorSubscription {
  id: string;
  callback: ErrorSubscriber;
}

export interface NotionErrorOptions {
  type?: NotionErrorType;
  severity?: NotionErrorSeverity;
  context?: Record<string, any> | string;
  details?: Record<string, any> | string;
  operation?: string;
  retryable?: boolean;
  recoverable?: boolean;
  recoveryActions?: Array<{ label: string, action: () => void }>;
  cause?: Error | unknown;
  stack?: string;
  name?: string;
}

// Alias pour la compatibilité rétroactive
export type NotionErrorSubscriber = ErrorSubscriber;
