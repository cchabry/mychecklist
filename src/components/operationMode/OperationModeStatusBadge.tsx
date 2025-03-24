
import React from 'react';
import { useOperationMode } from '@/services/operationMode';
import { Badge } from '@/components/ui/badge';
import { CloudOff, Cloud } from 'lucide-react';

interface OperationModeStatusBadgeProps {
  className?: string;
}

const OperationModeStatusBadge: React.FC<OperationModeStatusBadgeProps> = ({ 
  className = "" 
}) => {
  const { isDemoMode } = useOperationMode();
  
  return isDemoMode ? (
    <Badge 
      variant="outline" 
      className={`bg-amber-50 border-amber-200 text-amber-700 flex items-center gap-1 ${className}`}
    >
      <CloudOff size={12} />
      <span>Mode démonstration</span>
    </Badge>
  ) : (
    <Badge 
      variant="outline" 
      className={`bg-green-50 border-green-200 text-green-700 flex items-center gap-1 ${className}`}
    >
      <Cloud size={12} />
      <span>Mode réel</span>
    </Badge>
  );
};

export default OperationModeStatusBadge;
