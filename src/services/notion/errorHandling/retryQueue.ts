
import { v4 as uuidv4 } from 'uuid';
import { structuredLogger } from '../logging/structuredLogger';
import { RetryOperationOptions, RetryQueueStats } from '../types/unified';

interface QueuedOperation {
  id: string;
  operation: Function;
  args: any[];
  options: RetryOperationOptions;
  retryCount: number;
  lastAttempt: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: Error;
  result?: any;
}

/**
 * Service de file d'attente pour les opérations à réessayer
 */
class RetryQueueService {
  private static instance: RetryQueueService;
  private queue: QueuedOperation[] = [];
  private isProcessing: boolean = false;
  private processingTimer: number | null = null;
  private completedOperations: number = 0;
  private failedOperations: number = 0;
  private lastProcessedAt: number | null = null;
  private maxConcurrent: number = 3;

  private constructor() {}

  /**
   * Obtenir l'instance unique du service
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
  public enqueue<T>(
    operation: (...args: any[]) => Promise<T>,
    args: any[] = [],
    options: RetryOperationOptions = {}
  ): string {
    const id = uuidv4();
    const operationOptions: RetryOperationOptions = {
      maxRetries: options.maxRetries ?? 3,
      retryDelay: options.retryDelay ?? 1000,
      maxDelay: options.maxDelay ?? 10000,
      skipRetryIf: options.skipRetryIf,
      onSuccess: options.onSuccess,
      onFailure: options.onFailure,
      retryableStatusCodes: options.retryableStatusCodes ?? [408, 429, 500, 502, 503, 504],
      backoff: options.backoff ?? 1.5 // Facteur de backoff exponentiel
    };

    const queuedOperation: QueuedOperation = {
      id,
      operation,
      args,
      options: operationOptions,
      retryCount: 0,
      lastAttempt: 0,
      status: 'pending'
    };

    this.queue.push(queuedOperation);

    structuredLogger.debug(
      `Opération ajoutée à la file d'attente de réessai (${id})`,
      { operationName: operation.name, args, options: operationOptions },
      { source: 'RetryQueue' }
    );

    // Démarrer le traitement automatiquement si ce n'est pas déjà fait
    if (!this.isProcessing && this.queue.length > 0) {
      this.processQueue();
    }

    return id;
  }

  /**
   * Traiter la file d'attente
   */
  public async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      // Filtrer les opérations en attente
      const pendingOperations = this.queue.filter(op => op.status === 'pending');

      if (pendingOperations.length === 0) {
        structuredLogger.debug(
          'Aucune opération en attente dans la file de réessai',
          null,
          { source: 'RetryQueue' }
        );
        this.isProcessing = false;
        return;
      }

      structuredLogger.info(
        `Traitement de ${pendingOperations.length} opérations en attente dans la file de réessai`,
        null,
        { source: 'RetryQueue' }
      );

      // Limiter le nombre d'opérations concurrentes
      const operationsToProcess = pendingOperations.slice(0, this.maxConcurrent);

      // Marquer les opérations comme étant en cours de traitement
      operationsToProcess.forEach(op => {
        op.status = 'processing';
        op.retryCount++;
        op.lastAttempt = Date.now();
      });

      // Exécuter les opérations en parallèle
      await Promise.all(
        operationsToProcess.map(async (op) => {
          try {
            const result = await op.operation(...op.args);
            this.handleSuccess(op, result);
          } catch (error) {
            const shouldRetry = this.shouldRetryOperation(op, error);

            if (shouldRetry) {
              // Planifier une nouvelle tentative avec backoff exponentiel
              const delay = this.calculateRetryDelay(op);
              op.status = 'pending';
              
              structuredLogger.debug(
                `Planification d'une nouvelle tentative pour l'opération ${op.id} dans ${delay}ms (tentative ${op.retryCount})`,
                { error },
                { source: 'RetryQueue' }
              );
            } else {
              this.handleFailure(op, error);
            }
          }
        })
      );

      this.lastProcessedAt = Date.now();

