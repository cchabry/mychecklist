
import { useState, useCallback, useEffect } from 'react';
import { autoRetryHandler } from './autoRetry';
import { RetryOperationOptions } from '../types/errorTypes';

/**
 * Hook pour utiliser le système d'auto-retry
 */
export function useAutoRetry() {
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [lastError, setLastError] = useState<Error | null>(null);
  
  /**
   * Exécuter une opération avec auto-retry
   */
  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    context: string | Record<string, any> = {},
    options: RetryOperationOptions & {
      showToast?: boolean;
      toastMessage?: string;
    } = {}
  ): Promise<T> => {
    setIsRetrying(true);
    setRetryCount(0);
    setLastError(null);
    
    // Créer un gestionnaire de tentatives pour mettre à jour l'état
    const retryHandler: RetryOperationOptions = {
      ...options,
      onSuccess: (result) => {
        if (options.onSuccess) {
          options.onSuccess(result);
        }
        setIsRetrying(false);
      },
      onFailure: (error) => {
        if (options.onFailure) {
          options.onFailure(error);
        }
        setLastError(error);
        setIsRetrying(false);
      }
    };
    
    try {
      // Utiliser l'auto-retry handler
      return await autoRetryHandler.execute<T>(
        operation,
        context,
        retryHandler
      );
    } catch (error) {
      // Gérer l'erreur finale
      const typedError = error instanceof Error ? error : new Error(String(error));
      setLastError(typedError);
      setIsRetrying(false);
      throw typedError;
    }
  }, []);
  
  /**
   * Créer une fonction avec auto-retry
   */
  const createRetryFunction = useCallback(<T, Args extends any[]>(
    fn: (...args: Args) => Promise<T>,
    contextGenerator: (args: Args) => string | Record<string, any> = () => 'Auto-retry operation',
    options: RetryOperationOptions = {}
  ): ((...args: Args) => Promise<T>) => {
    return async (...args: Args): Promise<T> => {
      return executeWithRetry(
        () => fn(...args),
        contextGenerator(args),
        options
      );
    };
  }, [executeWithRetry]);
  
  return {
    executeWithRetry,
    createRetryFunction,
    isRetrying,
    retryCount,
    lastError
  };
}
