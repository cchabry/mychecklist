
/**
 * Service centralisé pour la gestion des erreurs Notion
 */

import { 
  NotionError, 
  NotionErrorType, 
  NotionErrorSeverity,
  NotionErrorOptions,
  ErrorSubscriber,
  createNotionError,
  mapLegacyError 
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
    return createNotionError(messageOrError, options);
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
    const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
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
  },
  
  /**
   * Récupère l'erreur la plus récente
   */
  getLastError(): NotionError | null {
    return recentErrors.length > 0 ? recentErrors[0] : null;
  },
  
  // Ajout pour compatibilité avec l'ancien service
  identifyErrorType(error: Error): NotionErrorType {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('failed to fetch') || 
        message.includes('fetch') || message.includes('connection')) {
      return NotionErrorType.NETWORK;
    }
    
    if (message.includes('unauthorized') || message.includes('auth') || 
        message.includes('token') || message.includes('401')) {
      return NotionErrorType.AUTH;
    }
    
    if (message.includes('forbidden') || message.includes('permission') || 
        message.includes('403')) {
      return NotionErrorType.PERMISSION;
    }
    
    if (message.includes('not found') || message.includes('404') || 
        message.includes('introuvable')) {
      return NotionErrorType.NOT_FOUND;
    }
    
    if (message.includes('timeout') || message.includes('délai')) {
      return NotionErrorType.TIMEOUT;
    }
    
    if (message.includes('rate limit') || message.includes('429') || 
        message.includes('trop de requêtes')) {
      return NotionErrorType.RATE_LIMIT;
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return NotionErrorType.VALIDATION;
    }
    
    if (message.includes('cors') || message.includes('cross-origin')) {
      return NotionErrorType.CORS;
    }
    
    if (message.includes('database') || message.includes('base de données')) {
      return NotionErrorType.DATABASE;
    }
    
    return NotionErrorType.UNKNOWN;
  },
  
  // Pour compatibilité avec l'ancien service
  addRecentError(error: Error | any): void {
    const convertedError = typeof error === 'object' && error.type
      ? mapLegacyError(error)
      : this.createError(error instanceof Error ? error : String(error));
    
    this.reportError(convertedError);
  },
  
  getFriendlyMessage(error: any): string {
    // Convertir en NotionError si nécessaire
    const notionError = typeof error === 'object' && error.type
      ? mapLegacyError(error)
      : this.createError(error instanceof Error ? error : String(error));
      
    return this.createUserFriendlyMessage(notionError);
  }
};

export default notionErrorService;
