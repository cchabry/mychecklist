
/**
 * Service de gestion des erreurs Notion amélioré
 * avec une meilleure compatibilité TypeScript
 */

import { toast } from 'sonner';
import { 
  NotionError, 
  NotionErrorType, 
  NotionErrorSeverity,
  NotionErrorOptions
} from '../types/unified';

// Type pour les abonnés aux erreurs
type ErrorSubscriber = (errors: NotionError[]) => void;

// Classe pour le service de gestion des erreurs
class NotionErrorService {
  private subscribers: ErrorSubscriber[] = [];
  private recentErrors: NotionError[] = [];
  private readonly MAX_RECENT_ERRORS = 10;
  
  /**
   * Signale une erreur au système
   */
  public reportError(
    error: Error | string, 
    context?: string,
    options: NotionErrorOptions = {}
  ): NotionError {
    // Normaliser l'erreur
    const errorMessage = typeof error === 'string' 
      ? error 
      : error.message || 'Erreur inconnue';
    
    // Déterminer le type d'erreur
    const errorType = options.type || this.identifyErrorType(
      typeof error === 'string' ? new Error(error) : error
    );
    
    // Créer l'objet d'erreur
    const notionError: NotionError = {
      id: `error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      message: errorMessage,
      type: errorType,
      timestamp: Date.now(),
      severity: options.severity || NotionErrorSeverity.ERROR,
      retryable: options.retryable || false,
      operation: options.operation,
      context: context || options.context || undefined,
      original: typeof error === 'string' ? undefined : error,
      stack: typeof error === 'string' ? undefined : error.stack
    };
    
    // Enregistrer l'erreur
    this.addRecentError(notionError);
    
    // Log dans la console
    console.error(`[Notion Error] [${errorType}]: ${errorMessage}`, error);
    
    // Notifier les abonnés
    this.notifySubscribers();
    
    return notionError;
  }
  
  /**
   * Identifie le type d'erreur
   */
  public identifyErrorType(error: Error): NotionErrorType {
    const message = error.message.toLowerCase();
    
    // Recherche de patterns dans le message d'erreur
    if (message.includes('cors') || message.includes('cross-origin')) {
      return NotionErrorType.CORS;
    }
    
    if (message.includes('unauthorized') || message.includes('token') || 
        message.includes('auth') || message.includes('401')) {
      return NotionErrorType.AUTH;
    }
    
    if (message.includes('forbidden') || message.includes('403') || 
        message.includes('permission') || message.includes('access')) {
      return NotionErrorType.PERMISSION;
    }
    
    if (message.includes('not found') || message.includes('404') || 
        message.includes('introuvable')) {
      return NotionErrorType.NOT_FOUND;
    }
    
    if (message.includes('validation') || message.includes('invalid') || 
        message.includes('required') || message.includes('400')) {
      return NotionErrorType.VALIDATION;
    }
    
    if (message.includes('rate limit') || message.includes('too many') || 
        message.includes('429')) {
      return NotionErrorType.RATE_LIMIT;
    }
    
    if (message.includes('network') || message.includes('connection') || 
        message.includes('fetch') || message.includes('timeout')) {
      return NotionErrorType.NETWORK;
    }
    
    if (message.includes('server') || message.includes('500') || 
        message.includes('502') || message.includes('503')) {
      return NotionErrorType.SERVER;
    }
    
    if (message.includes('database') || message.includes('record') || 
        message.includes('data')) {
      return NotionErrorType.DATABASE;
    }
    
    if (message.includes('api') || message.includes('endpoint')) {
      return NotionErrorType.API;
    }
    
    return NotionErrorType.UNKNOWN;
  }
  
  /**
   * Ajoute une erreur aux erreurs récentes
   */
  public addRecentError(error: NotionError): void {
    this.recentErrors.unshift(error);
    
    // Limiter le nombre d'erreurs récentes
    if (this.recentErrors.length > this.MAX_RECENT_ERRORS) {
      this.recentErrors.pop();
    }
  }
  
  /**
   * Récupère les erreurs récentes
   */
  public getRecentErrors(): NotionError[] {
    return [...this.recentErrors];
  }
  
  /**
   * Efface les erreurs récentes
   */
  public clearErrors(): void {
    this.recentErrors = [];
    this.notifySubscribers();
  }
  
  /**
   * S'abonne aux notifications d'erreurs
   */
  public subscribe(callback: ErrorSubscriber): () => void {
    this.subscribers.push(callback);
    
    // Notifier immédiatement l'abonné avec l'état actuel
    callback(this.recentErrors);
    
    // Retourner une fonction pour se désabonner
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index !== -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }
  
  /**
   * Notifie tous les abonnés
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(subscriber => {
      try {
        subscriber(this.getRecentErrors());
      } catch (e) {
        console.error('Erreur lors de la notification d\'un abonné:', e);
      }
    });
  }
  
  /**
   * Crée un message utilisateur à partir d'une erreur
   */
  public createUserFriendlyMessage(error: NotionError): string {
    switch (error.type) {
      case NotionErrorType.AUTH:
        return 'Erreur d\'authentification. Vérifiez votre clé API Notion.';
      case NotionErrorType.PERMISSION:
        return 'Erreur d\'autorisation. Votre intégration n\'a pas accès à cette ressource.';
      case NotionErrorType.NOT_FOUND:
        return 'Ressource introuvable. Vérifiez les identifiants.';
      case NotionErrorType.VALIDATION:
        return 'Données invalides. Vérifiez les informations saisies.';
      case NotionErrorType.RATE_LIMIT:
        return 'Limite de requêtes atteinte. Réessayez dans quelques instants.';
      case NotionErrorType.CORS:
        return 'Erreur CORS détectée. Utilisez le proxy pour les requêtes.';
      case NotionErrorType.NETWORK:
        return 'Erreur réseau. Vérifiez votre connexion internet.';
      case NotionErrorType.SERVER:
        return 'Erreur serveur Notion. Réessayez plus tard.';
      case NotionErrorType.DATABASE:
        return 'Erreur de base de données. La structure peut être incorrecte.';
      case NotionErrorType.API:
        return 'Erreur d\'API. Le format de la requête peut être incorrect.';
      default:
        return error.message || 'Une erreur inattendue est survenue.';
    }
  }
}

// Créer et exporter l'instance
export const notionErrorService = new NotionErrorService();
export default notionErrorService;
