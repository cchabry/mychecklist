
import { useState, useEffect, useCallback } from 'react';
import { notionRetryQueue } from '@/services/notion/errorHandling/retryQueue';
import { RetryQueueStats, RetryOperationOptions } from '@/services/notion/types/unified';

/**
 * Hook pour utiliser la file d'attente des opérations en échec
 */
export function useRetryQueue() {
  const [stats, setStats] = useState<RetryQueueStats>({
    pendingOperations: 0,
    completedOperations: 0,
    failedOperations: 0,
    isProcessing: false,
    isPaused: false,
    totalOperations: 0
  });

  // Mettre à jour les stats régulièrement
  useEffect(() => {
    const updateStats = () => {
      setStats(notionRetryQueue.getStats());
    };
    
    // Mettre à jour immédiatement
    updateStats();
    
    // Puis toutes les 3 secondes
    const interval = setInterval(updateStats, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Ajouter une opération à la file d'attente
  const addOperation = useCallback((
    operation: () => Promise<any>,
    errorContext: string,
    maxAttempts: number = 3,
    options: RetryOperationOptions = {}
  ) => {
    return notionRetryQueue.addOperation(operation, errorContext, maxAttempts, options);
  }, []);

  // Traiter la file d'attente
  const processQueue = useCallback(async () => {
    await notionRetryQueue.processQueue();
    setStats(notionRetryQueue.getStats());
  }, []);

  // Effacer la file d'attente
  const clearQueue = useCallback(() => {
    notionRetryQueue.clearQueue();
    setStats(notionRetryQueue.getStats());
  }, []);

  // Méthodes additionnelles
  const pauseQueue = useCallback(() => {
    notionRetryQueue.pause();
    setStats(notionRetryQueue.getStats());
  }, []);

  const resumeQueue = useCallback(() => {
    notionRetryQueue.resume();
    setStats(notionRetryQueue.getStats());
  }, []);

  const processNow = useCallback((operationId: string) => {
    notionRetryQueue.processOperation(operationId);
    setStats(notionRetryQueue.getStats());
  }, []);

  const queuedOperations = notionRetryQueue.getQueuedOperations();
  const isPaused = notionRetryQueue.isPaused();

  return {
    stats,
    addOperation,
    processQueue,
    clearQueue,
    pauseQueue,
    resumeQueue,
    isPaused,
    processNow,
    queuedOperations
  };
}

export default useRetryQueue;
