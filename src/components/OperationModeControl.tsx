
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOperationMode } from '@/services/operationMode';
import { LucideActivity, Database, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface OperationModeControlProps {
  onToggle?: (isDemoMode: boolean) => void;
  simplified?: boolean;
  showFailures?: boolean;
  showSettings?: boolean;
  className?: string;
}

/**
 * Composant de contrôle du mode de fonctionnement de l'application
 * Permet de basculer entre le mode réel et le mode démo, et de configurer les paramètres
 */
const OperationModeControl: React.FC<OperationModeControlProps> = ({ 
  onToggle,
  simplified = false,
  showFailures = true,
  showSettings = true,
  className = ''
}) => {
  const { 
    isDemoMode,
    isRealMode,
    mode,
    switchReason,
    failures,
    settings,
    toggle,
    enableRealMode,
    updateSettings,
    reset
  } = useOperationMode();
  
  const handleModeToggle = () => {
    toggle(); // La fonction toggle modifie l'état interne
    
    // Après l'appel à toggle(), isDemoMode reflète le nouvel état
    toast(isDemoMode ? 'Mode démonstration activé' : 'Mode réel activé', {
      description: isDemoMode 
        ? 'L\'application utilise maintenant des données simulées' 
        : 'L\'application est maintenant connectée à Notion',
      icon: isDemoMode ? <Database size={16} className="text-blue-500" /> : <Info size={16} className="text-green-500" />
    });
    
    if (onToggle) {
      onToggle(isDemoMode);
    }
  };

  const handleReturnToRealMode = () => {
    if (isDemoMode) {
      enableRealMode();
      toast.success('Mode réel activé', {
        description: 'L\'application est maintenant connectée à Notion'
      });
      
      if (onToggle) {
        onToggle(false);
      }
    }
  };

  const handleReset = () => {
    reset();
    toast.success('Réinitialisation effectuée', {
      description: 'Les paramètres et compteurs d\'erreurs ont été réinitialisés'
    });
  };
  
  // Version simplifiée pour les interfaces moins importantes
  if (simplified) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
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
    <Card className={className}>
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
          
          {/* État actuel */}
          <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-slate-700">Mode actuel:</span>
              <Badge variant="outline" className={`
                ${isRealMode 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-blue-50 text-blue-700 border-blue-200'}
              `}>
                {isRealMode ? 'Notion actif' : 'Démonstration'}
              </Badge>
            </div>
            
            {switchReason && isDemoMode && (
              <div className="text-xs text-amber-700 flex gap-1 items-start mt-2">
                <AlertTriangle size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <span>{switchReason}</span>
              </div>
            )}
          </div>
          
          {/* Affichage des échecs si demandé */}
          {showFailures && failures > 0 && (
            <div className="bg-amber-50 p-3 rounded-md text-xs text-amber-700 border border-amber-200">
              <div className="flex gap-1 items-start">
                <AlertTriangle size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Échecs de connexion:</p>
                  <p>{failures} erreur{failures > 1 ? 's' : ''} consécutive{failures > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          )}
          
          {showSettings && (
            <>
              <Separator className="my-2" />
              
              <div className="space-y-3">
                <Label className="text-xs font-medium text-slate-700">
                  Paramètres
                </Label>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-switch" className="text-xs text-slate-600">
                      Bascule automatique en mode démo
                    </Label>
                    <Switch
                      id="auto-switch"
                      checked={settings.autoSwitchOnFailure}
                      onCheckedChange={(checked) => {
                        updateSettings({ autoSwitchOnFailure: checked });
                      }}
                      className="h-4 w-7"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="persist-mode" className="text-xs text-slate-600">
                      Conserver le mode entre les sessions
                    </Label>
                    <Switch
                      id="persist-mode"
                      checked={settings.persistentModeStorage}
                      onCheckedChange={(checked) => {
                        updateSettings({ persistentModeStorage: checked });
                      }}
                      className="h-4 w-7"
                    />
                  </div>
                  
                  {settings.autoSwitchOnFailure && (
                    <div className="text-xs">
                      <Label htmlFor="switch-threshold" className="text-slate-600">
                        Seuil de basculement (erreurs consécutives)
                      </Label>
                      <Select
                        value={settings.maxConsecutiveFailures.toString()}
                        onValueChange={(value) => {
                          updateSettings({ maxConsecutiveFailures: parseInt(value) });
                        }}
                      >
                        <SelectTrigger id="switch-threshold" className="h-7 mt-1">
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
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {isDemoMode && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleReturnToRealMode}
                    className="text-xs h-7"
                  >
                    <RefreshCw size={12} className="mr-1" />
                    Revenir au mode réel
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleReset}
                  className="text-xs h-7 ml-auto"
                >
                  Réinitialiser
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OperationModeControl;
