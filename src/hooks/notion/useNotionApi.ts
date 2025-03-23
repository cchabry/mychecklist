
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { notionApi } from '@/lib/notionProxy';
import { useNotionError } from './useNotionError';
import { operationMode } from '@/services/operationMode';
import { mockUtils } from '@/lib/notionProxy/mock/utils';
import { notionErrorService } from '@/services/notion/errorHandling/notionErrorService';
import { retryQueueService } from '@/services/notion/errorHandling/retryQueueService';

interface RequestOptions<T, R> {
  onSuccess?: (data: R) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorContext?: string;
  mockResponse?: T;
  retryOnFailure?: boolean;
  maxRetryAttempts?: number;
}

/**
 * Hook centralisé pour effectuer des requêtes à l'API Notion
 * Gère automatiquement les états de chargement, erreurs et succès
 */
export function useNotionApi<T = unknown>() {
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
    const { 
      onSuccess, 
      onError, 
      successMessage, 
      errorContext = 'Opération Notion',
      mockResponse,
      retryOnFailure = false,
      maxRetryAttempts = 3
    } = options;
    
    // Réinitialiser l'état
    setIsLoading(true);
    clearError();
    
    try {
      // Vérifier si nous sommes en mode démo et si une réponse mock est fournie
      if (operationMode.isDemoMode && mockResponse !== undefined) {
        // Simuler un délai pour l'expérience utilisateur
        await mockUtils.applySimulatedDelay();
        
        // Simuler une erreur si nécessaire
        if (mockUtils.shouldSimulateError()) {
          throw new Error('Erreur simulée en mode démo');
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
      
      // Notifier le système d'opération d'une connexion réussie
      operationMode.handleSuccessfulOperation();
      
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
      
      // Enregistrer l'erreur dans le service d'erreurs Notion
      notionErrorService.reportError(error, errorContext);
      
      // Notifier le système d'opération d'une erreur
      operationMode.handleConnectionError(error, errorContext);
      
      // Afficher l'erreur via useNotionError
      showError(error, errorContext);
      
      // Ajouter à la file d'attente de nouvelles tentatives si demandé
      if (retryOnFailure && !operationMode.isDemoMode) {
        const operationId = retryQueueService.enqueue(
          requestFn,
          errorContext,
          {
            maxAttempts: maxRetryAttempts,
            onSuccess: (result) => {
              toast.success('Opération récupérée avec succès', {
                description: `L'opération "${errorContext}" a réussi après une nouvelle tentative.`
              });
              
              if (onSuccess) {
                onSuccess(result as R);
              }
              
              setData(result as unknown as T);
            }
          }
        );
        
        toast.info('Nouvelle tentative planifiée', {
          description: `L'opération sera réessayée automatiquement.`
        });
      }
      
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
