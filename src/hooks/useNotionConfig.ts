
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { STORAGE_KEYS } from '@/lib/notionProxy/config';
import { notionApi } from '@/lib/notionProxy';
import { clearStoredNotionErrors } from '@/lib/notionProxy/errorHandling';

export interface NotionConfig {
  apiKey: string;
  databaseId: string;
  checklistsDbId: string;
  lastConfigDate: string | null;
}

export interface NotionConnectionStatus {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  isMockMode: boolean;
}

/**
 * Hook pour gérer la configuration et connexion Notion
 */
export function useNotionConfig() {
  // État pour la configuration
  const [config, setConfig] = useState<NotionConfig>({
    apiKey: localStorage.getItem(STORAGE_KEYS.API_KEY) || '',
    databaseId: localStorage.getItem(STORAGE_KEYS.DATABASE_ID) || '',
    checklistsDbId: localStorage.getItem('notion_checklists_database_id') || '',
    lastConfigDate: localStorage.getItem('notion_last_config_date')
  });
  
  // État pour le statut de connexion
  const [status, setStatus] = useState<NotionConnectionStatus>({
    isConnected: false,
    isLoading: true,
    error: null,
    isMockMode: notionApi.mockMode.isActive()
  });
  
  // UI state
  const [showConfig, setShowConfig] = useState(false);
  
  /**
   * Vérifie si la configuration est présente
   */
  const hasConfig = useCallback((): boolean => {
    return !!(config.apiKey && config.databaseId);
  }, [config]);
  
  /**
   * Met à jour la configuration locale
   */
  const updateConfig = useCallback((newConfig: Partial<NotionConfig>): void => {
    setConfig(prev => ({
      ...prev,
      ...newConfig,
      lastConfigDate: new Date().toISOString()
    }));
    
    // Mettre à jour localStorage
    if (newConfig.apiKey !== undefined) {
      localStorage.setItem(STORAGE_KEYS.API_KEY, newConfig.apiKey);
    }
    
    if (newConfig.databaseId !== undefined) {
      localStorage.setItem(STORAGE_KEYS.DATABASE_ID, newConfig.databaseId);
    }
    
    if (newConfig.checklistsDbId !== undefined) {
      localStorage.setItem('notion_checklists_database_id', newConfig.checklistsDbId);
    }
    
    localStorage.setItem('notion_last_config_date', new Date().toISOString());
  }, []);
  
  /**
   * Teste la connexion à Notion
   */
  const testConnection = useCallback(async (): Promise<boolean> => {
    if (!config.apiKey) return false;
    
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Vérifie si le mode mock est activé
      if (notionApi.mockMode.isActive()) {
        setStatus(prev => ({ 
          ...prev, 
          isConnected: false, 
          isLoading: false,
          isMockMode: true
        }));
        return false;
      }
      
      // Teste la connexion avec l'API Users
      await notionApi.users.me(config.apiKey);
      
      // Réinitialise les erreurs précédentes
      clearStoredNotionErrors();
      
      setStatus(prev => ({ 
        ...prev, 
        isConnected: true, 
        isLoading: false, 
        error: null,
        isMockMode: false
      }));
      
      return true;
    } catch (error) {
      setStatus(prev => ({ 
        ...prev, 
        isConnected: false, 
        isLoading: false, 
        error: error.message
      }));
      
      return false;
    }
  }, [config.apiKey]);
  
  /**
   * Vérifie la configuration au chargement
   */
  useEffect(() => {
    const checkConfig = async () => {
      // Mettre à jour status.isMockMode périodiquement
      setStatus(prev => ({
        ...prev,
        isMockMode: notionApi.mockMode.isActive()
      }));
      
      // Ne tester la connexion que si la configuration est présente
      if (hasConfig()) {
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
        isMockMode: notionApi.mockMode.isActive()
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [hasConfig, testConnection]);
  
  /**
   * Reset le mode mock et force un test de connexion
   */
  const resetAndTest = useCallback(async (): Promise<void> => {
    // Réinitialiser le mode mock
    notionApi.mockMode.forceReset();
    
    toast.success('Configuration réinitialisée', {
      description: 'Tentative de connexion en mode réel...'
    });
    
    // Effacer les erreurs stockées
    clearStoredNotionErrors();
    
    // Attendre un peu pour que les changements prennent effet
    setTimeout(() => {
      testConnection();
    }, 500);
  }, [testConnection]);
  
  // Actions d'interface
  const openConfig = () => setShowConfig(true);
  const closeConfig = () => setShowConfig(false);
  
  // Propriété calculée - utilise réellement Notion
  const usingNotion = status.isConnected && hasConfig();
  
  return {
    // État
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
    hasConfig
  };
}
