
import { useState, useEffect } from 'react';
import { notionErrorService } from '@/services/notion/errorHandling/notionErrorService';
import type { 
  NotionError, 
  NotionErrorType, 
  NotionErrorSeverity, 
  NotionErrorOptions 
} from '@/services/notion/types/unified';

/**
 * Hook pour utiliser le service de gestion des erreurs Notion
 */
export function useNotionErrorService() {
  const [errors, setErrors] = useState<NotionError[]>([]);

  // S'abonner aux notifications d'erreurs
  useEffect(() => {
    const unsubscribe = notionErrorService.subscribe((updatedErrors) => {
      // Mettre à jour la liste d'erreurs
      setErrors(updatedErrors);
    });

    return unsubscribe;
  }, []);

  /**
   * Signaler une erreur au service
   */
  const reportError = (
    error: Error | string | NotionError, 
    context?: string, 
    options: Partial<NotionErrorOptions> = {}
  ): NotionError => {
    return notionErrorService.reportError(error, context || '', options);
  };

  /**
   * Effacer toutes les erreurs
   */
  const clearErrors = () => {
    notionErrorService.clearErrors();
  };

  /**
   * Générer un message utilisateur à partir d'une erreur
   */
  const getUserFriendlyMessage = (error: NotionError) => {
    return notionErrorService.createUserFriendlyMessage(error);
  };
  
  /**
   * Créer une erreur sans la signaler
   */
  const createError = (
    error: Error | string, 
    type: NotionErrorType = NotionErrorType.UNKNOWN, 
    options: Partial<NotionErrorOptions> = {}
  ) => {
    return notionErrorService.createError(error, type, options);
  };

  return {
    errors,
    reportError,
    clearErrors,
    getUserFriendlyMessage,
    createError,
    service: notionErrorService
  };
}

// Export par défaut
export default useNotionErrorService;
