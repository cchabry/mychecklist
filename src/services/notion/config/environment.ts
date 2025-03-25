
/**
 * Gestion des variables d'environnement et de la configuration pour l'API Notion
 */

import { NotionConfig } from './types';

/**
 * Extrait les variables d'environnement pertinentes pour Notion
 */
export function getEnvironmentConfig(): Partial<NotionConfig> {
  const config: Partial<NotionConfig> = {};
  
  // Environnement de production
  if (typeof process !== 'undefined' && process.env) {
    // API Key
    if (process.env.NOTION_API_KEY) {
      config.apiKey = process.env.NOTION_API_KEY;
    }
    
    // Mode de fonctionnement
    if (process.env.NOTION_OPERATION_MODE) {
      // Utiliser une propriété optionnelle
      config.operationMode = process.env.NOTION_OPERATION_MODE;
    }
    
    // Informations du client OAuth
    if (process.env.NOTION_CLIENT_ID) {
      // Utiliser une propriété optionnelle
      config.oauth = {
        clientId: process.env.NOTION_CLIENT_ID,
        clientSecret: process.env.NOTION_CLIENT_SECRET,
        redirectUri: process.env.NOTION_REDIRECT_URI
      };
    }
    
    // IDs de base de données
    const databaseIds: Record<string, string | null> = {};
    
    if (process.env.NOTION_DATABASE_ID) {
      databaseIds.projects = process.env.NOTION_DATABASE_ID;
    }
    
    if (process.env.NOTION_CHECKLISTS_DATABASE_ID) {
      databaseIds.checklists = process.env.NOTION_CHECKLISTS_DATABASE_ID;
    }
    
    if (Object.keys(databaseIds).length > 0) {
      config.databaseIds = databaseIds as any;
    }
  }
  
  // Variables d'environnement côté navigateur
  if (typeof window !== 'undefined') {
    const envVars = [
      'VITE_NOTION_API_KEY',
      'VITE_NOTION_DATABASE_ID',
      'VITE_NOTION_CHECKLISTS_DATABASE_ID',
      'VITE_NOTION_OPERATION_MODE',
      'VITE_NOTION_CLIENT_ID',
      'VITE_NOTION_REDIRECT_URI'
    ];
    
    for (const varName of envVars) {
      const value = (window as any)[varName] || import.meta.env?.[varName];
      
      if (value) {
        switch (varName) {
          case 'VITE_NOTION_API_KEY':
            config.apiKey = value;
            break;
          case 'VITE_NOTION_DATABASE_ID':
            if (!config.databaseIds) config.databaseIds = {} as any;
            config.databaseIds.projects = value;
            break;
          case 'VITE_NOTION_CHECKLISTS_DATABASE_ID':
            if (!config.databaseIds) config.databaseIds = {} as any;
            config.databaseIds.checklists = value;
            break;
          case 'VITE_NOTION_OPERATION_MODE':
            // Utiliser une propriété optionnelle
            config.operationMode = value;
            break;
          case 'VITE_NOTION_CLIENT_ID':
            if (!config.oauth) config.oauth = {} as any;
            config.oauth.clientId = value;
            break;
          case 'VITE_NOTION_REDIRECT_URI':
            if (!config.oauth) config.oauth = {} as any;
            config.oauth.redirectUri = value;
            break;
        }
      }
    }
  }
  
  return config;
}

/**
 * Valide la configuration environment et renvoie les champs manquants
 */
export function validateEnvironmentConfig(config: Partial<NotionConfig>): string[] {
  const missingFields: string[] = [];
  
  // Vérifier les champs obligatoires
  if (!config.apiKey) {
    missingFields.push('NOTION_API_KEY ou VITE_NOTION_API_KEY');
  }
  
  // Vérifier les bases de données
  if (!config.databaseIds?.projects) {
    missingFields.push('NOTION_DATABASE_ID ou VITE_NOTION_DATABASE_ID');
  }
  
  // Vérifier la configuration OAuth si clientId est fourni
  if (config.oauth?.clientId) {
    if (!config.oauth.redirectUri) {
      missingFields.push('NOTION_REDIRECT_URI ou VITE_NOTION_REDIRECT_URI');
    }
  }
  
  return missingFields;
}
