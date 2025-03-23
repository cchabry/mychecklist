
import { 
  NotionError, 
  NotionErrorType, 
  NotionErrorSeverity, 
  NotionErrorOptions 
} from './types';

/**
 * Utilitaires pour le service de gestion d'erreurs Notion
 */
export const notionErrorUtils = {
  /**
   * Enrichit une erreur avec des informations supplémentaires
   */
  enhanceError(error: Error, context: Record<string, any> = {}): NotionError {
    // Vérifier si l'erreur est déjà une erreur Notion
    if ('type' in error && 'severity' in error && 'recoverable' in error) {
      return error as NotionError;
    }
    
    // Déterminer le type d'erreur
    const errorType = this.determineErrorType(error);
    
    // Déterminer la gravité
    const severity = this.determineErrorSeverity(errorType, error);
    
    // Déterminer si l'erreur est récupérable
    const recoverable = this.isErrorRecoverable(errorType);
    
    // Déterminer les actions de récupération possibles
    const recoveryActions = this.getRecoveryActions(errorType);
    
    // Créer l'erreur enrichie
    const enhancedError = error as NotionError;
    enhancedError.type = errorType;
    enhancedError.severity = severity;
    enhancedError.context = context;
    enhancedError.recoverable = recoverable;
    enhancedError.recoveryActions = recoveryActions;
    enhancedError.timestamp = new Date();
    enhancedError.originalError = error;
    
    return enhancedError;
  },
  
  /**
   * Crée une nouvelle erreur Notion
   */
  createError(message: string, options: NotionErrorOptions = {}): NotionError {
    const {
      type = NotionErrorType.UNKNOWN,
      severity = NotionErrorSeverity.ERROR,
      code,
      context,
      originalError,
      recoveryActions = [],
      recoverable = false
    } = options;
    
    const error = new Error(message) as NotionError;
    error.type = type;
    error.severity = severity;
    error.code = code;
    error.context = context || {};
    error.originalError = originalError;
    error.recoveryActions = recoveryActions;
    error.recoverable = recoverable;
    error.timestamp = new Date();
    
    return error;
  },
  
  /**
   * Détermine le type d'erreur
   */
  determineErrorType(error: Error): NotionErrorType {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || 
        message.includes('fetch') || 
        message.includes('connection') ||
        message.includes('timeout') ||
        message.includes('cors')) {
      return NotionErrorType.NETWORK;
    }
    
    if (message.includes('auth') || 
        message.includes('token') || 
        message.includes('401')) {
      return NotionErrorType.AUTH;
    }
    
    if (message.includes('permission') || 
        message.includes('access') || 
        message.includes('403')) {
      return NotionErrorType.PERMISSION;
    }
    
    if (message.includes('limit') || 
        message.includes('rate') || 
        message.includes('429')) {
      return NotionErrorType.RATE_LIMIT;
    }
    
    if (message.includes('valid') || 
        message.includes('schema') || 
        message.includes('400')) {
      return NotionErrorType.VALIDATION;
    }
    
    if (message.includes('database') || 
        message.includes('query') || 
        message.includes('500')) {
      return NotionErrorType.DATABASE;
    }
    
    return NotionErrorType.UNKNOWN;
  },
  
  /**
   * Détermine la gravité de l'erreur
   */
  determineErrorSeverity(type: NotionErrorType, error: Error): NotionErrorSeverity {
    switch (type) {
      case NotionErrorType.AUTH:
      case NotionErrorType.PERMISSION:
        return NotionErrorSeverity.ERROR;
        
      case NotionErrorType.NETWORK:
        // Les erreurs réseau peuvent être temporaires
        if (error.message.includes('timeout')) {
          return NotionErrorSeverity.WARNING;
        }
        return NotionErrorSeverity.ERROR;
        
      case NotionErrorType.RATE_LIMIT:
        return NotionErrorSeverity.WARNING;
        
      case NotionErrorType.VALIDATION:
        return NotionErrorSeverity.WARNING;
        
      case NotionErrorType.DATABASE:
        return NotionErrorSeverity.ERROR;
        
      case NotionErrorType.UNKNOWN:
      default:
        // Par défaut, considérer comme une erreur
        return NotionErrorSeverity.ERROR;
    }
  },
  
  /**
   * Détermine si l'erreur est récupérable automatiquement
   */
  isErrorRecoverable(type: NotionErrorType): boolean {
    switch (type) {
      case NotionErrorType.NETWORK:
      case NotionErrorType.RATE_LIMIT:
        // Ces erreurs sont généralement temporaires
        return true;
        
      case NotionErrorType.AUTH:
      case NotionErrorType.PERMISSION:
      case NotionErrorType.VALIDATION:
      case NotionErrorType.DATABASE:
      case NotionErrorType.UNKNOWN:
      default:
        // Ces erreurs nécessitent généralement une intervention
        return false;
    }
  },
  
  /**
   * Obtient les actions de récupération possibles
   */
  getRecoveryActions(type: NotionErrorType): string[] {
    switch (type) {
      case NotionErrorType.NETWORK:
        return [
          'Vérifier la connexion Internet',
          'Réessayer ultérieurement',
          'Basculer en mode démonstration'
        ];
        
      case NotionErrorType.AUTH:
        return [
          'Vérifier la clé API Notion',
          'Reconfigurer l\'intégration Notion',
          'Basculer en mode démonstration'
        ];
        
      case NotionErrorType.PERMISSION:
        return [
          'Vérifier les permissions de l\'intégration Notion',
          'Partager la base de données avec l\'intégration',
          'Basculer en mode démonstration'
        ];
        
      case NotionErrorType.RATE_LIMIT:
        return [
          'Attendre et réessayer ultérieurement',
          'Réduire la fréquence des requêtes',
          'Basculer en mode démonstration'
        ];
        
      case NotionErrorType.VALIDATION:
        return [
          'Vérifier les données envoyées',
          'Consulter la documentation de l\'API Notion'
        ];
        
      case NotionErrorType.DATABASE:
        return [
          'Vérifier la structure de la base de données',
          'Utiliser les outils de diagnostic',
          'Basculer en mode démonstration'
        ];
        
      case NotionErrorType.UNKNOWN:
      default:
        return [
          'Consulter les logs pour plus d\'informations',
          'Basculer en mode démonstration'
        ];
    }
  }
};
