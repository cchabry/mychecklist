
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { useOperationMode, OperationMode } from '@/services/operationMode';

interface StatusDisplayProps {
  className?: string;
}

/**
 * Affichage détaillé de l'état du mode opérationnel
 */
const StatusDisplay: React.FC<StatusDisplayProps> = ({ className = "" }) => {
  const { mode, switchReason, failures } = useOperationMode();
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="font-semibold">Mode actuel:</span>
        <Badge variant={mode === OperationMode.DEMO ? "outline" : "default"} className={mode === OperationMode.DEMO ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}>
          {mode === OperationMode.DEMO ? 'Mode Démo' : 'Mode Réel'}
        </Badge>
      </div>
      
      {switchReason && (
        <div className="flex justify-between items-center">
          <span className="font-semibold">Raison du changement:</span>
          <span className="text-gray-600">{switchReason}</span>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <span className="font-semibold">Échecs consécutifs:</span>
        <Badge variant={failures > 0 ? "destructive" : "outline"} className={failures > 0 ? 'bg-red-50 text-red-700' : ''}>
          {failures}
        </Badge>
      </div>
    </div>
  );
};

export default StatusDisplay;
