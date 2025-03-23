
import { useEffect } from 'react';
import { autoRetryHandler } from '@/services/notion/errorHandling';

/**
 * Hook pour initialiser le gestionnaire de retry automatique
 */
export function useAutoRetry() {
  // Initialiser le gestionnaire au montage du composant
  useEffect(() => {
    autoRetryHandler.initialize();
  }, []);
}
