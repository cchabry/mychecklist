
import { useState, useEffect, useCallback } from 'react';
import { notionApi } from '@/lib/notionProxy';
import { clearStoredNotionErrors } from '@/lib/notionProxy/errorHandling';

export interface NotionConnectionStatus {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  isMockMode: boolean;
}

/**
 * Hook spécialisé pour gérer le statut de connexion à Notion
 */
export function useNotionConnection(apiKey: string, hasConfig: boolean) {
  const [status, setStatus] = useState<NotionConnectionStatus>({
    isConnected: false,
    isLoading: true,
    error: null,
    isMockMode: notionApi.mockMode.isActive()
  });

  /**
   * Teste la connexion à Notion
   */
  const testConnection = useCallback(async (): Promise<boolean> => {
    if (!apiKey) return false;
    
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Vérifie si le mode mock est activé
      if (notionApi.mockMode.isActive()) {
        setStatus(prev => ({ 
          ...prev, 
          isConnected: false, 
          isLoading: false,
          isMockMode: true
        }));
        return false;
      }
      
      // Teste la connexion avec l'API Users
      await notionApi.users.me(apiKey);
      
      // Réinitialise les erreurs précédentes
      clearStoredNotionErrors();
      
      setStatus(prev => ({ 
        ...prev, 
        isConnected: true, 
        isLoading: false, 
        error: null,
        isMockMode: false
      }));
      
      return true;
    } catch (error) {
      setStatus(prev => ({ 
        ...prev, 
        isConnected: false, 
        isLoading: false, 
        error: error.message
      }));
      
      return false;
    }
  }, [apiKey]);

  /**
   * Reset le mode mock et force un test de connexion
   */
  const resetAndTest = useCallback(async (): Promise<void> => {
    // Réinitialiser le mode mock
    notionApi.mockMode.forceReset();
    
    // Effacer les erreurs stockées
    clearStoredNotionErrors();
    
    // Attendre un peu pour que les changements prennent effet
    setTimeout(() => {
      testConnection();
    }, 500);
  }, [testConnection]);

  // Vérifier la configuration au chargement
  useEffect(() => {
    const checkConfig = async () => {
      // Mettre à jour status.isMockMode périodiquement
      setStatus(prev => ({
        ...prev,
        isMockMode: notionApi.mockMode.isActive()
      }));
      
      // Ne tester la connexion que si la configuration est présente
      if (hasConfig) {
        await testConnection();
      } else {
        setStatus(prev => ({ 
          ...prev, 
          isConnected: false, 
          isLoading: false 
        }));
      }
    };
    
    checkConfig();
    
    // Vérifier régulièrement le mode mock
    const interval = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        isMockMode: notionApi.mockMode.isActive()
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [hasConfig, testConnection]);

  return {
    status,
    testConnection,
    resetAndTest
  };
}
