
import { useCallback } from 'react';
import { autoRetryHandler } from './autoRetry';
import { useNotionErrorService } from './useNotionErrorService';
import { useRetryQueue } from './useRetryQueue';
import { NotionError } from '../types/unified';

/**
 * Hook pour utiliser le système de réessai automatique
 */
export function useAutoRetry() {
  const { reportError } = useNotionErrorService();
  const { enqueue, processQueue } = useRetryQueue();
  
  /**
   * Exécute une opération avec gestion des erreurs et réessai automatique
   */
  const executeWithRetry = useCallback(async <T>(
    name: string,
    operation: () => Promise<T>,
    options: {
      context?: string;
      maxRetries?: number;
      priority?: number;
      tags?: string[];
      autoRetry?: boolean;
      showToast?: boolean;
      onSuccess?: (result: T) => void;
      onError?: (error: NotionError) => void;
    } = {}
  ): Promise<T | null> => {
    try {
      // Exécuter l'opération
      const result = await operation();
      
      // Appeler le callback de succès si défini
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (error) {
      // Créer une erreur standardisée
      const notionError = reportError(
        error,
        options.context || name,
        { showToast: options.showToast }
      );
      
      // Appeler le callback d'erreur si défini
      if (options.onError) {
        options.onError(notionError);
      }
      
      // Si le réessai automatique est désactivé, s'arrêter ici
      if (options.autoRetry === false) {
        return null;
      }
      
      // Tenter d'enregistrer pour réessai
      const canAutoRetry = autoRetryHandler.canAutoRetry(notionError);
      
      if (canAutoRetry) {
        enqueue(name, operation, {
          description: options.context,
          maxRetries: options.maxRetries,
          priority: options.priority,
          tags: options.tags
        });
      }
      
      return null;
    }
  }, [reportError, enqueue]);
  
  /**
   * Exécute une opération en attrapant les erreurs, mais sans réessai
   */
  const executeSafely = useCallback(async <T>(
    name: string,
    operation: () => Promise<T>,
    options: {
      context?: string;
      showToast?: boolean;
      onSuccess?: (result: T) => void;
      onError?: (error: NotionError) => void;
    } = {}
  ): Promise<T | null> => {
    return executeWithRetry(name, operation, {
      ...options,
      autoRetry: false
    });
  }, [executeWithRetry]);
  
  return {
    executeWithRetry,
    executeSafely,
    processQueue,
    autoRetryHandler
  };
}

export default useAutoRetry;
