
/**
 * Initialisation de la configuration Notion
 */

import { getEnvironmentConfig, validateEnvironmentConfig } from './environment';
import { NotionConfig } from './types';
import { notionErrorService } from '../errorHandling';
import { structuredLogger } from '../logging/structuredLogger';
import { notionClientAdapter } from '../compatibility/notionClientAdapter';

/**
 * Initialise la configuration Notion à partir des variables d'environnement
 */
export function initializeConfiguration(): NotionConfig {
  // Récupérer la configuration à partir des variables d'environnement
  const envConfig = getEnvironmentConfig();
  
  // Valider la configuration
  const missingFields = validateEnvironmentConfig(envConfig);
  
  if (missingFields.length > 0) {
    structuredLogger.warn(
      'Configuration Notion incomplète', 
      { missingFields },
      { source: 'NotionConfig' }
    );
  }
  
  return envConfig;
}

/**
 * Configure le client Notion avec les paramètres donnés
 */
export function configureNotionClient(config: NotionConfig): void {
  try {
    // Vérifier si nous avons les informations minimales nécessaires
    if (!config.apiKey || !config.databaseIds?.projects) {
      structuredLogger.warn(
        'Configuration Notion insuffisante pour initialiser le client',
        { 
          hasApiKey: !!config.apiKey, 
          hasProjectsDb: !!config.databaseIds?.projects 
        },
        { source: 'NotionConfig' }
      );
      return;
    }
    
    // Configurer le client Notion via l'adaptateur
    notionClientAdapter.configure(
      config.apiKey,
      config.databaseIds.projects,
      config.databaseIds?.checklists
    );
    
    structuredLogger.info(
      'Client Notion configuré avec succès',
      { 
        hasChecklistDb: !!config.databaseIds?.checklists 
      },
      { source: 'NotionConfig' }
    );
  } catch (error) {
    // Capturer et signaler l'erreur
    notionErrorService.reportError(
      error,
      'Configuration du client Notion',
      { 
        type: 'config',
        severity: 'error'
      }
    );
    
    structuredLogger.error(
      'Erreur lors de la configuration du client Notion',
      error,
      { source: 'NotionConfig' }
    );
  }
}

/**
 * Tente de tester la connexion à l'API Notion
 */
export async function testNotionConnection(config: NotionConfig): Promise<boolean> {
  try {
    // Vérifier si nous avons les informations minimales nécessaires
    if (!config.apiKey || !config.databaseIds?.projects) {
      structuredLogger.warn(
        'Configuration Notion insuffisante pour tester la connexion',
        { 
          hasApiKey: !!config.apiKey, 
          hasProjectsDb: !!config.databaseIds?.projects 
        },
        { source: 'NotionConfig' }
      );
      return false;
    }
    
    // Tester la connexion via l'adaptateur
    const testResult = await notionClientAdapter.testConnection();
    
    if (testResult.success) {
      structuredLogger.info(
        'Test de connexion Notion réussi',
        { user: testResult.data?.user },
        { source: 'NotionConfig' }
      );
      return true;
    } else {
      structuredLogger.warn(
        'Test de connexion Notion échoué',
        { error: testResult.error },
        { source: 'NotionConfig' }
      );
      return false;
    }
  } catch (error) {
    // Capturer et signaler l'erreur
    notionErrorService.reportError(
      error,
      'Test de connexion Notion',
      { 
        type: 'network',
        severity: 'warning'
      }
    );
    
    structuredLogger.error(
      'Erreur lors du test de connexion Notion',
      error,
      { source: 'NotionConfig' }
    );
    
    return false;
  }
}

/**
 * Initialise complètement le client Notion
 */
export async function initializeNotionClient(): Promise<{
  config: NotionConfig;
  isConnected: boolean;
}> {
  // Initialiser la configuration
  const config = initializeConfiguration();
  
  // Configurer le client
  configureNotionClient(config);
  
  // Tester la connexion
  const isConnected = await testNotionConnection(config);
  
  return {
    config,
    isConnected
  };
}
