
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CloudOff, Cloud, AlertTriangle } from 'lucide-react';

interface OperationModeStatusBadgeProps {
  className?: string;
  mode?: 'demo' | 'real';
  switchReason?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const OperationModeStatusBadge: React.FC<OperationModeStatusBadgeProps> = ({ 
  className = "",
  mode = 'demo',
  switchReason,
  size = 'md',
  showLabel = true
}) => {
  // Déterminer les tailles en fonction du paramètre size
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 20 : 16;
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs';
  
  if (mode === 'real') {
    return (
      <Badge 
        variant="outline" 
        className={`bg-green-50 border-green-200 text-green-700 flex items-center gap-1 ${className}`}
      >
        <Cloud size={iconSize} />
        {showLabel && <span className={textSize}>Mode réel</span>}
      </Badge>
    );
  }
  
  return (
    <Badge 
      variant="outline" 
      className={`bg-amber-50 border-amber-200 text-amber-700 flex items-center gap-1 ${className}`}
    >
      <CloudOff size={iconSize} />
      {showLabel && <span className={textSize}>Mode démonstration</span>}
      {switchReason && (
        <span 
          className="ml-1 text-amber-500 cursor-help" 
          aria-label={switchReason}
        >
          <AlertTriangle size={iconSize} />
        </span>
      )}
    </Badge>
  );
};

export default OperationModeStatusBadge;
