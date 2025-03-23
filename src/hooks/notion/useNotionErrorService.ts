
import { useState, useEffect } from 'react';
import { notionErrorService, NotionError, NotionErrorSeverity } from '@/services/notion/errorHandling';
import { toast } from 'sonner';

/**
 * Hook pour accéder au service de gestion des erreurs Notion
 */
export function useNotionErrorService() {
  const [errors, setErrors] = useState<NotionError[]>([]);
  
  // S'abonner aux erreurs
  useEffect(() => {
    const unsubscribe = notionErrorService.subscribe((updatedErrors) => {
      setErrors(updatedErrors);
    });
    
    // Charger les erreurs initiales
    setErrors(notionErrorService.getRecentErrors());
    
    return unsubscribe;
  }, []);
  
  /**
   * Signale une erreur au service
   */
  const reportError = (error: Error | string, context: string = 'Opération Notion', options: { 
    showToast?: boolean,
    severity?: NotionErrorSeverity
  } = {}) => {
    const notionError = notionErrorService.reportError(error, context, {
      severity: options.severity
    });
    
    // Afficher un toast si demandé
    if (options.showToast !== false) {
      toast.error(`Erreur: ${context}`, {
        description: typeof error === 'string' ? error : error.message
      });
    }
    
    return notionError;
  };
  
  /**
   * Efface toutes les erreurs
   */
  const clearErrors = () => {
    notionErrorService.clearErrors();
  };
  
  return {
    errors,
    reportError,
    clearErrors,
    service: notionErrorService
  };
}
