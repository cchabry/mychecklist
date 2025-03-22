
/**
 * Types pour le service de gestion d'erreurs Notion
 */

// Types d'erreurs possibles
export enum NotionErrorType {
  // Erreurs réseau
  NETWORK = 'network',
  
  // Erreurs d'authentification
  AUTH = 'auth',
  
  // Erreurs d'autorisation (permissions)
  PERMISSION = 'permission',
  
  // Erreurs de limites d'API
  RATE_LIMIT = 'rate_limit',
  
  // Erreurs de validation
  VALIDATION = 'validation',
  
  // Erreurs de base de données
  DATABASE = 'database',
  
  // Erreurs inconnues
  UNKNOWN = 'unknown'
}

// Niveau de gravité de l'erreur
export enum NotionErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Structure d'une erreur Notion enrichie
export interface NotionError extends Error {
  // Type d'erreur
  type: NotionErrorType;
  
  // Gravité
  severity: NotionErrorSeverity;
  
  // Code d'erreur HTTP ou Notion
  code?: number | string;
  
  // Données supplémentaires
  context?: Record<string, any>;
  
  // Erreur originale (si wrapper)
  originalError?: Error;
  
  // Actions possibles de récupération
  recoveryActions?: string[];
  
  // Indique si l'erreur est récupérable
  recoverable: boolean;
  
  // Date de l'erreur
  timestamp: Date;
}

// Options pour la création d'erreurs
export interface NotionErrorOptions {
  type?: NotionErrorType;
  severity?: NotionErrorSeverity;
  code?: number | string;
  context?: Record<string, any>;
  originalError?: Error;
  recoveryActions?: string[];
  recoverable?: boolean;
}

// Type pour les abonnés aux erreurs
export type NotionErrorSubscriber = (error: NotionError) => void;

// Type pour les fonctions de traitement d'erreur
export type NotionErrorHandler = (error: Error) => NotionError;
