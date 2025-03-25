
/**
 * Types pour la gestion d'erreur
 */

import { v4 as uuidv4 } from 'uuid';

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
  context?: string;        // Contexte d'erreur
  originError?: Error;     // Erreur d'origine
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
  cause?: Error | unknown; // Cause de l'erreur (pour les erreurs chaînées)
}

/**
 * Options pour la création d'erreur
 */
export interface NotionErrorOptions {
  type?: NotionErrorType;
  operation?: string;
  context?: string;
  details?: any;
  retryable?: boolean;
  severity?: NotionErrorSeverity;
  recoverable?: boolean;
  recoveryActions?: Array<{
    label: string;
    action: () => void;
  }>;
  cause?: Error | unknown;
}

/**
 * Options pour signaler une erreur
 */
export interface ReportErrorOptions extends NotionErrorOptions {
  showToast?: boolean;
  logToConsole?: boolean;
}

/**
 * Gestion des abonnements aux erreurs
 */
export interface ErrorSubscriber {
  id: string;
  callback: (errors: NotionError[]) => void;
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
 * Création d'un ID unique pour les erreurs
 */
export const createErrorId = (): string => {
  return uuidv4();
};
