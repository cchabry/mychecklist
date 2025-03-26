
import { useOperationMode } from '@/hooks/useOperationMode';
import { Badge } from '@/components/ui/badge';

/**
 * Indicateur du mode d'opération courant (démo ou réel)
 */
export function OperationModeIndicator() {
  const { isDemoMode } = useOperationMode();
  
  return (
    <Badge 
      variant={isDemoMode ? "destructive" : "outline"}
      className="ml-auto"
    >
      {isDemoMode ? 'Mode Démo' : 'Mode Réel'}
    </Badge>
  );
}
