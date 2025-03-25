
import { useState, useEffect } from 'react';
import { corsProxy } from '.';
import { ProxyInfo, ProxyTestResult } from './types';

/**
 * Hook qui fournit des fonctionnalités pour interagir avec le service de proxy CORS
 */
export function useCorsProxy() {
  const [currentProxy, setCurrentProxy] = useState<ProxyInfo | null>(null);
  const [proxies, setProxies] = useState<ProxyInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Charger l'état initial
  useEffect(() => {
    // Fonction pour initialiser l'état
    const initializeState = () => {
      const current = corsProxy.getCurrentProxy();
      setCurrentProxy(current);
      setProxies(corsProxy.getEnabledProxies());
      return () => {}; // Fonction de nettoyage vide
    };
    
    return initializeState();
  }, []);
  
  // Tester un proxy spécifique
  const testProxy = async (url: string): Promise<ProxyTestResult> => {
    setIsLoading(true);
    
    try {
      const result = await corsProxy.testProxy(url);
      
      // Mettre à jour l'état local si le proxy testé est le proxy actuel
      if (currentProxy && currentProxy.url === url) {
        setCurrentProxy({
          ...currentProxy,
          lastTested: Date.now(),
          success: result.success,
          latency: result.success ? result.latency : currentProxy.latency
        });
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        latency: 0,
        error: error.message
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Trouver un proxy fonctionnel
  const findWorkingProxy = async (): Promise<ProxyInfo | null> => {
    setIsLoading(true);
    
    try {
      const proxy = await corsProxy.findWorkingProxy();
      
      if (proxy) {
        setCurrentProxy(proxy);
      }
      
      return proxy;
    } catch (error) {
      console.error('Erreur lors de la recherche d\'un proxy:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Réinitialiser le cache des proxies
  const resetProxyCache = () => {
    corsProxy.resetProxyCache();
    setCurrentProxy(corsProxy.getCurrentProxy());
  };
  
  return {
    currentProxy,
    proxies,
    isLoading,
    testProxy,
    findWorkingProxy,
    resetProxyCache
  };
}
