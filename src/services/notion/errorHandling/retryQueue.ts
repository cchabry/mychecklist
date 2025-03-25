
/**
 * Service de file d'attente pour réessayer les opérations Notion
 */
import { v4 as uuidv4 } from 'uuid';
import { 
  QueuedOperation, 
  OperationStatus,
  RetryQueueStats
} from '../types/unified';

type QueueSubscriber = (operations: QueuedOperation[]) => void;

class NotionRetryQueueService {
  private operations: QueuedOperation[] = [];
  private subscribers: QueueSubscriber[] = [];
  private isProcessing: boolean = false;
  private processingTimeout: NodeJS.Timeout | null = null;
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

  /**
   * Ajoute une opération à la file d'attente
   */
  public enqueue(
    name: string,
    operation: () => Promise<any>,
    options: {
      description?: string;
      maxRetries?: number;
      priority?: number;
      tags?: string[];
    } = {}
  ): string {
    const id = uuidv4();
    
    const queuedOperation: QueuedOperation = {
      id,
      name,
      operation,
      retries: 0,
      maxRetries: options.maxRetries ?? 3,
      priority: options.priority ?? 0,
      tags: options.tags ?? [],
      status: OperationStatus.PENDING,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      description: options.description
    };
    
    // Ajouter l'opération à la file d'attente
    this.operations.push(queuedOperation);
    
    // Trier la file d'attente par priorité (plus élevée d'abord)
    this.operations.sort((a, b) => b.priority - a.priority);
    
    // Mettre à jour les statistiques
    this.updateStats();
    
    // Notifier les abonnés
    this.notifySubscribers();
    
    return id;
  }

  /**
   * Traite toutes les opérations en attente
   */
  public async processQueue(): Promise<void> {
    if (this.isProcessing) {
      console.log('File d\'attente déjà en cours de traitement...');
      return;
    }
    
    this.isProcessing = true;
    this.stats.isProcessing = true;
    this.notifySubscribers();
    
    try {
      // Récupérer les opérations en attente
      const pendingOperations = this.operations.filter(
        op => op.status === OperationStatus.PENDING
      );
      
      console.log(`Traitement de ${pendingOperations.length} opération(s) en attente...`);
      
      for (const operation of pendingOperations) {
        // Marquer l'opération en cours de traitement
        operation.status = OperationStatus.PROCESSING;
        operation.updatedAt = Date.now();
        this.notifySubscribers();
        
        try {
          // Exécuter l'opération
          await operation.operation();
          
          // Marquer l'opération comme réussie
          operation.status = OperationStatus.SUCCESS;
          this.stats.successful++;
          
          console.log(`Opération ${operation.name} (${operation.id}) réussie.`);
        } catch (error) {
          console.error(`Erreur lors de l'opération ${operation.name} (${operation.id}):`, error);
          
          // Stocker l'erreur
          operation.lastError = error instanceof Error ? error : new Error(String(error));
          
          // Incrémenter le compteur d'essais
          operation.retries++;
          
          // Vérifier si on a atteint le nombre max de tentatives
          if (operation.retries >= operation.maxRetries) {
            operation.status = OperationStatus.FAILED;
            this.stats.failed++;
            console.warn(`Nombre maximum de tentatives atteint pour l'opération ${operation.name} (${operation.id}).`);
          } else {
            // Remettre dans la file d'attente pour une nouvelle tentative
            operation.status = OperationStatus.PENDING;
            console.log(`Réessai de l'opération ${operation.name} (${operation.id}) plus tard. Tentative ${operation.retries}/${operation.maxRetries}.`);
          }
        }
        
        // Mettre à jour la date de modification
        operation.updatedAt = Date.now();
        
        // Mettre à jour les statistiques et notifier les abonnés après chaque opération
        this.updateStats();
        this.notifySubscribers();
      }
      
      this.stats.lastProcessedAt = Date.now();
      console.log('Traitement de la file d\'attente terminé.');
    } finally {
      this.isProcessing = false;
      this.stats.isProcessing = false;
      this.updateStats();
      this.notifySubscribers();
    }
  }

  /**
   * Supprime une opération de la file d'attente
   */
  public remove(id: string): boolean {
    const initialLength = this.operations.length;
    this.operations = this.operations.filter(op => op.id !== id);
    
    const removed = initialLength > this.operations.length;
    
    if (removed) {
      this.updateStats();
      this.notifySubscribers();
    }
    
    return removed;
  }

  /**
   * Vide la file d'attente
   */
  public clearQueue(): void {
    this.operations = [];
    this.updateStats();
    this.notifySubscribers();
  }

  /**
   * Récupère toutes les opérations
   */
  public getOperations(): QueuedOperation[] {
    return [...this.operations];
  }

  /**
   * Récupère les statistiques de la file d'attente
   */
  public getStats(): RetryQueueStats {
    return { ...this.stats };
  }

  /**
   * Met à jour les statistiques de la file d'attente
   */
  private updateStats(): void {
    const pendingOperations = this.operations.filter(op => op.status === OperationStatus.PENDING).length;
    const completedOperations = this.operations.filter(op => op.status === OperationStatus.SUCCESS).length;
    const failedOperations = this.operations.filter(op => op.status === OperationStatus.FAILED).length;
    
    this.stats = {
      ...this.stats,
      totalOperations: this.operations.length,
      pendingOperations,
      completedOperations,
      failedOperations,
      isProcessing: this.isProcessing
    };
  }

  /**
   * S'abonne aux mises à jour de la file d'attente
   */
  public subscribe(callback: QueueSubscriber): () => void {
    this.subscribers.push(callback);
    
    // Retourner une fonction pour se désabonner
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index !== -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Notifie tous les abonnés
   */
  private notifySubscribers(): void {
    const operations = this.getOperations();
    for (const subscriber of this.subscribers) {
      try {
        subscriber(operations);
      } catch (e) {
        console.error('Erreur lors de la notification d\'un abonné à la file d\'attente:', e);
      }
    }
  }
}

// Exporter une instance unique du service
export const notionRetryQueue = new NotionRetryQueueService();
