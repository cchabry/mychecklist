
import React from 'react';
import { Server, AlertTriangle, FileCode, Info, ExternalLink, Github, Settings, ArrowDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotionDeploymentChecker from './NotionDeploymentChecker';

const NotionProxyConfigSection: React.FC = () => {
  // Helper function to get the correct API URL based on environment
  const getApiUrl = (endpoint: string) => {
    // In LovablePreview or dev environment, use relative paths
    // This is crucial because window.location.origin may not point to the correct API endpoint
    return process.env.NODE_ENV === 'production' 
      ? `${window.location.origin}${endpoint}`
      : endpoint;
  };

  // Function to test POST requests with better error handling
  const testPostRequest = async () => {
    try {
      const apiUrl = getApiUrl('/api/notion-proxy');
      console.log('Testing POST request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: '/ping',
          method: 'GET',
          token: 'test_token_for_manual_test'
        })
      });
      
      let responseText;
      try {
        responseText = await response.text();
      } catch (e) {
        responseText = 'Impossible de lire la réponse';
      }
      
      alert(`Statut: ${response.status}\n\nRéponse: ${responseText}`);
      console.log('POST test response:', { status: response.status, body: responseText });
    } catch (error) {
      console.error('Erreur lors du test POST:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <NotionDeploymentChecker />
      
      <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-4">
        <h3 className="font-medium mb-2 flex items-center gap-2 text-red-700">
          <AlertTriangle size={16} />
          Erreur fonction serverless détectée (404)
        </h3>
        
        <p className="text-sm text-red-700 mb-3">
          L'erreur <code className="bg-white px-1 py-0.5 rounded">404 Not Found</code> indique que les fonctions API ne sont pas accessibles. Voici les solutions possibles:
        </p>
        
        <ol className="space-y-3 list-decimal pl-5 text-sm text-red-700">
          <li>
            <strong>Vérifiez que les fichiers API existent</strong> - Assurez-vous que les fichiers <code>api/notion-proxy.ts</code>, <code>api/ping.ts</code> et <code>api/vercel-debug.ts</code> sont bien présents
          </li>
          <li>
            <strong>Vérifiez vercel.json</strong> - Assurez-vous que le fichier contient les bonnes redirections pour les API
          </li>
          <li>
            <strong>Redéployez l'application</strong> - Un nouveau déploiement peut résoudre certains problèmes de configuration
          </li>
        </ol>
      </div>
      
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
          
          <li className="text-sm">
            <div className="flex items-start gap-1">
              <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Problème actuel : Erreur 500 (Erreur d'exécution du serveur)</strong><br/>
                La fonction existe mais rencontre une erreur lors de son exécution. Vérifiez et simplifiez le code 
                de la fonction pour résoudre les problèmes potentiels.
              </span>
            </div>
          </li>
          
          <li className="text-sm">
            <div className="flex items-start gap-1">
              <ExternalLink size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <span>
                  Vérifiez les logs et les fonctions dans le dashboard Vercel:
                </span>
                <div className="bg-white p-3 rounded-md border border-blue-100 mt-2 text-xs">
                  <p className="font-medium text-blue-800 mb-2">Comment consulter les logs d'erreur:</p>
                  <ol className="list-decimal pl-4 space-y-1 text-blue-700">
                    <li>Allez dans le dashboard Vercel de votre projet</li>
                    <li>Cliquez sur votre déploiement le plus récent</li>
                    <li>Allez dans l'onglet "Functions"</li>
                    <li>Trouvez la fonction <code>api/notion-proxy.ts</code> et cliquez dessus</li>
                    <li>Consultez les logs d'erreur qui peuvent indiquer la source du problème</li>
                  </ol>
                </div>
              </div>
            </div>
          </li>
        </ol>
        
        <div className="bg-white border border-blue-200 p-3 rounded-md mt-4 text-blue-800 text-xs">
          <p className="font-medium flex items-center gap-1">
            <Loader2 size={14} className="animate-spin" />
            Après avoir effectué des modifications:
          </p>
          <p className="mt-1">Pour que les changements prennent effet:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Assurez-vous que le code est correctement déployé sur Vercel</li>
            <li>Si vous avez modifié le code localement, redéployez l'application</li>
            <li>Après le déploiement, essayez à nouveau de tester les endpoints</li>
            <li>Vérifiez les logs Vercel pour identifier toute erreur persistante</li>
          </ul>
        </div>
      </div>
      
      {/* Section de test des endpoints avec des boutons plus visibles */}
      <div className="bg-green-50 p-4 rounded-md border border-green-200">
        <h3 className="font-medium mb-3 flex items-center gap-2 text-green-700">
          <ExternalLink size={16} />
          Tester les endpoints
        </h3>
        
        <p className="text-sm text-green-700 mb-3">
          Cliquez sur les boutons ci-dessous pour tester chaque endpoint. Une nouvelle fenêtre s'ouvrira avec le résultat.
        </p>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="default" 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => window.open(getApiUrl('/api/ping'), '_blank')}
          >
            Tester /api/ping
          </Button>
          
          <Button 
            variant="default" 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => window.open(getApiUrl('/api/vercel-debug'), '_blank')}
          >
            Tester /api/vercel-debug
          </Button>
          
          <Button 
            variant="default" 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => window.open(getApiUrl('/api/notion-proxy'), '_blank')}
          >
            Tester /api/notion-proxy (GET)
          </Button>
          
          <Button 
            variant="default" 
            className="bg-amber-600 hover:bg-amber-700"
            onClick={testPostRequest}
          >
            Tester /api/notion-proxy (POST)
          </Button>
        </div>
        
        <p className="text-xs text-green-700 mt-4">
          Note: Pour le test POST, le résultat s'affichera dans une alerte. Si le test échoue, consultez 
          la console de développement du navigateur (F12) pour plus de détails sur l'erreur.
        </p>
      </div>
    </div>
  );
};

export default NotionProxyConfigSection;
