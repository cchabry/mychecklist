
import { v4 as uuidv4 } from 'uuid';
import { 
  QueuedOperation, 
  OperationStatus, 
  RetryStrategy 
} from '../types/unified';

type QueueSubscriber = (operations: QueuedOperation[]) => void;

/**
 * Service de gestion des opérations à réessayer
 */
class RetryQueueService {
  private static instance: RetryQueueService;
  private operations: QueuedOperation[] = [];
  private subscribers: QueueSubscriber[] = [];
  private isProcessing: boolean = false;
  private processingTimeout: NodeJS.Timeout | null = null;
  private lastSync: number = 0;
  
  // Statistiques
  private successCount: number = 0;
  private errorCount: number = 0;
  
  private constructor() {}
  
  /**
   * Obtenir l'instance singleton
   */
  public static getInstance(): RetryQueueService {
    if (!RetryQueueService.instance) {
      RetryQueueService.instance = new RetryQueueService();
    }
    return RetryQueueService.instance;
  }
  
  /**
   * Ajouter une opération à la file d'attente
   */
  public addOperation(
    name: string,
    operation: () => Promise<any>,
    options: {
      description?: string;
      priority?: number;
      tags?: string[];
      maxRetries?: number;
      executeNow?: boolean;
      context?: string | Record<string, any>;
      silent?: boolean;
    } = {}
  ): string {
    const id = uuidv4();
    const newOperation: QueuedOperation = {
      id,
      name,
      operation,
      retries: 0,
      maxRetries: options.maxRetries || 3,
      priority: options.priority || 0,
      tags: options.tags || [],
      status: OperationStatus.PENDING,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      description: options.description,
      context: options.context
    };
    
    this.operations.push(newOperation);
    
    // Trier par priorité
    this.operations.sort((a, b) => b.priority - a.priority);
    
    // Notifier les abonnés
    this.notifySubscribers();
    
    // Si demandé, exécuter immédiatement
    if (options.executeNow) {
      this.processQueue();
    }
    
    return id;
  }
  
  /**
   * Traiter la file d'attente
   */
  public async processQueue(): Promise<boolean> {
    if (this.isProcessing) {
      return false;
    }
    
    this.isProcessing = true;
    this.notifySubscribers();
    
    try {
      // Récupérer les opérations en attente
      const pendingOperations = this.operations.filter(
        op => op.status === OperationStatus.PENDING
      );
      
      if (pendingOperations.length === 0) {
        this.isProcessing = false;
        this.notifySubscribers();
        return true;
      }
      
      // Traiter chaque opération
      for (const operation of pendingOperations) {
        operation.status = OperationStatus.PROCESSING;
        operation.updatedAt = Date.now();
        this.notifySubscribers();
        
        try {
          // Exécuter l'opération
          const result = await operation.operation();
          
          // Marquer comme réussie
          operation.status = OperationStatus.SUCCESS;
          operation.updatedAt = Date.now();
          this.successCount++;
          
        } catch (error) {
          // Gérer l'échec
          operation.retries++;
          operation.lastError = error instanceof Error ? error : new Error(String(error));
          operation.error = operation.lastError; // Pour compatibilité
          
          // Vérifier si on peut réessayer
          if (operation.retries >= operation.maxRetries) {
            operation.status = OperationStatus.FAILED;
            this.errorCount++;
          } else {
            operation.status = OperationStatus.PENDING;
          }
          
          operation.updatedAt = Date.now();
        }
        
        this.notifySubscribers();
      }
      
      return true;
    } finally {
      this.isProcessing = false;
      this.lastSync = Date.now();
      this.notifySubscribers();
    }
  }
  
  /**
   * Relancer une opération spécifique
   */
  public retryOperation(operationId: string): boolean {
    const operation = this.operations.find(op => op.id === operationId);
    
    if (!operation) {
      return false;
    }
    
    // Réinitialiser le compteur de tentatives
    operation.retries = 0;
    operation.status = OperationStatus.PENDING;
    operation.updatedAt = Date.now();
    
    this.notifySubscribers();
    
    // Lancer le traitement
    this.processQueue();
    
    return true;
  }
  
