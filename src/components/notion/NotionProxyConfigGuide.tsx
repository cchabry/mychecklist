
import React, { useState } from 'react';
import { Server, FileCode, Info, Github, Settings, ArrowDown, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import NotionDeploymentChecker from './NotionDeploymentChecker';
import { toast } from 'sonner';

const NotionProxyConfigGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);
  
  // Vérifier si nous sommes dans un environnement de développement local
  const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // Déterminer le contexte d'exécution (local, Vercel, Netlify, etc.)
  const getDeploymentContext = () => {
    if (isLocalDev) {
      return 'développement local';
    } else if (window.location.hostname.includes('vercel.app')) {
      return 'Vercel';
    } else if (window.location.hostname.includes('netlify.app')) {
      return 'Netlify';
    } else {
      return 'production';
    }
  };
  
  // Tester un endpoint spécifique
  const testEndpoint = async (endpoint: string, method: 'GET' | 'POST' = 'GET') => {
    setTestingEndpoint(endpoint);
    
    try {
      let response;
      let result;
      
      if (method === 'GET') {
        response = await fetch(`${window.location.origin}${endpoint}`);
        result = await response.text();
      } else if (method === 'POST') {
        response = await fetch(`${window.location.origin}${endpoint}`, {
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
        result = await response.text();
      }
      
      if (response.ok) {
        toast.success(`Test réussi: ${endpoint}`, {
          description: `Statut: ${response.status}. Réponse reçue.`
        });
      } else {
        toast.error(`Erreur ${response.status}: ${endpoint}`, {
          description: `Le endpoint a répondu avec un statut ${response.status}`
        });
      }
    } catch (error) {
      console.error(`Erreur lors du test de ${endpoint}:`, error);
      toast.error(`Échec du test: ${endpoint}`, {
        description: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setTestingEndpoint(null);
    }
  };
  
  return (
    <>
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Server size={16} />
        Guide de configuration du proxy Vercel
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Server size={20} className="text-blue-500" />
              Guide de configuration du proxy Vercel
            </DialogTitle>
            <DialogDescription>
              Instructions pour configurer le proxy Vercel pour l'API Notion
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
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
                {isLocalDev ? (
                  <span className="text-amber-600 font-medium">
                    Attention: Vous êtes en environnement de développement local ({window.location.origin}). 
                    Les fonctions serverless ne fonctionneront pas sans configuration supplémentaire.
                  </span>
                ) : (
                  <span>
                    Vous êtes en environnement {getDeploymentContext()} ({window.location.origin}).
                    Cliquez sur les boutons ci-dessous pour tester chaque endpoint.
                  </span>
                )}
              </p>
              
              <div className="space-y-2 mb-4">
                <p className="text-xs text-amber-600 italic">
                  Note: Les erreurs 404 indiquent que les fonctions serverless ne sont pas correctement déployées ou configurées.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="default" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => testEndpoint('/api/ping')}
                  disabled={testingEndpoint === '/api/ping'}
                >
                  {testingEndpoint === '/api/ping' ? (
                    <><Loader2 size={14} className="mr-2 animate-spin" /> Test en cours...</>
                  ) : (
                    <>Tester /api/ping</>
                  )}
                </Button>
                
                <Button 
                  variant="default" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => testEndpoint('/api/vercel-debug')}
                  disabled={testingEndpoint === '/api/vercel-debug'}
                >
                  {testingEndpoint === '/api/vercel-debug' ? (
                    <><Loader2 size={14} className="mr-2 animate-spin" /> Test en cours...</>
                  ) : (
                    <>Tester /api/vercel-debug</>
                  )}
                </Button>
                
                <Button 
                  variant="default" 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => testEndpoint('/api/notion-proxy')}
                  disabled={testingEndpoint === '/api/notion-proxy'}
                >
                  {testingEndpoint === '/api/notion-proxy' ? (
                    <><Loader2 size={14} className="mr-2 animate-spin" /> Test en cours...</>
                  ) : (
                    <>Tester /api/notion-proxy (GET)</>
                  )}
                </Button>
                
                <Button 
                  variant="default" 
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={() => testEndpoint('/api/notion-proxy', 'POST')}
                  disabled={testingEndpoint === '/api/notion-proxy-post'}
                >
                  {testingEndpoint === '/api/notion-proxy-post' ? (
                    <><Loader2 size={14} className="mr-2 animate-spin" /> Test en cours...</>
                  ) : (
                    <>Tester /api/notion-proxy (POST)</>
                  )}
                </Button>
              </div>
              
              <div className="mt-4 p-3 bg-white rounded-md border border-green-200">
                <h4 className="text-sm font-medium mb-2 text-green-700">Comment ajouter ces APIs à votre projet</h4>
                <p className="text-xs text-gray-600 mb-2">
                  Si vous obtenez des erreurs 404, vous devez ajouter ces fichiers à votre projet dans le dossier <code className="bg-gray-100 px-1 rounded">api/</code> à la racine.
                </p>
                
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">
                    <strong>1. Créez un dossier <code className="bg-gray-100 px-1 rounded">api</code> à la racine du projet</strong>
                  </p>
                  <p className="text-xs text-gray-600">
                    <strong>2. Créez les fichiers suivants à l'intérieur:</strong>
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc pl-5">
                    <li><code className="bg-gray-100 px-1 rounded">api/ping.ts</code></li>
                    <li><code className="bg-gray-100 px-1 rounded">api/vercel-debug.ts</code></li>
                    <li><code className="bg-gray-100 px-1 rounded">api/notion-proxy.ts</code></li>
                  </ul>
                  <p className="text-xs text-gray-600">
                    <strong>3. Ajoutez le fichier <code className="bg-gray-100 px-1 rounded">vercel.json</code> à la racine du projet</strong>
                  </p>
                  <p className="text-xs text-gray-600">
                    <strong>4. Déployez les changements sur Vercel</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotionProxyConfigGuide;
