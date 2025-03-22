
import { notionErrorService } from './errorService';
import { notionRetryQueue } from './retryQueue';
import { NotionError, NotionErrorType } from './types';
import { operationMode } from '@/services/operationMode';

/**
 * Gère automatiquement les erreurs et détermine si une opération échouée
 * doit être mise en file d'attente pour un nouvel essai plus tard
 */
export const autoRetryHandler = {
  /**
   * Exécute une opération avec gestion d'erreur automatique et mise en file d'attente
   * @param operation Fonction asynchrone à exécuter
   * @param context Contexte de l'opération (pour le diagnostic)
   * @param maxRetries Nombre maximal d'essais (par défaut: 3)
   * @returns Le résultat de l'opération ou lance une erreur
   */
  async execute<T>(
    operation: () => Promise<T>,
    context: Record<string, any> = {},
    maxRetries: number = 3
  ): Promise<T> {
    try {
      // Tenter d'exécuter l'opération normalement
      return await operation();
    } catch (error) {
      // Enrichir l'erreur avec le service de gestion d'erreurs
      const notionError = notionErrorService.handleError(error instanceof Error ? error : new Error(String(error)), context);
      
      // Déterminer si l'erreur est récupérable
      if (this.shouldRetry(notionError)) {
        // Mettre en file d'attente pour un nouvel essai ultérieur
        const operationId = notionRetryQueue.enqueue(
          operation,
          context,
          {
            maxRetries,
            onSuccess: (result) => {
              console.log(`[AutoRetry] Opération réussie après retry (${operationId})`);
            },
            onFailure: (finalError) => {
              console.error(`[AutoRetry] Échec définitif de l'opération (${operationId})`, finalError);
              
              // Si échec définitif, passer en mode démo si pertinent
              if (finalError.type === NotionErrorType.NETWORK ||
                  finalError.type === NotionErrorType.AUTH) {
                operationMode.enableDemoMode(`Échec répété: ${finalError.message}`);
              }
            }
          }
        );
        
        console.log(`[AutoRetry] Opération mise en file d'attente (${operationId})`);
      }
      
      // Relancer l'erreur pour permettre à l'appelant de la gérer
      throw notionError;
    }
  },
  
  /**
   * Détermine si une erreur doit être mise en file d'attente pour un nouvel essai
   */
  shouldRetry(error: NotionError): boolean {
    // Vérifier si l'erreur est récupérable selon ses métadonnées
    if (error.recoverable === true) {
      return true;
    }
    
    // Vérifier le type d'erreur spécifique
    switch (error.type) {
      // Les erreurs réseau sont généralement temporaires et peuvent être réessayées
      case NotionErrorType.NETWORK:
        return true;
        
      // Les erreurs de limite d'API peuvent être résolues après un délai
      case NotionErrorType.RATE_LIMIT:
        return true;
        
      // Les autres types d'erreurs ne sont généralement pas récupérables automatiquement
      case NotionErrorType.AUTH:
      case NotionErrorType.PERMISSION:
      case NotionErrorType.VALIDATION:
      case NotionErrorType.DATABASE:
      case NotionErrorType.UNKNOWN:
      default:
        return false;
    }
  }
};
