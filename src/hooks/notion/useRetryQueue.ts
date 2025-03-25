
import { useState, useEffect, useCallback } from 'react';
import { notionRetryQueue } from '@/services/notion/errorHandling';
import { RetryOperationOptions, RetryQueueStats, QueuedOperation } from '@/services/notion/types/unified';

/**
 * Hook pour interagir avec la file d'attente de réessai
 */
export function useRetryQueue() {
  const [stats, setStats] = useState<RetryQueueStats>({
    totalOperations: 0,
    pendingOperations: 0,
    completedOperations: 0,
    failedOperations: 0,
    successful: 0,
    failed: 0,
    lastProcessedAt: null,
    isProcessing: false
  });
  
  const [queuedOperations, setQueuedOperations] = useState<QueuedOperation[]>([]);
  
  // S'abonner aux mises à jour des statistiques
  useEffect(() => {
    // Vérifier si la méthode subscribe existe sur le service
    if (typeof notionRetryQueue.subscribe === 'function') {
      const unsubscribe = notionRetryQueue.subscribe((updatedStats) => {
        setStats(updatedStats);
        
        // Si la file d'attente expose les opérations, les récupérer
        if (typeof notionRetryQueue.getQueuedOperations === 'function') {
          setQueuedOperations(notionRetryQueue.getQueuedOperations());
        } else {
          // Fallback: créer un tableau vide
          setQueuedOperations([]);
        }
      });
      
      // Charger les stats initiales
      setStats(notionRetryQueue.getStats());
      
      // Charger les opérations initiales si disponibles
      if (typeof notionRetryQueue.getQueuedOperations === 'function') {
        setQueuedOperations(notionRetryQueue.getQueuedOperations());
      }
      
      return unsubscribe;
    } else {
      // Polling en fallback si pas de système d'abonnement
      const interval = setInterval(() => {
        setStats(notionRetryQueue.getStats());
      }, 2000);
      
      return () => clearInterval(interval);
    }
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
   * Mettre en pause la file d'attente
   */
  const pauseQueue = useCallback((): void => {
    if (typeof notionRetryQueue.pauseQueue === 'function') {
      notionRetryQueue.pauseQueue();
    } else {
      console.warn('Method pauseQueue not available on notionRetryQueue');
    }
  }, []);
  
  /**
   * Reprendre le traitement de la file d'attente
   */
  const resumeQueue = useCallback((): void => {
    if (typeof notionRetryQueue.resumeQueue === 'function') {
      notionRetryQueue.resumeQueue();
    } else {
      console.warn('Method resumeQueue not available on notionRetryQueue');
    }
  }, []);
  
  /**
   * Vérifier si la file d'attente est en pause
   */
  const isPaused = useCallback((): boolean => {
    if (typeof notionRetryQueue.isPaused === 'function') {
      return notionRetryQueue.isPaused();
    }
    return false;
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
    queuedOperations,
    enqueue,
    processQueue,
    processNow,
    cancelOperation,
    clearQueue,
    pauseQueue,
    resumeQueue,
    isPaused,
    executeWithRetry
  };
}
