
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
  
  // Helper pour vérifier si une méthode existe sur l'objet
  const hasMethod = useCallback((methodName: string): boolean => {
    return typeof (notionRetryQueue as any)[methodName] === 'function';
  }, []);
  
  // Helper pour appeler une méthode de manière sécurisée
  const safeCall = useCallback(<T>(methodName: string, ...args: any[]): T | undefined => {
    if (hasMethod(methodName)) {
      return (notionRetryQueue as any)[methodName](...args);
    }
    return undefined;
  }, [hasMethod]);
  
  // S'abonner aux mises à jour des statistiques
  useEffect(() => {
    // Vérifier si la méthode subscribe existe sur le service
    if (hasMethod('subscribe')) {
      const unsubscribe = notionRetryQueue.subscribe((updatedStats) => {
        setStats(updatedStats);
        
        try {
          // Si la file d'attente expose les opérations, les récupérer
          if (hasMethod('getQueuedOperations')) {
            const operations = safeCall<QueuedOperation[]>('getQueuedOperations');
            if (operations) {
              setQueuedOperations(operations);
            }
          } else {
            // Fallback: créer un tableau vide
            setQueuedOperations([]);
          }
        } catch (e) {
          console.warn('Erreur lors de la récupération des opérations en attente:', e);
          setQueuedOperations([]);
        }
      });
      
      // Charger les stats initiales
      setStats(notionRetryQueue.getStats());
      
      // Charger les opérations initiales si disponibles
      try {
        if (hasMethod('getQueuedOperations')) {
          const operations = safeCall<QueuedOperation[]>('getQueuedOperations');
          if (operations) {
            setQueuedOperations(operations);
          }
        }
      } catch (e) {
        console.warn('Erreur lors de la récupération des opérations initiales:', e);
      }
      
      return unsubscribe;
    } else {
      // Polling en fallback si pas de système d'abonnement
      const interval = setInterval(() => {
        setStats(notionRetryQueue.getStats());
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [hasMethod, safeCall]);
  
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
    if (hasMethod('processNow')) {
      return safeCall('processNow', operationId);
    }
    console.warn('Method processNow not available on notionRetryQueue');
    return Promise.reject(new Error('Method not available'));
  }, [hasMethod, safeCall]);
  
  /**
   * Annuler une opération
   */
  const cancelOperation = useCallback((operationId: string): boolean => {
    if (hasMethod('cancel')) {
      return safeCall('cancel', operationId) || false;
    }
    console.warn('Method cancel not available on notionRetryQueue');
    return false;
  }, [hasMethod, safeCall]);
  
  /**
   * Vider la file d'attente
   */
  const clearQueue = useCallback((): void => {
    if (hasMethod('clearQueue')) {
      safeCall('clearQueue');
    } else {
      console.warn('Method clearQueue not available on notionRetryQueue');
    }
  }, [hasMethod, safeCall]);
  
  /**
   * Mettre en pause la file d'attente
   */
  const pauseQueue = useCallback((): void => {
    try {
      if (hasMethod('pauseQueue')) {
        safeCall('pauseQueue');
      } else {
        console.warn('Method pauseQueue not available on notionRetryQueue');
      }
    } catch (e) {
      console.warn('Erreur lors de la mise en pause de la file d\'attente:', e);
    }
  }, [hasMethod, safeCall]);
  
  /**
   * Reprendre le traitement de la file d'attente
   */
  const resumeQueue = useCallback((): void => {
    try {
      if (hasMethod('resumeQueue')) {
        safeCall('resumeQueue');
      } else {
        console.warn('Method resumeQueue not available on notionRetryQueue');
      }
    } catch (e) {
      console.warn('Erreur lors de la reprise de la file d\'attente:', e);
    }
  }, [hasMethod, safeCall]);
  
  /**
   * Vérifier si la file d'attente est en pause
   */
  const isPaused = useCallback((): boolean => {
    try {
      if (hasMethod('isPaused')) {
        return safeCall('isPaused') || false;
      }
    } catch (e) {
      console.warn('Erreur lors de la vérification de l\'état de pause:', e);
    }
    return false;
  }, [hasMethod, safeCall]);
  
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
