
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { NotionAPIResponse } from '@/services/notion';
import { useNotionService } from '@/contexts/NotionServiceContext';
import { cacheService } from '@/services/cache';

// Options pour les requêtes
interface NotionQueryOptions<T, R> {
  onSuccess?: (data: R) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  useCache?: boolean;
  cacheKey?: string;
  cacheVersion?: string;
}

/**
 * Hook pour effectuer des requêtes à l'API Notion avec gestion du cache
 */
export function useNotionQuery<T = unknown>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);
  
  // Accéder au service Notion
  const { notion, isConnected } = useNotionService();
  
  /**
   * Exécute une requête à l'API Notion
   */
  const executeQuery = useCallback(async <R = T>(
    queryFn: () => Promise<NotionAPIResponse<R>>,
    options: NotionQueryOptions<T, R> = {}
  ): Promise<R | null> => {
    const { 
      onSuccess, 
      onError, 
      successMessage, 
      errorMessage,
      useCache = true,
      cacheKey,
      cacheVersion
    } = options;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Vérifier le cache si activé et une clé est fournie
      if (useCache && cacheKey) {
        const cachedData = cacheVersion 
          ? cacheService.getWithVersion<R>(cacheKey, cacheVersion)
          : cacheService.get<R>(cacheKey);
        
        if (cachedData) {
          setData(cachedData as unknown as T);
          setIsLoading(false);
          
          if (onSuccess) {
            onSuccess(cachedData);
          }
          
          return cachedData;
        }
      }
      
      // Exécuter la requête
      const response = await queryFn();
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Erreur inconnue lors de la requête');
      }
      
      // Stocker dans le cache si activé
      if (useCache && cacheKey && response.data) {
        cacheService.set(cacheKey, response.data, cacheVersion);
      }
      
      // Afficher un message de succès si demandé
      if (successMessage) {
        toast.success(successMessage);
      }
      
      // Appeler le callback de succès
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Mettre à jour l'état
      setData(response.data as unknown as T);
      return response.data;
    } catch (error) {
      // Gérer l'erreur
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setError(errorObj);
      
      // Afficher un message d'erreur
      toast.error(errorMessage || 'Erreur lors de la requête', {
        description: errorObj.message
      });
      
      // Appeler le callback d'erreur
      if (onError) {
        onError(errorObj);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Réinitialise l'état de la requête
   */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);
  
  return {
    isLoading,
    error,
    data,
    executeQuery,
    reset,
    isConnected
  };
}
