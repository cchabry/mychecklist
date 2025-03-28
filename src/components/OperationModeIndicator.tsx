
import { AlertTriangle, Database } from 'lucide-react';
import { useOperationMode } from '@/hooks/useOperationMode';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Composant qui affiche un indicateur du mode opérationnel actuel
 * et permet de basculer entre les modes.
 * 
 * En mode démo, un badge jaune est affiché.
 * En mode réel, un petit indicateur discret est affiché.
 */
export function OperationModeIndicator() {
  const { isDemoMode, enableRealMode, enableDemoMode, state } = useOperationMode();
  
  const toggleMode = () => {
    if (isDemoMode) {
      enableRealMode("Changement manuel");
    } else {
      enableDemoMode("Changement manuel");
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant={isDemoMode ? "destructive" : "ghost"}
            size="sm"
            className={`flex items-center gap-1 ${isDemoMode ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-transparent'}`}
            onClick={toggleMode}
          >
            {isDemoMode ? (
              <>
                <AlertTriangle className="h-3 w-3" />
                <span>Mode démonstration</span>
                {state.reason && (
                  <span className="text-xs opacity-90">({state.reason})</span>
                )}
              </>
            ) : (
              <Database className="h-4 w-4 text-primary/60" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isDemoMode 
              ? "Mode démonstration : données simulées. Cliquez pour passer en mode réel." 
              : "Mode réel : données Notion. Cliquez pour passer en mode démonstration."}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
