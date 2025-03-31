
import { useState, useEffect } from 'react';
import { notionErrorService, NotionError, NotionErrorType } from '@/services/notion/errorHandling';

// Types pour les options de l'API Notion
export interface NotionAPIOptions<T = any> {
  // Mode d'opération forcé (ignore le mode global)
  forceMode?: 'real' | 'demo';
  
  // Gestion des erreurs
  onError?: (error: NotionError) => void;
  
  // Traitement additionnel des données
  processResult?: (data: T) => T;
  
  // Nombre maximum de tentatives en cas d'erreur
  maxRetries?: number;
  
  // Délai entre les tentatives (ms)
  retryDelay?: number;
}

/**
 * Hook principal pour utiliser l'API Notion avec gestion des erreurs et retry
 */
export function useNotionAPI() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<NotionError | null>(null);

  // S'abonner aux notifications d'erreurs
  useEffect(() => {
    const unsubscribe = notionErrorService.subscribe(() => {
      // Mettre à jour l'erreur si nécessaire
      const recentErrors = notionErrorService.getRecentErrors();
      if (recentErrors.length > 0 && !lastError) {
        setLastError(recentErrors[0]);
      }
    });

    return unsubscribe;
  }, [lastError]);

  /**
   * Exécute une requête Notion avec gestion des erreurs et retry
   */
  const execute = async <T>(
    endpoint: string,
    method: string = 'GET',
    body?: any,
    token?: string,
    options: NotionAPIOptions<T> = {}
  ): Promise<T> => {
    setIsLoading(true);
    setLastError(null);

    try {
      // Simuler une requête réussie pour l'instant
      // En réalité, cette fonction devrait appeler l'API Notion via un proxy CORS
      console.log(`Exécution de la requête ${method} ${endpoint}`);
      
      // Implémenter l'appel réel ici plus tard
      const mockResult = { success: true } as unknown as T;
      
      setIsLoading(false);
      return mockResult;
    } catch (error) {
      // Convertir en Error si nécessaire
      const formattedError = error instanceof Error ? error : new Error(String(error));
      
      // Signaler l'erreur au service
      const enhancedError = notionErrorService.reportError(
        formattedError, 
        `${method} ${endpoint}`
      );

      // Callback d'erreur
      if (options.onError) {
        options.onError(enhancedError);
      }

      setLastError(enhancedError);
      setIsLoading(false);
      throw enhancedError;
    }
  };

  return {
    isLoading,
    lastError,
    execute,
    clearError: () => setLastError(null)
  };
}
