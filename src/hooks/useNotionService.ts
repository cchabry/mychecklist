
import { useState, useEffect, useCallback } from 'react';
import { useOperationMode } from '@/services/operationMode';
import { toast } from 'sonner';

/**
 * Types d'opérations Notion supportées
 */
export type NotionOperation<T> = () => Promise<T>;

/**
 * Options pour les opérations Notion
 */
export interface NotionOperationOptions<T> {
  // Données de démo à utiliser en mode démo
  demoData?: T | (() => T);
  
  // Configuration des messages
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  
  // Callbacks
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  
  // Comportement
  showLoadingToast?: boolean;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  
  // Contexte pour la gestion d'erreur
  context?: string;
}

/**
 * Hook pour interagir de façon robuste avec les services Notion
 * Remplace useMockMode, useNotionRequest et autres hooks legacy
 */
export function useNotionService() {
  const { isDemoMode, handleConnectionError, handleSuccessfulOperation } = useOperationMode();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  /**
   * Exécute une opération Notion avec gestion intelligente du mode et des erreurs
   */
  const executeOperation = useCallback(async <T>(
    operation: NotionOperation<T>,
    options: NotionOperationOptions<T> = {}
  ): Promise<T | null> => {
    const {
      demoData,
      loadingMessage,
      successMessage,
      errorMessage = 'Erreur lors de l\'opération Notion',
      onSuccess,
      onError,
      showLoadingToast = false,
      showSuccessToast = true,
      showErrorToast = true,
      context = 'Opération Notion'
    } = options;
    
    // Gérer l'état de chargement
    setIsLoading(true);
    setError(null);
    
    if (showLoadingToast && loadingMessage) {
      toast.loading(loadingMessage);
    }
    
    try {
      let result: T;
      
      // Mode démo: utiliser les données de démo
      if (isDemoMode) {
        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (demoData === undefined) {
          throw new Error('Aucune donnée de démonstration fournie pour cette opération');
        }
        
        // Récupérer les données de démo (fonction ou valeur directe)
        result = typeof demoData === 'function' 
          ? (demoData as () => T)() 
          : demoData;
      } 
      // Mode réel: exécuter l'opération réelle
      else {
        result = await operation();
        // Signaler une opération réussie
        handleSuccessfulOperation();
      }
      
      // Gérer le succès
      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      // Formater l'erreur
      const formattedError = error instanceof Error 
        ? error 
        : new Error(String(error));
      
      // Mettre à jour l'état d'erreur local
      setError(formattedError);
      
      // Signaler l'erreur au système
      handleConnectionError(formattedError, context);
      
      // Afficher un toast d'erreur
      if (showErrorToast) {
        toast.error(errorMessage, {
          description: formattedError.message
        });
      }
      
      // Appeler le callback d'erreur
      if (onError) {
        onError(formattedError);
      }
      
      // Essayer de récupérer en mode démo si des données de démo sont disponibles
      if (!isDemoMode && demoData) {
        try {
          const demoResult = typeof demoData === 'function' 
            ? (demoData as () => T)() 
            : demoData;
            
          toast.info('Mode démonstration activé', {
            description: 'L\'application continue avec des données de démonstration'
          });
          
          return demoResult;
        } catch (fallbackError) {
          console.error('Erreur lors du fallback en mode démonstration:', fallbackError);
        }
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode, handleConnectionError, handleSuccessfulOperation]);
  
  return {
    isLoading,
    error,
    executeOperation,
    isDemoMode
  };
}
