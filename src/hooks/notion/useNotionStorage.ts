
import { STORAGE_KEYS } from '@/lib/notionProxy/config';
import { useCallback } from 'react';

export interface NotionConfig {
  apiKey: string;
  databaseId: string;
  requirementsDbId: string;
  auditsDbId: string;
  auditResultsDbId: string;
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
      requirementsDbId: localStorage.getItem('notion_requirements_database_id') || '',
      auditsDbId: localStorage.getItem('notion_audits_database_id') || '',
      auditResultsDbId: localStorage.getItem('notion_audit_results_database_id') || '',
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
    
    if (config.requirementsDbId !== undefined) {
      localStorage.setItem('notion_requirements_database_id', config.requirementsDbId);
    }
    
    if (config.auditsDbId !== undefined) {
      localStorage.setItem('notion_audits_database_id', config.auditsDbId);
    }
    
    if (config.auditResultsDbId !== undefined) {
      localStorage.setItem('notion_audit_results_database_id', config.auditResultsDbId);
    }
    
    localStorage.setItem(STORAGE_KEYS.LAST_CONFIG_DATE, new Date().toISOString());
  }, [getStoredConfig]);

  /**
   * Efface la configuration stockée
   */
  const clearStoredConfig = useCallback((): void => {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
    localStorage.removeItem(STORAGE_KEYS.DATABASE_ID);
    localStorage.removeItem('notion_requirements_database_id');
    localStorage.removeItem('notion_audits_database_id');
    localStorage.removeItem('notion_audit_results_database_id');
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
   * Vérifie si la configuration des bases de données avancées est présente
   */
  const hasAdvancedConfig = useCallback((): boolean => {
    const config = getStoredConfig();
    return !!(config.requirementsDbId && config.auditsDbId && config.auditResultsDbId);
  }, [getStoredConfig]);

  return {
    getStoredConfig,
    updateStoredConfig,
    clearStoredConfig,
    hasStoredConfig,
    hasAdvancedConfig
  };
}
