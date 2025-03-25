
/**
 * Configuration centralisée pour les services Notion
 */

import { NotionClientConfig } from '../client/types';
import { detectEnvironment } from '@/services/apiProxy/environmentDetector';

// Enum pour les environnements de déploiement
export enum DeploymentEnvironment {
  Local = 'local',
  Vercel = 'vercel',
  Netlify = 'netlify',
  Other = 'other'
}

// Types pour la configuration
export interface NotionConfig {
  // Identifiants d'API et bases de données
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
  
  // Configuration du client
  client: NotionClientConfig;
  
  // Configuration du mode
  mode: {
    demoMode: boolean;
    autoFallback: boolean; // Active le basculement automatique en mode démo en cas d'erreur
    persistentMode: boolean; // Persiste le mode dans localStorage
  };
  
  // Configuration des erreurs
  errors: {
    logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug';
    maxRetries: number;
    retryDelay: number; // en ms
    showToasts: boolean;
  };
  
  // Configuration de la mise en cache
  cache: {
    enabled: boolean;
    ttl: number; // en ms
    storageKey: string;
  };
}

// Clés de stockage
export const STORAGE_KEYS = {
  API_KEY: 'notion_api_key',
  DATABASE_PROJECTS: 'notion_database_id',
  DATABASE_CHECKLISTS: 'notion_checklists_database_id',
  DATABASE_EXIGENCES: 'notion_exigences_database_id',
  DATABASE_PAGES: 'notion_pages_database_id',
  DATABASE_AUDITS: 'notion_audits_database_id',
  DATABASE_EVALUATIONS: 'notion_evaluations_database_id',
  DATABASE_ACTIONS: 'notion_actions_database_id',
  DATABASE_PROGRESS: 'notion_progress_database_id',
  MODE: 'notion_operation_mode',
  LAST_ERROR: 'notion_last_error',
  LAST_CONFIG_DATE: 'notion_last_config_date'
};

// Configuration par défaut
const DEFAULT_CONFIG: NotionConfig = {
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
  client: {
    apiVersion: '2022-06-28',
    debug: process.env.NODE_ENV === 'development'
  },
  mode: {
    demoMode: false,
    autoFallback: true,
    persistentMode: true
  },
  errors: {
    logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
    maxRetries: 3,
    retryDelay: 1000,
    showToasts: true
  },
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
    storageKey: 'notion_api_cache'
  }
};

// Obtient la configuration actuelle depuis le localStorage
export function getStoredConfig(): NotionConfig {
  // Initialiser avec les valeurs par défaut
  const config: NotionConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  
  // Charger l'API key
  config.apiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
  
  // Charger les IDs des bases de données
  config.databaseIds = {
    projects: localStorage.getItem(STORAGE_KEYS.DATABASE_PROJECTS),
    checklists: localStorage.getItem(STORAGE_KEYS.DATABASE_CHECKLISTS),
    exigences: localStorage.getItem(STORAGE_KEYS.DATABASE_EXIGENCES),
    pages: localStorage.getItem(STORAGE_KEYS.DATABASE_PAGES),
    audits: localStorage.getItem(STORAGE_KEYS.DATABASE_AUDITS),
    evaluations: localStorage.getItem(STORAGE_KEYS.DATABASE_EVALUATIONS),
    actions: localStorage.getItem(STORAGE_KEYS.DATABASE_ACTIONS),
    progress: localStorage.getItem(STORAGE_KEYS.DATABASE_PROGRESS)
  };
  
  // Charger le mode d'opération
  try {
    const storedMode = localStorage.getItem(STORAGE_KEYS.MODE);
    if (storedMode) {
      const parsedMode = JSON.parse(storedMode);
      config.mode = { ...config.mode, ...parsedMode };
    }
  } catch (e) {
    console.error('Erreur lors du chargement du mode:', e);
  }
  
  return config;
}

