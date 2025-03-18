
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Server, FileCode, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VERCEL_PROXY_URL, verifyProxyDeployment } from '@/lib/notionProxy/config';
import { Skeleton } from '@/components/ui/skeleton';

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
  
  const [checking, setChecking] = useState(true);
  
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
        const pingUrl = `${window.location.origin}/api/ping`;
        console.log('📡 Test de ping du proxy:', pingUrl);
        
        const pingResponse = await fetch(pingUrl, {
          method: 'GET',
          cache: 'no-store'
        });
        pingOk = pingResponse.ok;
        console.log('📡 Ping du proxy réussi:', pingResponse.status);
        
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
      
      // Vérifier proxy avec une requête HEAD (moins susceptible d'être bloquée par CORS)
      let proxyExists = false;
      try {
        const proxyUrl = `${window.location.origin}/api/notion-proxy`;
        const proxyResponse = await fetch(proxyUrl, {
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
        // Une erreur CORS est normale ici et indique souvent que le fichier existe
        console.log('Erreur lors de la vérification du proxy (peut être normale en cas de CORS):', proxyError);
        
        // Essayons une autre méthode avec une requête OPTIONS qui sera peut-être moins bloquée
        try {
          const proxyUrl = `${window.location.origin}/api/notion-proxy`;
          await fetch(proxyUrl, { 
            method: 'OPTIONS',
            mode: 'no-cors' // Contourne les erreurs CORS mais ne permet pas de lire la réponse
          });
          
          // Si on arrive ici sans erreur, c'est que le fichier existe probablement
          proxyExists = true;
        } catch (optionsError) {
          console.error('Erreur lors de la seconde tentative de vérification du proxy:', optionsError);
          // En cas d'échec, on suppose que le fichier existe mais on est prudent
          proxyExists = false;
        }
        
        setStatus(prev => ({ 
          ...prev, 
          proxy: proxyExists, 
          message: proxyExists 
            ? 'Proxy probablement présent (détection limitée par CORS)' 
            : 'Proxy probablement absent - vérifiez le déploiement'
        }));
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
          : 'Le proxy est peut-être déployé mais ne fonctionne pas correctement. Vérifiez votre déploiement Vercel.'
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
  
  // Extraire le domaine de déploiement pour affichage
  const deploymentDomain = window.location.origin;
  
  return (
    <div className="space-y-3">
      {checking ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ) : (
        <>
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
            
            <div className="mt-2 p-3 bg-gray-100 rounded text-sm">
              <p className="mb-2">{status.message}</p>
              <div className="text-xs text-gray-600">Domaine de déploiement: {deploymentDomain}</div>
            </div>
          </div>
          
          {!status.proxy && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs">
              <FileCode size={14} className="flex-shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-medium mb-1">Fichier API manquant</p>
                <p className="mb-2">
                  Le fichier <code className="bg-white/50 px-1 py-0.5 rounded">api/notion-proxy.ts</code> est 
                  introuvable sur votre déploiement Vercel. Ce fichier est essentiel pour que l'application 
                  puisse communiquer avec l'API Notion.
                </p>
                <div className="bg-white/60 p-2 rounded text-amber-700">
                  <strong>Solution:</strong> Vérifiez que le fichier existe dans votre projet et que votre 
                  déploiement Vercel est à jour. Si nécessaire, redéployez l'application.
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={checkDeployment}
              disabled={checking}
              className="flex-1 flex items-center justify-center gap-1"
            >
              <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
              {checking ? 'Vérification...' : 'Vérifier à nouveau'}
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
        </>
      )}
    </div>
  );
};

export default NotionDeploymentChecker;
