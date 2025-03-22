
import React from 'react';
import { useOperationMode } from '@/services/operationMode';
import { Check, Info, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OperationModeStatusProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/**
 * Composant qui affiche l'état du mode opérationnel
 */
const OperationModeStatus: React.FC<OperationModeStatusProps> = ({
  className,
  size = 'md',
  showLabel = true
}) => {
  const { isDemoMode, isRealMode, switchReason } = useOperationMode();
  
  // Déterminer les classes en fonction de la taille
  const sizeClasses = {
    sm: 'text-xs py-0.5 px-1.5',
    md: 'text-sm py-1 px-2',
    lg: 'text-base py-1.5 px-3'
  };
  
  // Déterminer le style en fonction du mode
  const getModeStyle = () => {
    if (isRealMode) {
      return {
        icon: <Check size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />,
        classes: 'bg-green-100 text-green-800 border-green-200'
      };
    }
    if (isDemoMode) {
      return {
        icon: <Info size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />,
        classes: 'bg-blue-100 text-blue-800 border-blue-200'
      };
    }
    return {
      icon: <AlertTriangle size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />,
      classes: 'bg-amber-100 text-amber-800 border-amber-200'
    };
  };
  
  const { icon, classes } = getModeStyle();
  
  return (
    <Badge
      variant="outline"
      className={cn(
        'flex items-center gap-1 font-normal border',
        classes,
        sizeClasses[size],
        className
      )}
      title={switchReason || undefined}
    >
      {icon}
      {showLabel && (
        <span>
          {isRealMode 
            ? "Mode Notion" 
            : isDemoMode 
              ? "Mode Démo" 
              : "Non configuré"}
        </span>
      )}
    </Badge>
  );
};

export default OperationModeStatus;
