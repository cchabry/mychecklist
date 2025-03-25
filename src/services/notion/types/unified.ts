
/**
 * Types unifiés pour la gestion des erreurs Notion
 */

// Énumération des types d'erreurs possibles
export enum NotionErrorType {
  AUTH = 'auth',
  PERMISSION = 'permission',
  NOT_FOUND = 'not_found',
  VALIDATION = 'validation',
  RATE_LIMIT = 'rate_limit',
  TIMEOUT = 'timeout',
  CORS = 'cors',
  NETWORK = 'network',
  SERVER = 'server',
  DATABASE = 'database',
  UNKNOWN = 'unknown'
}

// Niveaux de sévérité des erreurs
export enum NotionErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Options pour la création d'erreurs Notion
export interface NotionErrorOptions {
  type?: NotionErrorType;
  severity?: NotionErrorSeverity;
  originalError?: any;
  context?: string;
  retryable?: boolean;
  endpoint?: string;
  status?: number;
}

// Structure d'une erreur Notion
export interface NotionError {
  id: string;
  type: NotionErrorType;
  message: string;
  severity: NotionErrorSeverity;
  originalError?: any;
  context?: string;
  retryable: boolean;
  endpoint?: string;
  status?: number;
  timestamp: number;
}

// Statut d'une opération dans la file d'attente
export enum OperationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Options pour une opération à réessayer
export interface RetryOperationOptions {
  maxRetries?: number;
  retryDelay?: number;
  priority?: number;
  tags?: string[];
  onSuccess?: (result: any) => void;
  onFailure?: (error: Error) => void;
  skipRetryIf?: (error: Error) => boolean;
}

// Structure d'une opération dans la file d'attente
export interface QueuedOperation {
  id: string;
  name: string;
  operation: () => Promise<any>;
  retries: number;
  maxRetries: number;
  lastError?: Error;
  priority: number;
  tags: string[];
  status: OperationStatus;
  createdAt: number;
  updatedAt: number;
  description?: string;
}

// Statistiques de la file d'attente
export interface RetryQueueStats {
  totalOperations: number;
  pendingOperations: number;
  completedOperations: number;
  failedOperations: number;
  successful: number;
  failed: number;
  lastProcessedAt: number | null;
  isProcessing: boolean;
}
