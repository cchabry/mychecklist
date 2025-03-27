
/**
 * Testeur de connexion Notion
 * 
 * Module responsable de tester la connexion à l'API Notion et
 * de vérifier l'accès aux bases de données configurées.
 */

import { NotionConfig, NotionResponse, ConnectionTestResult } from '../types';
import { notionHttpClient } from './notionHttpClient';
import { notionMockClient } from './notionMockClient';

/**
 * Teste la connexion à l'API Notion et l'accès aux bases de données configurées
 * 
 * @param config Configuration du client Notion
 * @param isMockMode Si le client est en mode mock
 * @returns Résultat du test de connexion
 */
export async function testConnection(
  config: NotionConfig, 
  isMockMode: boolean
): Promise<ConnectionTestResult> {
  // En mode mock, utiliser le mock client
  if (isMockMode) {
    return notionMockClient.testConnection();
  }
  
  // Vérifier que le client est configuré
  if (!config.apiKey) {
    return {
      success: false,
      error: 'Clé API Notion non configurée'
    };
  }
  
  try {
    // Tester l'API Notion en récupérant l'utilisateur
    const userResponse = await notionHttpClient.get<any>('/users/me');
    
    if (!userResponse.success) {
      return {
        success: false,
        error: userResponse.error?.message || 'Erreur lors de la connexion à Notion'
      };
    }
    
    // Tester l'accès à la base de données des projets
    let projectsDbName = '';
    if (config.projectsDbId) {
      const projectsDbResponse = await notionHttpClient.get<any>(`/databases/${config.projectsDbId}`);
      
      if (projectsDbResponse.success) {
        projectsDbName = projectsDbResponse.data?.title?.[0]?.plain_text || config.projectsDbId;
      } else {
        return {
          success: false,
          error: `Impossible d'accéder à la base de données des projets: ${projectsDbResponse.error?.message}`
        };
      }
    } else {
      return {
        success: false,
        error: 'ID de la base de données des projets non configuré'
      };
    }
    
    // Tester l'accès à la base de données des checklists si configurée
    let checklistsDbName = '';
    if (config.checklistsDbId) {
      const checklistsDbResponse = await notionHttpClient.get<any>(`/databases/${config.checklistsDbId}`);
      
      if (checklistsDbResponse.success) {
        checklistsDbName = checklistsDbResponse.data?.title?.[0]?.plain_text || config.checklistsDbId;
      }
    }
    
    // Retourner le résultat du test
    return {
      success: true,
      user: userResponse.data?.name || userResponse.data?.id,
      workspaceName: userResponse.data?.workspace_name || 'Workspace inconnu',
      projectsDbName,
      checklistsDbName: checklistsDbName || undefined
    };
  } catch (error) {
    // Retourner une erreur
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue lors du test de connexion'
    };
  }
}
