
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useOperationMode } from '@/services/operationMode';

interface OperationModeSettingsProps {
  className?: string;
}

/**
 * Composant permettant de configurer les paramètres du mode opérationnel
 */
const OperationModeSettings: React.FC<OperationModeSettingsProps> = ({ className = "" }) => {
  const { 
    isDemoMode, 
    errorRate, 
    networkDelay, 
    setErrorRate, 
    setNetworkDelay, 
    toggle 
  } = useOperationMode();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Paramètres du mode opérationnel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="mode-toggle" className="font-medium">Mode démonstration</Label>
          <Switch 
            id="mode-toggle" 
            checked={isDemoMode} 
            onCheckedChange={toggle}
          />
        </div>
        
        <div className="space-y-3">
          <div>
            <Label className="font-medium">Taux d'erreur simulé: {errorRate}%</Label>
            <Slider 
              value={[errorRate]} 
              onValueChange={values => setErrorRate(values[0])}
              disabled={!isDemoMode}
              step={5}
              min={0}
              max={100}
              className="mt-2"
            />
          </div>
          
          <div>
            <Label className="font-medium">Délai réseau simulé: {networkDelay}ms</Label>
            <Slider 
              value={[networkDelay]} 
              onValueChange={values => setNetworkDelay(values[0])}
              disabled={!isDemoMode}
              step={100}
              min={0}
              max={3000}
              className="mt-2"
            />
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggle}
          className="w-full mt-4"
        >
          {isDemoMode ? "Passer en mode réel" : "Passer en mode démonstration"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default OperationModeSettings;
