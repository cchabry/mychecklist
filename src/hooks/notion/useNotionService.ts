
/**
 * Hook pour utiliser le service Notion
 * 
 * Ce hook fournit une interface unifiée pour interagir avec le service Notion,
 * gérer la configuration et tester la connexion.
 */

import { useState, useEffect, useCallback } from 'react';
import { notionService } from '@/services/notion/notionService';
import { ConnectionStatus } from '@/services/notion/types';
import { toast } from 'sonner';
import { useOperationMode } from '@/hooks/useOperationMode';
import { useNotionErrorHandler } from './useNotionErrorHandler';
import { NotionServiceHookResult } from './types';
import { NotionTestResponse } from '@/types/api/notionApi';

/**
 * Hook principal pour accéder au service Notion
 * 
 * @returns Interface standardisée pour interagir avec le service Notion
 */
export function useNotionService(): NotionServiceHookResult {
  const [isConfigured, setIsConfigured] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.Disconnected);
  const [isLoading, setIsLoading] = useState(false);
  const { handleNotionError, clearError, lastError } = useNotionErrorHandler();
  const { isDemoMode } = useOperationMode();
  
  // Initialiser à partir de la configuration stockée
  useEffect(() => {
    const hasConfig = notionService.isConfigured();
    setIsConfigured(hasConfig);
    
    if (hasConfig || isDemoMode) {
      setConnectionStatus(ConnectionStatus.Connected);
    } else {
      setConnectionStatus(ConnectionStatus.Disconnected);
    }
  }, [isDemoMode]);
  
  /**
   * Configure le service Notion
   */
  const setNotionConfig = useCallback((apiKey: string, projectsDbId: string, checklistsDbId?: string) => {
    try {
      notionService.configure(apiKey, projectsDbId, checklistsDbId);
      setIsConfigured(true);
      setConnectionStatus(ConnectionStatus.Connected);
      clearError();
      toast.success('Configuration Notion sauvegardée');
      return true;
    } catch (error) {
      handleNotionError(error, {
        toastTitle: 'Erreur de configuration',
        endpoint: 'configuration'
      });
      return false;
    }
  }, [handleNotionError, clearError]);
  
  /**
   * Teste la connexion à l'API Notion
   */
  const testConnection = useCallback(async (): Promise<NotionTestResponse> => {
    setIsLoading(true);
    clearError();
    
    try {
      const result = await notionService.testConnection();
      
      setConnectionStatus(result.success ? ConnectionStatus.Connected : ConnectionStatus.Error);
      
      if (!result.success) {
        handleNotionError(new Error(result.error || 'Erreur de connexion'), {
          showToast: false, // On gère l'affichage nous-mêmes ci-dessous
          endpoint: 'test-connection'
        });
        
        toast.error('Erreur de connexion à Notion', {
          description: result.error
        });
      } else {
        toast.success('Connexion à Notion réussie', {
          description: `Connecté en tant que ${result.user}`
        });
      }
      
      // Convertir ConnectionTestResult en NotionTestResponse
      return {
        user: result.user ? { 
          id: 'user-id', 
          name: result.user, 
          type: 'person' 
        } : undefined,
        workspace: result.workspaceName,
        timestamp: Date.now()
      };
    } catch (error) {
      setConnectionStatus(ConnectionStatus.Error);
      
      handleNotionError(error, {
        toastTitle: 'Erreur de connexion à Notion',
        showToast: true,
        endpoint: 'test-connection',
        switchToDemo: true,
        demoReason: 'Erreur de connexion'
      });
      
      return {
        timestamp: Date.now() // Assurer qu'on renvoie toujours un timestamp
      };
    } finally {
      setIsLoading(false);
    }
  }, [handleNotionError, clearError]);
  
  return {
    // Données
    isConfigured,
    connectionStatus,
    isLoading,
    lastError,
    isConnected: connectionStatus === ConnectionStatus.Connected,
    isMockMode: notionService.isMockMode() || isDemoMode,
    
    // Méthodes
    setNotionConfig,
    testConnection,
    getConfig: notionService.getConfig,
    
    // Exposer le service directement
    notion: notionService
  };
}
