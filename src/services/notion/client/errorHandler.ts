
/**
 * Gestionnaire d'erreurs pour l'API Notion
 * 
 * Module responsable de la standardisation et de la transformation des erreurs
 * provenant de l'API Notion en erreurs d'application cohérentes.
 */

import { AppError, ErrorType, createAppError } from '@/types/error';
import { NotionError } from '../types';

/**
 * Codes d'erreur Notion connus et leur mapping vers nos types d'erreur
 */
const NOTION_ERROR_MAPPING: Record<string, ErrorType> = {
  'unauthorized': ErrorType.UNAUTHORIZED,
  'restricted_resource': ErrorType.FORBIDDEN,
  'object_not_found': ErrorType.NOT_FOUND,
  'rate_limited': ErrorType.API,
  'invalid_request': ErrorType.VALIDATION,
  'invalid_json': ErrorType.VALIDATION,
  'validation_error': ErrorType.VALIDATION,
};

/**
 * Convertit une erreur Notion en AppError standardisée
 * 
 * @param error Erreur Notion originale
 * @param endpoint Point d'entrée API concerné (pour le contexte)
 * @returns Erreur standardisée au format AppError
 */
export function notionErrorToAppError(
  error: NotionError,
  endpoint?: string
): AppError {
  // Déterminer le type d'erreur en fonction du code
  let errorType = ErrorType.NOTION_API;
  
  if (error.code && NOTION_ERROR_MAPPING[error.code]) {
    errorType = NOTION_ERROR_MAPPING[error.code];
  } else if (error.status) {
    // Essayer de déterminer le type en fonction du statut HTTP
    if (error.status === 401) errorType = ErrorType.UNAUTHORIZED;
    else if (error.status === 403) errorType = ErrorType.FORBIDDEN;
    else if (error.status === 404) errorType = ErrorType.NOT_FOUND;
    else if (error.status >= 500) errorType = ErrorType.SERVER;
  }
  
  // Créer un message utilisateur approprié
  const userMessage = error.message || 'Erreur lors de la communication avec Notion';
  
  // Créer l'erreur standardisée
  return createAppError(userMessage, errorType, {
    code: error.code,
    status: error.status,
    details: error.details,
    context: endpoint ? `API Notion: ${endpoint}` : 'API Notion',
    technicalMessage: JSON.stringify(error.details || error, null, 2)
  });
}

/**
 * Convertit une erreur réseau ou une exception en AppError standardisée
 * 
 * @param error Erreur originale (peut être de n'importe quel type)
 * @param endpoint Point d'entrée API concerné (pour le contexte)
 * @returns Erreur standardisée au format AppError
 */
export function networkErrorToAppError(
  error: unknown,
  endpoint?: string
): AppError {
  // Déterminer si c'est une erreur réseau
  const isNetworkError = error instanceof Error && 
    (error.message.includes('network') || 
     error.message.includes('fetch') ||
     error.message.includes('connection'));
  
  const errorType = isNetworkError ? ErrorType.NETWORK : ErrorType.UNEXPECTED;
  
  // Créer un message utilisateur approprié
  const userMessage = isNetworkError
    ? 'Problème de connexion au serveur Notion. Veuillez vérifier votre connexion internet.'
    : error instanceof Error
      ? error.message
      : 'Erreur inattendue lors de la communication avec Notion';
  
  // Créer l'erreur standardisée
  return createAppError(userMessage, errorType, {
    context: endpoint ? `API Notion: ${endpoint}` : 'API Notion',
    technicalMessage: error instanceof Error ? error.stack : String(error)
  });
}

/**
 * Convertit n'importe quelle erreur en AppError standardisée
 * C'est la fonction principale à utiliser dans les services Notion
 * 
 * @param error Erreur à convertir (peut être de n'importe quel type)
 * @param endpoint Point d'entrée API concerné (pour le contexte)
 * @returns Erreur standardisée au format AppError
 */
export function handleNotionError(error: unknown, endpoint?: string): AppError {
  // Si c'est déjà une AppError, la retourner telle quelle
  if (error && typeof error === 'object' && 'type' in error) {
    return error as AppError;
  }
  
  // Si c'est une erreur Notion
  if (error && typeof error === 'object' && 'message' in error) {
    return notionErrorToAppError(error as NotionError, endpoint);
  }
  
  // Sinon, la traiter comme une erreur réseau ou une exception
  return networkErrorToAppError(error, endpoint);
}
