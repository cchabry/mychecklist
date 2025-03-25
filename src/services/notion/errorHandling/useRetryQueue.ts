
import { useState, useEffect, useCallback } from 'react';
import { notionRetryQueue } from './retryQueue';
import { QueuedOperation, OperationStatus, RetryQueueStats } from '../types/unified';

/**
 * Hook pour accéder à la file d'attente des opérations à réessayer
 */
export function useRetryQueue() {
  const [operations, setOperations] = useState<QueuedOperation[]>([]);
  const [stats, setStats] = useState<RetryQueueStats>(notionRetryQueue.getStats());
  
  // S'abonner aux changements de la file d'attente
  useEffect(() => {
    const unsubscribe = notionRetryQueue.subscribe((updatedOperations) => {
      setOperations(updatedOperations);
      setStats(notionRetryQueue.getStats());
    });
    
    return unsubscribe;
  }, []);
  
  /**
   * Ajoute une opération à la file d'attente
   */
  const enqueue = useCallback((
    name: string,
    operation: () => Promise<any>,
    options?: {
      description?: string;
      maxRetries?: number;
      priority?: number;
      tags?: string[];
    }
  ) => {
    return notionRetryQueue.enqueue(name, operation, options);
  }, []);
  
  /**
   * Lance le traitement de la file d'attente
   */
  const processQueue = useCallback(() => {
    return notionRetryQueue.processQueue();
  }, []);
  
  /**
   * Supprime une opération de la file d'attente
   */
  const removeOperation = useCallback((id: string) => {
    notionRetryQueue.remove(id);
  }, []);
  
  /**
   * Vide la file d'attente
   */
  const clearQueue = useCallback(() => {
    notionRetryQueue.clearQueue();
  }, []);
  
  return {
    operations,
    pendingOperations: operations.filter(op => op.status === OperationStatus.PENDING),
    successOperations: operations.filter(op => op.status === OperationStatus.SUCCESS),
    failedOperations: operations.filter(op => op.status === OperationStatus.FAILED),
    pendingCount: stats.pendingOperations,
    successCount: stats.successful,
    errorCount: stats.failed,
    isProcessing: stats.isProcessing,
    enqueue,
    processQueue,
    removeOperation,
    clearQueue
  };
}
