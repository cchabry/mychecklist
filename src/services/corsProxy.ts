
/**
 * Service pour gérer les proxies CORS
 * Permet de configurer et tester des proxies pour accéder à l'API Notion
 */

// Liste des proxies CORS publics disponibles
const PUBLIC_CORS_PROXIES = [
  "https://corsproxy.io/?",
  "https://cors-anywhere.herokuapp.com/",
  "https://proxy.cors.sh/",
  "https://cors-proxy.htmldriven.com/?url=",
  "https://api.allorigins.win/raw?url="
];

// Clé de stockage local pour le proxy choisi
const PROXY_STORAGE_KEY = "notion_cors_proxy";

// Interface pour le proxy
interface ProxyInfo {
  url: string;
  lastTested?: number;
  success?: boolean;
  latency?: number;
}

/**
 * Service pour gérer les proxies CORS
 */
class CorsProxyService {
  private _cachedProxy: ProxyInfo | null = null;
  
  constructor() {
    this.loadFromStorage();
  }
  
  /**
   * Charge la configuration du proxy depuis le stockage local
   */
  private loadFromStorage(): void {
    try {
      const storedProxy = localStorage.getItem(PROXY_STORAGE_KEY);
      if (storedProxy) {
        this._cachedProxy = JSON.parse(storedProxy);
        console.log("🔄 Proxy CORS chargé depuis le stockage:", this._cachedProxy);
      }
    } catch (e) {
      console.error("Erreur lors du chargement du proxy:", e);
    }
  }
  
  /**
   * Sauvegarde la configuration du proxy dans le stockage local
   */
  private saveToStorage(): void {
    try {
      if (this._cachedProxy) {
        localStorage.setItem(PROXY_STORAGE_KEY, JSON.stringify(this._cachedProxy));
      } else {
        localStorage.removeItem(PROXY_STORAGE_KEY);
      }
    } catch (e) {
      console.error("Erreur lors de la sauvegarde du proxy:", e);
    }
  }
  
  /**
   * Obtient le proxy actuellement configuré
   */
  getCurrentProxy(): ProxyInfo | null {
    return this._cachedProxy;
  }
  
  /**
   * Définit le proxy à utiliser
   */
  setSelectedProxy(proxyUrl: string): void {
    this._cachedProxy = {
      url: proxyUrl,
      lastTested: Date.now(),
      success: true
    };
    
    this.saveToStorage();
    console.log("✅ Proxy CORS configuré:", proxyUrl);
  }
  
  /**
   * Teste un proxy spécifique
   * @returns true si le proxy fonctionne, false sinon
   */
  async testProxy(proxyUrl: string, testToken: string = "test_token_for_proxy_test"): Promise<boolean> {
    try {
      const startTime = Date.now();
      
      // Construire l'URL du test
      const testUrl = `${proxyUrl}${encodeURIComponent('https://api.notion.com/v1/users/me')}`;
      
      // Effectuer une requête de test
      const response = await fetch(testUrl, {
        method: 'HEAD',  // Utiliser HEAD pour ne pas récupérer le corps de la réponse
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Notion-Version': '2022-06-28'
        }
      });
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      // Même un code 401 est bon, cela signifie que nous avons atteint l'API Notion
      const isWorking = response.status !== 0 && response.status !== 404;
      
      console.log(`Proxy testé: ${proxyUrl}`, {
        status: response.status,
        latency,
        working: isWorking
      });
      
      return isWorking;
    } catch (error) {
      console.error(`Erreur lors du test du proxy ${proxyUrl}:`, error);
      return false;
    }
  }
  
  /**
   * Recherche un proxy fonctionnel parmi les proxies publics
   */
  async findWorkingProxy(testToken: string = "test_token_for_proxy_test"): Promise<ProxyInfo | null> {
    console.log("🔍 Recherche d'un proxy CORS fonctionnel...");
    
    // Tester tous les proxies publics
    for (const proxyUrl of PUBLIC_CORS_PROXIES) {
      console.log(`Test du proxy: ${proxyUrl}`);
      
      const startTime = Date.now();
      const isWorking = await this.testProxy(proxyUrl, testToken);
      const endTime = Date.now();
      
      if (isWorking) {
        const proxy: ProxyInfo = {
          url: proxyUrl,
          lastTested: Date.now(),
          success: true,
          latency: endTime - startTime
        };
        
        // Sauvegarder ce proxy
        this._cachedProxy = proxy;
        this.saveToStorage();
        
        console.log("✅ Proxy fonctionnel trouvé:", proxy);
        return proxy;
      }
    }
    
    console.log("❌ Aucun proxy fonctionnel trouvé");
    return null;
  }
  
  /**
   * Réinitialise le cache du proxy
   */
  resetProxyCache(): void {
    this._cachedProxy = null;
    localStorage.removeItem(PROXY_STORAGE_KEY);
    console.log("🔄 Cache du proxy réinitialisé");
  }
  
  /**
   * Ajoute le proxy à une URL
   */
  proxify(url: string): string {
    if (!this._cachedProxy) {
      console.warn("⚠️ Aucun proxy configuré, utilisation de l'URL directe:", url);
      return url;
    }
    
    return `${this._cachedProxy.url}${encodeURIComponent(url)}`;
  }
}

// Exporter l'instance unique du service
export const corsProxy = new CorsProxyService();

// Exporter la liste des proxies publics pour référence
export { PUBLIC_CORS_PROXIES };
