
/**
 * Traitement automatique des erreurs Notion
 */

import { notionRetryQueue } from './retryQueue';
import { notionErrorService } from './errorService';
import { NotionError, NotionErrorType } from '../types/unified';

/**
 * Gestionnaire de réessai automatique des erreurs
 */
export const autoRetryHandler = {
  /**
   * Vérifie si une erreur peut être réessayée automatiquement
   */
  canAutoRetry(error: NotionError): boolean {
    // Les erreurs réseau peuvent généralement être réessayées
    if (error.type === NotionErrorType.NETWORK) {
      return true;
    }
    
    // Les erreurs de temps d'attente peuvent être réessayées
    if (error.type === NotionErrorType.TIMEOUT) {
      return true;
    }
    
    // Les erreurs de limite de débit peuvent être réessayées après un délai
    if (error.type === NotionErrorType.RATE_LIMIT) {
      return true;
    }
    
    // Les erreurs serveur peuvent souvent être réessayées
    if (error.type === NotionErrorType.SERVER) {
      return true;
    }
    
    // Par défaut, on considère que l'erreur ne peut pas être réessayée
    return false;
  },
  
  /**
   * Enregistre une opération pour réessai automatique
   */
  registerForRetry(
    name: string,
    operation: () => Promise<any>,
    error: NotionError,
    options: {
      maxRetries?: number;
      priority?: number;
      tags?: string[];
    } = {}
  ): string | null {
    // Vérifier si l'erreur peut être réessayée
    if (!this.canAutoRetry(error)) {
      return null;
    }
    
    // Déterminer le nombre maximal de tentatives en fonction du type d'erreur
    let maxRetries = options.maxRetries || 3;
    let priority = options.priority || 0;
    
    // Ajuster les paramètres en fonction du type d'erreur
    switch (error.type) {
      case NotionErrorType.RATE_LIMIT:
        // Plus d'attente entre les tentatives pour les limites de débit
        maxRetries = options.maxRetries || 5;
        priority = -10; // Priorité basse
        break;
        
      case NotionErrorType.NETWORK:
        // Priorité plus élevée pour les erreurs réseau
        priority = 10;
        break;
        
      case NotionErrorType.SERVER:
        // Priorité moyenne pour les erreurs serveur
        priority = 0;
        break;
    }
    
    // Ajouter à la file d'attente
    return notionRetryQueue.enqueue(name, operation, {
      ...options,
      maxRetries,
      priority,
      tags: [...(options.tags || []), 'auto-retry', `error-type:${error.type}`]
    });
  },
  
  /**
   * Traite une erreur et l'enregistre pour réessai si possible
   */
  handleError(
    error: Error | any,
    operationName: string,
    operation: () => Promise<any>,
    options: {
      context?: string;
      maxRetries?: number;
      priority?: number;
      tags?: string[];
      autoRetry?: boolean;
    } = {}
  ): NotionError {
    // Créer une erreur standardisée
    const notionError = notionErrorService.reportError(
      error,
      options.context || operationName
    );
    
    // Si le réessai automatique est désactivé, s'arrêter ici
    if (options.autoRetry === false) {
      return notionError;
    }
    
    // Tenter d'enregistrer pour réessai
    this.registerForRetry(operationName, operation, notionError, {
      maxRetries: options.maxRetries,
      priority: options.priority,
      tags: options.tags
    });
    
    return notionError;
  }
};

export default autoRetryHandler;
