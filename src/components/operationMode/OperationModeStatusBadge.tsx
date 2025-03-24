
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Database, Info, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface OperationModeStatusBadgeProps {
  mode: 'demo' | 'real';
  switchReason?: string | null;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Badge de statut pour le mode opérationnel de l'application
 */
const OperationModeStatusBadge: React.FC<OperationModeStatusBadgeProps> = ({
  mode,
  switchReason = null,
  showLabel = true,
  size = 'md',
  className = ''
}) => {
  // Déterminer les tailles en fonction du paramètre size
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs';
  const badgeSize = size === 'sm' ? 'px-1.5 py-0 text-xs' : '';
  
  const isDemo = mode === 'demo';
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Badge 
        variant="outline" 
        className={`${isDemo 
          ? 'bg-blue-50 text-blue-700 border-blue-200' 
          : 'bg-green-50 text-green-700 border-green-200'
        } flex items-center gap-1 ${badgeSize}`}
      >
        {isDemo ? (
          <Database size={iconSize} className="text-blue-500" />
        ) : (
          <Info size={iconSize} className="text-green-500" />
        )}
        {showLabel && (
          <span className={textSize}>
            {isDemo ? 'Mode démo' : 'Mode réel'}
          </span>
        )}
      </Badge>
      
      {switchReason && isDemo && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`text-amber-600 flex items-center gap-1 ${textSize} cursor-help`}>
              <AlertTriangle size={iconSize} className="text-amber-500" />
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-xs">{switchReason}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

export default OperationModeStatusBadge;
