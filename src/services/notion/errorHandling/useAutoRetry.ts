
/**
 * Hook pour utiliser le système de réessai automatique
 */

import { useState, useCallback } from 'react';
import { autoRetryHandler } from './autoRetry';
import { RetryOperationOptions } from './types';
import { toast } from 'sonner';

/**
 * Hook pour utiliser le système de réessai automatique
 */
export function useAutoRetry() {
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  
  /**
   * Exécute une opération avec réessai automatique
   */
  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    context: string | Record<string, any> = {},
    options: RetryOperationOptions & {
      showToast?: boolean;
      toastMessage?: string;
    } = {}
  ): Promise<T> => {
    const { 
      showToast = true, 
      toastMessage = 'Une erreur est survenue, nouvelle tentative...',
      ...retryOptions 
    } = options;
    
    setIsRetrying(false);
    setRetryCount(0);
    
    try {
      return await autoRetryHandler.execute<T>(
        operation,
        context,
        {
          ...retryOptions,
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
            
            setIsRetrying(false);
          }
        }
      );
    } catch (error) {
      // Gérer l'erreur finale
      if (showToast) {
        toast.error('Échec de l\'opération', {
          description: error instanceof Error ? error.message : String(error)
        });
      }
      
      throw error;
    }
  }, []);
  
  /**
   * Crée une fonction avec réessai automatique
   */
  const createRetryFunction = useCallback(<T, Args extends any[]>(
    fn: (...args: Args) => Promise<T>,
    contextGenerator: (args: Args) => string | Record<string, any> = () => 'Auto-retry operation',
    options: RetryOperationOptions & {
      showToast?: boolean;
      toastMessage?: string;
    } = {}
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
    retryCount
  };
}
