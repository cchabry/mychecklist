
import { useState, useEffect, useCallback } from 'react';
import { notionApi } from '@/lib/notionProxy';
import { clearStoredNotionErrors } from '@/lib/notionProxy/errorHandling';
import { toast } from 'sonner';
import { operationMode } from '@/services/operationMode';
import { isMockActive, temporarilyDisableMock } from '@/components/notion/utils';

export interface NotionConnectionStatus {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  isMockMode: boolean;
  lastTestedAt?: number;
}

/**
 * Hook spécialisé pour gérer le statut de connexion à Notion
 * Centralise toute la logique liée au test de connexion et au mode mock
 */
export function useNotionConnection(apiKey: string, hasConfig: boolean) {
  const [status, setStatus] = useState<NotionConnectionStatus>({
    isConnected: false,
    isLoading: true,
    error: null,
    isMockMode: isMockActive()
  });

  /**
   * Teste la connexion à Notion
   * @returns Promise<boolean> - true si connecté, false sinon
   */
  const testConnection = useCallback(async (): Promise<boolean> => {
    if (!apiKey) {
      setStatus(prev => ({ 
        ...prev, 
        isConnected: false, 
        isLoading: false,
        error: 'Clé API manquante'
      }));
      return false;
    }
    
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Vérifie si le mode mock est activé
      if (isMockActive()) {
        setStatus(prev => ({ 
          ...prev, 
          isConnected: false, 
          isLoading: false,
          isMockMode: true,
          lastTestedAt: Date.now()
        }));
        return false;
      }
      
      // Teste la connexion avec l'API Users
      const user = await notionApi.users.me(apiKey);
      
      // Réinitialise les erreurs précédentes
      clearStoredNotionErrors();
      
      setStatus(prev => ({ 
        ...prev, 
        isConnected: true, 
        isLoading: false, 
        error: null,
        isMockMode: false,
        lastTestedAt: Date.now()
      }));
      
      return true;
    } catch (error) {
      setStatus(prev => ({ 
        ...prev, 
        isConnected: false, 
        isLoading: false, 
        error: error.message,
        lastTestedAt: Date.now()
      }));
      
      return false;
    }
  }, [apiKey]);

  /**
   * Reset le mode mock et force un test de connexion
   */
  const resetAndTest = useCallback(async (): Promise<void> => {
    // Réinitialiser le mode mock
    temporarilyDisableMock();
    
    // Effacer les erreurs stockées
    clearStoredNotionErrors();
    
    // Notification
    toast.info('Réinitialisation du mode', {
      description: 'Tentative de connexion en mode réel...'
    });
    
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
        isMockMode: isMockActive()
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
        isMockMode: isMockActive()
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
