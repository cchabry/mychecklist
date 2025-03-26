
/**
 * Service centralisé pour la gestion des erreurs Notion
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  NotionError, 
  NotionErrorType, 
  NotionErrorSeverity, 
  NotionErrorOptions,
  ErrorSubscriber
} from '../types/unified';

// Stockage local des erreurs récentes
let recentErrors: NotionError[] = [];

// Liste des abonnés aux changements d'erreurs
const subscribers: Array<{ id: string; callback: ErrorSubscriber }> = [];

// Configuration
const MAX_ERROR_HISTORY = 50;

/**
 * Service de gestion des erreurs Notion
 */
export const notionErrorService = {
  /**
   * Crée un objet d'erreur Notion standardisé
   */
  createError(
    messageOrError: string | Error,
    type: NotionErrorType = NotionErrorType.UNKNOWN,
    options: NotionErrorOptions = {}
  ): NotionError {
    // Récupérer le message d'erreur
    const message = typeof messageOrError === 'string' 
      ? messageOrError 
      : messageOrError.message || 'Erreur inconnue';
    
    // Créer l'objet d'erreur
    const error: NotionError = {
      id: uuidv4(),
      message,
      type: type || options.type || NotionErrorType.UNKNOWN,
      severity: options.severity || NotionErrorSeverity.ERROR,
      timestamp: Date.now(),
      retryable: options.retryable ?? false,
      context: options.context,
      details: options.details,
      operation: options.operation,
      recoverable: options.recoverable,
      recoveryActions: options.recoveryActions
    };
    
    // Ajouter la stack trace si disponible
    if (options.stack) {
      error.stack = options.stack;
    } else if (typeof messageOrError === 'object' && messageOrError instanceof Error) {
      error.stack = messageOrError.stack;
    }
    
    // Ajouter l'erreur originale
    if (typeof messageOrError === 'object' && messageOrError instanceof Error) {
      error.originalError = messageOrError;
    } else if (options.cause) {
      error.cause = options.cause;
    }
    
    return error;
  },
  
  /**
   * Ajoute une erreur à l'historique et notifie les abonnés
   */
  reportError(
    error: Error | string,
    context: string = '',
    options: NotionErrorOptions = {}
  ): NotionError {
    // Créer l'objet d'erreur normalisé
    const errorType = this.identifyErrorType(error);
    const notionError = this.createError(error, errorType, {
      ...options,
      context: context || options.context
    });
    
    // Ajouter l'erreur à l'historique
    recentErrors.unshift(notionError);
    
    // Limiter la taille de l'historique
    if (recentErrors.length > MAX_ERROR_HISTORY) {
      recentErrors = recentErrors.slice(0, MAX_ERROR_HISTORY);
    }
    
    // Notifier les abonnés
    subscribers.forEach(sub => {
      try {
        sub.callback([...recentErrors]);
      } catch (e) {
        console.error('Erreur lors de la notification d\'un abonné:', e);
      }
    });
    
    return notionError;
  },
  
  /**
   * Identifie le type d'erreur
   */
  identifyErrorType(error: Error | string): NotionErrorType {
    const message = typeof error === 'string' 
      ? error.toLowerCase() 
      : error.message?.toLowerCase() || '';
    
    // Erreur CORS
    if (message.includes('cors') || message.includes('cross-origin') || message.includes('cross origin')) {
      return NotionErrorType.CORS;
    }
    
    // Erreur d'authentification
    if (message.includes('unauthorized') || message.includes('token') || message.includes('auth') || message.includes('401')) {
      return NotionErrorType.AUTH;
    }
    
    // Erreur de permission
    if (message.includes('permission') || message.includes('access denied') || message.includes('403')) {
      return NotionErrorType.PERMISSION;
    }
    
    // Erreur 404
    if (message.includes('not found') || message.includes('404')) {
      return NotionErrorType.NOT_FOUND;
    }
    
    // Erreur de validation
    if (message.includes('validation') || message.includes('invalid') || message.includes('required') || message.includes('400')) {
      return NotionErrorType.VALIDATION;
    }
    
    // Erreur de limite de taux
    if (message.includes('rate limit') || message.includes('too many requests') || message.includes('429')) {
      return NotionErrorType.RATE_LIMIT;
    }
    
    // Erreur de timeout
    if (message.includes('timeout') || message.includes('timed out')) {
      return NotionErrorType.TIMEOUT;
    }
    
    // Erreur réseau
    if (message.includes('network') || message.includes('connection') || message.includes('fetch') || message.includes('offline')) {
      return NotionErrorType.NETWORK;
    }
    
    // Erreur serveur
    if (message.includes('server') || message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504')) {
      return NotionErrorType.SERVER;
    }
    
    // Type inconnu par défaut
    return NotionErrorType.UNKNOWN;
  },
  
  /**
   * Récupère les erreurs récentes
   */
  getRecentErrors(): NotionError[] {
    return [...recentErrors];
  },
  
  /**
   * Efface toutes les erreurs
   */
  clearErrors(): void {
    if (recentErrors.length === 0) return;
    
    recentErrors = [];
    
    // Notifier les abonnés
    subscribers.forEach(sub => {
      try {
        sub.callback([]);
      } catch (e) {
        console.error('Erreur lors de la notification d\'un abonné:', e);
      }
    });
  },
  
  /**
   * S'abonner aux changements d'erreurs
   */
  subscribe(callback: ErrorSubscriber): () => void {
    const id = uuidv4();
    subscribers.push({ id, callback });
    
    // Retourner une fonction pour se désabonner
    return () => {
      const index = subscribers.findIndex(sub => sub.id === id);
      if (index !== -1) {
        subscribers.splice(index, 1);
      }
    };
  },
  
  /**
   * Crée un message utilisateur à partir d'une erreur
   */
  createUserFriendlyMessage(error: NotionError): string {
    // Personnaliser le message en fonction du type d'erreur
    switch (error.type) {
      case NotionErrorType.AUTH:
        return 'Problème d\'authentification Notion. Veuillez vérifier votre clé API.';
        
      case NotionErrorType.PERMISSION:
        return 'Vous n\'avez pas les autorisations nécessaires pour accéder à cette ressource Notion.';
        
      case NotionErrorType.NETWORK:
        return 'Problème de connexion au serveur Notion. Vérifiez votre connexion Internet.';
        
      case NotionErrorType.TIMEOUT:
        return 'La requête Notion a pris trop de temps. Veuillez réessayer.';
        
      case NotionErrorType.RATE_LIMIT:
        return 'Limite de requêtes Notion atteinte. Veuillez patienter un moment.';
        
      case NotionErrorType.DATABASE:
        return 'Problème avec la base de données Notion. Vérifiez son identifiant et vos permissions.';
        
      case NotionErrorType.NOT_FOUND:
        return 'Ressource Notion introuvable. Vérifiez les identifiants utilisés.';
        
      case NotionErrorType.CORS:
        return 'Problème d\'accès CORS à l\'API Notion. Utilisez un proxy ou une fonction serveur.';
        
      default:
        return error.message || 'Une erreur est survenue lors de l\'interaction avec Notion.';
    }
  }
};

// Export par défaut pour la compatibilité
export default notionErrorService;
