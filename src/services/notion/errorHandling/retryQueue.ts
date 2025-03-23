
import { v4 as uuidv4 } from 'uuid';
import { RetryOperation, RetryQueueStats, RetryQueueCallbacks } from './types';

// Configuration par défaut
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 2000; // ms

/**
 * Service de gestion de la file d'attente pour les opérations à retenter
 */
class RetryQueueService {
  private queue: RetryOperation[] = [];
  private history: RetryOperation[] = [];
  private isProcessing: boolean = false;
  private callbacks: RetryQueueCallbacks = {};
  
  /**
   * Ajoute une opération à la file d'attente
   */
  enqueueOperation(
    operation: string,
    retryFn: () => Promise<any>,
    options: {
      context?: string;
      maxRetries?: number;
    } = {}
  ): string {
    // Vérifier si l'opération existe déjà
    const existingOp = this.queue.find(op => op.operation === operation);
    if (existingOp) {
      return existingOp.id;
    }
    
    // Créer une nouvelle opération
    const id = uuidv4();
    const newOperation: RetryOperation = {
      id,
      timestamp: Date.now(),
      operation,
      context: options.context,
      retryFn,
      maxRetries: options.maxRetries || DEFAULT_MAX_RETRIES,
      currentRetries: 0,
      status: 'pending'
    };
    
    // Ajouter à la file d'attente
    this.queue.push(newOperation);
    
    return id;
  }
  
  /**
   * Vérifie si une opération existe dans la file d'attente
   */
  hasOperation(operation: string): boolean {
    return this.queue.some(op => op.operation === operation);
  }
  
  /**
   * Traite la file d'attente de manière séquentielle
   */
  async processQueue(): Promise<void> {
    // Éviter le traitement simultané
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    if (this.callbacks.onProcessingStart) {
      this.callbacks.onProcessingStart();
    }
    
    try {
      // Traiter chaque opération séquentiellement
      for (const operation of [...this.queue]) {
        await this.processOperation(operation);
      }
    } finally {
      this.isProcessing = false;
      
      if (this.callbacks.onProcessingComplete) {
        this.callbacks.onProcessingComplete(this.getStats());
      }
    }
  }
  
  /**
   * Traite une seule opération
   */
  private async processOperation(operation: RetryOperation): Promise<void> {
    // Mettre à jour le statut
    operation.status = 'processing';
    
    try {
      // Exécuter la fonction de retry
      await operation.retryFn();
      
      // En cas de succès
      operation.status = 'completed';
      
      // Supprimer de la file d'attente
      this.queue = this.queue.filter(op => op.id !== operation.id);
      
      // Ajouter à l'historique
      this.history.push(operation);
      
      // Notifier du succès
      if (this.callbacks.onSuccess) {
        this.callbacks.onSuccess(operation);
      }
    } catch (error) {
      // Incrémenter le compteur de tentatives
      operation.currentRetries++;
      operation.lastError = error instanceof Error ? error : new Error(String(error));
      
      // Vérifier si nous avons atteint le nombre maximal de tentatives
      if (operation.currentRetries >= operation.maxRetries) {
        operation.status = 'failed';
        
        // Supprimer de la file d'attente
        this.queue = this.queue.filter(op => op.id !== operation.id);
        
        // Ajouter à l'historique
        this.history.push(operation);
        
        // Notifier de l'échec
        if (this.callbacks.onFailure) {
          this.callbacks.onFailure(operation, operation.lastError);
        }
      }
    }
  }
  
  /**
   * Supprime une opération de la file d'attente
   */
  removeOperation(id: string): boolean {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(op => op.id !== id);
    
    return initialLength > this.queue.length;
  }
  
  /**
   * Vide la file d'attente
   */
  clearQueue(): void {
    this.queue = [];
  }
  
  /**
   * Obtient les statistiques de la file d'attente
   */
  getStats(): RetryQueueStats {
    const pendingOperations = this.queue.length;
    const completedOperations = this.history.filter(op => op.status === 'completed').length;
    const failedOperations = this.history.filter(op => op.status === 'failed').length;
    
    return {
      pendingOperations,
      completedOperations,
      failedOperations,
      totalOperations: pendingOperations + completedOperations + failedOperations,
      lastProcessedAt: this.history.length > 0 
        ? Math.max(...this.history.map(op => op.timestamp))
        : null
    };
  }
  
  /**
   * Met à jour les callbacks
   */
  updateCallbacks(callbacks: RetryQueueCallbacks): void {
    this.callbacks = {
      ...this.callbacks,
      ...callbacks
    };
  }
}

// Créer et exporter une instance unique
export const retryQueueService = new RetryQueueService();
