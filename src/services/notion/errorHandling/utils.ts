
import { NotionErrorType, NotionError } from './types';

/**
 * Utilitaires pour la gestion des erreurs Notion
 */
export const notionErrorUtils = {
  /**
   * Détecte le type d'erreur en fonction de son message ou de son type
   */
  detectErrorType(error: Error | string | NotionError | unknown): NotionErrorType {
    const message = typeof error === 'string' 
      ? error.toLowerCase() 
      : error instanceof Error 
        ? error.message.toLowerCase()
        : '';
    
    // Vérifier si c'est déjà une NotionError typée
    if (typeof error === 'object' && error !== null && 'type' in error && error.type) {
      return error.type as NotionErrorType;
    }
    
    // Analyser le message d'erreur
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return NotionErrorType.NETWORK;
    } else if (message.includes('auth') || message.includes('unauthorized') || message.includes('401')) {
      return NotionErrorType.AUTH;
    } else if (message.includes('permission') || message.includes('forbidden') || message.includes('403')) {
      return NotionErrorType.PERMISSION;
    } else if (message.includes('rate limit') || message.includes('429')) {
      return NotionErrorType.RATE_LIMIT;
    } else if (message.includes('database') || message.includes('not found') || message.includes('404')) {
      return NotionErrorType.DATABASE;
    } else if (message.includes('cors')) {
      return NotionErrorType.CORS;
    }
    
    return NotionErrorType.UNKNOWN;
  },
  
  /**
   * Détermine si une erreur peut être retentée
   */
  isRetryableError(error: Error | string | unknown): boolean {
    const type = this.detectErrorType(error);
    
    // Ces types d'erreurs peuvent généralement être retentés
    const retryableTypes = [
      NotionErrorType.NETWORK,
      NotionErrorType.TIMEOUT,
      NotionErrorType.RATE_LIMIT
    ];
    
    return retryableTypes.includes(type);
  },
  
  /**
   * Crée une erreur Notion complète
   */
  createError(message: string, options = {}): NotionError {
    // Utilise le service pour créer une erreur
    // Cette implémentation est juste un pont vers notionErrorService.createError
    // mais permet un import plus simple dans certains contextes
    const { notionErrorService } = require('./errorService');
    return notionErrorService.createError(message, options);
  }
};

// Exporter pour une utilisation directe
export { notionErrorUtils as utils };
