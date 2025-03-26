
/**
 * Utilitaires pour la gestion des erreurs Notion
 */
import { NotionError, NotionErrorType, NotionErrorSeverity } from '../types/unified';

export const errorUtils = {
  /**
   * Normalise une erreur quelconque en Error standard
   */
  normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    
    if (typeof error === 'string') {
      return new Error(error);
    }
    
    return new Error(String(error || 'Erreur inconnue'));
  },
  
  /**
   * Extrait le message d'erreur d'un objet quelconque
   */
  extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    if (error && typeof error === 'object') {
      if ('message' in error && typeof error.message === 'string') {
        return error.message;
      }
      
      if ('error' in error && typeof error.error === 'string') {
        return error.error;
      }
    }
    
    return String(error || 'Erreur inconnue');
  },
  
  /**
   * Génère un message d'erreur spécifique au contexte
   */
  contextualErrorMessage(error: Error, context: string): string {
    // Formater le message en fonction du contexte
    switch (context.toLowerCase()) {
      case 'auth':
      case 'authentication':
        return `Erreur d'authentification: ${error.message}`;
        
      case 'database':
      case 'db':
        return `Erreur de base de données: ${error.message}`;
        
      case 'api':
      case 'request':
        return `Erreur d'API: ${error.message}`;
        
      case 'network':
      case 'connection':
        return `Erreur réseau: ${error.message}`;
        
      default:
        // Si le contexte n'est pas reconnu, utiliser simplement le message d'erreur
        return error.message;
    }
  },
  
  /**
   * Détermine si une erreur est critique
   */
  isCriticalError(error: Error | NotionError): boolean {
    // Si c'est une NotionError, utiliser sa sévérité
    if ('severity' in error) {
      return error.severity === NotionErrorSeverity.CRITICAL;
    }
    
    // Sinon, analyser le message
    const message = error.message.toLowerCase();
    
    if (message.includes('auth') || message.includes('token') || message.includes('401')) {
      return true;
    }
    
    if (message.includes('permission') || message.includes('access') || message.includes('403')) {
      return true;
    }
    
    if (message.includes('critical') || message.includes('fatal')) {
      return true;
    }
    
    return false;
  },
  
  /**
   * Détermine si une erreur est transitoire (peut être résoutelle-même plus tard)
   */
  isTransientError(error: Error | NotionError): boolean {
    // Si c'est une NotionError, utiliser son type et retryable
    if ('type' in error && 'retryable' in error) {
      if (error.retryable) {
        return true;
      }
      
      return [
        NotionErrorType.NETWORK,
        NotionErrorType.TIMEOUT,
        NotionErrorType.RATE_LIMIT,
        NotionErrorType.SERVER
      ].includes(error.type);
    }
    
    // Sinon, analyser le message
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('connection') || 
        message.includes('internet') || message.includes('offline')) {
      return true;
    }
    
    if (message.includes('timeout') || message.includes('timed out') || 
        message.includes('délai')) {
      return true;
    }
    
    if (message.includes('rate limit') || message.includes('too many') || 
        message.includes('429')) {
      return true;
    }
    
    if (message.includes('server') || message.includes('503') || 
        message.includes('502') || message.includes('500')) {
      return true;
    }
    
    return false;
  }
};

export default errorUtils;
