
import { operationMode } from '@/services/operationMode';
import { NotionErrorType } from './types';
import { notionErrorService } from './notionErrorService';

// Type pour une opération en attente
interface PendingOperation<T = any> {
  id: string;
  operation: () => Promise<T>;
  context: string;
  attempts: number;
  maxAttempts: number;
  lastAttempt: Date;
  backoffFactor: number;
  initialDelay: number;
  onSuccess?: (result: T) => void;
  onFailure?: (error: Error) => void;
}

/**
 * Service de file d'attente pour les opérations Notion avec nouvelles tentatives automatiques
 */
export class RetryQueueService {
  private static instance: RetryQueueService;
  private queue: PendingOperation[] = [];
  private isProcessing: boolean = false;
  private processingInterval: number | null = null;
  private maxQueueSize: number = 100;
  private defaultMaxAttempts: number = 3;

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
   * Démarrer le traitement automatique de la file d'attente
   */
  public startProcessing(intervalMs: number = 10000): void {
    if (this.processingInterval !== null) {
      this.stopProcessing();
    }
    
    console.info('[RetryQueue] Traitement automatique démarré');
    
    this.processingInterval = window.setInterval(() => {
      this.processQueue();
    }, intervalMs);
  }

  /**
   * Arrêter le traitement automatique
   */
  public stopProcessing(): void {
    if (this.processingInterval !== null) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      
      console.info('[RetryQueue] Traitement automatique arrêté');
    }
  }

  /**
   * Ajouter une opération à la file d'attente
   */
  public enqueue<T>(
    operation: () => Promise<T>,
    context: string,
    options: {
      maxAttempts?: number;
      backoffFactor?: number;
      initialDelay?: number;
      onSuccess?: (result: T) => void;
      onFailure?: (error: Error) => void;
    } = {}
  ): string {
    // Vérifier si la file d'attente est pleine
    if (this.queue.length >= this.maxQueueSize) {
      console.warn('[RetryQueue] File d\'attente pleine, suppression de l\'opération la plus ancienne');
      this.queue.shift();
    }
    
    const {
      maxAttempts = this.defaultMaxAttempts,
      backoffFactor = 2,
      initialDelay = 5000,
      onSuccess,
      onFailure
    } = options;
    
    const id = `op-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    this.queue.push({
      id,
      operation,
      context,
      attempts: 0,
      maxAttempts,
      lastAttempt: new Date(0), // Date initiale dans le passé
      backoffFactor,
      initialDelay,
      onSuccess,
      onFailure
    });
    
    console.info(`[RetryQueue] Opération ajoutée: ${id}, contexte: ${context}`);
    
    // Déclencher un traitement si aucun n'est en cours
    if (!this.isProcessing) {
      setTimeout(() => this.processQueue(), 0);
    }
    
    return id;
  }

  /**
   * Traiter la file d'attente
   */
  public async processQueue(): Promise<void> {
    // Si déjà en cours de traitement ou file vide, ne rien faire
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      // Traiter chaque opération
      const now = new Date();
      const operationsToProcess = this.queue.filter(op => {
        const timeToWait = op.initialDelay * Math.pow(op.backoffFactor, op.attempts);
        const nextAttemptTime = new Date(op.lastAttempt.getTime() + timeToWait);
        return nextAttemptTime <= now;
      });
      
      if (operationsToProcess.length === 0) {
        return;
      }
      
      console.info(`[RetryQueue] Traitement de ${operationsToProcess.length} opérations`);
      
      // Traiter toutes les opérations éligibles
      for (const op of operationsToProcess) {
        // Si en mode démo, ne pas réessayer les opérations
        if (operationMode.isDemoMode) {
          console.info(`[RetryQueue] Mode démo actif, suppression de l'opération ${op.id}`);
          this.queue = this.queue.filter(o => o.id !== op.id);
          continue;
        }
        
        // Incrémenter le compteur de tentatives
        op.attempts++;
        op.lastAttempt = new Date();
        
        try {
          console.info(`[RetryQueue] Tentative ${op.attempts}/${op.maxAttempts} pour l'opération ${op.id}`);
          
          // Exécuter l'opération
          const result = await op.operation();
          
          // Succès, retirer de la file d'attente
          this.queue = this.queue.filter(o => o.id !== op.id);
          
          console.info(`[RetryQueue] Opération ${op.id} réussie`);
          
          // Appeler le callback de succès
          if (op.onSuccess) {
            op.onSuccess(result);
          }
          
          // Notifier le système operationMode d'une opération réussie
          operationMode.handleSuccessfulOperation();
        } catch (error) {
          console.error(`[RetryQueue] Échec de l'opération ${op.id}:`, error);
          
          // Convertir en erreur Notion enrichie
          const notionError = notionErrorService.reportError(
            error instanceof Error ? error : new Error(String(error)),
            op.context
          );
          
          // Si nombre max de tentatives atteint ou erreur non récupérable, retirer de la file
          if (op.attempts >= op.maxAttempts || 
              notionError.type === NotionErrorType.AUTH || 
              notionError.type === NotionErrorType.PERMISSION) {
            
            console.warn(`[RetryQueue] Abandon de l'opération ${op.id} après ${op.attempts} tentatives`);
            
            this.queue = this.queue.filter(o => o.id !== op.id);
            
            // Appeler le callback d'échec
            if (op.onFailure) {
              op.onFailure(error instanceof Error ? error : new Error(String(error)));
            }
            
            // Notifier le système operationMode d'une erreur de connexion
            operationMode.handleConnectionError(
              error instanceof Error ? error : new Error(String(error)),
              op.context
            );
          }
        }
      }
    } finally {
      this.isProcessing = false;
      
      // Si d'autres opérations sont en attente, programmer un nouveau traitement
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 1000);
      }
    }
  }

  /**
   * Supprimer une opération de la file d'attente
   */
  public cancel(operationId: string): boolean {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(op => op.id !== operationId);
    return this.queue.length < initialLength;
  }

  /**
   * Vider la file d'attente
   */
  public clearQueue(): number {
    const count = this.queue.length;
    this.queue = [];
    return count;
  }

  /**
   * Obtenir toutes les opérations en attente
   */
  public getQueuedOperations(): Array<{
    id: string;
    context: string;
    attempts: number;
    maxAttempts: number;
    lastAttempt: Date;
  }> {
    return this.queue.map(op => ({
      id: op.id,
      context: op.context,
      attempts: op.attempts,
      maxAttempts: op.maxAttempts,
      lastAttempt: op.lastAttempt
    }));
  }

  /**
   * Obtenir les statistiques de la file d'attente
   */
  public getStats(): {
    queueSize: number;
    maxQueueSize: number;
    pendingOperations: number;
    isProcessing: boolean;
  } {
    return {
      queueSize: this.queue.length,
      maxQueueSize: this.maxQueueSize,
      pendingOperations: this.queue.length,
      isProcessing: this.isProcessing
    };
  }
}

// Exporter une instance singleton
export const retryQueueService = RetryQueueService.getInstance();

// Démarrer le traitement automatique
console.info('[RetryQueue] Traitement automatique démarré');
retryQueueService.startProcessing();
