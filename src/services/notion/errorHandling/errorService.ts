
import { v4 as uuidv4 } from 'uuid';
import { 
  NotionError, 
  NotionErrorType, 
  ErrorSubscriber,
  ReportErrorOptions,
  NotionErrorSeverity,
  NotionErrorOptions
} from './types';
import { notionErrorUtils } from './utils';

// Nombre maximum d'erreurs à conserver en mémoire
const MAX_ERRORS = 50;

/**
 * Service de gestion des erreurs pour Notion
 */
class NotionErrorService {
  private errors: NotionError[] = [];
  private subscribers: ErrorSubscriber[] = [];
  
  /**
   * Ajoute une nouvelle erreur au service
   */
  reportError(error: Error | string, operation?: string, options: ReportErrorOptions = {}): NotionError {
    // Créer l'objet d'erreur enrichi
    const errorMessage = typeof error === 'string' ? error : error.message;
    const originError = typeof error === 'string' ? new Error(error) : error;
    
    const notionError: NotionError = {
      id: uuidv4(),
      timestamp: Date.now(),
      message: errorMessage,
      type: options.type || notionErrorUtils.detectErrorType(error),
      operation: operation || options.operation,
      context: options.context,
      originError,
      details: options.details,
      retryable: options.retryable !== undefined 
        ? options.retryable 
        : notionErrorUtils.isRetryableError(error),
      name: originError.name,
      stack: originError.stack,
      severity: options.severity || NotionErrorSeverity.ERROR,
      recoverable: options.recoverable || false,
      recoveryActions: options.recoveryActions || []
    };
    
    // Ajouter l'erreur à la liste
    this.errors.unshift(notionError);
    
    // Limiter le nombre d'erreurs en mémoire
    if (this.errors.length > MAX_ERRORS) {
      this.errors = this.errors.slice(0, MAX_ERRORS);
    }
    
    // Notifier les abonnés
    this.notifySubscribers();
    
    // Loguer l'erreur
    console.error('Notion Error:', {
      message: notionError.message,
      type: notionError.type,
      operation: notionError.operation,
      context: notionError.context,
      retryable: notionError.retryable,
      severity: notionError.severity,
      recoverable: notionError.recoverable
    });
    
    return notionError;
  }
  
  /**
   * Crée une erreur spécifique sans la reporter
   */
  createError(message: string, options: NotionErrorOptions = {}): NotionError {
    return {
      id: uuidv4(),
      timestamp: Date.now(),
      message,
      type: options.type || NotionErrorType.UNKNOWN,
      operation: options.operation,
      context: options.context,
      details: options.details,
      retryable: options.retryable || false,
      name: "NotionError", // Ajout du nom obligatoire
      severity: options.severity || NotionErrorSeverity.ERROR,
      recoverable: options.recoverable || false,
      recoveryActions: options.recoveryActions || [],
      cause: options.cause
    };
  }
  
  /**
   * Obtient la liste de toutes les erreurs
   */
  getAllErrors(): NotionError[] {
    return [...this.errors];
  }
  
  /**
   * Obtient seulement les erreurs récentes
   */
  getRecentErrors(count = 5): NotionError[] {
    return this.errors.slice(0, count);
  }
  
  /**
   * Obtient une erreur par son ID
   */
  getErrorById(id: string): NotionError | undefined {
    return this.errors.find(error => error.id === id);
  }
  
  /**
   * Supprime une erreur par son ID
   */
  dismissError(id: string): boolean {
    const initialLength = this.errors.length;
    this.errors = this.errors.filter(error => error.id !== id);
    
    const removed = initialLength > this.errors.length;
    if (removed) {
      this.notifySubscribers();
    }
    
    return removed;
  }
  
  /**
   * Supprime toutes les erreurs
   */
  clearAllErrors(): void {
    if (this.errors.length > 0) {
      this.errors = [];
      this.notifySubscribers();
    }
  }

  /**
   * Alias pour clearAllErrors - pour compatibilité
   */
  clearErrors(): void {
    this.clearAllErrors();
  }
  
  /**
   * S'abonne aux notifications d'erreurs
   */
  subscribe(callback: (errors: NotionError[]) => void): () => void {
    const id = uuidv4();
    this.subscribers.push({ id, callback });
    
    // Notifier immédiatement le nouvel abonné avec l'état actuel
    callback([...this.errors]);
    
    // Retourner une fonction de désabonnement
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub.id !== id);
    };
  }
  
  /**
   * Notifie tous les abonnés d'un changement dans les erreurs
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(subscriber => {
      subscriber.callback([...this.errors]);
    });
  }
  
  /**
   * Génère un message utilisateur adapté au type d'erreur
   */
  createUserFriendlyMessage(error: NotionError): string {
    switch (error.type) {
      case NotionErrorType.AUTH:
        return "Erreur d'authentification Notion. Veuillez vérifier vos identifiants.";
        
      case NotionErrorType.PERMISSION:
        return "Erreur de permission Notion. L'application n'a pas accès à cette ressource.";
        
      case NotionErrorType.RATE_LIMIT:
        return "Limite de requêtes Notion atteinte. Veuillez réessayer dans quelques instants.";
        
      case NotionErrorType.CORS:
        return "Erreur de connexion à l'API Notion. Vérifiez votre configuration CORS.";
        
      case NotionErrorType.DATABASE:
        return "Erreur de base de données Notion. Vérifiez la structure de vos bases.";
        
      default:
        return `Erreur Notion: ${error.message}`;
    }
  }
}

// Créer et exporter une instance unique
export const notionErrorService = new NotionErrorService();
