
/**
 * Types unifiés pour les erreurs Notion
 * Cette définition est compatible avec les différentes implémentations d'erreurs
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
  API = 'api',
  CONFIG = 'config',
  PROXY = 'proxy',
  UNKNOWN = 'unknown'
}

// Niveaux de sévérité des erreurs
export enum NotionErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Structure d'une erreur Notion
export interface NotionError {
  id: string;
  type: NotionErrorType;
  message: string;
  severity: NotionErrorSeverity;
  originalError?: any;
  context?: Record<string, any> | string;
  retryable: boolean;
  recoverable: boolean;
  recoveryActions?: string[];
  endpoint?: string;
  operation?: string;
  details?: string;
  status?: number;
  timestamp: number;
  cause?: Error;
  stack?: string;
  name?: string;
}

// Options pour la création d'erreurs Notion
export interface NotionErrorOptions {
  type?: NotionErrorType;
  severity?: NotionErrorSeverity;
  originalError?: any;
  context?: Record<string, any> | string;
  retryable?: boolean;
  recoverable?: boolean;
  recoveryActions?: string[];
  operation?: string;
  endpoint?: string;
  status?: number;
  cause?: Error;
  stack?: string;
  name?: string;
}

// Statut d'une opération dans la file d'attente
export enum OperationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Structure d'une opération dans la file d'attente
export interface QueuedOperation {
  id: string;
  name: string;
  operation: () => Promise<any>;
  retries: number;
  maxRetries: number;
  lastError?: Error;
  error?: Error;
  priority: number;
  tags: string[];
  status: OperationStatus;
  createdAt: number;
  updatedAt: number;
  description?: string;
  context?: string | Record<string, any>;
}

// Stratégie de retry pour les opérations
export enum RetryStrategy {
  EXPONENTIAL = 'exponential',
  LINEAR = 'linear',
  IMMEDIATE = 'immediate',
  FIXED = 'fixed'
}

// Type pour les abonnés aux erreurs
export type ErrorSubscriber = (errors: NotionError[]) => void;

// Niveau de logs
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

// Structure d'un log
export interface StructuredLog {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  tags?: string[];
  correlationId?: string;
}

// Message de log structuré
export interface StructuredLogMessage {
  message: string;
  context?: Record<string, any>;
  tags?: string[];
  correlationId?: string;
}

// Options pour le logger
export interface StructuredLoggerOptions {
  minLevel?: LogLevel;
  maxEntries?: number;
  persistLogs?: boolean;
  autoConsoleOutput?: boolean;
}

// Interface pour un logger structuré
export interface StructuredLogger {
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, context?: Record<string, any>): void;
  getLogs(): StructuredLog[];
  getRecentLogs(count?: number): StructuredLog[];
  clearLogs(): void;
}

// Configuration des seuils d'alerte
export interface AlertThresholdConfig {
  error?: number;
  warning?: number;
  critical?: number;
}

// Statistiques du compteur d'erreurs
export interface ErrorCounterStats {
  total: number;
  byType: { type: NotionErrorType; count: number }[];
  byEndpoint: { endpoint: string; count: number }[];
  recentErrors: NotionError[];
  alertLevel: 'normal' | 'warning' | 'error' | 'critical';
}

// Options pour le compteur d'erreurs
export interface ErrorCounterOptions {
  maxErrors?: number;
  resetAfter?: number;
  thresholds?: AlertThresholdConfig;
}
