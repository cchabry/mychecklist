
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
    // Fonction adaptative qui gère le cas où subscribe n'existe pas encore
    const setupSubscription = () => {
      // Si la méthode subscribe existe, l'utiliser
      if (typeof (notionRetryQueue as any).subscribe === 'function') {
        return (notionRetryQueue as any).subscribe((newStats: RetryQueueStats) => {
          setStats(newStats);
        });
      }
      
      // Sinon, utiliser un polling
      const interval = setInterval(() => {
        setStats(notionRetryQueue.getStats());
      }, 2000);
      
      return () => clearInterval(interval);
    };
    
    // Mettre en place l'abonnement ou le polling
    const cleanup = setupSubscription();
    
    // Charger les stats initiales
    setStats(notionRetryQueue.getStats());
    
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
    // Appeler processNow qui est une méthode publique de l'API
    notionRetryQueue.processNow();
  }, []);
  
  /**
   * Vider la file d'attente (méthode de remplacement)
   */
  const clearQueue = useCallback(() => {
    // Simulation de clearQueue si non disponible dans l'API
    console.log("Clear queue appelé - fonctionnalité non encore implémentée");
  }, []);
  
  /**
   * Mettre en pause la file d'attente (méthode de remplacement)
   */
  const pauseQueue = useCallback(() => {
    // Simulation si la méthode n'existe pas
    console.log("Pause queue appelé - fonctionnalité non encore implémentée");
  }, []);
  
  /**
   * Reprendre le traitement de la file d'attente (méthode de remplacement)
   */
  const resumeQueue = useCallback(() => {
    // Simulation si la méthode n'existe pas
    console.log("Resume queue appelé - fonctionnalité non encore implémentée");
  }, []);
  
  /**
   * Vérifier si la file d'attente est en pause (méthode de remplacement)
   */
  const isPaused = useCallback((): boolean => {
    // Simulation si la méthode n'existe pas
    return false;
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
