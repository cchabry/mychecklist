
/**
 * Module de diagnostic pour l'API Notion
 * Permet de tester les différentes fonctionnalités de l'API
 */

import { structuredLogger } from '../logging/structuredLogger';
import { notionErrorService } from '../errorHandling/errorService';
import { notionClientAdapter } from '../compatibility/notionClientAdapter';

/**
 * Résultat d'un test de diagnostic
 */
export interface DiagnosticTestResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
  details?: any;
}

/**
 * Résultat complet du diagnostic
 */
export interface DiagnosticReport {
  timestamp: number;
  success: boolean;
  connectionTest: DiagnosticTestResult;
  apiTests: DiagnosticTestResult[];
  summary: {
    passedTests: number;
    totalTests: number;
    averageResponseTime: number;
  };
}

/**
 * Options pour exécuter le diagnostic
 */
export interface DiagnosticOptions {
  apiKey?: string;
  databaseId?: string;
  checklistsDbId?: string;
  timeout?: number;
  runAllTests?: boolean;
}

/**
 * Exécute un test avec mesure de durée et gestion d'erreur
 */
async function runTest(
  name: string,
  testFn: () => Promise<any>
): Promise<DiagnosticTestResult> {
  const startTime = Date.now();
  
  try {
    const result = await Promise.race([
      testFn(),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Délai d\'attente dépassé')), 15000);
      })
    ]);
    
    const duration = Date.now() - startTime;
    
    return {
      name,
      success: true,
      duration,
      details: result
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Signaler l'erreur au service d'erreur
    notionErrorService.reportError(error, `Diagnostic: ${name}`);
    
    return {
      name,
      success: false,
      duration,
      error: error.message
    };
  }
}

/**
 * Teste l'authentification à l'API Notion (users.me)
 */
async function testAuthentication(token?: string): Promise<DiagnosticTestResult> {
  return runTest('Test d\'authentification', async () => {
    // Vérifier si la méthode existe sur l'API
    if (typeof (notionClientAdapter as any).users?.me === 'function') {
      // Utiliser la méthode d'origine
      const result = await (notionClientAdapter as any).users.me(token);
      return { 
        user: result?.name || result?.data?.user || 'Utilisateur inconnu' 
      };
    } else {
      // Utiliser la méthode de test de connexion
      const result = await notionClientAdapter.testConnection();
      return { 
        user: result?.data?.user || 'Utilisateur inconnu' 
      };
    }
  });
}

/**
 * Teste la lecture d'une base de données
 */
async function testDatabaseRetrieve(databaseId: string, token?: string): Promise<DiagnosticTestResult> {
  return runTest('Récupération de base de données', async () => {
    // Vérifier si la méthode existe sur l'API
    if (typeof (notionClientAdapter as any).databases?.retrieve === 'function') {
      // Utiliser la méthode d'origine
      const result = await (notionClientAdapter as any).databases.retrieve(databaseId, token);
      return { 
        title: result?.title?.[0]?.plain_text || databaseId,
        properties: Object.keys(result?.properties || {}).length
      };
    } else {
      throw new Error('Méthode databases.retrieve non disponible');
    }
  });
}

/**
 * Teste la requête sur une base de données
 */
async function testDatabaseQuery(databaseId: string, token?: string): Promise<DiagnosticTestResult> {
  return runTest('Requête de base de données', async () => {
    // Vérifier si la méthode existe sur l'API
    if (typeof (notionClientAdapter as any).databases?.query === 'function') {
      // Utiliser la méthode d'origine
      const result = await (notionClientAdapter as any).databases.query(databaseId, {
        page_size: 1
      }, token);
      
      return { 
        total: result?.results?.length || 0, 
        hasMore: !!result?.has_more
      };
    } else {
      throw new Error('Méthode databases.query non disponible');
    }
  });
}

/**
 * Teste la récupération d'une page
 */
