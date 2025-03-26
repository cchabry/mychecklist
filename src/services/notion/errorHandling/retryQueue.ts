
/**
 * Service de file d'attente pour les opérations à réessayer
 */

import { RetryOperationOptions, RetryQueueStats } from '../types/unified';
import { v4 as uuidv4 } from 'uuid';

// Types internes
interface QueuedOperation {
  id: string;
  operation: () => Promise<any>;
  context: string | Record<string, any>;
  options: RetryOperationOptions;
  addedAt: number;
  attempts: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: Error;
}

// État de la file d'attente
const queue: QueuedOperation[] = [];
let isProcessing = false;
let lastProcessedAt: number | null = null;
const subscribers: Array<(stats: RetryQueueStats) => void> = [];

// Statistiques
let stats: RetryQueueStats = {
  totalOperations: 0,
  pendingOperations: 0,
  completedOperations: 0,
  failedOperations: 0,
  lastProcessedAt: null,
  isProcessing: false
};

/**
 * Met à jour les statistiques et notifie les abonnés
 */
const updateStats = () => {
  stats = {
    totalOperations: queue.length,
    pendingOperations: queue.filter(op => op.status === 'pending').length,
    completedOperations: queue.filter(op => op.status === 'completed').length,
    failedOperations: queue.filter(op => op.status === 'failed').length,
    lastProcessedAt,
    isProcessing
  };
  
  // Notifier les abonnés
  subscribers.forEach(callback => {
    try {
      callback({ ...stats });
    } catch (e) {
      console.error('Erreur lors de la notification d\'un abonné:', e);
    }
  });
};

/**
 * Service de file d'attente pour les opérations à réessayer
 */
export const notionRetryQueue = {
  /**
   * Ajoute une opération à la file d'attente
   */
  enqueue(
    operation: () => Promise<any>,
    context: string | Record<string, any> = {},
    options: RetryOperationOptions = {}
  ): string {
    const id = uuidv4();
    
    // Créer une entrée dans la file d'attente
    queue.push({
      id,
      operation,
      context,
      options: {
        maxRetries: 3,
        retryDelay: 1000,
        maxDelay: 30000,
        backoff: 2,
        ...options
      },
      addedAt: Date.now(),
      attempts: 0,
      status: 'pending'
    });
    
    // Mettre à jour les statistiques
    updateStats();
    
    return id;
  },
  
  /**
   * Annule une opération en attente
   */
  cancel(operationId: string): boolean {
    const index = queue.findIndex(op => op.id === operationId && op.status === 'pending');
    
    if (index === -1) return false;
    
    // Supprimer l'opération de la file d'attente
    queue.splice(index, 1);
    
    // Mettre à jour les statistiques
    updateStats();
    
    return true;
  },
  
  /**
   * Traite toutes les opérations en attente
   */
  async processQueue(): Promise<void> {
    if (isProcessing) return;
    
    isProcessing = true;
    updateStats();
    
    try {
      // Filtrer les opérations en attente
      const pendingOperations = queue.filter(op => op.status === 'pending');
      
      // Traiter les opérations séquentiellement
      for (const op of pendingOperations) {
        if (op.status !== 'pending') continue;
        
        op.status = 'processing';
        op.attempts++;
        
        try {
          // Exécuter l'opération
          const result = await op.operation();
          
          // Marquer comme réussie
          op.status = 'completed';
          op.result = result;
          
          // Appeler le callback de succès
          if (op.options.onSuccess) {
            try {
              op.options.onSuccess(result);
            } catch (e) {
              console.error('Erreur dans le callback de succès:', e);
            }
          }
          
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          
          // Vérifier s'il reste des tentatives
          if (op.attempts < (op.options.maxRetries || 3)) {
            // Remettre en attente
            op.status = 'pending';
          } else {
            // Marquer comme échouée
            op.status = 'failed';
            op.error = err;
            
            // Appeler le callback d'échec
            if (op.options.onFailure) {
              try {
                op.options.onFailure(err);
              } catch (e) {
                console.error('Erreur dans le callback d\'échec:', e);
              }
            }
          }
        }
        
        // Mettre à jour les statistiques après chaque opération
        updateStats();
      }
    } finally {
      isProcessing = false;
      lastProcessedAt = Date.now();
      updateStats();
    }
  },
  
  /**
   * Traite immédiatement une opération spécifique
   */
  async processNow(operationId: string): Promise<any> {
    const operation = queue.find(op => op.id === operationId);
    
    if (!operation) {
      throw new Error(`Opération ${operationId} non trouvée`);
    }
    
    if (operation.status !== 'pending') {
      throw new Error(`Opération ${operationId} non en attente (${operation.status})`);
    }
    
    operation.status = 'processing';
    operation.attempts++;
    updateStats();
    
    try {
      // Exécuter l'opération
      const result = await operation.operation();
      
      // Marquer comme réussie
      operation.status = 'completed';
      operation.result = result;
      
      // Appeler le callback de succès
      if (operation.options.onSuccess) {
        try {
          operation.options.onSuccess(result);
        } catch (e) {
          console.error('Erreur dans le callback de succès:', e);
        }
      }
      
      updateStats();
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      // Vérifier s'il reste des tentatives
      if (operation.attempts < (operation.options.maxRetries || 3)) {
        // Remettre en attente
        operation.status = 'pending';
      } else {
        // Marquer comme échouée
        operation.status = 'failed';
        operation.error = err;
        
        // Appeler le callback d'échec
        if (operation.options.onFailure) {
          try {
            operation.options.onFailure(err);
          } catch (e) {
            console.error('Erreur dans le callback d\'échec:', e);
          }
        }
      }
      
      updateStats();
      throw err;
    }
  },
  
  /**
   * Vide la file d'attente
   */
  clearQueue(): void {
    // Garder uniquement les opérations terminées ou en cours
    const nonPendingOperations = queue.filter(op => 
      op.status === 'completed' || 
      op.status === 'failed' || 
      (op.status === 'processing' && isProcessing)
    );
    
    queue.length = 0;
    queue.push(...nonPendingOperations);
    
    updateStats();
  },
  
  /**
   * Récupère les statistiques de la file d'attente
   */
  getStats(): RetryQueueStats {
    return { ...stats };
  },
  
  /**
   * S'abonne aux changements de statistiques
   */
  subscribe(callback: (stats: RetryQueueStats) => void): () => void {
    subscribers.push(callback);
    
    // Envoyer les statistiques initiales
    callback({ ...stats });
    
    // Retourner une fonction pour se désabonner
    return () => {
      const index = subscribers.indexOf(callback);
      if (index !== -1) {
        subscribers.splice(index, 1);
      }
    };
  }
};
