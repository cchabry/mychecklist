
import { useCallback } from 'react';
import { operationMode } from '@/services/operationMode';
import { toast } from 'sonner';

export interface ErrorReportOptions {
  // Afficher un toast d'erreur automatiquement
  showToast?: boolean;
  
  // Message personnalisé pour le toast
  toastMessage?: string;
  
  // Description additionnelle pour le toast
  toastDescription?: string;
  
  // Si l'erreur est critique et nécessite l'attention immédiate de l'utilisateur
  isCritical?: boolean;
  
  // Si l'erreur doit être logguée en console
  logToConsole?: boolean;
}

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
    options: ErrorReportOptions = {}
  ) => {
    // Options par défaut
    const {
      showToast = true,
      toastMessage = "Une erreur s'est produite",
      toastDescription,
      isCritical = false,
      logToConsole = true
    } = options;
    
    // Formater l'erreur
    const formattedError = error instanceof Error 
      ? error 
      : new Error(String(error));
    
    // Logguer en console si demandé
    if (logToConsole) {
      console.error(`[ErrorReporter] ${context}:`, formattedError);
    }
    
    // Signaler au système operationMode
    operationMode.handleConnectionError(formattedError, context);
    
    // Afficher un toast d'erreur si demandé
    if (showToast) {
      toast.error(toastMessage, {
        description: toastDescription || formattedError.message,
        duration: isCritical ? 8000 : 5000,
      });
    }
    
    return formattedError;
  }, []);
  
  /**
   * Signale une opération réussie
   */
  const reportSuccess = useCallback((message?: string) => {
    operationMode.handleSuccessfulOperation();
    
    if (message) {
      toast.success(message);
    }
    
    return true;
  }, []);
  
  return {
    reportError,
    reportSuccess
  };
}
