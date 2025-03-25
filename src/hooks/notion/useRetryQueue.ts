
import { useState, useEffect } from 'react';
import { notionRetryQueue } from '@/services/notion/errorHandling/retryQueueService';
import { QueuedOperation, OperationStatus } from '@/services/notion/types/unified';

/**
 * Hook pour utiliser la file d'attente de réessais Notion
 */
export function useRetryQueue() {
  const [operations, setOperations] = useState<QueuedOperation[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Statistiques
  const pendingCount = operations.filter(op => op.status === OperationStatus.PENDING).length;
  const successCount = operations.filter(op => op.status === OperationStatus.SUCCESS).length;
  const errorCount = operations.filter(op => op.status === OperationStatus.FAILED).length;
  
  useEffect(() => {
    // S'abonner aux changements
    const unsubscribe = notionRetryQueue.subscribe((updatedOperations) => {
      setOperations(updatedOperations);
      setIsProcessing(notionRetryQueue.getStats().isProcessing);
    });
    
    // Charger l'état initial
    setOperations(notionRetryQueue.getOperations());
    setIsProcessing(notionRetryQueue.getStats().isProcessing);
    
    return unsubscribe;
  }, []);
  
  // Pour simplifier, nous réexportons directement les méthodes
  return {
    operations,
    pendingCount,
    successCount,
    errorCount,
    isProcessing,
    lastSync: notionRetryQueue.getStats().lastProcessedAt,
    retryOperation: notionRetryQueue.retryOperation.bind(notionRetryQueue),
    addOperation: notionRetryQueue.addOperation.bind(notionRetryQueue),
    processQueue: notionRetryQueue.processQueue.bind(notionRetryQueue),
    clearQueue: notionRetryQueue.clearQueue.bind(notionRetryQueue),
    clearCompletedOperations: notionRetryQueue.clearCompletedOperations.bind(notionRetryQueue),
    getStats: notionRetryQueue.getStats.bind(notionRetryQueue)
  };
}

export default useRetryQueue;
