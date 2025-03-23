
import { useState } from 'react';
import { useOperationMode } from '@/services/operationMode/hooks/useOperationMode';
import { useNotionAPI } from './useNotionAPI';
import { NotionError } from '@/services/notion/errorHandling/types';

/**
 * Hook pour effectuer des requêtes Notion (version compatible avec l'ancien système)
 * @deprecated Utilisez useNotionAPI à la place
 */
export function useNotionRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const operationMode = useOperationMode();
  const notionAPI = useNotionAPI();

  const execute = async <T>(
    endpoint: string,
    method: string = 'GET',
    body?: any,
    token?: string
  ): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const result = await notionAPI.execute<T>(endpoint, method, body, token, {
        onError: (err) => {
          // Convertir NotionError en Error standard si nécessaire
          if (err && typeof err === 'object') {
            const standardError = new Error(err.message);
            standardError.name = err.name || 'NotionError';
            standardError.stack = err.stack;
            setError(standardError);
          } else {
            setError(err as unknown as Error);
          }
        }
      });
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    execute,
    loading,
    error,
    setError,
    isDemoMode: operationMode.isDemoMode
  };
}
