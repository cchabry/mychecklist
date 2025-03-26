
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { AppError, ErrorType, isAppError, createAppError } from '@/types/error';

/**
 * Options pour la configuration du comportement du gestionnaire d'erreurs
 */
export interface ErrorHandlerOptions {
  /** Afficher un toast pour informer l'utilisateur */
  showToast?: boolean;
  /** Titre optionnel pour le toast d'erreur */
  toastTitle?: string;
  /** Logger l'erreur dans la console */
  logToConsole?: boolean;
  /** Callback exécuté après le traitement de l'erreur */
  onError?: (error: AppError) => void;
}

/**
 * Hook pour gérer les erreurs de manière standardisée dans l'application
 * 
 * Ce hook fournit des fonctionnalités pour traiter, afficher et suivre les erreurs
 * de manière cohérente à travers l'application. Il convertit les erreurs en format
 * AppError standardisé et offre des options pour l'affichage et le logging.
 * 
 * @returns Un objet contenant:
 *   - handleError: Fonction pour traiter une erreur
 *   - clearError: Fonction pour réinitialiser l'état d'erreur
 *   - lastError: La dernière erreur traitée (ou null)
 *   - isError: Indique si une erreur est actuellement présente
 * 
 * @example
 * ```tsx
 * const { handleError, clearError, lastError } = useErrorHandler();
 * 
 * const fetchData = async () => {
 *   try {
 *     const result = await api.getData();
 *     return result;
 *   } catch (error) {
 *     handleError(error, { 
 *       showToast: true,
 *       toastTitle: 'Erreur de chargement',
 *       logToConsole: true
 *     });
 *   }
 * };
 * ```
 */
export function useErrorHandler() {
  const [lastError, setLastError] = useState<AppError | null>(null);
  const [isError, setIsError] = useState(false);
  
  /**
   * Traite une erreur selon les options spécifiées
   * 
   * @param error - L'erreur à traiter (peut être de n'importe quel type)
   * @param options - Options de configuration pour le traitement de l'erreur
   * @returns L'erreur standardisée au format AppError
   */
  const handleError = useCallback((error: unknown, options: ErrorHandlerOptions = {}) => {
    const { 
      showToast = true, 
      toastTitle, 
      logToConsole = true,
      onError 
    } = options;
    
    // Convertir l'erreur en AppError
    const appError = isAppError(error) 
      ? error 
      : (error instanceof Error
        ? createAppError(error.message, ErrorType.UNEXPECTED, { technicalMessage: error.stack })
        : createAppError(String(error), ErrorType.UNEXPECTED));
    
    // Mettre à jour l'état
    setLastError(appError);
    setIsError(true);
    
    // Logger l'erreur si demandé
    if (logToConsole) {
      console.error('[App Error]', appError);
    }
    
    // Afficher une toast si demandé
    if (showToast) {
      toast.error(appError.message, {
        description: toastTitle || appError.context || appError.type
      });
    }
    
    // Appeler le callback personnalisé si fourni
    if (onError) {
      onError(appError);
    }
    
    return appError;
  }, []);
  
  /**
   * Réinitialise l'état d'erreur
   */
  const clearError = useCallback(() => {
    setLastError(null);
    setIsError(false);
  }, []);
  
  return {
    handleError,
    clearError,
    lastError,
    isError
  };
}
