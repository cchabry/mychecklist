
import { useState, useEffect, useCallback } from 'react';
import { notionRetryQueue } from './retryQueue';
import { RetryQueueStats, RetryOperationOptions } from './types';

/**
 * Hook pour utiliser la file d'attente de réessai
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
    const unsubscribe = notionRetryQueue.subscribe((newStats) => {
      setStats(newStats);
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
    return notionRetryQueue.enqueue(operation, context, options);
  }, []);
  
  /**
   * Traiter la file d'attente
   */
  const processQueue = useCallback(() => {
    notionRetryQueue.processQueue();
  }, []);
  
  /**
   * Vider la file d'attente
   */
  const clearQueue = useCallback(() => {
    notionRetryQueue.clearQueue();
  }, []);
  
  /**
   * Mettre en pause la file d'attente
   */
  const pauseQueue = useCallback(() => {
    notionRetryQueue.pause();
  }, []);
  
  /**
   * Reprendre le traitement de la file d'attente
   */
  const resumeQueue = useCallback(() => {
    notionRetryQueue.resume();
  }, []);
  
  /**
   * Vérifier si la file d'attente est en pause
   */
  const isPaused = useCallback(() => {
    return notionRetryQueue.isPaused();
  }, []);
  
  return {
    stats,
    enqueue,
    processQueue,
    clearQueue,
    pauseQueue,
    resumeQueue,
    isPaused
  };
}
