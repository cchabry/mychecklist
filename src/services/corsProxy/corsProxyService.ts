
import { CorsProxy, CorsProxyState, ProxyTestResult } from './types';
import { availableProxies, getEnabledProxies } from './proxyList';
import { operationModeService } from '@/services/operationMode/operationModeService';

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
    
    return this.getCurrentProxy();
  }
  
  /**
   * Construit l'URL complète avec le proxy CORS
   */
  buildProxyUrl(targetUrl: string): string {
    const currentProxy = this.getCurrentProxy();
    return `${currentProxy.url}${encodeURIComponent(targetUrl)}`;
  }
  
  /**
   * Teste un proxy spécifique
   */
  async testProxy(proxy: CorsProxy, token: string): Promise<ProxyTestResult> {
    try {
      const testUrl = 'https://api.notion.com/v1/users/me';
      const proxyUrl = `${proxy.url}${encodeURIComponent(testUrl)}`;
      
      console.log(`Test du proxy ${proxy.name}...`);
      
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
      const success = response.status === 200 || response.status === 401;
      
      if (success) {
        // Mémoriser ce proxy comme fonctionnel
        this.state.lastWorkingProxyIndex = availableProxies.findIndex(p => p.url === proxy.url);
        this.saveToStorage();
        this.notifyListeners();
      }
      
      return {
        success,
        proxyName: proxy.name,
        statusCode: response.status
      };
    } catch (error) {
      console.error(`Erreur lors du test du proxy ${proxy.name}:`, error);
      return {
        success: false,
        proxyName: proxy.name,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Teste si le proxy serverless est disponible
   */
  async testServerlessProxy(token: string): Promise<ProxyTestResult> {
    try {
      // Utiliser l'endpoint de notre fonction serverless
      let serverlessUrl = '/api/notion-proxy';
      
      // Adapter l'URL selon l'environnement (Vercel, Netlify, etc.)
      if (window.location.hostname === 'localhost') {
        // En local, utiliser l'URL relative
        serverlessUrl = '/api/notion-proxy';
      } else if (window.location.hostname.includes('netlify.app')) {
        // Sur Netlify
        serverlessUrl = '/.netlify/functions/notion-proxy';
      }
      
      const testUrl = 'https://api.notion.com/v1/users/me';
      
      const response = await fetch(`${serverlessUrl}?url=${encodeURIComponent(testUrl)}`, {
        method: 'GET',
        headers: {
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        }
      });
      
      const success = response.status === 200 || response.status === 401;
      
      return {
        success,
        proxyName: 'Serverless Proxy',
        statusCode: response.status
      };
    } catch (error) {
      console.error('Erreur lors du test du proxy serverless:', error);
      return {
        success: false,
        proxyName: 'Serverless Proxy',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Trouve un proxy qui fonctionne
   */
  async findWorkingProxy(token: string): Promise<CorsProxy | null> {
    const enabledProxies = getEnabledProxies();
    
    for (let i = 0; i < enabledProxies.length; i++) {
      const proxyIndex = (this.state.currentProxyIndex + i) % enabledProxies.length;
      const proxy = enabledProxies[proxyIndex];
      
      const result = await this.testProxy(proxy, token);
      
      if (result.success) {
        console.log(`Proxy fonctionnel trouvé: ${proxy.name}`);
        this.state.lastWorkingProxyIndex = availableProxies.findIndex(p => p.url === proxy.url);
        this.state.currentProxyIndex = proxyIndex;
        this.saveToStorage();
        this.notifyListeners();
        
        // Signal au système d'opération que la connexion fonctionne
        operationModeService.handleSuccessfulOperation();
        
        return proxy;
      }
    }
    
    console.error('Aucun proxy CORS fonctionnel trouvé.');
    
    // Signal au système d'opération qu'aucun proxy ne fonctionne
    operationModeService.handleConnectionError(
      new Error('Aucun proxy CORS fonctionnel trouvé.'),
      'Recherche de proxy CORS'
    );
    
    return null;
  }
  
  /**
   * Réinitialise l'état du service
   */
  reset(): void {
    this.state.currentProxyIndex = 0;
    this.state.lastWorkingProxyIndex = null;
    this.state.selectedProxyUrl = null;
    this.saveToStorage();
    this.notifyListeners();
  }
  
  /**
   * Réinitialise le cache des proxies
   */
  resetProxyCache(): void {
    this.state.lastWorkingProxyIndex = null;
    this.state.selectedProxyUrl = null;
    this.saveToStorage();
    this.notifyListeners();
    console.log('Cache des proxies réinitialisé');
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
        console.log('État du proxy CORS chargé depuis localStorage');
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
