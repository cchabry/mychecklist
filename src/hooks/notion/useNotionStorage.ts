import { STORAGE_KEYS } from '@/lib/notionProxy/config';
import { useCallback } from 'react';

export interface NotionConfig {
  apiKey: string;
  databaseId: string;
  checklistsDbId: string;
  projectsDbId?: string;
  auditsDbId?: string;
  exigencesDbId?: string;
  samplePagesDbId?: string;
  evaluationsDbId?: string;
  actionsDbId?: string;
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
      apiKey: localStorage.getItem(STORAGE_KEYS.API_KEY) || '',
      databaseId: localStorage.getItem(STORAGE_KEYS.DATABASE_ID) || '',
      checklistsDbId: localStorage.getItem(STORAGE_KEYS.CHECKLISTS_DB_ID) || '',
      projectsDbId: localStorage.getItem('notion_projects_database_id') || '',
      auditsDbId: localStorage.getItem('notion_audits_database_id') || '',
      exigencesDbId: localStorage.getItem('notion_exigences_database_id') || '',
      samplePagesDbId: localStorage.getItem('notion_sample_pages_database_id') || '',
      evaluationsDbId: localStorage.getItem('notion_evaluations_database_id') || '',
      actionsDbId: localStorage.getItem('notion_actions_database_id') || '',
      lastConfigDate: localStorage.getItem(STORAGE_KEYS.LAST_CONFIG_DATE)
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
      localStorage.setItem(STORAGE_KEYS.API_KEY, config.apiKey);
    }
    
    if (config.databaseId !== undefined) {
      localStorage.setItem(STORAGE_KEYS.DATABASE_ID, config.databaseId);
    }
    
    if (config.checklistsDbId !== undefined) {
      localStorage.setItem(STORAGE_KEYS.CHECKLISTS_DB_ID, config.checklistsDbId);
    }
    
    if (config.projectsDbId !== undefined) {
      localStorage.setItem('notion_projects_database_id', config.projectsDbId);
    }
    
    if (config.auditsDbId !== undefined) {
      localStorage.setItem('notion_audits_database_id', config.auditsDbId);
    }
    
    if (config.exigencesDbId !== undefined) {
      localStorage.setItem('notion_exigences_database_id', config.exigencesDbId);
    }
    
    if (config.samplePagesDbId !== undefined) {
      localStorage.setItem('notion_sample_pages_database_id', config.samplePagesDbId);
    }
    
    if (config.evaluationsDbId !== undefined) {
      localStorage.setItem('notion_evaluations_database_id', config.evaluationsDbId);
    }
    
    if (config.actionsDbId !== undefined) {
      localStorage.setItem('notion_actions_database_id', config.actionsDbId);
    }
    
    localStorage.setItem(STORAGE_KEYS.LAST_CONFIG_DATE, new Date().toISOString());
  }, [getStoredConfig]);

  /**
   * Efface la configuration stockée
   */
  const clearStoredConfig = useCallback((): void => {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
    localStorage.removeItem(STORAGE_KEYS.DATABASE_ID);
    localStorage.removeItem(STORAGE_KEYS.CHECKLISTS_DB_ID);
    localStorage.removeItem('notion_projects_database_id');
    localStorage.removeItem('notion_audits_database_id');
    localStorage.removeItem('notion_exigences_database_id');
    localStorage.removeItem('notion_sample_pages_database_id');
    localStorage.removeItem('notion_evaluations_database_id');
    localStorage.removeItem('notion_actions_database_id');
    localStorage.removeItem(STORAGE_KEYS.LAST_CONFIG_DATE);
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
