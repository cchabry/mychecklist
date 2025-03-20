
import React from 'react';
import { ToggleLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';

/**
 * Composant simplifié pour contrôler le mode mock
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
    if (isMockMode) {
      notionApi.mockMode.deactivate();
      setIsMockMode(false);
      toast.success('Mode réel activé', {
        description: 'Connexion aux données réelles de Notion'
      });
    } else {
      notionApi.mockMode.activateV2(); // Utiliser V2 par défaut
      setIsMockMode(true);
      toast.success('Mode démonstration activé', {
        description: 'Utilisation de données fictives'
      });
    }
    
    // Rafraîchir la page après un délai
    setTimeout(() => window.location.reload(), 500);
  };
  
  return (
    <div className={`p-4 rounded-md border ${isMockMode 
      ? 'bg-amber-50 border-amber-200 text-amber-800' 
      : 'bg-green-50 border-green-200 text-green-800'}`}>
      <h3 className="font-medium flex items-center gap-2">
        <ToggleLeft size={18} />
        Mode de fonctionnement: {isMockMode ? 'DÉMONSTRATION' : 'RÉEL'}
      </h3>
      <p className="text-sm mt-1">
        {isMockMode 
          ? 'L\'application utilise des données fictives. Aucune synchronisation avec Notion n\'est active.' 
          : 'L\'application est connectée à Notion et utilise des données réelles.'}
      </p>
      <div className="mt-3">
        <Button
          variant={isMockMode ? "default" : "outline"}
          size="sm"
          onClick={toggleMockMode}
          className={isMockMode ? "bg-green-600 hover:bg-green-700" : "text-red-600 border-red-200 hover:bg-red-50"}
        >
          {isMockMode ? "Activer le mode réel" : "Activer le mode démonstration"}
        </Button>
      </div>
    </div>
  );
};

export default MockModeControl;
