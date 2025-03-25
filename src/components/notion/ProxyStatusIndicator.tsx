
import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { corsProxy } from '@/services/corsProxy';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProxyStatusIndicatorProps {
  isDemoMode: boolean;
}

interface ProxyStatus {
  url: string;
  lastTested: number;
  success: boolean;
  latency?: number;
}

const ProxyStatusIndicator: React.FC<ProxyStatusIndicatorProps> = ({ isDemoMode }) => {
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
    toast.info(`Test du proxy ${currentProxy.name}...`);
    
    try {
      // Pour le test, on utilise un token factice
      const result = await corsProxy.testProxy(currentProxy, 'Bearer test_token_for_proxy_test');
      
      if (result.success) {
        const newStatus = {
          url: currentProxy.url,
          lastTested: Date.now(),
          success: true,
          latency: result.latency
        };
        
        setProxyStatus(newStatus);
        localStorage.setItem('last_working_proxy', JSON.stringify(newStatus));
        
        toast.success(`Proxy ${currentProxy.name} opérationnel!`, {
          description: result.latency ? `Temps de réponse: ${result.latency}ms` : undefined
        });
      } else {
        toast.error(`Le proxy ${currentProxy.name} ne fonctionne pas`, {
          description: result.error || `Code de statut: ${result.statusCode}`
        });
        
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
        toast.success(`Proxy fonctionnel trouvé: ${proxy.name}`);
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
  
  // Afficher le statut
  const renderStatus = () => {
    if (!proxyStatus) {
      return <p className="text-xs text-gray-600">Aucun test de proxy récent</p>;
    }
    
    const timeAgo = Math.round((Date.now() - proxyStatus.lastTested) / 60000);
    
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          {proxyStatus.success ? (
            <CheckCircle size={14} className="text-green-500" />
          ) : (
            <AlertCircle size={14} className="text-amber-500" />
          )}
          <p className="text-xs font-medium">
            {proxyStatus.success ? 'Proxy fonctionnel' : 'Proxy non fonctionnel'}
          </p>
        </div>
        <p className="text-xs text-gray-600">Dernier test: il y a {timeAgo} min</p>
        <p className="text-xs font-mono bg-gray-50 p-1 rounded overflow-hidden text-ellipsis">
          {proxyStatus.url}
        </p>
        {proxyStatus.latency && (
          <p className="text-xs text-gray-600">Temps de réponse: {proxyStatus.latency}ms</p>
        )}
      </div>
    );
  };
  
  // Si on est en mode démo, ne pas afficher les contrôles de proxy
  if (isDemoMode) {
    return (
      <div className="bg-blue-50 p-3 rounded-md border border-blue-200 mb-3">
        <div className="flex items-center gap-2 text-blue-700">
          <AlertCircle size={16} />
          <p className="text-sm font-medium">Mode démonstration actif</p>
        </div>
        <p className="text-xs text-blue-600 mt-1">
          En mode démonstration, les proxies CORS ne sont pas utilisés car les données sont simulées localement.
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-green-50 p-3 rounded-md border border-green-200 mb-3">
      <h3 className="font-medium mb-2 flex items-center gap-2 text-green-700">
        <ExternalLink size={16} />
        État du proxy CORS
      </h3>
      
      <div className="bg-white p-2 rounded border border-green-100 mb-3">
        {renderStatus()}
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={checkCurrentProxy}
          disabled={checking}
          className="text-xs"
        >
          {checking ? (
            <><RefreshCw size={14} className="mr-1 animate-spin" /> Test en cours...</>
          ) : (
            <><RefreshCw size={14} className="mr-1" /> Tester le proxy actuel</>
          )}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={findBetterProxy}
          disabled={checking}
          className="text-xs"
        >
          {checking ? (
            <><RefreshCw size={14} className="mr-1 animate-spin" /> Recherche...</>
          ) : (
            <>Trouver le meilleur proxy</>
          )}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={resetProxies}
          disabled={checking}
          className="text-xs text-amber-600"
        >
          Réinitialiser
        </Button>
      </div>
    </div>
  );
};

export default ProxyStatusIndicator;
