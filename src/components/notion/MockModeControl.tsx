
import React from 'react';
import { ToggleLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

/**
 * Composant amélioré pour contrôler le mode mock
 */
const MockModeControl: React.FC = () => {
  const [isMockMode, setIsMockMode] = React.useState(notionApi.mockMode.isActive());
  
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
        ? 'Utilisation de données fictives' 
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
  
  return (
    <div className={`p-4 rounded-md border ${isMockMode 
      ? 'bg-amber-50 border-amber-200 text-amber-800' 
      : 'bg-green-50 border-green-200 text-green-800'}`}>
      <div className="flex items-center gap-2 mb-2">
        <ToggleLeft size={18} className="flex-shrink-0" />
        <h3 className="font-medium flex items-center gap-2">
          Mode de fonctionnement: 
          {isMockMode ? (
            <Badge variant="warning" className="bg-amber-500">DÉMONSTRATION</Badge>
          ) : (
            <Badge variant="success" className="bg-green-600">RÉEL</Badge>
          )}
        </h3>
      </div>
      
      <p className="text-sm mt-1">
        {isMockMode 
          ? 'L\'application utilise des données fictives conformes au Brief v2. Aucune synchronisation avec Notion n\'est active.' 
          : 'L\'application est connectée à Notion et utilise des données réelles.'}
      </p>
      
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
