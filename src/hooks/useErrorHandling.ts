
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  notionErrorService, 
  NotionErrorType,
  NotionErrorSeverity
} from '@/services/notion/errorHandling';
import { useRecoveryStrategies } from './useRecoveryStrategies';

export type ErrorCategory = 
  | 'network'         // Problèmes réseau
  | 'authentication'  // Problèmes d'authentification
  | 'authorization'   // Problèmes d'autorisation
  | 'validation'      // Erreurs de validation
  | 'resource'        // Ressource non trouvée
  | 'api'             // Erreurs d'API
  | 'timeout'         // Timeout
  | 'business'        // Erreurs métier
  | 'unknown';        // Non catégorisé

export interface ErrorDetails {
  message: string;
  category: ErrorCategory;
  originalError: any;
  context?: string;
  timestamp: number;
  critical: boolean;
  retryable: boolean;
  id: string;
}

/**
 * Hook pour la gestion unifiée des erreurs
 */
export function useErrorHandling() {
  const [lastError, setLastError] = useState<ErrorDetails | null>(null);
  const [errorHistory, setErrorHistory] = useState<ErrorDetails[]>([]);
  const { attemptAutomaticRecovery } = useRecoveryStrategies();
  
  /**
   * Catégorise une erreur
   */
  const categorizeError = useCallback((error: Error | string): {
    category: ErrorCategory;
    critical: boolean;
    retryable: boolean;
  } => {
    const message = typeof error === 'string' ? error : error.message;
    const lowerMessage = message.toLowerCase();
    
    // Problèmes réseau
    if (
      lowerMessage.includes('network') ||
      lowerMessage.includes('fetch') ||
      lowerMessage.includes('connection') ||
      lowerMessage.includes('réseau') ||
      lowerMessage.includes('connexion')
    ) {
      return {
        category: 'network',
        critical: false, // Les erreurs réseau sont généralement transitoires
        retryable: true
      };
    }
    
    // Problèmes d'authentification
    if (
      lowerMessage.includes('auth') ||
      lowerMessage.includes('token') ||
      lowerMessage.includes('login') ||
      lowerMessage.includes('credentials') ||
      lowerMessage.includes('unauthorized') ||
      lowerMessage.includes('401')
    ) {
      return {
        category: 'authentication',
        critical: true, // Les erreurs d'authentification nécessitent une intervention
        retryable: false
      };
    }
    
    // Problèmes d'autorisation
    if (
      lowerMessage.includes('permission') ||
      lowerMessage.includes('forbidden') ||
      lowerMessage.includes('access') ||
      lowerMessage.includes('unauthorized') ||
      lowerMessage.includes('403')
    ) {
      return {
        category: 'authorization',
        critical: true, // Les erreurs d'autorisation nécessitent une intervention
        retryable: false
      };
    }
    
    // Erreurs de validation
    if (
      lowerMessage.includes('valid') ||
      lowerMessage.includes('format') ||
      lowerMessage.includes('required') ||
      lowerMessage.includes('missing') ||
      lowerMessage.includes('400')
    ) {
      return {
        category: 'validation',
        critical: false, // Les erreurs de validation sont généralement liées aux entrées
        retryable: false
      };
    }
    
    // Ressource non trouvée
    if (
      lowerMessage.includes('not found') ||
      lowerMessage.includes('introuvable') ||
      lowerMessage.includes('404')
    ) {
      return {
        category: 'resource',
        critical: false, // Peut être une erreur d'URL ou de donnée
        retryable: false
      };
    }
    
    // Timeout
    if (
      lowerMessage.includes('timeout') ||
      lowerMessage.includes('timed out') ||
      lowerMessage.includes('délai') ||
      lowerMessage.includes('timeout') ||
      lowerMessage.includes('too long')
    ) {
      return {
        category: 'timeout',
        critical: false, // Les timeouts peuvent être temporaires
        retryable: true
      };
    }
    
    // Erreurs métier
    if (
      lowerMessage.includes('business') ||
      lowerMessage.includes('rule') ||
      lowerMessage.includes('logic') ||
      lowerMessage.includes('métier')
    ) {
      return {
        category: 'business',
        critical: true, // Les erreurs métier sont souvent critiques
        retryable: false
      };
    }
    
    // Erreurs d'API génériques
    if (
      lowerMessage.includes('api') ||
      lowerMessage.includes('server') ||
      lowerMessage.includes('unexpected') ||
      lowerMessage.includes('service')
    ) {
      return {
        category: 'api',
        critical: false, // Considérer comme non critique par défaut
        retryable: true
      };
    }
    
    // Par défaut, considérer comme inconnu
    return {
      category: 'unknown',
      critical: false,
      retryable: false
    };
  }, []);
  
  /**
   * Gère une erreur et renvoie les détails
   */
  const handleError = useCallback((
    error: Error | string,
    context: string = 'Opération',
    options: {
      category?: ErrorCategory;
      critical?: boolean;
      retryable?: boolean;
      showToast?: boolean;
      autoRecover?: boolean;
    } = {}
  ): ErrorDetails => {
    // Extraire le message d'erreur
    const message = typeof error === 'string' ? error : error.message;
    
    // Catégoriser l'erreur si non spécifiée
    const categorization = options.category 
      ? { 
          category: options.category, 
          critical: options.critical ?? false, 
          retryable: options.retryable ?? false 
        } 
      : categorizeError(error);
    
    // Créer les détails de l'erreur
    const errorDetails: ErrorDetails = {
      message,
      category: categorization.category,
      originalError: error,
      context,
      timestamp: Date.now(),
      critical: options.critical ?? categorization.critical,
      retryable: options.retryable ?? categorization.retryable,
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()
    };
    
    // Mettre à jour l'état
    setLastError(errorDetails);
    setErrorHistory(prev => [errorDetails, ...prev].slice(0, 10));
    
    // Signaler l'erreur au service Notion
    if (context.toLowerCase().includes('notion')) {
      // Mapper la catégorie vers le type d'erreur Notion
      let notionErrorType = NotionErrorType.UNKNOWN;
      
      switch (errorDetails.category) {
        case 'network':
          notionErrorType = NotionErrorType.NETWORK;
          break;
        case 'authentication':
          notionErrorType = NotionErrorType.AUTH;
          break;
        case 'authorization':
          notionErrorType = NotionErrorType.PERMISSION;
          break;
        case 'timeout':
          notionErrorType = NotionErrorType.TIMEOUT;
          break;
        case 'resource':
          notionErrorType = NotionErrorType.NOT_FOUND;
          break;
      }
      
      // Signaler au service d'erreurs Notion
      notionErrorService.reportError(error, context, { 
        type: notionErrorType 
      });
    }
    
    // Afficher un toast si demandé
    if (options.showToast !== false) {
      toast.error(errorDetails.critical ? 'Erreur critique' : 'Erreur', {
        description: `${context}: ${message}`
      });
    }
    
    // Tenter la récupération automatique si demandé
    if (options.autoRecover !== false) {
      attemptAutomaticRecovery(errorDetails.category, errorDetails.critical);
    }
    
    return errorDetails;
  }, [categorizeError, attemptAutomaticRecovery]);
  
  /**
   * Efface la dernière erreur
   */
  const clearLastError = useCallback(() => {
    setLastError(null);
  }, []);
  
  /**
   * Efface l'historique des erreurs
   */
  const clearErrorHistory = useCallback(() => {
    setErrorHistory([]);
  }, []);
  
  return {
    lastError,
    errorHistory,
    handleError,
    clearLastError,
    clearErrorHistory,
    categorizeError
  };
}

export default useErrorHandling;
