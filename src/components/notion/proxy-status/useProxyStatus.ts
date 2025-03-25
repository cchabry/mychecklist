
import { useState, useEffect } from 'react';
import { corsProxy } from '@/services/corsProxy';
import { toast } from 'sonner';

interface ProxyStatus {
  url: string;
  lastTested: number;
  success: boolean;
  latency?: number;
}

export const useProxyStatus = () => {
  const [proxyStatus, setProxyStatus] = useState<ProxyStatus | null>(null);
  const [checking, setChecking] = useState(false);
  
  // Charger l'état du proxy depuis le localStorage
  useEffect(() => {
    try {
      const lastProxyData = localStorage.getItem('last_working_proxy');
      if (lastProxyData) {
        const data = JSON.parse(lastProxyData);
        setProxyStatus(data);
      }
    } catch (e) {
      console.error('Erreur lors du chargement du statut du proxy:', e);
    }
  }, []);
  
  // Vérifier le proxy actuel
  const checkCurrentProxy = async () => {
    const currentProxy = corsProxy.getCurrentProxy();
    if (!currentProxy) {
      toast.error('Aucun proxy disponible');
      return;
    }
    
    setChecking(true);
    toast.info(`Test du proxy ${currentProxy.url}...`);
    
    try {
      // Pour le test, on utilise un token factice
      const result = await corsProxy.testProxy(currentProxy.url, 'Bearer test_token_for_proxy_test');
      
      if (result) {
        const newStatus = {
          url: currentProxy.url,
          lastTested: Date.now(),
          success: true,
          latency: 0 // Pas de latence disponible dans ce cas
        };
        
        setProxyStatus(newStatus);
        localStorage.setItem('last_working_proxy', JSON.stringify(newStatus));
        
        toast.success(`Proxy ${currentProxy.url} opérationnel!`);
      } else {
        toast.error(`Le proxy ${currentProxy.url} ne fonctionne pas`);
        
        // Enregistrer l'échec
        setProxyStatus({
          url: currentProxy.url,
          lastTested: Date.now(),
          success: false
        });
      }
    } catch (e) {
      toast.error(`Erreur lors du test du proxy`, {
        description: e instanceof Error ? e.message : 'Erreur inconnue'
      });
    } finally {
      setChecking(false);
    }
  };
  
  // Trouver un meilleur proxy
  const findBetterProxy = async () => {
    setChecking(true);
    toast.info('Recherche du meilleur proxy...');
    
    try {
      const proxy = await corsProxy.findWorkingProxy('Bearer test_token_for_proxy_test');
      
      if (proxy) {
        toast.success(`Proxy fonctionnel trouvé: ${proxy.url}`);
        
        // Mettre à jour l'état
        const newStatus = {
          url: proxy.url,
          lastTested: Date.now(),
          success: true
        };
        
        setProxyStatus(newStatus);
        localStorage.setItem('last_working_proxy', JSON.stringify(newStatus));
      } else {
        toast.error('Aucun proxy fonctionnel trouvé');
      }
    } catch (e) {
      toast.error(`Erreur lors de la recherche`, {
        description: e instanceof Error ? e.message : 'Erreur inconnue'
      });
    } finally {
      setChecking(false);
    }
  };
  
  // Réinitialiser les proxies
  const resetProxies = () => {
    corsProxy.resetProxyCache();
    localStorage.removeItem('last_working_proxy');
    setProxyStatus(null);
    toast.success('Configuration des proxies réinitialisée');
  };
  
  return {
    proxyStatus,
    checking,
    checkCurrentProxy,
    findBetterProxy,
    resetProxies
  };
};
