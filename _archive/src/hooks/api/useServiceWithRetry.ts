
import { useState } from 'react';
import { useOperationQueue } from './useOperationQueue';
import { useOperationMode } from '@/services/operationMode';

// Types pour les stratégies de retry
export type RetryStrategy = 'immediate' | 'exponential' | 'linear' | 'fixed';

export interface RetryOptions {
  /** Nombre maximum de tentatives */
  maxRetries?: number;
  /** Délai initial entre les tentatives (en ms) */
  initialDelay?: number;
  /** Facteur multiplicateur pour le backoff exponentiel */
  backoffFactor?: number;
  /** Délai maximum entre les tentatives (en ms) */
  maxDelay?: number;
  /** Stratégie de retry à utiliser */
  strategy?: RetryStrategy;
  /** Si true, ajoute un délai aléatoire (jitter) pour éviter les effets de tempête */
  useJitter?: boolean;
}

// Valeurs par défaut pour les options de retry
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  initialDelay: 1000, // 1 seconde
  backoffFactor: 2,
  maxDelay: 30000, // 30 secondes
  strategy: 'exponential',
  useJitter: true
};

/**
 * Calcule le délai pour la prochaine tentative selon la stratégie choisie
 */
export function calculateRetryDelay(
  attempt: number,
  options: RetryOptions = DEFAULT_RETRY_OPTIONS
): number {
  const {
    initialDelay = 1000,
    backoffFactor = 2,
    maxDelay = 30000,
    strategy = 'exponential',
    useJitter = true
  } = options;

  let delay: number;

  switch (strategy) {
    case 'immediate':
      // Retry immédiatement
      delay = 0;
      break;
    
    case 'fixed':
      // Toujours le même délai
      delay = initialDelay;
      break;
    
    case 'linear':
      // Augmentation linéaire: initialDelay * attemptNumber
      delay = initialDelay * attempt;
      break;
    
    case 'exponential':
    default:
      // Backoff exponentiel: initialDelay * (backoffFactor ^ attemptNumber)
      delay = initialDelay * Math.pow(backoffFactor, attempt - 1);
      break;
  }

  // Appliquer le délai maximum
  delay = Math.min(delay, maxDelay);

  // Ajouter un jitter aléatoire (±30%) pour éviter les tempêtes de requêtes
  if (useJitter) {
    const jitterFactor = 0.7 + Math.random() * 0.6; // Entre 0.7 et 1.3
    delay = Math.floor(delay * jitterFactor);
  }

  return delay;
}

/**
 * Hook générique pour appeler un service avec une file d'attente de réessais et de persistance
 * @param serviceFn La fonction de service à appeler
 * @param entityType Le type d'entité ("project", "audit", etc.)
 * @param operationType Le type d'opération ("create", "update", "delete")
 * @param onSuccess Callback appelé en cas de succès
 * @param retryOptions Options pour configurer la stratégie de retry
 */
export function useServiceWithRetry<T, P extends any[]>(
  serviceFn: (...args: P) => Promise<T>,
  entityType: string,
  operationType: string,
  onSuccess?: (result: T) => void,
  retryOptions: RetryOptions = DEFAULT_RETRY_OPTIONS
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
      
      // Calculer le timestamp pour la prochaine tentative
      const nextRetryDelay = calculateRetryDelay(1, retryOptions);
      const nextRetryTime = new Date(Date.now() + nextRetryDelay);
      
      // Ajouter l'opération à la file d'attente avec les options de retry
      addOperation(
        entityType,
        operationType as any,
        entityId,
        payload,
        {
          maxAttempts: retryOptions.maxRetries || DEFAULT_RETRY_OPTIONS.maxRetries!,
          retryStrategy: retryOptions.strategy || DEFAULT_RETRY_OPTIONS.strategy!,
          initialDelay: retryOptions.initialDelay || DEFAULT_RETRY_OPTIONS.initialDelay!,
          nextRetryTime: nextRetryTime.toISOString()
        }
      );
      
      // Lancer le processus de traitement de la file d'attente après un délai
      setTimeout(() => {
        processQueue();
      }, nextRetryDelay);
      
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
