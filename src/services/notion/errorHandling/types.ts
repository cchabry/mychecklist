
/**
 * Types pour la gestion des erreurs Notion
 */

export interface RetryOperationOptions {
  maxRetries?: number;
  retryDelay?: number;
  maxDelay?: number;
  skipRetryIf?: (error: Error) => boolean;
  onSuccess?: (result: any) => void;
  onFailure?: (error: Error) => void;
  retryableStatusCodes?: number[];
  backoff?: number; // Ajout du paramètre backoff manquant
}

export interface RetryQueueStats {
  totalOperations: number;
  pendingOperations: number;
  completedOperations: number;
  failedOperations: number;
  lastProcessedAt: number | null;
  isProcessing: boolean;
}

export interface NotionError {
  id: string;
  message: string;
  type: NotionErrorType;
  severity: NotionErrorSeverity;
  timestamp: number;
  context?: string | Record<string, any>;
  originalError?: Error;
  retryable: boolean;
  metadata?: Record<string, any>;
  
  // Propriétés manquantes
  name?: string;
  stack?: string;
  operation?: string;
  details?: string | Record<string, any>;
  cause?: Error | unknown;
  recoverable?: boolean;
  recoveryActions?: Array<{ label: string, action: () => void }>;
}

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

export enum NotionErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum NotionTokenType {
  INTEGRATION = 'integration',
  OAUTH = 'oauth',
  OAUTH_TEMP = 'oauth_temp',
  NONE = 'none',
  UNKNOWN = 'unknown'
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  // Niveaux manquants
  TRACE = 'trace',
  FATAL = 'fatal'
}

export interface ErrorCounterOptions {
  maxStorageTime?: number;
  cleanupInterval?: number;
  alertThresholds?: AlertThresholdConfig;
  logErrors?: boolean;
}

export interface ErrorCounterStats {
  total: number;
  byType: Partial<Record<NotionErrorType, number>>;
  byEndpoint?: Record<string, number>;
  byHour?: Record<number, number>;
  byMinute?: Record<number, number>;
  lastError?: NotionError; // Ajout de la propriété manquante
}

export interface AlertThresholdConfig {
  totalErrorsPerHour?: number;
  totalErrorsPerMinute?: number;
  apiErrorsPerHour?: number;
  networkErrorsPerMinute?: number;
  authErrorsPerHour?: number;
  [key: string]: number | undefined;
}

// Types supplémentaires pour la gestion des erreurs
export interface ReportErrorOptions {
  type?: NotionErrorType;
  severity?: NotionErrorSeverity;
  context?: string;
  details?: string | Record<string, any>;
  operation?: string;
  cause?: Error | unknown;
  retryable?: boolean;
  recoverable?: boolean;
  recoveryActions?: Array<{ label: string, action: () => void }>;
}

export interface NotionErrorOptions {
  type?: NotionErrorType;
  severity?: NotionErrorSeverity;
  context?: string;
  details?: string | Record<string, any>;
  operation?: string;
  retryable?: boolean;
  recoverable?: boolean;
  recoveryActions?: Array<{ label: string, action: () => void }>;
  cause?: Error | unknown;
}

export type ErrorSubscriber = (errors: NotionError[]) => void;

export interface ErrorSubscription {
  id: string;
  callback: ErrorSubscriber;
}

// Type pour les logs structurés
export interface StructuredLog {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  data?: any;
  source?: string;
  context?: Record<string, any>;
  tags?: string[];
}
