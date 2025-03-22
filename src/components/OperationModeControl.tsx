
import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cloud, Database, AlertCircle, InfoIcon } from 'lucide-react';
import { toast } from 'sonner';
import { 
  operationMode, 
  OperationMode, 
  useOperationMode 
} from '@/services/operationMode';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface OperationModeControlProps {
  onToggle?: (isDemoMode: boolean) => void;
  className?: string;
  simplified?: boolean;
}

/**
 * Composant de contrôle du mode de fonctionnement de l'application
 * Version modernisée remplaçant le MockModeToggle
 */
const OperationModeControl: React.FC<OperationModeControlProps> = ({ 
  onToggle, 
  className = '',
  simplified = false
}) => {
  const { 
    mode, 
    isDemoMode, 
    toggle, 
    failures, 
    lastError,
    switchReason
  } = useOperationMode();
  
  // La raison du dernier basculement
  const [reason, setReason] = useState<string | null>(null);
  
  // Mettre à jour la raison quand elle change
  useEffect(() => {
    setReason(switchReason);
  }, [switchReason]);
  
  const handleToggle = (checked: boolean) => {
    // checked = true signifie mode démo
    const newMode = toggle();
    const isDemoActive = newMode === OperationMode.DEMO;
    
    // Nettoyer les caches locaux lors du changement de mode
    localStorage.removeItem('projects_cache');
    localStorage.removeItem('audit_cache');
    
    // Notifier les composants parents
    if (onToggle) {
      onToggle(isDemoActive);
    }
    
    // Rafraîchir la page après un court délai
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };
  
  // Version simplifiée (juste interrupteur + label)
  if (simplified) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Database size={16} className={!isDemoMode ? "text-tmw-teal" : "text-gray-400"} />
        
        <Switch 
          id="operation-mode" 
          checked={isDemoMode}
          onCheckedChange={handleToggle}
        />
        
        <Label htmlFor="operation-mode" className="flex gap-2 items-center cursor-pointer text-sm">
          <Cloud size={16} className={isDemoMode ? "text-blue-500" : "text-gray-400"} />
          {isDemoMode ? "Mode démo" : "Mode réel"}
        </Label>
      </div>
    );
  }
  
  // Version détaillée (avec badge d'état et infobulles)
  return (
    <div className={`flex items-center justify-between gap-2 px-3 py-2 rounded-md border ${className} ${
      isDemoMode ? "bg-blue-50 border-blue-200" : "bg-emerald-50 border-emerald-200"
    }`}>
      <div className="flex items-center gap-2">
        <div>
          {isDemoMode ? (
            <Cloud size={16} className="text-blue-500" />
          ) : (
            <Database size={16} className="text-green-600" />
          )}
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {isDemoMode ? "Mode démonstration" : "Mode réel"}
            </span>
            
            {failures > 0 && !isDemoMode && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 text-xs">
                      <AlertCircle size={12} className="mr-1" />
                      {failures} échec{failures > 1 ? 's' : ''}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {failures} tentative{failures > 1 ? 's' : ''} de connexion échouée{failures > 1 ? 's' : ''}
                      {lastError && <><br/>{lastError.message}</>}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {reason && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon size={14} className="text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Raison: {reason}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          <p className="text-xs text-gray-600">
            {isDemoMode 
              ? "Utilisation de données fictives" 
              : "Connexion directe à Notion"}
          </p>
        </div>
      </div>
      
      <Switch 
        id="operation-mode-switch" 
        checked={isDemoMode}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-blue-500"
      />
    </div>
  );
};

export default OperationModeControl;
