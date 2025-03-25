
import { useState, useEffect } from 'react';
import { notionRetryQueue, useRetryQueue } from '@/services/notion/errorHandling/retryQueueService';
import { QueuedOperation, OperationStatus, RetryStrategy } from '@/services/notion/types/unified';

/**
 * Hook pour gérer une file d'attente d'opérations API
 * Utilise le service notionRetryQueue sous le capot
 */
export function useOperationQueue() {
  const queue = useRetryQueue();
  
  // Ajouter une opération avec une stratégie de retry
  const addOperation = (
    name: string,
    operation: () => Promise<any>,
    options: {
      description?: string;
      priority?: number;
      tags?: string[];
      executeNow?: boolean;
      silent?: boolean;
      retryStrategy?: RetryStrategy;
      maxRetries?: number;
    } = {}
  ) => {
    return notionRetryQueue.addOperation(name, operation, options);
  };
  
  // Renvoyer une API complète
  return {
    ...queue,
    addOperation
  };
}
