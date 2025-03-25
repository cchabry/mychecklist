
import { useState, useEffect, useCallback } from 'react';
import { notionRetryQueue } from './retryQueue';
import { RetryQueueStats, RetryOperationOptions } from './types';

/**
 * Hook pour utiliser la file d'attente de réessai
 */
export function useRetryQueue() {
  const [stats, setStats] = useState<RetryQueueStats>({
    totalOperations: 0,
    pendingOperations: 0,
    completedOperations: 0,
    failedOperations: 0,
    lastProcessedAt: null,
    isProcessing: false
  });
  
  // S'abonner aux mises à jour des statistiques
  useEffect(() => {
    // Vérification de l'existence de la méthode subscribe
    if (!notionRetryQueue.subscribe) {
      console.error('La méthode subscribe n\'existe pas sur notionRetryQueue');
      return () => {};
    }
    
    const unsubscribe = notionRetryQueue.subscribe((newStats) => {
      setStats(newStats);
    });
    
    // Charger les stats initiales
    setStats(notionRetryQueue.getStats());
    
    return unsubscribe;
  }, []);
  
  /**
   * Ajouter une opération à la file d'attente
   */
  const enqueue = useCallback(<T>(
    operation: () => Promise<T>,
    context: string | Record<string, any> = {},
    options: RetryOperationOptions = {}
  ): string => {
    return notionRetryQueue.enqueue(operation, context, options);
  }, []);
  
  /**
   * Traiter la file d'attente
   */
  const processQueue = useCallback(() => {
    // Vérification de l'existence de la méthode processQueue
    if (typeof notionRetryQueue.processQueue === 'function') {
      (notionRetryQueue as any).processQueue();
    } else {
      console.error('La méthode processQueue n\'est pas accessible sur notionRetryQueue');
    }
  }, []);
  
  /**
   * Vider la file d'attente
   */
  const clearQueue = useCallback(() => {
    // Vérification de l'existence de la méthode clearQueue
    if (typeof (notionRetryQueue as any).clearQueue === 'function') {
      (notionRetryQueue as any).clearQueue();
    } else {
      console.error('La méthode clearQueue n\'existe pas sur notionRetryQueue');
    }
  }, []);
  
  /**
   * Mettre en pause la file d'attente
   */
  const pauseQueue = useCallback(() => {
    // Vérification de l'existence de la méthode pause
    if (typeof (notionRetryQueue as any).pause === 'function') {
      (notionRetryQueue as any).pause();
    } else {
      console.error('La méthode pause n\'existe pas sur notionRetryQueue');
    }
  }, []);
  
  /**
   * Reprendre le traitement de la file d'attente
   */
  const resumeQueue = useCallback(() => {
    // Vérification de l'existence de la méthode resume
    if (typeof (notionRetryQueue as any).resume === 'function') {
      (notionRetryQueue as any).resume();
    } else {
      console.error('La méthode resume n\'existe pas sur notionRetryQueue');
    }
  }, []);
  
  /**
   * Vérifier si la file d'attente est en pause
   */
  const isPaused = useCallback(() => {
    // Vérification de l'existence de la méthode isPaused
    if (typeof (notionRetryQueue as any).isPaused === 'function') {
      return (notionRetryQueue as any).isPaused();
    } else {
      console.error('La méthode isPaused n\'existe pas sur notionRetryQueue');
      return false;
    }
  }, []);
  
  return {
    stats,
    enqueue,
    processQueue,
    clearQueue,
    pauseQueue,
    resumeQueue,
    isPaused
  };
}
