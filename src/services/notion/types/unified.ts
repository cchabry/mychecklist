
/**
 * Types unifiés pour le système d'erreurs Notion
 */

// Types d'erreurs Notion
export enum NotionErrorType {
  UNKNOWN = 'unknown',
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  AUTH = 'auth',
  PERMISSION = 'permission',
  NOT_FOUND = 'not_found',
  VALIDATION = 'validation',
  RATE_LIMIT = 'rate_limit',
  SERVER = 'server',
  API = 'api',
  DATABASE = 'database',
  CORS = 'cors',
  PROXY = 'proxy',
  CONFIG = 'config'
}

// Niveaux de sévérité des erreurs
export enum NotionErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Interface d'erreur Notion unifiée
export interface NotionError {
  id: string;               // Identifiant unique de l'erreur
  message: string;          // Message d'erreur
  type: NotionErrorType;    // Type d'erreur
  timestamp: number;        // Horodatage de l'erreur
  severity: NotionErrorSeverity; // Sévérité
  retryable: boolean;       // Si l'opération peut être réessayée
  
  // Propriétés optionnelles
  operation?: string;       // Opération en cours lors de l'erreur
  context?: string | Record<string, any>; // Contexte supplémentaire
  original?: Error;         // Erreur originale
  stack?: string;           // Stacktrace
}

// Options pour créer une erreur
export interface NotionErrorOptions {
  severity?: NotionErrorSeverity;
  retryable?: boolean;
  context?: string | Record<string, any>;
  operation?: string;
  cause?: Error;
  stack?: string;
  recoveryActions?: Array<{
    label: string;
    action: () => void;
  }>;
  recoverable?: boolean;
  name?: string;
  details?: string;
  type?: NotionErrorType;
}

// Interface pour les statistiques d'erreurs
export interface ErrorCounterStats {
  total: number;
  byType: Partial<Record<NotionErrorType, number>>;
  byEndpoint: Record<string, number>;
  byHour: Record<string, number>; 
  byMinute: Record<string, number>;
}

// Configuration des seuils d'alerte
export interface AlertThresholdConfig {
  totalErrorsPerHour?: number;
  totalErrorsPerMinute?: number;
  apiErrorsPerHour?: number;
  networkErrorsPerMinute?: number;
  authErrorsPerHour?: number;
}

// Options pour le compteur d'erreurs
export interface ErrorCounterOptions {
  maxStorageTime?: number;
  cleanupInterval?: number;
}

// Types pour la file d'attente de réessai
export interface QueuedOperation {
  id: string;
  operation: () => Promise<any>;
  context: string;
  attempts: number;
  maxAttempts: number;
  lastAttempt: number;
  error?: Error;
  status: 'pending' | 'processing' | 'success' | 'failed';
}

export interface RetryQueueStats {
  pendingOperations: number;
  completedOperations: number;
  failedOperations: number;
  isProcessing: boolean;
  isPaused: boolean;
  totalOperations: number;
}

export interface RetryOperationOptions {
  priority?: number;
  maxAttempts?: number;
  delayBetweenAttempts?: number;
}

// Types pour le logger structuré
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

export interface StructuredLogMessage {
  level: LogLevel;
  message: string;
  timestamp: number;
  source?: string;
  data?: any;
}

export interface StructuredLog extends StructuredLogMessage {
  id: string;
}

export interface StructuredLoggerOptions {
  minLevel?: LogLevel;
  maxLogs?: number;
  persistent?: boolean;
}

export interface StructuredLogger {
  log: (level: LogLevel, message: string, data?: any) => void;
  debug: (message: string, data?: any) => void;
  info: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  error: (message: string, data?: any, context?: Record<string, any>) => void;
  fatal?: (message: string, data?: any) => void;
  trace: (message: string, data?: any) => void;
  getRecentLogs: () => StructuredLog[];
  subscribe: (callback: (logs: StructuredLog[]) => void) => () => void;
  getMinLevel: () => LogLevel;
  setMinLevel: (level: LogLevel) => void;
  exportLogs: () => string;
  configure?: (options: Partial<StructuredLoggerOptions>) => void;
  clear?: () => void;
}
