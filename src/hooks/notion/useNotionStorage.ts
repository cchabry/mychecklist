
import { STORAGE_KEYS } from '@/lib/notionProxy/config';

export interface NotionConfig {
  apiKey: string;
  databaseId: string;
  checklistsDbId: string;
  lastConfigDate: string | null;
}

/**
 * Hook spécialisé pour gérer le stockage et la récupération des données Notion dans localStorage
 */
export function useNotionStorage() {
  /**
   * Récupère la configuration stockée
   */
  const getStoredConfig = (): NotionConfig => {
    return {
      apiKey: localStorage.getItem(STORAGE_KEYS.API_KEY) || '',
      databaseId: localStorage.getItem(STORAGE_KEYS.DATABASE_ID) || '',
      checklistsDbId: localStorage.getItem('notion_checklists_database_id') || '',
      lastConfigDate: localStorage.getItem('notion_last_config_date')
    };
  };

  /**
   * Met à jour la configuration dans localStorage
   */
  const updateStoredConfig = (config: Partial<NotionConfig>): void => {
    const updatedConfig = {
      ...getStoredConfig(),
      ...config,
      lastConfigDate: new Date().toISOString()
    };

    // Mettre à jour localStorage
    if (config.apiKey !== undefined) {
      localStorage.setItem(STORAGE_KEYS.API_KEY, config.apiKey);
    }
    
    if (config.databaseId !== undefined) {
      localStorage.setItem(STORAGE_KEYS.DATABASE_ID, config.databaseId);
    }
    
    if (config.checklistsDbId !== undefined) {
      localStorage.setItem('notion_checklists_database_id', config.checklistsDbId);
    }
    
    localStorage.setItem('notion_last_config_date', new Date().toISOString());
  };

  /**
   * Vérifie si la configuration est présente
   */
  const hasStoredConfig = (): boolean => {
    const config = getStoredConfig();
    return !!(config.apiKey && config.databaseId);
  };

  return {
    getStoredConfig,
    updateStoredConfig,
    hasStoredConfig
  };
}
