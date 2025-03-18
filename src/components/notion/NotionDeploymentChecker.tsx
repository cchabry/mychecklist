
import React, { useState, useEffect } from 'react';
import { Check, AlertTriangle, Loader2, RefreshCw, Server, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProxyStatus, resetAllProxyCaches } from '@/lib/notionProxy/proxyFetch';
import { verifyProxyDeployment } from '@/lib/notionProxy/config';

const NotionDeploymentChecker: React.FC = () => {
  const [status, setStatus] = useState<{
    checking: boolean;
    proxyDeployed: boolean | null;
    error: string | null;
    usingFallbackProxy: boolean;
  }>({
    checking: true,
    proxyDeployed: null,
    error: null,
    usingFallbackProxy: false
  });
  
  const checkDeployment = async () => {
    setStatus(prev => ({ ...prev, checking: true, error: null }));
    try {
      const isDeployed = await verifyProxyDeployment(false);
      
      // Récupérer le statut complet du proxy
      const proxyStatus = getProxyStatus();
      
      setStatus({
        checking: false,
        proxyDeployed: isDeployed,
        error: null,
        usingFallbackProxy: proxyStatus.usingFallbackProxy
      });
    } catch (error) {
      setStatus({
        checking: false,
        proxyDeployed: false,
        error: error.message,
        usingFallbackProxy: getProxyStatus().usingFallbackProxy
      });
    }
  };
  
  useEffect(() => {
    checkDeployment();
  }, []);
  
  return (
    <div className="bg-slate-50 border rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium flex items-center gap-2">
          <Server size={16} />
          État du déploiement du proxy
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => {
            resetAllProxyCaches(); // Réinitialiser les caches de tous les proxys
            checkDeployment();
          }}
          disabled={status.checking}
        >
          <RefreshCw size={14} className={status.checking ? 'animate-spin' : ''} />
          <span className="ml-1">Vérifier</span>
        </Button>
      </div>
      
      <div className="space-y-2">
        {status.checking ? (
          <div className="flex items-center text-sm text-slate-600">
            <Loader2 size={16} className="mr-2 animate-spin" />
            Vérification du déploiement du proxy...
          </div>
        ) : status.proxyDeployed ? (
          <div className="flex items-center text-sm text-green-600">
            <Check size={16} className="mr-2" />
            Le proxy Notion est correctement déployé sur Vercel
          </div>
        ) : (
          <div className="flex items-center text-sm text-amber-600">
            <AlertTriangle size={16} className="mr-2" />
            Le proxy Notion n'est pas correctement déployé sur Vercel
            {status.error && (
              <span className="block text-xs mt-1 text-red-500">
                Erreur: {status.error}
              </span>
            )}
          </div>
        )}
        
        {status.usingFallbackProxy && (
          <div className="flex items-center text-sm text-blue-600 mt-2 p-2 bg-blue-50 rounded-md">
            <ShieldAlert size={16} className="mr-2" />
            <div>
              <span className="font-medium">Mode proxy alternatif actif</span>
              <p className="text-xs mt-1">
                Le proxy alternatif via CORS est utilisé comme solution de secours.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotionDeploymentChecker;
