
import { v4 as uuidv4 } from 'uuid';
import { notionErrorService } from './notionErrorService';

// Types pour les opérations dans la file d'attente
interface QueuedOperation {
  id: string;
  operation: () => Promise<any>;
  context: string;
  timestamp: number;
  attempts: number;
  maxAttempts: number;
  backoffFactor: number;
  initialDelay: number;
  nextRetry: number | null;
  status: 'pending' | 'processing' | 'success' | 'failed';
  error: Error | null;
  onSuccess?: (result: any) => void;
  onFailure?: (error: Error) => void;
}

// Type pour les statistiques de la file d'attente
interface QueueStats {
  total: number;
  pending: number;
  processing: number;
  successful: number;
  failed: number;
  successRate: number;
}

// Options pour l'enqueue d'opérations
interface EnqueueOptions {
  maxAttempts?: number;
  backoffFactor?: number;
  initialDelay?: number;
  onSuccess?: (result: any) => void;
  onFailure?: (error: Error) => void;
}

/**
 * Service gérant une file d'attente d'opérations à réessayer
 */
class RetryQueueService {
  private queue: QueuedOperation[] = [];
  private processingTimer: number | null = null;
  private stats: QueueStats = {
    total: 0,
    pending: 0,
    processing: 0,
    successful: 0,
    failed: 0,
    successRate: 100
  };
  private subscribers: Array<() => void> = [];
  
  /**
   * Ajoute une opération à la file d'attente
   */
  public enqueue<T>(
    operation: () => Promise<T>,
    context: string,
    options: EnqueueOptions = {}
  ): string {
    const {
      maxAttempts = 3,
      backoffFactor = 2,
      initialDelay = 1000,
      onSuccess,
      onFailure
    } = options;
    
    const operationId = uuidv4();
    
    this.queue.push({
      id: operationId,
      operation,
      context,
      timestamp: Date.now(),
      attempts: 0,
      maxAttempts,
      backoffFactor,
      initialDelay,
      nextRetry: Date.now() + initialDelay,
      status: 'pending',
      error: null,
      onSuccess,
      onFailure
    });
    
    this.updateStats();
    this.notifySubscribers();
    
    // Si aucun timer n'est en cours, démarrer le traitement
    if (this.processingTimer === null) {
      this.startProcessingTimer();
    }
    
    return operationId;
  }
  
  /**
   * Annule une opération en attente
   */
  public cancel(operationId: string): boolean {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(op => op.id !== operationId);
    
    const removed = initialLength > this.queue.length;
    
    if (removed) {
      this.updateStats();
      this.notifySubscribers();
    }
    
    return removed;
  }
  
  /**
   * Traite immédiatement la file d'attente
   */
  public processQueue(): void {
    // Arrêter le timer actuel
    if (this.processingTimer !== null) {
      window.clearTimeout(this.processingTimer);
      this.processingTimer = null;
    }
    
    this.processNextOperation();
  }
  
  /**
   * Vide la file d'attente
   */
  public clearQueue(): number {
    const count = this.queue.length;
    this.queue = [];
    
    // Arrêter le timer
    if (this.processingTimer !== null) {
      window.clearTimeout(this.processingTimer);
      this.processingTimer = null;
    }
    
    this.updateStats();
    this.notifySubscribers();
    
    return count;
  }
  
  /**
   * Récupère les opérations en file d'attente
   */
  public getQueuedOperations(): QueuedOperation[] {
    return [...this.queue];
  }
  
  /**
   * Récupère les statistiques de la file d'attente
   */
  public getStats(): QueueStats {
    return { ...this.stats };
  }
  
  /**
   * S'abonne aux changements de la file d'attente
   */
  public subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    
    // Appeler immédiatement avec l'état actuel
    callback();
    
