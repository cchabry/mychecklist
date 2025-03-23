
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { notionApi } from '@/lib/notionProxy';
import { handleNotionError } from '@/lib/notionProxy/errorHandling';
import { operationMode } from '@/services/operationMode';

interface RequestOptions<T, R> {
  onSuccess?: (data: R) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  mockResponse?: T;
}

/**
 * Hook optimisé pour effectuer des requêtes à l'API Notion
 */
export function useNotionRequest<T = unknown>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  /**
   * Exécute une requête à l'API Notion
   */
  const executeRequest = useCallback(async <R = T>(
    requestFn: () => Promise<R>,
    options: RequestOptions<T, R> = {}
  ): Promise<R | null> => {
    const { onSuccess, onError, successMessage, errorMessage, mockResponse } = options;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Vérifier si nous sommes en mode démo et si une réponse mock est fournie
      if (operationMode.isDemoMode && mockResponse !== undefined) {
        // Simuler un délai pour l'expérience utilisateur
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (onSuccess) {
          onSuccess(mockResponse as unknown as R);
        }
        
        setData(mockResponse as unknown as T);
        setIsLoading(false);
        
        return mockResponse as unknown as R;
      }
      
      const result = await requestFn();
      
      // Signaler une opération réussie
      operationMode.handleSuccessfulOperation();
      
      if (successMessage) {
        toast.success(successMessage);
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      setData(result as unknown as T);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      // Signaler une opération échouée
      operationMode.handleConnectionError(error, 'API Notion');
      
      // Utiliser le service de gestion d'erreur
      handleNotionError(error, errorMessage);
      
      if (onError) {
        onError(error);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    isLoading,
    error,
    data,
    executeRequest
  };
}
