
import { useState, useEffect, useCallback } from 'react';
import { notionRetryQueue } from '@/services/notion/errorHandling';
import { RetryQueueStats } from '@/services/notion/types/unified';

/**
 * Hook pour utiliser la file d'attente des opérations en échec
 */
export function useRetryQueue() {
  const [stats, setStats] = useState<RetryQueueStats>(notionRetryQueue.getStats());

  // Mettre à jour les stats régulièrement
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(notionRetryQueue.getStats());
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Ajouter une opération à la file d'attente
  const addOperation = useCallback((
    operation: () => Promise<any>,
    errorContext: string,
    maxAttempts: number = 3
  ) => {
    return notionRetryQueue.addOperation(operation, errorContext, maxAttempts);
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

  // Méthodes additionnelles pour la compatibilité avec les composants existants
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

  const isPaused = notionRetryQueue.isPaused();
  const queuedOperations = notionRetryQueue.getQueuedOperations();

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
