
import { CorsProxy, ProxyInfo, ProxyTestResult } from './types';
import { availableProxies } from './proxyList';
import { proxyStorage } from './proxyStorage';
import { testProxyUrl } from './proxyTesting';

// Service pour la gestion des proxy CORS
class CorsProxyService {
  private _currentProxy: ProxyInfo | null = null;
  private _proxyTestsInProgress: boolean = false;
  
  constructor() {
    // Initialiser avec le proxy stocké ou le premier disponible
    this._currentProxy = this.loadSavedProxy() || this.getDefaultProxy();
  }
  
  // Initialisation au démarrage
  initialize() {
    // Charger le proxy actuel
    const savedProxy = this.loadSavedProxy();
    if (savedProxy) {
      console.log('🔄 Proxy CORS chargé depuis le stockage:', savedProxy);
      this._currentProxy = savedProxy;
    } else {
      // Pas de proxy sauvegardé, utiliser le premier disponible
      this._currentProxy = this.getDefaultProxy();
      
      // Programmer un test de proxy en arrière-plan
      setTimeout(() => this.findWorkingProxy(), 2000);
    }
  }
  
  // Obtenir le proxy actuel
  getCurrentProxy(): ProxyInfo | null {
    return this._currentProxy;
  }
  
  // Définir manuellement le proxy actuel
  setCurrentProxy(proxy: ProxyInfo) {
    this._currentProxy = proxy;
    this.saveProxyToStorage(proxy);
  }
  
  // Charger le proxy sauvegardé
  private loadSavedProxy(): ProxyInfo | null {
    return proxyStorage.loadProxy();
  }
  
  // Sauvegarder le proxy dans le stockage
  private saveProxyToStorage(proxy: ProxyInfo) {
    proxyStorage.saveProxy(proxy);
  }
  
  // Obtenir le proxy par défaut
  private getDefaultProxy(): ProxyInfo {
    const enabledProxies = this.getEnabledProxies();
    return enabledProxies.length > 0 
      ? enabledProxies[0]
      : { 
          url: 'https://cors-anywhere.herokuapp.com/', 
          lastTested: 0, 
          success: false, 
          latency: 0 
        };
  }
  
  // Réinitialiser le cache des proxies
  resetProxyCache() {
    this._currentProxy = null;
    proxyStorage.clearProxyCache();
    
    // Réinitialiser avec le proxy par défaut
    this._currentProxy = this.getDefaultProxy();
  }
  
  // Tester un proxy spécifique
  async testProxy(proxyUrl: string, testToken?: string): Promise<ProxyTestResult> {
    try {
      const result = await testProxyUrl(proxyUrl, testToken);
      
      // Mettre à jour les informations du proxy si c'est le proxy actuel
      if (this._currentProxy && this._currentProxy.url === proxyUrl) {
        this._currentProxy = {
          ...this._currentProxy,
          lastTested: Date.now(),
          success: result.success,
          latency: result.success ? result.latency : this._currentProxy.latency
        };
        
        // Sauvegarder les informations mises à jour
        this.saveProxyToStorage(this._currentProxy);
      }
      
      return result;
    } catch (error: any) {
      console.error(`🔴 Erreur lors du test du proxy ${proxyUrl}:`, error);
      return {
        success: false,
        latency: 0,
        error: error.message,
        proxyName: 'CORS Proxy'
      };
    }
  }
  
  // Trouver un proxy qui fonctionne
  async findWorkingProxy(testToken?: string): Promise<ProxyInfo | null> {
    // Éviter les tests simultanés
    if (this._proxyTestsInProgress) {
      console.log('🔄 Tests de proxy déjà en cours...');
      return this._currentProxy;
    }
    
    this._proxyTestsInProgress = true;
    
    try {
      console.log('🔍 Recherche d\'un proxy CORS fonctionnel...');
      
      // Obtenir tous les proxies disponibles
      const proxies = this.getEnabledProxies();
      
      if (proxies.length === 0) {
        console.warn('⚠️ Aucun proxy CORS disponible');
        return null;
      }
      
      // Tester chaque proxy jusqu'à en trouver un qui fonctionne
      for (const proxy of proxies) {
        console.log(`🔄 Test du proxy: ${proxy.url}`);
        
        const result = await this.testProxy(proxy.url, testToken);
        
        if (result.success) {
          console.log(`✅ Proxy fonctionnel trouvé: ${proxy.url} (latence: ${result.latency}ms)`);
          
          // Mettre à jour le proxy actuel
          this._currentProxy = {
            url: proxy.url,
            lastTested: Date.now(),
            success: true,
            latency: result.latency
          };
          
          // Sauvegarder le proxy fonctionnel
          this.saveProxyToStorage(this._currentProxy);
          
          return this._currentProxy;
        } else {
          console.log(`❌ Proxy non fonctionnel: ${proxy.url} (${result.error || 'erreur inconnue'})`);
        }
      }
      
      console.warn('⚠️ Aucun proxy CORS fonctionnel trouvé');
      return null;
    } catch (error) {
      console.error('🔴 Erreur lors de la recherche d\'un proxy:', error);
      return null;
    } finally {
      this._proxyTestsInProgress = false;
    }
  }
  
  // Obtenir la liste des proxies disponibles
  getEnabledProxies(): ProxyInfo[] {
    return availableProxies
      .filter(proxy => proxy.enabled)
      .map(proxy => ({
        url: proxy.url,
        lastTested: 0,
        success: false,
        latency: 0,
        name: proxy.name
      }));
  }
}

// Exporter une instance unique
export const corsProxyService = new CorsProxyService();
