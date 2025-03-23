
import { useState, useEffect, useCallback } from 'react';
import { useOperationModeListener } from '@/hooks/useOperationModeListener';
import { toast } from 'sonner';

/**
 * Hook générique pour utiliser un service d'API avec mise en cache
 * @param serviceMethod Méthode du service à appeler (fetch, getById, etc.)
 * @param params Paramètres à passer à la méthode
 * @param options Options supplémentaires
 */
export function useServiceWithCache<T>(
  serviceMethod: (...params: any[]) => Promise<T>,
  params: any[] = [],
  options: {
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    showErrorToast?: boolean;
    showSuccessToast?: boolean;
    successMessage?: string;
    errorMessage?: string;
    refreshInterval?: number;
  } = {}
) {
  const { 
    enabled = true,
    onSuccess,
    onError,
    showErrorToast = true,
    showSuccessToast = false,
    successMessage = 'Données récupérées avec succès',
    errorMessage = 'Erreur lors de la récupération des données',
    refreshInterval
  } = options;
  
  const { isDemoMode } = useOperationModeListener();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = useCallback(async (silent: boolean = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      // Le service doit déjà gérer le cache en interne
      const result = await serviceMethod(...params);
      
      setData(result);
      
      if (!silent) {
        if (onSuccess) {
          onSuccess(result);
        }
        
        if (showSuccessToast) {
          toast.success(successMessage);
        }
      }
      
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      
      if (!silent) {
        setError(errorObj);
        
        if (onError) {
          onError(errorObj);
        }
        
        if (showErrorToast) {
          toast.error(errorMessage, {
            description: errorObj.message
          });
        }
      }
      
      throw errorObj;
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [
    serviceMethod,
    params,
    onSuccess,
    onError,
    showErrorToast,
    showSuccessToast,
    successMessage,
    errorMessage
  ]);
  
  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    
    fetchData().catch(error => {
      console.error('Erreur non gérée dans useServiceWithCache:', error);
    });
    
    // Configurer un intervalle de rafraîchissement si demandé
    if (refreshInterval && refreshInterval > 0) {
      const intervalId = setInterval(() => {
        fetchData(true).catch(error => {
          console.error('Erreur lors du rafraîchissement périodique:', error);
        });
      }, refreshInterval);
      
      return () => clearInterval(intervalId);
    }
  }, [enabled, fetchData, refreshInterval]);
  
  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    isDemoMode
  };
}
