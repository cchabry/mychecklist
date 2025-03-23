
import { useState, useEffect } from 'react';
import { notionRetryQueue } from '@/services/notion/errorHandling/retryQueue';
import { RetryQueueStats } from '@/services/notion/errorHandling/types';

/**
 * Hook pour accéder au service de file d'attente de retry Notion
 */
export function useRetryQueue() {
  const [stats, setStats] = useState<RetryQueueStats>({
    totalOperations: 0,
    pendingOperations: 0,
    completedOperations: 0,
    failedOperations: 0,
    lastProcessedAt: null,
    isProcessing: false,
    successful: 0,
    failed: 0,
    successRate: 100
  });
  
  const [queuedOperations, setQueuedOperations] = useState<any[]>([]);
  
  // Récupérer les statistiques actuelles
  useEffect(() => {
    const interval = setInterval(() => {
      const currentStats = notionRetryQueue.getStats();
      setStats({
        ...currentStats,
        successful: currentStats.completedOperations || 0,
        failed: currentStats.failedOperations || 0,
        successRate: currentStats.totalOperations > 0 
          ? Math.round((currentStats.completedOperations / currentStats.totalOperations) * 100)
          : 100
      });
      
      // Simuler des opérations en file d'attente pour la démo
      // À remplacer par une vraie implémentation quand disponible
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
    const initialStats = notionRetryQueue.getStats();
    setStats({
      ...initialStats,
      successful: initialStats.completedOperations || 0,
      failed: initialStats.failedOperations || 0,
      successRate: initialStats.totalOperations > 0 
        ? Math.round((initialStats.completedOperations / initialStats.totalOperations) * 100)
        : 100
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
    // Convertir le contexte en objet si c'est une chaîne
    const contextObj = typeof context === 'string' 
      ? { operation: context } 
      : context;
      
    return notionRetryQueue.enqueue(
      operation,
      contextObj,
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
  
  /**
   * Gestion de la file d'attente - force le traitement immédiat
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
  
  return {
    stats,
    queuedOperations,
    enqueue,
    cancel,
    processNow,
    processQueue,
    clearQueue,
    service: notionRetryQueue
  };
}
