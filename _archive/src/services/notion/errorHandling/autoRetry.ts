
/**
 * Service de réessai automatique pour les opérations Notion
 */

import { notionErrorUtils } from './utils';
import { notionRetryQueue } from './retryQueue';
import { RetryOperationOptions } from '../types/unified';

/**
 * Utilitaire pour réessayer automatiquement les opérations Notion
 */
export const autoRetryHandler = {
  /**
   * Exécute une opération avec réessai automatique
   */
  async execute<T>(
    operation: () => Promise<T>,
    context: string | Record<string, any> = {},
    options: RetryOperationOptions = {}
  ): Promise<T> {
    try {
      // Tenter d'exécuter l'opération directement
      return await operation();
    } catch (error) {
      // Convertir en instance d'Error
      const err = error instanceof Error ? error : new Error(String(error));
      
      // Vérifier si l'erreur est réessayable
      if (!notionErrorUtils.isRetryableError(err)) {
        throw err;
      }
      
      // Si des conditions spécifiques empêchent le réessai
      if (options.skipRetryIf && options.skipRetryIf(err)) {
        throw err;
      }
      
      // Ajouter à la file d'attente de réessai
      return new Promise<T>((resolve, reject) => {
        const operationId = notionRetryQueue.enqueue(
          operation,
          context,
          {
            ...options,
            onSuccess: (result) => {
              if (options.onSuccess) {
                options.onSuccess(result);
              }
              resolve(result as T);
            },
            onFailure: (error) => {
              if (options.onFailure) {
                options.onFailure(error);
              }
              reject(error);
            }
          }
        );
        
        console.log(`[AutoRetry] Opération placée en file d'attente: ${operationId}`);
      });
    }
  },
  
  /**
   * Crée une version avec réessai automatique d'une fonction
   */
  createAutoRetryFunction<T, Args extends any[]>(
    fn: (...args: Args) => Promise<T>,
    contextGenerator: (args: Args) => string | Record<string, any> = () => 'Auto-retry operation',
    options: RetryOperationOptions = {}
  ): (...args: Args) => Promise<T> {
    return async (...args: Args): Promise<T> => {
      return this.execute(
        () => fn(...args),
        contextGenerator(args),
        options
      );
    };
  },
  
  /**
   * Décore une méthode de classe avec réessai automatique
   */
  autoRetry<T, Args extends any[]>(
    contextGenerator: (args: Args) => string | Record<string, any> = () => 'Auto-retry method',
    options: RetryOperationOptions = {}
  ): MethodDecorator {
    return function(
      target: any,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor
    ) {
      const originalMethod = descriptor.value as (...args: Args) => Promise<T>;
      
      descriptor.value = async function(...args: Args): Promise<T> {
        return autoRetryHandler.execute(
          () => originalMethod.apply(this, args),
          contextGenerator(args),
          options
        );
      };
      
      return descriptor;
    };
  }
};
