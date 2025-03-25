
import { operationMode } from '@/services/operationMode';
import { useState, useCallback, useEffect } from 'react';

/**
 * Hook pour encapsuler des opérations critiques qui ne doivent pas
 * déclencher de basculement automatique en mode démo
 */
export function useCriticalOperation(operationName: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Nettoyer automatiquement l'opération critique au démontage du composant
  useEffect(() => {
    return () => {
      if (operationMode.isOperationCritical(operationName)) {
        console.log(`🧹 Nettoyage automatique de l'opération critique "${operationName}" au démontage`);
        operationMode.unmarkOperationAsCritical(operationName);
      }
    };
  }, [operationName]);

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

    console.log(`🚀 Début d'exécution de l'opération critique "${operationName}"`);
    // Marquer comme critique immédiatement
    operationMode.markOperationAsCritical(operationName);

    try {
      // Exécuter la fonction directement
      const result = await fn();
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      console.log(`✅ Opération critique "${operationName}" réussie`);
      // L'opération est toujours marquée comme critique ici
      
      setIsLoading(false);
      return result;
    } catch (error) {
      const typedError = error instanceof Error ? error : new Error(String(error));
      setError(typedError);
      
      console.error(`❌ Erreur dans l'opération critique "${operationName}":`, typedError);
      
      if (options.onError) {
        options.onError(typedError);
      }
      
      setIsLoading(false);
      return null;
    } finally {
      // Démarquer comme critique dans le finally pour s'assurer que c'est toujours fait
      console.log(`🏁 Fin de l'opération critique "${operationName}"`);
      operationMode.unmarkOperationAsCritical(operationName);
    }
  }, [operationName]);

  return {
    executeCritical,
    isLoading,
    error
  };
}
