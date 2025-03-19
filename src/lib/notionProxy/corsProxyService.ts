
import { STORAGE_KEYS, PUBLIC_CORS_PROXIES } from './config';

/**
 * Service de gestion des proxies CORS pour l'API Notion
 */
export const corsProxyService = {
  /**
   * Obtient le proxy CORS sélectionné
   */
  getSelectedProxy: (): string => {
    const selectedProxy = localStorage.getItem(STORAGE_KEYS.SELECTED_PROXY);
    if (selectedProxy) {
      return selectedProxy;
    }
    
    // Proxy par défaut
    const defaultProxy = PUBLIC_CORS_PROXIES[0];
    return defaultProxy;
  },
  
  /**
   * Définit le proxy CORS à utiliser
   */
  setSelectedProxy: (proxyUrl: string): void => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_PROXY, proxyUrl);
  },
  
  /**
   * Construit l'URL complète pour la requête via le proxy CORS
   */
  buildProxyUrl: (endpoint: string): string => {
    const proxy = corsProxyService.getSelectedProxy();
    const targetUrl = `https://api.notion.com/v1${endpoint}`;
    return `${proxy}${encodeURIComponent(targetUrl)}`;
  },
  
  /**
   * Réinitialise le cache du proxy
   */
  resetProxyCache: (): void => {
    localStorage.removeItem('notion_last_error');
  },
  
  /**
   * Recherche un proxy CORS fonctionnel
   */
  findWorkingProxy: async (apiKey?: string): Promise<string | null> => {
    // Récupérer la clé API pour le test si disponible
    apiKey = apiKey || localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
    
    for (const proxy of PUBLIC_CORS_PROXIES) {
      try {
        const testUrl = `${proxy}${encodeURIComponent('https://api.notion.com/v1/users/me')}`;
        
        const response = await fetch(testUrl, {
          method: 'HEAD',
          headers: {
            'Authorization': apiKey ? `Bearer ${apiKey}` : 'Bearer test_token',
            'Notion-Version': '2022-06-28'
          }
        });
        
        // Même un 401 est bon - cela signifie que nous avons atteint l'API Notion
        const isWorking = response.status !== 0 && response.status !== 404;
        
        if (isWorking) {
          corsProxyService.setSelectedProxy(proxy);
          return proxy;
        }
      } catch (error) {
        // Continuer avec le proxy suivant
      }
    }
    
    return null;
  },
  
  /**
   * Vérifie si le proxy serverless est opérationnel
   */
  testServerlessProxy: async (apiKey?: string): Promise<boolean> => {
    try {
      const apiProxyUrl = '/api/notion-proxy';
      
      // Obtenir la clé API pour le test
      apiKey = apiKey || localStorage.getItem(STORAGE_KEYS.API_KEY) || 'test_token_for_proxy_test';
      
      const response = await fetch(apiProxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: '/users/me',
          method: 'GET',
          token: apiKey
        })
      });
      
      // Même un 401 est bon - cela signifie que le proxy fonctionne
      const proxyWorks = response.status !== 404 && response.status !== 0;
      return proxyWorks;
    } catch (error) {
      return false;
    }
  }
};
