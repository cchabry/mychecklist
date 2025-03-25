
import { useState, useCallback } from 'react';
import { notionApiService } from '@/services/notion/notionApiService';
import { toast } from 'sonner';
import { notionCentralService } from '@/services/notion/notionCentralService';
import { useNotionErrorService } from '@/services/notion/errorHandling';

/**
 * Hook qui permet d'utiliser l'API Notion avec le système de proxy modulaire
 * Utilise exclusivement le service centralisé pour les appels à l'API Notion
 */
export function useNotionApi() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { reportError } = useNotionErrorService();
  
  // Fonction pour tester la connexion à l'API Notion
  const testConnection = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Utiliser EXCLUSIVEMENT le service centralisé
      const response = await notionCentralService.testConnection();
      
      if (response.success) {
        toast.success("Connexion à Notion réussie", {
          description: `Connecté en tant que ${response.user || 'Utilisateur Notion'}`
        });
        return { success: true, user: response.user };
      } else {
        const errorMessage = response.error || "Erreur de connexion à Notion";
        setError(new Error(errorMessage));
        
        // Utiliser le nouveau système de gestion d'erreurs
        reportError(new Error(errorMessage), "Test de connexion à Notion");
        
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(err instanceof Error ? err : new Error(errorMessage));
      
      // Utiliser le nouveau système de gestion d'erreurs
      reportError(err, "Test de connexion à Notion");
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [reportError]);
  
  return {
    isLoading,
    error,
    testConnection,
    service: notionApiService
  };
}

export default useNotionApi;
