
import { useCallback } from 'react';
import { useRetryQueue } from '@/services/notion/errorHandling';
import { toast } from 'sonner';

/**
 * Hook pour interagir avec la file d'attente des opérations
 * Version simplifiée qui utilise la file d'attente de retry sous-jacente
 */
export function useOperationQueue() {
  const {
    operations,
    pendingCount,
    successCount,
    errorCount,
    isProcessing,
    enqueue,
    processQueue: processQueueInternal,
    clearQueue,
    removeOperation
  } = useRetryQueue();
  
  /**
   * Traite la file d'attente avec feedback
   */
  const processQueue = useCallback(async () => {
    if (pendingCount === 0) {
      toast.info('Aucune opération en attente');
      return;
    }
    
    toast.info(`Traitement de ${pendingCount} opération(s)...`);
    
    try {
      await processQueueInternal();
      
      toast.success('Traitement terminé', {
        description: `${successCount} succès, ${errorCount} échecs`
      });
    } catch (error) {
      toast.error('Erreur lors du traitement de la file d\'attente', {
        description: error instanceof Error ? error.message : String(error)
      });
    }
  }, [pendingCount, successCount, errorCount, processQueueInternal]);
  
  /**
   * Ajoute une opération à la file d'attente avec options améliorées
   */
  const addOperation = useCallback((
    name: string,
    operation: () => Promise<any>,
    options: {
      description?: string;
      priority?: number;
      tags?: string[];
      executeNow?: boolean;
      silent?: boolean;
    } = {}
  ) => {
    const opId = enqueue(name, operation, {
      description: options.description,
      priority: options.priority,
      tags: options.tags
    });
    
    if (!options.silent) {
      toast.info('Opération ajoutée à la file d\'attente', {
        description: options.description || name
      });
    }
    
    if (options.executeNow) {
      processQueue();
    }
    
    return opId;
  }, [enqueue, processQueue]);
  
  return {
    // État
    operations,
    pendingCount,
    successCount,
    errorCount,
    isProcessing,
    
    // Actions
    addOperation,
    processQueue,
    clearQueue,
    removeOperation
  };
}
