
import React from 'react';
import { ToggleLeft, AlertCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';

/**
 * Composant pour contrôler le mode mock v2
 */
const MockModeControl: React.FC = () => {
  const [isMockMode, setIsMockMode] = React.useState(notionApi.mockMode.isActive());
  const [scenario, setScenario] = React.useState(notionApi.mockMode.getScenario());
  const [delay, setDelay] = React.useState(notionApi.mockMode.getDelay());
  const [errorRate, setErrorRate] = React.useState(notionApi.mockMode.getErrorRate());
  
  // Observer le changement d'état du mode mock
  React.useEffect(() => {
    const checkMockMode = () => {
      setIsMockMode(notionApi.mockMode.isActive());
      setScenario(notionApi.mockMode.getScenario());
      setDelay(notionApi.mockMode.getDelay());
      setErrorRate(notionApi.mockMode.getErrorRate());
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
  };
  
  // Changer le scénario
  const handleScenarioChange = (value: string) => {
    notionApi.mockMode.setScenario(value);
    setScenario(value);
    toast.info(`Scénario "${value}" activé`, {
      description: 'Les données fictives ont été mises à jour'
    });
  };
  
  // Changer le délai
  const handleDelayChange = (value: number[]) => {
    const newDelay = value[0];
    notionApi.mockMode.setDelay(newDelay);
    setDelay(newDelay);
  };
  
  // Changer le taux d'erreur
  const handleErrorRateChange = (value: number[]) => {
    const newRate = value[0];
    notionApi.mockMode.setErrorRate(newRate);
    setErrorRate(newRate);
  };
  
  return (
    <div className={`p-4 rounded-md border ${isMockMode 
      ? 'bg-amber-50 border-amber-200 text-amber-800' 
      : 'bg-green-50 border-green-200 text-green-800'}`}>
      <h3 className="font-medium flex items-center gap-2">
        <ToggleLeft size={18} />
        Mode de fonctionnement: {isMockMode ? 'DÉMONSTRATION' : 'RÉEL'}
        {isMockMode && <Badge variant="outline" className="ml-2 bg-amber-100">v2</Badge>}
      </h3>
      <p className="text-sm mt-1">
        {isMockMode 
          ? 'L\'application utilise des données fictives. Aucune synchronisation avec Notion n\'est active.' 
          : 'L\'application est connectée à Notion et utilise des données réelles.'}
      </p>
      
      {isMockMode && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="mt-2 bg-amber-100 border-amber-200 text-amber-800 hover:bg-amber-200">
              <Settings size={14} className="mr-1" />
              Configuration
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Options de simulation</h4>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Scénario</label>
                <Select value={scenario} onValueChange={handleScenarioChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un scénario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="empty">Vide</SelectItem>
                    <SelectItem value="error">Erreurs</SelectItem>
                    <SelectItem value="large">Données volumineuses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Délai de réponse</label>
                  <span className="text-xs text-gray-500">{delay} ms</span>
                </div>
                <Slider 
                  value={[delay]} 
                  min={0} 
                  max={3000} 
                  step={100} 
                  onValueChange={handleDelayChange} 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Taux d'erreur</label>
                  <span className="text-xs text-gray-500">{errorRate}%</span>
                </div>
                <Slider 
                  value={[errorRate]} 
                  min={0} 
                  max={100} 
                  step={5} 
                  onValueChange={handleErrorRateChange} 
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
      
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
