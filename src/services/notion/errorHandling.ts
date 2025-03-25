
/**
 * Service de gestion des erreurs Notion
 */

import { toast } from 'sonner';

// Types d'erreurs
export enum NotionErrorType {
  AUTH = 'auth',
  NOT_FOUND = 'not_found',
  VALIDATION = 'validation',
  RATE_LIMIT = 'rate_limit',
  CORS = 'cors',
  NETWORK = 'network',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}

// Interface d'erreur
export interface NotionError {
  type: NotionErrorType;
  message: string;
  originalError?: any;
  endpoint?: string;
  status?: number;
  timestamp: number;
}

// Abonnés aux erreurs
type ErrorSubscriber = (error: NotionError) => void;
const subscribers: ErrorSubscriber[] = [];

// Dernières erreurs
const recentErrors: NotionError[] = [];
const MAX_RECENT_ERRORS = 10;

// Service de gestion des erreurs
export const notionErrorService = {
  /**
   * Signale une erreur
   */
  reportError(error: Error, context: string = ''): NotionError {
    // Identifier le type d'erreur
    const type = this.identifyErrorType(error);
    
    // Créer l'objet d'erreur
    const notionError: NotionError = {
      type,
      message: error.message,
      originalError: error,
      endpoint: context,
      timestamp: Date.now()
    };
    
    // Enregistrer l'erreur
    this.addRecentError(notionError);
    
    // Log de l'erreur
    console.error(`Notion API Error [${type}]: ${error.message}`, error);
    
    // Notifier les abonnés
    this.notifySubscribers(notionError);
    
    // Si c'est une erreur CORS, afficher un toast spécifique
    if (type === NotionErrorType.CORS) {
      toast.error('Erreur CORS détectée', {
        description: 'Problème d\'accès à l\'API Notion. Assurez-vous d\'utiliser le proxy.',
        duration: 5000
      });
    }
    
    return notionError;
  },
  
  /**
   * Identifie le type d'erreur
   */
  identifyErrorType(error: Error): NotionErrorType {
    const message = error.message.toLowerCase();
    
    // Erreur CORS
    if (message.includes('cors') || message.includes('cross-origin') || message.includes('cross origin')) {
      return NotionErrorType.CORS;
    }
    
    // Erreur d'authentification
    if (message.includes('unauthorized') || message.includes('token') || message.includes('auth') || message.includes('401')) {
      return NotionErrorType.AUTH;
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
    
    // Erreur réseau
    if (message.includes('network') || message.includes('connection') || message.includes('fetch') || message.includes('timeout')) {
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
   * Ajoute une erreur à la liste des erreurs récentes
   */
  addRecentError(error: NotionError): void {
    recentErrors.unshift(error);
    
    // Limiter le nombre d'erreurs récentes
    if (recentErrors.length > MAX_RECENT_ERRORS) {
      recentErrors.pop();
    }
  },
  
  /**
   * Récupère les erreurs récentes
   */
  getRecentErrors(): NotionError[] {
    return [...recentErrors];
  },
  
  /**
   * Efface les erreurs récentes
   */
  clearRecentErrors(): void {
    recentErrors.length = 0;
  },
  
  /**
   * S'abonne aux notifications d'erreurs
   */
  subscribe(callback: ErrorSubscriber): () => void {
    subscribers.push(callback);
    
    // Retourner une fonction pour se désabonner
    return () => {
      const index = subscribers.indexOf(callback);
      if (index !== -1) {
        subscribers.splice(index, 1);
      }
    };
  },
  
  /**
   * Notifie tous les abonnés d'une erreur
   */
  notifySubscribers(error: NotionError): void {
    subscribers.forEach(subscriber => {
      try {
        subscriber(error);
      } catch (e) {
        console.error('Erreur lors de la notification d\'un abonné aux erreurs:', e);
      }
    });
  },
  
  /**
   * Génère un message d'erreur convivial
   */
  getFriendlyMessage(error: NotionError): string {
    switch (error.type) {
      case NotionErrorType.AUTH:
        return 'Erreur d\'authentification. Vérifiez votre clé API Notion.';
      case NotionErrorType.NOT_FOUND:
        return 'Ressource introuvable. Vérifiez les identifiants.';
      case NotionErrorType.VALIDATION:
        return 'Données invalides. Vérifiez les informations saisies.';
      case NotionErrorType.RATE_LIMIT:
        return 'Limite de requêtes atteinte. Réessayez dans quelques instants.';
      case NotionErrorType.CORS:
        return 'Erreur CORS détectée. Utilisez le proxy Netlify pour les requêtes.';
      case NotionErrorType.NETWORK:
        return 'Erreur réseau. Vérifiez votre connexion internet.';
      case NotionErrorType.SERVER:
        return 'Erreur serveur Notion. Réessayez plus tard.';
      default:
        return error.message || 'Une erreur inattendue est survenue.';
    }
  }
};

export default notionErrorService;
