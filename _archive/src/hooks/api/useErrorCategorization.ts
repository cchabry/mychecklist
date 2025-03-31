
import { useState, useCallback } from 'react';

export type ApiErrorType = 
  | 'connection'     // Problèmes de connexion réseau
  | 'authentication' // Problèmes d'authentification
  | 'authorization'  // Problèmes de permissions
  | 'validation'     // Erreurs de validation des données
  | 'not_found'      // Ressource non trouvée
  | 'conflict'       // Conflit de données
  | 'rate_limit'     // Limite de requêtes atteinte
  | 'server'         // Erreur serveur
  | 'timeout'        // Délai d'expiration
  | 'parse'          // Erreur d'analyse de la réponse
  | 'business'       // Erreur métier
  | 'unknown';       // Erreur non catégorisée

export interface ApiErrorDetails {
  type: ApiErrorType;
  message: string;
  originalError?: Error;
  statusCode?: number;
  details?: any;
  timestamp: number;
  retryable: boolean;
  recoverable: boolean;
}

/**
 * Hook pour catégoriser les erreurs d'API
 */
export function useErrorCategorization() {
  const [lastApiError, setLastApiError] = useState<ApiErrorDetails | null>(null);
  
  /**
   * Catégorise une erreur en fonction de son message et du code de statut
   */
  const categorizeApiError = useCallback((error: Error | unknown, statusCode?: number): ApiErrorDetails => {
    // Normaliser l'erreur
    const normalizedError = error instanceof Error ? error : new Error(String(error));
    const errorMessage = normalizedError.message.toLowerCase();
    
    let type: ApiErrorType = 'unknown';
    let retryable = false;
    let recoverable = false;
    
    // Catégoriser en fonction du code de statut HTTP si disponible
    if (statusCode) {
      if (statusCode >= 500) {
        type = 'server';
        retryable = true;
      } else if (statusCode === 401) {
        type = 'authentication';
        recoverable = true;
      } else if (statusCode === 403) {
        type = 'authorization';
        recoverable = true;
      } else if (statusCode === 404) {
        type = 'not_found';
        recoverable = true;
      } else if (statusCode === 409) {
        type = 'conflict';
        recoverable = true;
      } else if (statusCode === 422 || statusCode === 400) {
        type = 'validation';
        recoverable = false;
      } else if (statusCode === 429) {
        type = 'rate_limit';
        retryable = true;
        recoverable = true;
      }
    } else {
      // Catégoriser en fonction du message d'erreur
      if (errorMessage.includes('network') || 
          errorMessage.includes('fetch') || 
          errorMessage.includes('connection') || 
          errorMessage.includes('connexion')) {
        type = 'connection';
        retryable = true;
        recoverable = true;
      } else if (errorMessage.includes('timeout') || 
                 errorMessage.includes('expir') || 
                 errorMessage.includes('délai')) {
        type = 'timeout';
        retryable = true;
        recoverable = true;
      } else if (errorMessage.includes('parse') || 
                 errorMessage.includes('json') || 
                 errorMessage.includes('syntax')) {
        type = 'parse';
        retryable = false;
        recoverable = false;
      } else if (errorMessage.includes('auth') || 
                 errorMessage.includes('login') || 
                 errorMessage.includes('token')) {
        type = 'authentication';
        retryable = false;
        recoverable = true;
      } else if (errorMessage.includes('permission') || 
                 errorMessage.includes('forbidden') || 
                 errorMessage.includes('access')) {
        type = 'authorization';
        retryable = false;
        recoverable = true;
      } else if (errorMessage.includes('not found') || 
                 errorMessage.includes('introuvable')) {
        type = 'not_found';
        retryable = false;
        recoverable = true;
      } else if (errorMessage.includes('valid') || 
                 errorMessage.includes('format') || 
                 errorMessage.includes('required')) {
        type = 'validation';
        retryable = false;
        recoverable = false;
      } else if (errorMessage.includes('business') || 
                 errorMessage.includes('métier') || 
                 errorMessage.includes('rule')) {
        type = 'business';
        retryable = false;
        recoverable = false;
      }
    }
    
    // Créer l'objet d'erreur détaillé
    const errorDetails: ApiErrorDetails = {
      type,
      message: normalizedError.message,
      originalError: normalizedError,
      statusCode,
      timestamp: Date.now(),
      retryable,
      recoverable
    };
    
    // Stocker l'erreur
    setLastApiError(errorDetails);
    
    return errorDetails;
  }, []);
  
  /**
   * Détermine si l'erreur est retryable
   */
  const isRetryableError = useCallback((error: Error | unknown, statusCode?: number): boolean => {
    const details = categorizeApiError(error, statusCode);
    return details.retryable;
  }, [categorizeApiError]);
  
  /**
   * Détermine si l'erreur est récupérable
   */
  const isRecoverableError = useCallback((error: Error | unknown, statusCode?: number): boolean => {
    const details = categorizeApiError(error, statusCode);
    return details.recoverable;
  }, [categorizeApiError]);
  
  /**
   * Génère un message utilisateur en fonction du type d'erreur
   */
  const getUserFriendlyMessage = useCallback((errorDetails: ApiErrorDetails): string => {
    switch (errorDetails.type) {
      case 'connection':
        return 'Problème de connexion. Veuillez vérifier votre connexion internet.';
      
      case 'authentication':
        return 'Problème d\'authentification. Veuillez vous reconnecter.';
      
      case 'authorization':
        return 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.';
      
      case 'validation':
        return 'Les données saisies ne sont pas valides. Veuillez vérifier votre saisie.';
      
      case 'not_found':
        return 'La ressource demandée n\'existe pas ou a été supprimée.';
      
      case 'conflict':
        return 'Un conflit est survenu. La ressource a peut-être été modifiée par un autre utilisateur.';
      
      case 'rate_limit':
        return 'Trop de requêtes ont été effectuées. Veuillez réessayer plus tard.';
      
      case 'server':
        return 'Une erreur est survenue sur le serveur. Veuillez réessayer ultérieurement.';
      
      case 'timeout':
        return 'Le délai d\'attente a été dépassé. Veuillez réessayer.';
      
      case 'parse':
        return 'Erreur lors de l\'analyse des données. Veuillez contacter le support.';
      
      case 'business':
        return 'Une règle métier n\'a pas été respectée. Veuillez ajuster vos données.';
      
      default:
        return errorDetails.message || 'Une erreur inattendue s\'est produite.';
    }
  }, []);
  
  /**
   * Réinitialise la dernière erreur
   */
  const clearLastApiError = useCallback(() => {
    setLastApiError(null);
  }, []);
  
  return {
    categorizeApiError,
    isRetryableError,
    isRecoverableError,
    getUserFriendlyMessage,
    lastApiError,
    clearLastApiError
  };
}
