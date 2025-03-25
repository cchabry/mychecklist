
import { operationModeUtils } from '@/services/operationMode/utils';
import { useState, useCallback } from 'react';

/**
 * Hook pour encapsuler des opérations critiques qui ne doivent pas
 * déclencher de basculement automatique en mode démo
 */
export function useCriticalOperation(operationName: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Exécute une fonction en la marquant comme opération critique
   */
  const executeCritical = useCallback(async <T>(
    fn: () => Promise<T>,
    options: {
      onSuccess?: (result: T) => void;
      onError?: (error: Error) => void;
    } = {}
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Créer un wrapper d'opération critique pour cette fonction
      const wrappedFn = operationModeUtils.createCriticalOperationWrapper(
        operationName,
        fn
      );

      // Exécuter la fonction avec le wrapper
      const result = await wrappedFn();
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      setIsLoading(false);
      return result;
    } catch (error) {
      const typedError = error instanceof Error ? error : new Error(String(error));
      setError(typedError);
      
      if (options.onError) {
        options.onError(typedError);
      }
      
      setIsLoading(false);
      return null;
    }
  }, [operationName]);

  return {
    executeCritical,
    isLoading,
    error
  };
}
