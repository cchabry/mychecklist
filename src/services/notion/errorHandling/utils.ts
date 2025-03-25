
/**
 * Utilitaires pour la gestion des erreurs
 */

import { NotionErrorType } from './types';

/**
 * Utilitaires pour gérer les erreurs Notion
 */
export const notionErrorUtils = {
  /**
   * Détecte le type d'erreur à partir de son message ou de son instance
   */
  detectErrorType: (error: Error | string): NotionErrorType => {
    const message = typeof error === 'string' ? error.toLowerCase() : error.message.toLowerCase();
    
    // Erreurs d'authentification
    if (message.includes('auth') || 
        message.includes('token') || 
        message.includes('unauthorized') || 
        message.includes('401')) {
      return NotionErrorType.AUTH;
    }
    
    // Erreurs de permission
    if (message.includes('permission') || 
        message.includes('access') || 
        message.includes('forbidden') || 
        message.includes('403')) {
      return NotionErrorType.PERMISSION;
    }
    
    // Limite de requêtes
    if (message.includes('rate') || 
        message.includes('limit') || 
        message.includes('too many') || 
        message.includes('429')) {
      return NotionErrorType.RATE_LIMIT;
    }
    
    // Problèmes réseau
    if (message.includes('network') || 
        message.includes('connection') || 
        message.includes('fetch') || 
        message.includes('offline')) {
      return NotionErrorType.NETWORK;
    }
    
    // Timeout
    if (message.includes('timeout') || 
        message.includes('timed out') || 
        message.includes('too long')) {
      return NotionErrorType.TIMEOUT;
    }
    
    // Erreurs de database
    if (message.includes('database') || 
        message.includes('query') || 
        message.includes('column') || 
        message.includes('property')) {
      return NotionErrorType.DATABASE;
    }
    
    // Problèmes de validation
    if (message.includes('validation') || 
        message.includes('invalid') || 
        message.includes('required') || 
        message.includes('format')) {
      return NotionErrorType.VALIDATION;
    }
    
    // Ressource non trouvée
    if (message.includes('not found') || 
        message.includes('does not exist') || 
        message.includes('404')) {
      return NotionErrorType.NOT_FOUND;
    }
    
    // Erreurs serveur
    if (message.includes('server') || 
        message.includes('500') || 
        message.includes('503') || 
        message.includes('502')) {
      return NotionErrorType.SERVER;
    }
    
    // Problèmes CORS
    if (message.includes('cors') || 
        message.includes('origin') || 
        message.includes('access-control')) {
      return NotionErrorType.CORS;
    }
    
    // Problèmes de proxy
    if (message.includes('proxy') || 
        message.includes('middleware')) {
      return NotionErrorType.PROXY;
    }
    
    // Erreurs de configuration
    if (message.includes('config') || 
        message.includes('setup') || 
        message.includes('integration')) {
      return NotionErrorType.CONFIG;
    }
    
    // Par défaut
    return NotionErrorType.UNKNOWN;
  },
  
  /**
   * Détermine si une erreur est réessayable en fonction de son type
   */
  isRetryableError: (error: Error | string): boolean => {
    const errorType = notionErrorUtils.detectErrorType(error);
    
    // Types d'erreurs réessayables
    const retryableTypes = [
      NotionErrorType.NETWORK,
      NotionErrorType.TIMEOUT,
      NotionErrorType.RATE_LIMIT,
      NotionErrorType.SERVER,
      NotionErrorType.PROXY
    ];
    
    return retryableTypes.includes(errorType);
  },
  
  /**
   * Détermine le délai à attendre avant de réessayer en fonction du nombre de tentatives
   */
  calculateRetryDelay: (attempt: number, baseDelay = 1000, useExponentialBackoff = true): number => {
    if (useExponentialBackoff) {
      // Délai exponentiel avec un peu de hasard pour éviter les "thundering herd"
      const exponentialDelay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 0.25 * exponentialDelay;
      return Math.min(exponentialDelay + jitter, 60000); // Max 1 minute
    } else {
      // Délai linéaire avec un peu de hasard
      const linearDelay = baseDelay * (attempt + 1);
      const jitter = Math.random() * 0.25 * linearDelay;
      return Math.min(linearDelay + jitter, 30000); // Max 30 secondes
    }
  },
  
  /**
   * Formate un message d'erreur pour l'utilisateur
   */
  formatUserFriendlyMessage: (error: Error | string, context?: string): string => {
    const message = typeof error === 'string' ? error : error.message;
    const errorType = notionErrorUtils.detectErrorType(error);
    
    // Messages spécifiques par type d'erreur
    switch (errorType) {
      case NotionErrorType.AUTH:
        return "Erreur d'authentification Notion. Vérifiez votre clé API.";
        
      case NotionErrorType.PERMISSION:
        return "Erreur de permission Notion. Vous n'avez pas accès à cette ressource.";
        
      case NotionErrorType.RATE_LIMIT:
        return "Limite de requêtes Notion atteinte. Veuillez réessayer dans quelques instants.";
        
      case NotionErrorType.NETWORK:
        return "Problème de connexion réseau. Vérifiez votre connexion internet.";
        
      case NotionErrorType.TIMEOUT:
        return "Délai d'attente dépassé. Notion met trop de temps à répondre.";
        
      case NotionErrorType.DATABASE:
        return "Erreur avec la base de données Notion. Vérifiez la structure de vos bases.";
        
      case NotionErrorType.VALIDATION:
        return "Erreur de validation. Les données envoyées ne sont pas valides.";
        
      case NotionErrorType.NOT_FOUND:
        return "Ressource Notion introuvable. Vérifiez les identifiants utilisés.";
        
      case NotionErrorType.SERVER:
        return "Erreur serveur Notion. Veuillez réessayer ultérieurement.";
        
      case NotionErrorType.CORS:
        return "Erreur de connexion à l'API Notion. Problème CORS détecté.";
        
      case NotionErrorType.PROXY:
        return "Erreur du proxy de connexion à Notion. Le service intermédiaire est indisponible.";
        
      case NotionErrorType.CONFIG:
        return "Erreur de configuration Notion. Vérifiez les paramètres de l'intégration.";
        
      default:
        return context 
          ? `Erreur Notion (${context}): ${message}`
          : `Erreur Notion: ${message}`;
    }
  },
  
  /**
   * Détecte si une erreur est due à un problème de configuration
   */
  isConfigurationError: (error: Error | string): boolean => {
    const errorType = notionErrorUtils.detectErrorType(error);
    return errorType === NotionErrorType.AUTH || 
           errorType === NotionErrorType.CONFIG || 
           errorType === NotionErrorType.PERMISSION;
  },
  
  /**
   * Extrait le code d'erreur HTTP si présent dans le message
   */
  extractHttpCode: (message: string): number | null => {
    const match = message.match(/(\b[45][0-9]{2}\b)/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return null;
  }
};
