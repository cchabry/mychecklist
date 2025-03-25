
import { CorsProxy, CorsProxyState, ProxyTestResult } from './types';
import { availableProxies, getEnabledProxies } from './proxyList';
import { operationMode } from '@/services/operationMode';

// Clé de stockage localStorage
const PROXY_STORAGE_KEY = 'cors_proxy_state';

/**
 * Service pour gérer les proxies CORS
 */
class CorsProxyService {
  private state: CorsProxyState = {
    currentProxyIndex: 0,
    lastWorkingProxyIndex: null,
    selectedProxyUrl: null
  };
  
  private listeners: Set<Function> = new Set();
  
  constructor() {
    this.loadFromStorage();
  }
  
  /**
   * Obtient le proxy CORS actuel
   */
  getCurrentProxy(): CorsProxy {
    const enabledProxies = getEnabledProxies();
    if (enabledProxies.length === 0) {
      throw new Error('Aucun proxy CORS disponible.');
    }
    
    // Si un proxy spécifique est sélectionné, l'utiliser
    if (this.state.selectedProxyUrl) {
      const selectedProxy = availableProxies.find(p => p.url === this.state.selectedProxyUrl);
      if (selectedProxy && selectedProxy.enabled) {
        return selectedProxy;
      }
    }
    
    // Utiliser le dernier proxy qui a fonctionné s'il existe
    if (this.state.lastWorkingProxyIndex !== null) {
      return availableProxies[this.state.lastWorkingProxyIndex];
    }
    
    return enabledProxies[this.state.currentProxyIndex % enabledProxies.length];
  }
  
  /**
   * Récupère le proxy actuellement sélectionné
   */
  getSelectedProxy(): CorsProxy | null {
    if (this.state.selectedProxyUrl) {
      const proxy = availableProxies.find(p => p.url === this.state.selectedProxyUrl);
      return proxy || null;
    }
    return this.getCurrentProxy();
  }
  
  /**
   * Définit le proxy à utiliser
   */
  setSelectedProxy(proxy: CorsProxy | string): void {
    const proxyUrl = typeof proxy === 'string' ? proxy : proxy.url;
    this.state.selectedProxyUrl = proxyUrl;
    this.saveToStorage();
    this.notifyListeners();
    console.log(`Proxy sélectionné: ${proxyUrl}`);
  }
  
  /**
   * Passe au proxy suivant
   */
  rotateProxy(): CorsProxy {
    const enabledProxies = getEnabledProxies();
    if (enabledProxies.length === 0) {
      throw new Error('Aucun proxy CORS disponible.');
    }
    
    this.state.currentProxyIndex = (this.state.currentProxyIndex + 1) % enabledProxies.length;
    this.state.selectedProxyUrl = null; // Réinitialiser la sélection manuelle
    this.saveToStorage();
    this.notifyListeners();
    
    const proxy = this.getCurrentProxy();
    console.log(`Rotation du proxy vers: ${proxy.url}`);
    return proxy;
  }
  
  /**
   * Construit l'URL complète avec le proxy CORS
   */
  buildProxyUrl(targetUrl: string): string {
    const currentProxy = this.getCurrentProxy();
    const fullUrl = `${currentProxy.url}${encodeURIComponent(targetUrl)}`;
    return fullUrl;
  }
  
