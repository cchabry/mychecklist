
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useNotionStorage, NotionConfig } from './notion/useNotionStorage';
import { useNotionConnection, NotionConnectionStatus } from './notion/useNotionConnection';
import { useNotionConfigUI } from './notion/useNotionConfigUI';
import { useNotionError } from './notion/useNotionError';

/**
 * Hook principal pour gérer la configuration et connexion Notion
 * Unifie tous les hooks spécialisés pour une expérience cohérente
 */
export function useNotionConfig() {
  // Utiliser nos hooks spécialisés
  const storage = useNotionStorage();
  const configUI = useNotionConfigUI();
  const notionError = useNotionError();
  
  // Récupérer la configuration stockée
  const config = storage.getStoredConfig();
  
  // Initialiser le hook de connexion avec la clé API stockée
  const { status, testConnection, resetAndTest } = useNotionConnection(
    config.apiKey, 
    storage.hasStoredConfig()
  );
  
  /**
   * Met à jour la configuration locale et teste la connexion
   */
  const updateConfig = useCallback(async (newConfig: Partial<NotionConfig>): Promise<boolean> => {
    // Mettre à jour la config
    storage.updateStoredConfig(newConfig);
    
    // Si la clé API ou l'ID de base de données a changé, tester la connexion
    if (newConfig.apiKey || newConfig.databaseId) {
      const success = await testConnection();
      
      if (success) {
        toast.success('Configuration Notion mise à jour', {
          description: 'Connexion réussie avec la nouvelle configuration'
        });
      }
      
      return success;
    }
    
    return true;
  }, [storage, testConnection]);
  
  // Propriété calculée - utilise réellement Notion (connecté et pas en mode mock)
  const usingNotion = status.isConnected && !status.isMockMode && storage.hasStoredConfig();
  
  return {
    // États
    config,
    status,
    showConfig: configUI.showConfig,
    errorDetails: notionError.errorDetails,
    showErrorModal: notionError.showErrorModal,
    
    // Valeurs calculées
    usingNotion,
    hasChecklistsDb: storage.hasChecklistsConfig(),
    
    // Actions principales
    updateConfig,
    testConnection,
    resetAndTest,
    
    // Actions UI
    openConfig: configUI.openConfig,
    closeConfig: configUI.closeConfig,
    
    // Actions erreurs
    showError: notionError.showError,
    clearError: notionError.clearError,
    openErrorModal: notionError.openErrorModal,
    closeErrorModal: notionError.closeErrorModal,
    
    // Helpers
    hasConfig: storage.hasStoredConfig
  };
}

// Re-exporter les types pour les consommateurs
export type { NotionConfig, NotionConnectionStatus };
