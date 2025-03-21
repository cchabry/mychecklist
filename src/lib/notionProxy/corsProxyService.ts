
/**
 * Service pour gérer les proxies CORS
 */

// Définir l'interface d'un proxy CORS
interface CorsProxy {
  url: string;
  name: string;
  enabled: boolean; // Si le proxy est actif et peut être utilisé
  requiresActivation?: boolean; // Si le proxy nécessite une activation manuelle
  activationUrl?: string; // URL pour activer le proxy
  instructions?: string; // Instructions d'activation
  dynamicToken?: boolean; // Si le proxy nécessite un token qui change
}

// Liste des proxies CORS disponibles
const corsProxies: CorsProxy[] = [
  {
    name: 'CORS Anywhere',
    url: 'https://cors-anywhere.herokuapp.com/',
    enabled: true,
    requiresActivation: true,
    activationUrl: 'https://cors-anywhere.herokuapp.com/corsdemo',
    instructions: 'Visitez le lien et cliquez sur "Request temporary access to the demo server"'
  },
  {
    name: 'allOrigins',
    url: 'https://api.allorigins.win/raw?url=',
    enabled: true
  },
  {
    name: 'CORS Proxy',
    url: 'https://corsproxy.io/?',
    enabled: true
  },
  {
    name: 'CORS Bridge',
    url: 'https://api.codetabs.com/v1/proxy/?quest=',
    enabled: true
  },
  {
    name: 'CORS Online',
    url: 'https://cors-anywhere.azm.workers.dev/',
    enabled: true
  },
  // Ajouter d'autres proxies ici
];

// État interne
let currentProxyIndex = 0;
let lastWorkingProxyIndex: number | null = null;

/**
 * Service pour les opérations liées aux proxies CORS
 */
export const corsProxyService = {
  /**
   * Obtient le proxy CORS actuel
   */
  getCurrentProxy(): CorsProxy {
    const enabledProxies = corsProxies.filter(p => p.enabled);
    if (enabledProxies.length === 0) {
      throw new Error('Aucun proxy CORS disponible.');
    }
    
    // Utiliser le dernier proxy qui a fonctionné s'il existe
    if (lastWorkingProxyIndex !== null) {
      return corsProxies[lastWorkingProxyIndex];
    }
    
    return enabledProxies[currentProxyIndex % enabledProxies.length];
  },
  
  /**
   * Passe au proxy suivant
   */
  rotateProxy(): CorsProxy {
    const enabledProxies = corsProxies.filter(p => p.enabled);
    if (enabledProxies.length === 0) {
      throw new Error('Aucun proxy CORS disponible.');
    }
    
    currentProxyIndex = (currentProxyIndex + 1) % enabledProxies.length;
    return this.getCurrentProxy();
  },
  
  /**
   * Construit l'URL complète avec le proxy CORS
   */
  buildProxyUrl(targetUrl: string): string {
    const currentProxy = this.getCurrentProxy();
    return `${currentProxy.url}${encodeURIComponent(targetUrl)}`;
  },
  
  /**
   * Teste un proxy spécifique
   */
  async testProxy(proxy: CorsProxy, token: string): Promise<boolean> {
    try {
      const testUrl = 'https://api.notion.com/v1/users/me';
      const proxyUrl = `${proxy.url}${encodeURIComponent(testUrl)}`;
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        }
      });
      
      // Si la réponse est 401, c'est que le proxy fonctionne mais le token est invalide
      // Si la réponse est 200, c'est que le proxy et le token fonctionnent
      return response.status === 200 || response.status === 401;
    } catch (error) {
      console.error(`Erreur lors du test du proxy ${proxy.name}:`, error);
      return false;
    }
  },
  
  /**
   * Trouve un proxy qui fonctionne
   */
  async findWorkingProxy(token: string): Promise<CorsProxy | null> {
    const enabledProxies = corsProxies.filter(p => p.enabled);
    
    for (let i = 0; i < enabledProxies.length; i++) {
      const proxyIndex = (currentProxyIndex + i) % enabledProxies.length;
      const proxy = enabledProxies[proxyIndex];
      
      console.log(`Test du proxy ${proxy.name}...`);
      const works = await this.testProxy(proxy, token);
      
      if (works) {
        console.log(`Proxy fonctionnel trouvé: ${proxy.name}`);
        lastWorkingProxyIndex = corsProxies.findIndex(p => p.url === proxy.url);
        currentProxyIndex = proxyIndex;
        return proxy;
      }
    }
    
    console.error('Aucun proxy CORS fonctionnel trouvé.');
    return null;
  },
  
  /**
   * Réinitialise l'état du service
   */
  reset(): void {
    currentProxyIndex = 0;
    lastWorkingProxyIndex = null;
  },
  
  /**
   * Obtient la liste des proxies disponibles
   */
  getAvailableProxies(): CorsProxy[] {
    return corsProxies.filter(p => p.enabled);
  },
  
  /**
   * Vérifie si un proxy nécessite une activation
   */
  requiresActivation(proxyUrl: string): boolean {
    const proxy = corsProxies.find(p => p.url === proxyUrl);
    return proxy ? !!proxy.requiresActivation : false;
  },
  
  /**
   * Obtient l'URL d'activation d'un proxy
   */
  getActivationUrl(proxyUrl: string): string | null {
    const proxy = corsProxies.find(p => p.url === proxyUrl);
    return proxy && proxy.requiresActivation ? proxy.activationUrl || null : null;
  }
};

// Exportation du service
export default corsProxyService;