  /**
   * Teste un proxy spécifique
   */
  async testProxy(proxy: CorsProxy, token: string): Promise<ProxyTestResult> {
    const requestId = Math.random().toString(36).substring(2, 9);
    console.log(`🔍 [${requestId}] testProxy - Test du proxy ${proxy.name}...`);
    
    try {
      const testUrl = 'https://api.notion.com/v1/users/me';
      const proxyUrl = `${proxy.url}${encodeURIComponent(testUrl)}`;
      
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
        // Mémoriser ce proxy comme fonctionnel
        this.state.lastWorkingProxyIndex = availableProxies.findIndex(p => p.url === proxy.url);
        
        // Sauvegarder aussi les métadonnées du test
        const proxyData = {
          url: proxy.url,
          lastTested: Date.now(),
          success: true,
          latency
        };
        
        localStorage.setItem('last_working_proxy', JSON.stringify(proxyData));
        console.log(`🔍 [${requestId}] testProxy - Proxy enregistré comme fonctionnel`, proxyData);
        
        this.saveToStorage();
        this.notifyListeners();
      }
      
      return {
        success,
        proxyName: proxy.name,
        statusCode: response.status,
        latency
      };
    } catch (error) {
      console.error(`🔍 [${requestId}] testProxy - Erreur:`, error.message);
      return {
        success: false,
        proxyName: proxy.name,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Trouve un proxy qui fonctionne
   */
  async findWorkingProxy(token: string): Promise<CorsProxy | null> {
    const requestId = Math.random().toString(36).substring(2, 9);
    console.log(`🔍 [${requestId}] findWorkingProxy - Recherche d'un proxy fonctionnel...`);
    
    const enabledProxies = getEnabledProxies();
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
            this.state.lastWorkingProxyIndex = proxyIndex;
            this.state.selectedProxyUrl = lastProxy.url;
            this.saveToStorage();
            this.notifyListeners();
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
      const proxyIndex = (this.state.currentProxyIndex + i) % enabledProxies.length;
      const proxy = enabledProxies[proxyIndex];
      
      console.log(`🔍 [${requestId}] findWorkingProxy - Test du proxy ${i+1}/${enabledProxies.length}: ${proxy.name}`);
      
      const result = await this.testProxy(proxy, token);
      
      if (result.success) {
        console.log(`🔍 [${requestId}] findWorkingProxy - Proxy fonctionnel trouvé: ${proxy.name}`);
        this.state.lastWorkingProxyIndex = availableProxies.findIndex(p => p.url === proxy.url);
        this.state.currentProxyIndex = proxyIndex;
        this.saveToStorage();
        this.notifyListeners();
        
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
  
  /**
   * Réinitialise l'état du service
   */
  reset(): void {
    console.log('corsProxyService.reset() - Réinitialisation de l\'état');
    this.state.currentProxyIndex = 0;
    this.state.lastWorkingProxyIndex = null;
    this.state.selectedProxyUrl = null;
    localStorage.removeItem('last_working_proxy');
    this.saveToStorage();
    this.notifyListeners();
  }
  
  /**
   * Réinitialise le cache des proxies
   */
  resetProxyCache(): void {
    console.log('corsProxyService.resetProxyCache() - Réinitialisation du cache');
    this.state.lastWorkingProxyIndex = null;
    this.state.selectedProxyUrl = null;
    localStorage.removeItem('last_working_proxy');
    this.saveToStorage();
    this.notifyListeners();
  }
  
  /**
   * Obtient la liste des proxies disponibles
   */
  getAvailableProxies(): CorsProxy[] {
    return getEnabledProxies();
  }
  
  /**
   * Vérifie si un proxy nécessite une activation
   */
  requiresActivation(proxyUrl: string): boolean {
    const proxy = availableProxies.find(p => p.url === proxyUrl);
    return proxy ? !!proxy.requiresActivation : false;
  }
  
  /**
   * Obtient l'URL d'activation d'un proxy
   */
  getActivationUrl(proxyUrl: string): string | null {
    const proxy = availableProxies.find(p => p.url === proxyUrl);
    return proxy && proxy.requiresActivation ? proxy.activationUrl || null : null;
  }
  
  /**
   * Enregistre un écouteur pour les changements d'état
   */
  subscribe(listener: Function): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  /**
   * Notifie tous les écouteurs d'un changement d'état
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (e) {
        console.error('Erreur dans un écouteur de proxy', e);
      }
    });
  }
  
  /**
   * Charge l'état depuis localStorage
   */
  private loadFromStorage(): void {
    try {
      const storedData = localStorage.getItem(PROXY_STORAGE_KEY);
      if (storedData) {
        const data = JSON.parse(storedData);
        this.state = { ...this.state, ...data };
        console.log('État du proxy CORS chargé depuis localStorage:', this.state);
      }
    } catch (e) {
      console.error('Erreur lors du chargement de l\'état du proxy depuis localStorage', e);
    }
  }
  
  /**
   * Sauvegarde l'état dans localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(PROXY_STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Erreur lors de la sauvegarde de l\'état du proxy dans localStorage', e);
    }
  }
}

// Créer et exporter l'instance unique du service
export const corsProxyService = new CorsProxyService();
