
import React, { useState } from 'react';
import { Laptop, Bug, ArrowDownCircle, RefreshCw, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getDeploymentType, enableDeploymentDebugging, disableDeploymentDebugging, isDeploymentDebuggingEnabled, STORAGE_KEYS } from '@/lib/notionProxy/config';
import { toast } from 'sonner';
import { notionApi } from '@/lib/notionProxy';
import NotionConnectionStatus from './NotionConnectionStatus';
import ProxyStatusIndicator from './ProxyStatusIndicator';
import { corsProxy } from '@/services/corsProxy';
import { useOperationMode } from '@/services/operationMode';

/**
 * Panneau de débogage Notion avec outils avancés
 */
const NotionDebugPanel: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [isActive, setIsActive] = useState(isDeploymentDebuggingEnabled());
  const [refreshing, setRefreshing] = useState(false);
  const { isDemoMode } = useOperationMode();
  
  // Déploiement actuel
  const deployment = getDeploymentType();
  
  // Activer/désactiver le débogage
  const toggleDebugging = () => {
    if (isActive) {
      disableDeploymentDebugging();
      setIsActive(false);
      toast.success('Débogage désactivé');
    } else {
      enableDeploymentDebugging();
      setIsActive(true);
      toast.success('Débogage activé');
    }
  };
  
  // Réinitialiser tous les paramètres Notion
  const resetAll = () => {
    if (confirm('Cette action va réinitialiser tous les paramètres Notion et CORS. Continuer?')) {
      // Réinitialiser les paramètres Notion
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Réinitialiser le proxy CORS
      corsProxy.resetProxyCache();
      
      // Réinitialiser le mode mock
      notionApi.mockMode.forceReset();
      
      // Réinitialiser le statut de connexion
      localStorage.removeItem('notion_connection_status');
      
      toast.success('Tous les paramètres ont été réinitialisés', {
        description: 'Veuillez rafraîchir la page pour appliquer les changements'
      });
    }
  };
  
  // Raffraîchir toutes les informations
  const refreshAll = async () => {
    setRefreshing(true);
    
    try {
      // Vérifier le proxy
      await corsProxy.findWorkingProxy('Bearer test_token_for_proxy_test');
      
      toast.success('Informations mises à jour');
    } catch (e) {
      toast.error('Erreur lors de la mise à jour', {
        description: e instanceof Error ? e.message : 'Erreur inconnue'
      });
    } finally {
      setRefreshing(false);
    }
  };
  
  return (
    <div className="border rounded-md overflow-hidden">
      <div 
        className="p-3 bg-gray-100 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Bug size={16} className={isActive ? "text-amber-500" : "text-gray-500"} />
          <h3 className="font-medium">Outils de diagnostic Notion</h3>
        </div>
        <ArrowDownCircle 
          size={16} 
          className={`transition-transform ${expanded ? 'rotate-180' : ''}`} 
        />
      </div>
      
      {expanded && (
        <div className="p-3 border-t space-y-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Laptop size={16} />
                <h4 className="font-medium">Environnement</h4>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={toggleDebugging}
                className={isActive ? 'text-amber-600' : ''}
              >
                {isActive ? 'Désactiver débogage' : 'Activer débogage'}
              </Button>
            </div>
            
            <div className="space-y-2 text-sm">
              <p><strong>Type de déploiement:</strong> {deployment}</p>
              <p><strong>Mode débogage:</strong> {isActive ? 'Activé' : 'Désactivé'}</p>
              <p><strong>Mode opérationnel:</strong> {isDemoMode ? 'Démonstration' : 'Réel'}</p>
              <p><strong>Mode mock Notion:</strong> {notionApi.mockMode.isActive() ? 'Actif' : 'Inactif'}</p>
            </div>
          </div>
          
          <NotionConnectionStatus />
          
          <ProxyStatusIndicator isDemoMode={isDemoMode} />
          
          <Accordion type="single" collapsible>
            <AccordionItem value="storage">
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                <div className="flex items-center gap-2">
                  <Server size={14} />
                  Données stockées
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-xs">
                  {Object.values(STORAGE_KEYS).map(key => {
                    const value = localStorage.getItem(key);
                    let displayValue = value;
                    
                    // Masquer les clés d'API
                    if (key === STORAGE_KEYS.API_KEY && value) {
                      displayValue = value.substring(0, 8) + '...';
                    }
                    
                    return (
                      <div key={key} className="flex flex-col">
                        <span className="font-mono">{key}</span>
                        <span className="bg-gray-50 p-1 rounded break-all">
                          {displayValue || <em className="text-gray-400">non défini</em>}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <div className="flex justify-between gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAll}
              disabled={refreshing}
              className="text-blue-600"
            >
              {refreshing ? (
                <><RefreshCw size={14} className="mr-1 animate-spin" /> Rafraîchissement...</>
              ) : (
                <><RefreshCw size={14} className="mr-1" /> Rafraîchir tout</>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetAll}
              className="text-red-600"
            >
              Réinitialiser tout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotionDebugPanel;
