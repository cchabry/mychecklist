
/**
 * Types d'erreurs pour l'application
 */

// Types d'erreurs possibles dans l'application
export enum ErrorType {
  // Erreurs de connexion
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  OFFLINE = 'offline',
  
  // Erreurs API
  API = 'api',
  NOTION_API = 'notion_api',
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  NOT_FOUND = 'not_found',
  
  // Erreurs d'application
  VALIDATION = 'validation',
  STATE = 'state',
  UNEXPECTED = 'unexpected',
  
  // Erreurs de configuration
  CONFIG = 'config',
  NOT_CONFIGURED = 'not_configured',
  
  // Types spécifiques pour l'affichage
  AUTH = 'auth',
  NOTION = 'notion',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}

/**
 * Interface pour les erreurs d'application standardisées
 */
export interface AppError extends Error {
  type: ErrorType;
  code?: string;
  status?: number;
  details?: any;
  timestamp?: number;
  context?: string;
  technicalMessage?: string; // Message technique pour les développeurs
}

/**
 * Créateur d'erreur d'application
 */
export function createAppError(
  message: string,
  type: ErrorType = ErrorType.UNEXPECTED,
  options: Partial<Omit<AppError, 'message' | 'type' | 'name'>> = {}
): AppError {
  const error = new Error(message) as AppError;
  error.type = type;
  error.name = `AppError:${type}`;
  error.timestamp = Date.now();
  
  // Ajouter les options supplémentaires
  if (options.code) error.code = options.code;
  if (options.status) error.status = options.status;
  if (options.details) error.details = options.details;
  if (options.context) error.context = options.context;
  if (options.technicalMessage) error.technicalMessage = options.technicalMessage;
  
  return error;
}

/**
 * Vérifie si une erreur est une erreur d'application
 */
export function isAppError(error: any): error is AppError {
  return error && typeof error === 'object' && 'type' in error;
}
