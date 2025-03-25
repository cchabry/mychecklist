
/**
 * Types unifiés pour la gestion des erreurs Notion
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Niveaux de journalisation
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
  TRACE = -1 // Pour rétrocompatibilité
}

/**
 * Types d'erreurs Notion
 */
export enum NotionErrorType {
  // Types principaux
  API = 'api',
  AUTH = 'auth',
  PERMISSION = 'permission',
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  DATABASE = 'database',
  CORS = 'cors',
  NOT_FOUND = 'not_found',
  VALIDATION = 'validation',
  CONFIG = 'config',
  SERVER = 'server',
  PROXY = 'proxy',
  RATE_LIMIT = 'rate_limit',
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
 * Options pour la création d'erreurs
 */
export interface NotionErrorOptions {
  type?: NotionErrorType;
  severity?: NotionErrorSeverity;
  retryable?: boolean;
  recoverable?: boolean;
  recoveryActions?: string[];
  operation?: string;
  details?: any;
  context?: string | Record<string, any>;
  stack?: string;
  cause?: Error | any;
}

/**
 * Structure standardisée des erreurs Notion
 */
export interface NotionError {
  id: string;
  message: string;
  type: NotionErrorType;
  severity: NotionErrorSeverity;
  timestamp: number;
  retryable: boolean;
  recoverable?: boolean;
  recoveryActions?: string[];
  operation?: string;
  context?: string | Record<string, any>;
  details?: any;
  stack?: string;
  originalError?: Error;
  cause?: Error | any;
}

/**
 * Fonction pour créer un ID d'erreur
 */
export function createErrorId(): string {
  return uuidv4();
}

/**
 * Type pour les abonnés aux erreurs
 */
export type ErrorSubscriber = (errors: NotionError[]) => void;

/**
 * Créateur d'erreurs
 */
export function createNotionError(
  messageOrError: string | Error,
  options: NotionErrorOptions = {}
): NotionError {
  // Récupérer le message d'erreur
  const message = typeof messageOrError === 'string' 
    ? messageOrError 
    : messageOrError.message || 'Erreur inconnue';
  
  // Créer l'objet d'erreur
  const error: NotionError = {
    id: uuidv4(),
    message,
    type: options.type || NotionErrorType.UNKNOWN,
    severity: options.severity || NotionErrorSeverity.ERROR,
    timestamp: Date.now(),
    retryable: options.retryable ?? false,
    recoverable: options.recoverable,
    recoveryActions: options.recoveryActions,
    operation: options.operation,
    context: options.context,
    details: options.details
  };
  
  // Ajouter la stack trace si disponible
  if (options.stack) {
    error.stack = options.stack;
  } else if (typeof messageOrError === 'object' && messageOrError instanceof Error) {
    error.stack = messageOrError.stack;
  }
  
  // Ajouter l'erreur originale
  if (typeof messageOrError === 'object' && messageOrError instanceof Error) {
    error.originalError = messageOrError;
  } else if (options.cause) {
    error.cause = options.cause;
  }
  
  return error;
}

/**
 * Mapper une ancienne erreur vers le nouveau format
 */
export function mapLegacyError(oldError: any): NotionError {
  if (!oldError) {
    return createNotionError('Erreur inconnue');
  }
  
  // Si c'est déjà une NotionError, la retourner telle quelle
  if (oldError.id && oldError.type && typeof oldError.timestamp === 'number') {
    return oldError as NotionError;
  }
  
  // Convertir une erreur ancien format
  return createNotionError(
    oldError.message || String(oldError),
    {
      type: mapLegacyErrorType(oldError.type),
      context: oldError.source || oldError.context,
      details: oldError.details || oldError.originalError,
      stack: oldError.stack
    }
  );
}

/**
 * Mapper les anciens types d'erreur vers les nouveaux
 */
function mapLegacyErrorType(legacyType: string): NotionErrorType {
  switch (legacyType) {
    case 'CONNECTION':
    case 'connection':
      return NotionErrorType.NETWORK;
    case 'AUTHENTICATION':
    case 'authentication':
      return NotionErrorType.AUTH;
    case 'PERMISSION':
    case 'permission':
      return NotionErrorType.PERMISSION;
    case 'VALIDATION':
    case 'validation':
      return NotionErrorType.VALIDATION;
    case 'RATE_LIMIT':
    case 'rate_limit':
      return NotionErrorType.RATE_LIMIT;
    case 'SERVER':
    case 'server':
      return NotionErrorType.SERVER;
    case 'not_found':
    case 'NOT_FOUND':
      return NotionErrorType.NOT_FOUND;
    default:
      return NotionErrorType.UNKNOWN;
  }
}
