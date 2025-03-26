
import { AlertTriangle } from 'lucide-react';
import { useOperationMode } from '@/hooks/useOperationMode';
import { Badge } from './ui/badge';

export function OperationModeIndicator() {
  const { isDemoMode, state } = useOperationMode();
  
  if (!isDemoMode) return null;
  
  return (
    <Badge 
      variant="warning" 
      className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600"
    >
      <AlertTriangle className="h-3 w-3" />
      <span>Mode démonstration</span>
      {state.reason && (
        <span className="text-xs opacity-90">({state.reason})</span>
      )}
    </Badge>
  );
}
