
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useNotionStorage, NotionConfig } from './notion/useNotionStorage';
import { useNotionConnection, NotionConnectionStatus } from './notion/useNotionConnection';
import { useNotionConfigUI } from './notion/useNotionConfigUI';

/**
 * Hook principal pour gérer la configuration et connexion Notion
 * Utilise des hooks spécialisés pour améliorer la séparation des responsabilités
 */
export function useNotionConfig() {
  // Utiliser nos hooks spécialisés
  const { getStoredConfig, updateStoredConfig, hasStoredConfig } = useNotionStorage();
  const { openConfig, closeConfig, showConfig } = useNotionConfigUI();
  
  // Récupérer la configuration stockée
  const config = getStoredConfig();
  
  // Initialiser le hook de connexion avec la clé API stockée
  const { status, testConnection, resetAndTest } = useNotionConnection(
    config.apiKey, 
    hasStoredConfig()
  );
  
  /**
   * Met à jour la configuration locale
   */
  const updateConfig = useCallback((newConfig: Partial<NotionConfig>): void => {
    updateStoredConfig(newConfig);
  }, [updateStoredConfig]);
  
  // Propriété calculée - utilise réellement Notion
  const usingNotion = status.isConnected && hasStoredConfig();
  
  return {
    // États
    config,
    status,
    showConfig,
    usingNotion,
    
    // Actions
    updateConfig,
    testConnection,
    resetAndTest,
    openConfig,
    closeConfig,
    hasConfig: hasStoredConfig
  };
}

// Re-exporter les types pour les consommateurs
export type { NotionConfig, NotionConnectionStatus };
