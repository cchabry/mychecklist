
import { useState } from 'react';
import { notionApi } from '@/lib/notionProxy';
import { useOperationMode } from '@/services/operationMode';
import { useNotionErrorService } from './useNotionErrorService';
import { useRetryQueue } from './useRetryQueue';

// Types pour les options de l'API Notion
export interface NotionAPIOptions<T = any> {
  // Mode d'opération forcé (ignore le mode global)
  forceMode?: 'real' | 'demo';
  
  // Gestion des erreurs
  onError?: (error: Error) => void;
  
  // Traitement additionnel des données
  processResult?: (data: T) => T;
  
  // Nombre maximum de tentatives en cas d'erreur
  maxRetries?: number;
  
  // Délai entre les tentatives (ms)
  retryDelay?: number;
}

/**
 * Hook principal pour utiliser l'API Notion avec gestion des erreurs et retry
 */
export function useNotionAPI() {
  const operationMode = useOperationMode();
  const errorService = useNotionErrorService();
  const retryQueue = useRetryQueue();
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);

  /**
   * Exécute une requête Notion avec gestion des erreurs et retry
   */
  const execute = async <T>(
    endpoint: string,
    method: string = 'GET',
    body?: any,
    token?: string,
    options: NotionAPIOptions<T> = {}
  ): Promise<T> => {
    const {
      forceMode,
      onError,
      processResult,
      maxRetries = 3,
      retryDelay = 1000
    } = options;

    setIsLoading(true);
    setLastError(null);

    try {
      // Force le mode si spécifié, sinon utilise le mode global
      const useDemoMode = forceMode === 'demo' || 
        (forceMode !== 'real' && operationMode.isDemoMode);

      // Exécuter la requête via le proxy ou le mock
      const result = await notionApi.request(
        endpoint,
        method,
        body,
        token,
        { useDemoMode }
      );

      // Traiter le résultat si nécessaire
      const processedResult = processResult ? processResult(result) : result;
      
      // Signaler l'opération réussie
      operationMode.handleSuccessfulOperation();
      
      setIsLoading(false);
      return processedResult;
    } catch (error) {
      // Enrichir l'erreur avec le service d'erreur
      const enhancedError = errorService.reportError(
        error instanceof Error ? error : new Error(String(error)), 
        `${method} ${endpoint}`
      );

      // Callback d'erreur
      if (onError) {
        onError(enhancedError);
      }

      // Mettre en file d'attente pour retry si pertinent
      if (maxRetries > 0) {
        retryQueue.enqueue(
          () => notionApi.request(endpoint, method, body, token),
          `Notion ${method} ${endpoint}`,
          {
            maxRetries,
            onSuccess: (result) => {
              console.log(`Opération réussie après retry: ${method} ${endpoint}`);
            }
          }
        );
      }

      setLastError(enhancedError);
      setIsLoading(false);
      throw enhancedError;
    }
  };

  return {
    isLoading,
    lastError,
    execute,
    clearError: () => setLastError(null)
  };
}
