
import { toast } from 'sonner';

// Types d'erreurs possibles
export enum NotionErrorType {
  CONNECTION = 'CONNECTION',
  AUTHENTICATION = 'AUTHENTICATION',
  PERMISSION = 'PERMISSION',
  VALIDATION = 'VALIDATION',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

// Structure d'une erreur Notion
export interface NotionError {
  type: NotionErrorType;
  message: string;
  source?: string;
  timestamp: Date;
  originalError?: Error;
}

/**
 * Service centralisé de gestion des erreurs Notion
 */
class NotionErrorService {
  private recentErrors: NotionError[] = [];
  private subscribers: (() => void)[] = [];
  
  /**
   * Analyse une erreur et détermine son type
   */
  private categorizeError(error: Error, source?: string): NotionErrorType {
    const message = error.message.toLowerCase();
    
    if (message.includes('failed to fetch') || message.includes('network')) {
      return NotionErrorType.CONNECTION;
    }
    
    if (message.includes('unauthorized') || message.includes('401') || 
        message.includes('auth') || message.includes('token')) {
      return NotionErrorType.AUTHENTICATION;
    }
    
    if (message.includes('forbidden') || message.includes('403') || 
        message.includes('permission')) {
      return NotionErrorType.PERMISSION;
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return NotionErrorType.VALIDATION;
    }
    
    if (message.includes('rate limit') || message.includes('429')) {
      return NotionErrorType.RATE_LIMIT;
    }
    
    if (message.includes('500') || message.includes('server')) {
      return NotionErrorType.SERVER;
    }
    
    return NotionErrorType.UNKNOWN;
  }
  
  /**
   * Enregistre une erreur et notifie les abonnés
   */
  reportError(error: Error, source?: string): NotionError {
    const errorType = this.categorizeError(error, source);
    
    const notionError: NotionError = {
      type: errorType,
      message: error.message,
      source,
      timestamp: new Date(),
      originalError: error
    };
    
    // Ajouter l'erreur à la liste des erreurs récentes
    this.recentErrors.unshift(notionError);
    
    // Limiter la liste à 5 erreurs
    if (this.recentErrors.length > 5) {
      this.recentErrors.pop();
    }
    
    // Notifier les abonnés
    this.notifySubscribers();
    
    // Afficher un toast pour les erreurs importantes
    this.showErrorToast(notionError);
    
    return notionError;
  }
  
  /**
   * Affiche un toast adapté au type d'erreur
   */
  private showErrorToast(error: NotionError): void {
    let title = 'Erreur de connexion à Notion';
    let description = error.message;
    
    switch (error.type) {
      case NotionErrorType.CONNECTION:
        title = 'Erreur de connexion';
        description = 'Impossible de se connecter à l\'API Notion. Vérifiez votre connexion internet.';
        break;
      case NotionErrorType.AUTHENTICATION:
        title = 'Erreur d\'authentification';
        description = 'Votre clé API Notion semble invalide ou expirée.';
        break;
      case NotionErrorType.PERMISSION:
        title = 'Erreur de permission';
        description = 'Vous n\'avez pas les droits d\'accès nécessaires pour cette ressource Notion.';
        break;
      case NotionErrorType.RATE_LIMIT:
        title = 'Limite de requêtes dépassée';
        description = 'Vous avez atteint la limite de requêtes Notion. Veuillez réessayer plus tard.';
        break;
    }
    
    toast.error(title, {
      description
    });
  }
  
  /**
   * Notifie tous les abonnés d'un changement
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback());
  }
  
  /**
   * S'abonner aux notifications d'erreurs
   */
  subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    
    // Retourner une fonction pour se désabonner
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Récupérer les erreurs récentes
   */
  getRecentErrors(): NotionError[] {
    return [...this.recentErrors];
  }
  
  /**
   * Effacer les erreurs récentes
   */
  clearErrors(): void {
    this.recentErrors = [];
    this.notifySubscribers();
  }
}

// Exporter une instance singleton
export const notionErrorService = new NotionErrorService();

export default notionErrorService;
