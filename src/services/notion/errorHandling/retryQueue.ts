
import { NotionError, NotionErrorSeverity, NotionErrorType } from './types';
import { notionErrorUtils } from './utils';

interface RetryableOperation {
  id: string;
  operation: () => Promise<any>;
  maxRetries: number;
  retryCount: number;
  lastError?: NotionError;
  context?: Record<string, any>;
  backoffMs: number;
  createdAt: Date;
  nextRetryAt?: Date;
  onSuccess?: (result: any) => void;
  onFailure?: (error: NotionError) => void;
}

/**
 * Service de file d'attente pour les opérations Notion en échec
 * Permet de réessayer les opérations avec un backoff exponentiel
 */
class NotionRetryQueueService {
  private operations: Map<string, RetryableOperation> = new Map();
  private isProcessing: boolean = false;
  private processingInterval: number | null = null;
  private defaultMaxRetries: number = 3;
  private initialBackoffMs: number = 2000; // 2 secondes
  
  constructor() {
    // Démarrer le traitement automatique
    this.startProcessing();
  }
  
  /**
   * Ajoute une opération à la file d'attente
   */
  public enqueue<T>(
    operation: () => Promise<T>,
    context: Record<string, any> = {},
    options: {
      id?: string;
      maxRetries?: number;
      onSuccess?: (result: T) => void;
      onFailure?: (error: NotionError) => void;
    } = {}
  ): string {
    // Générer un ID unique si non fourni
    const id = options.id || `op_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Créer l'opération retryable
    const retryableOp: RetryableOperation = {
      id,
      operation,
      maxRetries: options.maxRetries || this.defaultMaxRetries,
      retryCount: 0,
      context,
      backoffMs: this.initialBackoffMs,
      createdAt: new Date(),
      onSuccess: options.onSuccess,
      onFailure: options.onFailure
    };
    
    // Ajouter à la file d'attente
    this.operations.set(id, retryableOp);
    
    console.log(`[RetryQueue] Opération ajoutée à la file d'attente (ID: ${id})`);
    
    // Démarrer le traitement si ce n'est pas déjà fait
    this.startProcessing();
    
    return id;
  }
  
  /**
   * Annule une opération en attente
   */
  public cancel(id: string): boolean {
    const wasRemoved = this.operations.delete(id);
    
    if (wasRemoved) {
      console.log(`[RetryQueue] Opération annulée (ID: ${id})`);
    }
    
    return wasRemoved;
  }
  
  /**
   * Démarrer le traitement des opérations
   */
  private startProcessing(): void {
    if (this.processingInterval !== null) return;
    
    this.processingInterval = window.setInterval(() => {
      this.processQueue();
    }, 5000) as unknown as number;
    
    console.log('[RetryQueue] Traitement automatique démarré');
  }
  
  /**
   * Arrêter le traitement des opérations
   */
  public stopProcessing(): void {
    if (this.processingInterval !== null) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('[RetryQueue] Traitement automatique arrêté');
    }
  }
  
  /**
   * Traite les opérations en attente
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.operations.size === 0) return;
    
    this.isProcessing = true;
    
    try {
      const now = new Date();
      const operationsToProcess: RetryableOperation[] = [];
      
      // Identifier les opérations à traiter
      this.operations.forEach(op => {
        if (!op.nextRetryAt || op.nextRetryAt <= now) {
          operationsToProcess.push(op);
        }
      });
      
      if (operationsToProcess.length === 0) {
        this.isProcessing = false;
        return;
      }
      
      console.log(`[RetryQueue] Traitement de ${operationsToProcess.length} opérations`);
      
      // Traiter chaque opération éligible
      for (const op of operationsToProcess) {
        try {
          // Exécuter l'opération
          const result = await op.operation();
          
          // Succès - supprimer de la file d'attente
          this.operations.delete(op.id);
          console.log(`[RetryQueue] Opération réussie (ID: ${op.id})`);
          
          // Appeler le callback de succès
          if (op.onSuccess) {
            op.onSuccess(result);
          }
        } catch (error) {
          // Échec - incrémenter le compteur et calculer le prochain essai
          op.retryCount++;
          
          // Convertir l'erreur en NotionError
          const notionError = this.convertToNotionError(error);
          op.lastError = notionError;
          
          // Vérifier si on a atteint le nombre maximal d'essais
          if (op.retryCount >= op.maxRetries) {
            // Abandonner cette opération
            this.operations.delete(op.id);
            console.warn(`[RetryQueue] Abandon après ${op.retryCount} essais (ID: ${op.id})`);
            
            // Appeler le callback d'échec
            if (op.onFailure) {
              op.onFailure(notionError);
            }
          } else {
            // Calculer le backoff exponentiel
            op.backoffMs = op.backoffMs * 2;
            op.nextRetryAt = new Date(Date.now() + op.backoffMs);
            
            console.log(`[RetryQueue] Échec, nouvelle tentative dans ${op.backoffMs}ms (ID: ${op.id}, essai: ${op.retryCount}/${op.maxRetries})`);
            
            // Mettre à jour l'opération dans la file d'attente
            this.operations.set(op.id, op);
          }
        }
      }
    } catch (e) {
      console.error('[RetryQueue] Erreur lors du traitement de la file d\'attente:', e);
    } finally {
      this.isProcessing = false;
    }
  }
  
  /**
   * Force le traitement immédiat des opérations en attente
   */
  public async processNow(): Promise<void> {
    if (this.isProcessing) return;
    
    return this.processQueue();
  }
  
  /**
   * Obtenir les statistiques de la file d'attente
   */
  public getStats() {
    return {
      totalOperations: this.operations.size,
      pendingOperations: [...this.operations.values()].filter(op => !op.nextRetryAt || op.nextRetryAt <= new Date()).length,
      isProcessing: this.isProcessing
    };
  }
  
  /**
   * Convertit une erreur en NotionError
   */
  private convertToNotionError(error: any): NotionError {
    if (error.type && error.severity && error.recoverable !== undefined) {
      return error as NotionError;
    }
    
    // Créer une nouvelle NotionError à l'aide de notionErrorUtils
    const message = error.message || 'Erreur inconnue';
    return notionErrorUtils.createError(message, {
      cause: error,
      type: notionErrorUtils.determineErrorType(error),
      context: {}
    });
  }
}

// Créer et exporter l'instance du service
export const notionRetryQueue = new NotionRetryQueueService();
