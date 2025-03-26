
/**
 * Hook pour gérer l'état de chargement et les erreurs dans les formulaires
 */

import { useState } from 'react';

/**
 * Hook pour gérer l'état de chargement et les erreurs
 */
export function useLoadingState() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Démarre le chargement et réinitialise l'erreur
   */
  const startLoading = () => {
    setIsLoading(true);
    setError(null);
  };
  
  /**
   * Arrête le chargement
   */
  const stopLoading = () => {
    setIsLoading(false);
  };
  
  /**
   * Définit un message d'erreur et arrête le chargement
   */
  const setErrorMessage = (message: string) => {
    setError(message);
    setIsLoading(false);
  };
  
  /**
   * Réinitialise l'état (erreur et chargement)
   */
  const reset = () => {
    setIsLoading(false);
    setError(null);
  };
  
  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setErrorMessage,
    reset
  };
}
