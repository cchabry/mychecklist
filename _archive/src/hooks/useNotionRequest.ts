
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { operationMode } from '@/services/operationMode';

/**
 * Options pour l'exécution des requêtes
 */
interface RequestOptions {
  errorMessage?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook pour gérer les requêtes à l'API Notion
 */
export function useNotionRequest() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = !!localStorage.getItem('notion_api_key');
  
  /**
   * Exécute une requête à l'API Notion
   */
  const executeRequest = useCallback(async <T>(
    requestFn: () => Promise<T>,
    options: RequestOptions = {}
  ): Promise<T | null> => {
    const { errorMessage = 'Erreur lors de la requête', onSuccess, onError } = options;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Conserver le mode actuel
      const wasDemoMode = operationMode.isDemoMode;
      
      // Si nous sommes en mode démo mais qu'il s'agit d'une requête de test,
      // forçons temporairement le mode réel
      if (wasDemoMode && options.errorMessage?.includes('connexion')) {
        operationMode.temporarilyForceReal();
      }
      
      const result = await requestFn();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Signaler l'opération réussie
      operationMode.handleSuccessfulOperation();
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (onError) {
        onError(error);
      } else {
        toast.error(errorMessage, {
          description: error.message
        });
      }
      
      // Signaler l'erreur à operationMode
      operationMode.handleConnectionError(error, errorMessage);
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    isLoading,
    error,
    isAuthenticated,
    executeRequest
  };
}
