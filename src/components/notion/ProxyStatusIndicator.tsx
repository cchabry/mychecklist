
import React, { useState, useEffect } from 'react';
import { Wifi, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { corsProxyService } from '@/lib/notionProxy/corsProxyService';

/**
 * Composant léger pour afficher le statut du proxy
 */
const ProxyStatusIndicator: React.FC = () => {
  const [proxyStatus, setProxyStatus] = useState({
    clientProxy: 'Vérification...',
    serverlessProxy: 'Vérification...'
  });
  const [isChecking, setIsChecking] = useState(false);
  
  // Vérifier le statut des proxies
  const checkProxyStatus = async () => {
    setIsChecking(true);
    
    try {
      // Vérifier le proxy CORS côté client
      const clientProxyWorks = await corsProxyService.findWorkingProxy();
      
      // Vérifier le proxy serverless
      const serverlessProxyWorks = await corsProxyService.testServerlessProxy();
      
      setProxyStatus({
        clientProxy: clientProxyWorks ? 'Fonctionnel' : 'Non disponible',
        serverlessProxy: serverlessProxyWorks ? 'Fonctionnel' : 'Non disponible'
      });
    } catch (error) {
      console.error("Erreur lors de la vérification des proxies:", error);
    } finally {
      setIsChecking(false);
    }
  };
  
  // Vérifier au chargement
  useEffect(() => {
    checkProxyStatus();
  }, []);
  
  return (
    <div className="bg-gray-50 p-3 rounded-md border text-sm">
      <h3 className="font-medium mb-2 flex items-center gap-1">
        <Wifi size={14} className="text-blue-500" />
        Statut des proxies
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
        variant="outline" 
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
