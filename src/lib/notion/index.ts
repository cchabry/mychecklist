
// Exporte toutes les fonctions de l'API Notion

import { getNotionClient, testNotionConnection } from './notionClient';
import { getProjectsFromNotion, getProjectById, createProjectInNotion } from './projectsService';
import { getAuditForProject, saveAuditToNotion } from './auditService';
import { ProjectData } from './types';

// Configuration et initialisation
export function configureNotion(apiKey: string, databaseId: string, checklistsDbId?: string) {
  // Stocker les valeurs dans localStorage avec une persistance permanente
  try {
    localStorage.setItem('notion_api_key', apiKey);
    localStorage.setItem('notion_database_id', databaseId);
    
    if (checklistsDbId) {
      localStorage.setItem('notion_checklists_database_id', checklistsDbId);
    }
    
    // Stocker également la date de dernière configuration pour référence
    localStorage.setItem('notion_last_config_date', new Date().toISOString());
    
    console.log('✅ Configuration Notion sauvegardée de façon permanente');
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde de la configuration Notion:', error);
  }
  
  return {
    apiKey,
    databaseId,
    checklistsDbId
  };
}

export function isNotionConfigured(): boolean {
  const apiKey = localStorage.getItem('notion_api_key');
  const databaseId = localStorage.getItem('notion_database_id');
  return !!(apiKey && databaseId);
}

export function extractNotionDatabaseId(url: string): string {
  // Si l'entrée est vide, retourner une chaîne vide
  if (!url) return '';
  
  // Si c'est déjà juste l'ID, vérifier qu'il a un format valide et le retourner
  if (url.match(/^[a-zA-Z0-9]{32}$/)) {
    return url;
  }
  
  try {
    // Tenter d'extraire l'ID à partir d'une URL Notion
    if (url.includes('notion.so')) {
      // Format: https://www.notion.so/workspace/83d9d3a270ff4b0a95856a96db5a7e35?v=...
      // ou: https://www.notion.so/83d9d3a270ff4b0a95856a96db5a7e35?v=...
      const match = url.match(/([a-zA-Z0-9]{32})/);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // Deuxième tentative avec un autre format d'URL
    const secondMatch = url.match(/([a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12})/);
    if (secondMatch && secondMatch[1]) {
      // Convertir le format UUID en format sans tirets
      return secondMatch[1].replace(/-/g, '');
    }
  } catch (error) {
    console.error('Erreur lors de l\'extraction de l\'ID de la base de données:', error);
  }
  
  // Si on ne peut pas extraire l'ID, retourner l'entrée telle quelle
  return url;
}

// Nouvelle fonction pour récupérer les informations de configuration Notion
export function getNotionConfig() {
  return {
    apiKey: localStorage.getItem('notion_api_key') || '',
    databaseId: localStorage.getItem('notion_database_id') || '',
    checklistsDbId: localStorage.getItem('notion_checklists_database_id') || '',
    lastConfigDate: localStorage.getItem('notion_last_config_date') || null
  };
}

export {
  testNotionConnection,
  getProjectsFromNotion,
  getProjectById,
  createProjectInNotion,
  getAuditForProject,
  saveAuditToNotion
};

// Types
export type { ProjectData };
