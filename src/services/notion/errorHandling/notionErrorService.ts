
import { NotionError, NotionErrorType, NotionErrorSeverity, NotionErrorOptions, NotionErrorSubscriber } from './types';

/**
 * Service centralisé de gestion des erreurs Notion
 */
export class NotionErrorService {
  private static instance: NotionErrorService;
  private errors: NotionError[] = [];
  private subscribers: NotionErrorSubscriber[] = [];
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
      recoveryActions,
      recoverable = false
    } = options;

    const error: NotionError = {
      id: crypto.randomUUID ? crypto.randomUUID() : `err-${Date.now()}`,
      message,
      type,
      severity,
      context: context || {},
      cause,
      recoveryActions: recoveryActions || [],
      recoverable,
      timestamp: Date.now(),
      name: 'NotionError',
    };

    return error;
  }

  /**
   * Enregistrer une erreur et notifier les abonnés
   */
  public reportError(error: Error | NotionError, context?: string): NotionError {
    // Convertir en NotionError si nécessaire
    const notionError = this.ensureNotionError(error, context);
    
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
  public subscribe(subscriber: NotionErrorSubscriber): () => void {
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
  public isCriticalError(error: Error | NotionError): boolean {
    const notionError = this.ensureNotionError(error);
    return notionError.severity === NotionErrorSeverity.CRITICAL;
  }

  /**
   * Vérifier si une erreur est récupérable
   */
  public isRecoverableError(error: Error | NotionError): boolean {
    const notionError = this.ensureNotionError(error);
    return notionError.recoverable === true;
  }

  /**
   * Convertir une erreur standard en NotionError
   */
  private ensureNotionError(error: Error | NotionError, context?: string): NotionError {
    if ('type' in error && 'severity' in error && 'timestamp' in error) {
      return error as NotionError;
    }
    
    // Déterminer le type d'erreur
    let type = NotionErrorType.UNKNOWN;
    let severity = NotionErrorSeverity.ERROR;
    
    // Analyser le message d'erreur
    const message = error.message.toLowerCase();
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      type = NotionErrorType.NETWORK;
    } else if (message.includes('auth') || message.includes('unauthorized') || message.includes('401')) {
      type = NotionErrorType.AUTH;
      severity = NotionErrorSeverity.CRITICAL;
    } else if (message.includes('permission') || message.includes('forbidden') || message.includes('403')) {
      type = NotionErrorType.PERMISSION;
      severity = NotionErrorSeverity.CRITICAL;
    } else if (message.includes('rate limit') || message.includes('429')) {
      type = NotionErrorType.RATE_LIMIT;
    }
    
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `err-${Date.now()}`,
      timestamp: Date.now(),
      message: error.message,
      type,
      severity,
      cause: error,
      context: context ? { context } : undefined,
      name: error.name || 'NotionError',
      stack: error.stack,
      retryable: type === NotionErrorType.NETWORK || type === NotionErrorType.RATE_LIMIT,
      recoverable: false,
      recoveryActions: []
    };
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
}

// Exporter une instance singleton
export const notionErrorService = NotionErrorService.getInstance();
