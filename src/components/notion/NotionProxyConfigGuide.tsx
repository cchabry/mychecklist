
import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { getDeploymentType, verifyProxyDeployment } from '@/lib/notionProxy/config';

const NotionProxyConfigGuide = () => {
  // On utilise "deploymentType" comme type pour être sûr que c'est une valeur valide
  const [deploymentType, setDeploymentType] = useState<'vercel' | 'netlify' | 'local' | 'other'>(getDeploymentType());
  const [proxyWorking, setProxyWorking] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Vérifier si le proxy fonctionne
    const checkProxy = async () => {
      const isWorking = await verifyProxyDeployment();
      setProxyWorking(isWorking);
    };
    
    checkProxy();
  }, []);

  return (
    <div className="space-y-4">
      <Alert variant="warning">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Configuration de proxy nécessaire</AlertTitle>
        <AlertDescription>
          L'API Notion ne permet pas les requêtes directes depuis un navigateur en raison des restrictions CORS.
          Pour contourner cette limitation, nous devons utiliser un proxy.
        </AlertDescription>
      </Alert>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Environnement détecté</h3>
        <div className="text-sm p-3 bg-gray-50 rounded-md">
          <div className="flex justify-between">
            <span>Type de déploiement:</span>
            <span className="font-mono">{deploymentType}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Proxy fonctionnel:</span>
            <span>
              {proxyWorking === null ? (
                "Vérification..."
              ) : proxyWorking ? (
                <span className="text-green-600 flex items-center">
                  <Check size={16} className="mr-1" /> Oui
                </span>
              ) : (
                <span className="text-red-600">Non</span>
              )}
            </span>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {deploymentType === 'vercel' && (
        <div>
          <h3 className="text-sm font-medium mb-2">Guide pour Vercel</h3>
          <p className="text-sm text-gray-600 mb-2">
            Vercel dispose d'une fonctionnalité intégrée pour créer des API serverless qui peuvent servir de proxy.
          </p>
          <ol className="list-decimal pl-5 text-sm space-y-2">
            <li>Assurez-vous que votre projet inclut le dossier <code>api/</code> avec le fichier <code>notion-proxy.ts</code>.</li>
            <li>Redéployez votre application sur Vercel.</li>
            <li>Le proxy devrait fonctionner automatiquement après déploiement.</li>
          </ol>
          <div className="mt-3">
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a href="https://vercel.com/docs/functions/serverless-functions" target="_blank" rel="noopener noreferrer">
                Documentation Vercel <ExternalLink size={14} />
              </a>
            </Button>
          </div>
        </div>
      )}
      
      {deploymentType === 'netlify' && (
        <div>
          <h3 className="text-sm font-medium mb-2">Guide pour Netlify</h3>
          <p className="text-sm text-gray-600 mb-2">
            Netlify permet de créer des fonctions serverless qui peuvent servir de proxy.
          </p>
          <ol className="list-decimal pl-5 text-sm space-y-2">
            <li>Vérifiez que le dossier <code>netlify/functions/</code> contient le fichier <code>notion-proxy.js</code>.</li>
            <li>Assurez-vous que le fichier <code>netlify.toml</code> est correctement configuré.</li>
            <li>Redéployez votre application sur Netlify.</li>
          </ol>
          <div className="mt-3">
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a href="https://docs.netlify.com/functions/overview/" target="_blank" rel="noopener noreferrer">
                Documentation Netlify <ExternalLink size={14} />
              </a>
            </Button>
          </div>
        </div>
      )}
      
      {deploymentType === 'local' && (
        <div>
          <h3 className="text-sm font-medium mb-2">Développement local</h3>
          <p className="text-sm text-gray-600 mb-2">
            En développement local, vous pouvez utiliser un proxy CORS côté client ou configurer un serveur local.
          </p>
          <ol className="list-decimal pl-5 text-sm space-y-2">
            <li>Pour un développement rapide, un proxy CORS côté client est automatiquement configuré.</li>
            <li>Pour une solution plus robuste, démarrez un serveur local qui agit comme proxy.</li>
          </ol>
          <Alert className="mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Mode démo disponible</AlertTitle>
            <AlertDescription>
              En développement local, vous pouvez utiliser le mode démo qui ne nécessite pas de configuration Notion.
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {deploymentType === 'other' && (
        <div>
          <h3 className="text-sm font-medium mb-2">Autre environnement</h3>
          <p className="text-sm text-gray-600">
            Pour les autres environnements, vous devrez configurer un proxy CORS selon votre infrastructure.
            En attendant, un proxy CORS côté client est automatiquement configuré, mais il peut être moins fiable.
          </p>
        </div>
      )}
    </div>
  );
};

export default NotionProxyConfigGuide;
