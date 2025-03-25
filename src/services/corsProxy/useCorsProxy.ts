
import { useState, useEffect } from 'react';
import { corsProxyService } from './corsProxyService';
import { CorsProxy, ProxyTestResult } from './types';

/**
 * Hook React pour interagir avec le service de proxy CORS
 */
export function useCorsProxy() {
  const [currentProxy, setCurrentProxy] = useState<CorsProxy>(corsProxyService.getCurrentProxy());
  const [availableProxies, setAvailableProxies] = useState<CorsProxy[]>(corsProxyService.getAvailableProxies());
  const [isTestingProxy, setIsTestingProxy] = useState<boolean>(false);
  const [lastTestResult, setLastTestResult] = useState<ProxyTestResult | null>(null);
  
  useEffect(() => {
    // S'abonner aux changements
    const unsubscribe = corsProxyService.subscribe(() => {
      setCurrentProxy(corsProxyService.getCurrentProxy());
      setAvailableProxies(corsProxyService.getAvailableProxies());
    });
    
    // Se désabonner au démontage
    return unsubscribe;
  }, []);
  
  /**
   * Teste un proxy spécifique
   */
  const testProxy = async (proxy: CorsProxy, token: string): Promise<ProxyTestResult> => {
    setIsTestingProxy(true);
    try {
      const result = await corsProxyService.testProxy(proxy, token);
      setLastTestResult(result);
      return result;
    } finally {
      setIsTestingProxy(false);
    }
  };
  
  /**
   * Trouve un proxy qui fonctionne
   */
  const findWorkingProxy = async (token: string): Promise<CorsProxy | null> => {
    setIsTestingProxy(true);
    try {
      return await corsProxyService.findWorkingProxy(token);
    } finally {
      setIsTestingProxy(false);
    }
  };
  
  return {
    currentProxy,
    availableProxies,
    isTestingProxy,
    lastTestResult,
    
    // Fonctions du service
    testProxy,
    findWorkingProxy,
    buildProxyUrl: corsProxyService.buildProxyUrl.bind(corsProxyService),
    rotateProxy: corsProxyService.rotateProxy.bind(corsProxyService),
    setSelectedProxy: corsProxyService.setSelectedProxy.bind(corsProxyService),
    resetProxyCache: corsProxyService.resetProxyCache.bind(corsProxyService),
    requiresActivation: corsProxyService.requiresActivation.bind(corsProxyService),
    getActivationUrl: corsProxyService.getActivationUrl.bind(corsProxyService)
  };
}
