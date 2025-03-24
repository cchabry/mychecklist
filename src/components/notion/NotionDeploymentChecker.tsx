
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, ServerCrash, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const NotionDeploymentChecker: React.FC = () => {
  const [deploymentStatus, setDeploymentStatus] = useState<'checking' | 'deployed' | 'not-deployed'>('checking');
  const [isChecking, setIsChecking] = useState(false);
  
  // Vérifier si les fonctions serverless sont déployées
  const checkDeployment = async () => {
    setIsChecking(true);
    
    try {
      // Tester si l'API Vercel est disponible
      const vercelResponse = await fetch('/api/ping', { method: 'GET' });
      const vercelWorks = vercelResponse.ok;
      
      if (vercelWorks) {
        setDeploymentStatus('deployed');
        toast.success('Fonctions serverless détectées', {
          description: 'Votre application utilise des fonctions serverless'
        });
      } else {
        setDeploymentStatus('not-deployed');
        toast.error('Fonctions serverless non disponibles', { 
          description: 'Déployez votre application pour utiliser les fonctions serverless'
        });
      }
      
      // Tester si l'API Netlify est disponible
      try {
        const netlifyResponse = await fetch('/.netlify/functions/notion-proxy', { method: 'GET' });
        const netlifyWorks = netlifyResponse.ok;
        
        if (netlifyWorks) {
          setDeploymentStatus('deployed');
          toast.success('Fonctions Netlify détectées', {
            description: 'Votre application utilise des fonctions Netlify'
          });
        }
      } catch (netlifyError) {
        // Ignorer si Vercel fonctionne déjà
        if (deploymentStatus !== 'deployed') {
          console.log('Fonctions Netlify non disponibles:', netlifyError);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du déploiement:', error);
      setDeploymentStatus('not-deployed');
      toast.error('Erreur de vérification', {
        description: 'Impossible de vérifier si les fonctions serverless sont déployées'
      });
    } finally {
      setIsChecking(false);
    }
  };
  
  // Vérifier le déploiement au chargement
  useEffect(() => {
    checkDeployment();
  }, []);
  
  if (deploymentStatus === 'checking' || isChecking) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                Vérification du déploiement
              </h3>
              <p className="text-xs text-blue-700 mt-1">
                Vérification de la disponibilité des fonctions serverless...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (deploymentStatus === 'deployed') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="text-sm font-medium text-green-800">
                Fonctions serverless détectées
              </h3>
              <p className="text-xs text-green-700 mt-1">
                Les fonctions serverless sont correctement déployées. Vous pouvez communiquer avec l'API Notion sans problème CORS.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <ServerCrash className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-amber-800">
              Fonctions serverless non détectées
            </h3>
            <p className="text-xs text-amber-700 mt-1">
              Pour utiliser l'API Notion sans problème CORS, vous devez déployer l'application sur Vercel ou Netlify.
              En environnement de développement, vous pouvez utiliser un proxy CORS.
            </p>
            
            <div className="mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkDeployment}
                disabled={isChecking}
                className="text-xs"
              >
                {isChecking ? (
                  <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-2" />
                )}
                Vérifier à nouveau
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotionDeploymentChecker;