async function testPageRetrieve(databaseId: string, token?: string): Promise<DiagnosticTestResult> {
  return runTest('Récupération de page', async () => {
    // D'abord obtenir l'ID d'une page via une requête
    let pageId: string;
    
    // Vérifier si les méthodes existent sur l'API
    if (typeof (notionClientAdapter as any).pages?.retrieve === 'function' && 
        typeof (notionClientAdapter as any).databases?.query === 'function') {
      
      // Obtenir la première page de la base de données
      const queryResult = await (notionClientAdapter as any).databases.query(databaseId, {
        page_size: 1
      }, token);
      
      if (!queryResult?.results?.[0]?.id) {
        throw new Error('Aucune page trouvée dans la base de données');
      }
      
      pageId = queryResult.results[0].id;
      
      // Récupérer la page
      const page = await (notionClientAdapter as any).pages.retrieve(pageId, token);
      
      return { 
        pageId,
        properties: Object.keys(page?.properties || {}).length
      };
    } else {
      throw new Error('Méthodes pages.retrieve ou databases.query non disponibles');
    }
  });
}

/**
 * Exécute un diagnostic complet de l'API Notion
 */
export async function runNotionDiagnostic(options: DiagnosticOptions = {}): Promise<DiagnosticReport> {
  const {
    apiKey,
    databaseId,
    runAllTests = true
  } = options;
  
  // Si une API key est fournie, configurer l'adaptateur
  if (apiKey && databaseId) {
    notionClientAdapter.configure(apiKey, databaseId);
  }
  
  // Test de connexion
  const connectionTest = await testAuthentication(apiKey);
  
  // Si le test de connexion échoue, ne pas continuer
  if (!connectionTest.success && !runAllTests) {
    return {
      timestamp: Date.now(),
      success: false,
      connectionTest,
      apiTests: [],
      summary: {
        passedTests: 0,
        totalTests: 1,
        averageResponseTime: connectionTest.duration
      }
    };
  }
  
  const apiTests: DiagnosticTestResult[] = [];
  
  // Tests de l'API (seulement si l'ID de base de données est disponible)
  if (databaseId) {
    // Test de récupération de la base de données
    const dbRetrieveTest = await testDatabaseRetrieve(databaseId, apiKey);
    apiTests.push(dbRetrieveTest);
    
    // Test de requête sur la base de données
    const dbQueryTest = await testDatabaseQuery(databaseId, apiKey);
    apiTests.push(dbQueryTest);
    
    // Test de récupération de page (si le test de requête a réussi)
    if (dbQueryTest.success || runAllTests) {
      const pageTest = await testPageRetrieve(databaseId, apiKey);
      apiTests.push(pageTest);
    }
  }
  
  // Calculer les statistiques
  const allTests = [connectionTest, ...apiTests];
  const passedTests = allTests.filter(test => test.success).length;
  const totalDuration = allTests.reduce((sum, test) => sum + test.duration, 0);
  const averageResponseTime = totalDuration / allTests.length;
  
  // Journaliser le résultat
  structuredLogger.info(
    'Diagnostic Notion terminé', 
    {
      success: passedTests === allTests.length,
      passedTests,
      totalTests: allTests.length,
      averageResponseTime
    },
    { source: 'NotionDiagnostic' }
  );
  
  // Retourner le rapport complet
  return {
    timestamp: Date.now(),
    success: passedTests === allTests.length,
    connectionTest,
    apiTests,
    summary: {
      passedTests,
      totalTests: allTests.length,
      averageResponseTime
    }
  };
}

/**
 * Vérifie si la connexion à Notion est fonctionnelle et retourne le résultat
 */
export async function checkNotionConnection(apiKey?: string): Promise<{
  success: boolean;
  user?: string;
  error?: string;
}> {
  try {
    const result = await testAuthentication(apiKey);
    
    if (result.success && result.details?.user) {
      return {
        success: true,
        user: result.details.user
      };
    } else {
      return {
        success: false,
        error: result.error || 'Échec de connexion à Notion'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
