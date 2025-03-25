
/**
 * Service de file d'attente pour les opérations à réessayer
 */

import { v4 as uuidv4 } from 'uuid';
import { notionErrorService } from './errorService';
import { NotionErrorType } from '../types/unified';

/**
 * État d'une opération dans la file d'attente
 */
export enum OperationStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed'
}

/**
 * Structure d'une opération dans la file d'attente
 */
export interface QueuedOperation {
  id: string;
  name: string;
  description?: string;
  operation: () => Promise<any>;
  status: OperationStatus;
  createdAt: number;
  lastAttempt?: number;
  error?: Error;
  result?: any;
  maxRetries?: number;
  retryCount: number;
  tags?: string[];
  priority: number;
}

// Stockage des opérations en file d'attente
let operationsQueue: QueuedOperation[] = [];

// Callbacks
type QueueChangeCallback = (operations: QueuedOperation[]) => void;
const subscribers: Array<{ id: string; callback: QueueChangeCallback }> = [];

// État du processeur de file d'attente
let isProcessing = false;

/**
 * Service de gestion de file d'attente pour les réessais
 */
export const notionRetryQueue = {
  /**
   * Ajoute une opération à la file d'attente
   */
  enqueue(
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
      description: options.description,
      operation,
      status: OperationStatus.PENDING,
      createdAt: Date.now(),
      maxRetries: options.maxRetries || 3,
      retryCount: 0,
      priority: options.priority || 0,
      tags: options.tags || []
    };
    
    // Ajouter à la file d'attente
    operationsQueue.push(queuedOperation);
    
    // Trier par priorité
    operationsQueue.sort((a, b) => b.priority - a.priority);
    
    // Notifier les abonnés
    this.notifySubscribers();
    
    return id;
  },
  
  /**
   * Supprime une opération de la file d'attente
   */
  remove(id: string): void {
    const index = operationsQueue.findIndex(op => op.id === id);
    
    if (index !== -1) {
      operationsQueue.splice(index, 1);
      this.notifySubscribers();
    }
  },
  
  /**
   * Vide la file d'attente
   */
  clearQueue(): void {
    if (operationsQueue.length === 0) return;
    
    operationsQueue = operationsQueue.filter(op => op.status === OperationStatus.RUNNING);
    this.notifySubscribers();
  },
  
  /**
   * Lance le traitement de la file d'attente
   */
  async processQueue(): Promise<void> {
    if (isProcessing || operationsQueue.length === 0) return;
    
    isProcessing = true;
    this.notifySubscribers();
    
    try {
      // Traiter chaque opération en attente
      const pendingOperations = operationsQueue
        .filter(op => op.status === OperationStatus.PENDING);
      
      for (const operation of pendingOperations) {
        // Éviter de traiter les opérations déjà en cours
        if (operation.status !== OperationStatus.PENDING) continue;
        
        // Mettre à jour le statut
        operation.status = OperationStatus.RUNNING;
        operation.lastAttempt = Date.now();
        this.notifySubscribers();
        
        try {
          // Exécuter l'opération
          const result = await operation.operation();
          
          // Mettre à jour avec le succès
          operation.status = OperationStatus.SUCCESS;
          operation.result = result;
        } catch (error) {
          console.error(`Échec de l'opération ${operation.name}:`, error);
          
          // Signaler l'erreur
          operation.error = error instanceof Error ? error : new Error(String(error));
          
          // Incrémenter le compteur de réessais
          operation.retryCount++;
          
          // Vérifier si on peut encore réessayer
          if (operation.retryCount <= (operation.maxRetries || 3)) {
            operation.status = OperationStatus.PENDING;
          } else {
            operation.status = OperationStatus.FAILED;
            
            // Signaler l'erreur au service d'erreurs
            notionErrorService.reportError(
              operation.error,
              `Échec définitif de l'opération: ${operation.name}`,
              {
                type: NotionErrorType.API,
                details: {
                  operation: operation.name,
                  retries: operation.retryCount,
                  maxRetries: operation.maxRetries
                }
              }
            );
          }
        }
        
        // Notifier les abonnés de chaque changement
        this.notifySubscribers();
      }
    } finally {
      isProcessing = false;
      this.notifySubscribers();
    }
  },
  
  /**
   * S'abonne aux changements de la file d'attente
   */
  subscribe(callback: QueueChangeCallback): () => void {
    const id = uuidv4();
    subscribers.push({ id, callback });
    
    // Notification initiale
    callback([...operationsQueue]);
    
    // Retourner une fonction pour se désabonner
    return () => {
      const index = subscribers.findIndex(sub => sub.id === id);
      if (index !== -1) {
        subscribers.splice(index, 1);
      }
    };
  },
  
  /**
   * Notifie tous les abonnés des changements
   */
  notifySubscribers(): void {
    const operations = [...operationsQueue];
    subscribers.forEach(sub => {
      try {
        sub.callback(operations);
      } catch (e) {
        console.error('Erreur lors de la notification d\'un abonné de la file d\'attente:', e);
      }
    });
  },
  
  /**
   * Récupère l'état actuel de la file d'attente
   */
  getQueue(): QueuedOperation[] {
    return [...operationsQueue];
  },
  
  /**
   * Récupère les statistiques de la file d'attente
   */
  getStats() {
    const pendingCount = operationsQueue.filter(op => op.status === OperationStatus.PENDING).length;
    const runningCount = operationsQueue.filter(op => op.status === OperationStatus.RUNNING).length;
    const successCount = operationsQueue.filter(op => op.status === OperationStatus.SUCCESS).length;
    const failedCount = operationsQueue.filter(op => op.status === OperationStatus.FAILED).length;
    
    return {
      total: operationsQueue.length,
      pending: pendingCount,
      running: runningCount,
      success: successCount,
      failed: failedCount,
      processing: isProcessing
    };
  },
  
  /**
   * Vérifie si le processeur est actif
   */
  isProcessing(): boolean {
    return isProcessing;
  }
};

export default notionRetryQueue;
