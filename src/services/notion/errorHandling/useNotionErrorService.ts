
import { useState, useEffect } from 'react';
import { notionErrorService } from './errorService';
import { NotionError, NotionErrorOptions } from './types';

/**
 * Hook pour interagir avec le service de gestion d'erreurs Notion
 */
export function useNotionErrorService() {
  const [recentErrors, setRecentErrors] = useState<NotionError[]>(
    notionErrorService.getRecentErrors()
  );
  
  // S'abonner aux erreurs
  useEffect(() => {
    const unsubscribe = notionErrorService.subscribe((error) => {
      setRecentErrors(notionErrorService.getRecentErrors());
    });
    
    return unsubscribe;
  }, []);
  
  // Créer une fonction pour gérer une erreur
  const handleError = (error: Error, context: Record<string, any> = {}) => {
    return notionErrorService.handleError(error, context);
  };
  
  // Créer une fonction pour créer une erreur personnalisée
  const createError = (message: string, options: NotionErrorOptions = {}) => {
    return notionErrorService.createError(message, options);
  };
  
  // Créer une fonction pour effacer l'historique des erreurs
  const clearErrors = () => {
    notionErrorService.clearErrors();
    setRecentErrors([]);
  };
  
  return {
    // État
    recentErrors,
    
    // Méthodes
    handleError,
    createError,
    clearErrors,
    
    // Service brut (à utiliser avec précaution)
    notionErrorService
  };
}
