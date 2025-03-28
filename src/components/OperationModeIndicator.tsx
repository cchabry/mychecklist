
import React from 'react';
import { useOperationMode } from '@/hooks/useOperationMode';
import { Database, Cloud } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

/**
 * Indicateur du mode d'opération (démo ou réel)
 */
export function OperationModeIndicator() {
  const { isDemoMode, enableRealMode, enableDemoMode } = useOperationMode();
  
  const toggleMode = () => {
    if (isDemoMode) {
      enableRealMode('Changement manuel via indicateur');
    } else {
      enableDemoMode('Changement manuel via indicateur');
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 px-2"
            onClick={toggleMode}
          >
            {isDemoMode ? (
              <>
                <Database className="h-4 w-4 mr-1.5" />
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">DÉMO</Badge>
              </>
            ) : (
              <>
                <Cloud className="h-4 w-4 mr-1.5" />
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">PROD</Badge>
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{isDemoMode 
            ? "Mode démonstration (données simulées)" 
            : "Mode réel (API Notion)"}
          </p>
          <p className="text-xs text-muted-foreground">Cliquer pour changer</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default OperationModeIndicator;
