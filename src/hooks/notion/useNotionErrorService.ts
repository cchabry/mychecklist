
import { useState, useEffect } from 'react';
import { notionErrorService } from '@/services/notion/errorHandling/notionErrorService';
import { NotionError } from '@/services/notion/errorHandling/types';

/**
 * Hook pour utiliser le service d'erreur Notion
 */
export function useNotionErrorService() {
  const [errors, setErrors] = useState<NotionError[]>(notionErrorService.getErrors());

  // S'abonner aux nouvelles erreurs
  useEffect(() => {
    const unsubscribe = notionErrorService.subscribe(() => {
      setErrors(notionErrorService.getErrors());
    });
    
    return unsubscribe;
  }, []);

  // Fonctions utilitaires
  const reportError = (error: Error, context?: string) => {
    return notionErrorService.reportError(error, context);
  };
  
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
