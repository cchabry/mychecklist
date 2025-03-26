
/**
 * Définitions unifiées des types pour les services Notion
 */

/**
 * Types d'erreurs Notion
 */
export enum NotionErrorType {
  // Erreurs générales
  UNKNOWN = 'unknown',
  VALIDATION = 'validation',
  
  // Erreurs d'authentification et de permission
  AUTH = 'auth',
  PERMISSION = 'permission',
  
  // Erreurs réseau
  NETWORK = 'network',
  CORS = 'cors',
  TIMEOUT = 'timeout',
  RATE_LIMIT = 'rate_limit',
  
  // Erreurs de ressource
  NOT_FOUND = 'not_found',
  DATABASE = 'database',
  
  // Erreurs API
  API = 'api',
  SERVER = 'server',
  
  // Erreurs configuration
  CONFIG = 'config',
  
  // Erreurs proxy
  PROXY = 'proxy'
}

/**
 * Niveaux de sévérité des erreurs
 */
export enum NotionErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Options pour la création d'erreurs
 */
export interface NotionErrorOptions {
  /** Niveau de sévérité de l'erreur */
  severity?: NotionErrorSeverity;
  
  /** Indique si l'erreur peut être réessayée */
  retryable?: boolean;
  
  /** Informations supplémentaires sur l'erreur */
  details?: any;
  
  /** Contexte dans lequel l'erreur s'est produite */
  context?: string | Record<string, any>;
  
  /** Stack trace de l'erreur */
  stack?: string;
  
  /** Cause de l'erreur */
  cause?: Error;
  
  /** Opération qui a échoué */
  operation?: string;
  
  /** Indique si l'erreur peut être corrigée */
  recoverable?: boolean;
  
  /** Actions de récupération possibles */
  recoveryActions?: Array<{
    id: string;
    label: string;
    action: () => Promise<void> | void;
  }>;
}

/**
 * Structure standardisée d'une erreur Notion
 */
export interface NotionError {
  /** Identifiant unique de l'erreur */
  id: string;
  
  /** Message d'erreur */
  message: string;
  
  /** Type d'erreur */
  type: NotionErrorType;
  
  /** Horodatage de l'erreur */
  timestamp: number;
  
  /** Niveau de sévérité */
  severity: NotionErrorSeverity;
  
  /** Indique si l'erreur peut être réessayée */
  retryable: boolean;
  
  /** Cause de l'erreur (erreur d'origine) */
  originalError?: Error;
  
  /** Cause de l'erreur (si différente de originalError) */
  cause?: Error;
  
  /** Contexte dans lequel l'erreur s'est produite */
  context?: string | Record<string, any>;
  
  /** Informations supplémentaires sur l'erreur */
  details?: any;
  
  /** Stack trace de l'erreur */
  stack?: string;
  
  /** Opération qui a échoué */
  operation?: string;
  
  /** Indique si l'erreur peut être corrigée */
  recoverable?: boolean;
  
  /** Actions de récupération possibles */
  recoveryActions?: Array<{
    id: string;
    label: string;
    action: () => Promise<void> | void;
  }>;
}

/**
 * Fonction d'abonnement aux erreurs
 */
export type ErrorSubscriber = (errors: NotionError[]) => void;

/**
 * Options pour les opérations de réessai
 */
export interface RetryOperationOptions {
  /** Nombre maximum de tentatives */
  maxRetries?: number;
  
  /** Délai entre les tentatives (en ms) */
  retryDelay?: number;
  
  /** Facteur d'augmentation du délai entre les tentatives */
  backoffFactor?: number;
  
  /** Priorité de l'opération */
  priority?: 'low' | 'normal' | 'high';
  
  /** Fonction de callback en cas de succès */
  onSuccess?: (result: any) => void;
  
  /** Fonction de callback en cas d'échec */
  onError?: (error: Error) => void;
}

/**
 * Définition d'une opération de réessai
 */
export interface RetryOperation {
  /** Identifiant unique de l'opération */
  id: string;
  
  /** Fonction à exécuter */
  operation: () => Promise<any>;
  
  /** Contexte de l'opération */
  context: string;
  
  /** Options de réessai */
  options: RetryOperationOptions;
  
  /** Nombre de tentatives effectuées */
  attempts: number;
  
  /** Statut de l'opération */
  status: 'pending' | 'processing' | 'success' | 'failed';
  
  /** Date de création */
  createdAt: number;
  
  /** Date de dernière mise à jour */
  updatedAt: number;
  
  /** Résultat de l'opération */
  result?: any;
  
  /** Erreur rencontrée */
  error?: Error;
}

/**
 * Définition d'une opération en file d'attente
 */
export interface QueuedOperation extends RetryOperation {
  /** Délai avant la prochaine tentative */
  nextRetryAt?: number;
  
  /** Priorité calculée de l'opération */
  computedPriority: number;
}