  /**
   * Vider la file d'attente
   */
  public clearQueue(): void {
    this.operations = [];
    this.notifySubscribers();
  }
  
  /**
   * Supprimer les opérations terminées
   */
  public clearCompletedOperations(): void {
    this.operations = this.operations.filter(
      op => op.status !== OperationStatus.SUCCESS && 
            op.status !== OperationStatus.CANCELLED
    );
    this.notifySubscribers();
  }
  
  /**
   * Obtenir les statistiques
   */
  public getStats() {
    const pendingCount = this.operations.filter(
      op => op.status === OperationStatus.PENDING
    ).length;
    
    const completedCount = this.operations.filter(
      op => op.status === OperationStatus.SUCCESS || 
            op.status === OperationStatus.FAILED || 
            op.status === OperationStatus.CANCELLED
    ).length;
    
    return {
      totalOperations: this.operations.length,
      pendingOperations: pendingCount,
      completedOperations: completedCount,
      successCount: this.successCount,
      errorCount: this.errorCount,
      failedOperations: this.operations.filter(op => op.status === OperationStatus.FAILED).length,
      lastProcessedAt: this.lastSync,
      isProcessing: this.isProcessing
    };
  }
  
  /**
   * S'abonner aux changements
   */
  public subscribe(callback: QueueSubscriber): () => void {
    this.subscribers.push(callback);
    
    // Retourner la fonction de désabonnement
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== callback);
    };
  }
  
  /**
   * Notifier les abonnés
   */
  private notifySubscribers(): void {
    const operationsCopy = [...this.operations];
    this.subscribers.forEach(subscriber => {
      try {
        subscriber(operationsCopy);
      } catch (e) {
        console.error('Erreur lors de la notification d\'un abonné:', e);
      }
    });
  }
  
  /**
   * Obtenir toutes les opérations
   */
  public getOperations(): QueuedOperation[] {
    return [...this.operations];
  }
}

// Exporter une instance singleton
export const notionRetryQueue = RetryQueueService.getInstance();

// Hook pour utiliser la file d'attente de réessais
export function useRetryQueue() {
  const [operations, setOperations] = useState<QueuedOperation[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Statistiques
  const pendingCount = operations.filter(op => op.status === OperationStatus.PENDING).length;
  const successCount = operations.filter(op => op.status === OperationStatus.SUCCESS).length;
  const errorCount = operations.filter(op => op.status === OperationStatus.FAILED).length;
  
  useEffect(() => {
    // S'abonner aux changements
    const unsubscribe = notionRetryQueue.subscribe((updatedOperations) => {
      setOperations(updatedOperations);
      setIsProcessing(notionRetryQueue.getStats().isProcessing);
    });
    
    // Charger l'état initial
    setOperations(notionRetryQueue.getOperations());
    setIsProcessing(notionRetryQueue.getStats().isProcessing);
    
    return unsubscribe;
  }, []);
  
  // Pour simplifier, nous réexportons directement les méthodes
  return {
    operations,
    pendingCount,
    successCount,
    errorCount,
    isProcessing,
    addOperation: notionRetryQueue.addOperation.bind(notionRetryQueue),
    processQueue: notionRetryQueue.processQueue.bind(notionRetryQueue),
    clearQueue: notionRetryQueue.clearQueue.bind(notionRetryQueue),
    clearCompletedOperations: notionRetryQueue.clearCompletedOperations.bind(notionRetryQueue),
    retryOperation: notionRetryQueue.retryOperation.bind(notionRetryQueue),
    getStats: notionRetryQueue.getStats.bind(notionRetryQueue),
    lastSync: notionRetryQueue.getStats().lastProcessedAt
  };
}
