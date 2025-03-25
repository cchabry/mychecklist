
/**
 * Gestion des variables d'environnement pour la configuration Notion
 * Centralise la détection et l'accès aux variables d'environnement pour différentes plateformes
 */

import { detectEnvironment } from '@/services/apiProxy/environmentDetector';
import { NotionConfig } from './index';

// Interface pour les variables d'environnement spécifiques à Notion
export interface NotionEnvironmentVariables {
  apiKey?: string;
  databaseProjects?: string;
  databaseChecklists?: string;
  databaseExigences?: string;
  databaseAudits?: string;
  databaseEvaluations?: string;
  mockMode?: boolean;
  debug?: boolean;
}

// Préfixes de variables d'environnement par plateforme
export const ENV_PREFIXES = {
  VITE: 'VITE_',
  NETLIFY: 'NETLIFY_',
  VERCEL: 'NEXT_PUBLIC_',
  COMMON: 'NOTION_'
};

// Mappages des noms de variables par plateforme
const ENV_MAPPINGS = {
  // Variables communes (sans préfixe spécifique à la plateforme)
  common: {
    apiKey: 'NOTION_API_KEY',
    databaseProjects: 'NOTION_DB_PROJECTS',
    databaseChecklists: 'NOTION_DB_CHECKLISTS',
    databaseExigences: 'NOTION_DB_EXIGENCES',
    databaseAudits: 'NOTION_DB_AUDITS',
    databaseEvaluations: 'NOTION_DB_EVALUATIONS',
    mockMode: 'NOTION_MOCK_MODE',
    debug: 'NOTION_DEBUG'
  },
  // Variables pour Vite (développement local)
  vite: {
    apiKey: 'VITE_NOTION_API_KEY',
    databaseProjects: 'VITE_NOTION_DB_PROJECTS',
    databaseChecklists: 'VITE_NOTION_DB_CHECKLISTS',
    databaseExigences: 'VITE_NOTION_DB_EXIGENCES',
    databaseAudits: 'VITE_NOTION_DB_AUDITS',
    databaseEvaluations: 'VITE_NOTION_DB_EVALUATIONS',
    mockMode: 'VITE_NOTION_MOCK_MODE',
    debug: 'VITE_NOTION_DEBUG'
  },
  // Variables pour Netlify
  netlify: {
    apiKey: 'NETLIFY_NOTION_API_KEY',
    databaseProjects: 'NETLIFY_NOTION_DB_PROJECTS',
    databaseChecklists: 'NETLIFY_NOTION_DB_CHECKLISTS',
    databaseExigences: 'NETLIFY_NOTION_DB_EXIGENCES',
    databaseAudits: 'NETLIFY_NOTION_DB_AUDITS',
    databaseEvaluations: 'NETLIFY_NOTION_DB_EVALUATIONS',
    mockMode: 'NETLIFY_NOTION_MOCK_MODE',
    debug: 'NETLIFY_NOTION_DEBUG'
  },
  // Variables pour Vercel
  vercel: {
    apiKey: 'NEXT_PUBLIC_NOTION_API_KEY',
    databaseProjects: 'NEXT_PUBLIC_NOTION_DB_PROJECTS',
    databaseChecklists: 'NEXT_PUBLIC_NOTION_DB_CHECKLISTS',
    databaseExigences: 'NEXT_PUBLIC_NOTION_DB_EXIGENCES',
    databaseAudits: 'NEXT_PUBLIC_NOTION_DB_AUDITS',
    databaseEvaluations: 'NEXT_PUBLIC_NOTION_DB_EVALUATIONS',
    mockMode: 'NEXT_PUBLIC_NOTION_MOCK_MODE',
    debug: 'NEXT_PUBLIC_NOTION_DEBUG'
  }
};

/**
 * Récupère une variable d'environnement spécifique à la plateforme actuelle
 * Essaie plusieurs formats de noms de variables potentiels
 */
