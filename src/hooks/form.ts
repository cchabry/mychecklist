
import { useState } from 'react';

/**
 * Hook pour gérer l'état de chargement d'un formulaire ou d'une requête
 */
export const useLoadingState = (initialLoading = false) => {
  const [isLoading, setIsLoading] = useState(initialLoading);
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
  };
  
  const resetState = () => {
    setIsLoading(false);
    setError(null);
  };
  
  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setErrorMessage,
    resetState
  };
};
