
import { CorsProxyState } from './types';
import { proxyStorage } from './proxyStorage';
import { proxyTesting } from './proxyTesting';
import { proxyUtils } from './proxyUtils';
import { operationMode } from '@/services/operationMode';

// Clé de stockage localStorage
export const PROXY_STORAGE_KEY = 'cors_proxy_state';

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
    proxyStorage.loadFromStorage(PROXY_STORAGE_KEY, (data) => {
      this.state = { ...this.state, ...data };
      console.log('État du proxy CORS chargé depuis localStorage:', this.state);
    });
  }
  
  /**
   * Obtient le proxy CORS actuel
   */
  getCurrentProxy() {
    return proxyUtils.getCurrentProxy(this.state);
  }
  
  /**
   * Récupère le proxy actuellement sélectionné
   */
  getSelectedProxy() {
    return proxyUtils.getSelectedProxy(this.state);
  }
  
  /**
   * Définit le proxy à utiliser
   */
  setSelectedProxy(proxy) {
    this.state.selectedProxyUrl = typeof proxy === 'string' ? proxy : proxy.url;
    this.saveToStorage();
    this.notifyListeners();
    console.log(`Proxy sélectionné: ${this.state.selectedProxyUrl}`);
  }
  
  /**
   * Passe au proxy suivant
   */
  rotateProxy() {
    const { newIndex, proxy } = proxyUtils.getNextProxy(this.state.currentProxyIndex);
    this.state.currentProxyIndex = newIndex;
    this.state.selectedProxyUrl = null; // Réinitialiser la sélection manuelle
    this.saveToStorage();
    this.notifyListeners();
    
    console.log(`Rotation du proxy vers: ${proxy.url}`);
    return proxy;
  }
  
  /**
   * Construit l'URL complète avec le proxy CORS
   */
  buildProxyUrl(targetUrl) {
    const currentProxy = this.getCurrentProxy();
    return `${currentProxy.url}${encodeURIComponent(targetUrl)}`;
  }
  
  /**
   * Teste un proxy spécifique
   */
  async testProxy(proxy, token) {
    const result = await proxyTesting.testProxy(proxy, token);
    
    if (result.success) {
      // Mémoriser ce proxy comme fonctionnel
      const { availableProxies } = proxyUtils;
      this.state.lastWorkingProxyIndex = availableProxies.findIndex(p => 
        p.url === (typeof proxy === 'string' ? proxy : proxy.url)
      );
      
      this.saveToStorage();
      this.notifyListeners();
    }
    
    return result;
  }
  
  /**
   * Trouve un proxy qui fonctionne
   */
  async findWorkingProxy(token) {
    return await proxyTesting.findWorkingProxy(token, this.state, (updatedState) => {
      // Callback pour mettre à jour l'état
      if (updatedState) {
        this.state = { ...this.state, ...updatedState };
        this.saveToStorage();
        this.notifyListeners();
      }
    });
  }
  
  /**
   * Réinitialise l'état du service
   */
  resetProxyCache() {
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
  getAvailableProxies() {
    return proxyUtils.getEnabledProxies();
  }
  
  /**
   * Obtient la liste des proxies activés
   */
  getEnabledProxies() {
    return proxyUtils.getEnabledProxies();
  }
  
  /**
   * Vérifie si un proxy nécessite une activation
   */
  requiresActivation(proxyUrl) {
    return proxyUtils.requiresActivation(proxyUrl);
  }
  
  /**
   * Obtient l'URL d'activation d'un proxy
   */
  getActivationUrl(proxyUrl) {
    return proxyUtils.getActivationUrl(proxyUrl);
  }
  
  /**
   * Enregistre un écouteur pour les changements d'état
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  /**
   * Notifie tous les écouteurs d'un changement d'état
   */
  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (e) {
        console.error('Erreur dans un écouteur de proxy', e);
      }
    });
  }
  
  /**
   * Sauvegarde l'état dans localStorage
   */
  private saveToStorage() {
    proxyStorage.saveToStorage(PROXY_STORAGE_KEY, this.state);
  }
}

// Créer et exporter l'instance unique du service
export const corsProxyService = new CorsProxyService();
