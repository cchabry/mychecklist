
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { AppError, ErrorType, isAppError } from '@/types/error';

/**
 * Options pour le gestionnaire d'erreurs
 */
export interface ErrorHandlerOptions {
  toastErrors?: boolean;
  logErrors?: boolean;
  onError?: (error: AppError) => void;
}

/**
 * Hook pour gérer les erreurs de manière standardisée
 */
export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const { 
    toastErrors = true, 
    logErrors = true,
    onError 
  } = options;
  
  const [lastError, setLastError] = useState<AppError | null>(null);
  const [isError, setIsError] = useState(false);
  
  /**
   * Gère une erreur
   */
  const handleError = useCallback((error: unknown) => {
    // Convertir l'erreur en AppError
    const appError = isAppError(error) 
      ? error 
      : (error instanceof Error
        ? { ...error, type: ErrorType.UNEXPECTED } as AppError
        : new Error(String(error)) as AppError);
    
    // Mettre à jour l'état
    setLastError(appError);
    setIsError(true);
    
    // Logger l'erreur si demandé
    if (logErrors) {
      console.error('[App Error]', appError);
    }
    
    // Afficher une toast si demandé
    if (toastErrors) {
      toast.error(appError.message, {
        description: appError.context || appError.type
      });
    }
    
    // Appeler le callback personnalisé si fourni
    if (onError) {
      onError(appError);
    }
    
    return appError;
  }, [toastErrors, logErrors, onError]);
  
  /**
   * Réinitialise l'état d'erreur
   */
  const clearError = useCallback(() => {
    setLastError(null);
    setIsError(false);
  }, []);
  
  return {
    handleError,
    clearError,
    lastError,
    isError
  };
}
