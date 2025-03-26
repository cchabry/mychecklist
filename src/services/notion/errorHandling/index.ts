
/**
 * Service centralisé pour la gestion des erreurs Notion
 */
import { NotionError, NotionErrorType, NotionErrorSeverity } from '../types/unified';
import { v4 as uuidv4 } from 'uuid';

// File d'attente des opérations en échec
interface RetryOperation {
  id: string;
  operation: () => Promise<any>;
  errorContext: string;
  timestamp: number;
  attempts: number;
  maxAttempts: number;
}

// État de la file d'attente
interface RetryQueueState {
  operations: RetryOperation[];
  processing: boolean;
  stats: {
    pendingOperations: number;
    successfulRetries: number;
    failedRetries: number;
  };
}

// Service de gestion des erreurs
class NotionErrorService {
  private errors: NotionError[] = [];
  private readonly MAX_ERRORS = 50;

  // Créer et rapporter une erreur
  public reportError(error: Error, context?: string): NotionError {
    const errorType = this.identifyErrorType(error);
    const notionError = this.createError(error, errorType, context);
    this.addRecentError(notionError);
    return notionError;
  }

  // Identifier le type d'erreur
  public identifyErrorType(error: Error): NotionErrorType {
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('unauthorized') || message.includes('not authorized') || message.includes('invalid token')) {
      return NotionErrorType.AUTH;
    }
    
    if (message.includes('not found') || message.includes('404')) {
      return NotionErrorType.DATABASE;
    }
    
    if (message.includes('permission') || message.includes('access denied')) {
      return NotionErrorType.PERMISSION;
    }
    
    if (message.includes('rate limit') || message.includes('too many requests') || message.includes('429')) {
      return NotionErrorType.RATE_LIMIT;
    }
    
    if (message.includes('timeout') || message.includes('timed out')) {
      return NotionErrorType.TIMEOUT;
    }
    
    if (message.includes('network') || message.includes('failed to fetch') || message.includes('cors')) {
      return NotionErrorType.NETWORK;
    }
    
    return NotionErrorType.UNKNOWN;
  }

  // Créer une erreur Notion
  public createError(
    error: Error | string,
    type: NotionErrorType = NotionErrorType.UNKNOWN,
    context?: string,
    severity: NotionErrorSeverity = NotionErrorSeverity.ERROR
  ): NotionError {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const originalError = typeof error === 'string' ? undefined : error;
    
    return {
      id: uuidv4(),
      message: errorMessage,
      type,
      timestamp: Date.now(),
      context,
      severity,
      retryable: this.isErrorRetryable(type),
      original: originalError
    };
  }

  // Ajouter une erreur à la liste des erreurs récentes
  public addRecentError(error: NotionError): void {
    this.errors.unshift(error);
    
    // Limiter le nombre d'erreurs conservées
    if (this.errors.length > this.MAX_ERRORS) {
      this.errors = this.errors.slice(0, this.MAX_ERRORS);
    }
  }

  // Obtenir les erreurs récentes
  public getRecentErrors(): NotionError[] {
    return [...this.errors];
  }

  // Effacer toutes les erreurs
  public clearErrors(): void {
    this.errors = [];
  }

  // Vérifier si une erreur est réessayable
  private isErrorRetryable(type: NotionErrorType): boolean {
    return [
      NotionErrorType.NETWORK,
      NotionErrorType.TIMEOUT,
      NotionErrorType.RATE_LIMIT
    ].includes(type);
  }

  // Obtenir un message convivial pour une erreur
  public getFriendlyMessage(error: NotionError): string {
    switch (error.type) {
      case NotionErrorType.AUTH:
        return "Problème d'authentification avec Notion. Vérifiez votre clé API.";
      case NotionErrorType.DATABASE:
        return "Base de données Notion introuvable. Vérifiez l'ID de la base.";
      case NotionErrorType.PERMISSION:
        return "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource Notion.";
      case NotionErrorType.RATE_LIMIT:
        return "Trop de requêtes vers l'API Notion. Veuillez réessayer plus tard.";
      case NotionErrorType.TIMEOUT:
        return "Délai d'attente dépassé lors de la connexion à Notion.";
      case NotionErrorType.NETWORK:
        return "Problème de réseau lors de la connexion à Notion.";
      default:
        return "Une erreur s'est produite lors de la communication avec Notion.";
    }
  }
}

// Service de gestion de la file d'attente des opérations
class NotionRetryQueue {
  private queueState: RetryQueueState = {
    operations: [],
    processing: false,
    stats: {
      pendingOperations: 0,
      successfulRetries: 0,
      failedRetries: 0
    }
  };

  // Ajouter une opération à la file d'attente
  public addOperation(
    operation: () => Promise<any>,
    errorContext: string,
    maxAttempts: number = 3
  ): string {
    const id = uuidv4();
    
    this.queueState.operations.push({
      id,
      operation,
      errorContext,
      timestamp: Date.now(),
      attempts: 0,
      maxAttempts
    });
    
    this.updateStats();
    return id;
  }

  // Traiter la file d'attente
  public async processQueue(): Promise<void> {
    if (this.queueState.processing || this.queueState.operations.length === 0) {
      return;
    }
    
    this.queueState.processing = true;
    
    try {
      const operationsToProcess = [...this.queueState.operations];
      const successfulOperations: string[] = [];
      
      for (const op of operationsToProcess) {
        if (op.attempts >= op.maxAttempts) {
          // Trop de tentatives, marquer comme échoué définitivement
          this.queueState.stats.failedRetries++;
          successfulOperations.push(op.id);
          continue;
        }
        
        try {
          op.attempts++;
          await op.operation();
          
          // Opération réussie
          this.queueState.stats.successfulRetries++;
          successfulOperations.push(op.id);
        } catch (error) {
          // L'opération a échoué, elle restera dans la file d'attente
          console.error(`Retry failed for operation ${op.id} (attempt ${op.attempts}/${op.maxAttempts}):`, error);
        }
      }
      
      // Retirer les opérations réussies de la file d'attente
      this.queueState.operations = this.queueState.operations.filter(
        op => !successfulOperations.includes(op.id)
      );
      
      this.updateStats();
    } finally {
      this.queueState.processing = false;
    }
  }

  // Obtenir les statistiques de la file d'attente
  public getStats() {
    return { ...this.queueState.stats };
  }

  // Mettre à jour les statistiques
  private updateStats() {
    this.queueState.stats.pendingOperations = this.queueState.operations.length;
  }

  // Effacer la file d'attente
  public clearQueue(): void {
    this.queueState.operations = [];
    this.updateStats();
  }
}

// Créer des instances des services
export const notionErrorService = new NotionErrorService();
export const notionRetryQueue = new NotionRetryQueue();

// Export par défaut
export default {
  errorService: notionErrorService,
  retryQueue: notionRetryQueue
};
