
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
  NONE = 'none'
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
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
}

export interface AlertThresholdConfig {
  totalErrorsPerHour?: number;
  totalErrorsPerMinute?: number;
  apiErrorsPerHour?: number;
  networkErrorsPerMinute?: number;
  authErrorsPerHour?: number;
  [key: string]: number | undefined;
}
