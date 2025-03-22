
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOperationMode } from '@/services/operationMode';
import { LucideActivity, Database, AlertTriangle, Info } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface OperationModeControlProps {
  onToggle?: (isDemoMode: boolean) => void;
  simplified?: boolean;
}

/**
 * Composant de contrôle du mode de fonctionnement de l'application
 */
const OperationModeControl: React.FC<OperationModeControlProps> = ({ 
  onToggle,
  simplified = false 
}) => {
  const { 
    isDemoMode,
    isRealMode,
    mode,
    switchReason,
    failures,
    toggle,
    updateSettings,
    settings
  } = useOperationMode();
  
  const handleModeToggle = (newState: boolean) => {
    toggle(); // La fonction toggle ne retourne pas directement un boolean mais modifie l'état interne
    const isDemoNow = isDemoMode; // Après l'appel à toggle(), isDemoMode reflète le nouvel état
    
    toast(isDemoNow ? 'Mode démonstration activé' : 'Mode réel activé', {
      description: isDemoNow 
        ? 'L\'application utilise maintenant des données simulées' 
        : 'L\'application est maintenant connectée à Notion',
      icon: isDemoNow ? <Database size={16} className="text-blue-500" /> : <Info size={16} className="text-green-500" />
    });
    
    if (onToggle) {
      onToggle(isDemoNow);
    }
  };
  
  // Version simplifiée pour les interfaces moins importantes
  if (simplified) {
    return (
      <div className="flex items-center space-x-2">
        <Switch
          id="demo-mode"
          checked={isDemoMode}
          onCheckedChange={handleModeToggle}
        />
        <Label htmlFor="demo-mode" className="text-sm">
          {isDemoMode ? "Mode démonstration actif" : "Mode réel actif"}
        </Label>
      </div>
    );
  }
  
  // Version complète avec tous les contrôles
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <LucideActivity size={16} className="text-blue-600" />
          Mode de fonctionnement
        </CardTitle>
        <CardDescription>
          Contrôlez comment l'application interagit avec Notion
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="mode-toggle" className="text-sm font-medium">
                Mode démonstration
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Utilise des données simulées au lieu de Notion
              </p>
            </div>
            <Switch
              id="mode-toggle"
              checked={isDemoMode}
              onCheckedChange={handleModeToggle}
            />
          </div>
          
          {switchReason && isDemoMode && (
            <div className="bg-amber-50 p-3 rounded-md text-xs text-amber-700 border border-amber-200 mt-2">
              <div className="flex gap-2 items-start">
                <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Raison du basculement:</p>
                  <p>{switchReason}</p>
                </div>
              </div>
            </div>
          )}
          
          <Separator className="my-3" />
          
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Paramètres
            </Label>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-switch" className="text-xs text-muted-foreground">
                  Bascule automatique en mode démo
                </Label>
                <Switch
                  id="auto-switch"
                  checked={settings.autoSwitchOnFailure}
                  onCheckedChange={(checked) => {
                    updateSettings({ autoSwitchOnFailure: checked });
                    toast.info(
                      checked 
                        ? 'Bascule automatique activée' 
                        : 'Bascule automatique désactivée'
                    );
                  }}
                  className="h-4 w-7" // Alternative à la prop "size" qui n'existe pas
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="persist-mode" className="text-xs text-muted-foreground">
                  Conserver le mode entre les sessions
                </Label>
                <Switch
                  id="persist-mode"
                  checked={settings.persistentModeStorage}
                  onCheckedChange={(checked) => {
                    updateSettings({ persistentModeStorage: checked });
                  }}
                  className="h-4 w-7" // Alternative à la prop "size" qui n'existe pas
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show-notifs" className="text-xs text-muted-foreground">
                  Afficher les notifications
                </Label>
                <Switch
                  id="show-notifs"
                  checked={true}
                  onCheckedChange={(checked) => {
                    // Garde pour plus tard lorsque nous ajouterons cette option
                  }}
                  className="h-4 w-7" // Alternative à la prop "size" qui n'existe pas
                />
              </div>
            </div>
            
            <div className="text-xs">
              <Label htmlFor="switch-threshold" className="text-muted-foreground">
                Seuil de basculement (erreurs consécutives)
              </Label>
              <Select
                value={settings.maxConsecutiveFailures.toString()}
                onValueChange={(value) => {
                  updateSettings({ maxConsecutiveFailures: parseInt(value) });
                }}
              >
                <SelectTrigger id="switch-threshold" className="h-8 mt-1">
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OperationModeControl;
