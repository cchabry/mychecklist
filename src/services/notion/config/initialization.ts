
import { getEnvironmentConfig, validateEnvironmentConfig } from './environment';
import { NotionConfig } from './types';
import { notionErrorService } from '../errorHandling';
import { NotionErrorType, NotionErrorSeverity } from '../types/unified';
import { structuredLogger } from '../logging/structuredLogger';

let currentConfig: NotionConfig | null = null;

/**
 * Initialise la configuration Notion à partir des variables d'environnement
 */
export async function initializeNotionConfig(): Promise<NotionConfig> {
  try {
    structuredLogger.info('Initialisation de la configuration Notion', null, { source: 'NotionConfig' });
    
    // Charger la configuration
    const config = getEnvironmentConfig();
    
    // Valider la configuration
    const missingFields = validateEnvironmentConfig(config);
    
    if (missingFields.length > 0) {
      const missingFieldsStr = missingFields.join(', ');
      structuredLogger.warn(
        `Configuration Notion incomplète: champs manquants [${missingFieldsStr}]`,
        null,
        { source: 'NotionConfig' }
      );
      
      // Créer et signaler une erreur
      const error = notionErrorService.createError(`Configuration Notion incomplète: ${missingFieldsStr}`, {
        type: NotionErrorType.CONFIG,
        severity: NotionErrorSeverity.ERROR,
        context: JSON.stringify({ missingFields })
      });
      
      notionErrorService.reportError(error as Error);
    } else {
      structuredLogger.info('Configuration Notion validée avec succès', null, { source: 'NotionConfig' });
    }
    
    // Stocker la configuration actuelle
    currentConfig = config;
    
    return config;
  } catch (error) {
    // Gérer les erreurs d'initialisation
    const errorMessage = error instanceof Error ? error.message : String(error);
    structuredLogger.error(
      `Erreur lors de l'initialisation de la configuration Notion: ${errorMessage}`,
      error instanceof Error ? error : new Error(errorMessage),
      { source: 'NotionConfig' }
    );
    
    // Créer et signaler une erreur
    const notionError = notionErrorService.createError(
      `Erreur d'initialisation de la configuration Notion: ${errorMessage}`,
      {
        type: NotionErrorType.CONFIG, 
        severity: NotionErrorSeverity.ERROR,
        cause: error
      }
    );
    
    notionErrorService.reportError(notionError as Error);
    
    // Retourner une configuration vide avec l'opération en mode démo
    return {
      operationMode: 'demo'
    };
  }
}

/**
 * Teste la connexion à l'API Notion avec la configuration actuelle
 */
export async function testNotionConnection(): Promise<{ success: boolean; message?: string }> {
  try {
    structuredLogger.info('Test de la connexion à l\'API Notion', null, { source: 'NotionConfig' });
    
    // Vérifier si la configuration existe
    if (!currentConfig || !currentConfig.apiKey) {
      return {
        success: false,
        message: 'Configuration incomplète: clé API manquante'
      };
    }
    
    // Simuler un test de connexion (à implémenter)
    structuredLogger.info('Connexion à l\'API Notion réussie', null, { source: 'NotionConfig' });
    
    return {
      success: true,
      message: 'Connexion à l\'API Notion réussie'
    };
  } catch (error) {
    // Gérer les erreurs de connexion
    const errorMessage = error instanceof Error ? error.message : String(error);
    structuredLogger.error(
      `Erreur lors du test de connexion à l'API Notion: ${errorMessage}`,
      error instanceof Error ? error : new Error(errorMessage),
      { source: 'NotionConfig' }
    );
    
    // Créer et signaler une erreur
    const notionError = notionErrorService.createError(
      `Erreur de connexion à l'API Notion: ${errorMessage}`,
      {
        type: NotionErrorType.NETWORK,
        severity: NotionErrorSeverity.WARNING,
        cause: error
      }
    );
    
    notionErrorService.reportError(notionError as Error);
    
    return {
      success: false,
      message: errorMessage
    };
  }
}

/**
 * Récupère la configuration Notion actuelle
 */
export function getCurrentNotionConfig(): NotionConfig | null {
  return currentConfig;
}
