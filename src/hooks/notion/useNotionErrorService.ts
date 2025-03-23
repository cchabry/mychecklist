
import { useState, useEffect } from 'react';
import { notionErrorService } from '@/services/notion/errorHandling/errorService';
import { NotionError } from '@/services/notion/errorHandling/types';
import { toast } from 'sonner';

/**
 * Hook pour accéder au service de gestion des erreurs Notion
 */
export function useNotionErrorService() {
  const [errors, setErrors] = useState<NotionError[]>([]);
  
  // S'abonner aux erreurs
  useEffect(() => {
    const unsubscribe = notionErrorService.subscribe((error) => {
      setErrors(notionErrorService.getRecentErrors());
    });
    
    // Charger les erreurs initiales
    setErrors(notionErrorService.getRecentErrors());
    
    return unsubscribe;
  }, []);
  
  /**
   * Signale une erreur au service
   */
  const reportError = (error: Error, context: string = 'Opération Notion', options: { showToast?: boolean } = {}) => {
    const notionError = notionErrorService.createError(error.message, {
      cause: error,
      context: { operation: context },
      type: error.name === 'NotionError' ? (error as any).type : undefined,
      severity: (error as any).severity
    });
    
    // Afficher un toast si demandé
    if (options.showToast !== false) {
      toast.error(`Erreur: ${context}`, {
        description: error.message
      });
    }
    
    // Enrichir l'erreur
    return notionErrorService.reportError(error, context);
  };
  
  /**
   * Efface toutes les erreurs
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
