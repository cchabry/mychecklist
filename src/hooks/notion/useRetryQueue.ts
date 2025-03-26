
import { useState, useEffect, useCallback } from 'react';
import { notionRetryQueue } from '@/services/notion/errorHandling/retryQueue';
import { RetryOperation, RetryQueueStats, RetryOperationOptions } from '@/services/notion/types/unified';

/**
 * Hook pour utiliser la file d'attente des réessais
 */
export function useRetryQueue() {
  const [operations, setOperations] = useState<RetryOperation[]>([]);
  const [stats, setStats] = useState<RetryQueueStats>(notionRetryQueue.getStats());
  const [isProcessing, setIsProcessing] = useState(false);

  // Rafraîchir les données
  const refreshData = useCallback(() => {
    setOperations(notionRetryQueue.getOperations());
    setStats(notionRetryQueue.getStats());
  }, []);

  // Surveiller les opérations à intervalles réguliers
  useEffect(() => {
    // Initial load
    refreshData();

    // Set up an interval to refresh the queue data
    const intervalId = setInterval(refreshData, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, [refreshData]);

  /**
   * Ajouter une opération à la file d'attente
   */
  const addOperation = useCallback(
    (operation: () => Promise<any>, context: string, options?: RetryOperationOptions) => {
      const id = notionRetryQueue.addOperation(operation, context, options);
      refreshData();
      return id;
    },
    [refreshData]
  );

  /**
   * Traiter la file d'attente
   */
  const processQueue = useCallback(async () => {
    setIsProcessing(true);
    try {
      await notionRetryQueue.processQueue();
    } finally {
      setIsProcessing(false);
      refreshData();
    }
  }, [refreshData]);

  /**
   * Réessayer une opération spécifique
   */
  const retryOperation = useCallback(
    async (id: string) => {
      const success = await notionRetryQueue.retryOperation(id);
      refreshData();
      return success;
    },
    [refreshData]
  );

  /**
   * Supprimer une opération de la file d'attente
   */
  const removeOperation = useCallback(
    (id: string) => {
      const result = notionRetryQueue.removeOperation(id);
      refreshData();
      return result;
    },
    [refreshData]
  );

  /**
   * Vider la file d'attente
   */
  const clearQueue = useCallback(() => {
    notionRetryQueue.clearOperations();
    refreshData();
  }, [refreshData]);

  return {
    operations,
    stats,
    isProcessing,
    addOperation,
    processQueue,
    retryOperation,
    removeOperation,
    clearQueue,
    refreshData
  };
}

// Export par défaut
export default useRetryQueue;
