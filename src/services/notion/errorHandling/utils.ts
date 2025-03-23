
import { 
  NotionError, 
  NotionErrorOptions, 
  NotionErrorType, 
  NotionErrorSeverity 
} from './types';

/**
 * Utilitaires pour la gestion des erreurs Notion
 */
class NotionErrorUtils {
  /**
   * Crée une erreur Notion enrichie
   */
  public createError(message: string, options: NotionErrorOptions = {}): NotionError {
    const {
      type = NotionErrorType.UNKNOWN,
      severity = NotionErrorSeverity.ERROR,
      cause,
      context = {},
      recoverable = false,
      recoveryActions = []
    } = options;
    
    // Créer l'objet d'erreur
    const error = new Error(message) as NotionError;
    
    // Enrichir avec les propriétés Notion
    error.name = 'NotionError';
    error.type = type;
    error.severity = severity;
    error.context = context;
    error.timestamp = new Date();
    error.recoverable = recoverable;
    error.recoveryActions = [...recoveryActions];
    
    // Ajouter l'action de fallback au mode démo si pertinent
    if (recoverable && !recoveryActions.includes('Passer en mode démonstration')) {
      error.recoveryActions.push('Passer en mode démonstration');
    }
    
    // Conserver la cause originale
    if (cause) {
      error.cause = cause;
      
      // Copier la stack trace si disponible
      if (cause.stack && !error.stack) {
        error.stack = cause.stack;
      }
    }
    
    return error;
  }
  
  /**
   * Détermine le type d'erreur en fonction du message ou de l'objet
   */
  public determineErrorType(error: Error | any): NotionErrorType {
    const message = error.message || String(error);
    const status = error.status || error.statusCode;
    
    // Vérifier le code de statut HTTP
    if (status === 401 || status === 403) {
      return NotionErrorType.AUTH;
    } else if (status === 404) {
      return NotionErrorType.DATABASE;
    } else if (status === 429) {
      return NotionErrorType.RATE_LIMIT;
    }
    
    // Vérifier le message d'erreur
    if (
      message.includes('unauthorized') || 
      message.includes('authentication') || 
      message.includes('auth') || 
      message.includes('token')
    ) {
      return NotionErrorType.AUTH;
    } else if (
      message.includes('permission') || 
      message.includes('access denied')
    ) {
      return NotionErrorType.PERMISSION;
    } else if (
      message.includes('rate limit') || 
      message.includes('too many requests') || 
      message.includes('429')
    ) {
      return NotionErrorType.RATE_LIMIT;
    } else if (
      message.includes('validation') || 
      message.includes('invalid') || 
      message.includes('format')
    ) {
      return NotionErrorType.VALIDATION;
    } else if (
      message.includes('database') || 
      message.includes('not found') || 
      message.includes('404')
    ) {
      return NotionErrorType.DATABASE;
    } else if (
      message.includes('network') || 
      message.includes('connection') || 
      message.includes('failed to fetch') || 
      message.includes('timeout')
    ) {
      return NotionErrorType.NETWORK;
    }
    
    return NotionErrorType.UNKNOWN;
  }
  
  /**
   * Détermine la sévérité de l'erreur
   */
  public determineSeverity(errorType: NotionErrorType): NotionErrorSeverity {
    switch (errorType) {
      case NotionErrorType.NETWORK:
      case NotionErrorType.AUTH:
        return NotionErrorSeverity.ERROR;
        
      case NotionErrorType.PERMISSION:
      case NotionErrorType.DATABASE:
        return NotionErrorSeverity.WARNING;
        
      case NotionErrorType.RATE_LIMIT:
        return NotionErrorSeverity.INFO;
        
      case NotionErrorType.VALIDATION:
        return NotionErrorSeverity.WARNING;
        
      case NotionErrorType.UNKNOWN:
      default:
        return NotionErrorSeverity.ERROR;
    }
  }
  
  /**
   * Vérifie si une erreur est récupérable
   */
  public isRecoverable(errorType: NotionErrorType): boolean {
    // La plupart des erreurs peuvent être récupérées en passant en mode démo
    return [
      NotionErrorType.NETWORK,
      NotionErrorType.AUTH,
      NotionErrorType.PERMISSION,
      NotionErrorType.RATE_LIMIT
    ].includes(errorType);
  }
  
  /**
   * Suggestions d'actions de récupération pour chaque type d'erreur
   */
  public getRecoveryActions(errorType: NotionErrorType): string[] {
    const commonActions = ['Passer en mode démonstration'];
    
    switch (errorType) {
      case NotionErrorType.NETWORK:
        return [
          'Vérifier votre connexion Internet',
          'Vérifier le statut du proxy Notion',
          ...commonActions
        ];
        
      case NotionErrorType.AUTH:
        return [
          'Vérifier votre token d\'API',
          'Reconfigurer l\'intégration Notion',
          ...commonActions
        ];
        
      case NotionErrorType.PERMISSION:
        return [
          'Vérifier les permissions de l\'intégration',
          'Ajouter l\'intégration à la base de données',
          ...commonActions
        ];
        
      case NotionErrorType.RATE_LIMIT:
        return [
          'Attendre et réessayer plus tard',
          'Optimiser le nombre d\'appels API',
          ...commonActions
        ];
        
      case NotionErrorType.DATABASE:
        return [
          'Vérifier l\'ID de la base de données',
          'Vérifier que la base existe',
          ...commonActions
        ];
        
      default:
        return commonActions;
    }
  }
}

// Exporter l'instance
export const notionErrorUtils = new NotionErrorUtils();
