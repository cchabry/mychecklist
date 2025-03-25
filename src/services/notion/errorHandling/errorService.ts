
/**
 * Service de gestion des erreurs Notion
 */
import { v4 as uuidv4 } from 'uuid';
import { 
  NotionError, 
  NotionErrorType, 
  NotionErrorSeverity,
  NotionErrorOptions 
} from '../types/unified';

// Type pour les abonnés aux erreurs
type ErrorSubscriber = (errors: NotionError[]) => void;

class NotionErrorService {
  private recentErrors: NotionError[] = [];
  private subscribers: ErrorSubscriber[] = [];
  private readonly MAX_RECENT_ERRORS = 50;

  /**
   * Crée une erreur Notion
   */
  public createError(message: string, options: NotionErrorOptions = {}): NotionError {
    const error: NotionError = {
      id: uuidv4(),
      type: options.type || NotionErrorType.UNKNOWN,
      message,
      severity: options.severity || NotionErrorSeverity.ERROR,
      originalError: options.originalError,
      context: options.context,
      retryable: options.retryable ?? this.isErrorRetryable(options.type || NotionErrorType.UNKNOWN),
      endpoint: options.endpoint,
      status: options.status,
      timestamp: Date.now()
    };
    
    return error;
  }

  /**
   * Signale une erreur
   */
  public reportError(
    error: Error | string, 
    context: string = '', 
    options: Partial<NotionErrorOptions> = {}
  ): NotionError {
    // Extraire le message d'erreur
    const message = typeof error === 'string' ? error : error.message;
    
    // Identifier le type d'erreur si non spécifié
    const type = options.type || this.identifyErrorType(error);
    
    // Créer l'objet d'erreur
    const notionError = this.createError(message, {
      type,
      originalError: typeof error === 'string' ? new Error(error) : error,
      context,
      endpoint: options.endpoint,
      status: options.status,
      severity: options.severity
    });
    
    // Enregistrer l'erreur
    this.addRecentError(notionError);
    
    // Log de l'erreur
    console.error(`Notion API Error [${type}]:`, message, error);
    
    // Notifier les abonnés
    this.notifySubscribers();
    
    return notionError;
  }

  /**
   * Identifie le type d'erreur en fonction de son message
   */
  public identifyErrorType(error: Error | string): NotionErrorType {
    const message = typeof error === 'string' ? error : error.message;
    const lowerMessage = message.toLowerCase();
    
    // Erreur d'authentification
    if (lowerMessage.includes('unauthorized') || 
        lowerMessage.includes('token') || 
        lowerMessage.includes('auth') || 
        lowerMessage.includes('401')) {
      return NotionErrorType.AUTH;
    }
    
    // Erreur de permission
    if (lowerMessage.includes('permission') || 
        lowerMessage.includes('access') || 
        lowerMessage.includes('forbidden') ||
        lowerMessage.includes('403')) {
      return NotionErrorType.PERMISSION;
    }
    
    // Erreur 404
    if (lowerMessage.includes('not found') || 
        lowerMessage.includes('introuvable') || 
        lowerMessage.includes('404')) {
      return NotionErrorType.NOT_FOUND;
    }
    
    // Erreur de validation
    if (lowerMessage.includes('validation') || 
        lowerMessage.includes('invalid') || 
        lowerMessage.includes('required') || 
        lowerMessage.includes('400')) {
      return NotionErrorType.VALIDATION;
    }
    
    // Erreur de limite de taux
    if (lowerMessage.includes('rate limit') || 
        lowerMessage.includes('too many requests') || 
        lowerMessage.includes('429')) {
      return NotionErrorType.RATE_LIMIT;
    }
    
    // Erreur de timeout
    if (lowerMessage.includes('timeout') || 
        lowerMessage.includes('timed out')) {
      return NotionErrorType.TIMEOUT;
    }
    
    // Erreur CORS
    if (lowerMessage.includes('cors') || 
        lowerMessage.includes('cross-origin')) {
      return NotionErrorType.CORS;
    }
    
    // Erreur réseau
    if (lowerMessage.includes('network') || 
        lowerMessage.includes('connection') || 
        lowerMessage.includes('fetch') || 
        lowerMessage.includes('offline')) {
      return NotionErrorType.NETWORK;
    }
    
    // Erreur serveur
    if (lowerMessage.includes('server') || 
        lowerMessage.includes('500') || 
        lowerMessage.includes('502') || 
        lowerMessage.includes('503') || 
        lowerMessage.includes('504')) {
      return NotionErrorType.SERVER;
    }
    
    // Erreur de base de données
    if (lowerMessage.includes('database') || 
        lowerMessage.includes('table') || 
        lowerMessage.includes('column') || 
        lowerMessage.includes('query')) {
      return NotionErrorType.DATABASE;
    }
    
    // Type inconnu par défaut
    return NotionErrorType.UNKNOWN;
  }

  /**
   * Détermine si une erreur peut être réessayée automatiquement
   */
  private isErrorRetryable(type: NotionErrorType): boolean {
    switch (type) {
      case NotionErrorType.NETWORK:
      case NotionErrorType.TIMEOUT:
      case NotionErrorType.RATE_LIMIT:
      case NotionErrorType.SERVER:
        return true;
      default:
        return false;
    }
  }

  /**
   * Ajoute une erreur à la liste des erreurs récentes
   */
  private addRecentError(error: NotionError): void {
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
   * Efface toutes les erreurs
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
    
    // Retourner une fonction pour se désabonner
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index !== -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Notifie tous les abonnés d'une mise à jour des erreurs
   */
  private notifySubscribers(): void {
    const errors = this.getRecentErrors();
    for (const subscriber of this.subscribers) {
      try {
        subscriber(errors);
      } catch (e) {
        console.error('Erreur lors de la notification d\'un abonné aux erreurs:', e);
      }
    }
  }

  /**
   * Génère un message d'erreur utilisateur convivial
   */
  public createUserFriendlyMessage(error: NotionError): string {
    switch (error.type) {
      case NotionErrorType.AUTH:
        return 'Erreur d\'authentification. Vérifiez votre clé API Notion.';
      case NotionErrorType.PERMISSION:
        return 'Erreur de permission. Vous n\'avez pas les droits nécessaires pour cette opération.';
      case NotionErrorType.NOT_FOUND:
        return 'Ressource introuvable. Vérifiez les identifiants Notion.';
      case NotionErrorType.VALIDATION:
        return 'Données invalides. Vérifiez les informations saisies.';
      case NotionErrorType.RATE_LIMIT:
        return 'Limite de requêtes atteinte. Réessayez dans quelques instants.';
      case NotionErrorType.TIMEOUT:
        return 'Délai d\'attente dépassé. L\'opération a pris trop de temps.';
      case NotionErrorType.CORS:
        return 'Erreur CORS détectée. Utilisez le proxy pour les requêtes.';
      case NotionErrorType.NETWORK:
        return 'Erreur réseau. Vérifiez votre connexion internet.';
      case NotionErrorType.SERVER:
        return 'Erreur serveur Notion. Réessayez plus tard.';
      case NotionErrorType.DATABASE:
        return 'Erreur de base de données Notion. Vérifiez la structure des données.';
      default:
        return error.message || 'Une erreur inattendue est survenue.';
    }
  }
}

// Exporter une instance unique du service
export const notionErrorService = new NotionErrorService();
