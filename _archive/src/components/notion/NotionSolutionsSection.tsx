
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Database, Key, Globe, Code, ServerCrash } from 'lucide-react';
import { operationMode } from '@/services/operationMode';
import { toast } from 'sonner';
import NotionDeploymentChecker from './NotionDeploymentChecker';
import ProxyStatusIndicator from './ProxyStatusIndicator';

interface NotionSolutionsSectionProps {
  showApiKey?: boolean;
  showCorsProxy?: boolean;
  showMockMode?: boolean;
}

const NotionSolutionsSection: React.FC<NotionSolutionsSectionProps> = ({ 
  showApiKey = true, 
  showCorsProxy = true,
  showMockMode = false
}) => {
  // Activer le mode démo
  const handleEnableDemoMode = () => {
    operationMode.enableDemoMode('Mode démo activé manuellement pour contourner les problèmes de connexion');
    toast.success('Mode démonstration activé', {
      description: 'L\'application utilise maintenant des données fictives pour fonctionner sans Notion'
    });
    // Recharger la page après un court délai
    setTimeout(() => window.location.reload(), 1000);
  };

  // Récupérer l'état du mode démo
  const isDemoMode = operationMode.isDemoMode;
  
  return (
    <div className="space-y-4">
      {/* Vérificateur de déploiement */}
      {showCorsProxy && <NotionDeploymentChecker />}
      
      {/* Indicateur de statut du proxy */}
      {showCorsProxy && <ProxyStatusIndicator isDemoMode={isDemoMode} />}
      
      {showApiKey && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg mb-1">Problème de clé API</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Si vous rencontrez des erreurs d'authentification, vérifiez les points suivants :
                </p>
                <ul className="text-sm text-muted-foreground list-disc pl-5 mb-3 space-y-1">
                  <li>Pour une clé d'intégration: commence par "secret_"</li>
                  <li>Pour un token OAuth: commence par "ntn_"</li>
                  <li>L'intégration a été correctement configurée dans Notion</li>
                  <li>Les permissions sont suffisantes (lecture et écriture)</li>
                  <li>L'intégration a été partagée avec vos bases de données</li>
                </ul>
                <a 
                  href="https://developers.notion.com/docs/create-a-notion-integration" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Voir la documentation Notion sur les intégrations
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {showCorsProxy && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <ServerCrash className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg mb-1">Problème de serveur</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  En environnement de développement, vous avez deux options pour communiquer avec l'API Notion :
                </p>
                <ul className="text-sm text-muted-foreground list-disc pl-5 mb-3 space-y-1">
                  <li>Déployer votre application sur Vercel ou Netlify</li>
                  <li>Utiliser un proxy CORS côté client (moins fiable)</li>
                  <li>Activer le mode démo pour tester sans API Notion</li>
                </ul>
                
                <div className="flex flex-wrap gap-2">
                  <a 
                    href="https://vercel.com/new" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      Déployer sur Vercel
                    </Button>
                  </a>
                  <a 
                    href="https://app.netlify.com/start" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      Déployer sur Netlify
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {showMockMode && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg mb-1">Utiliser le mode démo</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Si vous ne pouvez pas résoudre les problèmes de connexion à Notion, vous pouvez utiliser 
                  le mode démo pour tester l'application avec des données fictives.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleEnableDemoMode}
                  className="gap-2"
                  disabled={isDemoMode}
                >
                  <Code className="h-4 w-4" />
                  {isDemoMode ? "Mode démo déjà actif" : "Activer le mode démo"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotionSolutionsSection;
