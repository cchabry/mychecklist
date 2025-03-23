
import { useState, useEffect } from 'react';
import { notionRetryQueue } from '@/services/notion/errorHandling/retryQueue';

/**
 * Hook pour accéder au service de file d'attente de retry Notion
 */
export function useRetryQueue() {
  const [stats, setStats] = useState({
    totalOperations: 0,
    pendingOperations: 0,
    isProcessing: false
  });
  
  // Récupérer les statistiques actuelles
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(notionRetryQueue.getStats());
    }, 1000);
    
    // Charger les stats initiales
    setStats(notionRetryQueue.getStats());
    
    return () => clearInterval(interval);
  }, []);
  
  /**
   * Ajoute une opération à la file d'attente de retry
   */
  const enqueue = <T>(
    operation: () => Promise<T>,
    context: string = '',
    options: {
      maxRetries?: number,
      onSuccess?: (result: T) => void,
      onFailure?: (error: Error) => void
    } = {}
  ): string => {
    return notionRetryQueue.enqueue(
      operation,
      { operation: context },
      options
    );
  };
  
  /**
   * Annule une opération en attente
   */
  const cancel = (operationId: string): boolean => {
    return notionRetryQueue.cancel(operationId);
  };
  
  /**
   * Force l'exécution des opérations en attente
   */
  const processNow = async (): Promise<void> => {
    return notionRetryQueue.processNow();
  };
  
  return {
    stats,
    enqueue,
    cancel,
    processNow,
    service: notionRetryQueue
  };
}
