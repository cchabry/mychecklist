
import { v4 as uuidv4 } from 'uuid';
import { 
  QueuedOperation, 
  OperationStatus, 
  RetryQueueStats,
  RetryOperationOptions
} from '../types/errorTypes';
import { notionErrorService } from './errorService';

// Type pour les abonnés à la file d'attente
type QueueSubscriber = (operations: QueuedOperation[]) => void;

// Options par défaut
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 seconde
const DEFAULT_PRIORITY = 5; // Priorité moyenne (1-10)
const MAX_CONCURRENT_OPERATIONS = 3;

/**
 * Service de gestion de la file d'attente des opérations à réessayer
 */
export class NotionRetryQueue {
  private static instance: NotionRetryQueue;
  
  private operations: QueuedOperation[] = [];
  private subscribers: QueueSubscriber[] = [];
  private isProcessing: boolean = false;
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private stats: RetryQueueStats = {
    totalOperations: 0,
    pendingOperations: 0,
    completedOperations: 0,
    failedOperations: 0,
    successful: 0,
    failed: 0,
    lastProcessedAt: null,
    isProcessing: false
  };

  private constructor() {}
  
  /**
   * Obtenir l'instance unique du service
   */
  public static getInstance(): NotionRetryQueue {
    if (!NotionRetryQueue.instance) {
      NotionRetryQueue.instance = new NotionRetryQueue();
    }
    return NotionRetryQueue.instance;
  }
  
  /**
   * Ajouter une opération à la file d'attente
   */
  public enqueue(
    name: string,
    operation: () => Promise<any>,
    options: {
      description?: string;
      maxRetries?: number;
      retryDelay?: number;
      priority?: number;
      tags?: string[];
    } = {}
  ): string {
    const id = uuidv4();
    const now = Date.now();
    
    const queuedOperation: QueuedOperation = {
      id,
      name,
      operation,
      retries: 0,
      maxRetries: options.maxRetries || DEFAULT_MAX_RETRIES,
      priority: options.priority || DEFAULT_PRIORITY,
      tags: options.tags || [],
      status: OperationStatus.PENDING,
      createdAt: now,
      updatedAt: now,
      description: options.description
    };
    
    this.operations.push(queuedOperation);
    
    // Mettre à jour les statistiques
    this.stats.totalOperations++;
    this.stats.pendingOperations++;
    
    // Notifier les abonnés
    this.notifySubscribers();
    
    console.log(`[RetryQueue] Opération ajoutée à la file d'attente: ${name}`);
    
    return id;
  }
  
  /**
   * Traiter la file d'attente des opérations
   */
  public async processQueue(): Promise<void> {
    if (this.isProcessing) {
      console.log('[RetryQueue] Le traitement de la file d\'attente est déjà en cours');
      return;
    }
    
    this.isProcessing = true;
    this.stats.isProcessing = true;
    this.notifySubscribers();
    
    console.log('[RetryQueue] Démarrage du traitement de la file d\'attente');
    
    try {
      // Trier les opérations par priorité (descendant) et date de création (ascendant)
      const sortedOperations = this.operations
        .filter(op => op.status === OperationStatus.PENDING)
        .sort((a, b) => {
          if (a.priority !== b.priority) {
            return b.priority - a.priority; // Priorité plus élevée en premier
          }
          return a.createdAt - b.createdAt; // FIFO pour même priorité
        });
      
      console.log(`[RetryQueue] ${sortedOperations.length} opérations en attente`);
      
      // Traiter les opérations par lots pour limiter la concurrence
      const processBatch = async (batch: QueuedOperation[]) => {
        await Promise.all(
          batch.map(op => this.processOperation(op.id))
        );
      };
      
      // Traiter les opérations par lots
      for (let i = 0; i < sortedOperations.length; i += MAX_CONCURRENT_OPERATIONS) {
        const batch = sortedOperations.slice(i, i + MAX_CONCURRENT_OPERATIONS);
        await processBatch(batch);
      }
      
      this.stats.lastProcessedAt = Date.now();
    } catch (error) {
      console.error('[RetryQueue] Erreur lors du traitement de la file d\'attente:', error);
      notionErrorService.reportError(error, 'Traitement de la file d\'attente');
    } finally {
      this.isProcessing = false;
      this.stats.isProcessing = false;
      this.notifySubscribers();
    }
    
    console.log('[RetryQueue] Traitement de la file d\'attente terminé');
  }
  
