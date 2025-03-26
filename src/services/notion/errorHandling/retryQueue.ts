
/**
 * Service de gestion de la file d'attente des opérations de réessai
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  RetryOperation, 
  RetryQueue, 
  RetryQueueStats, 
  RetryOperationStatus,
  RetryOperationOptions,
  NotionError
} from '../types/unified';
import { notionErrorService } from './notionErrorService';

// État interne de la file d'attente
const operations: RetryOperation[] = [];
let isProcessing = false;

// Statistiques de la file d'attente
const stats: RetryQueueStats = {
  pending: 0,
  processing: 0,
  success: 0,
  failed: 0,
  total: 0
};

/**
 * Calcule les statistiques actuelles de la file d'attente
 */
function updateStats(): RetryQueueStats {
  stats.pending = operations.filter(op => op.status === 'pending').length;
  stats.processing = operations.filter(op => op.status === 'processing').length;
  stats.success = operations.filter(op => op.status === 'success').length;
  stats.failed = operations.filter(op => op.status === 'failed').length;
  stats.total = operations.length;
  
  // Trouver la dernière erreur
  const failedOps = operations.filter(op => op.status === 'failed' && op.lastError);
  if (failedOps.length > 0) {
    // Trier par timestamp pour obtenir la plus récente
    failedOps.sort((a, b) => b.timestamp - a.timestamp);
    stats.lastError = failedOps[0].lastError as NotionError;
  }
  
  return { ...stats };
}

/**
 * Calcule le délai pour la prochaine tentative
 */
function calculateNextRetryDelay(operation: RetryOperation): number {
  const { attempts, maxAttempts } = operation;
  
  // Si on a dépassé le nombre de tentatives maximum, pas de retry
  if (attempts >= maxAttempts) {
    return -1;
  }
  
  // Délai de base: 2^tentatives * 1000ms (1s, 2s, 4s, 8s, etc.)
  // avec un maximum de 30 secondes
  const baseDelay = Math.min(Math.pow(2, attempts) * 1000, 30000);
  
  // Ajouter un facteur aléatoire pour éviter les "tempêtes" de requêtes
  const jitter = Math.random() * 0.3 * baseDelay;
  
  return Math.floor(baseDelay + jitter);
}

/**
 * Implémentation de la file d'attente des réessais
 */
export const notionRetryQueue: RetryQueue = {
  /**
   * Récupère les statistiques de la file d'attente
   */
  getStats(): RetryQueueStats {
    return updateStats();
  },
  
  /**
   * Récupère toutes les opérations de la file d'attente
   */
  getOperations(): RetryOperation[] {
    return [...operations];
  },
  
  /**
   * Ajoute une opération à la file d'attente
   */
  addOperation(
    operation: () => Promise<any>,
    context: string = 'Opération Notion',
    options: RetryOperationOptions = {}
  ): string {
    const id = uuidv4();
    const maxAttempts = options.maxAttempts || 3;
    
    // Créer l'entrée dans la file d'attente
    const retryOp: RetryOperation = {
      id,
      operation,
      context,
      timestamp: Date.now(),
      status: 'pending',
      attempts: 0,
      maxAttempts
    };
    
    // Calculer la prochaine tentative
    const nextRetryDelay = calculateNextRetryDelay(retryOp);
    if (nextRetryDelay > 0) {
      retryOp.nextRetry = Date.now() + nextRetryDelay;
    }
    
    // Ajouter à la file
    operations.push(retryOp);
    
    // Mettre à jour les statistiques
    updateStats();
    
    return id;
  },
  
  /**
   * Réessaye une opération spécifique
   */
  async retryOperation(id: string): Promise<boolean> {
    const opIndex = operations.findIndex(op => op.id === id);
    if (opIndex === -1) {
      return false;
    }
    
    const op = operations[opIndex];
    
    // Ne pas retenter si statut final
    if (op.status === 'success') {
      return true;
    }
    
    // Marquer comme en cours
    op.status = 'processing';
    op.attempts++;
    updateStats();
    
    try {
      // Exécuter l'opération
      const result = await op.operation();
      
      // Succès
      op.status = 'success';
      op.result = result;
      updateStats();
      
      return true;
    } catch (error) {
      // Erreur
      const notionError = error instanceof Error
        ? notionErrorService.createError(error, notionErrorService.identifyErrorType(error), { context: op.context })
        : notionErrorService.createError(String(error), notionErrorService.identifyErrorType(error), { context: op.context });
      
      op.lastError = notionError;
      
      // Déterminer si on peut encore réessayer
      if (op.attempts < op.maxAttempts && notionError.retryable) {
        op.status = 'pending';
        
        // Calculer le délai pour la prochaine tentative
        const nextRetryDelay = calculateNextRetryDelay(op);
        if (nextRetryDelay > 0) {
          op.nextRetry = Date.now() + nextRetryDelay;
        }
      } else {
        op.status = 'failed';
      }
      
      updateStats();
      return false;
    }
  },
  
  /**
   * Réessaye toutes les opérations en attente
   */
  async retryAllOperations(): Promise<number> {
    const pendingOps = operations.filter(op => op.status === 'pending');
    let successCount = 0;
    
    // Traiter chaque opération en parallèle
    const results = await Promise.allSettled(
      pendingOps.map(op => this.retryOperation(op.id))
    );
    
    // Compter les succès
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        successCount++;
      }
    });
    
    return successCount;
  },
  
  /**
   * Supprime une opération de la file d'attente
   */
  removeOperation(id: string): boolean {
    const initialLength = operations.length;
    const opIndex = operations.findIndex(op => op.id === id);
    
    if (opIndex !== -1) {
      operations.splice(opIndex, 1);
      updateStats();
      return true;
    }
    
    return false;
  },
  
  /**
   * Efface toutes les opérations de la file d'attente
   */
  clearOperations(): void {
    operations.length = 0;
    updateStats();
  },
  
  /**
   * Traite la file d'attente des opérations
   */
  async processQueue(): Promise<void> {
    // Éviter les traitements simultanés
    if (isProcessing) {
      return;
    }
    
    isProcessing = true;
    
    try {
      // Filtrer les opérations à traiter
      const opsToProcess = operations.filter(op => 
        op.status === 'pending' && 
        (!op.nextRetry || op.nextRetry <= Date.now())
      );
      
      // Rien à faire
      if (opsToProcess.length === 0) {
        return;
      }
      
      // Traiter les opérations en séquence
      for (const op of opsToProcess) {
        await this.retryOperation(op.id);
      }
    } finally {
      isProcessing = false;
    }
  }
};

// Export par défaut pour la compatibilité
export default notionRetryQueue;
