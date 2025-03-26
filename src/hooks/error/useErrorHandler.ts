
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { AppError, ErrorType, isAppError, createAppError } from '@/types/error';

/**
 * Options pour le gestionnaire d'erreurs
 */
export interface ErrorHandlerOptions {
  showToast?: boolean;
  toastTitle?: string;
  logToConsole?: boolean;
  onError?: (error: AppError) => void;
}

/**
 * Hook pour gérer les erreurs de manière standardisée
 */
export function useErrorHandler() {
  const [lastError, setLastError] = useState<AppError | null>(null);
  const [isError, setIsError] = useState(false);
  
  /**
   * Gère une erreur
   */
  const handleError = useCallback((error: unknown, options: ErrorHandlerOptions = {}) => {
    const { 
      showToast = true, 
      toastTitle, 
      logToConsole = true,
      onError 
    } = options;
    
    // Convertir l'erreur en AppError
    const appError = isAppError(error) 
      ? error 
      : (error instanceof Error
        ? createAppError(error.message, ErrorType.UNEXPECTED, { technicalMessage: error.stack })
        : createAppError(String(error), ErrorType.UNEXPECTED));
    
    // Mettre à jour l'état
    setLastError(appError);
    setIsError(true);
    
    // Logger l'erreur si demandé
    if (logToConsole) {
      console.error('[App Error]', appError);
    }
    
    // Afficher une toast si demandé
    if (showToast) {
      toast.error(appError.message, {
        description: toastTitle || appError.context || appError.type
      });
    }
    
    // Appeler le callback personnalisé si fourni
    if (onError) {
      onError(appError);
    }
    
    return appError;
  }, []);
  
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
