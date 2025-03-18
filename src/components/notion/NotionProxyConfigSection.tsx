
import React from 'react';
import { Server, AlertTriangle, FileCode } from 'lucide-react';
import NotionDeploymentChecker from './NotionDeploymentChecker';

const NotionProxyConfigSection: React.FC = () => {
  return (
    <div className="space-y-4">
      <NotionDeploymentChecker />
      
      <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
        <h3 className="font-medium mb-3 flex items-center gap-2 text-blue-700">
          <Server size={16} />
          Configuration du proxy Vercel
        </h3>
        <p className="text-sm text-blue-700 mb-3">
          Pour finaliser la configuration et pouvoir utiliser l'API Notion directement:
        </p>
        <ol className="space-y-3 list-decimal pl-5">
          <li className="text-sm">
            <div className="flex items-start gap-1">
              <FileCode size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Vérifiez que le fichier <code>api/notion-proxy.ts</code> existe</strong> dans votre projet 
                et est correctement déployé sur Vercel
              </span>
            </div>
          </li>
          <li className="text-sm">
            Assurez-vous que <strong>vercel.json</strong> contient la configuration suivante:
            <pre className="bg-slate-100 p-2 rounded text-xs mt-1 overflow-x-auto">
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
              il doit être <code>api/notion-proxy.ts</code> et non <code>api/notion-proxy/index.ts</code>
            </span>
          </li>
          <li className="text-sm">
            Vous pouvez manuellement tester l'existence de l'endpoint en ouvrant dans un nouvel onglet: 
            <code className="bg-slate-100 px-1 py-0.5 rounded text-xs ml-1">{window.location.origin}/api/notion-proxy</code>
          </li>
        </ol>
        <div className="bg-amber-50 border border-amber-200 p-2 rounded-md mt-3 text-amber-800 text-xs">
          <p className="font-medium">Problème courant:</p>
          <p>Si vous recevez une erreur 404, le fichier API n'est probablement pas correctement déployé 
          ou n'est pas accessible via le chemin spécifié dans vercel.json.</p>
        </div>
        <p className="text-sm mt-3 text-blue-700">
          En attendant la résolution du problème, l'application fonctionnera en mode démonstration avec des données de test.
        </p>
      </div>
    </div>
  );
};

export default NotionProxyConfigSection;
