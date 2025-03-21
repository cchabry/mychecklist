
import React from 'react';
import { Wifi, Globe, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotionDeploymentChecker from './NotionDeploymentChecker';
import { PUBLIC_CORS_PROXIES } from '@/lib/notionProxy/config';
import { corsProxyService } from '@/lib/notionProxy/corsProxyService';
import { toast } from 'sonner';
import MockModeControl from './MockModeControl';
import ProxyStatusIndicator from './ProxyStatusIndicator';

const NotionProxyConfigSection: React.FC = () => {
  const [selectedProxy, setSelectedProxyState] = React.useState<string>(() => {
    const proxy = corsProxyService.getSelectedProxy();
    return proxy ? proxy.url : PUBLIC_CORS_PROXIES[0];
  });
  const [testing, setTesting] = React.useState<string | null>(null);

  // Test a specific proxy
  const testProxy = async (proxyUrl: string) => {
    setTesting(proxyUrl);
    try {
      const testUrl = `${proxyUrl}${encodeURIComponent('https://api.notion.com/v1/users/me')}`;
      
      const response = await fetch(testUrl, {
        method: 'HEAD',
        headers: {
          'Authorization': 'Bearer test_token',
          'Notion-Version': '2022-06-28'
        }
      });
      
      // Even a 401 is good - it means we reached Notion's API
      const isWorking = response.status !== 0 && response.status !== 404;
      
      if (isWorking) {
        corsProxyService.setSelectedProxy(proxyUrl);
        setSelectedProxyState(proxyUrl);
        toast.success('Proxy testé avec succès', {
          description: `Le proxy ${proxyUrl} fonctionne et a été sélectionné`
        });
      } else {
        toast.error('Test échoué', {
          description: `Le proxy n'a pas pu contacter l'API Notion (statut: ${response.status})`
        });
      }
    } catch (error) {
      toast.error('Erreur de test', {
        description: error.message
      });
    }
    setTesting(null);
  };

  // Find the best working proxy automatically
  const findBestProxy = async () => {
    setTesting('auto');
    try {
      // Ajout du token de test comme argument
      const bestProxy = await corsProxyService.findWorkingProxy("test_token");
      
      if (bestProxy) {
        setSelectedProxyState(bestProxy.url);
        toast.success('Proxy trouvé', {
          description: `Proxy fonctionnel trouvé: ${bestProxy.url}`
        });
      } else {
        toast.error('Aucun proxy fonctionnel', {
          description: 'Aucun proxy n\'a pu être trouvé. Essayez plus tard ou choisissez-en un manuellement.'
        });
      }
    } catch (error) {
      toast.error('Erreur de recherche', {
        description: error.message
      });
    }
    setTesting(null);
  };

  // Reset all proxy settings
  const resetProxy = () => {
    corsProxyService.resetProxyCache();
    const defaultProxy = PUBLIC_CORS_PROXIES[0];
    corsProxyService.setSelectedProxy(defaultProxy);
    setSelectedProxyState(defaultProxy);
    toast.success('Proxy réinitialisé', {
      description: `Les paramètres du proxy ont été réinitialisés à ${defaultProxy}`
    });
  };

  return (
    <div className="space-y-4">
      <NotionDeploymentChecker />
      
      {/* Contrôle du mode mock */}
      <MockModeControl />
      
      {/* Indicateur de statut du proxy */}
      <ProxyStatusIndicator />
      
      <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
        <h3 className="font-medium mb-3 flex items-center gap-2 text-blue-700">
          <Wifi size={16} />
          Configuration du proxy CORS côté client
        </h3>
        
        <p className="text-sm text-blue-700 mb-3">
          Cette application utilise un proxy CORS côté client pour contourner les limitations CORS
          de l'API Notion.
        </p>
        
        <div className="bg-white p-3 rounded-md border border-blue-100 mb-4">
          <h4 className="font-medium text-sm mb-2 text-blue-800">Proxy CORS actuel</h4>
          <div className="text-xs bg-gray-50 p-2 rounded border text-gray-700 font-mono break-all">
            {selectedProxy || 'Aucun proxy sélectionné'}
          </div>
          
          <div className="mt-3 space-y-2">
            <Button 
              variant="outline" 
              size="sm"
              className="w-full justify-start"
              onClick={findBestProxy}
              disabled={!!testing}
            >
              {testing === 'auto' ? (
                <RefreshCw size={14} className="mr-2 animate-spin" />
              ) : (
                <Globe size={14} className="mr-2" />
              )}
              Trouver automatiquement le meilleur proxy
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="w-full justify-start text-amber-600"
              onClick={resetProxy}
              disabled={!!testing}
            >
              <RefreshCw size={14} className="mr-2" />
              Réinitialiser les paramètres du proxy
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-blue-800">Proxies CORS disponibles</h4>
          
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {PUBLIC_CORS_PROXIES.map((proxy, index) => (
              <Button 
                key={index}
                variant="ghost" 
                size="sm"
                className={`justify-start text-xs truncate ${selectedProxy === proxy ? 'bg-blue-50' : ''}`}
                onClick={() => testProxy(proxy)}
                disabled={!!testing}
              >
                {testing === proxy ? (
                  <RefreshCw size={14} className="mr-2 animate-spin flex-shrink-0" />
                ) : (
                  <Wifi size={14} className="mr-2 flex-shrink-0" />
                )}
                <span className="font-mono truncate">{proxy}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotionProxyConfigSection;
