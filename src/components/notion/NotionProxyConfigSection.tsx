
import React from 'react';
import { Wifi, AlertTriangle, FileCode, Info, ExternalLink, Globe, RefreshCw, ToggleLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotionDeploymentChecker from './NotionDeploymentChecker';
import { findWorkingProxy, PUBLIC_CORS_PROXIES, getSelectedProxy, setSelectedProxy } from '@/lib/notionProxy/config';
import { resetAllProxyCaches } from '@/lib/notionProxy/proxyFetch';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';

const NotionProxyConfigSection: React.FC = () => {
  const [selectedProxy, setSelectedProxyState] = React.useState<string>(getSelectedProxy());
  const [testing, setTesting] = React.useState<string | null>(null);
  const [isMockMode, setIsMockMode] = React.useState<boolean>(notionApi.mockMode.isActive());

  // Observer le changement d'état du mode mock
  React.useEffect(() => {
    const checkMockMode = () => {
      setIsMockMode(notionApi.mockMode.isActive());
    };
    
    // Vérifier tout de suite et à intervalle régulier
    checkMockMode();
    const interval = setInterval(checkMockMode, 1000);
    
    return () => clearInterval(interval);
  }, []);

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
        setSelectedProxy(proxyUrl);
        setSelectedProxyState(proxyUrl);
        toast.success('Proxy testé avec succès', {
          description: `Le proxy ${proxyUrl} fonctionne et a été sélectionné`
        });
        
        // Si le proxy fonctionne et que le mode mock est actif, proposer de le désactiver
        if (notionApi.mockMode.isActive()) {
          toast.info('Le proxy fonctionne', {
            description: 'Voulez-vous désactiver le mode démonstration?',
            action: {
              label: 'Désactiver',
              onClick: () => {
                notionApi.mockMode.deactivate();
                setIsMockMode(false);
              }
            },
            duration: 8000
          });
        }
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
      const bestProxy = await findWorkingProxy();
      
      if (bestProxy) {
        setSelectedProxyState(bestProxy);
        toast.success('Proxy trouvé', {
          description: `Proxy fonctionnel trouvé: ${bestProxy}`
        });
        
        // Si un proxy fonctionnel est trouvé, proposer de désactiver le mode mock
        if (notionApi.mockMode.isActive()) {
          toast.info('Voulez-vous désactiver le mode démonstration?', {
            action: {
              label: 'Désactiver',
              onClick: () => {
                notionApi.mockMode.deactivate();
                setIsMockMode(false);
              }
            },
            duration: 8000
          });
        }
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
    resetAllProxyCaches();
    const defaultProxy = PUBLIC_CORS_PROXIES[1];
    setSelectedProxy(defaultProxy);
    setSelectedProxyState(defaultProxy);
    toast.success('Proxy réinitialisé', {
      description: `Les paramètres du proxy ont été réinitialisés à ${defaultProxy}`
    });
  };

  // Toggle mock mode
  const toggleMockMode = () => {
    const newState = notionApi.mockMode.toggle();
    setIsMockMode(newState);
  };

  return (
    <div className="space-y-4">
      <NotionDeploymentChecker />
      
      {/* Grand indicateur de mode mock */}
      <div className={`p-4 rounded-md border ${isMockMode 
        ? 'bg-amber-100 border-amber-300 text-amber-800' 
        : 'bg-green-100 border-green-300 text-green-800'}`}>
        <h3 className="font-medium flex items-center gap-2">
          <ToggleLeft size={20} />
          Mode de fonctionnement: {isMockMode ? 'DÉMONSTRATION' : 'RÉEL'}
        </h3>
        <p className="text-sm mt-1">
          {isMockMode 
            ? 'L\'application utilise des données fictives. Aucune synchronisation avec Notion n\'est active.' 
            : 'L\'application est connectée à Notion et utilise des données réelles.'}
        </p>
        <div className="mt-3">
          <Button
            variant={isMockMode ? "default" : "destructive"}
            size="sm"
            onClick={toggleMockMode}
            className={isMockMode ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isMockMode ? "Activer le mode réel" : "Activer le mode démonstration"}
          </Button>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
        <h3 className="font-medium mb-3 flex items-center gap-2 text-blue-700">
          <Wifi size={16} />
          Configuration du proxy CORS côté client
        </h3>
        
        <p className="text-sm text-blue-700 mb-3">
          Cette application utilise désormais un proxy CORS côté client pour contourner les limitations CORS
          de l'API Notion, sans nécessiter de fonctions serverless Vercel.
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
              <AlertTriangle size={14} className="mr-2" />
              Réinitialiser les paramètres du proxy
            </Button>
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-blue-800">Proxies CORS disponibles</h4>
          <p className="text-xs text-blue-600">
            Cliquez sur un proxy pour le tester et l'utiliser. Si un proxy ne fonctionne pas, 
            essayez-en un autre.
          </p>
          
          <div className="space-y-2">
            {PUBLIC_CORS_PROXIES.map((proxy, index) => (
              <div key={index} className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`w-full justify-start text-xs ${selectedProxy === proxy ? 'bg-blue-50' : ''}`}
                  onClick={() => testProxy(proxy)}
                  disabled={!!testing}
                >
                  {testing === proxy ? (
                    <RefreshCw size={14} className="mr-2 animate-spin" />
                  ) : (
                    <Wifi size={14} className="mr-2" />
                  )}
                  <span className="font-mono">{proxy}</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 bg-amber-50 p-2 rounded border border-amber-100 text-amber-700 text-xs">
          <div className="flex gap-1 items-start">
            <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Limites des proxies CORS publics</p>
              <ul className="mt-1 pl-4 list-disc text-amber-600 space-y-1">
                <li>Les proxies publics peuvent avoir des limites de débit</li>
                <li>Certains proxies peuvent être temporairement indisponibles</li>
                <li>Pour une utilisation en production, envisagez un proxy privé</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotionProxyConfigSection;
