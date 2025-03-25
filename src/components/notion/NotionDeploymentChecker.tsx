
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, ServerCrash, RefreshCw, Settings, Info } from 'lucide-react';
import { toast } from 'sonner';
import { apiProxy, initializeApiProxy } from '@/services/apiProxy';
import { detectEnvironment } from '@/services/apiProxy/environmentDetector';

const NotionDeploymentChecker: React.FC = () => {
  const [deploymentStatus, setDeploymentStatus] = useState<'checking' | 'deployed' | 'not-deployed'>('checking');
  const [isChecking, setIsChecking] = useState(false);
  const [adapterInfo, setAdapterInfo] = useState<{ name: string; environment: string } | null>(null);
  
  // Vérifier si les fonctions serverless sont déployées
  const checkDeployment = async () => {
    setIsChecking(true);
    
    try {
      // Initialiser le système de proxy s'il ne l'est pas déjà
      await initializeApiProxy({
        debug: process.env.NODE_ENV === 'development',
        timeout: 10000
      });
      
      // Récupérer l'adaptateur actif
      const adapter = apiProxy['getActiveAdapter'] ? 
        apiProxy['getActiveAdapter']() : 
        { name: 'Unknown', environment: 'Unknown' };
      
      setAdapterInfo({
        name: adapter.name || 'Unknown Adapter',
        environment: adapter.environment || 'Unknown Environment'
      });
      
      // Tester si l'adaptateur fonctionne
      try {
        const testResponse = await apiProxy.get('/users/me');
        
        if (testResponse.success || testResponse.error?.status === 401) {
          // Si la réponse est positive ou une erreur 401 (non autorisé), 
          // cela signifie que le proxy est disponible
          setDeploymentStatus('deployed');
          toast.success(`Proxy Notion détecté via ${adapter.name}`, {
            description: `Votre application utilise ${adapter.name} pour communiquer avec l'API Notion`
          });
        } else {
          setDeploymentStatus('not-deployed');
          toast.error('Proxy Notion non disponible', { 
            description: 'Connexion à l\'API impossible avec l\'adaptateur actuel'
          });
        }
      } catch (error) {
        console.error('Erreur lors du test de l\'adaptateur:', error);
        setDeploymentStatus('not-deployed');
        toast.error('Erreur lors du test du proxy', {
          description: error instanceof Error ? error.message : String(error)
        });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du déploiement:', error);
      setDeploymentStatus('not-deployed');
      toast.error('Erreur de vérification', {
        description: 'Impossible de vérifier si le proxy API est disponible'
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
                Vérification du système de proxy
              </h3>
              <p className="text-xs text-blue-700 mt-1">
                Vérification de la disponibilité de l'adaptateur de proxy...
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
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800">
                Proxy API détecté
              </h3>
              <p className="text-xs text-green-700 mt-1">
                {adapterInfo ? 
                  `Utilisation de ${adapterInfo.name} pour l'environnement ${adapterInfo.environment}` : 
                  "Le système de proxy API est correctement configuré."
                }
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkDeployment} 
              className="text-xs text-green-700 border-green-200 hover:bg-green-100"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Vérifier
            </Button>
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
              Proxy API non disponible
            </h3>
            <p className="text-xs text-amber-700 mt-1">
              Pour utiliser l'API Notion sans problème CORS, vous devez déployer l'application sur une plateforme supportée (Netlify, Vercel) ou utiliser le serveur de développement local.
            </p>
            
            <div className="mt-3 flex flex-wrap gap-2">
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
              
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs"
              >
                <Info className="h-3 w-3 mr-2" />
                Détails de l'environnement: {detectEnvironment()}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotionDeploymentChecker;
