
/**
 * Service de réessai automatique pour les opérations Notion
 */
import { notionRetryQueue } from './retryQueue';
import { notionErrorService } from './errorService';
import { NotionError, NotionErrorType, RetryOperationOptions } from '../types/unified';

class AutoRetryService {
  /**
   * Vérifie si une erreur peut être réessayée automatiquement
   */
  public canAutoRetry(error: NotionError): boolean {
    // Les erreurs réseau peuvent généralement être réessayées
    if (error.type === NotionErrorType.NETWORK) {
      return true;
    }
    
    // Les erreurs de temps d'attente peuvent être réessayées
    if (error.type === NotionErrorType.TIMEOUT) {
      return true;
    }
    
    // Les erreurs de limite de débit peuvent être réessayées après un délai
    if (error.type === NotionErrorType.RATE_LIMIT) {
      return true;
    }
    
    // Les erreurs serveur peuvent souvent être réessayées
    if (error.type === NotionErrorType.SERVER) {
      return true;
    }
    
    // Par défaut, on considère que l'erreur ne peut pas être réessayée
    return false;
  }

  /**
   * Exécute une opération avec gestion des erreurs et réessais automatiques
   */
  public async execute<T>(
    operation: () => Promise<T>,
    context: string | Record<string, any> = {},
    options: RetryOperationOptions = {}
  ): Promise<T> {
    try {
      // Tentative d'exécution directe
      return await operation();
    } catch (error) {
      // Créer une erreur standardisée
      const contextStr = typeof context === 'string' ? context : JSON.stringify(context);
      const notionError = notionErrorService.reportError(error, contextStr);
      
      // Vérifier si on peut réessayer
      if (this.canAutoRetry(notionError) && !options.skipRetryIf?.(error as Error)) {
        console.log(`Ajout de l'opération à la file d'attente pour réessai automatique. Contexte: ${contextStr}`);
        
        // Calculer la priorité en fonction du type d'erreur
        let priority = options.priority ?? 0;
        
        if (notionError.type === NotionErrorType.RATE_LIMIT) {
          priority -= 10; // Priorité basse pour les limites de débit
        } else if (notionError.type === NotionErrorType.NETWORK) {
          priority += 10; // Priorité haute pour les erreurs réseau
        }
        
        // Retourner une promesse qui sera résolue/rejetée lorsque l'opération sera réessayée
        return new Promise<T>((resolve, reject) => {
          notionRetryQueue.enqueue(
            contextStr,
            async () => {
              try {
                const result = await operation();
                
                if (options.onSuccess) {
                  options.onSuccess(result);
                }
                
                resolve(result);
                return result;
              } catch (retryError) {
                if (options.onFailure) {
                  options.onFailure(retryError as Error);
                }
                
                reject(retryError);
                throw retryError;
              }
            },
            {
              description: `Réessai automatique: ${contextStr}`,
              maxRetries: options.maxRetries,
              priority,
              tags: [...(options.tags || []), 'auto-retry', `error-type:${notionError.type}`]
            }
          );
        });
      }
      
      // Si on ne peut pas réessayer, propager l'erreur
      if (options.onFailure) {
        options.onFailure(error as Error);
      }
      
      throw error;
    }
  }
}

// Exporter une instance unique du service
export const autoRetryHandler = new AutoRetryService();
