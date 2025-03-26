
import { TestResult } from '@/components/notion/diagnostic/NotionTestResult';
import { notionApi } from '@/lib/notionProxy';

export async function runConfigTests(
  apiKey: string | null,
  projectsDbId: string | null,
  checklistsDbId: string | null,
  initialTests: TestResult[]
): Promise<TestResult[]> {
  const configResults = [...initialTests];
  
  if (apiKey) {
    configResults[0] = { 
      ...initialTests[0], 
      status: 'success',
      details: `Clé API trouvée: ${apiKey.substring(0, 8)}...`
    };
  } else {
    configResults[0] = { 
      ...initialTests[0], 
      status: 'error',
      details: 'Aucune clé API trouvée dans le stockage local'
    };
  }
  
  if (projectsDbId) {
    configResults[1] = { 
      ...initialTests[1], 
      status: 'success',
      details: `ID de base de données Projets: ${projectsDbId.substring(0, 8)}...`
    };
  } else {
    configResults[1] = { 
      ...initialTests[1], 
      status: 'error',
      details: 'Aucun ID de base de données Projets trouvé'
    };
  }
  
  if (checklistsDbId) {
    configResults[2] = { 
      ...initialTests[2], 
      status: 'success',
      details: `ID de base de données Checklists: ${checklistsDbId.substring(0, 8)}...`
    };
  } else {
    configResults[2] = { 
      ...initialTests[2], 
      status: 'warning',
      details: 'Base de données Checklists non configurée (optionnelle)'
    };
  }
  
  return configResults;
}
