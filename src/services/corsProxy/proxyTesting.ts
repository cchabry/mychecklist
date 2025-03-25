
import { CorsProxy, ProxyTestResult, CorsProxyState } from './types';
import { availableProxies } from './proxyList';
import { proxyUtils } from './proxyUtils';
import { operationMode } from '@/services/operationMode';

/**
 * Fonctions pour tester les proxies CORS
 */
export const proxyTesting = {
  /**
   * Teste un proxy spécifique
   */
  async testProxy(proxy: CorsProxy | string, token: string): Promise<ProxyTestResult> {
    const actualProxy: CorsProxy = typeof proxy === 'string' 
      ? { url: proxy, name: proxy.split('/')[2] || proxy, enabled: true }
      : proxy;
      
    const requestId = Math.random().toString(36).substring(2, 9);
    console.log(`🔍 [${requestId}] testProxy - Test du proxy ${actualProxy.name}...`);
    
    try {
      const testUrl = 'https://api.notion.com/v1/users/me';
      const proxyUrl = `${actualProxy.url}${encodeURIComponent(testUrl)}`;
      
      console.log(`🔍 [${requestId}] testProxy - URL de test: ${proxyUrl}`);
      
      const startTime = Date.now();
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        }
      });
      
      const latency = Date.now() - startTime;
      
      // Si la réponse est 401, c'est que le proxy fonctionne mais le token est invalide
      // Si la réponse est 200, c'est que le proxy et le token fonctionnent
      const success = response.status === 200 || response.status === 401;
      
      console.log(`🔍 [${requestId}] testProxy - Réponse:`, {
        status: response.status,
        success,
        latency: `${latency}ms`
      });
      
      // Log du corps de la réponse en cas d'erreur
      if (!success) {
        try {
          const text = await response.text();
          console.warn(`🔍 [${requestId}] testProxy - Corps de l'erreur:`, text);
        } catch (e) {
          console.warn(`🔍 [${requestId}] testProxy - Impossible de lire le corps de l'erreur`);
        }
      }
      
      if (success) {
        // Sauvegarder aussi les métadonnées du test
        const proxyData = {
          url: actualProxy.url,
          lastTested: Date.now(),
          success: true,
          latency
        };
        
        localStorage.setItem('last_working_proxy', JSON.stringify(proxyData));
        console.log(`🔍 [${requestId}] testProxy - Proxy enregistré comme fonctionnel`, proxyData);
      }
      
      return {
        success,
        proxyName: actualProxy.name,
        statusCode: response.status,
        latency,
        error: success ? undefined : 'Échec du test'
      };
    } catch (error) {
      console.error(`🔍 [${requestId}] testProxy - Erreur:`, error.message);
      return {
        success: false,
        proxyName: actualProxy.name,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },
  
  /**
   * Trouve un proxy qui fonctionne
   */
  async findWorkingProxy(
    token: string, 
    state: CorsProxyState,
    updateState?: (newState: Partial<CorsProxyState>) => void
  ): Promise<CorsProxy | null> {
    const requestId = Math.random().toString(36).substring(2, 9);
    console.log(`🔍 [${requestId}] findWorkingProxy - Recherche d'un proxy fonctionnel...`);
    
    const enabledProxies = proxyUtils.getEnabledProxies();
    console.log(`🔍 [${requestId}] findWorkingProxy - ${enabledProxies.length} proxies à tester`);
    
    // Vérifier d'abord si le dernier proxy qui a fonctionné est toujours bon
    const lastProxyData = localStorage.getItem('last_working_proxy');
    if (lastProxyData) {
      try {
        const lastProxy = JSON.parse(lastProxyData);
        console.log(`🔍 [${requestId}] findWorkingProxy - Dernier proxy fonctionnel:`, lastProxy);
        
        // Si le dernier test était récent (moins de 10 minutes), utiliser ce proxy
        const lastTestedTime = lastProxy.lastTested || 0;
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        
        if (now - lastTestedTime < tenMinutes) {
          console.log(`🔍 [${requestId}] findWorkingProxy - Utilisation du proxy récemment testé: ${lastProxy.url}`);
          
          const proxyIndex = availableProxies.findIndex(p => p.url === lastProxy.url);
          if (proxyIndex >= 0) {
            if (updateState) {
              updateState({
                lastWorkingProxyIndex: proxyIndex,
                selectedProxyUrl: lastProxy.url
              });
            }
            return availableProxies[proxyIndex];
          }
        } else {
          console.log(`🔍 [${requestId}] findWorkingProxy - Dernier test trop ancien (${Math.round((now - lastTestedTime) / 60000)}min), refaire les tests`);
        }
      } catch (e) {
        console.error(`🔍 [${requestId}] findWorkingProxy - Erreur lors de la lecture du dernier proxy:`, e);
      }
    }
    
    // Tester tous les proxies
    for (let i = 0; i < enabledProxies.length; i++) {
      const proxyIndex = (state.currentProxyIndex + i) % enabledProxies.length;
      const proxy = enabledProxies[proxyIndex];
      
      console.log(`🔍 [${requestId}] findWorkingProxy - Test du proxy ${i+1}/${enabledProxies.length}: ${proxy.name}`);
      
      const result = await this.testProxy(proxy, token);
      
      if (result.success) {
        console.log(`🔍 [${requestId}] findWorkingProxy - Proxy fonctionnel trouvé: ${proxy.name}`);
        
        if (updateState) {
          updateState({
            lastWorkingProxyIndex: availableProxies.findIndex(p => p.url === proxy.url),
            currentProxyIndex: proxyIndex
          });
        }
        
        // Signal au système d'opération que la connexion fonctionne
        operationMode.handleSuccessfulOperation();
        
        return proxy;
      } else {
        console.warn(`🔍 [${requestId}] findWorkingProxy - Proxy non fonctionnel: ${proxy.name}`);
      }
    }
    
    console.error(`🔍 [${requestId}] findWorkingProxy - Aucun proxy CORS fonctionnel trouvé.`);
    
    // Signal au système d'opération qu'aucun proxy ne fonctionne
    operationMode.handleConnectionError(
      new Error('Aucun proxy CORS fonctionnel trouvé.'),
      'Recherche de proxy CORS'
    );
    
    return null;
  }
};
