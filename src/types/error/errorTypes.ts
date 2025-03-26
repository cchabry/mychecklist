
/**
 * Types d'erreurs pour l'application
 * 
 * Ce module définit la structure des erreurs standardisées dans l'application
 * et fournit les utilitaires pour créer et vérifier les erreurs.
 */

/**
 * Types d'erreurs possibles dans l'application
 * 
 * Cette énumération définit tous les types d'erreurs que l'application
 * peut rencontrer et traiter de manière spécifique.
 */
export enum ErrorType {
  // Erreurs de connexion
  /** Erreur de réseau (requête impossible) */
  NETWORK = 'network',
  /** Délai d'attente dépassé */
  TIMEOUT = 'timeout',
  /** Appareil hors ligne */
  OFFLINE = 'offline',
  
  // Erreurs API
  /** Erreur générique d'API */
  API = 'api',
  /** Erreur spécifique à l'API Notion */
  NOTION_API = 'notion_api',
  /** Non authentifié (401) */
  UNAUTHORIZED = 'unauthorized',
  /** Non autorisé (403) */
  FORBIDDEN = 'forbidden',
  /** Ressource non trouvée (404) */
  NOT_FOUND = 'not_found',
  
  // Erreurs d'application
  /** Erreur de validation de données */
  VALIDATION = 'validation',
  /** Erreur d'état de l'application */
  STATE = 'state',
  /** Erreur non prévue */
  UNEXPECTED = 'unexpected',
  
  // Erreurs de configuration
  /** Erreur de configuration générale */
  CONFIG = 'config',
  /** Application non configurée */
  NOT_CONFIGURED = 'not_configured',
  
  // Types spécifiques pour l'affichage
  /** Erreur d'authentification */
  AUTH = 'auth',
  /** Erreur liée à Notion */
  NOTION = 'notion',
  /** Erreur serveur */
  SERVER = 'server',
  /** Erreur de type inconnu */
  UNKNOWN = 'unknown'
}

/**
 * Interface pour les erreurs d'application standardisées
 * 
 * Étend l'interface Error native avec des propriétés supplémentaires
 * permettant une gestion plus fine des erreurs dans l'application.
 */
export interface AppError extends Error {
  /** Type d'erreur (catégorisation) */
  type: ErrorType;
  /** Code d'erreur optionnel (spécifique à l'API ou au système) */
  code?: string;
  /** Code de statut HTTP (pour les erreurs d'API) */
  status?: number;
  /** Détails supplémentaires sur l'erreur */
  details?: any;
  /** Timestamp de l'erreur */
  timestamp?: number;
  /** Contexte dans lequel l'erreur s'est produite */
  context?: string;
  /** Message technique pour le débogage (non affiché à l'utilisateur) */
  technicalMessage?: string;
}

/**
 * Crée une erreur d'application standardisée
 * 
 * @param message - Message d'erreur principal (affiché à l'utilisateur)
 * @param type - Type d'erreur (défaut: UNEXPECTED)
 * @param options - Options supplémentaires pour l'erreur
 * @returns Une erreur standardisée au format AppError
 * 
 * @example
 * ```ts
 * throw createAppError(
 *   "Impossible de charger les projets",
 *   ErrorType.API,
 *   { status: 500, code: "SERVER_ERROR" }
 * );
 * ```
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
 * 
 * @param error - L'erreur à vérifier
 * @returns true si l'erreur est au format AppError, false sinon
 */
export function isAppError(error: any): error is AppError {
  return error && typeof error === 'object' && 'type' in error;
}
