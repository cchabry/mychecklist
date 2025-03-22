
import { useState } from 'react';

export interface NotionErrorDetails {
  show: boolean;
  error: string;
  context: string;
}

/**
 * Hook pour gérer l'affichage des erreurs Notion
 */
export const useNotionErrorHandling = () => {
  const [notionErrorDetails, setNotionErrorDetails] = useState<NotionErrorDetails>({
    show: false,
    error: '',
    context: ''
  });
  
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  
  // Gérer l'ouverture des détails d'erreur
  const handleShowErrorDetails = () => {
    setShowErrorDetails(true);
  };
  
  // Gérer la fermeture des détails d'erreur
  const handleCloseErrorDetails = () => {
    setShowErrorDetails(false);
  };
  
  // Masquer les détails d'erreur Notion
  const hideNotionError = () => {
    setNotionErrorDetails({
      show: false,
      error: '',
      context: ''
    });
  };
  
  return {
    notionErrorDetails,
    setNotionErrorDetails,
    showErrorDetails,
    setShowErrorDetails,
    handleShowErrorDetails,
    handleCloseErrorDetails,
    hideNotionError
  };
};
