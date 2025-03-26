
import { useState, useEffect } from 'react';
import { notionErrorService } from '@/services/notion/errorHandling';
import { NotionError } from '@/services/notion/types/unified';

/**
 * Hook pour utiliser le service de gestion des erreurs Notion
 */
export function useNotionErrorService() {
  const [errors, setErrors] = useState<NotionError[]>([]);

  // Récupérer les erreurs au chargement
  useEffect(() => {
    setErrors(notionErrorService.getRecentErrors());
    
    // Pour un cas réel, il faudrait un mécanisme de mise à jour 
    // lorsque de nouvelles erreurs sont ajoutées
    const interval = setInterval(() => {
      setErrors(notionErrorService.getRecentErrors());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Rapporter une nouvelle erreur
  const reportError = (error: Error, context?: string) => {
    const notionError = notionErrorService.reportError(error, context);
    setErrors(notionErrorService.getRecentErrors());
    return notionError;
  };

  // Effacer toutes les erreurs
  const clearErrors = () => {
    notionErrorService.clearErrors();
    setErrors([]);
  };

  // Obtenir un message convivial pour une erreur
  const getFriendlyMessage = (error: NotionError) => {
    return notionErrorService.getFriendlyMessage(error);
  };

  return {
    errors,
    reportError,
    clearErrors,
    getFriendlyMessage
  };
}

export default useNotionErrorService;
