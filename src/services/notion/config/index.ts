
/**
 * Gestion de la configuration du service Notion
 * Ce module centralise la configuration et la gestion des différentes sources
 * (localStorage, variables d'environnement, etc.)
 */

// Configuration par défaut
export const DEFAULT_CONFIG = {
  apiKey: null,
  databaseIds: {
    projects: null,
    checklists: null,
    exigences: null,
    pages: null,
    audits: null,
    evaluations: null,
    actions: null,
    progress: null
  },
  mock: {
    enabled: false,
    autoFallback: true
  },
  debug: false
};

// Type pour la configuration
export interface NotionConfig {
  apiKey: string | null;
  databaseIds: {
    projects: string | null;
    checklists: string | null;
    exigences: string | null;
    pages: string | null;
    audits: string | null;
    evaluations: string | null;
    actions: string | null;
    progress: string | null;
  };
  mock: {
    enabled: boolean;
    autoFallback: boolean;
  };
  debug: boolean;
}

// Clés localStorage pour la configuration
export const STORAGE_KEYS = {
  CONFIG: 'notion_config',
  API_KEY: 'notion_api_key',
  DB_PROJECTS: 'notion_database_id',
  DB_CHECKLISTS: 'notion_checklists_database_id'
};

/**
 * Récupère la configuration stockée dans localStorage
 */
export function getStoredConfig(): NotionConfig {
  try {
    // Vérifier d'abord la nouvelle structure de configuration
    const storedConfigJson = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (storedConfigJson) {
      return JSON.parse(storedConfigJson);
    }
    
    // Fallback sur l'ancien format de stockage
    const apiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
    const projectsDbId = localStorage.getItem(STORAGE_KEYS.DB_PROJECTS);
    const checklistsDbId = localStorage.getItem(STORAGE_KEYS.DB_CHECKLISTS);
    
    return {
      ...DEFAULT_CONFIG,
      apiKey,
      databaseIds: {
        ...DEFAULT_CONFIG.databaseIds,
        projects: projectsDbId,
        checklists: checklistsDbId
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de la configuration:', error);
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * Met à jour la configuration stockée
 */
export function updateConfig(newConfig: Partial<NotionConfig>): NotionConfig {
  try {
    // Récupérer la configuration existante
    const currentConfig = getStoredConfig();
    
    // Fusionner avec les nouvelles valeurs
    const updatedConfig = {
      ...currentConfig,
      ...newConfig,
      databaseIds: {
        ...currentConfig.databaseIds,
        ...(newConfig.databaseIds || {})
      },
      mock: {
        ...currentConfig.mock,
        ...(newConfig.mock || {})
      }
    };
    
    // Stocker la configuration complète
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updatedConfig));
    
    // Pour compatibilité avec l'ancien format, également stocker séparément
    if (updatedConfig.apiKey) {
      localStorage.setItem(STORAGE_KEYS.API_KEY, updatedConfig.apiKey);
    }
    
    if (updatedConfig.databaseIds.projects) {
      localStorage.setItem(STORAGE_KEYS.DB_PROJECTS, updatedConfig.databaseIds.projects);
    }
    
    if (updatedConfig.databaseIds.checklists) {
      localStorage.setItem(STORAGE_KEYS.DB_CHECKLISTS, updatedConfig.databaseIds.checklists);
    }
    
    return updatedConfig;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la configuration:', error);
    return newConfig as NotionConfig;
  }
}

/**
 * Vérifie si la configuration est valide
 */
export function isConfigValid(config: NotionConfig): boolean {
  return !!config.apiKey && !!config.databaseIds.projects;
}

/**
 * Supprime toutes les configurations stockées
 */
export function clearConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
    localStorage.removeItem(STORAGE_KEYS.DB_PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.DB_CHECKLISTS);
    
    // Supprimer les autres clés de configuration connues
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la configuration:', error);
  }
}

// Exporter les utilitaires et types
export * from './environment';
export * from './initialization';

// Exporter une configuration par défaut
export const defaultConfig: NotionConfig = { ...DEFAULT_CONFIG };
