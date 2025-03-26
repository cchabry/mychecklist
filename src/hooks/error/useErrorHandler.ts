
/**
 * Hook standardisé pour gérer les erreurs de l'application
 */

import { useState, useCallback } from 'react';
import { AppError, ErrorType, ErrorHandlerOptions } from '@/types/error';
import { createAppError, getErrorMessage } from '@/utils/error';
import { toast } from 'sonner';

/**
 * Hook pour la gestion standardisée des erreurs
 * 
 * Utilisation:
 * ```tsx
 * const { error, handleError, clearError } = useErrorHandler();
 * 
 * try {
 *   await someOperation();
 * } catch (err) {
 *   handleError(err, { showToast: true });
 * }
 * ```
 */
export function useErrorHandler() {
  const [error, setError] = useState<AppError | null>(null);
  
  /**
   * Gère une erreur de manière standardisée
   */
  const handleError = useCallback((
    catchedError: unknown, 
    options: ErrorHandlerOptions = {}
  ) => {
    const { 
      showToast = true, 
      toastTitle,
      logToConsole = true,
      logLevel = 'error'
    } = options;
    
    // Normaliser l'erreur
    const appError = createAppError(catchedError);
    
    // Enregistrer l'erreur dans l'état
    setError(appError);
    
    // Afficher l'erreur dans un toast si demandé
    if (showToast) {
      toast.error(toastTitle || getErrorMessage(appError.type), {
        description: appError.message
      });
    }
    
    // Enregistrer l'erreur dans la console si demandé
    if (logToConsole) {
      if (logLevel === 'error') {
        console.error('Error:', appError);
      } else if (logLevel === 'warn') {
        console.warn('Warning:', appError);
      } else {
        console.info('Info:', appError);
      }
    }
    
    return appError;
  }, []);
  
  /**
   * Efface l'erreur actuelle
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return {
    error,
    handleError,
    clearError,
    isError: error !== null
  };
}
