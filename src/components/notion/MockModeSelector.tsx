
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import { Info } from 'lucide-react';

/**
 * Composant permettant de basculer entre les différentes versions du mode mock
 */
const MockModeSelector: React.FC = () => {
  const [activeMode, setActiveMode] = React.useState(() => {
    if (notionApi.mockModeV2.isActive()) return 'v2';
    if (notionApi.mockMode.isActive()) return 'v1';
    return 'real';
  });

  const handleModeChange = (value: string) => {
    // Désactiver tous les modes mock d'abord
    notionApi.mockMode.deactivate();
    notionApi.mockModeV2.deactivate();
    
    // Activer le mode sélectionné
    if (value === 'v1') {
      notionApi.mockMode.activate();
      toast.info('Mode démo v1 activé', {
        description: 'Utilisation des données fictives (version originale)'
      });
    } else if (value === 'v2') {
      notionApi.mockModeV2.activate();
      toast.info('Mode démo v2 activé', {
        description: 'Utilisation des données fictives (conforme au Brief v2)'
      });
    } else {
      toast.success('Mode réel activé', {
        description: 'Connexion aux données réelles de Notion'
      });
    }
    
    setActiveMode(value);
    
    // Rafraîchir la page après un court délai
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <div className="flex items-center gap-2 mb-2">
        <Info size={16} className="text-blue-500" />
        <h3 className="font-medium text-sm">Mode de fonctionnement</h3>
      </div>
      
      <Tabs value={activeMode} onValueChange={handleModeChange} className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="real" className="text-xs">
            Réel
          </TabsTrigger>
          <TabsTrigger value="v1" className="text-xs">
            Démo v1
          </TabsTrigger>
          <TabsTrigger value="v2" className="text-xs">
            Démo v2
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <p className="mt-2 text-xs text-gray-600">
        {activeMode === 'v1' && 'Utilise des données fictives (version originale) pour tester l\'application sans API Notion.'}
        {activeMode === 'v2' && 'Utilise des données fictives conformes au Brief v2 avec le modèle de données complet.'}
        {activeMode === 'real' && 'Connecté à l\'API Notion réelle pour utiliser des données de production.'}
      </p>
    </div>
  );
};

export default MockModeSelector;
