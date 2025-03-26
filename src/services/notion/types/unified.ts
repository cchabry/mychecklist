
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
  UNKNOWN = "UNKNOWN",
  // Types additionnels pour compatibilité
  CORS = "CORS",
  PROXY = "PROXY",
  CONFIG = "CONFIG",
  SERVER = "SERVER",
  VALIDATION = "VALIDATION",
  NOT_FOUND = "NOT_FOUND"
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
  // Propriétés additionnelles pour compatibilité
  stack?: string;
  cause?: any;
  recoverable?: boolean;
  details?: any;
}

// Types pour le système de file d'attente de réessai
export interface RetryOperationOptions {
  maxAttempts?: number;
  retryDelay?: number;
  onSuccess?: (result: any) => void;
  onFailure?: (error: Error) => void;
  skipRetryIf?: (error: Error) => boolean;
}

export interface QueuedOperation {
  id: string;
  operation: () => Promise<any>;
  context: string | Record<string, any>;
  attempts: number;
  maxAttempts: number;
  lastError?: Error;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface RetryQueueStats {
  pendingCount: number;
  failedCount: number;
  successCount: number;
  totalProcessed: number;
  isPaused: boolean;
  queuedOperations: QueuedOperation[];
}

// Types pour le système de journalisation
export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR"
}

export interface StructuredLogMessage {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: number;
}

export interface StructuredLog extends StructuredLogMessage {
  id: string;
}

export interface StructuredLoggerOptions {
  minLevel?: LogLevel;
  maxLogSize?: number;
  persistLogs?: boolean;
}

export interface StructuredLogger {
  log(level: LogLevel, message: string, context?: Record<string, any>): void;
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, context?: Record<string, any>): void;
  getLogs(): StructuredLog[];
  clear(): void;
}

// Types pour le système de comptage d'erreurs
export interface ErrorCounterStats {
  totalErrors: number;
  byType: { type: NotionErrorType; count: number }[];
  byEndpoint: { endpoint: string; count: number }[];
  lastError?: NotionError;
}

export interface AlertThresholdConfig {
  errorCountThreshold?: number;
  timeWindowMs?: number;
  byType?: Record<NotionErrorType, number>;
}

// Types pour les options d'erreurs Notion
export interface NotionErrorOptions {
  severity?: NotionErrorSeverity;
  retryable?: boolean;
  context?: string | Record<string, any>;
  operation?: string;
}

// Interface pour les abonnés d'erreur
export interface ErrorSubscriber {
  id: string;
  callback: (error: NotionError) => void;
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
  title?: Array<{plain_text?: string}>;
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
