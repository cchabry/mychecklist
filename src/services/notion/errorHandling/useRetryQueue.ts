
import { useState, useEffect } from 'react';
import { notionRetryQueue } from './retryQueue';
import { NotionError } from './types';

/**
 * Hook pour interagir avec le service de file d'attente de retry Notion
 */
export function useNotionRetryQueue() {
  const [stats, setStats] = useState(() => notionRetryQueue.getStats());
  
  // Mettre à jour les statistiques périodiquement
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(notionRetryQueue.getStats());
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  /**
   * Enqueue une opération avec retry
   */
  const enqueueOperation = <T>(
    operation: () => Promise<T>,
    context: Record<string, any> = {},
    options: {
      id?: string;
      maxRetries?: number;
      onSuccess?: (result: T) => void;
      onFailure?: (error: NotionError) => void;
    } = {}
  ) => {
    return notionRetryQueue.enqueue(operation, context, options);
  };
  
  /**
   * Annuler une opération
   */
  const cancelOperation = (id: string) => {
    return notionRetryQueue.cancel(id);
  };
  
  /**
   * Forcer le traitement immédiat
   */
  const processNow = async () => {
    await notionRetryQueue.processNow();
    setStats(notionRetryQueue.getStats());
  };
  
  return {
    // Statistiques
    stats,
    
    // Actions
    enqueueOperation,
    cancelOperation,
    processNow,
    
    // Accès au service brut (à utiliser avec précaution)
    notionRetryQueue
  };
}
