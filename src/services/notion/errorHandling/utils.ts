
import { NotionError, NotionErrorOptions, NotionErrorType, NotionErrorSeverity } from './types';

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

    const error = new Error(message) as NotionError;
    error.name = 'NotionError';
    error.type = type;
    error.severity = severity;
    error.cause = cause;
    error.context = context;
    error.recoverable = recoverable;
    error.recoveryActions = recoveryActions;
    error.timestamp = new Date();

    return error;
  },

  /**
   * Détermine le type d'erreur en fonction du message ou de l'objet d'erreur
   */
  determineErrorType(error: Error | string): NotionErrorType {
    const message = typeof error === 'string' ? error.toLowerCase() : error.message.toLowerCase();
    
    if (message.includes('network') || 
        message.includes('fetch') || 
        message.includes('cors') || 
        message.includes('timeout') ||
        message.includes('connection')) {
      return NotionErrorType.NETWORK;
    }
    
    if (message.includes('auth') || 
        message.includes('token') || 
        message.includes('unauthorized') || 
        message.includes('401')) {
      return NotionErrorType.AUTH;
    }
    
    if (message.includes('permission') || 
        message.includes('forbidden') || 
        message.includes('403')) {
      return NotionErrorType.PERMISSION;
    }
    
    if (message.includes('rate limit') || 
        message.includes('throttle') || 
        message.includes('429')) {
      return NotionErrorType.RATE_LIMIT;
    }
    
    if (message.includes('validation') || 
        message.includes('invalid') || 
        message.includes('schema')) {
      return NotionErrorType.VALIDATION;
    }
    
    if (message.includes('database') || 
        message.includes('db') || 
        message.includes('query')) {
      return NotionErrorType.DATABASE;
    }
    
    return NotionErrorType.UNKNOWN;
  },

  /**
   * Détermine si une erreur est récupérable
   */
  isRecoverable(error: Error | NotionError): boolean {
    // Si c'est déjà une NotionError avec un indicateur recoverable
    if ('recoverable' in error) {
      return (error as NotionError).recoverable;
    }
    
    // Déterminer selon le type
    const type = this.determineErrorType(error);
    
    return [
      NotionErrorType.NETWORK,
      NotionErrorType.RATE_LIMIT
    ].includes(type);
  },
  
  /**
   * Génère des actions de récupération possibles
   */
  getRecoveryActions(error: Error | NotionError): string[] {
    const actions: string[] = [];
    const type = 'type' in error ? (error as NotionError).type : this.determineErrorType(error);
    
    switch (type) {
      case NotionErrorType.NETWORK:
        actions.push('retry');
        actions.push('switchToDemo');
        break;
        
      case NotionErrorType.AUTH:
        actions.push('reconfigure');
        actions.push('switchToDemo');
        break;
        
      case NotionErrorType.RATE_LIMIT:
        actions.push('waitAndRetry');
        break;
        
      case NotionErrorType.PERMISSION:
        actions.push('reconfigure');
        break;
    }
    
    return actions;
  }
};
