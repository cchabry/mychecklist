
import { useCallback } from 'react';
import { toast } from 'sonner';
import { NotionAPI, ApiResult } from '@/types/api/notionApi';
import { useOperationMode } from '../useOperationMode';

/**
 * Hook pour accéder au client API avec gestion du mode opérationnel
 */
export function useApiClient(): {
  client: NotionAPI | null;
  isLoading: boolean;
  error: Error | null;
} {
  const { isDemoMode } = useOperationMode();
  
  // Ici, nous devrions initialiser le client API réel ou le client de démonstration
  // Pour l'instant, nous retournons simplement null
  
  return {
    client: null,
    isLoading: false,
    error: null
  };
}

/**
 * Hook pour utiliser une opération API avec gestion des erreurs et du mode opérationnel
 */
export function useApiOperation<T, P extends any[]>(
  operation: (...args: P) => Promise<ApiResult<T>>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    successMessage?: string;
    errorMessage?: string;
  }
): [
  (...args: P) => Promise<T | null>,
  { isLoading: boolean; error: Error | null }
] {
  const executeOperation = useCallback(async (...args: P) => {
    try {
      const result = await operation(...args);
      
      if (result.success && result.data) {
        if (options?.successMessage) {
          toast.success(options.successMessage);
        }
        
        if (options?.onSuccess) {
          options.onSuccess(result.data);
        }
        
        return result.data;
      } else {
        const error = new Error(
          result.error?.message || 'Une erreur est survenue'
        );
        
        if (options?.errorMessage) {
          toast.error(options.errorMessage, {
            description: result.error?.message
          });
        }
        
        if (options?.onError) {
          options.onError(error);
        }
        
        return null;
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      if (options?.errorMessage) {
        toast.error(options.errorMessage, {
          description: errorObj.message
        });
      }
      
      if (options?.onError) {
        options.onError(errorObj);
      }
      
      return null;
    }
  }, [operation, options]);
  
  return [
    executeOperation,
    { isLoading: false, error: null }
  ];
}
