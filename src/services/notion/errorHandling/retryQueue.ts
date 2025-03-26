
/**
 * Service de file d'attente pour réessayer les opérations qui ont échoué
 */

import { 
  QueuedOperation, 
  RetryQueueStats, 
  RetryOperationOptions 
} from '../types/unified';
import { toast } from 'sonner';

class RetryQueue {
  private queue: QueuedOperation[] = [];
  private isProcessing: boolean = false;
  private isPausedState: boolean = false;
  private processingTimerId: number | null = null;
  private readonly DEFAULT_MAX_ATTEMPTS = 3;
  private readonly DEFAULT_RETRY_DELAY = 5000; // 5 secondes
  
  constructor() {
    // Récupérer la file d'attente sauvegardée
    this.loadFromStorage();
  }
  
  /**
   * Obtient les statistiques de la file d'attente
   */
  public getStats(): RetryQueueStats {
    const pendingCount = this.queue.filter(op => op.status === 'pending').length;
    const successCount = this.queue.filter(op => op.status === 'success').length;
    const failedCount = this.queue.filter(op => op.status === 'failed').length;
    
    return {
      pendingOperations: pendingCount,
      completedOperations: successCount,
      failedOperations: failedCount,
      isProcessing: this.isProcessing,
      isPaused: this.isPausedState,
      totalOperations: this.queue.length
    };
  }
  
