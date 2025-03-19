
import { useState } from 'react';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import { useNotion } from '@/contexts/NotionContext';
import { handleNotionError } from '@/lib/notionProxy/errorHandling';

// Hook simplifié pour les appels à l'API Notion
export function useNotionApi<T = any>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { testConnection } = useNotion();

  // Fonction pour effectuer une requête à l'API Notion
  const executeRequest = async <R = T>(
    requestFn: () => Promise<R>,
    options: {
      onSuccess?: (data: R) => void;
      onError?: (error: Error) => void;
      successMessage?: string;
      errorMessage?: string;
    } = {}
  ): Promise<R | null> => {
    const { onSuccess, onError, successMessage, errorMessage } = options;
    
    setIsLoading(true);
    setError(null);
    
    try {
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
  
  return {
    isLoading,
    error,
    executeRequest,
    notionApi
  };
}
