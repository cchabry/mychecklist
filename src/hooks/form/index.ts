
/**
 * Hooks de gestion des formulaires
 */

import { useState } from 'react';

/**
 * Hook pour gérer les états de chargement et d'erreur
 * @returns États et fonctions de contrôle pour le chargement et les erreurs
 */
export const useLoadingState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const startLoading = () => {
    setIsLoading(true);
    setError(null);
  };
  
  const stopLoading = () => {
    setIsLoading(false);
  };
  
  const setErrorMessage = (message: string) => {
    setError(message);
    setIsLoading(false);
  };
  
  const clearError = () => {
    setError(null);
  };
  
  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setErrorMessage,
    clearError
  };
};
