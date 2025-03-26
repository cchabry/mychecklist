
import { ErrorType, AppError, createAppError } from '@/types/error';

/**
 * Convertit une erreur HTTP en erreur d'application
 */
export function httpErrorToAppError(httpError: any, url?: string): AppError {
  // Récupérer le statut HTTP si disponible
  const status = httpError.status || httpError.statusCode;
  
  // Déterminer le type d'erreur en fonction du statut
  let type = ErrorType.API;
  if (status) {
    if (status === 401) type = ErrorType.UNAUTHORIZED;
    else if (status === 403) type = ErrorType.FORBIDDEN;
    else if (status === 404) type = ErrorType.NOT_FOUND;
  }
  
  // Message d'erreur par défaut
  let message = httpError.message || 'Erreur lors de la requête';
  
  // Pour les erreurs Notion, extraire le message de l'API si disponible
  if (httpError.details?.message) {
    message = httpError.details.message;
    type = ErrorType.NOTION_API;
  }
  
  // Créer l'erreur d'application
  return createAppError(message, type, {
    status,
    code: httpError.code,
    details: httpError.details,
    context: url ? `URL: ${url}` : undefined
  });
}

/**
 * Renvoie un message d'erreur convivial en fonction du type d'erreur
 */
export function getFriendlyErrorMessage(error: AppError): string {
  switch (error.type) {
    case ErrorType.NETWORK:
      return 'Problème de connexion au réseau. Veuillez vérifier votre connexion internet.';
      
    case ErrorType.TIMEOUT:
      return 'La requête a pris trop de temps. Veuillez réessayer.';
      
    case ErrorType.OFFLINE:
      return 'Vous semblez être hors ligne. Veuillez vérifier votre connexion internet.';
      
    case ErrorType.UNAUTHORIZED:
      return 'Accès non autorisé. Veuillez vous reconnecter.';
      
    case ErrorType.FORBIDDEN:
      return 'Vous n\'avez pas les permissions nécessaires pour cette action.';
      
    case ErrorType.NOT_FOUND:
      return 'La ressource demandée n\'a pas été trouvée.';
      
    case ErrorType.VALIDATION:
      return 'Les données saisies sont invalides. Veuillez vérifier vos informations.';
      
    case ErrorType.CONFIG:
    case ErrorType.NOT_CONFIGURED:
      return 'L\'application n\'est pas correctement configurée.';
      
    case ErrorType.NOTION_API:
      return `Erreur API Notion: ${error.message}`;
      
    default:
      return error.message || 'Une erreur inattendue s\'est produite.';
  }
}

/**
 * Détermine si une erreur est récupérable (peut être réessayée)
 */
export function isRecoverableError(error: AppError): boolean {
  // Les erreurs réseau sont généralement récupérables
  if ([ErrorType.NETWORK, ErrorType.TIMEOUT, ErrorType.OFFLINE].includes(error.type)) {
    return true;
  }
  
  // Les erreurs 5xx sont généralement des problèmes temporaires côté serveur
  if (error.status && error.status >= 500 && error.status < 600) {
    return true;
  }
  
  return false;
}
