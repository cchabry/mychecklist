
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

// Types pour la file d'attente de réessais
export interface RetryOperationOptions {
  maxRetries?: number;
  retryDelay?: number;
  maxDelay?: number;
  backoff?: number;
  skipRetryIf?: (error: Error) => boolean;
  onSuccess?: (result: any) => void;
  onFailure?: (error: Error) => void;
  retryableStatusCodes?: number[];
}

export interface RetryQueueStats {
  totalOperations: number;
  pendingOperations: number;
  completedOperations: number;
  failedOperations: number;
  lastProcessedAt: number | null;
  isProcessing: boolean;
}

// Types pour le compteur d'erreurs
export interface ErrorCounterOptions {
  maxStorageTime?: number;
  cleanupInterval?: number;
  alertThresholds?: AlertThresholdConfig;
  logErrors?: boolean;
}

export interface AlertThresholdConfig {
  totalErrorsPerHour?: number;
  totalErrorsPerMinute?: number;
  apiErrorsPerHour?: number;
  networkErrorsPerMinute?: number;
  authErrorsPerHour?: number;
  [key: string]: number | undefined;
}

export interface ErrorCounterStats {
  total: number;
  byType: Partial<Record<NotionErrorType, number>>;
  byEndpoint?: Record<string, number>;
  byHour?: Record<number, number>;
  byMinute?: Record<number, number>;
  lastError?: NotionError;
}

// Types pour le système de journalisation structurée
export interface StructuredLoggerOptions {
  minLevel?: LogLevel;
  maxLogs?: number;
  persistLogs?: boolean;
  formatters?: Record<string, (data: any) => string>;
}

export interface StructuredLogger {
  debug: (message: string, data?: any, context?: Record<string, any>) => void;
  info: (message: string, data?: any, context?: Record<string, any>) => void;
  warn: (message: string, data?: any, context?: Record<string, any>) => void;
  error: (message: string, data?: any, context?: Record<string, any>) => void;
  trace: (message: string, data?: any, context?: Record<string, any>) => void;
  fatal: (message: string, data?: any, context?: Record<string, any>) => void;
  log: (level: LogLevel, message: string, data?: any, context?: Record<string, any>) => void;
  getRecentLogs: () => StructuredLog[];
  subscribe: (callback: (logs: StructuredLog[]) => void) => () => void;
  configure?: (options: Partial<StructuredLoggerOptions>) => void;
  setMinLevel?: (level: LogLevel) => void;
  getMinLevel?: () => LogLevel;
}

// Types pour le service de file d'attente de réessais
export interface RetryQueueService {
  enqueue: (operation: () => Promise<any>, context: string | Record<string, any>, options?: RetryOperationOptions) => string;
  cancel: (operationId: string) => boolean;
  processQueue: () => Promise<void>;
  processNow: (operationId: string) => Promise<any>;
  getStats: () => RetryQueueStats;
  clearQueue: () => void;
  subscribe: (callback: (stats: RetryQueueStats) => void) => () => void;
}

// Types pour Notion OAuth
export enum NotionTokenType {
  INTEGRATION = 'integration',
  OAUTH = 'oauth',
  OAUTH_TEMP = 'oauth_temp',
  NONE = 'none',
  UNKNOWN = 'unknown'
}

// Alias pour la compatibilité rétroactive
export type NotionErrorSubscriber = ErrorSubscriber;
