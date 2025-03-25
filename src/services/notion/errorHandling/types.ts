
/**
 * Types pour la gestion d'erreur
 */

/**
 * Types d'erreurs Notion
 */
export enum NotionErrorType {
  AUTH = 'auth',               // Erreurs d'authentification
  PERMISSION = 'permission',   // Problèmes de permission
  RATE_LIMIT = 'rate_limit',   // Limite de requêtes
  NETWORK = 'network',         // Problèmes réseau
  TIMEOUT = 'timeout',         // Délais d'attente
  DATABASE = 'database',       // Erreurs de base de données
  VALIDATION = 'validation',   // Erreurs de validation
  NOT_FOUND = 'not_found',     // Ressource non trouvée
  SERVER = 'server',           // Erreurs serveur
  CORS = 'cors',               // Problèmes CORS
  PROXY = 'proxy',             // Erreurs de proxy
  CONFIG = 'config',           // Erreurs de configuration
  API = 'api',                 // Erreurs API génériques
  UNKNOWN = 'unknown'          // Type inconnu
}

/**
 * Niveaux de gravité des erreurs
 */
export enum NotionErrorSeverity {
  DEBUG = 'debug',        // Informations de débogage
  INFO = 'info',          // Informations générales
  WARNING = 'warning',    // Avertissements
  ERROR = 'error',        // Erreurs standards
  CRITICAL = 'critical'   // Erreurs critiques
}

/**
 * Interface détaillée d'une erreur Notion
 */
export interface NotionError {
  id: string;              // Identifiant unique
  timestamp: number;       // Timestamp de l'erreur
  message: string;         // Message d'erreur
  type: NotionErrorType;   // Type d'erreur
  operation?: string;      // Opération en cours
  context?: string | Record<string, any>;        // Contexte d'erreur
  cause?: Error | unknown; // Cause de l'erreur (pour les erreurs chaînées)
  details?: any;           // Détails supplémentaires
  retryable: boolean;      // Si l'erreur peut être réessayée
  name: string;            // Nom de l'erreur
  stack?: string;          // Stack trace
  severity: NotionErrorSeverity; // Niveau de gravité
  recoverable: boolean;    // Si l'erreur est récupérable
  recoveryActions?: Array<{
    label: string;         // Libellé de l'action
    action: () => void;    // Fonction à exécuter
  }>;
}

/**
 * Options pour la création d'erreur
 */
export interface NotionErrorOptions {
  type?: NotionErrorType;
  operation?: string;
  context?: string | Record<string, any>;
  details?: any;
  retryable?: boolean;
  severity?: NotionErrorSeverity;
  recoverable?: boolean;
  recoveryActions?: Array<{
    label: string;
    action: () => void;
  }>;
  cause?: Error | unknown;
  name?: string;           // Ajout du champ name manquant
  stack?: string;          // Ajout du stack pour plus de flexibilité
}

/**
 * Options pour signaler une erreur
 */
export interface ReportErrorOptions extends NotionErrorOptions {
  showToast?: boolean;
  logToConsole?: boolean;
}

/**
 * Fonction pour recevoir les notifications d'erreurs
 */
export type ErrorSubscriber = (errors: NotionError[]) => void;

/**
 * Abonnement aux erreurs
 */
export interface ErrorSubscription {
  id: string;
  callback: ErrorSubscriber;
}

/**
 * Options d'une opération à réessayer
 */
export interface RetryOperationOptions {
  maxRetries?: number;       // Nombre maximal de tentatives
  retryDelay?: number;       // Délai entre les tentatives (ms)
  backoff?: boolean;         // Si le délai doit augmenter exponentiellement
  context?: string;          // Contexte de l'opération
  onSuccess?: (result: any) => void;  // Callback de succès
  onFailure?: (error: Error) => void; // Callback d'échec
  skipRetryIf?: (error: Error) => boolean; // Condition pour sauter la réessai
}

/**
 * Statistiques de la file d'attente de réessai
 */
export interface RetryQueueStats {
  totalOperations: number;         // Nombre total d'opérations traitées
  pendingOperations: number;       // Opérations en attente
  completedOperations: number;     // Opérations réussies
  failedOperations: number;        // Opérations échouées définitivement
  lastProcessedAt: number | null;  // Dernier traitement
  isProcessing: boolean;           // Si le traitement est en cours
}

/**
 * Format de log structuré
 */
export interface StructuredLog {
  timestamp: number;         // Horodatage
  level: LogLevel;           // Niveau de log
  message: string;           // Message principal
  context?: Record<string, any>;  // Contexte supplémentaire
  error?: {                  // Détails d'erreur (si applicable)
    message: string;
    type?: NotionErrorType;
    stack?: string;
  };
  source?: string;           // Source du log (composant, service)
  tags?: string[];           // Tags pour le filtrage et la recherche
}

/**
 * Niveaux de log
 */
export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

/**
 * Statistiques de compteur d'erreurs
 */
export interface ErrorCounterStats {
  total: number;                       // Nombre total d'erreurs
  byType: Record<NotionErrorType, number>;  // Erreurs par type
  byEndpoint: Record<string, number>;      // Erreurs par endpoint
  byHour: Record<number, number>;          // Erreurs par heure
  byMinute: Record<number, number>;        // Erreurs par minute
  lastError?: {                           // Dernière erreur
    timestamp: number;
    message: string;
    type: NotionErrorType;
  };
}

/**
 * Configuration des seuils d'alerte
 */
export interface AlertThresholdConfig {
  errorRatePerMinute?: number;        // Seuil de taux d'erreur par minute
  errorRatePerHour?: number;          // Seuil de taux d'erreur par heure
  consecutiveFailures?: number;       // Nombre d'échecs consécutifs
  byErrorType?: Partial<Record<NotionErrorType, number>>;  // Seuils par type d'erreur
  byEndpoint?: Record<string, number>;  // Seuils par endpoint
}

// Alias pour la compatibilité avec les anciens fichiers
export type NotionErrorSubscriber = ErrorSubscriber;
