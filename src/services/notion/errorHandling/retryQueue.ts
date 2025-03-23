
import { v4 as uuidv4 } from 'uuid';
import { 
  RetryOperation, 
  RetryQueueStats, 
  RetryQueueCallbacks,
  NotionError
} from './types';
import { notionErrorService } from './errorService';

/**
 * Service de gestion de file d'attente des opérations de retry
 */
class RetryQueueService {
  private operations: RetryOperation[] = [];
  private isProcessing: boolean = false;
  private lastProcessedAt: number | null = null;
  private callbacks: RetryQueueCallbacks = {};
  private processingPromise: Promise<void> | null = null;

  /**
   * Ajoute une opération à la file d'attente
   */
  enqueue<T>(
    retryFn: () => Promise<T>,
    context: string | Record<string, any> = {},
    options: {
      id?: string;
      maxRetries?: number;
      onSuccess?: (result: T) => void;
      onFailure?: (error: Error) => void;
    } = {}
  ): string {
    const contextStr = typeof context === 'string' ? context : JSON.stringify(context);
    const id = options.id || uuidv4();
    
    // Vérifier si l'opération existe déjà
    if (this.hasOperation(id)) {
      console.log(`Opération ${id} déjà dans la file d'attente`);
      return id;
    }
    
    // Créer la nouvelle opération
    const operation: RetryOperation = {
      id,
      timestamp: Date.now(),
      operation: contextStr,
      context: typeof context === 'string' ? context : context.operation,
      retryFn: async () => {
        try {
          const result = await retryFn();
          if (options.onSuccess) {
            options.onSuccess(result);
          }
          return result;
        } catch (error) {
          if (options.onFailure) {
            options.onFailure(error as Error);
          }
          throw error;
        }
      },
      maxRetries: options.maxRetries || 3,
      currentRetries: 0,
      status: 'pending'
    };
    
    // Ajouter à la file d'attente
    this.operations.push(operation);
    
    console.log(`Opération ${id} ajoutée à la file d'attente (${this.operations.length} opérations en attente)`);
    
    return id;
  }
  
  /**
   * Vérifie si une opération existe dans la file
   */
  hasOperation(operationId: string): boolean {
    return this.operations.some(op => op.id === operationId);
  }
  
  /**
   * Annule une opération en attente
   */
  cancel(operationId: string): boolean {
    const initialLength = this.operations.length;
    this.operations = this.operations.filter(op => op.id !== operationId);
    
    return initialLength > this.operations.length;
  }
  
  /**
   * Retourne les statistiques de la file d'attente
   */
  getStats(): RetryQueueStats {
    const pendingOperations = this.operations.filter(op => op.status === 'pending').length;
    const completedOperations = this.operations.filter(op => op.status === 'completed').length;
    const failedOperations = this.operations.filter(op => op.status === 'failed').length;
    
    return {
      pendingOperations,
      completedOperations,
      failedOperations,
      totalOperations: this.operations.length,
      lastProcessedAt: this.lastProcessedAt
    };
  }
  
  /**
   * Force le traitement immédiat des opérations en attente
   */
  async processNow(): Promise<void> {
    // Si déjà en cours de traitement, attendre la fin
    if (this.isProcessing && this.processingPromise) {
      return this.processingPromise;
    }
    
    // Marquer comme en cours de traitement
    this.isProcessing = true;
    
    // Notifier le début du traitement
    if (this.callbacks.onProcessingStart) {
      this.callbacks.onProcessingStart();
    }
    
    // Créer une promesse pour le traitement
    this.processingPromise = this.processOperations();
    
    try {
      await this.processingPromise;
    } finally {
      this.isProcessing = false;
      this.processingPromise = null;
      
      // Mettre à jour le timestamp du dernier traitement
      this.lastProcessedAt = Date.now();
      
      // Notifier la fin du traitement
      if (this.callbacks.onProcessingComplete) {
        this.callbacks.onProcessingComplete(this.getStats());
      }
    }
  }
  
  /**
   * Traite les opérations en attente
   */
  private async processOperations(): Promise<void> {
    const pendingOperations = this.operations.filter(op => op.status === 'pending');
    
    if (pendingOperations.length === 0) {
      console.log('Aucune opération en attente');
      return;
    }
    
    console.log(`Traitement de ${pendingOperations.length} opérations en attente`);
    
    // Traiter chaque opération séquentiellement
    for (const operation of pendingOperations) {
      try {
        // Marquer comme en cours de traitement
        operation.status = 'processing';
        
        // Exécuter l'opération
        await operation.retryFn();
        
        // Marquer comme terminée
        operation.status = 'completed';
        
        // Notifier le succès
        if (this.callbacks.onSuccess) {
          this.callbacks.onSuccess(operation);
        }
      } catch (error) {
        // Incrémenter le compteur de tentatives
        operation.currentRetries++;
        operation.lastError = error as Error;
        
        // Vérifier si on peut réessayer
        if (operation.currentRetries < operation.maxRetries) {
          // Remettre en attente
          operation.status = 'pending';
          console.log(`Échec de l'opération ${operation.id}, nouvelle tentative plus tard (${operation.currentRetries}/${operation.maxRetries})`);
        } else {
          // Marquer comme échouée définitivement
          operation.status = 'failed';
          console.error(`Échec définitif de l'opération ${operation.id} après ${operation.currentRetries} tentatives`);
          
          // Signaler l'erreur au service d'erreurs
          const errorContext = `Échec de l'opération ${operation.context || operation.id} après ${operation.maxRetries} tentatives`;
          notionErrorService.reportError(operation.lastError!, errorContext);
          
          // Notifier l'échec
          if (this.callbacks.onFailure) {
            this.callbacks.onFailure(operation, error as Error);
          }
        }
      }
    }
    
    // Supprimer les opérations terminées après un certain temps
    this.cleanCompletedOperations();
  }
  
  /**
   * Nettoie les opérations terminées anciennes
   */
  private cleanCompletedOperations(maxAgeMs: number = 3600000): void {
    const now = Date.now();
    this.operations = this.operations.filter(op => {
      // Garder les opérations en attente ou en cours
      if (op.status === 'pending' || op.status === 'processing') {
        return true;
      }
      
      // Supprimer les opérations terminées ou échouées trop anciennes
      return (now - op.timestamp) < maxAgeMs;
    });
  }
  
  /**
   * Met à jour les callbacks utilisés par le service
   */
  updateCallbacks(callbacks: Partial<RetryQueueCallbacks>): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }
}

// Créer et exporter une instance unique
export const retryQueueService = new RetryQueueService();
// Pour compatibilité
export const notionRetryQueue = retryQueueService;
