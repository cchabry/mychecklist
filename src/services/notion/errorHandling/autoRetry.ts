
/**
 * Utilitaire pour la gestion automatique des réessais
 */

import { notionErrorService } from './notionErrorService';
import { notionRetryQueue } from './retryQueue';
import { NotionError, NotionErrorType } from '../types/unified';
import { toast } from 'sonner';

/**
 * Options pour les opérations avec réessai automatique
 */
export interface AutoRetryOptions {
  maxAttempts?: number;
  retryDelay?: number;
  retryableErrorTypes?: NotionErrorType[];
  showToast?: boolean;
  toastMessage?: string;
}

/**
 * Handler pour la gestion automatique des réessais pour les opérations Notion
 */
export const autoRetryHandler = {
  /**
   * Gère une erreur et détermine si elle peut être réessayée
   * @returns true si l'erreur a été ajoutée à la file d'attente, false sinon
   */
  handleError(error: NotionError, operation?: () => Promise<any>): boolean {
    // Si pas d'opération fournie, impossible de réessayer
    if (!operation) {
      return false;
    }
    
    // Vérifier si l'erreur est réessayable
    if (!error.retryable) {
      return false;
    }
    
    // Ajouter l'opération à la file d'attente
    const operationId = notionRetryQueue.addOperation(
      operation, 
      error.context?.toString() || 'Opération Notion'
    );
    
    // Notifier l'utilisateur
    toast.info('Opération en file d\'attente', {
      description: 'Une opération Notion sera réessayée automatiquement'
    });
    
    // Traiter la file d'attente après un court délai
    setTimeout(() => {
      notionRetryQueue.processQueue();
    }, 1000);
    
    return true;
  },
  
  /**
   * Encapsule une fonction avec gestion automatique des réessais
   */
  withAutoRetry<T>(fn: () => Promise<T>, context: string = 'Opération Notion'): () => Promise<T> {
    return async () => {
      try {
        return await fn();
      } catch (err) {
        // Créer une erreur Notion
        const error = err instanceof Error
          ? notionErrorService.createError(err, notionErrorService.identifyErrorType(err))
          : notionErrorService.createError('Erreur inconnue', NotionErrorType.UNKNOWN);
        
        // Ajouter le contexte
        error.context = context;
        
        // Signaler l'erreur
        notionErrorService.reportError(error, context);
        
        // Tenter de l'ajouter à la file d'attente
        const wasQueued = this.handleError(error, fn);
        
        if (!wasQueued) {
          // Si l'erreur n'a pas été mise en file d'attente, la propager
          throw err;
        }
        
        // Même si l'erreur a été mise en file d'attente, nous devons propager l'erreur
        // pour que l'appelant sache que l'opération a échoué
        throw err;
      }
    };
  }
};

// Export par défaut
export default autoRetryHandler;
