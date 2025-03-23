
import { useState, useEffect } from 'react';
import { retryQueueService, notionRetryQueue } from './retryQueue';
import { NotionError } from './types';

/**
 * Hook pour interagir avec le service de file d'attente de retry Notion
 */
export function useRetryQueue() {
  const [stats, setStats] = useState(() => ({
    ...retryQueueService.getStats(),
    successful: 0,
    failed: 0,
    successRate: 100
  }));
  
  const [queuedOperations, setQueuedOperations] = useState<any[]>([]);
  
  // Mettre à jour les statistiques périodiquement
  useEffect(() => {
    const interval = setInterval(() => {
      const currentStats = retryQueueService.getStats();
      // Calculer des métriques supplémentaires
      const successful = currentStats.completedOperations;
      const failed = currentStats.failedOperations;
      const total = successful + failed;
      const successRate = total > 0 ? Math.round((successful / total) * 100) : 100;
      
      setStats({
        ...currentStats,
        successful,
        failed,
        successRate
      });
      
      // Simuler des opérations en file d'attente pour la démo
      // À remplacer par une vraie implémentation plus tard
      setQueuedOperations(
        Array.from({ length: currentStats.pendingOperations }, (_, i) => ({
          id: `op_${i}`,
          context: `Opération Notion #${i+1}`,
          timestamp: Date.now() - (i * 60000),
          attempts: Math.floor(Math.random() * 3) + 1,
          maxAttempts: 3,
          status: 'pending',
          nextRetry: Date.now() + (Math.random() * 60000)
        }))
      );
    }, 1000);
    
    // Charger les stats initiales
    const currentStats = retryQueueService.getStats();
    setStats({
      ...currentStats,
      successful: 0,
      failed: 0,
      successRate: 100
    });
    
    return () => clearInterval(interval);
  }, []);
  
  /**
   * Ajoute une opération à la file d'attente de retry
   */
  const enqueue = <T>(
    operation: () => Promise<T>,
    context: string | Record<string, any> = '',
    options: {
      maxRetries?: number,
      onSuccess?: (result: T) => void,
      onFailure?: (error: Error) => void
    } = {}
  ): string => {
    return retryQueueService.enqueue(
      operation,
      context,
      options
    );
  };
  
  /**
   * Annule une opération en attente
   */
  const cancel = (operationId: string): boolean => {
    return retryQueueService.cancel(operationId);
  };
  
  /**
   * Force l'exécution des opérations en attente
   */
  const processNow = async (): Promise<void> => {
    return retryQueueService.processNow();
  };
  
  /**
   * Gestion de la file d'attente - alias pour processNow
   */
  const processQueue = async (): Promise<void> => {
    return processNow();
  };
  
  /**
   * Vide la file d'attente
   */
  const clearQueue = (): void => {
    // Cette fonction sera implémentée dans le service réel
    // Pour l'instant, on simule en vidant la liste locale
    setQueuedOperations([]);
  };
  
  // Pour compatibilité avec les composants existants
  const enqueueOperation = enqueue;
  
  return {
    stats,
    queuedOperations,
    enqueue,
    enqueueOperation,
    cancel,
    processNow,
    processQueue,
    clearQueue,
    service: retryQueueService
  };
}
