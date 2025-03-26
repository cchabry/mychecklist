
/**
 * Hook standardisé pour gérer l'état de chargement et les erreurs dans les formulaires
 */

import { useState } from 'react';

/**
 * Interface pour les retours du hook useLoadingState
 */
export interface UseLoadingStateReturn {
  /** État de chargement actuel */
  isLoading: boolean;
  /** Message d'erreur (null si pas d'erreur) */
  error: string | null;
  /** Démarre le chargement et réinitialise l'erreur */
  startLoading: () => void;
  /** Arrête le chargement */
  stopLoading: () => void;
  /** Définit un message d'erreur et arrête le chargement */
  setErrorMessage: (message: string) => void;
  /** Réinitialise l'état (erreur et chargement) */
  reset: () => void;
}

/**
 * Hook pour gérer l'état de chargement et les erreurs 
 * 
 * Utilisation:
 * ```tsx
 * const { isLoading, error, startLoading, stopLoading, setErrorMessage } = useLoadingState();
 * 
 * const handleSubmit = async () => {
 *   startLoading();
 *   try {
 *     await submitData();
 *   } catch (err) {
 *     setErrorMessage('Erreur lors de la soumission');
 *   } finally {
 *     stopLoading();
 *   }
 * };
 * ```
 * 
 * @param initialLoading - État de chargement initial (défaut: false)
 * @returns Un objet contenant l'état et les méthodes de manipulation
 */
export function useLoadingState(initialLoading = false): UseLoadingStateReturn {
  const [isLoading, setIsLoading] = useState(initialLoading);
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
