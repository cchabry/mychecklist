
/**
 * Service de file d'attente pour réessayer les opérations ayant échoué
 */

import { v4 as uuidv4 } from 'uuid';
import { RetryOperationOptions, RetryQueueStats } from './types';
import { notionErrorUtils } from './utils';

/**
 * Type d'une opération en attente dans la queue
 */
interface PendingOperation<T = any> {
  id: string;                 // Identifiant unique
  operation: () => Promise<T>; // Fonction à exécuter
  context: Record<string, any>; // Contexte de l'opération
  options: RetryOperationOptions; // Options de réessai
  attempts: number;           // Nombre de tentatives déjà effectuées
  nextRetry: number;          // Timestamp pour la prochaine tentative
  createdAt: number;          // Création de l'opération
  lastAttempt: number | null; // Dernière tentative
  error: Error | null;        // Dernière erreur survenue
}

/**
 * File d'attente pour réessayer les opérations
 */
class NotionRetryQueue {
  private queue: PendingOperation[] = [];
  private processing: boolean = false;
  private stats: RetryQueueStats = {
    totalOperations: 0,
    pendingOperations: 0,
    completedOperations: 0,
    failedOperations: 0,
    lastProcessedAt: null,
    isProcessing: false
  };
  private timer: NodeJS.Timeout | null = null;
  private processingInterval: number = 10000; // 10 secondes par défaut
  
  constructor() {
    // Démarrer le timer de traitement
    this.startProcessingTimer();
  }
  
  /**
   * Ajoute une opération à la file d'attente de réessai
   */
  enqueue<T>(
    operation: () => Promise<T>,
    context: string | Record<string, any> = {},
    options: RetryOperationOptions = {}
  ): string {
    // Normaliser le contexte
    const contextObj = typeof context === 'string' 
      ? { operation: context } 
      : context;
    
    // Valeurs par défaut pour les options
    const defaultOptions: RetryOperationOptions = {
      maxRetries: 3,
      retryDelay: 2000, // 2 secondes
      backoff: true,
      ...options
    };
    
    // Créer l'ID unique de l'opération
    const operationId = uuidv4();
    
    // Ajouter à la file d'attente
    const pendingOperation: PendingOperation<T> = {
      id: operationId,
      operation,
      context: contextObj,
      options: defaultOptions,
      attempts: 0,
      nextRetry: Date.now(), // Prêt à être exécuté immédiatement
      createdAt: Date.now(),
      lastAttempt: null,
      error: null
    };
    
    this.queue.push(pendingOperation);
    
    // Mettre à jour les statistiques
    this.stats.pendingOperations = this.queue.length;
    this.stats.totalOperations++;
    
    console.log(`[RetryQueue] Opération ajoutée à la file d'attente: ${operationId}`, contextObj);
    
    // Déclencher le traitement immédiat si demandé
    this.processQueue();
    
    return operationId;
  }
  
  /**
   * Annule une opération en attente
   */
  cancel(operationId: string): boolean {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(op => op.id !== operationId);
    
    // Mettre à jour les statistiques si nécessaire
    if (this.queue.length !== initialLength) {
      this.stats.pendingOperations = this.queue.length;
      return true;
    }
    
    return false;
  }
  
  /**
   * Force le traitement immédiat des opérations en attente
   */
  async processNow(): Promise<void> {
    if (this.processing) {
      console.log('[RetryQueue] Traitement déjà en cours, ignoré.');
      return;
    }
    
    this.processQueue();
  }
  
  /**
   * Obtient l'état de la file d'attente
   */
  getStats(): RetryQueueStats {
    return {
      ...this.stats,
      pendingOperations: this.queue.length
    };
  }
  
