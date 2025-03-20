
import { useState, useEffect, useCallback } from 'react';
import { notionApi } from '@/lib/notionProxy';
import { clearStoredNotionErrors } from '@/lib/notionProxy/errorHandling';
import { toast } from 'sonner';

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
    isMockMode: notionApi.mockMode.isActive()
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
      if (notionApi.mockMode.isActive()) {
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
      console.error('Notion connection test failed:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erreur inconnue lors du test de connexion';
      
      setStatus(prev => ({ 
        ...prev, 
        isConnected: false, 
        isLoading: false,
        error: errorMessage,
        lastTestedAt: Date.now()
      }));
      
      return false;
    }
  }, [apiKey]);

  // Test la connexion au montage du composant
  useEffect(() => {
    if (hasConfig) {
      testConnection();
    } else {
      setStatus(prev => ({ 
        ...prev, 
        isConnected: false, 
        isLoading: false,
        error: 'Configuration manquante'
      }));
    }
  }, [hasConfig, testConnection]);

  // Test la connexion à chaque changement de clé API
  useEffect(() => {
    if (apiKey) {
      testConnection();
    }
  }, [apiKey, testConnection]);

  return {
    ...status,
    testConnection,
    resetConnection: () => {
      // Nettoie les erreurs stockées
      clearStoredNotionErrors();
      // Réinitialise le statut
      setStatus(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null,
        lastTestedAt: undefined
      }));
      // Lance un nouveau test de connexion
      testConnection();
    }
  };
}
