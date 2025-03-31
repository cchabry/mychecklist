
import { useState, useCallback } from 'react';
import { useOperationMode } from '@/services/operationMode';
import { useErrorReporter } from './useErrorReporter';
import { toast } from 'sonner';
import { useCache } from './cache/useCache';

export interface NotionAPIOptions<T> {
  // Données à utiliser en mode démonstration
  demoData?: T;
  
  // Simuler un délai en mode démonstration (ms)
  simulatedDelay?: number;
  
  // Montrer automatiquement un toast de chargement
  showLoadingToast?: boolean;
  
  // Montrer automatiquement un toast d'erreur
  showErrorToast?: boolean;
  
  // Messages personnalisés
  messages?: {
    loading?: string;
    success?: string;
    error?: string;
  };
  
  // Contexte pour les rapports d'erreur
  errorContext?: string;
  
  // Options de mise en cache
  cacheOptions?: {
    enabled?: boolean;
    ttl?: number;
    key?: string;
  };
}

/**
 * Hook standardisé pour effectuer des appels à l'API Notion
 * Gestion automatique du mode démo et des erreurs
 */
export function useNotionAPI() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { isDemoMode, settings } = useOperationMode();
  const { reportError, reportSuccess } = useErrorReporter();
  const cache = useCache();
  
  /**
   * Exécute une opération Notion avec gestion automatique du mode et du cache
   */
  const execute = useCallback(async <T>(
    endpoint: string,
    method: string = 'GET',
    body?: any,
    apiKey?: string,
    options: NotionAPIOptions<T> = {}
  ): Promise<T> => {
    // Extraire les options avec valeurs par défaut
    const {
      demoData,
      simulatedDelay = settings.simulatedNetworkDelay,
      showLoadingToast = false,
      showErrorToast = true,
      messages = {},
      errorContext = 'Opération Notion',
      cacheOptions = { enabled: true }
    } = options;
    
    // Générer une clé de cache
    const cacheKey = cacheOptions.key || 
      `notion:${method}:${endpoint}:${JSON.stringify(body || {})}`;
    
    // Vérifier s'il y a des données en cache
    if (cacheOptions.enabled) {
      const cachedData = cache.get<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }
    
    // Réinitialiser l'état
    setError(null);
    setIsLoading(true);
    
    // Afficher un toast de chargement si demandé
    let loadingToastId;
    if (showLoadingToast) {
      loadingToastId = toast.loading(
        messages.loading || 'Chargement en cours...'
      );
    }
    
    try {
      let result: T;
      
      // Déterminer si on utilise le mode démonstration
      if (isDemoMode) {
        // En mode démo, on utilise les données simulées
        if (demoData === undefined) {
          throw new Error('Aucune donnée de démonstration fournie pour cette opération');
        }
        
        // Simuler un délai réseau
        if (simulatedDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, simulatedDelay));
        }
        
        // Simuler aléatoirement une erreur si configuré
        if (settings.errorSimulationRate > 0) {
          const shouldError = Math.random() * 100 < settings.errorSimulationRate;
          if (shouldError) {
            throw new Error('Erreur simulée en mode démonstration');
          }
        }
        
        result = demoData;
        console.log('[NotionAPI] Mode démo - Utilisation des données simulées', demoData);
      } else {
        // En mode réel, on exécute l'opération
        const notionApiUrl = process.env.REACT_APP_NOTION_API_URL || '/api/notion-proxy';
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        
        if (apiKey) {
          headers['x-notion-token'] = apiKey;
        }
        
        const requestOptions: RequestInit = {
          method,
          headers,
          credentials: 'include'
        };
        
        if (method !== 'GET' && body) {
          requestOptions.body = JSON.stringify(body);
        }
        
        const response = await fetch(`${notionApiUrl}${endpoint}`, requestOptions);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erreur Notion (${response.status}): ${errorText}`);
        }
        
        result = await response.json();
        
        // Signaler une opération réussie
        reportSuccess();
      }
      
      // Mettre en cache le résultat si le cache est activé
      if (cacheOptions.enabled) {
        cache.set(cacheKey, result, cacheOptions.ttl);
      }
      
      // Mettre à jour l'état et les toasts
      setIsLoading(false);
      if (loadingToastId && messages.success) {
        toast.success(messages.success, { id: loadingToastId });
      } else if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      
      return result;
    } catch (err) {
      // Gérer l'erreur
      const formattedError = err instanceof Error ? err : new Error(String(err));
      setError(formattedError);
      setIsLoading(false);
      
      // Signaler l'erreur au système de reporting
      reportError(formattedError, errorContext, { 
        showToast: showErrorToast,
        toastMessage: messages.error || "Erreur lors de l'opération"
      });
      
      // Mettre à jour le toast de chargement
      if (loadingToastId) {
        toast.error(messages.error || "Erreur lors de l'opération", { 
          id: loadingToastId,
          description: formattedError.message
        });
      }
      
      throw formattedError;
    }
  }, [isDemoMode, settings, reportError, reportSuccess, cache]);
  
  // Les opérations spécifiques sont maintenant gérées par un exécuteur générique
  const executeOperation = useCallback(<T>(
    operation: () => Promise<T>,
    options: NotionAPIOptions<T> = {}
  ): Promise<T> => {
    return execute<T>('', 'CUSTOM', undefined, undefined, {
      ...options,
      cacheOptions: { enabled: false }
    });
  }, [execute]);
  
  return {
    execute,
    executeOperation,
    isLoading,
    error,
    isDemoMode,
    clearError: () => setError(null)
  };
}
