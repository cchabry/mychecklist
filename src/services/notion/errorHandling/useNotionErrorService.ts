
import { useState, useEffect } from 'react';
import { notionErrorService } from './errorService';
import { NotionError } from './types';

/**
 * Hook pour utiliser le service de gestion des erreurs Notion
 */
export function useNotionErrorService() {
  const [errors, setErrors] = useState<NotionError[]>([]);

  // S'abonner aux notifications d'erreurs
  useEffect(() => {
    const unsubscribe = notionErrorService.subscribe(() => {
      // Mettre à jour la liste d'erreurs
      setErrors(notionErrorService.getRecentErrors());
    });

    // Initialiser avec les erreurs actuelles
    setErrors(notionErrorService.getRecentErrors());

    return unsubscribe;
  }, []);

  /**
   * Signaler une erreur au service
   */
  const reportError = (error: Error, context?: string) => {
    return notionErrorService.reportError(error, context);
  };

  /**
   * Effacer toutes les erreurs
   */
  const clearErrors = () => {
    notionErrorService.clearErrors();
    setErrors([]);
  };

  return {
    errors,
    reportError,
    clearErrors,
    service: notionErrorService
  };
}
