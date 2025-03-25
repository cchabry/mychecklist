
import { CorsProxy, CorsProxyState } from './types';
import { availableProxies, getEnabledProxies } from './proxyList';

/**
 * Utilitaires pour les opérations sur les proxies
 */
export const proxyUtils = {
  availableProxies,
  
  /**
   * Obtient la liste des proxies activés
   */
  getEnabledProxies(): CorsProxy[] {
    return getEnabledProxies();
  },
  
  /**
   * Obtient le proxy CORS actuel
   */
  getCurrentProxy(state: CorsProxyState): CorsProxy {
    const enabledProxies = getEnabledProxies();
    if (enabledProxies.length === 0) {
      throw new Error('Aucun proxy CORS disponible.');
    }
    
    // Si un proxy spécifique est sélectionné, l'utiliser
    if (state.selectedProxyUrl) {
      const selectedProxy = availableProxies.find(p => p.url === state.selectedProxyUrl);
      if (selectedProxy && selectedProxy.enabled) {
        return selectedProxy;
      }
    }
    
    // Utiliser le dernier proxy qui a fonctionné s'il existe
    if (state.lastWorkingProxyIndex !== null) {
      return availableProxies[state.lastWorkingProxyIndex];
    }
    
    return enabledProxies[state.currentProxyIndex % enabledProxies.length];
  },
  
  /**
   * Récupère le proxy actuellement sélectionné
   */
  getSelectedProxy(state: CorsProxyState): CorsProxy | null {
    if (state.selectedProxyUrl) {
      const proxy = availableProxies.find(p => p.url === state.selectedProxyUrl);
      return proxy || null;
    }
    return this.getCurrentProxy(state);
  },
  
  /**
   * Obtient le prochain proxy dans la liste
   */
  getNextProxy(currentIndex: number): { newIndex: number, proxy: CorsProxy } {
    const enabledProxies = getEnabledProxies();
    if (enabledProxies.length === 0) {
      throw new Error('Aucun proxy CORS disponible.');
    }
    
    const newIndex = (currentIndex + 1) % enabledProxies.length;
    return {
      newIndex,
      proxy: enabledProxies[newIndex]
    };
  },
  
  /**
   * Vérifie si un proxy nécessite une activation
   */
  requiresActivation(proxyUrl: string): boolean {
    const proxy = availableProxies.find(p => p.url === proxyUrl);
    return proxy ? !!proxy.requiresActivation : false;
  },
  
  /**
   * Obtient l'URL d'activation d'un proxy
   */
  getActivationUrl(proxyUrl: string): string | null {
    const proxy = availableProxies.find(p => p.url === proxyUrl);
    return proxy && proxy.requiresActivation ? proxy.activationUrl || null : null;
  }
};
