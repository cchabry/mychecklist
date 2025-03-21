
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface NotionErrorDetails {
  message: string;
  context?: string;
  timestamp: number;
  stack?: string;
}

/**
 * Hook pour la gestion centralisée des erreurs de l'API Notion
 */
export function useNotionError() {
  const [errorDetails, setErrorDetails] = useState<NotionErrorDetails | null>(null);

  /**
   * Affiche une erreur dans l'UI et l'enregistre dans l'état
   */
  const showError = useCallback((error: Error, context?: string) => {
    console.error(`Erreur Notion ${context ? `(${context})` : ''}:`, error);
    
    // Créer l'objet d'erreur
    const errorInfo: NotionErrorDetails = {
      message: error.message || 'Erreur inconnue',
      context,
      timestamp: Date.now(),
      stack: error.stack
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

  return {
    errorDetails,
    showError,
    clearError,
    getLastStoredError
  };
}
