
/**
 * Testeur de connexion Notion
 * 
 * Ce module fournit des fonctionnalités pour tester la connexion avec l'API Notion
 * et récupérer des informations sur la connexion actuelle.
 */

import { notionHttpClient } from './notionHttpClient';
import { notionMockClient } from './mock/notionMockClient';
import { NotionConfig, ConnectionTestResult } from '../base/types';

/**
 * Teste la connexion à l'API Notion
 * 
 * @param config Configuration Notion à utiliser pour le test
 * @param mockMode Indique si le test doit être effectué en mode mock
 * @returns Résultat du test de connexion
 */
export async function testConnection(
  config: NotionConfig,
  mockMode: boolean = false
): Promise<ConnectionTestResult> {
  // En mode mock, utiliser le client mock pour simuler un test de connexion
  if (mockMode) {
    return notionMockClient.testConnection();
  }
  
  // S'assurer que la configuration contient au moins une clé API
  if (!config.apiKey) {
    return {
      success: false,
      error: 'Clé API Notion non configurée'
    };
  }
  
  try {
    // Récupérer les informations sur l'utilisateur actuel
    const userResponse = await notionHttpClient.get<{
      name?: string;
      person?: { email?: string };
      bot?: { workspace_name?: string };
    }>('/users/me');
    
    if (!userResponse.success) {
      return {
        success: false,
        error: userResponse.error?.message || 'Erreur lors de la récupération des informations utilisateur'
      };
    }
    
    // Typer explicitement les données de l'utilisateur
    const userData = userResponse.data;
    if (!userData) {
      return {
        success: false,
        error: 'Données utilisateur invalides'
      };
    }
    
    // Déterminer le nom d'utilisateur et l'espace de travail
    const userName = userData.name || (userData.person?.email) || 'Utilisateur inconnu';
    const workspace = userData.bot?.workspace_name || '';
    
    // Si des IDs de base de données sont fournis, essayer de récupérer leur nom
    let projectsDbName = '';
    let checklistsDbName = '';
    
    if (config.projectsDbId) {
      const projectsDbResponse = await notionHttpClient.get<{
        title?: Array<{ plain_text?: string }>;
      }>(`/databases/${config.projectsDbId}`);
      
      if (projectsDbResponse.success && projectsDbResponse.data) {
        projectsDbName = projectsDbResponse.data.title?.[0]?.plain_text || 'Base de données projets';
      }
    }
    
    if (config.checklistDbId) {
      const checklistsDbResponse = await notionHttpClient.get<{
        title?: Array<{ plain_text?: string }>;
      }>(`/databases/${config.checklistDbId}`);
      
      if (checklistsDbResponse.success && checklistsDbResponse.data) {
        checklistsDbName = checklistsDbResponse.data.title?.[0]?.plain_text || 'Base de données checklist';
      }
    }
    
    // Retourner le résultat du test réussi
    return {
      success: true,
      user: userName,
      workspaceName: workspace,
      projectsDbName,
      checklistsDbName
    };
  } catch (error) {
    // Gérer les erreurs réseau ou les exceptions
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Erreur inconnue lors du test de connexion';
    
    return {
      success: false,
      error: errorMessage,
      details: error
    };
  }
}
