
/**
 * Gestionnaire de réessai automatique pour les erreurs Notion
 */
import { notionRetryQueue } from './retryQueue';
import { NotionError, NotionErrorType } from '../types/unified';

/**
 * Détermine si une erreur peut être automatiquement réessayée
 */
const canAutoRetry = (error: NotionError): boolean => {
  // Les erreurs réseau sont généralement des candidats pour le réessai automatique
  if (error.type === NotionErrorType.NETWORK) {
    return true;
  }
  
  // Les erreurs de timeout également
  if (error.type === NotionErrorType.TIMEOUT) {
    return true;
  }
  
  // Les erreurs de limitation de débit Notion
  if (error.type === NotionErrorType.RATE_LIMIT) {
    return true;
  }
  
  // Certaines erreurs serveur (500, 502, 503, 504)
  if (error.type === NotionErrorType.SERVER) {
    return true;
  }
  
  // Si le flag retryable est explicitement défini
  if (error.retryable) {
    return true;
  }
  
  return false;
};

/**
 * Gestionnaire de réessai automatique
 */
export const autoRetryHandler = {
  /**
   * Tente de gérer une erreur avec réessai automatique
   * @returns true si l'erreur a été prise en charge, false sinon
   */
  handleError(error: NotionError, operation?: () => Promise<any>): boolean {
    if (!canAutoRetry(error) || !operation) {
      return false;
    }
    
    // Ajouter l'opération à la file d'attente
    const context = error.context 
      ? (typeof error.context === 'string' ? error.context : 'Opération')
      : 'Opération en échec';
      
    notionRetryQueue.addOperation(
      operation, 
      context, 
      3, // Nombre maximal de tentatives par défaut
      {
        delayBetweenAttempts: 
          error.type === NotionErrorType.RATE_LIMIT 
            ? 30000 // 30 secondes pour les erreurs de limitation
            : 5000  // 5 secondes pour les autres erreurs
      }
    );
    
    return true;
  },
  
  /**
   * Crée un wrapper de fonction avec réessai automatique
   */
  withAutoRetry<T>(
    fn: () => Promise<T>,
    context: string = 'Opération'
  ): () => Promise<T> {
    return async () => {
      try {
        return await fn();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        
        // Créer une NotionError à partir de l'erreur
        const notionError = {
          id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          message: error.message,
          type: NotionErrorType.UNKNOWN, // Sera raffiné par handleError
          timestamp: Date.now(),
          context,
          severity: NotionErrorType.ERROR,
          retryable: true,
          original: error
        } as NotionError;
        
        // Essayer le réessai automatique
        if (this.handleError(notionError, fn)) {
          throw new Error(`${error.message} (mise en file d'attente pour réessai)`);
        }
        
        // Si pas de réessai, propager l'erreur originale
        throw error;
      }
    };
  }
};

export default autoRetryHandler;
