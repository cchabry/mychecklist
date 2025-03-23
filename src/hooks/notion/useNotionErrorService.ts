
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
    const notionError = notionErrorService.reportError(error, context);
    
    // Afficher un toast si demandé
    if (options.showToast !== false) {
      toast.error(`Erreur: ${context}`, {
        description: error.message
      });
    }
    
    return notionError;
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