  /**
   * Traiter une opération spécifique
   */
  public async processOperation(id: string): Promise<boolean> {
    const operation = this.operations.find(op => op.id === id);
    
    if (!operation) {
      console.warn(`[RetryQueue] Opération non trouvée: ${id}`);
      return false;
    }
    
    if (operation.status !== OperationStatus.PENDING) {
      console.log(`[RetryQueue] L'opération ${operation.name} (${id}) n'est pas en attente (${operation.status})`);
      return false;
    }
    
    // Marquer l'opération comme en cours de traitement
    operation.status = OperationStatus.PROCESSING;
    operation.updatedAt = Date.now();
    this.notifySubscribers();
    
    console.log(`[RetryQueue] Traitement de l'opération: ${operation.name} (${id})`);
    
    try {
      // Exécuter l'opération
      const result = await operation.operation();
      
      // Marquer l'opération comme réussie
      operation.status = OperationStatus.SUCCESS;
      operation.updatedAt = Date.now();
      this.stats.pendingOperations--;
      this.stats.completedOperations++;
      this.stats.successful++;
      
      console.log(`[RetryQueue] Opération réussie: ${operation.name} (${id})`);
      
      return true;
    } catch (error) {
      // Incrémenter le nombre de tentatives
      operation.retries++;
      operation.lastError = error instanceof Error ? error : new Error(String(error));
      operation.updatedAt = Date.now();
      
      console.warn(`[RetryQueue] Échec de l'opération ${operation.name} (${id}): ${error instanceof Error ? error.message : error}`);
      
      // Vérifier si on a atteint le nombre maximum de tentatives
      if (operation.retries >= operation.maxRetries) {
        operation.status = OperationStatus.FAILED;
        this.stats.pendingOperations--;
        this.stats.failedOperations++;
        this.stats.failed++;
        
        console.error(`[RetryQueue] Abandon de l'opération après ${operation.retries} tentatives: ${operation.name} (${id})`);
      } else {
        // Remettre l'opération en attente pour une nouvelle tentative
        operation.status = OperationStatus.PENDING;
        console.log(`[RetryQueue] L'opération sera réessayée (${operation.retries}/${operation.maxRetries}): ${operation.name} (${id})`);
      }
      
      return false;
    } finally {
      this.notifySubscribers();
    }
  }
  
  /**
   * Supprimer une opération de la file d'attente
   */
  public remove(id: string): boolean {
    const index = this.operations.findIndex(op => op.id === id);
    
    if (index === -1) {
      return false;
    }
    
    const operation = this.operations[index];
    
    // Annuler tout timeout en cours
    if (this.retryTimeouts.has(id)) {
      clearTimeout(this.retryTimeouts.get(id));
      this.retryTimeouts.delete(id);
    }
    
    // Mettre à jour les statistiques
    if (operation.status === OperationStatus.PENDING) {
      this.stats.pendingOperations--;
    }
    
    // Supprimer l'opération
    this.operations.splice(index, 1);
    this.notifySubscribers();
    
    console.log(`[RetryQueue] Opération supprimée: ${operation.name} (${id})`);
    
    return true;
  }
  
  /**
   * Vider la file d'attente
   */
  public clearQueue(): void {
    // Annuler tous les timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts.clear();
    
    // Vider la file d'attente
    this.operations = [];
    
    // Réinitialiser les statistiques
    this.stats = {
      totalOperations: 0,
      pendingOperations: 0,
      completedOperations: 0,
      failedOperations: 0,
      successful: 0,
      failed: 0,
      lastProcessedAt: null,
      isProcessing: false
    };
    
    this.notifySubscribers();
    
    console.log('[RetryQueue] File d\'attente vidée');
  }
  
  /**
   * S'abonner aux changements de la file d'attente
   */
  public subscribe(subscriber: QueueSubscriber): () => void {
    this.subscribers.push(subscriber);
    
    // Retourner une fonction pour se désabonner
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== subscriber);
    };
  }
  
  /**
   * Notifier tous les abonnés
   */
  private notifySubscribers(): void {
    const operationsCopy = [...this.operations];
    this.subscribers.forEach(subscriber => {
      try {
        subscriber(operationsCopy);
      } catch (error) {
        console.error('Erreur lors de la notification d\'un abonné:', error);
      }
    });
  }
  
  /**
   * Obtenir les statistiques de la file d'attente
   */
  public getStats(): RetryQueueStats {
    return { ...this.stats };
  }
  
  /**
   * Obtenir toutes les opérations
   */
  public getOperations(): QueuedOperation[] {
    return [...this.operations];
  }
  
  /**
   * Obtenir une opération par son ID
   */
  public getOperation(id: string): QueuedOperation | undefined {
    return this.operations.find(op => op.id === id);
  }
}

// Exporter une instance singleton
export const notionRetryQueue = NotionRetryQueue.getInstance();
