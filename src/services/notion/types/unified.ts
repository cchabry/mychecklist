
/**
 * Types unifiés pour le système de gestion d'erreurs Notion
 * Ce fichier centralise tous les types liés aux erreurs pour éviter les conflits
 */

// Énumération des types d'erreurs possibles dans l'API Notion
export enum NotionErrorType {
  // Erreurs d'authentification et d'autorisation
  AUTH = 'auth_error',
  PERMISSION = 'permission_error',
  
  // Erreurs réseau et API
  NETWORK = 'network_error',
  TIMEOUT = 'timeout_error',
  RATE_LIMIT = 'rate_limit_error',
  CORS = 'cors_error',
  SERVER = 'server_error',
  API = 'api_error',
  PROXY = 'proxy_error',
  
  // Erreurs liées aux données
  VALIDATION = 'validation_error',
  NOT_FOUND = 'not_found_error',
  DATABASE = 'database_error',
  
  // Erreurs liées à la config et au système
  CONFIG = 'config_error',
  APP_ERROR = 'app_error',
  
  // Autre
  UNKNOWN = 'unknown_error'
}

// Niveaux de sévérité pour les erreurs
export enum NotionErrorSeverity {
  DEBUG = 'debug',      // Pour le développement uniquement
  INFO = 'info',        // Information qui ne nécessite pas d'action
  WARNING = 'warning',  // Nécessite attention mais n'empêche pas le fonctionnement
  ERROR = 'error',      // Erreur qui empêche une fonctionnalité
  CRITICAL = 'critical', // Erreur qui empêche l'application de fonctionner
  FATAL = 'fatal'       // Erreur catastrophique
}

// Options configurables pour les erreurs
export interface NotionErrorOptions {
  // Propriétés optionnelles d'une erreur
  severity?: NotionErrorSeverity;
  details?: any;
  stack?: string;
  cause?: Error | unknown;
  timestamp?: number;
  context?: string | Record<string, any>;
  operation?: string;
  retryable?: boolean;
  recoverable?: boolean;
  recoveryActions?: Array<{
    label: string;
    action: () => void;
  }>;
  showToast?: boolean;
}

// Structure d'une erreur Notion
export interface NotionError {
  // Identifiant unique de l'erreur
  id: string;
  
  // Informations de base
  message: string;
  type: NotionErrorType;
  severity: NotionErrorSeverity;
  timestamp: number;
  
  // Propriétés optionnelles
  details?: any;
  stack?: string;
  cause?: Error | unknown;
  originalError?: Error;
  
  // Métadonnées contextuelles
  context?: string | Record<string, any>;
  operation?: string;
  
  // Comportement
  retryable: boolean;
  recoverable?: boolean;
  recoveryActions?: Array<{
    label: string;
    action: () => void;
  }>;
}

// Type pour les callbacks de notification d'erreurs
export type ErrorSubscriber = (errors: NotionError[]) => void;

// Structure pour les opérations de réessai
export interface RetryOperation {
  id: string;
  operation: () => Promise<any>;
  context: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  attempts: number;
  maxAttempts: number;
  lastAttempt?: number;
  error?: NotionError;
  result?: any;
  priority: number;
  createdAt: number;
}

// Options pour les opérations de réessai
export interface RetryOperationOptions {
  maxAttempts?: number;
  priority?: number;
  onSuccess?: (result: any) => void;
  onFailure?: (error: NotionError) => void;
}

// Statistiques de la file d'attente de réessai
export interface RetryQueueStats {
  total: number;
  pending: number;
  processing: number;
  success: number;
  failed: number;
  successRate: number;
  avgAttempts: number;
  successful?: number; // Pour la rétrocompatibilité
}

// Pour la surveillance (monitoring)
export interface ErrorCounterOptions {
  windowSize?: number;        // Taille de la fenêtre en ms
  alertThresholds?: AlertThresholdConfig;
  persistStats?: boolean;     // Persister les statistiques
  autoReset?: boolean;        // Réinitialiser automatiquement
}

export interface AlertThresholdConfig {
  byType?: Record<NotionErrorType, number>;
  byEndpoint?: Record<string, number>;
  totalErrors?: number;
  criticalErrors?: number;
}

export interface ErrorCounterStats {
  totalErrors: number;
  errorsByType: Array<{ type: NotionErrorType; count: number }>;
  errorsByEndpoint: Array<{ endpoint: string; count: number }>;
  criticalErrors: number;
  startTime: number;
  lastError?: NotionError;
  alerts: Array<{
    message: string;
    threshold: number;
    current: number;
    timestamp: number;
    type: 'type' | 'endpoint' | 'total' | 'critical';
    key?: string;
  }>;
}

// Types pour le système de logs structurés
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  FATAL = 'fatal'
}

export interface StructuredLoggerOptions {
  minLevel?: LogLevel;
  maxEntries?: number;
  console?: boolean;
  allowFiltering?: boolean;
  persistLogs?: boolean;
  sources?: string[];
}

export interface StructuredLogMessage {
  message: string;
  level: LogLevel;
  timestamp: number;
  source: string[];
  data?: Record<string, any>;
  error?: Error | NotionError;
  context?: Record<string, any> | string;
}

export interface StructuredLogEntry extends StructuredLogMessage {
  id: string;
  timestamp: Date;
  source: string;
}

export type StructuredLog = StructuredLogEntry;

export interface StructuredLogger {
  log(message: string, level?: LogLevel, data?: any): void;
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, error?: Error | any, data?: any): void;
  fatal?(message: string, error?: Error | any, data?: any): void;
  
  getEntries(): StructuredLogEntry[];
  clearEntries(): void;
  
  addSource(source: string): void;
  removeSource(source: string): void;
  
  setMinLevel(level: LogLevel): void;
  getOptions(): StructuredLoggerOptions;
  configure(options: Partial<StructuredLoggerOptions>): void;
}

// Types pour les tests de connexion Notion
export interface NotionConnectionTestResult {
  success: boolean;
  error?: string;
  details?: any;
  user?: string;
  projectsDbName?: string;
  checklistsDbName?: string;
  hasChecklistsDb?: boolean;
}

