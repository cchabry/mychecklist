
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Server, FileCode, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VERCEL_PROXY_URL, verifyProxyDeployment } from '@/lib/notionProxy/config';

interface DeploymentStatus {
  ping: boolean;
  proxy: boolean;
  deployed: boolean;
  message: string;
}

const NotionDeploymentChecker: React.FC = () => {
  const [status, setStatus] = useState<DeploymentStatus>({
    ping: false,
    proxy: false,
    deployed: false,
    message: 'Vérification du déploiement...'
  });
  
  const [checking, setChecking] = useState(false);
  
  const checkDeployment = async () => {
    setChecking(true);
    setStatus({
      ping: false,
      proxy: false,
      deployed: false,
      message: 'Vérification du déploiement en cours...'
    });
    
    try {
      // Vérifier ping
      let pingOk = false;
      try {
        const pingResponse = await fetch(`${window.location.origin}/api/ping`, {
          method: 'GET',
          cache: 'no-store'
        });
        pingOk = pingResponse.ok;
        setStatus(prev => ({ 
          ...prev, 
          ping: pingOk, 
          message: pingOk ? 'Ping OK, vérification du proxy...' : 'Ping échoué - Vercel API inaccessible' 
        }));
      } catch (pingError) {
        console.error('Erreur lors du ping:', pingError);
        setStatus(prev => ({ 
          ...prev, 
          ping: false, 
          message: 'Erreur lors du ping - Vérifiez que Vercel est bien déployé' 
        }));
      }
      
      if (!pingOk) {
        setStatus(prev => ({ 
          ...prev, 
          message: 'Impossible de contacter le serveur. Vérifiez votre déploiement Vercel.' 
        }));
        setChecking(false);
        return;
      }
      
      // Vérifier proxy
      let proxyExists = false;
      try {
        // Utiliser HEAD au lieu de OPTIONS pour éviter les erreurs CORS
        const proxyResponse = await fetch(`${window.location.origin}/api/notion-proxy`, {
          method: 'HEAD',
          cache: 'no-store'
        });
        
        proxyExists = proxyResponse.status !== 404;
        setStatus(prev => ({ 
          ...prev, 
          proxy: proxyExists, 
          message: proxyExists 
            ? 'Proxy trouvé, vérification du déploiement complet...' 
            : 'Erreur 404: fichier api/notion-proxy.ts non trouvé'
        }));
      } catch (proxyError) {
        // Une erreur CORS est normale ici, cela signifie que le fichier existe
        console.log('Erreur lors de la vérification du proxy:', proxyError);
        proxyExists = true;
        setStatus(prev => ({ ...prev, proxy: true, message: 'Proxy détecté, vérification du déploiement...' }));
      }
      
      if (!proxyExists) {
        setStatus(prev => ({ 
          ...prev, 
          deployed: false,
          message: 'Le fichier api/notion-proxy.ts est manquant. Vérifiez votre déploiement Vercel.' 
        }));
        setChecking(false);
        return;
      }
      
      // Vérifier configuration complète
      const isConfigValid = VERCEL_PROXY_URL && VERCEL_PROXY_URL.includes('/api/notion-proxy');
      const isDeployed = await verifyProxyDeployment();
      
      setStatus({
        ping: pingOk,
        proxy: proxyExists,
        deployed: proxyExists && isConfigValid && isDeployed,
        message: proxyExists && isConfigValid && isDeployed
          ? 'Configuration prête! Le proxy Notion est correctement déployé.'
          : 'Le proxy est déployé mais pourrait ne pas fonctionner correctement. Vérifiez votre fichier vercel.json.'
      });
      
    } catch (error) {
      console.error('Erreur lors de la vérification du déploiement:', error);
      setStatus({
        ping: false,
        proxy: false,
        deployed: false,
        message: `Erreur lors de la vérification: ${error.message}`
      });
    } finally {
      setChecking(false);
    }
  };
  
  useEffect(() => {
    checkDeployment();
  }, []);
  
  return (
    <div className="p-4 rounded-md bg-gray-50 border border-gray-200 mb-4">
      <h3 className="font-medium mb-3 flex items-center gap-2">
        <Server size={16} className="text-tmw-teal" />
        État du déploiement Vercel
      </h3>
      
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2">
          {status.ping 
            ? <CheckCircle2 size={16} className="text-green-600" /> 
            : <AlertCircle size={16} className="text-amber-500" />}
          <span>API Vercel: {status.ping ? 'Accessible' : 'Inaccessible'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {status.proxy 
            ? <CheckCircle2 size={16} className="text-green-600" /> 
            : <AlertCircle size={16} className="text-amber-500" />}
          <span>Fichier notion-proxy: {status.proxy ? 'Trouvé' : 'Introuvable (404)'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {status.deployed 
            ? <CheckCircle2 size={16} className="text-green-600" /> 
            : <AlertCircle size={16} className="text-amber-500" />}
          <span>Configuration: {status.deployed ? 'Correcte' : 'Incorrecte ou incomplète'}</span>
        </div>
        
        <div className="mt-3 p-3 bg-gray-100 rounded text-sm">
          {status.message}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={checkDeployment}
            disabled={checking}
            className="flex-1"
          >
            {checking ? 'Vérification en cours...' : 'Vérifier à nouveau'}
          </Button>
          
          <Button
            size="sm"
            variant="default"
            className="flex items-center gap-1 flex-1 bg-tmw-teal hover:bg-tmw-teal/90"
            asChild
          >
            <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">
              <ExternalLink size={14} />
              Dashboard Vercel
            </a>
          </Button>
        </div>
        
        {!status.proxy && (
          <div className="flex items-start gap-2 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs">
            <FileCode size={14} className="flex-shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-medium mb-1">Fichier manquant</p>
              <p>
                Vérifiez que le fichier <code className="bg-white/50 px-1 py-0.5 rounded">api/notion-proxy.ts</code> existe 
                dans votre projet et est bien déployé sur Vercel.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotionDeploymentChecker;
