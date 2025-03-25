
/**
 * Types unifiés pour les services Notion
 */

// Types d'erreur
export enum NotionErrorType {
  AUTH = 'auth',
  NOT_FOUND = 'not_found',
  VALIDATION = 'validation',
  RATE_LIMIT = 'rate_limit',
  CORS = 'cors',
  NETWORK = 'network',
  SERVER = 'server',
  UNKNOWN = 'unknown',
  DATABASE = 'database',
  PERMISSION = 'permission',
  TIMEOUT = 'timeout',
  API = 'api',
  CONFIG = 'config'
}

export enum NotionErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface NotionErrorOptions {
  type?: NotionErrorType;
  severity?: NotionErrorSeverity;
  retryable?: boolean;
  recoverable?: boolean;
  details?: string;
}

export interface NotionError {
  id: string;
  type: NotionErrorType;
  message: string;
  severity: NotionErrorSeverity;
  timestamp: number;
  retryable: boolean;
  recoverable: boolean;
  originalError?: any;
  endpoint?: string;
  status?: number;
  operation?: string;
  context?: string;
}

// Types pour la file d'attente
export enum OperationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum RetryStrategy {
  IMMEDIATE = 'immediate',
  LINEAR = 'linear',
  EXPONENTIAL = 'exponential',
  CUSTOM = 'custom'
}

export interface RetryOperationOptions {
  maxRetries?: number;
  retryDelay?: number;
  strategy?: RetryStrategy;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

export interface QueuedOperation {
  id: string;
  name: string;
  operation: () => Promise<any>;
  status: OperationStatus;
  createdAt: number;
  updatedAt: number;
  executeAfter?: number;
  priority: number;
  attempt: number;
  maxRetries: number;
  lastError?: Error;
  description?: string;
  tags?: string[];
  result?: any;
  retryStrategy: RetryStrategy;
  silent?: boolean;
}

// Type de réponse API Notion
export interface NotionApiResponse<T> {
  object?: string;
  id?: string;
  results?: T[];
  properties?: Record<string, any>;
  title?: any;
  name?: string;
  created_time?: string;
  last_edited_time?: string;
  [key: string]: any;
}

// Types pour les bases de données
export interface NotionDatabase {
  id: string;
  properties: Record<string, any>;
  [key: string]: any;
}
