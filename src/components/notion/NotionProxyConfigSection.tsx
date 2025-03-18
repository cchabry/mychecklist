
import React from 'react';
import { Server, AlertTriangle, FileCode, Info, ExternalLink, Github, Settings, ArrowDown } from 'lucide-react';
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
                <strong>Vérifiez que les fichiers API existent</strong> et sont correctement déployés sur Vercel:
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><code className="bg-slate-100 px-1 py-0.5 rounded text-xs">api/notion-proxy.ts</code> (principal)</li>
                  <li><code className="bg-slate-100 px-1 py-0.5 rounded text-xs">api/ping.ts</code> (diagnostic)</li>
                  <li><code className="bg-slate-100 px-1 py-0.5 rounded text-xs">api/vercel-debug.ts</code> (information)</li>
                </ul>
              </span>
            </div>
          </li>
          
          <li className="text-sm">
            <div className="flex items-start gap-1">
              <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <span>
                  Assurez-vous que <strong>vercel.json</strong> contient la configuration suivante:
                </span>
                <pre className="bg-slate-100 p-2 rounded text-xs mt-2 overflow-x-auto">
{`{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "functions": {
    "api/*.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "rewrites": [
    { "source": "/api/notion-proxy", "destination": "/api/notion-proxy.ts" },
    { "source": "/api/ping", "destination": "/api/ping.ts" },
    { "source": "/api/vercel-debug", "destination": "/api/vercel-debug.ts" }
  ]
}`}
                </pre>
                <div className="mt-2 pt-2 border-t border-blue-100">
                  <p className="font-medium text-blue-700 mb-1">Comment localiser et vérifier vercel.json:</p>
                  <ol className="list-decimal pl-5 space-y-1 text-blue-600">
                    <li className="flex items-start gap-1">
                      <Github size={14} className="flex-shrink-0 mt-0.5" />
                      <span>Dans votre <strong>dépôt GitHub</strong>, vérifiez à la racine du projet</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <Settings size={14} className="flex-shrink-0 mt-0.5" />
                      <span>Dans le <strong>dashboard Vercel</strong>: Project → Settings → Git → Root Directory</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <ArrowDown size={14} className="flex-shrink-0 mt-0.5" />
                      <span>Téléchargez le code source via: Project → Settings → Git → "Download source code"</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
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
              <div>
                <span>
                  Vérifiez les fonctions serverless dans le dashboard Vercel:
                </span>
                <div className="bg-white p-3 rounded-md border border-blue-100 mt-2 text-xs">
                  <p className="font-medium text-blue-800 mb-2">Où trouver les fonctions serverless dans Vercel:</p>
                  <ol className="list-decimal pl-4 space-y-1 text-blue-700">
                    <li>Allez dans le dashboard Vercel de votre projet</li>
                    <li>Cliquez sur votre déploiement le plus récent</li>
                    <li>Allez dans l'onglet "Functions"</li>
                    <li>Vous devriez voir les 3 fonctions: <code>api/notion-proxy.ts</code>, <code>api/ping.ts</code> et <code>api/vercel-debug.ts</code></li>
                    <li>Si elles n'apparaissent pas, votre fichier vercel.json n'est peut-être pas correctement configuré ou le déploiement n'est pas à jour</li>
                  </ol>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <Button
                size="sm"
                variant="outline"
                className="text-xs mr-2"
                asChild
              >
                <a href={`${window.location.origin}/api/ping`} target="_blank" rel="noopener noreferrer">
                  Tester /api/ping
                </a>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs mr-2"
                asChild
              >
                <a href={`${window.location.origin}/api/vercel-debug`} target="_blank" rel="noopener noreferrer">
                  Diagnostiquer Vercel
                </a>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                asChild
              >
                <a href={`${window.location.origin}/api/notion-proxy`} target="_blank" rel="noopener noreferrer">
                  Tester /api/notion-proxy
                </a>
              </Button>
            </div>
          </li>
        </ol>
        
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mt-4 text-amber-800 text-xs">
          <p className="font-medium flex items-center gap-1">
            <AlertTriangle size={14} className="flex-shrink-0" />
            Problème courant avec les POST:
          </p>
          <p className="mt-1">Si vous recevez une erreur 404 uniquement lors des requêtes POST, cela peut indiquer:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Le fichier <code>api/notion-proxy.ts</code> existe mais sa fonction handler n'est pas correctement configurée pour les requêtes POST</li>
            <li>La configuration de <code>vercel.json</code> comporte une erreur ou n'est pas appliquée (redéployez après modification)</li>
            <li>Vercel utilise peut-être un cache pour les fichiers API, essayez un redéploiement forcé</li>
          </ul>
        </div>
        
        <p className="text-sm mt-4 text-blue-700">
          Si vous avez bien vérifié tous ces points et que le problème persiste, essayez de forcer un redéploiement complet du projet sur Vercel.
        </p>
      </div>
    </div>
  );
};

export default NotionProxyConfigSection;
