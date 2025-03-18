
import React, { useState, useEffect } from 'react';
import { Check, AlertTriangle, Loader2, RefreshCw, Server, Wifi, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProxyStatus, resetAllProxyCaches } from '@/lib/notionProxy/proxyFetch';
import { verifyProxyDeployment, findWorkingProxy, getSelectedProxy, PUBLIC_CORS_PROXIES } from '@/lib/notionProxy/config';

const NotionDeploymentChecker: React.FC = () => {
  const [status, setStatus] = useState<{
    checking: boolean;
    proxyWorking: boolean | null;
    error: string | null;
    currentProxy: string | null;
    diagnosticInfo: Record<string, any> | null;
  }>({
    checking: true,
    proxyWorking: null,
    error: null,
    currentProxy: null,
    diagnosticInfo: null
  });
  
  const checkDeployment = async () => {
    setStatus(prev => ({ ...prev, checking: true, error: null }));
    
    try {
      // Test if the current proxy is working
      const isWorking = await verifyProxyDeployment(true);
      
      if (!isWorking) {
        console.log("Current proxy not working, trying to find a working one...");
        // Try to find another working proxy
        await findWorkingProxy();
      }
      
      // Get current proxy information
      const currentProxy = getSelectedProxy();
      const proxyStatus = getProxyStatus();
      
      // Test a direct connection to Notion API (will fail due to CORS but good for diagnostics)
      let directApiTest = { error: 'Not tested' };
      try {
        await fetch('https://api.notion.com/v1/users/me', { 
          method: 'HEAD',
          headers: { 'Notion-Version': '2022-06-28' }
        });
        directApiTest = { success: true };
      } catch (error) {
        directApiTest = { error: error.message };
      }
      
      // Test the current proxy with a simple request
      let proxyTest = { error: 'Not tested' };
      try {
        const proxyUrl = `${currentProxy}${encodeURIComponent('https://api.notion.com/v1/users/me')}`;
        const response = await fetch(proxyUrl, { 
          method: 'HEAD',
          headers: {
            'Notion-Version': '2022-06-28',
            'Authorization': 'Bearer test_token'
          }
        });
        proxyTest = {
          status: response.status,
          ok: response.status !== 0 && response.status !== 404
        };
      } catch (error) {
        proxyTest = { error: error.message };
      }
      
      setStatus({
        checking: false,
        proxyWorking: isWorking,
        error: isWorking ? null : "Le proxy CORS n'est pas accessible ou correctement configuré",
        currentProxy,
        diagnosticInfo: {
          currentProxy,
          availableProxies: PUBLIC_CORS_PROXIES,
          directApiTest,
          proxyTest,
          proxyStatus,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Proxy check failed:", error);
      setStatus({
        checking: false,
        proxyWorking: false,
        error: error.message,
        currentProxy: getSelectedProxy(),
        diagnosticInfo: {
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
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
              <title>Diagnostic du proxy CORS</title>
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
          <Wifi size={16} />
          État du proxy CORS
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
            Vérification du proxy CORS...
          </div>
        ) : status.proxyWorking ? (
          <div className="flex items-center text-sm text-green-600">
            <Check size={16} className="mr-2" />
            Le proxy CORS est fonctionnel
            {status.currentProxy && (
              <span className="ml-1 text-xs text-gray-500">
                ({status.currentProxy.replace(/https?:\/\//, '')})
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center text-sm text-amber-600">
            <AlertTriangle size={16} className="mr-2" />
            Le proxy CORS n'est pas correctement configuré
            {status.error && (
              <span className="block text-xs mt-1 text-red-500 ml-6">
                Erreur: {status.error}
              </span>
            )}
          </div>
        )}

        <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-2 rounded border">
          <div className="font-medium mb-1 flex items-center gap-1">
            <Server size={12} className="text-gray-500" />
            À propos du proxy CORS
          </div>
          <p>
            Cette application utilise désormais un proxy CORS côté client pour communiquer avec l'API Notion,
            sans nécessiter de fonctions serverless Vercel.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotionDeploymentChecker;
