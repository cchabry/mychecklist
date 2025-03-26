
/**
 * Utilitaires pour la gestion des erreurs
 */

import { AppError, ErrorType } from '@/types/error';
import { ERROR_MESSAGES } from '@/constants';

/**
 * Détermine le type d'erreur en fonction de l'erreur originale
 */
export function determineErrorType(error: unknown): ErrorType {
  if (!error) return ErrorType.UNKNOWN;

  // Si c'est déjà une AppError, utiliser son type
  if (typeof error === 'object' && error !== null && 'type' in error) {
    return (error as AppError).type;
  }

  // Pour les erreurs de fetch
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return ErrorType.NETWORK;
  }

  // Pour les erreurs HTTP
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as any).status;
    if (status === 401 || status === 403) return ErrorType.AUTH;
    if (status === 400 || status === 422) return ErrorType.VALIDATION;
    if (status >= 500) return ErrorType.SERVER;
  }

  // Pour les erreurs Notion
  if (
    typeof error === 'object' && 
    error !== null && 
    (('message' in error && (error as any).message.includes('Notion')) ||
     ('code' in error && (error as any).code?.includes('notion')))
  ) {
    return ErrorType.NOTION;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Crée une erreur standardisée à partir d'une erreur quelconque
 */
export function createAppError(error: unknown, defaultMessage?: string): AppError {
  const type = determineErrorType(error);
  
  // Si c'est déjà une AppError, la retourner telle quelle
  if (typeof error === 'object' && error !== null && 'type' in error) {
    return error as AppError;
  }
  
  let message: string;
  
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (typeof error === 'object' && error !== null && 'message' in error) {
    message = (error as any).message;
  } else {
    message = defaultMessage || ERROR_MESSAGES.UNKNOWN_ERROR;
  }
  
  return {
    type,
    message,
    originalError: error,
    technicalMessage: error instanceof Error ? error.stack : String(error)
  };
}

/**
 * Obtient un message d'erreur standardisé en fonction du type d'erreur
 */
export function getErrorMessage(type: ErrorType): string {
  switch (type) {
    case ErrorType.AUTH:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case ErrorType.VALIDATION:
      return ERROR_MESSAGES.VALIDATION_ERROR;
    case ErrorType.NETWORK:
      return ERROR_MESSAGES.CONNECTION_ERROR;
    case ErrorType.NOTION:
      return ERROR_MESSAGES.NOTION_ERROR;
    case ErrorType.SERVER:
      return ERROR_MESSAGES.SERVER_ERROR;
    case ErrorType.UNKNOWN:
    default:
      return ERROR_MESSAGES.UNKNOWN_ERROR;
  }
}
