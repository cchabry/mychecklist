
import React, { useState, useEffect } from 'react';
import { Check, AlertTriangle, Loader2, RefreshCw, Server, ShieldAlert, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProxyStatus, resetAllProxyCaches } from '@/lib/notionProxy/proxyFetch';
import { verifyProxyDeployment } from '@/lib/notionProxy/config';

const NotionDeploymentChecker: React.FC = () => {
  const [status, setStatus] = useState<{
    checking: boolean;
    proxyDeployed: boolean | null;
    error: string | null;
    usingFallbackProxy: boolean;
    diagnosticInfo: Record<string, any> | null;
  }>({
    checking: true,
    proxyDeployed: null,
    error: null,
    usingFallbackProxy: false,
    diagnosticInfo: null
  });
  
  const checkDeployment = async () => {
    setStatus(prev => ({ ...prev, checking: true, error: null }));
    
    try {
      // Test direct au ping pour vérifier les APIs
      let pingResult = null;
      try {
        const pingUrl = `${window.location.origin}/api/ping`;
        console.log("Testing ping endpoint:", pingUrl);
        const pingResponse = await fetch(pingUrl, { 
          method: 'GET',
          cache: 'no-store'
        });
        pingResult = {
          status: pingResponse.status,
          ok: pingResponse.ok,
          data: pingResponse.ok ? await pingResponse.json() : null
        };
      } catch (pingError) {
        console.error("Ping test failed:", pingError);
        pingResult = {
          error: pingError.message,
          ok: false
        };
      }
      
      // Test sur le proxy lui-même
      let proxyResult = null;
      try {
        const proxyUrl = `${window.location.origin}/api/notion-proxy`;
        console.log("Testing proxy endpoint:", proxyUrl);
        const proxyResponse = await fetch(proxyUrl, { 
          method: 'GET',
          cache: 'no-store'
        });
        proxyResult = {
          status: proxyResponse.status,
          ok: proxyResponse.ok,
          data: proxyResponse.ok ? await proxyResponse.json() : null
        };
      } catch (proxyError) {
        console.error("Proxy test failed:", proxyError);
        proxyResult = {
          error: proxyError.message,
          ok: false
        };
      }
      
      // Utiliser la fonction de vérification existante
      const isDeployed = await verifyProxyDeployment(true);
      
      // Récupérer le statut complet du proxy
      const proxyStatus = getProxyStatus();
      
      setStatus({
        checking: false,
        proxyDeployed: isDeployed,
        error: isDeployed ? null : "Le proxy n'est pas accessible ou correctement configuré",
        usingFallbackProxy: proxyStatus.usingFallbackProxy,
        diagnosticInfo: {
          pingTest: pingResult,
          proxyTest: proxyResult,
          origin: window.location.origin,
          proxyStatus
        }
      });
    } catch (error) {
      console.error("Deployment check failed:", error);
      setStatus({
        checking: false,
        proxyDeployed: false,
        error: error.message,
        usingFallbackProxy: getProxyStatus().usingFallbackProxy,
        diagnosticInfo: {
          error: error.message,
          stack: error.stack,
          origin: window.location.origin
        }
      });
    }
  };
  
  useEffect(() => {
    checkDeployment();
  }, []);
  
  const openDiagnosticInfo = () => {
    if (status.diagnosticInfo) {
      const formattedInfo = JSON.stringify(status.diagnosticInfo, null, 2);
      const diagWindow = window.open('', '_blank');
      if (diagWindow) {
        diagWindow.document.write(`
          <html>
            <head>
              <title>Diagnostic du proxy Notion</title>
              <style>
                body { font-family: monospace; padding: 20px; background: #f5f5f5; }
                pre { background: white; padding: 15px; border-radius: 5px; overflow: auto; }
              </style>
            </head>
            <body>
              <h2>Informations de diagnostic</h2>
              <pre>${formattedInfo}</pre>
            </body>
          </html>
        `);
      } else {
        alert("Le navigateur a bloqué l'ouverture d'une nouvelle fenêtre. Vérifiez vos paramètres de blocage de popups.");
      }
    }
  };
  
  return (
    <div className="bg-slate-50 border rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium flex items-center gap-2">
          <Server size={16} />
          État du déploiement du proxy
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => {
              resetAllProxyCaches();
              checkDeployment();
            }}
            disabled={status.checking}
          >
            <RefreshCw size={14} className={status.checking ? 'animate-spin' : ''} />
            <span className="ml-1">Vérifier</span>
          </Button>
          
          {status.diagnosticInfo && (
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={openDiagnosticInfo}
            >
              <ExternalLink size={14} />
              <span className="ml-1">Diagnostic</span>
            </Button>
          )}
        </div>
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
              <span className="block text-xs mt-1 text-red-500 ml-6">
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