/**
 * Statistiques de la file d'attente de réessai
 */
export interface RetryQueueStats {
  /** Nombre total d'opérations */
  totalOperations: number;
  
  /** Nombre d'opérations en attente */
  pendingOperations: number;
  
  /** Nombre d'opérations réussies */
  completedOperations: number;
  
  /** Nombre d'opérations échouées */
  failedOperations: number;
  
  /** Indique si la file d'attente est en cours de traitement */
  isProcessing: boolean;
  
  /** Indique si la file d'attente est en pause */
  isPaused: boolean;
  
  /** Taux de réussite */
  successRate: number;
}

/**
 * Types pour la journalisation structurée
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * Structure d'un message de journal
 */
export interface StructuredLogMessage {
  /** Niveau de journalisation */
  level: LogLevel;
  
  /** Message de journal */
  message: string;
  
  /** Source du message */
  source: string[];
  
  /** Horodatage */
  timestamp: number;
  
  /** Données associées au message */
  data?: Record<string, any>;
}

/**
 * Entrée de journal structuré
 */
export interface StructuredLogEntry extends StructuredLogMessage {
  /** Identifiant unique */
  id: string;
  
  /** Horodatage (sous forme de Date) */
  timestamp: Date;
}

/**
 * Options pour la configuration du logger structuré
 */
export interface StructuredLoggerOptions {
  /** Activer la journalisation dans la console */
  consoleEnabled?: boolean;
  
  /** Activer le stockage des journaux */
  storageEnabled?: boolean;
  
  /** Nombre maximum de journaux à stocker */
  maxLogs?: number;
  
  /** Niveau minimum de journalisation */
  minLevel?: LogLevel;
  
  /** Filtre sur les sources */
  sourceFilter?: string[];
}

/**
 * Interface du logger structuré
 */
export interface StructuredLogger {
  /** Journal un message de niveau debug */
  debug: (message: string, data?: Record<string, any>) => void;
  
  /** Journal un message de niveau info */
  info: (message: string, data?: Record<string, any>) => void;
  
  /** Journal un message de niveau warning */
  warn: (message: string, data?: Record<string, any>) => void;
  
  /** Journal un message de niveau error */
  error: (message: string, data?: Record<string, any>) => void;
  
  /** Récupère tous les journaux */
  getLogs: () => StructuredLogEntry[];
  
  /** Récupère les journaux filtrés */
  getFilteredLogs: (filter: {
    level?: LogLevel;
    source?: string | string[];
    search?: string;
    startTime?: number;
    endTime?: number;
  }) => StructuredLogEntry[];
  
  /** Efface tous les journaux */
  clearLogs: () => void;
  
  /** Définit le niveau minimum de journalisation */
  setMinLevel: (level: LogLevel) => void;
  
  /** Exporte les journaux au format JSON */
  exportLogs: () => string;
  
  /** Configure le logger */
  configure: (options: Partial<StructuredLoggerOptions>) => void;
}

/**
 * Statistiques du compteur d'erreurs
 */
export interface ErrorCounterStats {
  /** Nombre total d'erreurs */
  totalErrors: number;
  
  /** Nombre d'erreurs par type */
  errorsByType: Array<{ type: NotionErrorType; count: number }>;
  
  /** Nombre d'erreurs par endpoint */
  errorsByEndpoint: Array<{ endpoint: string; count: number }>;
  
  /** Taux d'erreur global */
  errorRate: number;
  
  /** Horodatage de la dernière erreur */
  lastErrorTime?: number;
}

/**
 * Configuration des seuils d'alerte
 */
export interface AlertThresholdConfig {
  /** Nombre total d'erreurs avant alerte */
  totalErrors?: number;
  
  /** Nombre d'erreurs par type avant alerte */
  errorsByType?: Partial<Record<NotionErrorType, number>>;
  
  /** Nombre d'erreurs par endpoint avant alerte */
  errorsByEndpoint?: Record<string, number>;
  
  /** Taux d'erreur avant alerte */
  errorRate?: number;
}

/**
 * Options pour le compteur d'erreurs
 */
export interface ErrorCounterOptions {
  /** Période de réinitialisation des compteurs (en ms) */
  resetPeriod?: number;
  
  /** Configuration des seuils d'alerte */
  alertThresholds?: AlertThresholdConfig;
  
  /** Fonction de callback en cas d'alerte */
  onAlert?: (stats: ErrorCounterStats, thresholds: AlertThresholdConfig) => void;
}

/**
 * Réponse API standardisée Notion
 */
export interface NotionApiResponse<T = any> {
  /** Indique si la requête a réussi */
  success: boolean;
  
  /** Données retournées si succès */
  data?: T;
  
  /** Informations d'erreur si échec */
  error?: {
    /** Message d'erreur */
    message: string;
    
    /** Détails supplémentaires */
    details?: any;
    
    /** Code d'erreur */
    code?: string;
  };
}
