
import { useCallback } from 'react';
import { operationMode } from '@/services/operationMode';
import { toast } from 'sonner';

/**
 * Hook standardisé pour le reporting d'erreurs
 * Remplace les appels directs aux différents systèmes
 */
export function useErrorReporter() {
  /**
   * Signale une erreur au système de gestion des modes opérationnels
   */
  const reportError = useCallback((
    error: unknown, 
    context: string = 'Opération', 
    options: { 
      showToast?: boolean,
      toastMessage?: string 
    } = {}
  ) => {
    // Formater l'erreur
    const formattedError = error instanceof Error 
      ? error 
      : new Error(String(error));
    
    // Signaler au système operationMode
    operationMode.handleConnectionError(formattedError, context);
    
    // Afficher un toast d'erreur si demandé
    if (options.showToast !== false) {
      toast.error(options.toastMessage || "Une erreur s'est produite", {
        description: formattedError.message
      });
    }
    
    return formattedError;
  }, []);
  
  /**
   * Signale une opération réussie
   */
  const reportSuccess = useCallback(() => {
    operationMode.handleSuccessfulOperation();
  }, []);
  
  return {
    reportError,
    reportSuccess
  };
}
