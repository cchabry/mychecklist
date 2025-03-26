
/**
 * Types centralisés pour la gestion des erreurs Notion
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

// Types pour les opérations à réessayer
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
