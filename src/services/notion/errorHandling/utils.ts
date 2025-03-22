
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
    const error = new Error(message) as NotionError;
    
    // Définir les propriétés de base
    error.type = options.type || NotionErrorType.UNKNOWN;
    error.severity = options.severity || NotionErrorSeverity.ERROR;
    error.code = options.code;
    error.context = options.context || {};
    error.originalError = options.originalError;
    error.recoveryActions = options.recoveryActions || [];
    error.recoverable = options.recoverable !== undefined ? options.recoverable : true;
    error.timestamp = new Date();
    
    // Définir la stack trace
    if (options.originalError && options.originalError.stack) {
      error.stack = `NotionError: ${message}\n${options.originalError.stack.split('\n').slice(1).join('\n')}`;
    }
    
    return error;
  },
  
  /**
   * Détermine le type d'erreur en fonction de l'erreur brute
   */
  detectErrorType(error: Error): NotionErrorType {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();
    
    // Erreurs réseau
    if (
      message.includes('network') || 
      message.includes('offline') || 
      message.includes('failed to fetch') ||
      message.includes('timeout')
    ) {
      return NotionErrorType.NETWORK;
    }
    
    // Erreurs d'authentification
    if (
      message.includes('unauthorized') || 
      message.includes('auth') || 
      message.includes('token') ||
      message.includes('401')
    ) {
      return NotionErrorType.AUTH;
    }
    
    // Erreurs de permissions
    if (
      message.includes('permission') || 
      message.includes('forbidden') || 
      message.includes('access denied') ||
      message.includes('403')
    ) {
      return NotionErrorType.PERMISSION;
    }
    
    // Erreurs de limite de taux
    if (
      message.includes('rate limit') || 
      message.includes('too many requests') || 
      message.includes('429')
    ) {
      return NotionErrorType.RATE_LIMIT;
    }
    
    // Erreurs de validation
    if (
      message.includes('validation') || 
      message.includes('invalid') || 
      message.includes('parameter') ||
      message.includes('400')
    ) {
      return NotionErrorType.VALIDATION;
    }
    
    // Erreurs de base de données
    if (
      message.includes('database') || 
      message.includes('not found') || 
      message.includes('404')
    ) {
      return NotionErrorType.DATABASE;
    }
    
    // Par défaut
    return NotionErrorType.UNKNOWN;
  },
  
  /**
   * Détermine la gravité en fonction du type d'erreur
   */
  determineSeverity(type: NotionErrorType): NotionErrorSeverity {
    switch (type) {
      case NotionErrorType.NETWORK:
        return NotionErrorSeverity.WARNING;
        
      case NotionErrorType.AUTH:
      case NotionErrorType.PERMISSION:
        return NotionErrorSeverity.ERROR;
        
      case NotionErrorType.RATE_LIMIT:
        return NotionErrorSeverity.WARNING;
        
      case NotionErrorType.VALIDATION:
        return NotionErrorSeverity.ERROR;
        
      case NotionErrorType.DATABASE:
        return NotionErrorSeverity.ERROR;
        
      case NotionErrorType.UNKNOWN:
      default:
        return NotionErrorSeverity.ERROR;
    }
  },
  
  /**
   * Suggère des actions de récupération en fonction du type d'erreur
   */
  suggestRecoveryActions(type: NotionErrorType): string[] {
    switch (type) {
      case NotionErrorType.NETWORK:
        return [
          'Vérifier votre connexion internet',
          'Réessayer ultérieurement',
          'Passer en mode démonstration'
        ];
        
      case NotionErrorType.AUTH:
        return [
          'Vérifier votre token d\'API Notion',
          'Reconfigurer l\'intégration',
          'Passer en mode démonstration'
        ];
        
      case NotionErrorType.PERMISSION:
        return [
          'Vérifier les permissions de l\'intégration Notion',
          'Vérifier les accès aux bases de données',
          'Reconfigurer l\'intégration'
        ];
        
      case NotionErrorType.RATE_LIMIT:
        return [
          'Attendre quelques minutes avant de réessayer',
          'Réduire la fréquence des requêtes',
          'Passer temporairement en mode démonstration'
        ];
        
      case NotionErrorType.VALIDATION:
        return [
          'Vérifier les paramètres fournis',
          'Consulter la documentation de l\'API Notion'
        ];
        
      case NotionErrorType.DATABASE:
        return [
          'Vérifier les identifiants de base de données',
          'Vérifier que la base existe et est accessible',
          'Reconfigurer les bases de données'
        ];
        
      case NotionErrorType.UNKNOWN:
      default:
        return [
          'Réessayer ultérieurement',
          'Consulter les logs pour plus de détails',
          'Passer en mode démonstration'
        ];
    }
  },
  
  /**
   * Détermine si une erreur est récupérable
   */
  isRecoverable(type: NotionErrorType): boolean {
    // La plupart des erreurs sont récupérables sauf certaines
    return ![
      NotionErrorType.AUTH,
      NotionErrorType.PERMISSION
    ].includes(type);
  },
  
  /**
   * Enrichit une erreur brute avec des informations détaillées
   */
  enhanceError(error: Error, context: Record<string, any> = {}): NotionError {
    // Déterminer le type d'erreur
    const type = this.detectErrorType(error);
    
    // Déterminer la gravité
    const severity = this.determineSeverity(type);
    
    // Suggérer des actions de récupération
    const recoveryActions = this.suggestRecoveryActions(type);
    
    // Déterminer si l'erreur est récupérable
    const recoverable = this.isRecoverable(type);
    
    // Créer l'erreur enrichie
    return this.createError(error.message, {
      type,
      severity,
      originalError: error,
      context,
      recoveryActions,
      recoverable
    });
  }
};
