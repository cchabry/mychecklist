
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { notionApi } from '@/lib/notionProxy';
import { useNotionError } from './useNotionError';
import { isMockActive } from '@/lib/notionProxy/mock/utils';
import { mockUtils } from '@/lib/notionProxy/mock/utils';

interface RequestOptions<T, R> {
  onSuccess?: (data: R) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorContext?: string;
  mockResponse?: T;
}

/**
 * Hook centralisé pour effectuer des requêtes à l'API Notion
 * Gère automatiquement les états de chargement, erreurs et succès
 */
export function useNotionAPI<T = unknown>() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const { showError, errorDetails, clearError } = useNotionError();

  /**
   * Exécute une requête à l'API Notion
   * @param requestFn - Fonction de requête à exécuter
   * @param options - Options de configuration
   */
  const executeRequest = useCallback(async <R = T>(
    requestFn: () => Promise<R>,
    options: RequestOptions<T, R> = {}
  ): Promise<R | null> => {
    const { onSuccess, onError, successMessage, errorContext, mockResponse } = options;
    
    // Réinitialiser l'état
    setIsLoading(true);
    clearError();
    
    try {
      // Vérifier si nous sommes en mode mock et si une réponse mock est fournie
      if (isMockActive() && mockResponse !== undefined) {
        // Simuler un délai pour l'expérience utilisateur
        await mockUtils.applySimulatedDelay();
        
        // Simuler une erreur si nécessaire
        if (mockUtils.shouldSimulateError()) {
          throw new Error('Erreur simulée en mode mock');
        }
        
        if (onSuccess) {
          onSuccess(mockResponse as unknown as R);
        }
        
        setData(mockResponse as unknown as T);
        setIsLoading(false);
        
        return mockResponse as unknown as R;
      }
      
      // Exécuter la requête réelle
      const result = await requestFn();
      
      // Afficher un toast de succès si demandé
      if (successMessage) {
        toast.success(successMessage);
      }
      
      // Appeler le callback de succès
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Mettre à jour l'état
      setData(result as unknown as T);
      return result;
    } catch (err) {
      // Convertir l'erreur en objet Error
      const error = err instanceof Error ? err : new Error(String(err));
      
      // Afficher l'erreur via useNotionError
      showError(error, errorContext);
      
      // Appeler le callback d'erreur
      if (onError) {
        onError(error);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, showError]);
  
  return {
    isLoading,
    data,
    error: errorDetails,
    executeRequest,
    api: notionApi
  };
}
