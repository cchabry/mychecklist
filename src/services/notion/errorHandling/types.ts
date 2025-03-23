
/**
 * Types d'erreurs Notion
 */
export enum NotionErrorType {
  API = 'api',
  CORS = 'cors',
  DATABASE = 'database',
  AUTHENTICATION = 'authentication',
  NETWORK = 'network',
  UNKNOWN = 'unknown'
}

/**
 * Structure d'une erreur Notion enrichie
 */
export interface NotionError {
  id: string;
  timestamp: number;
  message: string;
  type: NotionErrorType;
  operation?: string;
  context?: string;
  originError?: Error;
  details?: any;
  retryable?: boolean;
}

/**
 * Paramètres pour rapporter une erreur
 */
export interface ReportErrorOptions {
  operation?: string;
  context?: string;
  type?: NotionErrorType;
  details?: any;
  retryable?: boolean;
}

/**
 * Structure pour les abonnés aux erreurs
 */
export interface ErrorSubscriber {
  id: string;
  callback: (errors: NotionError[]) => void;
}

/**
 * Structure pour les opérations de retry
 */
export interface RetryOperation {
  id: string;
  timestamp: number;
  operation: string;
  context?: string;
  retryFn: () => Promise<any>;
  maxRetries: number;
  currentRetries: number;
  lastError?: Error;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

/**
 * Statistiques de la file d'attente de retry
 */
export interface RetryQueueStats {
  pendingOperations: number;
  completedOperations: number;
  failedOperations: number;
  totalOperations: number;
  lastProcessedAt: number | null;
}

/**
 * Callbacks pour la file d'attente de retry
 */
export interface RetryQueueCallbacks {
  onSuccess?: (operation: RetryOperation) => void;
  onFailure?: (operation: RetryOperation, error: Error) => void;
  onProcessingStart?: () => void;
  onProcessingComplete?: (stats: RetryQueueStats) => void;
}
