
import { useState, useEffect, useCallback } from 'react';
import { notionRetryQueue } from '@/services/notion/errorHandling';

/**
 * Hook pour utiliser la file d'attente des opérations en échec
 */
export function useRetryQueue() {
  const [stats, setStats] = useState(notionRetryQueue.getStats());

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

  return {
    stats,
    addOperation,
    processQueue,
    clearQueue
  };
}

export default useRetryQueue;
