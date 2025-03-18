
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Server, FileCode, ExternalLink, RefreshCw, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  VERCEL_PROXY_URL, 
  verifyProxyDeployment, 
  resetProxyCache 
} from '@/lib/notionProxy/config';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface DeploymentStatus {
  ping: boolean;
  head: boolean;
  post: boolean;
  deployed: boolean;
  message: string;
}

const NotionDeploymentChecker: React.FC = () => {
  const { toast } = useToast();
  const [status, setStatus] = useState<DeploymentStatus>({
    ping: false,
    head: false,
    post: false,
    deployed: false,
    message: 'Vérification du déploiement...'
  });
  
  const [checking, setChecking] = useState(true);
  const [attempts, setAttempts] = useState(0);
  
  const checkDeployment = async (force: boolean = false) => {
    setChecking(true);
    setStatus({
      ping: false,
      head: false,
      post: false,
      deployed: false,
      message: 'Vérification du déploiement en cours...'
    });
    
    try {
      // Incrémenter le nombre de tentatives
      setAttempts(prev => prev + 1);
      
      // Réinitialiser le cache si force est true
      if (force) {
        resetProxyCache();
      }
      
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
      
      // Vérifier proxy avec une requête HEAD
      let headOk = false;
      try {
        const proxyUrl = `${window.location.origin}/api/notion-proxy`;
        const headResponse = await fetch(proxyUrl, {
          method: 'HEAD',
          cache: 'no-store'
        });
        
        // Une réponse 404 signifie que le fichier n'existe pas
        headOk = headResponse.status !== 404;
        
        setStatus(prev => ({ 
          ...prev, 
          head: headOk, 
          message: headOk 
            ? 'Proxy trouvé, vérification du traitement des requêtes...' 
            : 'Erreur 404: fichier api/notion-proxy.ts non trouvé'
        }));
      } catch (headError) {
        // Une erreur CORS est normale ici et indique souvent que le fichier existe
        console.log('Erreur lors de la vérification HEAD du proxy (peut être normale en cas de CORS):', headError);
        headOk = true; // On suppose que le fichier existe
        
        setStatus(prev => ({ 
          ...prev, 
          head: true, 
          message: 'Proxy probablement présent (détection limitée par CORS)'
        }));
      }
      
      // Vérifier avec une requête POST réelle
      let postOk = false;
      if (headOk) {
        try {
          const proxyUrl = `${window.location.origin}/api/notion-proxy`;
          const postResponse = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
              endpoint: '/ping',
              method: 'GET',
              token: 'test_token_for_diagnostics'
            })
          });
          
          // Une réponse 404 sur POST est plus grave car elle indique que le gestionnaire ne fonctionne pas
          postOk = postResponse.status !== 404;
          
          setStatus(prev => ({ 
            ...prev, 
            post: postOk, 
            message: postOk 
              ? `Proxy répond avec statut ${postResponse.status}`
              : 'Le proxy existe mais ne répond pas aux requêtes POST (404)'
          }));
        } catch (postError) {
          console.error('Erreur lors de la vérification POST du proxy:', postError);
          postOk = false;
          
          setStatus(prev => ({ 
            ...prev, 
            post: false, 
            message: `Erreur lors de la requête POST: ${postError.message}`
          }));
        }
      }
      
      // Vérifier configuration globale
      const isVerified = await verifyProxyDeployment(force);
      
      setStatus({
        ping: pingOk,
        head: headOk,
        post: postOk,
        deployed: isVerified,
        message: isVerified
          ? 'Configuration prête! Le proxy Notion est correctement déployé.'
          : headOk && !postOk
          ? 'Le fichier proxy existe mais ne répond pas correctement aux requêtes POST (404)'
          : !headOk
          ? 'Le fichier api/notion-proxy.ts est introuvable (404) sur votre déploiement'
          : 'Problème de configuration du proxy. Vérifiez votre déploiement Vercel.'
      });
      
    } catch (error) {
      console.error('Erreur lors de la vérification du déploiement:', error);
      setStatus({
        ping: false,
        head: false,
        post: false,
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
  
  const handleForcedCheck = () => {
    toast({
      title: "Vérification forcée",
      description: "Réinitialisation du cache et nouvelle vérification du proxy"
    });
    checkDeployment(true);
  };
  
  // Extraire le domaine de déploiement pour affichage
  const deploymentDomain = window.location.origin;
  
  // Déterminer si on doit afficher une solution spécifique
  const showMissingFileHelp = !status.head;
  const showPostErrorHelp = status.head && !status.post;
  
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
              {status.head 
                ? <CheckCircle2 size={16} className="text-green-600" /> 
                : <AlertCircle size={16} className="text-amber-500" />}
              <span>Fichier notion-proxy: {status.head ? 'Trouvé' : 'Introuvable (404)'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {status.post 
                ? <CheckCircle2 size={16} className="text-green-600" /> 
                : <AlertCircle size={16} className="text-amber-500" />}
              <span>Requêtes POST: {status.post ? 'Fonctionnelles' : 'Non fonctionnelles'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {status.deployed 
                ? <CheckCircle2 size={16} className="text-green-600" /> 
                : <AlertCircle size={16} className="text-amber-500" />}
              <span>Configuration: {status.deployed ? 'Correcte' : 'Incorrecte ou incomplète'}</span>
            </div>
            
            <div className="mt-2 p-3 bg-gray-100 rounded text-sm">
              <p className="mb-2">{status.message}</p>
              <div className="text-xs text-gray-600">
                <div>URL du proxy: {VERCEL_PROXY_URL}</div>
                <div>Domaine de déploiement: {deploymentDomain}</div>
                <div>Tentatives: {attempts}</div>
              </div>
            </div>
          </div>
          
          {showMissingFileHelp && (
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
                  <strong>Solution:</strong> Vérifiez que le fichier existe dans votre projet et qu'il est correctement 
                  déployé sur Vercel. Si nécessaire, redéployez l'application.
                </div>
              </div>
            </div>
          )}
          
          {showPostErrorHelp && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs">
              <Server size={14} className="flex-shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-medium mb-1">Problème de configuration du proxy</p>
                <p className="mb-2">
                  Le fichier <code className="bg-white/50 px-1 py-0.5 rounded">api/notion-proxy.ts</code> est 
                  présent mais ne répond pas correctement aux requêtes POST. Le gestionnaire de la fonction API 
                  n'est pas correctement configuré.
                </p>
                <div className="bg-white/60 p-2 rounded text-amber-700">
                  <strong>Solution:</strong> Vérifiez que le fichier API est correctement implémenté. Il doit
                  exporter une fonction par défaut qui gère les requêtes POST et traite correctement les paramètres
                  <code className="bg-white/50 px-1 py-0.5 rounded ml-1">endpoint</code>, 
                  <code className="bg-white/50 px-1 py-0.5 rounded ml-1">method</code>, et
                  <code className="bg-white/50 px-1 py-0.5 rounded ml-1">token</code>.
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleForcedCheck}
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
          
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-xs">
            <div className="flex items-start gap-2">
              <HelpCircle size={14} className="flex-shrink-0 mt-0.5 text-blue-600" />
              <div>
                <p className="font-medium mb-1">Besoin d'aide?</p>
                <p className="mb-2">
                  Si le problème persiste après plusieurs tentatives, le fichier <code className="bg-white/50 px-1 py-0.5 rounded">api/notion-proxy.ts</code> 
                  n'est peut-être pas correctement déployé ou configuré sur Vercel.
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-1">
                  <li>Vérifiez que le fichier existe dans votre projet</li>
                  <li>Vérifiez que votre déploiement Vercel est à jour</li>
                  <li>Vérifiez que les fonctions API sont activées dans votre projet Vercel</li>
                  <li>Essayez de redéployer l'application</li>
                </ol>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotionDeploymentChecker;
