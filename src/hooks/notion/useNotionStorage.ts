
import { STORAGE_KEYS } from '@/lib/notionProxy/config';
import { useCallback } from 'react';

export interface NotionConfig {
  apiKey: string;
  databaseId: string;
  checklistsDbId: string;
  lastConfigDate: string | null;
}

/**
 * Hook spécialisé pour gérer le stockage et la récupération des données Notion dans localStorage
 * Centralise toutes les opérations liées à la persistance de la configuration
 */
export function useNotionStorage() {
  /**
   * Récupère la configuration stockée
   */
  const getStoredConfig = useCallback((): NotionConfig => {
    return {
      apiKey: localStorage.getItem(STORAGE_KEYS.NOTION_API_KEY) || '',
      databaseId: localStorage.getItem(STORAGE_KEYS.PROJECTS_DB_ID) || '',
      checklistsDbId: localStorage.getItem(STORAGE_KEYS.CHECKLISTS_DB_ID) || '',
      lastConfigDate: localStorage.getItem(STORAGE_KEYS.LAST_SAVED_CONFIG)
    };
  }, []);

  /**
   * Met à jour la configuration dans localStorage
   */
  const updateStoredConfig = useCallback((config: Partial<NotionConfig>): void => {
    const updatedConfig = {
      ...getStoredConfig(),
      ...config,
      lastConfigDate: new Date().toISOString()
    };

    // Mettre à jour localStorage
    if (config.apiKey !== undefined) {
      localStorage.setItem(STORAGE_KEYS.NOTION_API_KEY, config.apiKey);
    }
    
    if (config.databaseId !== undefined) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS_DB_ID, config.databaseId);
    }
    
    if (config.checklistsDbId !== undefined) {
      localStorage.setItem(STORAGE_KEYS.CHECKLISTS_DB_ID, config.checklistsDbId);
    }
    
    localStorage.setItem(STORAGE_KEYS.LAST_SAVED_CONFIG, new Date().toISOString());
  }, [getStoredConfig]);

  /**
   * Efface la configuration stockée
   */
  const clearStoredConfig = useCallback((): void => {
    localStorage.removeItem(STORAGE_KEYS.NOTION_API_KEY);
    localStorage.removeItem(STORAGE_KEYS.PROJECTS_DB_ID);
    localStorage.removeItem(STORAGE_KEYS.CHECKLISTS_DB_ID);
    localStorage.removeItem(STORAGE_KEYS.LAST_SAVED_CONFIG);
  }, []);

  /**
   * Vérifie si la configuration est présente et complète
   */
  const hasStoredConfig = useCallback((): boolean => {
    const config = getStoredConfig();
    return !!(config.apiKey && config.databaseId);
  }, [getStoredConfig]);

  /**
   * Vérifie si la configuration des checklists est présente
   */
  const hasChecklistsConfig = useCallback((): boolean => {
    const config = getStoredConfig();
    return !!(config.checklistsDbId);
  }, [getStoredConfig]);

  return {
    getStoredConfig,
    updateStoredConfig,
    clearStoredConfig,
    hasStoredConfig,
    hasChecklistsConfig
  };
}
