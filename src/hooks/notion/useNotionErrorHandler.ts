
/**
 * Hook pour gérer les erreurs spécifiques à Notion
 * 
 * Ce hook étend le gestionnaire d'erreurs général pour
 * gérer spécifiquement les erreurs liées à Notion.
 */

import { useCallback } from 'react';
import { useErrorHandler, ErrorHandlerOptions } from '@/hooks/error';
import { handleNotionError } from '@/services/notion/client';
import { AppError } from '@/types/error';
import { useOperationMode } from '@/hooks/useOperationMode';

/**
 * Options spécifiques au gestionnaire d'erreurs Notion
 */
export interface NotionErrorHandlerOptions extends ErrorHandlerOptions {
  /** Point d'entrée API concerné (pour le contexte) */
  endpoint?: string;
  /** Basculer automatiquement en mode démo en cas d'erreur */
  switchToDemo?: boolean;
  /** Raison du basculement en mode démo */
  demoReason?: string;
  /** Titre du toast d'erreur */
  toastTitle?: string;
  /** Message du toast d'erreur */
  toastMessage?: string;
}

/**
 * Résultat du hook useNotionErrorHandler
 */
export interface NotionErrorHandlerResult {
  /** Gère une erreur Notion avec les options spécifiées */
  handleNotionError: (error: unknown, options?: NotionErrorHandlerOptions) => AppError;
  /** Efface la dernière erreur */
  clearError: () => void;
  /** Dernière erreur survenue */
  lastError?: AppError;
  /** Indique si une erreur est actuellement présente */
  isError: boolean;
}

/**
 * Hook pour gérer les erreurs spécifiques à l'API Notion
 * 
 * @returns Interface standardisée pour la gestion des erreurs Notion
 * 
 * @example
 * ```tsx
 * const { handleNotionError } = useNotionErrorHandler();
 * 
 * try {
 *   const result = await fetchFromNotion();
 *   return result;
 * } catch (error) {
 *   handleNotionError(error, {
 *     endpoint: '/databases/query',
 *     switchToDemo: true
 *   });
 * }
 * ```
 */
export function useNotionErrorHandler(): NotionErrorHandlerResult {
  const { handleError, clearError, lastError, isError } = useErrorHandler();
  const { enableDemoMode } = useOperationMode();
  
  /**
   * Gère une erreur spécifique à Notion
   */
  const handleNotionApiError = useCallback((
    error: unknown,
    options: NotionErrorHandlerOptions = {}
  ): AppError => {
    const {
      endpoint,
      switchToDemo = false,
      demoReason = 'Erreur API Notion',
      toastTitle,
      toastMessage,
      ...errorOptions
    } = options;
    
    // Convertir en AppError standardisée
    const appError = handleNotionError(error, endpoint);
    
    // Basculer en mode démo si demandé
    if (switchToDemo) {
      enableDemoMode(`${demoReason}: ${appError.message}`);
    }
    
    // Déléguer au gestionnaire d'erreurs général avec les options mises à jour
    const updatedOptions: ErrorHandlerOptions = {
      ...errorOptions,
      showToast: options.showToast !== false,
    };
    
    if (toastTitle) {
      updatedOptions.toastTitle = toastTitle;
    }
    
    if (toastMessage) {
      updatedOptions.toastDescription = toastMessage;
    }
    
    return handleError(appError, updatedOptions);
  }, [handleError, enableDemoMode]);
  
  return {
    handleNotionError: handleNotionApiError,
    clearError,
    lastError, // The type here needs to match the expected return type: AppError | undefined
    isError
  };
}

export default useNotionErrorHandler;
