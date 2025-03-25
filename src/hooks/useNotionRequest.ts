
import { useState, useCallback } from 'react';
import { notionApiRequest } from '@/lib/notionProxy/proxyFetch';
import { toast } from 'sonner';

/**
 * Hook simplifié pour les requêtes Notion via les fonctions Netlify
 */
export const useNotionRequest = <T>(
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) => {
  const { onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fonction pour exécuter la requête Notion
  const execute = useCallback(async (
    endpoint: string,
    method: string = 'GET',
    body?: any,
    token?: string
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Exécuter la requête via le proxy Netlify
      const result = await notionApiRequest(endpoint, method, body, token) as T;
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      // Gérer l'erreur
      const formattedError = error instanceof Error ? error : new Error(String(error));
      setError(formattedError);
      
      if (onError) {
        onError(formattedError);
      } else {
        // Afficher une notification d'erreur par défaut
        toast.error('Erreur lors de la requête Notion', {
          description: formattedError.message
        });
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  return {
    data,
    isLoading,
    error,
    execute,
    setData,
  };
};

export default useNotionRequest;
