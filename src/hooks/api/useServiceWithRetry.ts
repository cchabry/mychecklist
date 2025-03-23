
import { useState } from 'react';
import { useOperationQueue } from './useOperationQueue';
import { useOperationMode } from '@/services/operationMode';

/**
 * Hook générique pour appeler un service avec une file d'attente de réessais et de persistance
 * @param serviceFn La fonction de service à appeler
 * @param entityType Le type d'entité ("project", "audit", etc.)
 * @param operationType Le type d'opération ("create", "update", "delete")
 */
export function useServiceWithRetry<T, P extends any[]>(
  serviceFn: (...args: P) => Promise<T>,
  entityType: string,
  operationType: string,
  onSuccess?: (result: T) => void
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<T | null>(null);
  
  const { addOperation, processQueue } = useOperationQueue();
  const { handleConnectionError, handleSuccessfulOperation } = useOperationMode();
  
  const execute = async (...args: P): Promise<T> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Tentative directe d'exécution du service
      const result = await serviceFn(...args);
      setResult(result);
      
      // Marquer l'opération comme réussie
      handleSuccessfulOperation();
      
      // Appeler le callback de succès si fourni
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      // Notifier le système de mode opérationnel
      handleConnectionError(error, `${entityType}.${operationType}`);
      
      // Ajouter l'opération à la file d'attente pour réessai ultérieur
      // Extraire l'ID d'entité et les données selon le type d'opération
      let entityId: string | undefined;
      let payload: any;
      
      if (operationType === 'update' || operationType === 'delete') {
        // Pour update/delete, le premier argument est généralement l'ID
        entityId = args[0] as unknown as string;
        
        if (operationType === 'update') {
          // Pour update, le deuxième argument est généralement les données
          payload = args[1];
        }
      } else if (operationType === 'create') {
        // Pour create, le premier argument est généralement les données
        payload = args[0];
      }
      
      // Ajouter l'opération à la file d'attente
      addOperation(
        entityType,
        operationType as any,
        entityId,
        payload
      );
      
      // Lancer le processus de traitement de la file d'attente
      // (sera mis en file d'attente plutôt que traité immédiatement)
      setTimeout(() => {
        processQueue();
      }, 5000);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    execute,
    isLoading,
    error,
    result
  };
}
