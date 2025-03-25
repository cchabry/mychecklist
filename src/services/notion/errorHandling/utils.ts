
import { NotionErrorType } from './types';

/**
 * Utilitaires pour la gestion des erreurs Notion
 */
export const notionErrorUtils = {
  /**
   * Détecte le type d'erreur en fonction du message
   */
  detectErrorType(error: string | Error): NotionErrorType {
    const message = typeof error === 'string' 
      ? error.toLowerCase() 
      : error.message.toLowerCase();
    
    if (message.includes('unauthorized') || message.includes('auth') || message.includes('token') || message.includes('key') || message.includes('401')) {
      return NotionErrorType.AUTH;
    }
    
    if (message.includes('permission') || message.includes('access') || message.includes('forbidden') || message.includes('403')) {
      return NotionErrorType.PERMISSION;
    }
    
    if (message.includes('rate limit') || message.includes('too many') || message.includes('429')) {
      return NotionErrorType.RATE_LIMIT;
    }
    
    if (message.includes('network') || message.includes('connection') || message.includes('fetch') || message.includes('cors')) {
      return NotionErrorType.NETWORK;
    }
    
    if (message.includes('timeout') || message.includes('timed out')) {
      return NotionErrorType.TIMEOUT;
    }
    
    if (message.includes('database') || message.includes('db') || message.includes('not found') || message.includes('404')) {
      return NotionErrorType.DATABASE;
    }
    
    if (message.includes('api') || message.includes('notion api')) {
      return NotionErrorType.API;
    }
    
    return NotionErrorType.UNKNOWN;
  },
  
  /**
   * Détermine si une erreur est réessayable
   */
  isRetryableError(error: string | Error): boolean {
    const errorType = this.detectErrorType(error);
    
    // Les erreurs réseau, de timeout et de limite de taux sont généralement réessayables
    return [
      NotionErrorType.NETWORK,
      NotionErrorType.TIMEOUT,
      NotionErrorType.RATE_LIMIT
    ].includes(errorType);
  },
  
  /**
   * Calcule le délai avant de réessayer en fonction du nombre de tentatives
   */
  calculateRetryDelay(attempt: number, baseDelay: number = 1000, useExponentialBackoff: boolean = true): number {
    if (!useExponentialBackoff) {
      return baseDelay;
    }
    
    // Backoff exponentiel avec une certaine randomisation
    const exponentialDelay = Math.min(
      30000, // 30 secondes max
      baseDelay * Math.pow(2, attempt - 1)
    );
    
    // Ajouter une randomisation (jitter) pour éviter que toutes les requêtes
    // ne soient réessayées exactement en même temps
    return exponentialDelay + Math.floor(Math.random() * 1000);
  },
  
  /**
   * Formate un message d'erreur de façon plus conviviale pour l'utilisateur
   */
  formatUserFriendlyMessage(error: string | Error, context?: string): string {
    const message = typeof error === 'string' ? error : error.message;
    const errorType = this.detectErrorType(error);
    
    let userMessage = '';
    
    switch (errorType) {
      case NotionErrorType.AUTH:
        userMessage = "Problème d'authentification avec Notion. Veuillez vérifier vos identifiants.";
        break;
        
      case NotionErrorType.PERMISSION:
        userMessage = "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource Notion.";
        break;
        
      case NotionErrorType.RATE_LIMIT:
        userMessage = "Notion a temporairement limité les requêtes. Veuillez réessayer dans quelques minutes.";
        break;
        
      case NotionErrorType.NETWORK:
        userMessage = "Problème de connexion au serveur Notion. Vérifiez votre connexion Internet.";
        break;
        
      case NotionErrorType.TIMEOUT:
        userMessage = "La requête vers Notion a pris trop de temps. Veuillez réessayer.";
        break;
        
      case NotionErrorType.DATABASE:
        userMessage = "Problème avec la base de données Notion. Vérifiez que l'ID est correct et que vous avez les accès.";
        break;
        
      case NotionErrorType.API:
        userMessage = "Erreur de l'API Notion. Vérifiez la validité de votre requête.";
        break;
        
      default:
        userMessage = `Erreur Notion: ${message}`;
    }
    
    return context ? `${userMessage} (${context})` : userMessage;
  },
  
  /**
   * Vérifie si une erreur est liée à la configuration
   */
  isConfigurationError(error: string | Error): boolean {
    const errorType = this.detectErrorType(error);
    return [
      NotionErrorType.AUTH,
      NotionErrorType.PERMISSION,
      NotionErrorType.DATABASE
    ].includes(errorType);
  },
  
  /**
   * Crée une nouvelle instance d'erreur Notion
   */
  createError(message: string, options = {}) {
    // Déléguer à notionErrorService
    const { notionErrorService } = require('./errorService');
    return notionErrorService.createError(message, options);
  }
};
