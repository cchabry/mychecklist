
import { TestResult } from '@/components/notion/diagnostic/NotionTestResult';
import { notionApi } from '@/lib/notionProxy';

export async function runConnectivityTests(
  apiKey: string | null,
  initialTests: TestResult[]
): Promise<TestResult[]> {
  if (!apiKey) {
    return initialTests;
  }
  
  const connectivityResults = [...initialTests];
  
  // Test du proxy
  try {
    const response = await fetch('/api/ping');
    
    if (response.ok) {
      connectivityResults[0] = { 
        ...initialTests[0], 
        status: 'success',
        details: 'Proxy API accessible'
      };
    } else {
      connectivityResults[0] = { 
        ...initialTests[0], 
        status: 'error',
        details: `Erreur du proxy: ${response.status} ${response.statusText}`
      };
    }
  } catch (proxyError) {
    connectivityResults[0] = { 
      ...initialTests[0], 
      status: 'error',
      details: `Erreur du proxy: ${proxyError.message || 'Inaccessible'}`
    };
  }
  
  // Test d'authentification
  try {
    const user = await notionApi.users.me(apiKey);
    
    if (user && user.id) {
      connectivityResults[1] = { 
        ...initialTests[1], 
        status: 'success',
        details: `Authentifié en tant que: ${user.name || user.id}`
      };
    } else {
      connectivityResults[1] = { 
        ...initialTests[1], 
        status: 'error',
        details: 'Échec d\'authentification: Réponse invalide'
      };
    }
  } catch (authError) {
    connectivityResults[1] = { 
      ...initialTests[1], 
      status: 'error',
      details: `Échec d'authentification: ${authError.message || 'Erreur inconnue'}`
    };
  }
  
  return connectivityResults;
}
