
import { useState, useEffect } from 'react';
import { notionErrorService } from '@/services/notion/errorHandling/notionErrorService';
import { NotionError, NotionErrorSeverity } from '@/services/notion/types/unified';

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
  const reportError = (error: Error | string, context?: string, options: {
    showToast?: boolean,
    severity?: NotionErrorSeverity,
    retryable?: boolean
  } = {}) => {
    return notionErrorService.reportError(error, context, {
      severity: options.severity,
      retryable: options.retryable
    });
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

  return {
    errors,
    reportError,
    clearErrors,
    getUserFriendlyMessage,
    service: notionErrorService
  };
}

export default useNotionErrorService;
