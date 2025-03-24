
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useOperationMode } from '@/services/operationMode';

interface OperationModeSettingsPanelProps {
  compact?: boolean;
}

/**
 * Panneau de configuration du mode opérationnel
 */
const OperationModeSettingsPanel: React.FC<OperationModeSettingsPanelProps> = ({ 
  compact = false 
}) => {
  const { settings, updateSettings } = useOperationMode();
  
  return (
    <div className="space-y-3">
      <Label className={compact ? "text-xs font-medium text-slate-700" : ""}>
        {compact ? "Paramètres" : "Configuration du mode opérationnel"}
      </Label>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-switch" className={compact ? "text-xs text-slate-600" : ""}>
            Bascule automatique en mode démo
          </Label>
          <Switch
            id="auto-switch"
            checked={settings.autoSwitchOnFailure}
            onCheckedChange={(checked) => {
              updateSettings({ autoSwitchOnFailure: checked });
            }}
            className={compact ? "h-4 w-7" : ""}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="persist-mode" className={compact ? "text-xs text-slate-600" : ""}>
            Conserver le mode entre les sessions
          </Label>
          <Switch
            id="persist-mode"
            checked={settings.persistentModeStorage}
            onCheckedChange={(checked) => {
              updateSettings({ persistentModeStorage: checked });
            }}
            className={compact ? "h-4 w-7" : ""}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="show-notifications" className={compact ? "text-xs text-slate-600" : ""}>
            Afficher les notifications de mode
          </Label>
          <Switch
            id="show-notifications"
            checked={settings.showNotifications}
            onCheckedChange={(checked) => {
              updateSettings({ showNotifications: checked });
            }}
            className={compact ? "h-4 w-7" : ""}
          />
        </div>
        
        {settings.autoSwitchOnFailure && (
          <div className={compact ? "text-xs" : ""}>
            <Label htmlFor="switch-threshold" className={compact ? "text-slate-600" : ""}>
              Seuil de basculement (erreurs consécutives)
            </Label>
            <Select
              value={settings.maxConsecutiveFailures.toString()}
              onValueChange={(value) => {
                updateSettings({ maxConsecutiveFailures: parseInt(value) });
              }}
            >
              <SelectTrigger id="switch-threshold" className={compact ? "h-7 mt-1" : "mt-1"}>
                <SelectValue placeholder="Seuil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 erreur</SelectItem>
                <SelectItem value="2">2 erreurs</SelectItem>
                <SelectItem value="3">3 erreurs</SelectItem>
                <SelectItem value="5">5 erreurs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {!compact && (
          <>
            <Separator className="my-2" />
            
            <div className="flex items-center justify-between">
              <Label htmlFor="error-rate" className="text-slate-600">
                Taux d'erreurs simulées en mode démo
              </Label>
              <Select
                value={settings.errorSimulationRate.toString()}
                onValueChange={(value) => {
                  updateSettings({ errorSimulationRate: parseInt(value) });
                }}
              >
                <SelectTrigger id="error-rate" className="w-32">
                  <SelectValue placeholder="Taux" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0%</SelectItem>
                  <SelectItem value="5">5%</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="network-delay" className="text-slate-600">
                Délai réseau simulé (ms)
              </Label>
              <Select
                value={settings.simulatedNetworkDelay.toString()}
                onValueChange={(value) => {
                  updateSettings({ simulatedNetworkDelay: parseInt(value) });
                }}
              >
                <SelectTrigger id="network-delay" className="w-32">
                  <SelectValue placeholder="Délai" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 ms</SelectItem>
                  <SelectItem value="200">200 ms</SelectItem>
                  <SelectItem value="500">500 ms</SelectItem>
                  <SelectItem value="1000">1000 ms</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OperationModeSettingsPanel;
