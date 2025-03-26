
/**
 * Service de gestion de la file d'attente des opérations à réessayer
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  RetryOperation, 
  RetryOperationOptions,
  RetryOperationStatus, 
  RetryQueueStats,
  NotionError
} from '../types/errorTypes';
import { notionErrorService } from './notionErrorService';

// File d'attente des opérations
let operations: RetryOperation[] = [];

// État des opérations
let stats: RetryQueueStats = {
  pending: 0,
  processing: 0,
  success: 0,
  failed: 0,
  total: 0
};

// Indique si le traitement est en cours
let isProcessing = false;

// Configuration par défaut
const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_DELAY_MS = 2000;
const DEFAULT_MAX_DELAY_MS = 30000;

/**
 * Service de gestion de la file d'attente de réessais
 */
export const notionRetryQueue = {
  /**
   * Ajoute une opération à la file d'attente
   */
  addOperation(
    operation: () => Promise<any>,
    context: string = 'Opération Notion',
    options: RetryOperationOptions = {}
  ): string {
    const id = uuidv4();
    
    const newOperation: RetryOperation = {
      id,
      operation,
      context,
      timestamp: Date.now(),
      status: 'pending',
      attempts: 0,
      maxAttempts: options.maxAttempts || DEFAULT_MAX_ATTEMPTS
    };
    
    operations.push(newOperation);
    
    this.updateStats();
    
    return id;
  },
  
  /**
   * Met à jour les statistiques
   */
  updateStats(): RetryQueueStats {
    const pending = operations.filter(op => op.status === 'pending').length;
    const processing = operations.filter(op => op.status === 'processing').length;
    const success = operations.filter(op => op.status === 'success').length;
    const failed = operations.filter(op => op.status === 'failed').length;
    
    stats = {
      pending,
      processing,
      success,
      failed,
      total: operations.length,
      lastProcessed: new Date(),
      lastError: operations.find(op => op.status === 'failed')?.lastError as NotionError
    };
    
    return stats;
  },
  
  /**
   * Récupère les statistiques actuelles
   */
  getStats(): RetryQueueStats {
    return { ...stats };
  },
  
  /**
   * Récupère toutes les opérations
   */
  getOperations(): RetryOperation[] {
    return [...operations];
  },
  
  /**
   * Traite une opération spécifique
   */
  async retryOperation(id: string): Promise<boolean> {
    const operationIndex = operations.findIndex(op => op.id === id);
    
    if (operationIndex === -1) {
      return false;
    }
    
    const operation = operations[operationIndex];
    
    if (operation.status !== 'pending' && operation.status !== 'failed') {
      return false;
    }
    
    // Marquer comme en cours de traitement
    operations[operationIndex] = {
      ...operation,
      status: 'processing',
      attempts: operation.attempts + 1
    };
    
    this.updateStats();
    
    try {
      // Exécuter l'opération
      const result = await operation.operation();
      
      // Marquer comme réussie
      operations[operationIndex] = {
        ...operations[operationIndex],
        status: 'success',
        result
      };
      
      this.updateStats();
      return true;
    } catch (error) {
      // Formater l'erreur
      const notionError = error instanceof Error
        ? notionErrorService.reportError(error, operation.context)
        : notionErrorService.reportError('Erreur inconnue', operation.context);
      
      // Marquer comme échouée
      operations[operationIndex] = {
        ...operations[operationIndex],
        status: operation.attempts >= operation.maxAttempts ? 'failed' : 'pending',
        lastError: notionError,
        nextRetry: operation.attempts < operation.maxAttempts
          ? Date.now() + DEFAULT_DELAY_MS * (operation.attempts) // Délai exponentiel simple
          : undefined
      };
      
      this.updateStats();
      return false;
    }
  },
  
  /**
   * Réessaie toutes les opérations en attente
   */
  async retryAllOperations(): Promise<number> {
    const pendingOperations = operations
      .filter(op => op.status === 'pending')
      .map(op => op.id);
    
    let successCount = 0;
    
    for (const id of pendingOperations) {
      const success = await this.retryOperation(id);
      if (success) successCount++;
    }
    
    return successCount;
  },
  
  /**
   * Supprime une opération de la file d'attente
   */
  removeOperation(id: string): boolean {
    const initialLength = operations.length;
    operations = operations.filter(op => op.id !== id);
    
    if (operations.length !== initialLength) {
      this.updateStats();
      return true;
    }
    
    return false;
  },
  
  /**
   * Vide la file d'attente
   */
  clearOperations(): void {
    operations = [];
    this.updateStats();
  },
  
  /**
   * Traite la file d'attente
   */
  async processQueue(): Promise<void> {
    if (isProcessing) {
      return;
    }
    
    isProcessing = true;
    
    try {
      // Récupérer les opérations à traiter
      const pendingOperations = operations
        .filter(op => op.status === 'pending')
        .sort((a, b) => {
          // Priorité aux opérations avec nextRetry défini et passé
          if (a.nextRetry && b.nextRetry) {
            return a.nextRetry - b.nextRetry;
          }
          if (a.nextRetry) return a.nextRetry < Date.now() ? -1 : 1;
          if (b.nextRetry) return b.nextRetry < Date.now() ? 1 : -1;
          
          // Sinon, par ordre chronologique
          return a.timestamp - b.timestamp;
        })
        .map(op => op.id);
      
      // Traiter séquentiellement
      for (const id of pendingOperations) {
        await this.retryOperation(id);
      }
    } finally {
      isProcessing = false;
      this.updateStats();
    }
  }
};

export default notionRetryQueue;
