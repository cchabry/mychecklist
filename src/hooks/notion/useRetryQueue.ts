
import { useState, useEffect } from 'react';
import { retryQueueService } from '@/services/notion/errorHandling/retryQueueService';

/**
 * Hook pour utiliser le service de file d'attente avec nouvelles tentatives
 */
export function useRetryQueue() {
  const [queuedOperations, setQueuedOperations] = useState(retryQueueService.getQueuedOperations());
  const [stats, setStats] = useState(retryQueueService.getStats());
  
  // Intervalle de rafraîchissement pour les statistiques
  useEffect(() => {
    const updateStats = () => {
      setQueuedOperations(retryQueueService.getQueuedOperations());
      setStats(retryQueueService.getStats());
    };
    
    // Intervalle de rafraîchissement
    const interval = setInterval(updateStats, 2000);
    
    // Mise à jour initiale
    updateStats();
    
    return () => clearInterval(interval);
  }, []);

  // Fonctions utilitaires
  const enqueueOperation = <T>(
    operation: () => Promise<T>,
    context: string,
    options?: {
      maxAttempts?: number;
      backoffFactor?: number;
      initialDelay?: number;
      onSuccess?: (result: T) => void;
      onFailure?: (error: Error) => void;
    }
  ) => {
    return retryQueueService.enqueue(operation, context, options);
  };
  
  const cancelOperation = (operationId: string) => {
    return retryQueueService.cancel(operationId);
  };
  
  const processQueue = () => {
    return retryQueueService.processQueue();
  };
  
  const clearQueue = () => {
    return retryQueueService.clearQueue();
  };

  return {
    queuedOperations,
    stats,
    enqueueOperation,
    cancelOperation,
    processQueue,
    clearQueue
  };
}
