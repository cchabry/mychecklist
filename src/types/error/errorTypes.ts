
/**
 * Types d'erreurs standardisés pour l'application
 */

/**
 * Types d'erreurs possibles dans l'application
 */
export enum ErrorType {
  /** Erreur d'authentification ou d'autorisation */
  AUTH = 'auth',
  /** Erreur de validation des données */
  VALIDATION = 'validation',
  /** Erreur de connexion réseau */
  NETWORK = 'network',
  /** Erreur de l'API Notion */
  NOTION = 'notion',
  /** Erreur serveur */
  SERVER = 'server',
  /** Erreur inconnue ou non catégorisée */
  UNKNOWN = 'unknown'
}

/**
 * Interface pour les erreurs standardisées de l'application
 */
export interface AppError {
  /** Type d'erreur */
  type: ErrorType;
  /** Message d'erreur */
  message: string;
  /** Message d'erreur technique (pour le développement) */
  technicalMessage?: string;
  /** Erreur originale */
  originalError?: unknown;
  /** Code d'erreur (optionnel) */
  code?: string;
  /** Données supplémentaires liées à l'erreur */
  data?: Record<string, unknown>;
}

/**
 * Options pour la gestion des erreurs
 */
export interface ErrorHandlerOptions {
  /** Afficher l'erreur dans un toast */
  showToast?: boolean;
  /** Titre du toast */
  toastTitle?: string;
  /** Enregistrer l'erreur dans la console */
  logToConsole?: boolean;
  /** Niveau de log */
  logLevel?: 'error' | 'warn' | 'info';
}
