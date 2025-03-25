
import { useEffect } from 'react';
import { notionRequestLogger } from '@/services/notion/requestLogger';
import { notionApi } from '@/lib/notionProxy';

/**
 * Hook qui intercepte les requêtes Notion pour les journaliser
 */
export const useNotionRequestLogger = () => {
  useEffect(() => {
    // Sauvegarde de la fonction originale
    const originalRequest = notionApi.request;
    
    // Fonction d'interception
    const interceptedRequest = async (
      endpoint: string,
      method: string = 'GET',
      body?: any,
      token?: string
    ) => {
      // Enregistrer le début de la requête
      const requestId = notionRequestLogger.logRequest(endpoint, method);
      const startTime = performance.now();
      
      try {
        // Exécuter la requête originale
        const response = await originalRequest(endpoint, method, body, token);
        
        // Calculer le temps de réponse
        const responseTime = Math.round(performance.now() - startTime);
        
        // Enregistrer le succès
        notionRequestLogger.logResponse(
          requestId,
          200, // Status OK par défaut pour les requêtes réussies
          true,
          responseTime
        );
        
        return response;
      } catch (error) {
        // Calculer le temps de réponse même en cas d'erreur
        const responseTime = Math.round(performance.now() - startTime);
        
        // Extraire le statut HTTP si disponible
        const statusMatch = error.message?.match(/HTTP (\d+)/);
        const status = statusMatch ? parseInt(statusMatch[1]) : 500;
        
        // Enregistrer l'erreur
        notionRequestLogger.logResponse(
          requestId,
          status,
          false,
          responseTime,
          error.message
        );
        
        throw error;
      }
    };
    
    // Remplacer la fonction de requête par notre version interceptée
    notionApi.request = interceptedRequest;
    
    // Restaurer la fonction originale lors du nettoyage
    return () => {
      notionApi.request = originalRequest;
    };
  }, []);
};
