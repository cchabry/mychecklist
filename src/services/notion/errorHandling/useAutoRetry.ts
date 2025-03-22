
import { useState } from 'react';
import { autoRetryHandler } from './autoRetry';
import { NotionError } from './types';

/**
 * Hook pour utiliser le système de retry automatique
 * dans les composants React
 */
export function useAutoRetry() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<NotionError | null>(null);
  
  /**
   * Exécute une opération avec gestion automatique de retry
   */
  const executeWithRetry = async <T>(
    operation: () => Promise<T>,
    context: Record<string, any> = {},
    maxRetries: number = 3
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await autoRetryHandler.execute(operation, context, maxRetries);
      return result;
    } catch (err) {
      // Convertir en NotionError si nécessaire (devrait déjà être fait dans autoRetryHandler)
      const notionError = err as NotionError;
      setError(notionError);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    error,
    executeWithRetry,
    clearError: () => setError(null)
  };
}
