
import { NotionError, NotionErrorType, NotionErrorSeverity } from '../types/errorTypes';

/**
 * Utilitaires pour la gestion des erreurs Notion
 */
export const errorUtils = {
  /**
   * Détermine si une erreur est temporaire (et peut être réessayée)
   */
  isTemporaryError(error: Error | string | NotionError): boolean {
    // Si c'est une NotionError, utiliser sa propriété retryable
    if (typeof error === 'object' && 'retryable' in error) {
      return error.retryable;
    }
    
    const errorMessage = typeof error === 'string' 
      ? error.toLowerCase() 
      : (error.message || '').toLowerCase();
    
    // Liste des motifs qui indiquent une erreur temporaire
    const temporaryPatterns = [
      'network',
      'connection',
      'timeout',
      'timed out',
      'rate limit',
      'too many requests',
      '429',
      'service unavailable',
      '503',
      'gateway timeout',
      '504',
      'temporarily',
      'temporary',
      'retry',
      'overloaded',
      'reset'
    ];
    
    // Vérifier si l'erreur contient l'un des motifs
    return temporaryPatterns.some(pattern => errorMessage.includes(pattern));
  },
  
  /**
   * Détermine le type d'une erreur
   */
  getErrorType(error: Error | string): NotionErrorType {
    const message = typeof error === 'string' ? error : error.message;
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('auth') || lowerMessage.includes('token') || lowerMessage.includes('401')) {
      return NotionErrorType.AUTH;
    }
    
    if (lowerMessage.includes('permission') || lowerMessage.includes('forbidden') || lowerMessage.includes('403')) {
      return NotionErrorType.PERMISSION;
    }
    
    if (lowerMessage.includes('not found') || lowerMessage.includes('404')) {
      return NotionErrorType.NOT_FOUND;
    }
    
    if (lowerMessage.includes('valid') || lowerMessage.includes('schema') || lowerMessage.includes('400')) {
      return NotionErrorType.VALIDATION;
    }
    
    if (lowerMessage.includes('rate limit') || lowerMessage.includes('429')) {
      return NotionErrorType.RATE_LIMIT;
    }
    
    if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
      return NotionErrorType.TIMEOUT;
    }
    
    if (lowerMessage.includes('cors') || lowerMessage.includes('origin')) {
      return NotionErrorType.CORS;
    }
    
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection')) {
      return NotionErrorType.NETWORK;
    }
    
    if (lowerMessage.includes('server') || lowerMessage.includes('500') || lowerMessage.includes('502')) {
      return NotionErrorType.SERVER;
    }
    
    if (lowerMessage.includes('database') || lowerMessage.includes('query')) {
      return NotionErrorType.DATABASE;
    }
    
    return NotionErrorType.UNKNOWN;
  },
  
  /**
   * Détermine la sévérité d'une erreur
   */
  getErrorSeverity(error: Error | string | NotionError): NotionErrorSeverity {
    // Si c'est une NotionError, utiliser sa propriété severity
    if (typeof error === 'object' && 'severity' in error) {
      return error.severity;
    }
    
    const errorType = typeof error === 'string' || error instanceof Error
      ? this.getErrorType(error)
      : NotionErrorType.UNKNOWN;
    
    // Déterminer la sévérité en fonction du type
    switch (errorType) {
      case NotionErrorType.AUTH:
      case NotionErrorType.PERMISSION:
        return NotionErrorSeverity.CRITICAL;
        
      case NotionErrorType.NOT_FOUND:
      case NotionErrorType.VALIDATION:
      case NotionErrorType.DATABASE:
        return NotionErrorSeverity.ERROR;
        
      case NotionErrorType.RATE_LIMIT:
      case NotionErrorType.TIMEOUT:
      case NotionErrorType.NETWORK:
      case NotionErrorType.SERVER:
        return NotionErrorSeverity.WARNING;
        
      case NotionErrorType.CORS:
      case NotionErrorType.UNKNOWN:
      default:
        return NotionErrorSeverity.ERROR;
    }
  },
  
  /**
   * Crée un message utilisateur à partir d'une erreur
   */
  getUserFriendlyMessage(error: Error | string | NotionError): string {
    // Si c'est une NotionError, utiliser notre fonction spécifique
    if (typeof error === 'object' && 'type' in error && 'severity' in error) {
      const notionError = error as NotionError;
      
      switch (notionError.type) {
        case NotionErrorType.AUTH:
          return "Erreur d'authentification. Vérifiez vos identifiants Notion.";
          
        case NotionErrorType.PERMISSION:
          return "Erreur de permission. Vous n'avez pas accès à cette ressource Notion.";
          
        case NotionErrorType.NOT_FOUND:
          return "Ressource introuvable. Vérifiez l'identifiant utilisé.";
          
        case NotionErrorType.VALIDATION:
          return "Erreur de validation. Vérifiez les données envoyées.";
          
        case NotionErrorType.RATE_LIMIT:
          return "Limite de requêtes atteinte. Veuillez réessayer dans quelques instants.";
          
        case NotionErrorType.TIMEOUT:
          return "Délai d'attente dépassé. L'opération a pris trop de temps.";
          
        case NotionErrorType.CORS:
          return "Erreur de configuration CORS. Vérifiez les paramètres du proxy.";
          
        case NotionErrorType.NETWORK:
          return "Erreur réseau. Vérifiez votre connexion internet.";
          
        case NotionErrorType.SERVER:
          return "Erreur serveur Notion. Veuillez réessayer ultérieurement.";
          
        case NotionErrorType.DATABASE:
          return "Erreur de base de données. Vérifiez la structure de vos bases Notion.";
          
        default:
          return notionError.message || "Une erreur est survenue.";
      }
    }
    
    // Pour les autres types d'erreurs
    const message = typeof error === 'string' ? error : error.message;
    const errorType = this.getErrorType(error);
    
    switch (errorType) {
      case NotionErrorType.AUTH:
        return "Erreur d'authentification. Vérifiez vos identifiants.";
        
      case NotionErrorType.PERMISSION:
        return "Erreur de permission. Accès refusé à la ressource.";
        
      case NotionErrorType.NOT_FOUND:
        return "Ressource introuvable. Vérifiez l'identifiant utilisé.";
        
      case NotionErrorType.VALIDATION:
        return "Erreur de validation. Vérifiez les données saisies.";
        
      case NotionErrorType.RATE_LIMIT:
        return "Limite de requêtes atteinte. Veuillez réessayer ultérieurement.";
        
      case NotionErrorType.NETWORK:
        return "Erreur réseau. Vérifiez votre connexion internet.";
        
      default:
        return message || "Une erreur est survenue.";
    }
  }
};
