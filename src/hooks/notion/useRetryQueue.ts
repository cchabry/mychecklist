
import { useState, useEffect, useCallback } from 'react';
import { notionRetryQueue } from '@/services/notion/errorHandling/retryQueue';
import { RetryOperation, RetryQueueStats } from '@/services/notion/types/unified';

/**
 * Hook pour interagir avec la file d'attente des réessais
 */
export function useRetryQueue() {
  const [operations, setOperations] = useState<RetryOperation[]>([]);
  const [stats, setStats] = useState<RetryQueueStats>({
    total: 0,
    pending: 0,
    processing: 0,
    success: 0,
    failed: 0,
    successRate: 0,
    avgAttempts: 0,
    successful: 0 // Pour la rétrocompatibilité
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Mettre à jour les opérations et les statistiques périodiquement
  useEffect(() => {
    const fetchData = () => {
      const currentStats = notionRetryQueue.getStats();
      const currentOperations = notionRetryQueue.getOperations();
      
      setStats(currentStats);
      setOperations(currentOperations);
      setIsProcessing(notionRetryQueue.isProcessing());
      setIsPaused(notionRetryQueue.isPaused());
    };

    // Mise à jour initiale
    fetchData();

    // Mettre à jour périodiquement
    const intervalId = setInterval(fetchData, 1000);

    // Nettoyer l'intervalle à la suppression du composant
    return () => clearInterval(intervalId);
  }, []);

  // Fonctions pour interagir avec la file d'attente
  const addOperation = useCallback((operation: () => Promise<any>, context: string) => {
    return notionRetryQueue.addOperation(operation, context);
  }, []);

  const processQueue = useCallback(() => {
    return notionRetryQueue.processQueue();
  }, []);

  const processNow = useCallback(() => {
    return notionRetryQueue.processNow();
  }, []);

  const pauseQueue = useCallback(() => {
    return notionRetryQueue.pauseQueue();
  }, []);

  const resumeQueue = useCallback(() => {
    return notionRetryQueue.resumeQueue();
  }, []);

  const clearQueue = useCallback(() => {
    return notionRetryQueue.clearOperations();
  }, []);

  const removeOperation = useCallback((operationId: string) => {
    return notionRetryQueue.removeOperation(operationId);
  }, []);

  return {
    // État
    operations,
    stats,
    isProcessing,
    isPaused,
    
    // Actions
    addOperation,
    processQueue,
    processNow,
    pauseQueue,
    resumeQueue,
    clearQueue,
    removeOperation
  };
}

// Export par défaut
export default useRetryQueue;
