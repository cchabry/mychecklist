
import { useState, useEffect, useCallback } from 'react';
import { notionClient } from '@/services/notion/notionApiClient';
import { apiProxy, initializeApiProxy } from '@/services/apiProxy';
import { toast } from 'sonner';

/**
 * Hook qui permet d'utiliser l'API Notion avec le nouveau système de proxy
 */
export function useNotionApi() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Initialiser le système de proxy au premier rendu
  useEffect(() => {
    async function initialize() {
      try {
        const success = await initializeApiProxy({
          debug: process.env.NODE_ENV === 'development',
          timeout: 30000
        });
        
        setIsInitialized(success);
        
        if (!success) {
          setError(new Error("Échec de l'initialisation du système de proxy API"));
          toast.error("Échec de la connexion à l'API", {
            description: "Impossible d'initialiser le système de proxy pour l'API Notion"
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        toast.error("Erreur d'initialisation", {
          description: err instanceof Error ? err.message : String(err)
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    initialize();
  }, []);
  
  // Fonction pour tester la connexion à l'API Notion
  const testConnection = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await notionClient.getCurrentUser();
      
      if (response.success) {
        toast.success("Connexion à Notion réussie", {
          description: `Connecté en tant que ${response.data?.name || 'Utilisateur Notion'}`
        });
        return { success: true, user: response.data };
      } else {
        const errorMessage = response.error?.message || "Erreur de connexion à Notion";
        setError(new Error(errorMessage));
        toast.error("Échec de la connexion à Notion", {
          description: errorMessage
        });
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(err instanceof Error ? err : new Error(errorMessage));
      
      toast.error("Erreur lors du test de connexion", {
        description: errorMessage
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    client: notionClient,
    proxy: apiProxy,
    isInitialized,
    isLoading,
    error,
    testConnection
  };
}

export default useNotionApi;
