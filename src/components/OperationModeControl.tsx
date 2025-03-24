
import React from 'react';
import { useOperationModeListener } from '@/hooks/useOperationModeListener';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, Layers, Activity, Settings, Info, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { operationMode } from '@/services/operationMode';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useOperationMode } from '@/services/operationMode';

interface OperationModeControlProps {
  className?: string;
  onToggle?: () => void;
  compact?: boolean;
  simplified?: boolean; // Add the simplified prop to match usage in Header.tsx
}

/**
 * Composant central pour contrôler et afficher le mode opérationnel de l'application
 */
const OperationModeControl: React.FC<OperationModeControlProps> = ({ 
  className = '',
  onToggle,
  compact = false,
  simplified = false // Add default value
}) => {
  const { isDemoMode, toggleMode } = useOperationModeListener();
  const { failures, lastError, switchReason } = useOperationMode();
  
  const handleToggle = () => {
    toggleMode();
    if (onToggle) onToggle();
  };
  
  // If simplified prop is true, use this simplified version
  if (simplified) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {isDemoMode ? (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
            <Database size={14} className="text-blue-500" />
            <span className="text-xs">Démo</span>
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <Activity size={14} className="text-green-500" />
            <span className="text-xs">Réel</span>
          </Badge>
        )}
        
        <Button variant="ghost" size="sm" onClick={handleToggle} className="h-7 text-xs">
          Changer
        </Button>
      </div>
    );
  }
  
  // Use compact version if requested
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {isDemoMode ? (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
            <Database size={14} className="text-blue-500" />
            <span className="text-xs">Démo</span>
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <Activity size={14} className="text-green-500" />
            <span className="text-xs">Réel</span>
          </Badge>
        )}
        
        <Button variant="ghost" size="sm" onClick={handleToggle} className="h-7 text-xs">
          Changer
        </Button>
      </div>
    );
  }
  
  // Full card version (default)
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Mode opérationnel</span>
          {isDemoMode ? (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Database size={14} className="mr-1" /> Démonstration
            </Badge>
          ) : (
            <Badge variant="default" className="bg-green-600">
              <Activity size={14} className="mr-1" /> Réel
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {isDemoMode
            ? "L'application utilise des données de démonstration"
            : "L'application est connectée aux services réels"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-blue-500 mt-0.5" />
              <div>
                <span className="font-medium">Mode actuel :</span>
                <span className="ml-1">{isDemoMode ? 'Démonstration' : 'Réel'}</span>
                
                {switchReason && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Raison : {switchReason}
                  </p>
                )}
              </div>
            </div>
            
            {failures > 0 && (
              <div className="flex items-start gap-2 mt-2">
                <AlertTriangle size={16} className="text-amber-500 mt-0.5" />
                <div>
                  <span className="font-medium text-amber-700">
                    {failures} tentative{failures > 1 ? 's' : ''} échouée{failures > 1 ? 's' : ''}
                  </span>
                  
                  {lastError && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Dernière erreur : {lastError.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant={isDemoMode ? "outline" : "default"} 
          onClick={handleToggle}
          className={isDemoMode ? "" : "bg-green-600 hover:bg-green-700"}
        >
          {isDemoMode ? (
            <>
              <Activity size={16} className="mr-2" />
              Activer mode réel
            </>
          ) : (
            <>
              <Database size={16} className="mr-2" />
              Passer en démo
            </>
          )}
        </Button>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" asChild>
                <a href="/config">
                  <Settings size={16} />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Configurer le mode opérationnel</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
};

export default OperationModeControl;

