
import { useCallback } from 'react';
import { toast } from 'sonner';
import { operationMode } from '@/services/operationMode';

/**
 * Hook pour gérer le rapport d'erreurs et la gestion du mode démo
 */
export const useErrorReporter = () => {
  const reportError = useCallback((error: Error | unknown, context?: string) => {
    // Formater l'erreur
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorContext = context || "Opération inconnue";
    
    console.error(`Erreur (${errorContext}):`, error);
    
    // Afficher une notification toast
    toast.error(`Erreur: ${errorContext}`, {
      description: errorMessage,
      duration: 5000
    });
    
    // Signaler l'erreur au système operationMode
    operationMode.handleConnectionError(
      error instanceof Error ? error : new Error(errorMessage),
      errorContext
    );
    
    return { message: errorMessage, context: errorContext };
  }, []);
  
  const reportSuccess = useCallback(() => {
    // Signaler l'opération réussie au système operationMode
    operationMode.handleSuccessfulOperation();
  }, []);
  
  return { reportError, reportSuccess };
};