  /**
   * Ajoute une opération à la file d'attente
   */
  public addOperation(
    operation: () => Promise<any>,
    context: string = 'Opération',
    maxAttempts: number = this.DEFAULT_MAX_ATTEMPTS,
    options: RetryOperationOptions = {}
  ): string {
    const operationId = `op_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const queuedOperation: QueuedOperation = {
      id: operationId,
      operation,
      context,
      attempts: 0,
      maxAttempts: options.maxAttempts || maxAttempts,
      lastAttempt: 0,
      status: 'pending'
    };
    
    this.queue.push(queuedOperation);
    this.saveToStorage();
    
    // Notification toast
    toast.info('Opération ajoutée à la file d\'attente', {
      description: context,
      id: `queue-add-${operationId}`,
      duration: 3000
    });
    
    // Si l'auto-processing est actif et file non en pause, lancer le traitement
    if (!this.isPausedState) {
      this.scheduleProcessing();
    }
    
    return operationId;
  }
  
  /**
   * Traite toute la file d'attente
   */
  public async processQueue(): Promise<void> {
    // Si déjà en cours de traitement ou en pause, ne rien faire
    if (this.isProcessing || this.isPausedState) {
      return;
    }
    
    // Marquer comme en cours de traitement
    this.isProcessing = true;
    
    try {
      const pendingOperations = this.queue.filter(op => op.status === 'pending');
      
      if (pendingOperations.length === 0) {
        return;
      }
      
      for (const operation of pendingOperations) {
        if (this.isPausedState) {
          break; // Arrêter le traitement si mis en pause
        }
        
        await this.processOperation(operation.id);
      }
    } finally {
      this.isProcessing = false;
      this.saveToStorage();
    }
  }
  
  /**
   * Traite une opération spécifique
   */
  public async processOperation(operationId: string): Promise<boolean> {
    const opIndex = this.queue.findIndex(op => op.id === operationId);
    
    if (opIndex === -1) {
      console.warn(`Opération non trouvée: ${operationId}`);
      return false;
    }
    
    const operation = this.queue[opIndex];
    
    // Si déjà traitée avec succès ou échec définitif
    if (operation.status !== 'pending') {
      return operation.status === 'success';
    }
    
    // Incrémenter le compteur de tentatives et mettre à jour le statut
    operation.attempts++;
    operation.lastAttempt = Date.now();
    operation.status = 'processing';
    this.saveToStorage();
    
    try {
      const result = await operation.operation();
      
      // Succès
      operation.status = 'success';
      this.saveToStorage();
      
      toast.success('Opération réussie', {
        description: operation.context,
        id: `queue-success-${operationId}`,
        duration: 3000
      });
      
      return true;
    } catch (error) {
      // Erreur
      operation.error = error instanceof Error ? error : new Error(String(error));
      
      // Déterminer si une nouvelle tentative est possible
      if (operation.attempts < operation.maxAttempts) {
        operation.status = 'pending';
        
        toast.warning('Échec temporaire', {
          description: `${operation.context} - Nouvel essai plus tard`,
          id: `queue-retry-${operationId}`,
          duration: 3000
        });
      } else {
        operation.status = 'failed';
        
        toast.error('Échec définitif', {
          description: `${operation.context} - Maximum de tentatives atteint`,
          id: `queue-fail-${operationId}`,
          duration: 5000
        });
      }
      
      this.saveToStorage();
      return false;
    }
  }
  
  /**
   * Vide la file d'attente
   */
  public clearQueue(): void {
    this.queue = [];
    this.isProcessing = false;
    this.saveToStorage();
    
    toast.info('File d\'attente vidée', {
      duration: 2000
    });
  }
  
  /**
   * Met en pause le traitement automatique
   */
  public pause(): void {
    this.isPausedState = true;
    
    if (this.processingTimerId !== null) {
      window.clearTimeout(this.processingTimerId);
      this.processingTimerId = null;
    }
    
    toast.info('Traitement de la file d\'attente en pause', {
      duration: 2000
    });
  }
  
  /**
   * Reprend le traitement automatique
   */
  public resume(): void {
    this.isPausedState = false;
    this.scheduleProcessing();
    
    toast.info('Traitement de la file d\'attente repris', {
      duration: 2000
    });
  }
  
  /**
   * Vérifie si le traitement est en pause
   */
  public isPaused(): boolean {
    return this.isPausedState;
  }
  
  /**
   * Obtient les opérations de la file d'attente
   */
  public getQueuedOperations(): QueuedOperation[] {
    return [...this.queue];
  }
  
  /**
   * Récupère une opération par son ID
   */
  public getOperation(id: string): QueuedOperation | undefined {
    return this.queue.find(op => op.id === id);
  }
  
  /**
   * Planifie le traitement automatique
   */
  private scheduleProcessing(delay: number = this.DEFAULT_RETRY_DELAY): void {
    if (this.processingTimerId !== null) {
      window.clearTimeout(this.processingTimerId);
    }
    
    this.processingTimerId = window.setTimeout(() => {
      this.processQueue();
    }, delay);
  }
  
  /**
   * Sauvegarde la file d'attente dans le stockage local
   */
  private saveToStorage(): void {
    try {
      // On ne sauvegarde que les informations nécessaires, pas les fonctions
      const serializable = this.queue.map(op => ({
        id: op.id,
        context: op.context,
        attempts: op.attempts,
        maxAttempts: op.maxAttempts,
        lastAttempt: op.lastAttempt,
        status: op.status,
        error: op.error ? {
          message: op.error.message,
          stack: op.error.stack
        } : undefined
      }));
      
      localStorage.setItem('notion_retry_queue', JSON.stringify(serializable));
    } catch (e) {
      console.error('Erreur lors de la sauvegarde de la file d\'attente:', e);
    }
  }
  
  /**
   * Charge la file d'attente depuis le stockage local
   */
  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('notion_retry_queue');
      
      if (!saved) {
        return;
      }
      
      const parsed = JSON.parse(saved);
      
      // Les opérations sauvegardées ne contiennent pas les fonctions,
      // donc on ne peut pas les restaurer complètement
      this.queue = [];
      
      // On peut notifier l'utilisateur des opérations non restaurées
      if (parsed.length > 0) {
        console.log(`${parsed.length} opération(s) non restaurée(s) depuis le stockage`);
      }
    } catch (e) {
      console.error('Erreur lors du chargement de la file d\'attente:', e);
    }
  }
}

// Créer et exporter l'instance
export const notionRetryQueue = new RetryQueue();
export default notionRetryQueue;
