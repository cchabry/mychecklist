
import { useState, useEffect } from 'react';
import { corsProxy } from '@/services/corsProxy';
import { ProxyInfo, ProxyTestResult } from '@/services/corsProxy/types';

// Type définition pour le statut du proxy
export type ProxyStatus = {
  active: boolean;
  available: boolean;
  currentProxy: string | null;
  lastTested: number | null;
  error?: string;
};

export function useProxyStatus() {
  const [proxyStatus, setProxyStatus] = useState<ProxyStatus>({
    active: false,
    available: false,
    currentProxy: null,
    lastTested: null
  });
  
  const [checking, setChecking] = useState(false);
  
  // Charger le statut du proxy au montage du composant
  useEffect(() => {
    checkCurrentProxy();
  }, []);
  
  // Vérifier le proxy actuel
  const checkCurrentProxy = async () => {
    setChecking(true);
    
    try {
      // Vérifier si un proxy est configuré
      const currentProxy = corsProxy.getCurrentProxy();
      const availableProxies = corsProxy.getEnabledProxies().length > 0;
      
      // Test du proxy actuel si disponible
      if (currentProxy) {
        const testResult = await corsProxy.testProxy(currentProxy.url, "test_token");
        
        setProxyStatus({
          active: testResult.success,
          available: availableProxies,
          currentProxy: currentProxy.url,
          lastTested: Date.now(),
          error: testResult.success ? undefined : testResult.error
        });
      } else {
        setProxyStatus({
          active: false,
          available: availableProxies,
          currentProxy: null,
          lastTested: Date.now(),
          error: 'Aucun proxy configuré'
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la vérification du proxy:', error);
      
      setProxyStatus(prev => ({
        ...prev,
        active: false,
        lastTested: Date.now(),
        error: error.message || 'Erreur lors du test du proxy'
      }));
    } finally {
      setChecking(false);
    }
  };
  
  // Rechercher un meilleur proxy
  const findBetterProxy = async () => {
    setChecking(true);
    
    try {
      const result = await corsProxy.findWorkingProxy("test_token");
      
      if (result) {
        setProxyStatus({
          active: true,
          available: true,
          currentProxy: result.url,
          lastTested: Date.now()
        });
      } else {
        setProxyStatus({
          active: false,
          available: corsProxy.getEnabledProxies().length > 0,
          currentProxy: corsProxy.getCurrentProxy()?.url || null,
          lastTested: Date.now(),
          error: 'Impossible de trouver un proxy fonctionnel'
        });
      }
    } catch (error: any) {
      setProxyStatus(prev => ({
        ...prev,
        error: error.message || 'Erreur lors de la recherche d\'un proxy'
      }));
    } finally {
      setChecking(false);
    }
  };
  
  // Réinitialiser les proxies
  const resetProxies = () => {
    try {
      corsProxy.resetProxyCache();
      
      setProxyStatus({
        active: false,
        available: corsProxy.getEnabledProxies().length > 0,
        currentProxy: null,
        lastTested: Date.now()
      });
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des proxies:', error);
    }
  };
  
  return {
    proxyStatus,
    checking,
    checkCurrentProxy,
    findBetterProxy,
    resetProxies
  };
}
