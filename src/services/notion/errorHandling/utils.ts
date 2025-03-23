
import { 
  NotionError, 
  NotionErrorType, 
  NotionErrorSeverity,
  NotionErrorOptions
} from './types';

/**
 * Utilitaires pour la gestion des erreurs Notion
 */
export const notionErrorUtils = {
  /**
   * Crée une erreur Notion enrichie
   */
  createError(message: string, options: NotionErrorOptions = {}): NotionError {
    const {
      type = NotionErrorType.UNKNOWN,
      severity = NotionErrorSeverity.ERROR,
      cause,
      context = {},
      recoverable = false,
      recoveryActions = []
    } = options;
    
    // Créer l'erreur
    const error: NotionError = {
      name: 'NotionError',
      message,
      type,
      severity,
      recoverable,
      recoveryActions,
      context,
      timestamp: new Date(),
      stack: cause?.stack || new Error().stack || '',
    };
    
    return error;
  },
  
  /**
   * Enrichit une erreur existante avec des informations Notion
   */
  enhanceError(error: Error, context: Record<string, any> = {}): NotionError {
    // Si c'est déjà une NotionError, simplement étendre le contexte
    if ('type' in error && 'severity' in error) {
      const notionError = error as unknown as NotionError;
      notionError.context = { ...notionError.context, ...context };
      return notionError;
    }
    
    // Déterminer le type et la gravité en fonction du message
    const type = this.determineErrorType(error);
    const severity = this.determineSeverity(type);
    
    // Créer une nouvelle erreur enrichie
    return this.createError(error.message, {
      type,
      severity,
      cause: error,
      context,
      recoverable: this.isRecoverable(type),
      recoveryActions: this.getRecoveryActions(type)
    });
  },
  
  /**
   * Détermine le type d'erreur en fonction du message
   */
  determineErrorType(error: Error): NotionErrorType {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('réseau')) {
      return NotionErrorType.NETWORK;
    }
    
    if (message.includes('auth') || message.includes('401') || message.includes('authentification')) {
      return NotionErrorType.AUTH;
    }
    
    if (message.includes('permission') || message.includes('403') || message.includes('access')) {
      return NotionErrorType.PERMISSION;
    }
    
    if (message.includes('rate') || message.includes('limit') || message.includes('429')) {
      return NotionErrorType.RATE_LIMIT;
    }
    
    if (message.includes('validation') || message.includes('invalid') || message.includes('400')) {
      return NotionErrorType.VALIDATION;
    }
    
    if (message.includes('database') || message.includes('db') || message.includes('query')) {
      return NotionErrorType.DATABASE;
    }
    
    return NotionErrorType.UNKNOWN;
  },
  
  /**
   * Détermine la gravité en fonction du type d'erreur
   */
  determineSeverity(type: NotionErrorType): NotionErrorSeverity {
    switch (type) {
      case NotionErrorType.AUTH:
      case NotionErrorType.PERMISSION:
        return NotionErrorSeverity.ERROR;
        
      case NotionErrorType.NETWORK:
      case NotionErrorType.RATE_LIMIT:
        return NotionErrorSeverity.WARNING;
        
      case NotionErrorType.VALIDATION:
      case NotionErrorType.DATABASE:
        return NotionErrorSeverity.ERROR;
        
      case NotionErrorType.UNKNOWN:
      default:
        return NotionErrorSeverity.ERROR;
    }
  },
  
  /**
   * Détermine si une erreur est récupérable
   */
  isRecoverable(type: NotionErrorType): boolean {
    switch (type) {
      case NotionErrorType.NETWORK:
      case NotionErrorType.RATE_LIMIT:
        return true;
        
      case NotionErrorType.AUTH:
      case NotionErrorType.PERMISSION:
      case NotionErrorType.VALIDATION:
      case NotionErrorType.DATABASE:
        return false;
        
      case NotionErrorType.UNKNOWN:
      default:
        return false;
    }
  },
  
  /**
   * Obtient les actions de récupération possibles en fonction du type d'erreur
   */
  getRecoveryActions(type: NotionErrorType): string[] {
    switch (type) {
      case NotionErrorType.NETWORK:
        return [
          'Vérifier votre connexion internet',
          'Passer en mode démo pour continuer à travailler'
        ];
        
      case NotionErrorType.AUTH:
        return [
          'Vérifier votre token Notion',
          'Reconnecter votre compte Notion',
          'Passer en mode démo pour continuer à travailler'
        ];
        
      case NotionErrorType.PERMISSION:
        return [
          'Vérifier les permissions de votre intégration Notion',
          'Ajouter des pages à votre intégration',
          'Passer en mode démo pour continuer à travailler'
        ];
        
      case NotionErrorType.RATE_LIMIT:
        return [
          'Attendre quelques minutes et réessayer',
          'Passer en mode démo temporairement'
        ];
        
      case NotionErrorType.DATABASE:
      case NotionErrorType.VALIDATION:
      case NotionErrorType.UNKNOWN:
      default:
        return [];
    }
  }
};
