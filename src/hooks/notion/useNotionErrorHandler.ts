
/**
 * Hook pour gérer les erreurs spécifiques à Notion
 * 
 * Ce hook étend le gestionnaire d'erreurs général pour
 * gérer spécifiquement les erreurs liées à Notion.
 */

import { useCallback } from 'react';
import { useErrorHandler } from '@/hooks/error';
import { handleNotionError as convertNotionError } from '@/services/notion/client';
import { AppError } from '@/types/error';
import { useOperationMode } from '@/hooks/useOperationMode';
import { toast } from 'sonner';

/**
 * Options pour le gestionnaire d'erreurs Notion
 */
export interface NotionErrorOptions {
  /** Point d'entrée API concerné */
  endpoint?: string;
  /** Basculer en mode démo */
  switchToDemo?: boolean;
  /** Raison du basculement */
  demoReason?: string;
  /** Afficher un toast d'erreur */
  showToast?: boolean;
  /** Titre du toast */
  toastTitle?: string;
  /** Message du toast */
  toastMessage?: string;
}

/**
 * Résultat du hook useNotionErrorHandler
 */
export interface NotionErrorHandlerResult {
  /** Gère une erreur Notion */
  handleNotionError: (error: unknown, options?: NotionErrorOptions) => AppError;
  /** Efface la dernière erreur */
  clearError: () => void;
  /** Dernière erreur survenue */
  lastError?: AppError;
  /** Indique si une erreur est présente */
  isError: boolean;
}

/**
 * Hook pour gérer les erreurs spécifiques à l'API Notion
 * 
 * @returns Interface pour la gestion des erreurs Notion
 */
export function useNotionErrorHandler(): NotionErrorHandlerResult {
  const { handleError: baseHandleError, clearError, lastError, isError } = useErrorHandler();
  const { enableDemoMode } = useOperationMode();
  
  /**
   * Gère une erreur spécifique à Notion
   */
  const handleNotionError = useCallback((
    error: unknown,
    options: NotionErrorOptions = {}
  ): AppError => {
    const {
      endpoint,
      switchToDemo = false,
      demoReason = 'Erreur API Notion',
      showToast = true,
      toastTitle = 'Erreur Notion',
      toastMessage
    } = options;
    
    // Convertir l'erreur en AppError standardisée
    const appError = convertNotionError(error, endpoint);
    
    // Basculer en mode démo si demandé
    if (switchToDemo) {
      enableDemoMode(`${demoReason}: ${appError.message}`);
    }
    
    // Afficher un toast si demandé
    if (showToast) {
      toast.error(toastTitle, {
        description: toastMessage || appError.message
      });
    }
    
    return appError;
  }, [enableDemoMode]);
  
  return {
    handleNotionError,
    clearError,
    lastError,
    isError
  };
}

export default useNotionErrorHandler;
