
import { v4 as uuidv4 } from 'uuid';
import { 
  NotionError, 
  NotionErrorType, 
  NotionErrorSeverity,
  NotionErrorOptions,
  ErrorSubscriber
} from '../types/errorTypes';

/**
 * Service centralisé de gestion des erreurs Notion
 */
export class NotionErrorService {
  private static instance: NotionErrorService;
  private errors: NotionError[] = [];
  private subscribers: ErrorSubscriber[] = [];
  private maxErrors: number = 50; // Nombre maximum d'erreurs à conserver

  private constructor() {}

  /**
   * Obtenir l'instance unique du service
   */
  public static getInstance(): NotionErrorService {
    if (!NotionErrorService.instance) {
      NotionErrorService.instance = new NotionErrorService();
    }
    return NotionErrorService.instance;
  }

  /**
   * Créer une erreur Notion enrichie
   */
  public createError(message: string, options: NotionErrorOptions = {}): NotionError {
    const {
      type = NotionErrorType.UNKNOWN,
      severity = NotionErrorSeverity.ERROR,
      context,
      cause,
      recoveryActions = [],
      recoverable = false,
      retryable = false,
      name = 'NotionError',
      operation
    } = options;

    const error: NotionError = {
      id: uuidv4(),
      message,
      type,
      severity,
      context,
      cause,
      recoveryActions,
      recoverable,
      retryable,
      timestamp: Date.now(),
      name,
      stack: options.stack,
      operation
    };

    return error;
  }

  /**
   * Enregistrer une erreur et notifier les abonnés
   */
  public reportError(error: Error | NotionError | string, context?: string, options: NotionErrorOptions = {}): NotionError {
    // Convertir en NotionError si nécessaire
    const notionError = this.ensureNotionError(error, context, options);
    
    // Ajouter à la liste des erreurs
    this.errors.unshift(notionError);
    
    // Limiter le nombre d'erreurs stockées
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }
    
    // Notifier les abonnés
    this.notifySubscribers();
    
    return notionError;
  }

  /**
   * S'abonner aux notifications d'erreur
   */
  public subscribe(subscriber: ErrorSubscriber): () => void {
    this.subscribers.push(subscriber);
    
    // Retourner une fonction pour se désabonner
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== subscriber);
    };
  }

  /**
   * Obtenir toutes les erreurs enregistrées
   */
  public getErrors(): NotionError[] {
    return [...this.errors];
  }

  /**
   * Obtenir les erreurs récentes
   */
  public getRecentErrors(count: number = 5): NotionError[] {
    return this.errors.slice(0, Math.min(count, this.errors.length));
  }

  /**
   * Effacer toutes les erreurs
   */
  public clearErrors(): void {
    this.errors = [];
    this.notifySubscribers();
  }

  /**
   * Vérifier si une erreur est critique
   */
  public isCriticalError(error: Error | NotionError | string): boolean {
    const notionError = this.ensureNotionError(error);
    return notionError.severity === NotionErrorSeverity.CRITICAL;
  }

  /**
   * Vérifier si une erreur est récupérable
   */
  public isRecoverableError(error: Error | NotionError | string): boolean {
    const notionError = this.ensureNotionError(error);
    return notionError.recoverable === true;
  }

  /**
   * Convertir une erreur standard en NotionError
   */
  private ensureNotionError(error: Error | NotionError | string, context?: string, options: NotionErrorOptions = {}): NotionError {
    // Si c'est déjà une NotionError, on la retourne telle quelle
    if (typeof error === 'object' && 'id' in error && 'type' in error && 'severity' in error) {
      return error as NotionError;
    }
    
    // Déterminer le type d'erreur et autres propriétés
    let type = options.type || NotionErrorType.UNKNOWN;
    let severity = options.severity || NotionErrorSeverity.ERROR;
    let retryable = options.retryable || false;
    let message = '';
    
    if (typeof error === 'string') {
      message = error;
    } else if (error instanceof Error) {
      message = error.message;
      
      // Analyser le message d'erreur si le type n'est pas spécifié
      if (!options.type) {
        const errorMsg = message.toLowerCase();
        if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('timeout')) {
          type = NotionErrorType.NETWORK;
          retryable = true;
        } else if (errorMsg.includes('auth') || errorMsg.includes('unauthorized') || errorMsg.includes('401')) {
          type = NotionErrorType.AUTH;
          severity = NotionErrorSeverity.CRITICAL;
        } else if (errorMsg.includes('permission') || errorMsg.includes('forbidden') || errorMsg.includes('403')) {
          type = NotionErrorType.PERMISSION;
          severity = NotionErrorSeverity.CRITICAL;
        } else if (errorMsg.includes('rate limit') || errorMsg.includes('429')) {
          type = NotionErrorType.RATE_LIMIT;
          retryable = true;
        }
      }
    } else {
      message = String(error);
    }
    
    // Créer une nouvelle NotionError
    return this.createError(message, {
      type,
      severity,
      context: context || options.context,
      retryable: options.retryable !== undefined ? options.retryable : retryable,
      recoverable: options.recoverable || false,
      cause: error instanceof Error ? error : undefined,
      name: error instanceof Error ? error.name : 'NotionError',
      stack: error instanceof Error ? error.stack : undefined
    });
  }

  /**
   * Notifier tous les abonnés d'une nouvelle erreur
   */
  private notifySubscribers(): void {
    const errorsCopy = [...this.errors];
    this.subscribers.forEach(subscriber => {
      try {
        subscriber(errorsCopy);
      } catch (err) {
        console.error('Erreur lors de la notification d\'un abonné:', err);
      }
    });
  }
  
  /**
   * Génère un message utilisateur à partir d'une erreur
   */
  public createUserFriendlyMessage(error: NotionError): string {
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
        
      case NotionErrorType.NOT_FOUND:
        return "Ressource Notion introuvable. Vérifiez les identifiants utilisés.";
        
      case NotionErrorType.TIMEOUT:
        return "Délai d'attente dépassé pour l'opération Notion. Réessayez ultérieurement.";
        
      case NotionErrorType.NETWORK:
        return "Problème de connexion réseau. Vérifiez votre connexion internet.";
        
      case NotionErrorType.API:
        return "Erreur de l'API Notion. Vérifiez les paramètres de votre requête.";
        
      default:
        return `Erreur Notion: ${error.message}`;
    }
  }
}

// Exporter une instance singleton
export const notionErrorService = NotionErrorService.getInstance();
