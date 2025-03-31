
import { AlertTriangle } from 'lucide-react';
import { useOperationMode } from '@/hooks/useOperationMode';
import { Badge } from './ui/badge';

/**
 * Composant qui affiche un indicateur du mode opérationnel (démo)
 * Toujours visible car on est toujours en mode démo
 */
export function OperationModeIndicator() {
  const { state } = useOperationMode();
  
  return (
    <Badge 
      variant="secondary" 
      className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600"
    >
      <AlertTriangle className="h-3 w-3" />
      <span>Mode démonstration</span>
      {state.reason && state.reason !== 'Mode de démonstration permanent' && (
        <span className="text-xs opacity-90">({state.reason})</span>
      )}
    </Badge>
  );
}
