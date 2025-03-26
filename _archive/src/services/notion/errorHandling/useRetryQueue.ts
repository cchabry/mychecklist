
import { useState, useEffect, useCallback } from 'react';
import { notionRetryQueue } from './retryQueue';
import { RetryQueueStats, RetryOperationOptions, QueuedOperation } from '../types/unified';

/**
 * Hook pour utiliser la file d'attente de réessai
 */
export function useRetryQueue() {
  const [stats, setStats] = useState<RetryQueueStats>({
    totalOperations: 0,
    pendingOperations: 0,
    completedOperations: 0,
    failedOperations: 0,
    successful: 0,
    failed: 0,
    lastProcessedAt: null,
    isProcessing: false
  });
  
  const [queuedOperations, setQueuedOperations] = useState<QueuedOperation[]>([]);
  
  // S'abonner aux mises à jour des statistiques
  useEffect(() => {
    // Fonction adaptative qui gère le cas où subscribe n'existe pas encore
    const setupSubscription = () => {
      // Si la méthode subscribe existe, l'utiliser
      if (typeof (notionRetryQueue as any).subscribe === 'function') {
        return (notionRetryQueue as any).subscribe((newStats: RetryQueueStats) => {
          setStats(newStats);
          
          // Récupérer aussi les opérations si possible
          if (typeof (notionRetryQueue as any).getQueuedOperations === 'function') {
            setQueuedOperations((notionRetryQueue as any).getQueuedOperations());
          }
        });
      }
      
      // Sinon, utiliser un polling
      const interval = setInterval(() => {
        setStats(notionRetryQueue.getStats());
        
        // Récupérer aussi les opérations si possible
        if (typeof (notionRetryQueue as any).getQueuedOperations === 'function') {
          setQueuedOperations((notionRetryQueue as any).getQueuedOperations());
        }
      }, 2000);
      
      return () => clearInterval(interval);
    };
    
    // Mettre en place l'abonnement ou le polling
    const cleanup = setupSubscription();
    
    // Charger les stats initiales
    setStats(notionRetryQueue.getStats());
    
    // Charger les opérations initiales si possible
    if (typeof (notionRetryQueue as any).getQueuedOperations === 'function') {
      setQueuedOperations((notionRetryQueue as any).getQueuedOperations());
    }
    
    return cleanup;
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
    if (typeof notionRetryQueue.processQueue === 'function') {
      return notionRetryQueue.processQueue();
    }
    
    // Fallback pour les anciennes versions
    if (typeof (notionRetryQueue as any).processNow === 'function') {
      return (notionRetryQueue as any).processNow();
    }
    
    console.warn('Method processQueue not available on notionRetryQueue');
    return Promise.resolve();
  }, []);
  
  /**
   * Vider la file d'attente (méthode de remplacement)
   */
  const clearQueue = useCallback(() => {
    if (typeof notionRetryQueue.clearQueue === 'function') {
      notionRetryQueue.clearQueue();
    } else {
      console.log("Clear queue appelé - fonctionnalité non encore implémentée");
    }
  }, []);
  
  /**
   * Mettre en pause la file d'attente (méthode de remplacement)
   */
  const pauseQueue = useCallback(() => {
    if (typeof (notionRetryQueue as any).pauseQueue === 'function') {
      (notionRetryQueue as any).pauseQueue();
    } else {
      console.log("Pause queue appelé - fonctionnalité non encore implémentée");
    }
  }, []);
  
  /**
   * Reprendre le traitement de la file d'attente (méthode de remplacement)
   */
  const resumeQueue = useCallback(() => {
    if (typeof (notionRetryQueue as any).resumeQueue === 'function') {
      (notionRetryQueue as any).resumeQueue();
    } else {
      console.log("Resume queue appelé - fonctionnalité non encore implémentée");
    }
  }, []);
  
  /**
   * Vérifier si la file d'attente est en pause (méthode de remplacement)
   */
  const isPaused = useCallback((): boolean => {
    if (typeof (notionRetryQueue as any).isPaused === 'function') {
      return (notionRetryQueue as any).isPaused();
    }
    return false;
  }, []);
  
  return {
    stats,
    queuedOperations,
    enqueue,
    processQueue,
    clearQueue,
    pauseQueue,
    resumeQueue,
    isPaused
  };
}
