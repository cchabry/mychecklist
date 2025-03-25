
/**
 * Outils de diagnostic pour le client Notion
 * Permet de vérifier la configuration, la connexion et diverses fonctionnalités de l'API
 */

import { ApiResponse, RequestOptions } from '@/services/apiProxy';
import { notionService } from '../client';
import { getStoredConfig } from '../config';
import { notionClientAdapter } from '../compatibility/notionClientAdapter';

// Types pour les résultats de diagnostic
export type DiagnosticResult = {
  success: boolean;
  message: string;
  details?: any;
  error?: Error | string;
};

export type DiagnosticReport = {
  timestamp: number;
  environment: string;
  connection: DiagnosticResult;
  configuration: DiagnosticResult;
  proxy: DiagnosticResult;
  databases: {
    [key: string]: DiagnosticResult;
  };
  permissions: DiagnosticResult;
  operations: {
    read: DiagnosticResult;
    write?: DiagnosticResult;
  };
};

/**
 * Lance un diagnostic complet de l'intégration Notion
 */
export async function runCompleteDiagnostic(options?: RequestOptions): Promise<DiagnosticReport> {
  const config = getStoredConfig();
  const timestamp = Date.now();
  const environment = process.env.NODE_ENV || 'unknown';
  
  // Rapport initial
  const report: DiagnosticReport = {
    timestamp,
    environment,
    connection: { success: false, message: 'Non testé' },
    configuration: { success: false, message: 'Non testé' },
    proxy: { success: false, message: 'Non testé' },
    databases: {},
    permissions: { success: false, message: 'Non testé' },
    operations: {
      read: { success: false, message: 'Non testé' }
    }
  };
  
  // Vérifier la configuration
  report.configuration = await checkConfiguration();
  
  // Si la configuration n'est pas valide, ne pas aller plus loin
  if (!report.configuration.success) {
    return report;
  }
  
  // Vérifier la connexion
  try {
    report.connection = await checkConnection(options);
    
    // Si la connexion échoue, ne pas aller plus loin
    if (!report.connection.success) {
      return report;
    }
    
    // Vérifier l'accès aux bases de données
    report.databases = await checkDatabases(options);
    
    // Vérifier les permissions
    report.permissions = await checkPermissions(options);
    
    // Vérifier les opérations de lecture
    report.operations.read = await checkReadOperation(options);
    
    // Vérifier les opérations d'écriture si les tests précédents sont réussis
    if (report.operations.read.success) {
      report.operations.write = await checkWriteOperation(options);
    }
    
  } catch (error) {
    console.error('Erreur lors du diagnostic Notion:', error);
    report.connection = {
      success: false,
      message: 'Erreur inattendue lors du diagnostic',
      error
    };
  }
  
  return report;
}

/**
 * Vérifie la configuration Notion
 */
async function checkConfiguration(): Promise<DiagnosticResult> {
  const config = getStoredConfig();
  
  if (!config.apiKey) {
    return {
      success: false,
      message: 'Clé API manquante',
      details: { config: 'API key missing' }
    };
  }
  
  if (!config.databaseIds.projects) {
    return {
      success: false,
      message: 'ID de base de données des projets manquant',
      details: { config: 'Projects database ID missing' }
    };
  }
  
  return {
    success: true,
    message: 'Configuration valide',
    details: {
      apiKey: `${config.apiKey.substring(0, 5)}...`,
      hasProjectsDb: !!config.databaseIds.projects,
      hasChecklistsDb: !!config.databaseIds.checklists
    }
  };
}

/**
 * Vérifie la connexion à l'API Notion
 */
async function checkConnection(options?: RequestOptions): Promise<DiagnosticResult> {
  try {
    const response = await notionService.users.testConnection(undefined, options);
    
    if (!response.success) {
      return {
        success: false,
        message: `Échec de la connexion à l'API Notion`,
        details: response,
        error: response.error
      };
    }
    
    return {
      success: true,
      message: `Connexion réussie (${response.user || 'Utilisateur inconnu'})`,
      details: response
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erreur lors du test de connexion',
      error
    };
  }
}

/**
 * Vérifie l'accès aux bases de données configurées
 */
