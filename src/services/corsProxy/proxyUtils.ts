
import { CorsProxyState, CorsProxy } from './types';
import { availableProxies } from './proxyList';

/**
 * Utilitaires pour les proxies CORS
 */
export const proxyUtils = {
  // Proxies disponibles
  availableProxies,
  
  /**
   * Obtient les proxies activés
   */
  getEnabledProxies: (): CorsProxy[] => {
    return availableProxies.filter(proxy => proxy.enabled);
  },
  
  /**
   * Méthode de compatibilité pour obtenir tous les proxies visibles
   */
  getVisibleProxies: (): CorsProxy[] => {
    return proxyUtils.getEnabledProxies();
  },
  
  /**
   * Obtient le proxy actuel
   */
  getCurrentProxy: (state: CorsProxyState): CorsProxy | null => {
    // Si un proxy est explicitement sélectionné, l'utiliser
    if (state.selectedProxyUrl) {
      const selected = availableProxies.find(p => p.url === state.selectedProxyUrl);
      if (selected && selected.enabled) {
        return selected;
      }
    }
    
    // Si un dernier proxy fonctionnel est stocké, l'utiliser
    if (state.lastWorkingProxyIndex !== null) {
      const enabledProxies = proxyUtils.getEnabledProxies();
      if (enabledProxies.length > 0 && state.lastWorkingProxyIndex < enabledProxies.length) {
        return enabledProxies[state.lastWorkingProxyIndex];
      }
    }
    
    // Utiliser le proxy courant selon l'index
    const enabledProxies = proxyUtils.getEnabledProxies();
    if (enabledProxies.length > 0) {
      const index = Math.min(state.currentProxyIndex, enabledProxies.length - 1);
      return enabledProxies[index];
    }
    
    return null;
  },
  
  /**
   * Obtient le proxy sélectionné
   */
  getSelectedProxy: (state: CorsProxyState): CorsProxy | null => {
    if (!state.selectedProxyUrl) return null;
    
    const proxy = availableProxies.find(p => p.url === state.selectedProxyUrl);
    return proxy && proxy.enabled ? proxy : null;
  },
  
  /**
   * Obtient le prochain proxy
   */
  getNextProxy: (currentIndex: number): { newIndex: number; proxy: CorsProxy } => {
    const enabledProxies = proxyUtils.getEnabledProxies();
    if (enabledProxies.length === 0) {
      throw new Error('Aucun proxy activé n\'est disponible');
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
  requiresActivation: (proxyUrl: string): boolean => {
    const proxy = availableProxies.find(p => p.url === proxyUrl);
    return proxy ? !!proxy.requiresActivation : false;
  },
  
  /**
   * Obtient l'URL d'activation d'un proxy
   */
  getActivationUrl: (proxyUrl: string): string | null => {
    const proxy = availableProxies.find(p => p.url === proxyUrl);
    return proxy && proxy.requiresActivation ? proxy.activationUrl || null : null;
  }
};
