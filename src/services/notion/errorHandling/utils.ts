
import { NotionError, NotionErrorType } from '../types/unified';
import { notionErrorService } from './notionErrorService';

/**
 * Utilitaires pour la gestion des erreurs Notion
 */
export const errorUtils = {
  /**
   * Extrait le message utilisateur d'une erreur
   */
  getUserFriendlyMessage(error: Error | NotionError | string): string {
    if (typeof error === 'string') {
      return error;
    }
    
    // Si c'est une NotionError
    if ('type' in error && 'severity' in error) {
      return notionErrorService.createUserFriendlyMessage(error);
    }
    
    // Erreur standard
    return error.message;
  },
  
  /**
   * Détermine si une erreur est réessayable
   */
  isRetryableError(error: Error | NotionError | string): boolean {
    // Si c'est une NotionError
    if (typeof error === 'object' && 'retryable' in error) {
      return error.retryable;
    }
    
    // Pour les erreurs standard, examiner le message
    const message = typeof error === 'string' ? error : error.message;
    const lowercaseMsg = message.toLowerCase();
    
    // Erreurs de réseau généralement réessayables
    if (
      lowercaseMsg.includes('network') ||
      lowercaseMsg.includes('connection') ||
      lowercaseMsg.includes('timeout') ||
      lowercaseMsg.includes('failed to fetch') ||
      lowercaseMsg.includes('rate limit') ||
      lowercaseMsg.includes('too many requests')
    ) {
      return true;
    }
    
    // Erreurs d'authentification non réessayables
    if (
      lowercaseMsg.includes('unauthorized') ||
      lowercaseMsg.includes('authentication') ||
      lowercaseMsg.includes('permission')
    ) {
      return false;
    }
    
    return false;
  },
  
  /**
   * Convertit une erreur standard en NotionError
   */
  toNotionError(error: Error | string, context?: string): NotionError {
    if (typeof error === 'string') {
      return notionErrorService.createError(error, NotionErrorType.UNKNOWN, { context });
    }
    
    const errorType = notionErrorService.identifyErrorType(error);
    return notionErrorService.createError(error, errorType, { context });
  },
  
  /**
   * Détermine si l'erreur nécessite un changement de mode opérationnel
   */
  requiresOperationModeChange(error: Error | NotionError | string): boolean {
    // Si c'est une NotionError
    if (typeof error === 'object' && 'type' in error) {
      // Les erreurs graves qui nécessitent un changement de mode
      return [
        NotionErrorType.AUTH,
        NotionErrorType.PERMISSION,
        NotionErrorType.DATABASE,
        NotionErrorType.CORS
      ].includes(error.type);
    }
    
    // Pour les erreurs standard, examiner le message
    const message = typeof error === 'string' ? error : error.message;
    const lowercaseMsg = message.toLowerCase();
    
    return (
      lowercaseMsg.includes('unauthorized') ||
      lowercaseMsg.includes('not found') ||
      lowercaseMsg.includes('permission') ||
      lowercaseMsg.includes('cors') ||
      lowercaseMsg.includes('cross-origin')
    );
  }
};

// Export par défaut
export default errorUtils;
