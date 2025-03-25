
import { PUBLIC_CORS_PROXIES } from '@/lib/notionProxy/config';

interface ProxyInfo {
  url: string;
  lastTested: number;
  success: boolean;
  latency: number;
}

class CorsProxyService {
  // Clé pour le stockage local
  private readonly STORAGE_KEY = 'cors_proxy_config';
  
  // Proxy par défaut
  private readonly DEFAULT_PROXY = PUBLIC_CORS_PROXIES[0];
  
  // Obtenir le proxy actuel depuis le stockage
  getCurrentProxy(): ProxyInfo | null {
    try {
      const storedValue = localStorage.getItem(this.STORAGE_KEY);
      if (!storedValue) return null;
      
      return JSON.parse(storedValue);
    } catch (error) {
      console.error('Erreur lors de la récupération du proxy CORS:', error);
      return null;
    }
  }
  
  // Définir un proxy
  setSelectedProxy(proxyUrl: string): void {
    try {
      const proxyInfo: ProxyInfo = {
        url: proxyUrl,
        lastTested: Date.now(),
        success: true,
        latency: 0
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(proxyInfo));
      console.log(`Proxy CORS défini: ${proxyUrl}`);
    } catch (error) {
      console.error('Erreur lors de la définition du proxy CORS:', error);
    }
  }
  
  // Tester un proxy spécifique
  async testProxy(proxyUrl: string, testToken?: string): Promise<ProxyInfo> {
    const startTime = Date.now();
    
    try {
      // Tester avec l'endpoint users/me qui est léger
      const testUrl = `${proxyUrl}${encodeURIComponent('https://api.notion.com/v1/users/me')}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      };
      
      // Ajouter le token de test si fourni
      if (testToken) {
        headers['Authorization'] = testToken.startsWith('Bearer ') 
          ? testToken 
          : `Bearer ${testToken}`;
      }
      
      const response = await fetch(testUrl, {
        method: 'HEAD',
        headers
      });
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      // Même une erreur 401 est OK, cela signifie que nous avons atteint l'API
      const isWorking = response.status === 401 || response.ok;
      
      const proxyInfo: ProxyInfo = {
        url: proxyUrl,
        lastTested: Date.now(),
        success: isWorking,
        latency
      };
      
      if (isWorking) {
        this.setSelectedProxy(proxyUrl);
      }
      
      return proxyInfo;
    } catch (error) {
      console.error(`Erreur lors du test du proxy ${proxyUrl}:`, error);
      
      const endTime = Date.now();
      
      return {
        url: proxyUrl,
        lastTested: Date.now(),
        success: false,
        latency: endTime - startTime
      };
    }
  }
  
  // Trouver un proxy fonctionnel
  async findWorkingProxy(testToken?: string): Promise<ProxyInfo | null> {
    // Essayer d'abord le proxy stocké
    const currentProxy = this.getCurrentProxy();
    
    if (currentProxy && Date.now() - currentProxy.lastTested < 3600000) { // 1 heure
      return currentProxy;
    }
    
    // Tester tous les proxies disponibles
    for (const proxyUrl of PUBLIC_CORS_PROXIES) {
      const proxyInfo = await this.testProxy(proxyUrl, testToken);
      
      if (proxyInfo.success) {
        return proxyInfo;
      }
    }
    
    // Aucun proxy ne fonctionne
    return null;
  }
  
  // Réinitialiser le cache du proxy
  resetProxyCache(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
  
  // Configurer automatiquement un proxy
  async autoSetup(testToken?: string): Promise<ProxyInfo | null> {
    try {
      const proxy = await this.findWorkingProxy(testToken);
      
      if (!proxy) {
        // Si aucun proxy ne fonctionne, définir le proxy par défaut
        this.setSelectedProxy(this.DEFAULT_PROXY);
        return null;
      }
      
      return proxy;
    } catch (error) {
      console.error('Erreur lors de la configuration automatique du proxy:', error);
      return null;
    }
  }
  
  // Méthode pour proxifier une URL
  proxify(url: string): string {
    const proxy = this.getCurrentProxy();
    if (!proxy) {
      throw new Error('Aucun proxy CORS configuré');
    }
    return `${proxy.url}${encodeURIComponent(url)}`;
  }
}

// Exporter une instance unique
export const corsProxy = new CorsProxyService();

// Exporter aussi les constantes des proxies publics pour les composants qui en ont besoin
export { PUBLIC_CORS_PROXIES } from '@/lib/notionProxy/config';
