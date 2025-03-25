
import { ProxyInfo } from './types';

// Clé pour stocker le proxy dans localStorage
const PROXY_STORAGE_KEY = 'notion_cors_proxy';

/**
 * Service pour gérer le stockage des informations de proxy
 */
export const proxyStorage = {
  /**
   * Charge le proxy sauvegardé dans le stockage local
   */
  loadProxy(): ProxyInfo | null {
    try {
      const storedValue = localStorage.getItem(PROXY_STORAGE_KEY);
      if (!storedValue) return null;
      
      const proxy = JSON.parse(storedValue);
      return proxy;
    } catch (e) {
      console.error('Erreur lors du chargement du proxy:', e);
      return null;
    }
  },
  
  /**
   * Sauvegarde un proxy dans le stockage local
   */
  saveProxy(proxy: ProxyInfo): void {
    try {
      localStorage.setItem(PROXY_STORAGE_KEY, JSON.stringify(proxy));
    } catch (e) {
      console.error('Erreur lors de la sauvegarde du proxy:', e);
    }
  },
  
  /**
   * Efface le cache des proxies
   */
  clearProxyCache(): void {
    localStorage.removeItem(PROXY_STORAGE_KEY);
  }
};
