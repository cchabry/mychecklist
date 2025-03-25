
import { useState, useEffect, useCallback } from 'react';
import { notionRetryQueue } from '@/services/notion/errorHandling';
import { RetryOperationOptions, RetryQueueStats } from '@/services/notion/types/unified';

/**
 * Hook pour interagir avec la file d'attente de réessai
 */
export function useRetryQueue() {
  const [stats, setStats] = useState<RetryQueueStats>({
    totalOperations: 0,
    pendingOperations: 0,
    completedOperations: 0,
    failedOperations: 0,
    lastProcessedAt: null,
    isProcessing: false
  });
  
  // S'abonner aux mises à jour des statistiques
  useEffect(() => {
    const unsubscribe = notionRetryQueue.subscribe((updatedStats) => {
      setStats(updatedStats);
    });
    
    // Charger les stats initiales
    setStats(notionRetryQueue.getStats());
    
    return unsubscribe;
  }, []);
  
  /**
   * Ajouter une opération à la file d'attente
   */
  const enqueue = useCallback(<T>(
    operation: () => Promise<T>,
    context: string | Record<string, any> = {},
    options: RetryOperationOptions = {}
  ): string => {
    return notionRetryQueue.enqueue(
      operation,
      context,
      options
    );
  }, []);
  
  /**
   * Traiter toutes les opérations en attente
   */
  const processQueue = useCallback(async (): Promise<void> => {
    return notionRetryQueue.processQueue();
  }, []);
  
  /**
   * Exécuter une opération immédiatement
   */
  const processNow = useCallback(async (operationId: string): Promise<any> => {
    // Vérifier si la méthode existe sur le service
    if (typeof notionRetryQueue.processNow === 'function') {
      return notionRetryQueue.processNow(operationId);
    }
    console.warn('Method processNow not available on notionRetryQueue');
    return Promise.reject(new Error('Method not available'));
  }, []);
  
  /**
   * Annuler une opération
   */
  const cancelOperation = useCallback((operationId: string): boolean => {
    // Vérifier si la méthode existe sur le service
    if (typeof notionRetryQueue.cancel === 'function') {
      return notionRetryQueue.cancel(operationId);
    }
    console.warn('Method cancel not available on notionRetryQueue');
    return false;
  }, []);
  
  /**
   * Vider la file d'attente
   */
  const clearQueue = useCallback((): void => {
    if (typeof notionRetryQueue.clearQueue === 'function') {
      notionRetryQueue.clearQueue();
    } else {
      console.warn('Method clearQueue not available on notionRetryQueue');
    }
  }, []);
  
  /**
   * Exécuter une opération avec réessai automatique
   */
  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    context: string | Record<string, any> = {},
    options: RetryOperationOptions = {}
  ): Promise<T> => {
    try {
      return await operation();
    } catch (error) {
      // Si l'erreur n'est pas réessayable, la propager
      if (options.skipRetryIf && error instanceof Error && options.skipRetryIf(error)) {
        throw error;
      }
      
      // Sinon, ajouter à la file d'attente
      return new Promise<T>((resolve, reject) => {
        enqueue(
          operation,
          context,
          {
            ...options,
            onSuccess: (result) => {
              if (options.onSuccess) {
                options.onSuccess(result);
              }
              resolve(result as T);
            },
            onFailure: (error) => {
              if (options.onFailure) {
                options.onFailure(error);
              }
              reject(error);
            }
          }
        );
      });
    }
  }, [enqueue]);
  
  return {
    stats,
    enqueue,
    processQueue,
    processNow: processNow,
    cancelOperation,
    clearQueue,
    executeWithRetry
  };
}
