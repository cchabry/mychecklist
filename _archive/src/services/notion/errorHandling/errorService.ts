
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
      type: options.type || NotionErrorType.UNKNOWN,
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
    context?: string | Record<string, any>,
    options: NotionErrorOptions = {}
  ): NotionError {
    // Créer l'objet d'erreur normalisé
    const notionError = this.createError(error, {
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
        
      default:
        return error.message || 'Une erreur est survenue lors de l\'interaction avec Notion.';
    }
  }
};
