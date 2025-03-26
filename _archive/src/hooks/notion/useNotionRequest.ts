
import { useState, useEffect, useCallback } from 'react';
import { operationMode } from '@/services/operationMode';

/**
 * Version mise à jour du Hook pour les requêtes à l'API Notion
 * Compatible avec operationMode au lieu de mockMode
 */
export const useNotionRequest = <T>(
  requestFn: () => Promise<T>,
  mockData: T | (() => T),
  options: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    fetchKey?: string | string[];
    cacheTTL?: number;
  } = {}
) => {
  const { immediate = true, onSuccess, onError, fetchKey } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  // Fonction d'exécution de la requête
  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Si nous sommes en mode démo, utiliser les données mockées
      if (operationMode.isDemoMode) {
        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Utiliser la donnée mock (fonction ou valeur)
        const mockResult = typeof mockData === 'function' ? (mockData as () => T)() : mockData;
        setData(mockResult);
        
        if (onSuccess) {
          onSuccess(mockResult);
        }
      } else {
        // Exécuter la requête réelle
        const result = await requestFn();
        setData(result);
        
        // Signaler une opération réussie
        operationMode.handleSuccessfulOperation();
        
        if (onSuccess) {
          onSuccess(result);
        }
      }
    } catch (error) {
      // Gérer l'erreur
      const formattedError = error instanceof Error ? error : new Error(String(error));
      setError(formattedError);
      
      // Signaler l'erreur au système operationMode
      operationMode.handleConnectionError(formattedError, 'Requête Notion');
      
      if (onError) {
        onError(formattedError);
      }
      
      // Essayer de récupérer en mode démo
      if (!operationMode.isDemoMode) {
        const mockResult = typeof mockData === 'function' ? (mockData as () => T)() : mockData;
        setData(mockResult);
      }
    } finally {
      setIsLoading(false);
    }
  }, [requestFn, mockData, onSuccess, onError]);

  // Exécuter la requête immédiatement si demandé
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute, fetchKey].filter(Boolean));

  return {
    data,
    isLoading,
    error,
    execute,
    setData,
  };
};
