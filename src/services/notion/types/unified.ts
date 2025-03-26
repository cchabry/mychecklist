
/**
 * Types unifiés pour les services Notion
 * Ce fichier centralise toutes les définitions de types utilisées à travers les services Notion
 */

// Types d'erreurs Notion
export enum NotionErrorType {
  // Erreurs authentification/autorisation
  AUTH = 'auth',
  PERMISSION = 'permission',
  
  // Erreurs de structure
  DATABASE = 'database',
  NOT_FOUND = 'not_found',
  VALIDATION = 'validation',
  
  // Erreurs de communication
  NETWORK = 'network',
  CORS = 'cors',
  TIMEOUT = 'timeout',
  RATE_LIMIT = 'rate_limit',
  
  // Erreurs serveur
  SERVER = 'server',
  
  // Erreurs applicatives
  APP_ERROR = 'app_error',
  
  // Autres
  UNKNOWN = 'unknown'
}

// Niveaux de sévérité des erreurs
export enum NotionErrorSeverity {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Structure d'une erreur Notion
export interface NotionError {
  // Identifiant unique de l'erreur
  id: string;
  
  // Message d'erreur utilisateur
  message: string;
  
  // Type d'erreur
  type: NotionErrorType;
  
  // Timestamp de l'erreur (epoch ms)
  timestamp: number;
  
  // Niveau de sévérité
  severity: NotionErrorSeverity;
  
  // Si l'erreur peut être réessayée
  retryable: boolean;
  
  // Contexte de l'erreur (chaîne ou objet)
  context?: string | Record<string, any>;
  
  // Détails supplémentaires
  details?: string | Record<string, any>;
  
  // Opération qui a causé l'erreur
  operation?: string;
  
  // Si l'erreur est récupérable
  recoverable?: boolean;
  
  // Actions de récupération suggérées
  recoveryActions?: string[];
  
  // Trace de la pile d'appels
  stack?: string;
  
  // Erreur originale
  originalError?: Error;
  
  // Cause sous-jacente (chaînage d'erreurs)
  cause?: Error | NotionError;
}

// Options pour créer une erreur Notion
export interface NotionErrorOptions {
  type?: NotionErrorType;
  severity?: NotionErrorSeverity;
  retryable?: boolean;
  context?: string | Record<string, any>;
  details?: string | Record<string, any>;
  operation?: string;
  recoverable?: boolean;
  recoveryActions?: string[];
  stack?: string;
  cause?: Error | NotionError;
}

// Type pour les abonnés aux notifications d'erreurs
export type ErrorSubscriber = (errors: NotionError[]) => void;

// Statistiques de file d'attente de réessais
export interface RetryQueueStats {
  pending: number;
  processing: number;
  success: number;
  failed: number;
  total: number;
  lastProcessed?: Date;
  lastError?: NotionError;
}

// État d'une opération dans la file d'attente
export type RetryOperationStatus = 'pending' | 'processing' | 'success' | 'failed' | 'completed';

// Options pour les opérations de réessai
export interface RetryOperationOptions {
  maxAttempts?: number;
  delayMs?: number;
  exponentialBackoff?: boolean;
  maxDelayMs?: number;
  onSuccess?: (result: any) => void;
  onFailure?: (error: Error | NotionError) => void;
}

// Type d'opération dans la file d'attente
export interface RetryOperation {
  id: string;
  operation: () => Promise<any>;
  context: string;
  timestamp: number;
  status: RetryOperationStatus;
  attempts: number;
  maxAttempts: number;
  nextRetry?: number;
  lastError?: Error | NotionError;
  result?: any;
}

// Structure pour la file d'attente des opérations à réessayer
export interface RetryQueue {
  getStats: () => RetryQueueStats;
  getOperations: () => RetryOperation[];
  addOperation: (operation: () => Promise<any>, context: string, options?: RetryOperationOptions) => string;
  retryOperation: (id: string) => Promise<boolean>;
  retryAllOperations: () => Promise<number>;
  removeOperation: (id: string) => boolean;
  clearOperations: () => void;
  processQueue: () => Promise<void>;
}

// Interface pour une réponse de l'API Notion
export interface NotionApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    status?: number;
  };
}

// Base de données Notion
export interface NotionDatabase {
  id: string;
  properties: Record<string, {
    id: string;
    name: string;
    type: string;
    [key: string]: any;
  }>;
  title?: string;
  name?: string;
  url?: string;
}

// Page Notion
export interface NotionPage {
  id: string;
  properties: Record<string, any>;
  url?: string;
  title?: string;
  parent?: {
    type: string;
    database_id?: string;
    page_id?: string;
  };
}

// Options de structuration des logs
export interface StructuredLoggerOptions {
  level: 'debug' | 'info' | 'warn' | 'error';
  maxEntries: number;
  includeTimestamp: boolean;
  printToConsole: boolean;
  persistLogs?: boolean;
  storageKey?: string;
}

// Message de log structuré
export interface StructuredLogMessage {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
  tags?: string[];
  source?: string;
  context?: Record<string, any>;
}

// Entrée de log structuré
export interface StructuredLogEntry extends StructuredLogMessage {
  id: string;
  timestamp: number; // En millisecondes
}

// Interface pour le logger structuré
export interface StructuredLogger {
  debug: (message: string, context?: Record<string, any>, tags?: string[]) => void;
  info: (message: string, context?: Record<string, any>, tags?: string[]) => void;
  warn: (message: string, context?: Record<string, any>, tags?: string[]) => void;
  error: (message: string, context?: Record<string, any>, tags?: string[]) => void;
  log: (level: 'debug' | 'info' | 'warn' | 'error', message: string, context?: Record<string, any>, tags?: string[]) => void;
  clear: () => void;
  getLogs: () => StructuredLogEntry[];
  getMessages: () => StructuredLogMessage[];
  setOptions: (options: Partial<StructuredLoggerOptions>) => void;
  getOptions: () => StructuredLoggerOptions;
}