  /**
   * Processe la file d'attente
   */
  private async processQueue(): Promise<void> {
    if (this.processing) {
      return;
    }
    
    this.processing = true;
    this.stats.isProcessing = true;
    
    try {
      const now = Date.now();
      const operationsToProcess = this.queue.filter(op => op.nextRetry <= now);
      
      if (operationsToProcess.length === 0) {
        console.log('[RetryQueue] Aucune opération à traiter pour le moment.');
        return;
      }
      
      console.log(`[RetryQueue] Traitement de ${operationsToProcess.length} opération(s)...`);
      
      // Traiter les opérations éligibles
      for (const operation of operationsToProcess) {
        await this.processOperation(operation);
      }
      
      // Mettre à jour les statistiques
      this.stats.lastProcessedAt = Date.now();
      this.stats.pendingOperations = this.queue.length;
      
    } catch (error) {
      console.error('[RetryQueue] Erreur lors du traitement de la file d\'attente:', error);
    } finally {
      this.processing = false;
      this.stats.isProcessing = false;
    }
  }
  
  /**
   * Processe une opération individuelle
   */
  private async processOperation(operation: PendingOperation): Promise<void> {
    // Incrémenter le compteur de tentatives
    operation.attempts++;
    operation.lastAttempt = Date.now();
    
    const { maxRetries = 3 } = operation.options;
    
    try {
      // Tenter d'exécuter l'opération
      const result = await operation.operation();
      
      // Succès: retirer de la file d'attente
      this.queue = this.queue.filter(op => op.id !== operation.id);
      this.stats.completedOperations++;
      
      console.log(`[RetryQueue] Opération réussie après ${operation.attempts} tentative(s): ${operation.id}`);
      
      // Appeler le callback de succès s'il existe
      if (operation.options.onSuccess) {
        operation.options.onSuccess(result);
      }
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      operation.error = err;
      
      // Déterminer si on doit réessayer
      const skipRetry = operation.options.skipRetryIf && operation.options.skipRetryIf(err);
      const canRetry = !skipRetry && 
                       operation.attempts < maxRetries && 
                       notionErrorUtils.isRetryableError(err);
      
      if (canRetry) {
        // Calculer le prochain délai
        const delay = notionErrorUtils.calculateRetryDelay(
          operation.attempts,
          operation.options.retryDelay,
          operation.options.backoff
        );
        
        // Programmer la prochaine tentative
        operation.nextRetry = Date.now() + delay;
        
        console.log(
          `[RetryQueue] Échec de l'opération ${operation.id}, nouvelle tentative dans ${Math.round(delay/1000)}s ` +
          `(${operation.attempts}/${maxRetries}): ${err.message}`
        );
        
      } else {
        // Échec définitif: retirer de la file d'attente
        this.queue = this.queue.filter(op => op.id !== operation.id);
        this.stats.failedOperations++;
        
        console.error(
          `[RetryQueue] Échec définitif de l'opération ${operation.id} après ${operation.attempts} tentative(s): ${err.message}`, 
          operation.context
        );
        
        // Appeler le callback d'échec s'il existe
        if (operation.options.onFailure) {
          operation.options.onFailure(err);
        }
      }
    }
  }
  
  /**
   * Démarre le timer de traitement périodique
   */
  private startProcessingTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    
    this.timer = setInterval(() => {
      this.processQueue();
    }, this.processingInterval);
    
    console.log(`[RetryQueue] Timer de traitement démarré (intervalle: ${this.processingInterval / 1000}s)`);
  }
  
  /**
   * Arrête le timer de traitement
   */
  stopProcessingTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('[RetryQueue] Timer de traitement arrêté');
    }
  }
  
  /**
   * Configure l'intervalle de traitement
   */
  setProcessingInterval(interval: number): void {
    if (interval < 1000) {
      console.warn('[RetryQueue] Intervalle trop court, minimum 1000ms');
      interval = 1000;
    }
    
    this.processingInterval = interval;
    
    // Redémarrer le timer avec le nouvel intervalle
    this.startProcessingTimer();
  }
}

// Créer et exporter une instance unique
export const notionRetryQueue = new NotionRetryQueue();
