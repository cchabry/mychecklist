
import React, { useState } from 'react';
import { useOperationMode } from '@/services/operationMode';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Settings2, RefreshCw } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';

/**
 * Composant de configuration complète du système operationMode
 */
const OperationModeSettings: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { settings, updateSettings, reset } = useOperationMode();
  
  const handleReset = () => {
    reset();
    toast.success('Paramètres réinitialisés', {
      description: 'Les paramètres ont été réinitialisés aux valeurs par défaut'
    });
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings2 size={18} className="text-slate-600" />
          Paramètres du mode opérationnel
        </CardTitle>
        <CardDescription>
          Configurez comment l'application gère les modes réel et démonstration
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Comportement général</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-switch" className="text-sm">
                Basculement automatique
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Passer en mode démo en cas d'erreurs répétées
              </p>
            </div>
            <Switch
              id="auto-switch"
              checked={settings.autoSwitchOnFailure}
              onCheckedChange={(checked) => {
                updateSettings({ autoSwitchOnFailure: checked });
              }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="persistent-mode" className="text-sm">
                Persistance du mode
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Conserver le mode entre les sessions
              </p>
            </div>
            <Switch
              id="persistent-mode"
              checked={settings.persistentModeStorage}
              onCheckedChange={(checked) => {
                updateSettings({ persistentModeStorage: checked });
              }}
            />
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Paramètres avancés</h3>
          
          <div className="space-y-2">
            <Label htmlFor="max-failures" className="text-sm">
              Nombre maximum d'échecs consécutifs
            </Label>
            <Input
              id="max-failures"
              type="number"
              min="1"
              max="10"
              value={settings.maxConsecutiveFailures}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value > 0) {
                  updateSettings({ maxConsecutiveFailures: value });
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Nombre d'erreurs successives avant basculement automatique
            </p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm">Taux d'erreurs simulées</Label>
            <div className="flex items-center space-x-2">
              <Slider
                value={[settings.errorSimulationRate]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => {
                  updateSettings({ errorSimulationRate: value[0] });
                }}
              />
              <span className="w-10 text-sm">{settings.errorSimulationRate}%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Probabilité de simuler des erreurs en mode démo
            </p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm">Délai réseau simulé (ms)</Label>
            <div className="flex items-center space-x-2">
              <Slider
                value={[settings.simulatedNetworkDelay]}
                min={0}
                max={2000}
                step={100}
                onValueChange={(value) => {
                  updateSettings({ simulatedNetworkDelay: value[0] });
                }}
              />
              <span className="w-16 text-sm">{settings.simulatedNetworkDelay} ms</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Durée simulée des requêtes en mode démo
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="ml-auto flex items-center gap-1"
        >
          <RefreshCw size={14} />
          Réinitialiser
        </Button>
      </CardFooter>
    </Card>
  );
};

/**
 * Bouton qui ouvre les paramètres dans un panneau latéral
 */
export const OperationModeSettingsButton: React.FC<{
  label?: string;
  side?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ 
  label = 'Paramètres', 
  side = 'right',
  size = 'md',
  className = '' 
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
          className={className}
        >
          <Settings2 size={size === 'sm' ? 14 : 16} className="mr-2" />
          {label}
        </Button>
      </SheetTrigger>
      <SheetContent side={side} className="w-full sm:w-[450px] overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle>Paramètres du mode opérationnel</SheetTitle>
          <SheetDescription>
            Configurez le comportement de l'application avec Notion
          </SheetDescription>
        </SheetHeader>
        
        <OperationModeSettings />
      </SheetContent>
    </Sheet>
  );
};

export default OperationModeSettings;
