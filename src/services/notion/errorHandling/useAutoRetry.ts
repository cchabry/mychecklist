
import { useState } from 'react';
import { autoRetryHandler } from './autoRetry';
import { notionErrorUtils } from './utils';
import { NotionError } from './types';

/**
 * Hook pour utiliser le gestionnaire d'auto-retry
 */
export function useAutoRetry() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<NotionError | null>(null);

  /**
   * Exécute une opération avec gestion d'erreur automatique et retry
   */
  const executeWithRetry = async <T>(
    operation: () => Promise<T>,
    context: string = '',
    options: {
      maxRetries?: number;
      onSuccess?: (result: T) => void;
      onFailure?: (error: NotionError) => void;
    } = {}
  ): Promise<T> => {
    try {
      setIsRetrying(true);
      setRetryCount(0);
      setLastError(null);

      const result = await autoRetryHandler.execute(
        operation,
        { operation: context },
        options.maxRetries
      );

      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    } catch (error) {
      const notionError = notionErrorUtils.createError(
        error instanceof Error ? error.message : String(error),
        {
          cause: error instanceof Error ? error : undefined,
          context: { operation: context }
        }
      );

      setLastError(notionError);

      if (options.onFailure) {
        options.onFailure(notionError);
      }

      throw notionError;
    } finally {
      setIsRetrying(false);
    }
  };

  /**
   * Vérifie si une erreur est récupérable
   */
  const isErrorRecoverable = (error: Error | null): boolean => {
    if (!error) return false;
    return notionErrorUtils.isRecoverable(error);
  };

  return {
    executeWithRetry,
    isRetrying,
    retryCount,
    lastError,
    isErrorRecoverable,
    utils: notionErrorUtils
  };
}
