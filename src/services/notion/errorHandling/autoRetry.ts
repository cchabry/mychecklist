
import { RetryOperationOptions } from '../types/errorTypes';
import { notionErrorService } from './errorService';

/**
 * Configuration de base pour l'auto-retry
 */
interface AutoRetryConfig {
  defaultMaxRetries: number;
  defaultRetryDelay: number;
  exponentialBackoff: boolean;
  jitter: boolean;
  maxRetryDelay: number;
}

/**
 * Service de réessai automatique pour les opérations
 */
export class AutoRetryHandler {
  private static instance: AutoRetryHandler;
  
  private config: AutoRetryConfig = {
    defaultMaxRetries: 3,
    defaultRetryDelay: 1000, // 1 seconde
    exponentialBackoff: true,
    jitter: true,
    maxRetryDelay: 30000 // 30 secondes
  };
  
  private constructor() {}
  
  /**
   * Obtenir l'instance unique du service
   */
  public static getInstance(): AutoRetryHandler {
    if (!AutoRetryHandler.instance) {
      AutoRetryHandler.instance = new AutoRetryHandler();
    }
    return AutoRetryHandler.instance;
  }
  
  /**
   * Configurer l'auto-retry
   */
  public configure(config: Partial<AutoRetryConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Exécuter une opération avec réessai automatique
   */
  public async execute<T>(
    operation: () => Promise<T>,
    context: string | Record<string, any> = {},
    options: RetryOperationOptions = {}
  ): Promise<T> {
    const {
      maxRetries = this.config.defaultMaxRetries,
      retryDelay = this.config.defaultRetryDelay,
      onSuccess,
      onFailure,
      skipRetryIf
    } = options;
    
    // Convertir le contexte en objet si c'est une chaîne
    const contextObj = typeof context === 'string' 
      ? { operation: context } 
      : context;
    
    let attempt = 0;
    let lastError: Error | null = null;
    
    while (attempt <= maxRetries) {
      try {
        // Exécuter l'opération
        const result = await operation();
        
        // Appeler le callback de succès
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (error) {
        // Incrémenter le nombre de tentatives
        attempt++;
        
        // Convertir l'erreur en objet Error
        const typedError = error instanceof Error ? error : new Error(String(error));
        lastError = typedError;
        
        // Signaler l'erreur au service
        notionErrorService.reportError(typedError, typeof context === 'string' ? context : 'Auto-retry operation', {
          context: contextObj,
          retryable: attempt < maxRetries
        });
        
        // Vérifier si on doit sauter le réessai
        if (skipRetryIf && skipRetryIf(typedError)) {
          console.log(`[AutoRetry] Ignorer le réessai pour ${JSON.stringify(contextObj)}, condition de saut satisfaite`);
          break;
        }
        
        // Vérifier si on a atteint le nombre maximum de tentatives
        if (attempt >= maxRetries) {
          console.error(`[AutoRetry] Abandon après ${attempt} tentatives pour ${JSON.stringify(contextObj)}`);
          break;
        }
        
        // Calculer le délai avant la prochaine tentative
        const nextDelay = this.calculateRetryDelay(attempt, retryDelay);
        
        console.log(`[AutoRetry] Tentative ${attempt}/${maxRetries} échouée pour ${JSON.stringify(contextObj)}, nouvelle tentative dans ${nextDelay}ms`);
        
        // Attendre avant la prochaine tentative
        await new Promise(resolve => setTimeout(resolve, nextDelay));
      }
    }
    
    // Si on arrive ici, c'est que toutes les tentatives ont échoué
    if (lastError && onFailure) {
      onFailure(lastError);
    }
    
    throw lastError || new Error(`Échec de l'opération après ${maxRetries} tentatives`);
  }
  
  /**
   * Calculer le délai avant la prochaine tentative
   */
  private calculateRetryDelay(attempt: number, baseDelay: number): number {
    let delay = baseDelay;
    
    // Appliquer un backoff exponentiel si configuré
    if (this.config.exponentialBackoff) {
      delay = baseDelay * Math.pow(2, attempt - 1);
    }
    
    // Limiter le délai maximum
    delay = Math.min(delay, this.config.maxRetryDelay);
    
    // Ajouter du jitter si configuré (variation aléatoire de ±25%)
    if (this.config.jitter) {
      const jitterRange = delay * 0.25;
      delay = delay - jitterRange + Math.random() * jitterRange * 2;
    }
    
    return Math.floor(delay);
  }
  
  /**
   * Créer une fonction qui utilise auto-retry
   */
  public wrapFunction<T, Args extends any[]>(
    fn: (...args: Args) => Promise<T>,
    contextGenerator: (args: Args) => string | Record<string, any>,
    options: RetryOperationOptions = {}
  ): ((...args: Args) => Promise<T>) {
    return async (...args: Args): Promise<T> => {
      return this.execute(
        () => fn(...args),
        contextGenerator(args),
        options
      );
    };
  }
}

// Exporter une instance singleton
export const autoRetryHandler = AutoRetryHandler.getInstance();
