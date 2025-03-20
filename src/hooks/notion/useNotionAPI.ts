
import { useState } from 'react';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import { useNotion } from '@/contexts/NotionContext';
import { handleNotionError } from '@/lib/notionProxy/errorHandling';

/**
 * Hook étendu pour les requêtes à l'API Notion, avec prise en charge explicite du mode mock
 */
export function useNotionAPI<T = any>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { testConnection } = useNotion();
  const [isMockMode, setIsMockMode] = useState(notionApi.mockMode.isActive());
  
  // Surveiller les changements du mode mock
  useState(() => {
    const checkMockMode = () => {
      const mockActive = notionApi.mockMode.isActive();
      if (mockActive !== isMockMode) {
        setIsMockMode(mockActive);
      }
    };
    
    // Vérifier tout de suite et à intervalle régulier
    checkMockMode();
    const interval = setInterval(checkMockMode, 1000);
    
    return () => clearInterval(interval);
  });

  // Fonction pour effectuer une requête à l'API Notion
  const executeRequest = async <R = T>(
    requestFn: () => Promise<R>,
    options: {
      onSuccess?: (data: R) => void;
      onError?: (error: Error) => void;
      successMessage?: string;
      errorMessage?: string;
      mockData?: R;
    } = {}
  ): Promise<R | null> => {
    const { onSuccess, onError, successMessage, errorMessage, mockData } = options;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Vérifier si nous sommes en mode mock et si des données de mock ont été fournies
      if (notionApi.mockMode.isActive() && mockData !== undefined) {
        // Simuler un délai pour l'expérience utilisateur
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (successMessage) {
          toast.success(successMessage);
        }
        
        if (onSuccess) {
          onSuccess(mockData);
        }
        
        setIsLoading(false);
        return mockData;
      }
      
      const result = await requestFn();
      
      if (successMessage) {
        toast.success(successMessage);
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      // Utiliser notre service de gestion d'erreurs
      handleNotionError(error, errorMessage);
      
      if (onError) {
        onError(error);
      }
      
      // Mettre à jour le statut de connexion Notion après une erreur
      testConnection();
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Activer le mode mock
  const enableMockMode = () => {
    notionApi.mockMode.activate();
    setIsMockMode(true);
    toast.info('Mode démonstration activé', {
      description: 'L\'application utilise maintenant des données fictives'
    });
  };
  
  // Désactiver le mode mock
  const disableMockMode = () => {
    notionApi.mockMode.deactivate();
    setIsMockMode(false);
    toast.info('Mode réel activé', {
      description: 'L\'application utilise maintenant des données réelles'
    });
  };
  
  return {
    isLoading,
    error,
    executeRequest,
    notionApi,
    isMockMode,
    enableMockMode,
    disableMockMode
  };
}
