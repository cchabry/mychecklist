
import React from 'react';
import { ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { corsProxy } from '@/services/corsProxy';

/**
 * Guide pour activer CORS-Anywhere
 * Ce composant explique comment activer le proxy CORS-Anywhere et vérifie son état
 */
const CorsAnywhereGuide: React.FC = () => {
  const [isActivated, setIsActivated] = React.useState<boolean | null>(null);
  const [isChecking, setIsChecking] = React.useState(false);
  
  // Vérifier l'activation de CORS-Anywhere
  const checkActivation = async () => {
    setIsChecking(true);
    
    try {
      // Utiliser un proxy spécifique pour le test
      const corsAnywhereProxy = corsProxy.getAvailableProxies().find(p => 
        p.url.includes('cors-anywhere.herokuapp.com')
      );
      
      if (!corsAnywhereProxy) {
        setIsActivated(false);
        return;
      }
      
      // Tester le proxy
      const result = await corsProxy.testProxy(corsAnywhereProxy);
      setIsActivated(result.success);
    } catch (error) {
      console.error('Erreur lors de la vérification de CORS-Anywhere:', error);
      setIsActivated(false);
    } finally {
      setIsChecking(false);
    }
  };
  
  // Vérifier l'activation au chargement
  React.useEffect(() => {
    checkActivation();
  }, []);
  
  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm space-y-3">
      <h3 className="text-lg font-medium">Activation de CORS-Anywhere</h3>
      
      <p className="text-sm text-gray-600">
        CORS-Anywhere est un service qui permet de contourner les limitations CORS. Pour l'utiliser, vous devez l'activer explicitement.
      </p>
      
      <div className="flex items-center gap-2 my-3">
        <span className="text-sm font-medium">Statut:</span>
        {isChecking ? (
          <span className="text-sm text-blue-500 flex items-center">
            <span className="animate-spin mr-2">⟳</span> Vérification...
          </span>
        ) : isActivated === true ? (
          <span className="text-sm text-green-500 flex items-center">
            <CheckCircle2 size={16} className="mr-1" /> Activé
          </span>
        ) : isActivated === false ? (
          <span className="text-sm text-red-500 flex items-center">
            <XCircle size={16} className="mr-1" /> Non activé
          </span>
        ) : (
          <span className="text-sm text-gray-500">Inconnu</span>
        )}
      </div>
      
      {isActivated === false && (
        <Alert variant="warning">
          <AlertTitle>Activation requise</AlertTitle>
          <AlertDescription>
            Pour utiliser CORS-Anywhere, vous devez l'activer explicitement en visitant le lien ci-dessous et en cliquant sur "Request temporary access to the demo server".
          </AlertDescription>
          
          <div className="mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              asChild
            >
              <a 
                href="https://cors-anywhere.herokuapp.com/corsdemo" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Activer CORS-Anywhere <ExternalLink size={14} />
              </a>
            </Button>
          </div>
        </Alert>
      )}
      
      <div className="flex justify-between mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={checkActivation}
          disabled={isChecking}
        >
          {isChecking ? 'Vérification...' : 'Vérifier l\'activation'}
        </Button>
        
        {isActivated && (
          <span className="text-xs text-green-600">
            L'accès temporaire à CORS-Anywhere est valide pour plusieurs heures
          </span>
        )}
      </div>
    </div>
  );
};

export default CorsAnywhereGuide;
