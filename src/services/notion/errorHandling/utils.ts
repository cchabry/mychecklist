
import { NotionError, NotionErrorType } from './types';

/**
 * Utilitaires pour la gestion des erreurs Notion
 */
export const notionErrorUtils = {
  /**
   * Détecte le type d'erreur à partir d'une erreur JavaScript
   */
  detectErrorType(error: Error | unknown): NotionErrorType {
    if (!error) return NotionErrorType.UNKNOWN;
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Erreurs liées au CORS
    if (
      errorMessage.includes('Failed to fetch') || 
      errorMessage.includes('Network Error') ||
      errorMessage.includes('CORS')
    ) {
      return NotionErrorType.CORS;
    }
    
    // Erreurs d'authentification
    if (
      errorMessage.includes('unauthorized') || 
      errorMessage.includes('invalid token') ||
      errorMessage.includes('Authentication error') ||
      errorMessage.includes('401')
    ) {
      return NotionErrorType.AUTHENTICATION;
    }
    
    // Erreurs liées à la structure de la base de données
    if (
      errorMessage.includes('database') ||
      errorMessage.includes('property') ||
      errorMessage.includes('schema')
    ) {
      return NotionErrorType.DATABASE;
    }
    
    // Erreurs réseau génériques
    if (
      errorMessage.includes('network') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('connection')
    ) {
      return NotionErrorType.NETWORK;
    }
    
    // Par défaut, considéré comme une erreur API
    return NotionErrorType.API;
  },
  
  /**
   * Détermine si une erreur est récupérable (peut être retentée)
   */
  isRetryableError(error: Error | unknown): boolean {
    if (!error) return false;
    
    const errorType = this.detectErrorType(error);
    
    // Les erreurs CORS et réseau sont généralement retryables
    if (errorType === NotionErrorType.CORS || errorType === NotionErrorType.NETWORK) {
      return true;
    }
    
    // Les erreurs d'authentification ne sont pas retryables sans changement de configuration
    if (errorType === NotionErrorType.AUTHENTICATION) {
      return false;
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Certaines erreurs API sont retryables (rate limiting, etc.)
    if (
      errorMessage.includes('rate_limited') ||
      errorMessage.includes('500') ||
      errorMessage.includes('503') ||
      errorMessage.includes('service unavailable')
    ) {
      return true;
    }
    
    return false;
  },
  
  /**
   * Formate une erreur pour l'affichage
   */
  formatErrorForDisplay(error: NotionError): string {
    let message = error.message || 'Erreur inconnue';
    
    // Ajouter des informations contextuelles
    if (error.operation) {
      message += ` [Opération: ${error.operation}]`;
    }
    
    if (error.context) {
      message += ` [Contexte: ${error.context}]`;
    }
    
    return message;
  },
  
  /**
   * Crée un message d'erreur convivial
   */
  createUserFriendlyMessage(error: NotionError): string {
    switch (error.type) {
      case NotionErrorType.CORS:
        return "Impossible d'accéder à l'API Notion directement depuis votre navigateur. L'application utilise un mode alternatif pour fonctionner.";
      
      case NotionErrorType.AUTHENTICATION:
        return "Problème d'authentification avec Notion. Veuillez vérifier votre clé d'API.";
      
      case NotionErrorType.DATABASE:
        return "Problème avec la structure de votre base de données Notion. Certains champs requis pourraient être manquants.";
      
      case NotionErrorType.NETWORK:
        return "Problème de connexion réseau. Veuillez vérifier votre connexion internet.";
      
      case NotionErrorType.API:
        return "Erreur lors de la communication avec l'API Notion. Veuillez réessayer ultérieurement.";
      
      default:
        return error.message || "Une erreur s'est produite lors de l'interaction avec Notion.";
    }
  }
};
