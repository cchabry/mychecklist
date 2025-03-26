
/**
 * Service de gestion de la file d'attente de réessai
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  RetryOperation,
  RetryOperationOptions,
  RetryQueueStats
} from '../types/unified';

// Stockage local des opérations
let operations: RetryOperation[] = [];

// Indicateurs d'état
let processing = false;
let paused = false;

/**
 * Service de gestion de la file d'attente de réessai
 */
export const notionRetryQueue = {
  /**
   * Ajoute une opération à la file d'attente
   */
  addOperation(
    operation: () => Promise<any>,
    context: string = 'Opération Notion',
    options: RetryOperationOptions = {}
  ): string {
    const id = uuidv4();
    
    // Créer l'objet d'opération
    const retryOperation: RetryOperation = {
      id,
      operation,
      context,
      options: {
        maxRetries: options.maxRetries || 3,
        retryDelay: options.retryDelay || 2000,
        backoffFactor: options.backoffFactor || 1.5,
        priority: options.priority || 'normal',
        onSuccess: options.onSuccess,
        onError: options.onError
      },
      attempts: 0,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // Ajouter l'opération à la file d'attente
    operations.push(retryOperation);
    
    return id;
  },
  
  /**
   * Met à jour les statistiques de la file d'attente
   */
  updateStats(): RetryQueueStats {
    const totalOperations = operations.length;
    const pendingOperations = operations.filter(op => op.status === 'pending').length;
    const completedOperations = operations.filter(op => op.status === 'success').length;
    const failedOperations = operations.filter(op => op.status === 'failed').length;
    const successRate = totalOperations > 0 
      ? completedOperations / totalOperations 
      : 0;
    
    return {
      totalOperations,
      pendingOperations,
      completedOperations,
      failedOperations,
      isProcessing: processing,
      isPaused: paused,
      successRate
    };
  },
  
  /**
   * Récupère toutes les opérations
   */
  getOperations(): RetryOperation[] {
    return [...operations];
  },
  
  /**
   * Récupère les statistiques de la file d'attente
   */
  getStats(): RetryQueueStats {
    return this.updateStats();
  },
  
  /**
   * Met en pause le traitement de la file d'attente
   */
  pause(): void {
    paused = true;
  },
  
  /**
   * Reprend le traitement de la file d'attente
   */
  resume(): void {
    paused = false;
  },
  
  /**
   * Vérifie si la file d'attente est en pause
   */
  isPaused(): boolean {
    return paused;
  },
  
  /**
   * Traite la file d'attente
   */
  async processQueue(): Promise<RetryOperation[]> {
    // Si déjà en cours de traitement ou en pause, ne rien faire
    if (processing || paused) {
      return operations;
    }
    
    // Marquer comme en cours de traitement
    processing = true;
    
    try {
      // Récupérer les opérations en attente
      const pendingOperations = operations.filter(op => op.status === 'pending');
      
      // Si aucune opération en attente, terminer
      if (pendingOperations.length === 0) {
        return operations;
      }
      
      // Traiter chaque opération
      for (const op of pendingOperations) {
        // Si la file d'attente est en pause, arrêter le traitement
        if (paused) {
          break;
        }
        
        // Vérifier si le nombre maximum de tentatives a été atteint
        if (op.attempts >= op.options.maxRetries!) {
          op.status = 'failed';
          op.updatedAt = Date.now();
          continue;
        }
        
        // Incrémenter le nombre de tentatives
        op.attempts++;
        op.status = 'processing';
        op.updatedAt = Date.now();
        
        try {
          // Exécuter l'opération
          const result = await op.operation();
          
          // Marquer comme réussie
          op.status = 'success';
          op.result = result;
          op.updatedAt = Date.now();
          
          // Appeler le callback de succès
          if (op.options.onSuccess) {
            try {
              op.options.onSuccess(result);
            } catch (e) {
              console.error('Erreur lors du callback de succès:', e);
            }
          }
        } catch (error) {
          // Si le nombre maximum de tentatives a été atteint, marquer comme échouée
          if (op.attempts >= op.options.maxRetries!) {
            op.status = 'failed';
            op.error = error as Error;
            op.updatedAt = Date.now();
            
            // Appeler le callback d'erreur
            if (op.options.onError) {
              try {
                op.options.onError(error as Error);
              } catch (e) {
                console.error('Erreur lors du callback d\'erreur:', e);
              }
            }
          } else {
            // Sinon, remettre en attente pour une prochaine tentative
            op.status = 'pending';
            op.updatedAt = Date.now();
          }
        }
      }
      
      return operations;
    } finally {
      // Marquer comme terminé
      processing = false;
    }
  },
  
  /**
   * Réessaie une opération spécifique
   */
  async retryOperation(id: string): Promise<boolean> {
    // Trouver l'opération
    const op = operations.find(op => op.id === id);
    
    // Si l'opération n'existe pas, retourner false
    if (!op) {
      return false;
    }
    
    // Réinitialiser le statut
    op.status = 'pending';
    op.attempts = 0;
    op.updatedAt = Date.now();
    
    // Exécuter l'opération
    try {
      op.status = 'processing';
      const result = await op.operation();
      
      // Marquer comme réussie
      op.status = 'success';
      op.result = result;
      op.updatedAt = Date.now();
      
      // Appeler le callback de succès
      if (op.options.onSuccess) {
        try {
          op.options.onSuccess(result);
        } catch (e) {
          console.error('Erreur lors du callback de succès:', e);
        }
      }
      
      return true;
    } catch (error) {
      // Marquer comme échouée
      op.status = 'failed';
      op.error = error as Error;
      op.updatedAt = Date.now();
      
      // Appeler le callback d'erreur
      if (op.options.onError) {
        try {
          op.options.onError(error as Error);
        } catch (e) {
          console.error('Erreur lors du callback d\'erreur:', e);
        }
      }
      
      return false;
    }
  },
  
  /**
   * Supprime une opération de la file d'attente
   */
  removeOperation(id: string): boolean {
    const index = operations.findIndex(op => op.id === id);
    
    if (index === -1) {
      return false;
    }
    
    operations.splice(index, 1);
    return true;
  },
  
  /**
   * Efface toutes les opérations
   */
  clearOperations(): void {
    operations = [];
  }
};

export default notionRetryQueue;
