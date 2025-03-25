
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { notionApi } from '@/lib/notionProxy';
import { operationMode } from '@/services/operationMode';
import { useOperationMode } from '@/services/operationMode';

interface RequestOptions<T> {
  // Données à utiliser en mode démo
  demoData: T | (() => T);
  
  // Messages et notifications
  successMessage?: string;
  errorMessage?: string;
  
  // Callbacks
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook pour faire des requêtes à l'API Notion avec fallback automatique
 * Remplace useNotionRequest avec une API plus cohérente et robuste
 */
export function useNotionFallbackAPI<T = unknown>() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);
  const { isDemoMode } = useOperationMode();
  
  /**
   * Exécute une requête avec gestion automatique du mode opérationnel
   */
  const executeRequest = useCallback(async <R = T>(
    requestFn: () => Promise<R>,
    options: RequestOptions<R>
  ): Promise<R | null> => {
    // Destructurer les options
    const {
      demoData,
      successMessage,
      errorMessage = 'Erreur lors de la requête',
      onSuccess,
      onError
    } = options;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // En mode démo, retourner les données de démo
      if (isDemoMode) {
        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Récupérer les données de démo (fonction ou valeur directe)
        const mockResult = typeof demoData === 'function' 
          ? (demoData as () => R)() 
          : demoData;
        
        setData(mockResult as unknown as T);
        
        if (onSuccess) {
          onSuccess(mockResult);
        }
        
        if (successMessage) {
          toast.success(successMessage, {
            description: 'Données de démonstration utilisées'
          });
        }
        
        setIsLoading(false);
        return mockResult;
      }
      
      // Mode réel: exécuter la requête effective
      const result = await requestFn();
      
      // Signaler l'opération réussie
      operationMode.handleSuccessfulOperation();
      
      setData(result as unknown as T);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      if (successMessage) {
        toast.success(successMessage);
      }
      
      setIsLoading(false);
      return result;
    } catch (error) {
      // Formater l'erreur
      const formattedError = error instanceof Error 
        ? error 
        : new Error(String(error));
      
      // Signaler l'erreur au système operationMode
      operationMode.handleConnectionError(
        formattedError,
        'Requête API Notion'
      );
      
      setError(formattedError);
      
      if (onError) {
        onError(formattedError);
      }
      
      toast.error(errorMessage, {
        description: formattedError.message
      });
      
      // Tenter de basculer automatiquement en mode démo
      try {
        if (!isDemoMode && demoData) {
          const mockResult = typeof demoData === 'function' 
            ? (demoData as () => R)() 
            : demoData;
            
          setData(mockResult as unknown as T);
          toast.info('Mode démonstration activé', {
            description: 'L\'application continue avec des données de démonstration'
          });
          
          setIsLoading(false);
          return mockResult;
        }
      } catch (fallbackError) {
        console.error('Erreur lors du fallback en mode démonstration:', fallbackError);
      }
      
      setIsLoading(false);
      return null;
    }
  }, [isDemoMode]);
  
  return {
    isLoading,
    error,
    data,
    executeRequest,
    notionApi
  };
}
