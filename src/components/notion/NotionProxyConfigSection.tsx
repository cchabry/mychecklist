
import React from 'react';
import { Server, AlertTriangle, FileCode, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotionDeploymentChecker from './NotionDeploymentChecker';

const NotionProxyConfigSection: React.FC = () => {
  return (
    <div className="space-y-4">
      <NotionDeploymentChecker />
      
      <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
        <h3 className="font-medium mb-3 flex items-center gap-2 text-blue-700">
          <Server size={16} />
          Guide de configuration du proxy Vercel
        </h3>
        
        <p className="text-sm text-blue-700 mb-3">
          Pour finaliser la configuration et pouvoir utiliser l'API Notion directement, suivez ces étapes:
        </p>
        
        <ol className="space-y-4 list-decimal pl-5">
          <li className="text-sm">
            <div className="flex items-start gap-1">
              <FileCode size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Vérifiez que le fichier <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">api/notion-proxy.ts</code> existe</strong> dans votre projet 
                et est correctement déployé sur Vercel.
              </span>
            </div>
          </li>
          
          <li className="text-sm">
            <div className="flex items-start gap-1">
              <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <span>
                Assurez-vous que <strong>vercel.json</strong> contient la configuration suivante:
              </span>
            </div>
            <pre className="bg-slate-100 p-2 rounded text-xs mt-2 overflow-x-auto">
{`{
  "rewrites": [
    { "source": "/api/notion-proxy", "destination": "/api/notion-proxy.ts" }
  ]
}`}
            </pre>
          </li>
          
          <li className="text-sm flex items-start gap-1">
            <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <span>
              Si l'erreur 404 persiste, vérifiez le <strong>nom exact du fichier</strong> dans votre projet: 
              il doit être <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">api/notion-proxy.ts</code> et non dans un sous-dossier
            </span>
          </li>
          
          <li className="text-sm">
            <div className="flex items-start gap-1">
              <ExternalLink size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <span>
                Vous pouvez manuellement tester l'existence de l'endpoint en ouvrant dans un nouvel onglet: 
                <code className="bg-slate-100 px-1 py-0.5 rounded text-xs ml-1">{window.location.origin}/api/notion-proxy</code>
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 text-xs"
              asChild
            >
              <a href={`${window.location.origin}/api/notion-proxy`} target="_blank" rel="noopener noreferrer">
                Tester l'endpoint
              </a>
            </Button>
          </li>
        </ol>
        
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mt-4 text-amber-800 text-xs">
          <p className="font-medium flex items-center gap-1">
            <AlertTriangle size={14} className="flex-shrink-0" />
            Problème courant:
          </p>
          <p className="mt-1">Si vous recevez une erreur 404, cela signifie que le fichier API n'est pas correctement déployé 
          ou n'est pas accessible via le chemin spécifié dans vercel.json.</p>
          <p className="mt-2">Vérifiez dans votre dashboard Vercel que le fichier est bien déployé et que la configuration 
          est correcte.</p>
        </div>
        
        <p className="text-sm mt-4 text-blue-700">
          En attendant la résolution du problème, l'application fonctionnera en mode démonstration avec des données de test.
        </p>
      </div>
    </div>
  );
};

export default NotionProxyConfigSection;
