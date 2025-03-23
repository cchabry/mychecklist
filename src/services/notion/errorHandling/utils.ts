
import { NotionErrorType } from './types';

/**
 * Utilitaires pour les erreurs Notion
 */
export const notionErrorUtils = {
  /**
   * Détecte le type d'erreur en fonction du message ou de l'objet d'erreur
   */
  detectErrorType(error: unknown): NotionErrorType {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorLower = errorLower = errorMsg.toLowerCase();
    
    // Erreurs d'authentification
    if (errorLower.includes('auth') || 
        errorLower.includes('token') || 
        errorLower.includes('invalid key') ||
        errorLower.includes('unauthorized')) {
      return NotionErrorType.AUTH;
    }
    
    // Erreurs de permission
    if (errorLower.includes('permission') || 
        errorLower.includes('forbidden') || 
        errorLower.includes('access') || 
        errorLower.includes('401') || 
        errorLower.includes('403')) {
      return NotionErrorType.PERMISSION;
    }
    
    // Erreurs CORS
    if (errorLower.includes('cors') || 
        errorLower.includes('origin') || 
        errorLower.includes('cross') || 
        errorLower.includes('fetch') ||
        errorLower.includes('network error')) {
      return NotionErrorType.CORS;
    }
    
    // Erreurs de rate limit
    if (errorLower.includes('rate') || 
        errorLower.includes('limit') || 
        errorLower.includes('too many') || 
        errorLower.includes('429')) {
      return NotionErrorType.RATE_LIMIT;
    }
    
    // Erreurs de base de données
    if (errorLower.includes('database') || 
        errorLower.includes('schema') || 
        errorLower.includes('column') ||
        errorLower.includes('property') ||
        errorLower.includes('invalid structure')) {
      return NotionErrorType.DATABASE;
    }
    
    // Erreurs réseau
    if (errorLower.includes('network') || 
        errorLower.includes('connection') || 
        errorLower.includes('offline') ||
        errorLower.includes('timeout') ||
        errorLower.includes('unreachable')) {
      return NotionErrorType.NETWORK;
    }
    
    // Erreurs de timeout
    if (errorLower.includes('timeout') || 
        errorLower.includes('timed out') || 
        errorLower.includes('too long')) {
      return NotionErrorType.TIMEOUT;
    }
    
    // Resource not found
    if (errorLower.includes('not found') || 
        errorLower.includes('404') || 
        errorLower.includes('missing')) {
      return NotionErrorType.NOT_FOUND;
    }
    
    // Erreurs API génériques
    if (errorLower.includes('api') || 
        errorLower.includes('notion') || 
        errorLower.includes('request') || 
        errorLower.includes('response') || 
        errorLower.includes('server')) {
      return NotionErrorType.API;
    }
    
    // Par défaut
    return NotionErrorType.UNKNOWN;
  },
  
  /**
   * Détermine si une erreur peut être réessayée
   */
  isRetryableError(error: unknown): boolean {
    const errorType = this.detectErrorType(error);
    
    // Certains types d'erreurs sont typiquement retryables
    const retryableTypes = [
      NotionErrorType.NETWORK,
      NotionErrorType.RATE_LIMIT,
      NotionErrorType.TIMEOUT,
      NotionErrorType.API
    ];
    
    return retryableTypes.includes(errorType);
  },
  
  /**
   * Formate une erreur pour l'affichage
   */
  formatErrorForDisplay(error: { message: string, context?: string }): string {
    if (!error) return 'Erreur inconnue';
    
    let message = error.message || 'Erreur inconnue';
    
    // Limiter la longueur
    if (message.length > 200) {
      message = message.substring(0, 197) + '...';
    }
    
    // Ajouter le contexte si disponible
    if (error.context) {
      message = `${error.context}: ${message}`;
    }
    
    return message;
  },
  
  /**
   * Crée un message convivial pour l'utilisateur
   */
  createUserFriendlyMessage(error: { type: NotionErrorType, message: string }): string {
    if (!error) return 'Une erreur s\'est produite';
    
    switch(error.type) {
      case NotionErrorType.AUTH:
        return 'Erreur d\'authentification Notion. Veuillez vérifier vos identifiants.';
        
      case NotionErrorType.PERMISSION:
        return 'Erreur de permission Notion. L\'application n\'a pas accès à cette ressource.';
        
      case NotionErrorType.CORS:
        return 'Erreur de connexion à l\'API Notion. Veuillez vérifier votre configuration CORS.';
        
      case NotionErrorType.RATE_LIMIT:
        return 'Limite de requêtes Notion atteinte. Veuillez réessayer dans quelques instants.';
        
      case NotionErrorType.DATABASE:
        return 'Erreur de base de données Notion. Vérifiez la structure de vos bases.';
        
      case NotionErrorType.NETWORK:
        return 'Erreur de connexion réseau. Vérifiez votre connexion internet.';
        
      case NotionErrorType.TIMEOUT:
        return 'La requête a pris trop de temps. Veuillez réessayer.';
        
      case NotionErrorType.NOT_FOUND:
        return 'Ressource Notion introuvable. Vérifiez les identifiants des ressources.';
        
      default:
        return error.message || 'Une erreur s\'est produite lors de l\'interaction avec Notion';
    }
  }
};
