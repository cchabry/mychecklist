
/**
 * Utilitaires pour la gestion des erreurs Notion
 */

import { 
  NotionError, 
  NotionErrorType, 
  NotionErrorSeverity,
  createNotionError
} from '../types/unified';
import { notionErrorService } from './errorService';

/**
 * Détermine si une erreur est liée à la connexion réseau
 */
export function isNetworkError(error: Error | string | NotionError): boolean {
  if (typeof error === 'object' && 'type' in error) {
    return error.type === NotionErrorType.NETWORK;
  }
  
  const message = typeof error === 'string' ? error : error.message;
  return message.toLowerCase().includes('network') ||
         message.toLowerCase().includes('fetch') ||
         message.toLowerCase().includes('connection');
}

/**
 * Détermine si une erreur est liée à l'authentification
 */
export function isAuthError(error: Error | string | NotionError): boolean {
  if (typeof error === 'object' && 'type' in error) {
    return error.type === NotionErrorType.AUTH;
  }
  
  const message = typeof error === 'string' ? error : error.message;
  return message.toLowerCase().includes('auth') ||
         message.toLowerCase().includes('token') ||
         message.toLowerCase().includes('unauthorized') ||
         message.toLowerCase().includes('401');
}

/**
 * Détermine si une erreur est liée aux permissions
 */
export function isPermissionError(error: Error | string | NotionError): boolean {
  if (typeof error === 'object' && 'type' in error) {
    return error.type === NotionErrorType.PERMISSION;
  }
  
  const message = typeof error === 'string' ? error : error.message;
  return message.toLowerCase().includes('permission') ||
         message.toLowerCase().includes('forbidden') ||
         message.toLowerCase().includes('403');
}

/**
 * Détermine si une erreur est liée à une ressource non trouvée
 */
export function isNotFoundError(error: Error | string | NotionError): boolean {
  if (typeof error === 'object' && 'type' in error) {
    return error.type === NotionErrorType.NOT_FOUND;
  }
  
  const message = typeof error === 'string' ? error : error.message;
  return message.toLowerCase().includes('not found') ||
         message.toLowerCase().includes('introuvable') ||
         message.toLowerCase().includes('404');
}

/**
 * Fonction utilitaire pour créer une fonction de récupération d'erreur
 */
export function createErrorRecoveryFunction(
  recoveryFn: () => void,
  errorMessage: string = 'Impossible de récupérer de l\'erreur'
): () => Promise<void> {
  return async () => {
    try {
      recoveryFn();
    } catch (error) {
      notionErrorService.reportError(
        error, 
        'Récupération d\'erreur', 
        {
          type: NotionErrorType.UNKNOWN,
          severity: NotionErrorSeverity.ERROR
        }
      );
      
      throw new Error(errorMessage);
    }
  };
}

/**
 * Crée une erreur avec un message d'erreur standard
 */
export function createStandardError(
  type: NotionErrorType,
  messageOrError?: string | Error
): NotionError {
  let message: string;
  
  switch (type) {
    case NotionErrorType.NETWORK:
      message = 'Erreur de connexion au serveur Notion';
      break;
    case NotionErrorType.AUTH:
      message = 'Erreur d\'authentification à l\'API Notion';
      break;
    case NotionErrorType.PERMISSION:
      message = 'Vous n\'avez pas les autorisations nécessaires pour effectuer cette action';
      break;
    case NotionErrorType.NOT_FOUND:
      message = 'Ressource Notion introuvable';
      break;
    case NotionErrorType.RATE_LIMIT:
      message = 'Limite de requêtes Notion atteinte. Veuillez réessayer plus tard';
      break;
    case NotionErrorType.DATABASE:
      message = 'Erreur avec la base de données Notion';
      break;
    default:
      message = 'Erreur lors de l\'interaction avec Notion';
  }
  
  // Si un message spécifique est fourni, l'utiliser
  if (messageOrError) {
    message = typeof messageOrError === 'string' 
      ? messageOrError 
      : messageOrError.message;
  }
  
  return createNotionError(message, { type });
}

/**
 * Identifie la catégorie d'erreur (pour compatibilité avec l'ancien système)
 */
export function categorizeError(error: Error | string): NotionErrorType {
  return notionErrorService.identifyErrorType(
    typeof error === 'string' ? new Error(error) : error
  );
}

export const notionErrorUtils = {
  isNetworkError,
  isAuthError,
  isPermissionError,
  isNotFoundError,
  createErrorRecoveryFunction,
  createStandardError,
  categorizeError
};

export default notionErrorUtils;
