
import { useEffect } from 'react';
import { notionCentralService } from '@/services/notion/notionCentralService';
import { notionLogger } from '@/services/notion/diagnostics';

/**
 * Hook pour intercepter les appels à l'API Notion
 * Permet d'ajouter la journalisation et la gestion des erreurs CORS
 */
export function useNotionApiInterceptor() {
  useEffect(() => {
    // Sauvegarder la fonction originale
    const originalRequest = notionCentralService.request;
    
    // Fonction d'interception pour la journalisation et la gestion des erreurs
    const interceptedRequest = async (options: any) => {
      const { endpoint, method = 'GET', body, token } = options;
      
      // Journaliser la requête
      const requestId = notionLogger.logRequest(method, endpoint);
      const startTime = performance.now();
      
      try {
        // Exécuter la requête originale
        const response = await originalRequest(options);
        
        // Calculer le temps de réponse
        const responseTime = Math.round(performance.now() - startTime);
        
        // Journaliser le succès
        notionLogger.logResponse(
          requestId,
          200, // Status OK par défaut pour les requêtes réussies
          true,
          responseTime
        );
        
        return response;
      } catch (error: any) {
        // Calculer le temps de réponse même en cas d'erreur
        const responseTime = Math.round(performance.now() - startTime);
        
        // Extraire le statut HTTP si disponible
        const statusMatch = error.message?.match(/HTTP (\d+)|Erreur (\d+)/i);
        const status = statusMatch ? parseInt(statusMatch[1] || statusMatch[2]) : 500;
        
        // Journaliser l'erreur
        notionLogger.logResponse(
          requestId,
          status,
          false,
          responseTime,
          error.message
        );
        
        // Vérifier si c'est une erreur CORS
        if (error.message?.includes('CORS') || error.message?.includes('cross-origin')) {
          notionLogger.logError('Erreur CORS détectée. Assurez-vous d\'utiliser le proxy Netlify.', error);
          console.error('🔴 ERREUR CORS DÉTECTÉE:', error);
        }
        
        throw error;
      }
    };
    
    // Remplacer la fonction de requête par notre version interceptée
    (notionCentralService as any).request = interceptedRequest;
    
    // Restaurer la fonction originale lors du nettoyage
    return () => {
      (notionCentralService as any).request = originalRequest;
    };
  }, []);
  
  return {
    getLog: notionLogger.getLog,
    getStats: notionLogger.getStats,
    clearLog: notionLogger.clearLog
  };
}

export default useNotionApiInterceptor;
