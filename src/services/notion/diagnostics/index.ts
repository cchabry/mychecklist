
/**
 * Module de diagnostic pour l'API Notion
 * Fournit des outils pour tester et valider la configuration
 */

import { notionService } from '../client';

/**
 * Types pour les fonctions de diagnostic
 */
export interface DiagnosticResult {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

export interface DiagnosticReport {
  timestamp: string;
  environment: string;
  configuration: {
    apiKeyPresent: boolean;
    databaseIdsConfigured: string[];
    oauthConfigured: boolean;
  };
  connectivity: {
    internetConnection: DiagnosticResult;
    corsProxyConnection?: DiagnosticResult;
    notionApiConnection?: DiagnosticResult;
  };
  apiTests: {
    users?: DiagnosticResult;
    databases?: DiagnosticResult;
    createPage?: DiagnosticResult;
    search?: DiagnosticResult;
  };
  recommendations: string[];
}

/**
 * Adapte le service Notion aux tests de diagnostic
 */
const adaptedService = {
  ...notionService,
  
  // Fonctions de l'API utilisateurs
  users: {
    me: async (): Promise<any> => {
      try {
        if (notionService.users && typeof (notionService.users as any).me === 'function') {
          return await (notionService.users as any).me();
        }
        throw new Error('Méthode users.me non disponible');
      } catch (error) {
        return { 
          success: false, 
          error: { message: error instanceof Error ? error.message : String(error) } 
        };
      }
    },
    
    list: async (): Promise<any> => {
      try {
        if (notionService.users && typeof (notionService.users as any).list === 'function') {
          return await (notionService.users as any).list();
        }
        throw new Error('Méthode users.list non disponible');
      } catch (error) {
        return { 
          success: false, 
          error: { message: error instanceof Error ? error.message : String(error) } 
        };
      }
    }
  },
  
  // Fonctions de l'API bases de données
  databases: {
    retrieve: async (databaseId: string): Promise<any> => {
      try {
        if (notionService.databases && typeof (notionService.databases as any).retrieve === 'function') {
          return await (notionService.databases as any).retrieve(databaseId);
        }
        throw new Error('Méthode databases.retrieve non disponible');
      } catch (error) {
        return { 
          success: false, 
          error: { message: error instanceof Error ? error.message : String(error) } 
        };
      }
    },
    
    query: async (databaseId: string, query = {}): Promise<any> => {
      try {
        if (notionService.databases && typeof (notionService.databases as any).query === 'function') {
          return await (notionService.databases as any).query(databaseId, query);
        }
        throw new Error('Méthode databases.query non disponible');
      } catch (error) {
        return { 
          success: false, 
          error: { message: error instanceof Error ? error.message : String(error) } 
        };
      }
    }
  },
  
  // Fonctions de l'API pages
  pages: {
    create: async (data: any): Promise<any> => {
      try {
        if (notionService.pages && typeof (notionService.pages as any).create === 'function') {
          return await (notionService.pages as any).create(data);
        }
        throw new Error('Méthode pages.create non disponible');
      } catch (error) {
        return { 
          success: false, 
          error: { message: error instanceof Error ? error.message : String(error) } 
        };
      }
    }
  }
};

/**
 * Vérifie la connexion internet
 */
export async function testInternetConnection(): Promise<DiagnosticResult> {
  try {
    const startTime = Date.now();
    const response = await fetch('https://www.google.com/generate_204', { 
      method: 'HEAD',
      cache: 'no-store'
    });
    const endTime = Date.now();
    
    return {
      success: response.ok,
      message: `Connexion Internet active (latence: ${endTime - startTime}ms)`,
      data: { latency: endTime - startTime }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Échec de la connexion Internet',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Teste l'authentification Notion
 */
export async function testAuthentication(): Promise<DiagnosticResult> {
  try {
    // Utiliser la fonction adaptée si disponible
    if (adaptedService.users && typeof adaptedService.users.me === 'function') {
      const response = await adaptedService.users.me();
      
      if (response.success && response.data) {
        return {
          success: true,
          message: `Authentification réussie avec l'utilisateur: ${response.data.name || response.data.id}`,
          data: response.data
        };
      }
      
      return {
        success: false,
        message: 'Échec de l\'authentification',
        error: response.error || 'Réponse invalide de l\'API'
      };
    }
    
    // Fallback sur la méthode de test de connexion
    const testResult = await notionService.testConnection();
    
    if (testResult.success) {
      return {
        success: true,
        message: `Authentification réussie avec l'utilisateur: ${testResult.user || 'Inconnu'}`,
        data: { user: testResult.user }
      };
    }
    
    return {
      success: false,
      message: 'Échec de l\'authentification',
      error: testResult.error || 'Réponse invalide de l\'API'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erreur lors du test d\'authentification',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Teste l'accès à une base de données Notion
 */
export async function testDatabaseAccess(databaseId: string): Promise<DiagnosticResult> {
  if (!databaseId) {
    return {
      success: false,
      message: 'Aucun ID de base de données fourni',
      error: 'MISSING_DATABASE_ID'
    };
  }
  
  try {
    // Utiliser la fonction adaptée si disponible
    if (adaptedService.databases && typeof adaptedService.databases.retrieve === 'function') {
      const response = await adaptedService.databases.retrieve(databaseId);
      
      if (response.success && response.data) {
        const dbName = response.data.title?.[0]?.plain_text || databaseId;
        
        return {
          success: true,
          message: `Accès réussi à la base de données: ${dbName}`,
          data: response.data
        };
      }
      
      return {
        success: false,
        message: 'Échec de l\'accès à la base de données',
        error: response.error || 'Réponse invalide de l\'API'
      };
    }
    
    // Fallback sur la méthode de test de connexion
    const testResult = await notionService.testConnection();
    
    if (testResult.success) {
      return {
        success: true,
        message: `Connexion à Notion réussie, mais test de base de données non disponible`,
        data: { warning: 'Test limité' }
      };
    }
    
    return {
      success: false,
      message: 'Échec de l\'accès à Notion',
      error: testResult.error || 'Réponse invalide de l\'API'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erreur lors du test d\'accès à la base de données',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Teste la création d'une page
 */
export async function testPageCreation(databaseId: string): Promise<DiagnosticResult> {
  if (!databaseId) {
    return {
      success: false,
      message: 'Aucun ID de base de données fourni',
      error: 'MISSING_DATABASE_ID'
    };
  }
  
  try {
    // Utiliser la fonction adaptée si disponible
    if (adaptedService.pages && typeof adaptedService.pages.create === 'function') {
      const testData = {
        parent: { database_id: databaseId },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: `Test Diagnostic ${new Date().toISOString()}`
                }
              }
            ]
          },
          Status: {
            select: {
              name: "Test"
            }
          },
          // D'autres propriétés peuvent être ajoutées en fonction de la structure de la base de données
        }
      };
      
      const response = await adaptedService.pages.create(testData);
      
      if (response.success && response.data) {
        return {
          success: true,
          message: `Page de test créée avec succès`,
          data: {
            pageId: response.data.id,
            url: response.data.url
          }
        };
      }
      
      return {
        success: false,
        message: 'Échec de la création de page',
        error: response.error || 'Réponse invalide de l\'API'
      };
    }
    
    return {
      success: false,
      message: 'Création de page non disponible dans cette version',
      error: 'FUNCTION_NOT_AVAILABLE'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erreur lors de la création de la page de test',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Génère un rapport de diagnostic complet
 */
export async function generateDiagnosticReport(): Promise<DiagnosticReport> {
  const report: DiagnosticReport = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    configuration: {
      apiKeyPresent: notionService.isConfigured(),
      databaseIdsConfigured: [],
      oauthConfigured: false
    },
    connectivity: {
      internetConnection: await testInternetConnection()
    },
    apiTests: {},
    recommendations: []
  };
  
  // Tester la connexion Notion uniquement si la connexion Internet fonctionne
  if (report.connectivity.internetConnection.success) {
    // Test d'authentification
    const authTest = await testAuthentication();
    report.connectivity.notionApiConnection = authTest;
    
    // Ajouter des tests API uniquement si l'authentification réussit
    if (authTest.success) {
      // Test utilisateur
      report.apiTests.users = authTest;
      
      // Test base de données
      // TODO: Récupérer les IDs de base de données configurés
      const databaseIds: string[] = []; // À remplir avec la config réelle
      
      // Tester chaque base de données configurée
      if (databaseIds.length > 0) {
        const dbTestResults = await Promise.all(
          databaseIds.map(id => testDatabaseAccess(id))
        );
        
        report.apiTests.databases = dbTestResults.find(result => result.success) || dbTestResults[0];
        
        // Si au moins une base de données fonctionne, tester la création de page
        if (report.apiTests.databases.success) {
          const successfulDb = databaseIds[
            dbTestResults.findIndex(result => result.success)
          ];
          
          report.apiTests.createPage = await testPageCreation(successfulDb);
        }
      }
    }
  }
  
  // Générer des recommandations
  report.recommendations = generateRecommendations(report);
  
  return report;
}

/**
 * Génère des recommandations en fonction du rapport
 */
function generateRecommendations(report: DiagnosticReport): string[] {
  const recommendations: string[] = [];
  
  // Vérifier la connexion Internet
  if (!report.connectivity.internetConnection.success) {
    recommendations.push(
      'Vérifiez votre connexion Internet, car elle semble être hors ligne ou instable.'
    );
  }
  
  // Vérifier l'authentification à l'API Notion
  if (!report.connectivity.notionApiConnection?.success) {
    recommendations.push(
      'Vérifiez votre clé d\'API Notion, car l\'authentification a échoué.'
    );
  }
  
  // Vérifier l'accès aux bases de données
  if (report.apiTests.databases && !report.apiTests.databases.success) {
    recommendations.push(
      'Vérifiez les identifiants de base de données et les permissions associées.'
    );
  }
  
  // Vérifier la création de page
  if (report.apiTests.createPage && !report.apiTests.createPage.success) {
    recommendations.push(
      'Vérifiez les permissions d\'édition sur la base de données.'
    );
  }
  
  // Recommandations générales
  if (recommendations.length === 0 && report.connectivity.notionApiConnection?.success) {
    recommendations.push(
      'Tout semble fonctionner correctement. Aucune action n\'est requise.'
    );
  }
  
  return recommendations;
}

// Exporter les diagnostics
export const notionDiagnostics = {
  testInternetConnection,
  testAuthentication,
  testDatabaseAccess,
  testPageCreation,
  generateDiagnosticReport
};

export default notionDiagnostics;
