
import { useState, useEffect } from 'react';
import { NotionErrorDetails, getStoredNotionError } from '@/lib/notionProxy/errorHandling';

/**
 * Hook spécialisé pour gérer l'état des erreurs Notion
 */
export function useNotionErrorState() {
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [notionErrorDetails, setNotionErrorDetails] = useState<NotionErrorDetails | null>(null);
  
  // Charger les erreurs stockées
  useEffect(() => {
    const storedError = getStoredNotionError();
    if (storedError) {
      setNotionErrorDetails(storedError);
    }
  }, []);
  
  // Masquer les détails d'erreur
  const hideNotionError = () => {
    setNotionErrorDetails(null);
    setShowErrorDetails(false);
  };
  
  return {
    showErrorDetails,
    notionErrorDetails,
    setShowErrorDetails,
    hideNotionError
  };
}
