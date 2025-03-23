
import { useState, useCallback } from 'react';
import { useErrorCategorization } from './useErrorCategorization';
import { useOperationQueue } from './useOperationQueue';
import { calculateRetryDelay, RetryOptions, RetryStrategy } from './useServiceWithRetry';
import { toast } from 'sonner';

interface RetryableOperation<T> {
  id: string;
  operation: () => Promise<T>;
  attempt: number;
  maxAttempts: number;
  lastError?: Error;
  lastErrorTime?: number;
  nextRetryTime?: number;
}

// Options pour exécuter une opération avec retry
interface ExecuteOptions extends RetryOptions {
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  context?: string;
  showToast?: boolean;
  queueOnFailure?: boolean;
}

// Type pour les stratégies de récupération pour chaque type d'erreur
type RecoveryStrategy = {
  retry: boolean;
  maxRetries: number;
  strategy: RetryStrategy;
  shouldQueue: boolean;
  delayMultiplier: number;
}

// Stratégies de récupération pour chaque type d'erreur
type RecoveryStrategyMap = {
  [key: string]: RecoveryStrategy;
}

/**
 * Hook pour gérer la logique de retry avec catégorisation des erreurs
 */
export function useOperationRetry() {
  const [currentOperation, setCurrentOperation] = useState<RetryableOperation<any> | null>(null);
  const { categorizeApiError, isRetryableError, getUserFriendlyMessage } = useErrorCategorization();
  const { addOperation } = useOperationQueue();
  
  // Stratégies de récupération par type d'erreur
  const recoveryStrategies: RecoveryStrategyMap = {
    connection: {
      retry: true,
      maxRetries: 5,
      strategy: 'exponential',
      shouldQueue: true,
      delayMultiplier: 1.5,
    },
    timeout: {
      retry: true,
      maxRetries: 3,
      strategy: 'linear',
      shouldQueue: true,
      delayMultiplier: 2,
    },
    rate_limit: {
      retry: true,
      maxRetries: 3,
      strategy: 'exponential',
      shouldQueue: true,
      delayMultiplier: 3,
    },
    server: {
      retry: true,
      maxRetries: 2,
      strategy: 'linear',
      shouldQueue: true,
      delayMultiplier: 1.5,
    },
    authentication: {
      retry: false,
      maxRetries: 0,
      strategy: 'immediate',
      shouldQueue: false,
      delayMultiplier: 1,
    },
    authorization: {
      retry: false,
      maxRetries: 0,
      strategy: 'immediate',
      shouldQueue: false,
      delayMultiplier: 1,
    },
    validation: {
      retry: false,
      maxRetries: 0,
      strategy: 'immediate',
      shouldQueue: false,
      delayMultiplier: 1,
    },
    not_found: {
      retry: false,
      maxRetries: 0,
      strategy: 'immediate',
      shouldQueue: false,
      delayMultiplier: 1,
    },
    conflict: {
      retry: true,
      maxRetries: 2,
      strategy: 'fixed',
      shouldQueue: true,
      delayMultiplier: 1,
    },
    parse: {
      retry: false,
      maxRetries: 0,
      strategy: 'immediate',
      shouldQueue: false,
      delayMultiplier: 1,
    },
    business: {
      retry: false,
      maxRetries: 0,
      strategy: 'immediate',
      shouldQueue: false,
      delayMultiplier: 1,
    },
    unknown: {
      retry: true,
      maxRetries: 1,
      strategy: 'fixed',
      shouldQueue: true,
      delayMultiplier: 1,
    }
  };
  
  /**
   * Adapte les stratégies de retry en fonction du type d'erreur
   */
  const getRetryOptionsForError = useCallback((error: Error, defaultOptions: RetryOptions = {}): RetryOptions => {
    const errorDetails = categorizeApiError(error);
    const strategy = recoveryStrategies[errorDetails.type] || recoveryStrategies.unknown;
    
    return {
      maxRetries: strategy.maxRetries,
      strategy: strategy.strategy,
      initialDelay: (defaultOptions.initialDelay || 1000) * strategy.delayMultiplier,
      backoffFactor: defaultOptions.backoffFactor || 2,
      useJitter: defaultOptions.useJitter !== false,
    };
  }, [categorizeApiError]);
  
  /**
   * Exécute une opération avec gestion des erreurs et retry adaptatif
   */
  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    options: ExecuteOptions = {}
  ): Promise<T> => {
    const {
      maxRetries = 2,
      initialDelay = 1000,
      strategy = 'exponential',
      backoffFactor = 2,
      useJitter = true,
      onSuccess,
      onError,
      context = 'Opération',
      showToast = true,
      queueOnFailure = true
    } = options;
    
    let attempt = 0;
    let lastError: Error | undefined;
    
    // Fonction pour la tentative actuelle
    const attemptOperation = async (): Promise<T> => {
      attempt++;
      
      try {
        const result = await operation();
        
        // Réinitialiser l'opération en cours
        setCurrentOperation(null);
        
        // Appeler le callback de succès
        if (onSuccess) {
          onSuccess(result);
        }
        
        // Afficher un toast de succès si demandé et si ce n'est pas la première tentative
        if (showToast && attempt > 1) {
          toast.success(`Opération réussie après ${attempt} tentative${attempt > 1 ? 's' : ''}`);
        }
        
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        lastError = error;
        
        // Catégoriser l'erreur
        const errorDetails = categorizeApiError(error);
        const strategy = recoveryStrategies[errorDetails.type] || recoveryStrategies.unknown;
        
        // Mettre à jour l'opération en cours
        const operationId = Math.random().toString(36).substring(2, 9);
        setCurrentOperation({
          id: operationId,
          operation,
          attempt,
          maxAttempts: maxRetries,
          lastError: error,
          lastErrorTime: Date.now()
        });
        
        // Appeler le callback d'erreur
        if (onError) {
          onError(error);
        }
        
        // Vérifier si on doit réessayer
        const shouldRetry = attempt <= maxRetries && strategy.retry;
        
        if (shouldRetry) {
          // Calculer le délai avant la prochaine tentative
          const retryOptions = getRetryOptionsForError(error, {
            initialDelay,
            strategy,
            backoffFactor,
            useJitter
          });
          
          const delay = calculateRetryDelay(attempt, retryOptions);
          const nextRetryTime = Date.now() + delay;
          
          // Mettre à jour l'opération avec le temps de la prochaine tentative
          setCurrentOperation(prev => 
            prev ? { ...prev, nextRetryTime } : null
          );
          
          // Afficher un toast d'information
          if (showToast) {
            toast.info(`Nouvelle tentative dans ${Math.round(delay / 1000)}s...`, {
              description: getUserFriendlyMessage(errorDetails)
            });
          }
          
          // Attendre avant de réessayer
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Réessayer
          return attemptOperation();
        } else {
          // Si on ne réessaie pas, ajouter à la file d'attente si demandé
          if (queueOnFailure && strategy.shouldQueue) {
            addOperation(
              operation,
              context,
              {
                maxRetries: strategy.maxRetries
              }
            );
            
            if (showToast) {
              toast.info('Opération mise en file d\'attente', {
                description: 'Elle sera réessayée automatiquement plus tard'
              });
            }
          } else if (showToast) {
            // Afficher un toast d'erreur
            toast.error(getUserFriendlyMessage(errorDetails), {
              description: context
            });
          }
          
          // Réinitialiser l'opération en cours
          setCurrentOperation(null);
          
          throw error;
        }
      }
    };
    
    return attemptOperation();
  }, [
    categorizeApiError,
    getRetryOptionsForError,
    getUserFriendlyMessage,
    addOperation
  ]);
  
  return {
    executeWithRetry,
    currentOperation,
    getRetryOptionsForError,
    clearOperation: () => setCurrentOperation(null)
  };
}
