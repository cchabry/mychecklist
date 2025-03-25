
import { ProxyTestResult } from './types';

/**
 * Teste si un proxy CORS fonctionne correctement
 * 
 * @param proxyUrl URL du proxy à tester
 * @param testToken Token de test optionnel
 * @returns Résultat du test
 */
export async function testProxyUrl(proxyUrl: string, testToken?: string): Promise<ProxyTestResult> {
  const startTime = Date.now();
  const testUrl = 'https://api.notion.com/v1/users/me';
  
  try {
    // Préparer les en-têtes pour le test
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    };
    
    // Ajouter l'autorisation si un token est fourni
    if (testToken) {
      headers['Authorization'] = testToken;
    }
    
    // Effectuer la requête via le proxy
    const response = await fetch(`${proxyUrl}${testUrl}`, {
      method: 'GET',
      headers,
      // Ajouter un timeout pour ne pas attendre trop longtemps
      signal: AbortSignal.timeout(5000)
    });
    
    // Calculer la latence
    const latency = Date.now() - startTime;
    
    // Vérifier si la requête a réussi (même si l'authentification échoue)
    // Un proxy fonctionnel renvoie une réponse HTTP, même si c'est une erreur d'authentification
    if (response.status === 401 || (response.status >= 200 && response.status < 500)) {
      return {
        success: true,
        latency,
        proxyName: 'CORS Proxy'
      };
    }
    
    return {
      success: false,
      latency,
      error: `HTTP ${response.status}: ${response.statusText}`,
      proxyName: 'CORS Proxy'
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    return {
      success: false,
      latency,
      error: error instanceof Error ? error.message : String(error),
      proxyName: 'CORS Proxy'
    };
  }
}
