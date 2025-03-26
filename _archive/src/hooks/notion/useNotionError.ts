
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { NotionErrorType } from '@/lib/notionProxy/errorHandling';

interface NotionErrorDetails {
  message: string;
  context?: string;
  timestamp: number;
  stack?: string;
  type: NotionErrorType;
}

/**
 * Hook pour la gestion centralisée des erreurs de l'API Notion
 */
export function useNotionError() {
  const [errorDetails, setErrorDetails] = useState<NotionErrorDetails | null>(null);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);

  /**
   * Affiche une erreur dans l'UI et l'enregistre dans l'état
   */
  const showError = useCallback((error: Error, context?: string) => {
    console.error(`Erreur Notion ${context ? `(${context})` : ''}:`, error);
    
    // Déterminer le type d'erreur
    const type: NotionErrorType = error.message.toLowerCase().includes('auth') ? 'auth' :
                                  error.message.toLowerCase().includes('permission') ? 'permission' :
                                  error.message.toLowerCase().includes('not found') ? 'notFound' :
                                  error.message.toLowerCase().includes('network') ? 'network' :
                                  error.message.toLowerCase().includes('timeout') ? 'timeout' :
                                  error.message.toLowerCase().includes('cors') ? 'cors' : 'unknown';
    
    // Créer l'objet d'erreur
    const errorInfo: NotionErrorDetails = {
      message: error.message || 'Erreur inconnue',
      context,
      timestamp: Date.now(),
      stack: error.stack,
      type
    };
    
    // Mettre à jour l'état
    setErrorDetails(errorInfo);
    
    // Afficher un toast d'erreur
    toast.error(`Erreur Notion${context ? ` (${context})` : ''}`, {
      description: error.message || 'Une erreur s\'est produite lors de la communication avec Notion'
    });
    
    // Stocker l'erreur dans localStorage pour référence
    try {
      localStorage.setItem('notion_last_error', JSON.stringify(errorInfo));
    } catch (e) {
      // Ignorer les erreurs de stockage
    }
    
    return errorInfo;
  }, []);

  /**
   * Efface l'erreur actuelle
   */
  const clearError = useCallback(() => {
    setErrorDetails(null);
  }, []);

  /**
   * Récupère la dernière erreur stockée
   */
  const getLastStoredError = useCallback((): NotionErrorDetails | null => {
    try {
      const stored = localStorage.getItem('notion_last_error');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      // Ignorer les erreurs de parsing
    }
    return null;
  }, []);

  /**
   * Ouvre la modal d'erreur
   */
  const openErrorModal = useCallback(() => {
    setShowErrorModal(true);
  }, []);

  /**
   * Ferme la modal d'erreur
   */
  const closeErrorModal = useCallback(() => {
    setShowErrorModal(false);
  }, []);

  return {
    errorDetails,
    showError,
    clearError,
    getLastStoredError,
    showErrorModal,
    openErrorModal,
    closeErrorModal
  };
}