    // Retourner la fonction de désabonnement
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index !== -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }
  
  /**
   * Démarre le timer de traitement
   */
  private startProcessingTimer(): void {
    // Vérifier s'il y a des opérations en attente
    if (this.queue.length === 0) {
      this.processingTimer = null;
      return;
    }
    
    // Trouver la prochaine opération à traiter
    const now = Date.now();
    const nextOp = this.queue
      .filter(op => op.status === 'pending' && op.nextRetry !== null && op.nextRetry <= now)
      .sort((a, b) => (a.nextRetry || 0) - (b.nextRetry || 0))[0];
    
    if (nextOp) {
      // Si une opération est prête à être traitée, la traiter immédiatement
      this.processNextOperation();
    } else {
      // Sinon, programmer le prochain traitement
      const nextRetryTime = Math.min(
        ...this.queue
          .filter(op => op.status === 'pending' && op.nextRetry !== null)
          .map(op => op.nextRetry || Infinity)
      );
      
      const delay = nextRetryTime - now;
      
      if (delay < Infinity) {
        this.processingTimer = window.setTimeout(() => {
          this.processingTimer = null;
          this.processNextOperation();
        }, Math.max(100, delay)); // Au moins 100ms pour éviter les boucles trop rapides
      } else {
        this.processingTimer = null;
      }
    }
  }
  
  /**
   * Traite la prochaine opération en attente
   */
  private async processNextOperation(): Promise<void> {
    // Trouver la prochaine opération à traiter
    const now = Date.now();
    const nextOpIndex = this.queue.findIndex(
      op => op.status === 'pending' && op.nextRetry !== null && op.nextRetry <= now
    );
    
    if (nextOpIndex === -1) {
      // Aucune opération prête, programmer le prochain traitement
      this.startProcessingTimer();
      return;
    }
    
    // Mettre à jour le statut de l'opération
    this.queue[nextOpIndex].status = 'processing';
    this.queue[nextOpIndex].attempts++;
    this.updateStats();
    this.notifySubscribers();
    
    try {
      // Exécuter l'opération
      const result = await this.queue[nextOpIndex].operation();
      
      // Succès
      this.queue[nextOpIndex].status = 'success';
      
      // Appeler le callback de succès
      if (this.queue[nextOpIndex].onSuccess) {
        try {
          this.queue[nextOpIndex].onSuccess(result);
        } catch (callbackError) {
          console.error('Erreur dans le callback de succès:', callbackError);
        }
      }
      
      // Supprimer l'opération de la file d'attente après un certain délai
      // pour permettre à l'interface de montrer le succès
      setTimeout(() => {
        this.queue = this.queue.filter(op => op.id !== this.queue[nextOpIndex].id);
        this.updateStats();
        this.notifySubscribers();
        
        // Continuer avec la prochaine opération
        this.startProcessingTimer();
      }, 5000);
    } catch (error) {
      // Échec
      this.queue[nextOpIndex].error = error instanceof Error ? error : new Error(String(error));
      
      // Enrichir l'erreur avec le service d'erreur
      notionErrorService.handleError(this.queue[nextOpIndex].error, {
        context: this.queue[nextOpIndex].context,
        attempt: this.queue[nextOpIndex].attempts,
        maxAttempts: this.queue[nextOpIndex].maxAttempts
      });
      
      // Vérifier si l'opération a atteint le nombre maximum de tentatives
      if (this.queue[nextOpIndex].attempts >= this.queue[nextOpIndex].maxAttempts) {
        this.queue[nextOpIndex].status = 'failed';
        
        // Appeler le callback d'échec
        if (this.queue[nextOpIndex].onFailure) {
          try {
            this.queue[nextOpIndex].onFailure(this.queue[nextOpIndex].error!);
          } catch (callbackError) {
            console.error('Erreur dans le callback d\'échec:', callbackError);
          }
        }
        
        // Garder l'opération échouée dans la file d'attente pour affichage
        // mais la supprimer après un certain délai
        setTimeout(() => {
          this.queue = this.queue.filter(op => op.id !== this.queue[nextOpIndex].id);
          this.updateStats();
          this.notifySubscribers();
        }, 30000);
      } else {
        // Programmer une nouvelle tentative avec backoff exponentiel
        const delay = this.queue[nextOpIndex].initialDelay * 
          Math.pow(this.queue[nextOpIndex].backoffFactor, this.queue[nextOpIndex].attempts - 1);
        
        this.queue[nextOpIndex].status = 'pending';
        this.queue[nextOpIndex].nextRetry = Date.now() + delay;
      }
      
      this.updateStats();
      this.notifySubscribers();
    }
    
    // Passer à la prochaine opération
    setTimeout(() => {
      this.startProcessingTimer();
    }, 500);
  }
  
  /**
   * Met à jour les statistiques de la file d'attente
   */
  private updateStats(): void {
    const total = this.queue.length;
    const pending = this.queue.filter(op => op.status === 'pending').length;
    const processing = this.queue.filter(op => op.status === 'processing').length;
    const successful = this.queue.filter(op => op.status === 'success').length;
    const failed = this.queue.filter(op => op.status === 'failed').length;
    
    // Calculer le taux de réussite (éviter la division par zéro)
    const attempted = successful + failed;
    const successRate = attempted > 0 ? (successful / attempted) * 100 : 100;
    
    this.stats = {
      total,
      pending,
      processing,
      successful,
      failed,
      successRate
    };
  }
  
  /**
   * Notifie tous les abonnés des changements
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(subscriber => {
      try {
        subscriber();
      } catch (e) {
        console.error('Erreur lors de la notification d\'un abonné de la file d\'attente:', e);
      }
    });
  }
}

// Créer et exporter l'instance du service
export const retryQueueService = new RetryQueueService();