      // Vérifier s'il reste des opérations à traiter
      const remainingOperations = this.queue.filter(op => op.status === 'pending');
      if (remainingOperations.length > 0) {
        // Attendre un court délai avant de traiter les opérations restantes
        this.processingTimer = window.setTimeout(() => {
          this.processQueue();
        }, 500);
      } else {
        this.isProcessing = false;
      }
    } catch (error) {
      structuredLogger.error(
        'Erreur lors du traitement de la file de réessai',
        error instanceof Error ? error : new Error(String(error)),
        { source: 'RetryQueue' }
      );
      this.isProcessing = false;
    }
  }

  /**
   * Obtenir les statistiques de la file d'attente
   */
  public getStats(): RetryQueueStats {
    return {
      totalOperations: this.queue.length + this.completedOperations + this.failedOperations,
      pendingOperations: this.queue.filter(op => op.status === 'pending').length,
      completedOperations: this.completedOperations,
      failedOperations: this.failedOperations,
      lastProcessedAt: this.lastProcessedAt,
      isProcessing: this.isProcessing
    };
  }

  /**
   * Nettoyer la file d'attente
   */
  public clearQueue(): void {
    this.queue = [];
    if (this.processingTimer !== null) {
      clearTimeout(this.processingTimer);
      this.processingTimer = null;
    }
    this.isProcessing = false;
    
    structuredLogger.info(
      'File de réessai nettoyée',
      null,
      { source: 'RetryQueue' }
    );
  }

  /**
   * Vérifier si une opération doit être réessayée
   */
  private shouldRetryOperation(operation: QueuedOperation, error: any): boolean {
    // Ne pas réessayer si le nombre maximum de tentatives est atteint
    if (operation.retryCount >= (operation.options.maxRetries || 3)) {
      return false;
    }

    // Vérifier si l'erreur indique qu'il ne faut pas réessayer
    if (operation.options.skipRetryIf && operation.options.skipRetryIf(error)) {
      return false;
    }

    // Vérifier les codes de statut HTTP récupérables
    if (error && error.status && operation.options.retryableStatusCodes) {
      return operation.options.retryableStatusCodes.includes(error.status);
    }

    // Par défaut, réessayer pour les erreurs réseau
    return true;
  }

  /**
   * Calculer le délai avant une nouvelle tentative
   */
  private calculateRetryDelay(operation: QueuedOperation): number {
    const baseDelay = operation.options.retryDelay || 1000;
    const maxDelay = operation.options.maxDelay || 10000;
    const backoff = operation.options.backoff || 1.5;
    
    // Appliquer un backoff exponentiel avec un peu de jitter
    const exponentialDelay = baseDelay * Math.pow(Number(backoff), operation.retryCount - 1);
    const jitter = Math.random() * 0.3 + 0.85; // 0.85-1.15
    
    return Math.min(exponentialDelay * jitter, maxDelay);
  }

  /**
   * Gérer le succès d'une opération
   */
  private handleSuccess(operation: QueuedOperation, result: any): void {
    operation.status = 'completed';
    operation.result = result;
    
    // Retirer l'opération de la file d'attente
    this.removeOperation(operation.id);
    this.completedOperations++;
    
    structuredLogger.debug(
      `Opération ${operation.id} réussie après ${operation.retryCount} tentatives`,
      { result },
      { source: 'RetryQueue' }
    );
    
    // Appeler le callback de succès si défini
    if (operation.options.onSuccess) {
      try {
        operation.options.onSuccess(result);
      } catch (error) {
        structuredLogger.error(
          `Erreur dans le callback onSuccess pour l'opération ${operation.id}`,
          error instanceof Error ? error : new Error(String(error)),
          { source: 'RetryQueue' }
        );
      }
    }
  }

  /**
   * Gérer l'échec d'une opération
   */
  private handleFailure(operation: QueuedOperation, error: any): void {
    operation.status = 'failed';
    operation.error = error instanceof Error ? error : new Error(String(error));
    
    // Retirer l'opération de la file d'attente
    this.removeOperation(operation.id);
    this.failedOperations++;
    
    structuredLogger.warn(
      `Opération ${operation.id} échouée après ${operation.retryCount} tentatives`,
      { error },
      { source: 'RetryQueue' }
    );
    
    // Appeler le callback d'échec si défini
    if (operation.options.onFailure) {
      try {
        operation.options.onFailure(operation.error);
      } catch (callbackError) {
        structuredLogger.error(
          `Erreur dans le callback onFailure pour l'opération ${operation.id}`,
          callbackError instanceof Error ? callbackError : new Error(String(callbackError)),
          { source: 'RetryQueue' }
        );
      }
    }
  }

  /**
   * Retirer une opération de la file d'attente
   */
  private removeOperation(id: string): void {
    this.queue = this.queue.filter(op => op.id !== id);
  }
}

// Exporter une instance singleton
export const notionRetryQueue = RetryQueueService.getInstance();
