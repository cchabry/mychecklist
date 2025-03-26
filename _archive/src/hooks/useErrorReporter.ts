
import { useOperationMode } from '@/services/operationMode';
import { toast } from 'sonner';

interface ErrorReportOptions {
  showToast?: boolean;
  toastMessage?: string;
  isCritical?: boolean;
}

/**
 * Hook qui simplifie la gestion et le reporting des erreurs
 * avec le système operationMode
 */
export function useErrorReporter() {
  const { 
    handleConnectionError, 
    handleSuccessfulOperation
  } = useOperationMode();
  
  /**
   * Signale une erreur au système operationMode et optionnellement
   * affiche un toast d'erreur
   */
  const reportError = (
    error: Error | unknown,
    context: string = 'Opération',
    options: ErrorReportOptions = {}
  ) => {
    const { 
      showToast = true, 
      toastMessage = 'Une erreur est survenue', 
      isCritical = false
    } = options;
    
    // Formatter l'erreur si ce n'est pas déjà une instance d'Error
    const formattedError = error instanceof Error 
      ? error 
      : new Error(typeof error === 'string' ? error : 'Erreur inconnue');
    
    // Signaler l'erreur au système operationMode
    handleConnectionError(formattedError, context);
    
    // Afficher un toast d'erreur si demandé
    if (showToast) {
      toast.error(toastMessage, {
        description: formattedError.message,
        duration: isCritical ? 8000 : 5000
      });
    }
    
    return formattedError;
  };
  
  /**
   * Signale une opération réussie au système operationMode
   * et optionnellement affiche un toast de succès
   */
  const reportSuccess = (message?: string) => {
    // Signaler l'opération réussie
    handleSuccessfulOperation();
    
    // Afficher un toast de succès si un message est fourni
    if (message) {
      toast.success(message);
    }
  };
  
  return {
    reportError,
    reportSuccess
  };
}
