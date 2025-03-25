
import React, { useState } from 'react';
import { useOperationMode } from '@/services/operationMode';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Database, Zap, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export interface OperationModeControlProps {
  onToggle?: () => void;
  simplified?: boolean;
}

/**
 * Composant permettant de contrôler le mode opérationnel de l'application
 */
const OperationModeControl: React.FC<OperationModeControlProps> = ({ 
  onToggle,
  simplified = false
}) => {
  const { mode, isDemoMode, enableRealMode, enableDemoMode, failures, switchReason } = useOperationMode();
  const [reason, setReason] = useState('');
  
  const handleToggleMode = () => {
    if (isDemoMode) {
      enableRealMode();
      toast.success('Mode réel activé', {
        description: 'L\'application communique désormais directement avec l\'API Notion'
      });
    } else {
      enableDemoMode(reason || 'Activation manuelle du mode démonstration');
      toast.success('Mode démonstration activé', {
        description: 'L\'application utilise des données simulées'
      });
    }
    
    // Appeler le callback si fourni
    if (onToggle) {
      onToggle();
    }
  };
  
  // Version simplifiée pour l'en-tête
  if (simplified) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {isDemoMode ? (
            <Database className="mr-1 h-4 w-4 text-blue-500" />
          ) : (
            <Zap className="mr-1 h-4 w-4 text-green-500" />
          )}
          <span className="text-xs font-medium">
            {isDemoMode ? 'Démo' : 'API'}
          </span>
        </div>
        <Switch
          checked={!isDemoMode}
          onCheckedChange={handleToggleMode}
          className="scale-75 data-[state=checked]:bg-green-500"
          aria-label="Toggle operation mode"
        />
      </div>
    );
  }
  
  // Version complète
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-medium">Mode de fonctionnement</h3>
        <p className="text-sm text-muted-foreground">
          Contrôler la manière dont l'application interagit avec l'API Notion
        </p>
      </div>
      
      <div className="flex flex-col space-y-4">
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <div className="flex items-center">
              {isDemoMode ? (
                <Database className="mr-2 h-5 w-5 text-blue-500" />
              ) : (
                <Zap className="mr-2 h-5 w-5 text-green-500" />
              )}
              <Label className="font-medium">
                {isDemoMode ? 'Mode démonstration' : 'Mode réel'}
              </Label>
            </div>
            <div className="text-sm text-muted-foreground">
              {isDemoMode 
                ? 'Utilise des données simulées sans appels à l\'API' 
                : 'Communique directement avec l\'API Notion'}
            </div>
          </div>
          <Switch
            checked={!isDemoMode}
            onCheckedChange={() => handleToggleMode()}
            aria-label="Toggle operation mode"
          />
        </div>
        
        {failures > 0 && !isDemoMode && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-700">
                Attention : {failures} erreur{failures > 1 ? 's' : ''} de connexion détectée{failures > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-amber-600">
                Passer en mode démonstration peut être utile si vous rencontrez des problèmes avec l'API Notion.
              </p>
            </div>
          </div>
        )}
        
        {isDemoMode && (
          <div className="space-y-2">
            <Label htmlFor="reason">Raison du mode démonstration</Label>
            <textarea
              id="reason"
              placeholder="Pourquoi activer le mode démonstration ? (Optionnel)"
              className="w-full p-2 border rounded-md text-sm min-h-[80px]"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        )}
        
        {switchReason && isDemoMode && (
          <div className="text-sm p-3 bg-gray-50 rounded-md border">
            <p className="font-medium text-gray-700">Raison actuelle :</p>
            <p className="text-gray-600 mt-1">{switchReason}</p>
          </div>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleToggleMode}>
          {isDemoMode ? 'Activer le mode réel' : 'Activer le mode démonstration'}
        </Button>
      </div>
    </div>
  );
};

export default OperationModeControl;
