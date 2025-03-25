
import { useState, useCallback } from 'react';

/**
 * Types pour les erreurs Notion
 */
export enum NotionErrorType {
  UNKNOWN = "unknown",
  AUTH = "auth",
  PERMISSION = "permission",
  NOT_FOUND = "notFound",
  NETWORK = "network",
  TIMEOUT = "timeout",
  CORS = "cors"
}

/**
 * Type pour les détails d'erreur Notion
 */
export interface NotionErrorDetails {
  show: boolean;
  error: string;
  context?: string;
  timestamp?: number;
  type?: NotionErrorType;
}

/**
 * Hook pour gérer les erreurs liées à Notion
 */
export const useNotionError = () => {
  // État pour les détails de l'erreur
  const [notionErrorDetails, setNotionErrorDetails] = useState<NotionErrorDetails | null>(null);
  
  /**
   * Détermine le type d'erreur Notion à partir du message
   */
  const categorizeNotionError = useCallback((errorMessage: string): NotionErrorType => {
    const lowerMessage = errorMessage.toLowerCase();
    
    if (lowerMessage.includes('authenticate') || lowerMessage.includes('token') || lowerMessage.includes('authorization')) {
      return NotionErrorType.AUTH;
    }
    
    if (lowerMessage.includes('permission') || lowerMessage.includes('access denied')) {
      return NotionErrorType.PERMISSION;
    }
    
    if (lowerMessage.includes('not found') || lowerMessage.includes('does not exist')) {
      return NotionErrorType.NOT_FOUND;
    }
    
    if (lowerMessage.includes('network') || lowerMessage.includes('failed to fetch')) {
      return NotionErrorType.NETWORK;
    }
    
    if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
      return NotionErrorType.TIMEOUT;
    }
    
    if (lowerMessage.includes('cors') || lowerMessage.includes('origin')) {
      return NotionErrorType.CORS;
    }
    
    return NotionErrorType.UNKNOWN;
  }, []);
  
  /**
   * Capture et traite une erreur Notion
   */
  const captureNotionError = useCallback((error: Error | string, context?: string) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorType = categorizeNotionError(errorMessage);
    
    setNotionErrorDetails({
      show: true,
      error: errorMessage,
      context,
      timestamp: Date.now(),
      type: errorType
    });
    
    return errorType;
  }, [categorizeNotionError]);
  
  /**
   * Masque l'erreur Notion actuelle
   */
  const hideNotionError = useCallback(() => {
    setNotionErrorDetails(prev => prev ? { ...prev, show: false } : null);
  }, []);
  
  /**
   * Efface l'erreur Notion actuelle
   */
  const clearNotionError = useCallback(() => {
    setNotionErrorDetails(null);
  }, []);
  
  // Ajouter les méthodes manquantes
  const showError = useCallback((error: string | Error, context?: string) => {
    captureNotionError(error, context);
  }, [captureNotionError]);
  
  const clearError = clearNotionError;
  
  const openErrorModal = useCallback((error: string | Error, context?: string) => {
    captureNotionError(error, context);
  }, [captureNotionError]);
  
  const closeErrorModal = hideNotionError;
  
  return {
    notionErrorDetails,
    setNotionErrorDetails,
    captureNotionError,
    hideNotionError,
    clearNotionError,
    categorizeNotionError,
    // Méthodes supplémentaires pour compatibilité
    showError,
    clearError,
    openErrorModal,
    closeErrorModal,
    // Propriétés calculées pour compatibilité
    errorDetails: notionErrorDetails,
    showErrorModal: notionErrorDetails ? notionErrorDetails.show : false
  };
};

// Réexporter le type pour éviter les ambiguïtés
export type { NotionErrorDetails };
