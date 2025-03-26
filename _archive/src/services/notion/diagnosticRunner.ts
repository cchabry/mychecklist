
import { STORAGE_KEYS } from '@/lib/notionProxy/config';
import { notionApi } from '@/lib/notionProxy';
import { DiagnosticResults } from '@/hooks/notion/useNotionDiagnostic';
import { runConfigTests } from './configTests';
import { runConnectivityTests } from './connectivityTests';
import { runPermissionTests } from './permissionTests';
import { runStructureTests } from './structureTests';
import { toast } from 'sonner';

export interface DiagnosticOptions {
  persistCreatedPage?: boolean;
  onComplete: (results: DiagnosticResults) => void;
  onPageCreated?: (pageInfo: {id: string; title: string}) => void;
  initialResults: DiagnosticResults;
}

export async function runDiagnostics(options: DiagnosticOptions) {
  const { 
    persistCreatedPage = false, 
    onComplete, 
    onPageCreated,
    initialResults 
  } = options;
  
  // Notifier le début des tests
  onComplete({...initialResults});
  
  // Récupérer les données de configuration
  const apiKey = localStorage.getItem('notion_api_key');
  const projectsDbId = localStorage.getItem('notion_database_id');
  const checklistsDbId = localStorage.getItem('notion_checklists_database_id');
  
  // Vérifier et stocker l'état du mode mock
  const wasMockMode = notionApi.mockMode.isActive();
  if (wasMockMode) {
    localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
    notionApi.mockMode.forceReset();
  }
  
  try {
    // 1. Tests de configuration
    const configResults = await runConfigTests(
      apiKey, 
      projectsDbId, 
      checklistsDbId, 
      initialResults.configTests
    );
    
    onComplete({
      ...initialResults,
      configTests: configResults
    });
    
    // 2. Tests de connectivité
    const connectivityResults = await runConnectivityTests(
      apiKey, 
      initialResults.connectivityTests
    );
    
    onComplete({
      ...initialResults,
      configTests: configResults,
      connectivityTests: connectivityResults
    });
    
    // 3. Tests de permissions
    const permissionResults = await runPermissionTests(
      apiKey, 
      projectsDbId, 
      initialResults.permissionTests,
      persistCreatedPage,
      onPageCreated
    );
    
    onComplete({
      ...initialResults,
      configTests: configResults,
      connectivityTests: connectivityResults,
      permissionTests: permissionResults
    });
    
    // 4. Tests de structure
    const structureResults = await runStructureTests(
      apiKey, 
      projectsDbId, 
      checklistsDbId, 
      initialResults.structureTests
    );
    
    // Résultats finaux
    onComplete({
      configTests: configResults,
      connectivityTests: connectivityResults,
      permissionTests: permissionResults,
      structureTests: structureResults
    });
    
    // Restaurer le mode mock si nécessaire
    if (wasMockMode) {
      notionApi.mockMode.activate();
    }
    
    toast.success('Diagnostics terminés', {
      description: 'Tous les tests ont été exécutés'
    });
    
  } catch (error) {
    // En cas d'erreur globale
    toast.error('Erreur lors des diagnostics', {
      description: error.message || 'Une erreur est survenue pendant les tests'
    });
    
    // Restaurer le mode mock si nécessaire
    if (wasMockMode) {
      notionApi.mockMode.activate();
    }
  }
}