async function checkDatabases(options?: RequestOptions): Promise<{ [key: string]: DiagnosticResult }> {
  const config = getStoredConfig();
  const results: { [key: string]: DiagnosticResult } = {};
  
  // Fonction pour tester l'accès à une base de données
  const testDatabase = async (name: string, id: string | null): Promise<DiagnosticResult> => {
    if (!id) {
      return {
        success: false,
        message: `ID de base de données ${name} non configuré`,
        details: { id: null }
      };
    }
    
    try {
      const database = await notionService.databases.retrieve(id, options);
      
      return {
        success: true,
        message: `Accès réussi à la base de données ${name}`,
        details: {
          id,
          title: database.data?.title?.[0]?.plain_text || id
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Échec de l'accès à la base de données ${name}`,
        error,
        details: { id }
      };
    }
  };
  
  // Tester chaque base de données configurée
  results.projects = await testDatabase('projets', config.databaseIds.projects);
  
  if (config.databaseIds.checklists) {
    results.checklists = await testDatabase('checklists', config.databaseIds.checklists);
  }
  
  if (config.databaseIds.exigences) {
    results.exigences = await testDatabase('exigences', config.databaseIds.exigences);
  }
  
  return results;
}

/**
 * Vérifie les permissions sur les bases de données
 */
async function checkPermissions(options?: RequestOptions): Promise<DiagnosticResult> {
  // Pour l'instant, juste vérifier qu'on peut lister les utilisateurs (permissions basiques)
  try {
    const users = await notionService.users.list(options);
    
    return {
      success: true,
      message: 'Permissions suffisantes pour accéder aux utilisateurs',
      details: {
        userCount: users.data?.results?.length || 0
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erreur lors de la vérification des permissions',
      error
    };
  }
}

/**
 * Vérifie les opérations de lecture
 */
async function checkReadOperation(options?: RequestOptions): Promise<DiagnosticResult> {
  const config = getStoredConfig();
  
  if (!config.databaseIds.projects) {
    return {
      success: false,
      message: 'ID de base de données des projets requis pour le test de lecture',
      details: { id: null }
    };
  }
  
  try {
    const query = await notionService.databases.query(config.databaseIds.projects, {}, options);
    
    return {
      success: true,
      message: 'Opération de lecture réussie',
      details: {
        recordCount: query.data?.results?.length || 0
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Échec de l\'opération de lecture',
      error
    };
  }
}

/**
 * Vérifie les opérations d'écriture (création d'une page test)
 */
async function checkWriteOperation(options?: RequestOptions): Promise<DiagnosticResult> {
  const config = getStoredConfig();
  
  if (!config.databaseIds.projects) {
    return {
      success: false,
      message: 'ID de base de données des projets requis pour le test d\'écriture',
      details: { id: null }
    };
  }
  
  try {
    // Créer une page de test
    const testPage = {
      parent: { database_id: config.databaseIds.projects },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: `Test page ${new Date().toISOString()}`
              }
            }
          ]
        },
        Status: {
          select: {
            name: 'Test'
          }
        }
      }
    };
    
    const createdPage = await notionService.pages.create(testPage, options);
    
    // Si la création a réussi, essayer de supprimer la page
    if (createdPage.success && createdPage.data?.id) {
      try {
        await notionService.pages.update(
          createdPage.data.id,
          {
            archived: true
          },
          options
        );
        
        return {
          success: true,
          message: 'Opérations d\'écriture et de suppression réussies',
          details: {
            pageId: createdPage.data.id,
            archived: true
          }
        };
      } catch (archiveError) {
        return {
          success: true,
          message: 'Opération d\'écriture réussie, mais échec de la suppression',
          details: {
            pageId: createdPage.data.id,
            archived: false,
            archiveError
          }
        };
      }
    }
    
    return {
      success: true,
      message: 'Opération d\'écriture réussie',
      details: {
        pageId: createdPage.data?.id
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Échec de l\'opération d\'écriture',
      error
    };
  }
}

export const diagnosticService = {
  runComplete: runCompleteDiagnostic,
  checkConfiguration,
  checkConnection,
  checkDatabases,
  checkPermissions,
  checkReadOperation,
  checkWriteOperation
};

export default diagnosticService;
