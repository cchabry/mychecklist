
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Database, Info, AlertTriangle } from 'lucide-react';
import { OperationMode } from '@/services/operationMode';

interface OperationModeStatusBadgeProps {
  mode: OperationMode;
  switchReason?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/**
 * Badge affichant le statut du mode opérationnel
 */
const OperationModeStatusBadge: React.FC<OperationModeStatusBadgeProps> = ({
  mode,
  switchReason,
  size = 'md',
  showLabel = true,
}) => {
  const isDemoMode = mode === OperationMode.DEMO;
  
  // Déterminer les tailles en fonction du paramètre size
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs';
  const badgeSize = size === 'sm' ? 'px-1.5 py-0 text-xs' : '';
  
  return (
    <>
      {isDemoMode ? (
        <Badge 
          variant="outline" 
          className={`bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 ${badgeSize}`}
        >
          <Database size={iconSize} className="text-blue-500" />
          {showLabel && <span className={textSize}>Mode démo</span>}
        </Badge>
      ) : (
        <Badge 
          variant="outline" 
          className={`bg-green-50 text-green-700 border-green-200 flex items-center gap-1 ${badgeSize}`}
        >
          <Info size={iconSize} className="text-green-500" />
          {showLabel && <span className={textSize}>Mode réel</span>}
        </Badge>
      )}
      
      {switchReason && isDemoMode && (
        <span 
          className={`text-amber-600 flex items-center gap-1 ${textSize}`}
          title={switchReason}
        >
          <AlertTriangle size={iconSize} className="text-amber-500" />
        </span>
      )}
    </>
  );
};

export default OperationModeStatusBadge;
