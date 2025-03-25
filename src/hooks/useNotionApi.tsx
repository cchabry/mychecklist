
import { useState, useEffect, useCallback } from 'react';
import { notionClient } from '@/services/notion/notionApiClient';
import { apiProxy, initializeApiProxy } from '@/services/apiProxy';
import { toast } from 'sonner';

/**
 * Hook qui permet d'utiliser l'API Notion avec le système de proxy modulaire
 */
export function useNotionApi() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [adapterInfo, setAdapterInfo] = useState<{ name: string; environment: string } | null>(null);
  
  // Initialiser le système de proxy au premier rendu
  useEffect(() => {
    async function initialize() {
      try {
        const success = await initializeApiProxy({
          debug: process.env.NODE_ENV === 'development',
          timeout: 30000
        });
        
        setIsInitialized(success);
        
        if (success) {
          // Récupérer les informations sur l'adaptateur actif
          const adapter = apiProxy['getActiveAdapter'] ? 
            apiProxy['getActiveAdapter']() : 
            { name: 'Unknown', environment: 'Unknown' };
          
          setAdapterInfo({
            name: adapter.name || 'Unknown Adapter',
            environment: adapter.environment || 'Unknown Environment'
          });
          
          console.log(`Proxy API initialisé avec succès via ${adapter.name} pour ${adapter.environment}`);
        } else {
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
      // IMPORTANT: Utiliser EXCLUSIVEMENT la fonction Netlify pour tous les appels
      const response = await fetch('/.netlify/functions/notion-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: '/users/me',
          method: 'GET',
          token: localStorage.getItem('notion_api_key')
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur du proxy Netlify: ${response.status} ${errorText}`);
      }
      
      const responseData = await response.json();
      
      if (responseData) {
        toast.success("Connexion à Notion réussie", {
          description: `Connecté en tant que ${responseData.name || 'Utilisateur Notion'}`
        });
        return { success: true, user: responseData };
      } else {
        const errorMessage = "Erreur de connexion à Notion";
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
    adapterInfo,
    testConnection
  };
}

export default useNotionApi;
