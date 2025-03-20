
import React from 'react';
import { ToggleLeft, AlertCircle, RefreshCw, DatabaseBackup, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Composant amélioré pour contrôler le mode mock - Version Brief v2
 */
const MockModeControl: React.FC = () => {
  const [isMockMode, setIsMockMode] = React.useState(notionApi.mockMode.isActive());
  const [scenarioType, setScenarioType] = React.useState<string>("standard");
  
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
  
  // Basculer le mode mock
  const toggleMockMode = () => {
    const newState = notionApi.mockMode.toggle();
    setIsMockMode(newState);
    
    toast.success(newState ? 'Mode démonstration activé' : 'Mode réel activé', {
      description: newState 
        ? 'Utilisation de données fictives (Brief v2)' 
        : 'Connexion aux données réelles de Notion'
    });
    
    // Forcer la réinitialisation des caches
    localStorage.removeItem('projects_cache');
    localStorage.removeItem('audit_cache');
    
    // Rafraîchir la page après un court délai pour appliquer les changements
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };
  
  const resetMockState = () => {
    notionApi.mockMode.reset();
    
    toast.info('Configuration réinitialisée', {
      description: 'Les paramètres du mode démo ont été réinitialisés'
    });
    
    // Forcer la réinitialisation des caches
    localStorage.removeItem('projects_cache');
    localStorage.removeItem('audit_cache');
    
    // Rafraîchir la page après un court délai
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  // Nouvelle fonction: changer de scénario de test
  const changeScenario = (value: string) => {
    setScenarioType(value);
    localStorage.setItem('notion_mock_scenario', value);
    
    toast.info(`Scénario "${value}" activé`, {
      description: 'Les données de démonstration ont été mises à jour'
    });
    
    // Forcer la réinitialisation des caches
    localStorage.removeItem('projects_cache');
    localStorage.removeItem('audit_cache');
    
    // Rafraîchir la page après un court délai
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };
  
  // Nouvelle fonction: simuler un long chargement
  const simulateLoadingDelay = () => {
    toast.info('Simulation de délai de chargement', {
      description: 'Les prochaines requêtes seront ralenties pendant 30 secondes'
    });
    
    localStorage.setItem('notion_mock_loading_delay', 'true');
    localStorage.setItem('notion_mock_loading_until', (Date.now() + 30000).toString());
    
    // Rafraîchir la page pour appliquer le délai
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };
  
  return (
    <div className={`p-4 rounded-md border ${isMockMode 
      ? 'bg-amber-50 border-amber-200 text-amber-800' 
      : 'bg-green-50 border-green-200 text-green-800'}`}>
      <div className="flex items-center gap-2 mb-2">
        <ToggleLeft size={18} className="flex-shrink-0" />
        <h3 className="font-medium flex items-center gap-2">
          Mode de fonctionnement: 
          {isMockMode ? (
            <Badge variant="outline" className="bg-amber-500 text-white border-amber-600">
              DÉMONSTRATION
              <span className="ml-1 text-xs bg-amber-600 px-1 rounded">v2</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-green-600 text-white border-green-700">RÉEL</Badge>
          )}
        </h3>
      </div>
      
      <p className="text-sm mt-1">
        {isMockMode 
          ? 'L\'application utilise des données fictives conformes au Brief v2. Aucune synchronisation avec Notion n\'est active.' 
          : 'L\'application est connectée à Notion et utilise des données réelles.'}
      </p>
      
      {isMockMode && (
        <div className="mt-3 border-t border-amber-200 pt-3">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <label className="text-sm font-medium">Scénario :</label>
            <Select value={scenarioType} onValueChange={changeScenario}>
              <SelectTrigger className="w-[180px] h-8 text-sm bg-white border-amber-200">
                <SelectValue placeholder="Sélectionner un scénario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="empty">Données vides</SelectItem>
                <SelectItem value="error">Erreurs API</SelectItem>
                <SelectItem value="large">Grand volume</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={simulateLoadingDelay}
                    className="text-amber-600 border-amber-200 hover:bg-amber-100"
                  >
                    <ArrowUpDown size={14} className="mr-1" />
                    Simulation délai
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Simule un délai de chargement des données (30s)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={resetMockState}
                    className="text-amber-600 border-amber-200 hover:bg-amber-100"
                  >
                    <DatabaseBackup size={14} className="mr-1" />
                    Réinitialiser cache
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Réinitialise les caches et paramètres de démo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}
      
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant={isMockMode ? "default" : "outline"}
          size="sm"
          onClick={toggleMockMode}
          className={isMockMode ? "bg-green-600 hover:bg-green-700" : "text-amber-600 border-amber-200 hover:bg-amber-50"}
        >
          {isMockMode ? "Activer le mode réel" : "Activer le mode démonstration"}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={resetMockState}
          className="text-gray-500 flex items-center gap-1"
        >
          <RefreshCw size={14} />
          Réinitialiser
        </Button>
      </div>
    </div>
  );
};

export default MockModeControl;
