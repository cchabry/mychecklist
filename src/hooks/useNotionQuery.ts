
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { notionService, ConnectionStatus } from '@/services/notion/client';

interface QueryOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  enabled?: boolean;
  retry?: number;
  retryDelay?: number;
  cacheTime?: number;
  staleTime?: number;
}

/**
 * Hook personnalisé pour les requêtes au service Notion avec gestion d'état
 */
export function useNotionQuery<T = unknown>(
  queryFn: () => Promise<T>,
  options: QueryOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState(0);

  const { 
    onSuccess, 
    onError, 
    onSettled,
    enabled = true,
    retry = 0,
    retryDelay = 1000
  } = options;
  
  const executeQuery = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    
    try {
      // Vérifier si Notion est configuré
      if (!notionService.isConfigured()) {
        throw new Error('Notion n\'est pas configuré. Veuillez configurer votre API Notion.');
      }
      
      // Vérifier la connectivité si nécessaire
      const status = notionService.getConnectionStatus();
      if (status === ConnectionStatus.Error) {
        throw new Error('Problème de connexion à Notion. Vérifiez votre configuration.');
      }
      
      // Exécuter la requête
      const result = await queryFn();
      
      setData(result);
      setIsSuccess(true);
      
      // Callback de succès
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorObject = err instanceof Error ? err : new Error(String(err));
      setIsError(true);
      setError(errorObject);
      
      // Afficher un toast d'erreur
      toast.error('Erreur Notion', {
        description: errorObject.message,
        duration: 5000
      });
      
      // Callback d'erreur
      if (onError) {
        onError(errorObject);
      }
      
      // Gestion de la réessai
      if (retryCount < retry) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          executeQuery();
        }, retryDelay);
      }
      
      throw errorObject;
    } finally {
      setIsLoading(false);
      
      // Callback de fin
      if (onSettled) {
        onSettled();
      }
    }
  }, [queryFn, onSuccess, onError, onSettled, retry, retryCount, retryDelay]);
  
  // Exécuter la requête initiale si enabled
  useEffect(() => {
    if (enabled) {
      executeQuery();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
  
  return {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
    refetch: executeQuery
  };
}