// Sauvegarde la configuration dans le localStorage
export function saveConfig(config: Partial<NotionConfig>): void {
  // Sauvegarder l'API key si fournie
  if (config.apiKey !== undefined) {
    if (config.apiKey) {
      localStorage.setItem(STORAGE_KEYS.API_KEY, config.apiKey);
    } else {
      localStorage.removeItem(STORAGE_KEYS.API_KEY);
    }
  }
  
  // Sauvegarder les IDs des bases de données si fournis
  if (config.databaseIds) {
    const { databaseIds } = config;
    
    if (databaseIds.projects !== undefined) {
      databaseIds.projects 
        ? localStorage.setItem(STORAGE_KEYS.DATABASE_PROJECTS, databaseIds.projects)
        : localStorage.removeItem(STORAGE_KEYS.DATABASE_PROJECTS);
    }
    
    if (databaseIds.checklists !== undefined) {
      databaseIds.checklists 
        ? localStorage.setItem(STORAGE_KEYS.DATABASE_CHECKLISTS, databaseIds.checklists)
        : localStorage.removeItem(STORAGE_KEYS.DATABASE_CHECKLISTS);
    }
    
    if (databaseIds.exigences !== undefined) {
      databaseIds.exigences
        ? localStorage.setItem(STORAGE_KEYS.DATABASE_EXIGENCES, databaseIds.exigences)
        : localStorage.removeItem(STORAGE_KEYS.DATABASE_EXIGENCES);
    }
    
    if (databaseIds.pages !== undefined) {
      databaseIds.pages
        ? localStorage.setItem(STORAGE_KEYS.DATABASE_PAGES, databaseIds.pages)
        : localStorage.removeItem(STORAGE_KEYS.DATABASE_PAGES);
    }
    
    if (databaseIds.audits !== undefined) {
      databaseIds.audits
        ? localStorage.setItem(STORAGE_KEYS.DATABASE_AUDITS, databaseIds.audits)
        : localStorage.removeItem(STORAGE_KEYS.DATABASE_AUDITS);
    }
    
    if (databaseIds.evaluations !== undefined) {
      databaseIds.evaluations
        ? localStorage.setItem(STORAGE_KEYS.DATABASE_EVALUATIONS, databaseIds.evaluations)
        : localStorage.removeItem(STORAGE_KEYS.DATABASE_EVALUATIONS);
    }
    
    if (databaseIds.actions !== undefined) {
      databaseIds.actions
        ? localStorage.setItem(STORAGE_KEYS.DATABASE_ACTIONS, databaseIds.actions)
        : localStorage.removeItem(STORAGE_KEYS.DATABASE_ACTIONS);
    }
    
    if (databaseIds.progress !== undefined) {
      databaseIds.progress
        ? localStorage.setItem(STORAGE_KEYS.DATABASE_PROGRESS, databaseIds.progress)
        : localStorage.removeItem(STORAGE_KEYS.DATABASE_PROGRESS);
    }
  }
  
  // Sauvegarder le mode d'opération si fourni
  if (config.mode && config.mode.persistentMode !== false) {
    try {
      const currentMode = localStorage.getItem(STORAGE_KEYS.MODE);
      const currentModeObj = currentMode ? JSON.parse(currentMode) : {};
      const newMode = { ...currentModeObj, ...config.mode };
      localStorage.setItem(STORAGE_KEYS.MODE, JSON.stringify(newMode));
    } catch (e) {
      console.error('Erreur lors de la sauvegarde du mode:', e);
    }
  }
  
  // Enregistrer la date de dernière configuration
  localStorage.setItem(STORAGE_KEYS.LAST_CONFIG_DATE, new Date().toISOString());
}

// Vérifie si une configuration est valide
export function isConfigValid(config: NotionConfig): boolean {
  // Une configuration minimale valide nécessite une API key et au moins l'ID de la base de projets
  return !!(config.apiKey && config.databaseIds.projects);
}

// Génère une configuration optimisée pour l'environnement actuel
export function generateEnvironmentConfig(): Partial<NotionConfig> {
  const env = detectEnvironment();
  
  switch (env) {
    case 'netlify':
      return {
        client: {
          debug: false
        },
        errors: {
          logLevel: 'error',
          maxRetries: 3,
          retryDelay: 1000,
          showToasts: true
        },
        cache: {
          enabled: true,
          ttl: 10 * 60 * 1000, // 10 minutes pour production
          storageKey: 'notion_api_cache'
        }
      };
      
    case 'vercel':
      return {
        client: {
          debug: false
        },
        errors: {
          logLevel: 'error',
          maxRetries: 3,
          retryDelay: 1000,
          showToasts: true
        },
        cache: {
          enabled: true,
          ttl: 10 * 60 * 1000, // 10 minutes pour production
          storageKey: 'notion_api_cache'
        }
      };
      
    case 'local':
      return {
        client: {
          debug: true
        },
        errors: {
          logLevel: 'debug',
          maxRetries: 3,
          retryDelay: 1000,
          showToasts: true
        },
        cache: {
          enabled: true,
          ttl: 2 * 60 * 1000, // 2 minutes pour développement
          storageKey: 'notion_api_cache'
        }
      };
      
    default:
      return {};
  }
}

// Vérifie si tous les champs requis sont configurés
export function hasRequiredConfig(): boolean {
  const config = getStoredConfig();
  return isConfigValid(config);
}

// Exporte la configuration actuelle
export const currentConfig = getStoredConfig();

// Fonction pour mettre à jour la configuration et sauvegarder les changements
export function updateConfig(newConfig: Partial<NotionConfig>): NotionConfig {
  const updatedConfig = { ...getStoredConfig(), ...newConfig };
  saveConfig(newConfig);
  return updatedConfig;
}

// Exporte les constantes et types
export { STORAGE_KEYS };
