
/**
 * Configuration basée sur les variables d'environnement
 */

import { NotionConfig } from './types';
import { structuredLogger } from '../logging/structuredLogger';

/**
 * Récupère la configuration à partir des variables d'environnement
 */
export function getEnvironmentConfig(): NotionConfig {
  // Obtenir la clé d'API et les identifiants de base de données depuis les variables d'environnement
  const apiKey = process.env.NOTION_API_KEY || localStorage.getItem('notion_api_key') || '';
  const projectsDbId = process.env.NOTION_PROJECTS_DB_ID || localStorage.getItem('notion_projects_db_id') || '';
  const checklistsDbId = process.env.NOTION_CHECKLISTS_DB_ID || localStorage.getItem('notion_checklists_db_id') || '';
  
  // Obtenir le mode d'opération
  const operationModeStr = process.env.NOTION_OPERATION_MODE || localStorage.getItem('notion_operation_mode') || 'auto';
  
  // Validation du mode d'opération
  let operationMode: 'real' | 'demo' | 'auto' = 'auto';
  if (operationModeStr === 'real' || operationModeStr === 'demo' || operationModeStr === 'auto') {
    operationMode = operationModeStr;
  } else {
    structuredLogger.warn(
      `Mode d'opération invalide: ${operationModeStr}, utilisation du mode 'auto'`,
      null,
      { source: 'NotionConfig' }
    );
  }
  
  // Configuration OAuth
  const oauthClientId = process.env.NOTION_OAUTH_CLIENT_ID || localStorage.getItem('notion_oauth_client_id') || '';
  const oauthClientSecret = process.env.NOTION_OAUTH_CLIENT_SECRET || localStorage.getItem('notion_oauth_client_secret') || '';
  const oauthRedirectUri = process.env.NOTION_OAUTH_REDIRECT_URI || localStorage.getItem('notion_oauth_redirect_uri') || '';
  
  return {
    apiKey: apiKey || undefined,
    databaseIds: {
      projects: projectsDbId,
      checklists: checklistsDbId || undefined
    },
    operationMode,
    oauth: oauthClientId ? {
      clientId: oauthClientId,
      clientSecret: oauthClientSecret || undefined,
      redirectUri: oauthRedirectUri
    } : undefined
  };
}

/**
 * Valide la configuration et retourne les champs manquants
 */
export function validateEnvironmentConfig(config: NotionConfig): string[] {
  const missingFields: string[] = [];
  
  // Vérifier la clé API
  if (!config.apiKey) {
    missingFields.push('apiKey');
  }
  
  // Vérifier l'ID de la base de données des projets
  if (!config.databaseIds?.projects) {
    missingFields.push('databaseIds.projects');
  }
  
  // Si OAuth est configuré, vérifier les champs requis
  if (config.oauth) {
    if (!config.oauth.clientId) {
      missingFields.push('oauth.clientId');
    }
    if (!config.oauth.redirectUri) {
      missingFields.push('oauth.redirectUri');
    }
  }
  
  return missingFields;
}
