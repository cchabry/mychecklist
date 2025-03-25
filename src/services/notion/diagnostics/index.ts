
/**
 * Outils de diagnostic pour le service Notion
 * Permettent de tester et d'analyser la connexion et les configurations
 */

import { notionService } from '../client';
import { currentConfig, isConfigValid } from '../config';

// Type pour les résultats de diagnostic
export interface DiagnosticResult {
  name: string;
  success: boolean;
  message: string;
  details?: any;
  timestamp: number;
}

// Type pour les résultats groupés
export interface DiagnosticReport {
  success: boolean;
  results: DiagnosticResult[];
  timestamp: number;
  summary: string;
}

/**
 * Test de configuration de base
 */
export async function testConfiguration(): Promise<DiagnosticResult> {
  try {
    const config = currentConfig;
    const valid = isConfigValid(config);
    
    return {
      name: 'Configuration Notion',
      success: valid,
      message: valid 
        ? 'Configuration Notion valide' 
        : 'Configuration Notion incomplète ou invalide',
      details: {
        hasApiKey: !!config.apiKey,
        hasProjectsDb: !!config.databaseIds.projects,
        hasChecklistsDb: !!config.databaseIds.checklists
      },
      timestamp: Date.now()
    };
  } catch (error) {
    return {
      name: 'Configuration Notion',
      success: false,
      message: 'Erreur lors de la vérification de la configuration',
      details: error,
      timestamp: Date.now()
    };
  }
}

/**
 * Test de connexion à l'API Notion
 */
export async function testConnectivity(): Promise<DiagnosticResult> {
  try {
    const result = await notionService.client.testConnection();
    
    return {
      name: 'Connexion API Notion',
      success: result.success,
      message: result.success 
        ? `Connexion réussie (${result.user})` 
        : `Échec de connexion: ${result.error}`,
      details: result,
      timestamp: Date.now()
    };
  } catch (error) {
    return {
      name: 'Connexion API Notion',
      success: false,
      message: 'Erreur lors du test de connexion',
      details: error,
      timestamp: Date.now()
    };
  }
}

/**
 * Test d'accès aux bases de données
 */
export async function testDatabasesAccess(): Promise<DiagnosticResult> {
  try {
    const config = currentConfig;
    
    // Vérifier l'accès à la base de données des projets
    const hasProjectsDb = !!config.databaseIds.projects;
    let projectsDbAccess = false;
    let projectsDbError = null;
    
    if (hasProjectsDb) {
      try {
        const response = await notionService.client.getDatabase(config.databaseIds.projects!);
        projectsDbAccess = response.success;
      } catch (error) {
        projectsDbError = error;
      }
    }
    
    // Vérifier l'accès à la base de données des checklists si configurée
    const hasChecklistsDb = !!config.databaseIds.checklists;
    let checklistsDbAccess = false;
    let checklistsDbError = null;
    
    if (hasChecklistsDb) {
      try {
        const response = await notionService.client.getDatabase(config.databaseIds.checklists!);
        checklistsDbAccess = response.success;
      } catch (error) {
        checklistsDbError = error;
      }
    }
    
    // Déterminer le succès global du test
    const success = hasProjectsDb ? projectsDbAccess : false;
    
    return {
      name: 'Accès bases de données',
      success,
      message: success 
        ? 'Accès aux bases de données confirmé' 
        : 'Problème d\'accès à une ou plusieurs bases de données',
      details: {
        projects: {
          configured: hasProjectsDb,
          access: projectsDbAccess,
          error: projectsDbError
        },
        checklists: {
          configured: hasChecklistsDb,
          access: checklistsDbAccess,
          error: checklistsDbError
        }
      },
      timestamp: Date.now()
    };
  } catch (error) {
    return {
      name: 'Accès bases de données',
      success: false,
      message: 'Erreur lors du test d\'accès aux bases de données',
      details: error,
      timestamp: Date.now()
    };
  }
}

/**
 * Exécute tous les tests de diagnostic disponibles
 */
export async function runFullDiagnostic(): Promise<DiagnosticReport> {
  const results: DiagnosticResult[] = [];
  
  // Test de configuration
  results.push(await testConfiguration());
  
  // Test de connectivité
  results.push(await testConnectivity());
  
  // Test d'accès aux bases de données
  results.push(await testDatabasesAccess());
  
  // Déterminer le succès global
  const success = results.every(result => result.success);
  
  // Générer un résumé
  const summary = success 
    ? 'Tous les tests de diagnostic ont réussi' 
    : `${results.filter(r => !r.success).length} test(s) ont échoué`;
  
  return {
    success,
    results,
    timestamp: Date.now(),
    summary
  };
}

// Objet exporté pour l'utilisation directe
export const diagnostics = {
  testConfiguration,
  testConnectivity,
  testDatabasesAccess,
  runFullDiagnostic
};

// Export par défaut
export default diagnostics;
