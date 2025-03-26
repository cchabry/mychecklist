
/**
 * Hook pour utiliser le service Notion
 */

import { useState, useEffect, useCallback } from 'react';
import { notionService } from '@/services/notion/notionService';
import { ConnectionStatus, NotionConfig } from '@/services/notion/types';
import { toast } from 'sonner';

/**
 * Hook principal pour accéder au service Notion
 */
export function useNotionService() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.Disconnected);
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  
  // Initialiser à partir de la configuration stockée
  useEffect(() => {
    const hasConfig = notionService.isConfigured();
    setIsConfigured(hasConfig);
    
    if (hasConfig) {
      setConnectionStatus(ConnectionStatus.Connected);
    } else {
      setConnectionStatus(ConnectionStatus.Disconnected);
    }
  }, []);
  
  /**
   * Configure le service Notion
   */
  const setNotionConfig = useCallback((config: NotionConfig) => {
    try {
      notionService.configure(config);
      setIsConfigured(true);
      setConnectionStatus(ConnectionStatus.Connected);
      toast.success('Configuration Notion sauvegardée');
      return true;
    } catch (error) {
      toast.error('Erreur lors de la configuration Notion', {
        description: error instanceof Error ? error.message : 'Erreur inconnue'
      });
      return false;
    }
  }, []);
  
  /**
   * Teste la connexion à l'API Notion
   */
  const testConnection = useCallback(async () => {
    setIsLoading(true);
    setLastError(null);
    
    try {
      const result = await notionService.testConnection();
      
      setConnectionStatus(result.success ? ConnectionStatus.Connected : ConnectionStatus.Error);
      
      if (!result.success) {
        setLastError(new Error(result.error || 'Erreur de connexion'));
        
        toast.error('Erreur de connexion à Notion', {
          description: result.error
        });
      } else {
        toast.success('Connexion à Notion réussie', {
          description: `Connecté en tant que ${result.user}`
        });
      }
      
      return result;
    } catch (error) {
      setConnectionStatus(ConnectionStatus.Error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      setLastError(error instanceof Error ? error : new Error(errorMessage));
      
      toast.error('Erreur de connexion à Notion', {
        description: errorMessage
      });
      
      return {
        success: false,
        error: errorMessage,
        details: error
      };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Gère le mode démo
   */
  const toggleMockMode = useCallback((enabled: boolean) => {
    notionService.setMockMode(enabled);
    toast.success(enabled ? 'Mode démo activé' : 'Mode démo désactivé');
  }, []);
  
  return {
    isConfigured,
    connectionStatus,
    isLoading,
    lastError,
    isConnected: connectionStatus === ConnectionStatus.Connected,
    isMockMode: notionService.isMockMode(),
    
    setNotionConfig,
    testConnection,
    toggleMockMode,
    getConfig: notionService.getConfig,
    
    // Exposer le service directement
    notion: notionService
  };
}