export function getEnvironmentVariable(variableName: keyof NotionEnvironmentVariables): string | undefined {
  const environment = detectEnvironment();
  const variableMappings = [
    // Essayer d'abord le format spécifique à l'environnement
    ENV_MAPPINGS[environment]?.[variableName],
    // Puis le format commun
    ENV_MAPPINGS.common[variableName],
    // Puis des variantes potentielles
    `${ENV_PREFIXES.COMMON}${variableName.toUpperCase()}`,
    `${variableName.toUpperCase()}`
  ].filter(Boolean);
  
  // Parcourir les différents noms de variables possibles
  for (const envName of variableMappings) {
    const value = process.env[envName];
    if (value !== undefined) {
      return value;
    }
  }
  
  return undefined;
}

/**
 * Récupère toutes les variables d'environnement Notion disponibles
 */
export function getAllEnvironmentVariables(): NotionEnvironmentVariables {
  return {
    apiKey: getEnvironmentVariable('apiKey'),
    databaseProjects: getEnvironmentVariable('databaseProjects'),
    databaseChecklists: getEnvironmentVariable('databaseChecklists'),
    databaseExigences: getEnvironmentVariable('databaseExigences'),
    databaseAudits: getEnvironmentVariable('databaseAudits'),
    databaseEvaluations: getEnvironmentVariable('databaseEvaluations'),
    mockMode: getEnvironmentVariable('mockMode') === 'true',
    debug: getEnvironmentVariable('debug') === 'true'
  };
}

/**
 * Génère une configuration partielle basée sur les variables d'environnement
 */
export function generateConfigFromEnvironment(): Partial<NotionConfig> {
  const envVars = getAllEnvironmentVariables();
  
  const config: Partial<NotionConfig> = {};
  
  // Configurer l'API key si disponible
  if (envVars.apiKey) {
    config.apiKey = envVars.apiKey;
  }
  
  // Configurer les IDs de base de données si disponibles
  const databaseIds: Partial<NotionConfig['databaseIds']> = {};
  
  if (envVars.databaseProjects) databaseIds.projects = envVars.databaseProjects;
  if (envVars.databaseChecklists) databaseIds.checklists = envVars.databaseChecklists;
  if (envVars.databaseExigences) databaseIds.exigences = envVars.databaseExigences;
  if (envVars.databaseAudits) databaseIds.audits = envVars.databaseAudits;
  if (envVars.databaseEvaluations) databaseIds.evaluations = envVars.databaseEvaluations;
  
  // Ajouter les IDs de base de données à la configuration si au moins un est disponible
  if (Object.keys(databaseIds).length > 0) {
    config.databaseIds = databaseIds as NotionConfig['databaseIds'];
  }
  
  // Configurer le mode si disponible
  if (envVars.mockMode !== undefined) {
    config.mode = {
      demoMode: envVars.mockMode,
      autoFallback: true,
      persistentMode: true
    };
  }
  
  // Configurer le debug si disponible
  if (envVars.debug !== undefined) {
    config.client = {
      debug: envVars.debug,
      apiVersion: '2022-06-28'
    };
  }
  
  return config;
}

/**
 * Valide la configuration actuelle et signale les variables manquantes
 * Retourne la liste des variables requises manquantes
 */
export function validateEnvironmentConfig(): string[] {
  const envVars = getAllEnvironmentVariables();
  const missingVars: string[] = [];
  
  // Vérifier les variables requises
  if (!envVars.apiKey) {
    missingVars.push('API Key (NOTION_API_KEY)');
  }
  
  if (!envVars.databaseProjects) {
    missingVars.push('Database Projects (NOTION_DB_PROJECTS)');
  }
  
  return missingVars;
}

/**
 * Initialise la configuration à partir des variables d'environnement
 * Si des variables d'environnement sont disponibles, elles sont utilisées pour mettre à jour
 * la configuration stockée dans localStorage (sauf si overrideStored est false)
 */
export function initializeFromEnvironment(overrideStored: boolean = false): Partial<NotionConfig> {
  const envConfig = generateConfigFromEnvironment();
  
  // Si on doit remplacer les valeurs stockées ou si aucune valeur n'est stockée
  if (overrideStored) {
    return envConfig;
  }
  
  return envConfig;
}
