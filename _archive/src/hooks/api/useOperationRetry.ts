
import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

// Types pour le système de retry
export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  retryableErrors?: string[];
}

export type RetryStrategy = 'linear' | 'exponential' | 'constant';

/**
 * Calcule le délai avant la prochaine tentative selon la stratégie choisie
 */
export function calculateRetryDelay(
  attempt: number,
  strategy: RetryStrategy,
  options: {
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
  }
): number {
  const {
    initialDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2
  } = options;

  let delay: number;

  switch (strategy) {
    case 'linear':
      // Délai linéaire: initialDelay * attempt
      delay = initialDelay * attempt;
      break;
    case 'exponential':
      // Délai exponentiel: initialDelay * (backoffFactor ^ attempt)
      delay = initialDelay * Math.pow(backoffFactor, attempt - 1);
      break;
    case 'constant':
    default:
      // Délai constant
      delay = initialDelay;
      break;
  }

  // Limiter le délai maximum
  return Math.min(delay, maxDelay);
}

/**
 * Hook pour exécuter des opérations avec retry automatique en cas d'échec
 */
export function useServiceWithRetry<T, Args extends any[] = any[]>(
  serviceMethod: (...args: Args) => Promise<T>,
  entityName: string,
  operationType: string,
  onSuccessCallback?: (result: T) => void,
  options: RetryOptions = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const attemptRef = useRef(0);
  const argsRef = useRef<Args | null>(null);

  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 15000,
    backoffFactor = 2,
    onSuccess,
    onError,
    retryableErrors = []
  } = options;

  /**
   * Détermine si une erreur est retraitable
   */
  const isRetryableError = useCallback((error: Error): boolean => {
    // Si la liste des erreurs retraitables est vide, on considère toutes les erreurs comme retraitables
    if (retryableErrors.length === 0) {
      return true;
    }

    // Sinon, on vérifie si l'erreur est dans la liste
    return retryableErrors.some(pattern => 
      error.message.includes(pattern) || 
      error.name.includes(pattern)
    );
  }, [retryableErrors]);

  /**
   * Exécute l'opération avec retry
   */
  const execute = useCallback(async (...args: Args): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    argsRef.current = args;
    attemptRef.current = 0;

    try {
      const result = await serviceMethod(...args);
      setResult(result);
      setIsLoading(false);
      
      if (onSuccessCallback) {
        onSuccessCallback(result);
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      attemptRef.current += 1;
      
      if (attemptRef.current < maxAttempts && isRetryableError(error)) {
        const strategy: RetryStrategy = 'exponential';
        const delay = calculateRetryDelay(attemptRef.current, strategy, {
          initialDelay,
          maxDelay,
          backoffFactor
        });
        
        toast.error(`Échec de l'opération, nouvelle tentative dans ${Math.round(delay / 1000)}s...`, {
          description: `${error.message.substring(0, 100)}${error.message.length > 100 ? '...' : ''}`
        });
        
        setTimeout(() => {
          if (argsRef.current) {
            execute(...argsRef.current).catch(console.error);
          }
        }, delay);
      } else {
        setError(error);
        setIsLoading(false);
        
        toast.error(`Erreur lors de l'opération`, {
          description: error.message
        });
        
        if (onError) {
          onError(error);
        }
      }
      
      return null;
    }
  }, [
    serviceMethod,
    maxAttempts,
    initialDelay,
    maxDelay,
    backoffFactor,
    isRetryableError,
    onSuccess,
    onError,
    onSuccessCallback
  ]);

  return {
    execute,
    isLoading,
    error,
    result,
    reset: () => {
      setError(null);
      setResult(null);
      attemptRef.current = 0;
      argsRef.current = null;
    }
  };
}
