
import React, { useState, useEffect } from 'react';
import { Wifi, Server, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { corsProxyService } from '@/lib/notionProxy/corsProxyService';
import { operationMode } from '@/services/operationMode';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

/**
 * Composant amélioré pour afficher le statut du proxy et interagir avec OperationMode
 */
const ProxyStatusIndicator: React.FC = () => {
  const [proxyStatus, setProxyStatus] = useState({
    clientProxy: 'Vérification...',
    serverlessProxy: 'Vérification...'
  });
  const [isChecking, setIsChecking] = useState(false);
  
  // État indiquant si les deux proxies sont en échec
  const bothProxiesFailed = proxyStatus.clientProxy === 'Non disponible' && 
                            proxyStatus.serverlessProxy === 'Non disponible';
  
  // Vérifier le statut des proxies
  const checkProxyStatus = async () => {
    setIsChecking(true);
    
    try {
      // Vérifier le proxy CORS côté client
      const clientProxyWorks = await corsProxyService.findWorkingProxy("test_token");
      
      // Vérifier le proxy serverless
      const serverlessProxyWorks = await corsProxyService.testServerlessProxy("test_token");
      
      // Mettre à jour le statut
      const newStatus = {
        clientProxy: clientProxyWorks ? 'Fonctionnel' : 'Non disponible',
        serverlessProxy: serverlessProxyWorks ? 'Fonctionnel' : 'Non disponible'
      };
      
      setProxyStatus(newStatus);
      
      // Signaler une erreur de connectivité au système operationMode si les deux proxies échouent
      if (!clientProxyWorks && !serverlessProxyWorks) {
        operationMode.handleConnectionError(
          new Error("Aucun proxy n'est disponible"), 
          "Vérification des proxies"
        );
      } else {
        // Sinon, indiquer une opération réussie
        operationMode.handleSuccessfulOperation();
      }
    } catch (error) {
      console.error("Erreur lors de la vérification des proxies:", error);
      // Signaler l'erreur au système de mode opérationnel
      operationMode.handleConnectionError(
        error instanceof Error ? error : new Error(String(error)),
        "Vérification des proxies"
      );
    } finally {
      setIsChecking(false);
    }
  };
  
  // Vérifier au chargement
  useEffect(() => {
    checkProxyStatus();
    
    // Vérification périodique toutes les 5 minutes
    const interval = setInterval(() => {
      checkProxyStatus();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className={`bg-gray-50 p-3 rounded-md border text-sm ${bothProxiesFailed ? 'border-amber-300 bg-amber-50' : ''}`}>
      <h3 className="font-medium mb-2 flex items-center gap-1">
        <Wifi size={14} className={bothProxiesFailed ? "text-amber-500" : "text-blue-500"} />
        Statut des proxies
        
        {bothProxiesFailed && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-700 text-xs">
                  <AlertTriangle size={10} className="mr-1" />
                  Problème de connectivité
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  Aucun proxy n'est disponible.<br/>
                  Le mode démonstration sera utilisé automatiquement.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </h3>
      
      <div className="space-y-1 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Wifi size={12} />
            <span>Proxy CORS:</span>
          </div>
          <span className={proxyStatus.clientProxy === 'Fonctionnel' ? 'text-green-600' : 'text-red-600'}>
            {proxyStatus.clientProxy}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Server size={12} />
            <span>Proxy serverless:</span>
          </div>
          <span className={proxyStatus.serverlessProxy === 'Fonctionnel' ? 'text-green-600' : 'text-red-600'}>
            {proxyStatus.serverlessProxy}
          </span>
        </div>
      </div>
      
      <Button 
        size="sm" 
        variant={bothProxiesFailed ? "secondary" : "outline"}
        className="w-full text-xs h-7" 
        onClick={checkProxyStatus}
        disabled={isChecking}
      >
        {isChecking ? 'Vérification...' : 'Vérifier les proxies'}
      </Button>
    </div>
  );
};

export default ProxyStatusIndicator;
