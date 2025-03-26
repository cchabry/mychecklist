
import { useState, useCallback } from 'react';

/**
 * Type pour les erreurs Notion
 */
export interface NotionError {
  error: string;
  context?: string;
  isCritical?: boolean;
  timestamp?: number;
}

/**
 * Hook pour gérer l'état des erreurs Notion
 */
export function useNotionErrorState() {
  const [error, setError] = useState<NotionError | null>(null);
  
  const handleError = useCallback((newError: NotionError | null) => {
    if (newError) {
      setError({
        ...newError,
        timestamp: Date.now()
      });
    } else {
      setError(null);
    }
  }, []);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return {
    error,
    handleError,
    clearError,
    hasError: !!error
  };
}
