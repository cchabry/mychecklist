
// Types partagés pour les services Notion

/**
 * Niveaux de journalisation
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

/**
 * Types d'erreurs Notion
 */
export enum NotionErrorType {
  API_RESPONSE = 'api_response',
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  RATE_LIMIT = 'rate_limit',
  PERMISSIONS = 'permissions',
  DATABASE_STRUCTURE = 'database_structure',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown'
}

/**
 * Niveau de sévérité des erreurs
 */
export enum NotionErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Statut de token Notion
 */
export enum NotionTokenType {
  INTEGRATION = 'integration',
  OAUTH = 'oauth',
  UNKNOWN = 'unknown'
}

/**
 * Interface de base pour un message de log structuré
 */
export interface StructuredLogMessage {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: any;
  context?: Record<string, any>;
  source?: string;
}

/**
 * Options pour le logger structuré
 */
export interface StructuredLoggerOptions {
  minLevel: LogLevel;
  maxLogs: number;
  persistLogs: boolean;
  formatters?: {
    [key: string]: (value: any) => string;
  };
}

/**
 * Interface pour le logger structuré
 */
export interface StructuredLogger {
  debug(message: string, data?: any, context?: Record<string, any>): void;
  info(message: string, data?: any, context?: Record<string, any>): void;
  warn(message: string, data?: any, context?: Record<string, any>): void;
  error(message: string, data?: any | Error, context?: Record<string, any>): void;
  fatal(message: string, data?: any | Error, context?: Record<string, any>): void;
  getMessages(level?: LogLevel): StructuredLogMessage[];
  clear(): void;
  setMinLevel(level: LogLevel): void;
  configure?(options: Partial<StructuredLoggerOptions>): void;
}

/**
 * Options pour les opérations de réessai
 */
export interface RetryOperationOptions {
  maxRetries?: number;
  retryDelay?: number;
  maxDelay?: number;
  backoff?: number;
  onSuccess?: (result: any) => void;
  onFailure?: (error: Error) => void;
  skipRetryIf?: (error: Error) => boolean;
}

/**
 * Statistiques de la file d'attente de réessai
 */
export interface RetryQueueStats {
  totalOperations: number;
  pendingOperations: number;
  completedOperations: number;
  failedOperations: number;
  successful?: number;  // Pour compatibilité avec les implémentations existantes
  failed?: number;      // Pour compatibilité avec les implémentations existantes
  lastProcessedAt: number | null;
  isProcessing: boolean;
}

/**
 * Opération en file d'attente
 */
export interface QueuedOperation {
  id: string;
  context: string | Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  nextRetry?: number | Date;
  error?: Error;
  result?: any;
  addedAt?: number;
}

/**
 * Interface pour le service de file d'attente de réessai
 */
export interface RetryQueueService {
  enqueue<T>(
    operation: () => Promise<T>, 
    context?: string | Record<string, any>,
    options?: RetryOperationOptions
  ): string;
  processQueue(): Promise<void>;
  getStats(): RetryQueueStats;
  cancel?(operationId: string): boolean;
  clearQueue?(): void;
  processNow?(operationId: string): Promise<any>;
  subscribe?(callback: (stats: RetryQueueStats) => void): () => void;
  getQueuedOperations?(): QueuedOperation[];
}

/**
 * Informations sur une erreur Notion
 */
export interface NotionErrorInfo {
  id: string;
  timestamp: Date;
  type: NotionErrorType;
  severity: NotionErrorSeverity;
  message: string;
  details?: any;
  context?: string;
  httpStatus?: number;
  endpoint?: string;
  retryable: boolean;
  resolved: boolean;
  stackTrace?: string;
}

/**
 * Options pour rapporter une erreur
 */
export interface ReportErrorOptions {
  severity?: NotionErrorSeverity;
  type?: NotionErrorType;
  context?: string;
  details?: any;
  showToast?: boolean;
  toastMessage?: string;
  retryable?: boolean;
}

/**
 * Interface pour le service d'erreur Notion
 */
export interface NotionErrorService {
  reportError(error: Error, context?: string, options?: ReportErrorOptions): string;
  getErrors(): NotionErrorInfo[];
  getErrorCount(): number;
  setResolved(errorId: string, resolved?: boolean): boolean;
  clearErrors(): void;
  hasErrors(severity?: NotionErrorSeverity): boolean;
  getMostRecentError(): NotionErrorInfo | null;
  subscribe?(callback: (errors: NotionErrorInfo[]) => void): () => void;
}
