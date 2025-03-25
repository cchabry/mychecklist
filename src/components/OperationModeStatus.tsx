
import React from 'react';
import { useOperationMode } from '@/lib/operationMode';
import { Badge } from '@/components/ui/badge';
import { Info, Database, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface OperationModeStatusProps {
  showToggle?: boolean;
  showLabel?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Indicateur de statut pour le mode opérationnel de l'application
 * Affiche le mode actuel et permet optionnellement de le changer
 */
const OperationModeStatus: React.FC<OperationModeStatusProps> = ({
  showToggle = false,
  showLabel = true,
  className = '',
  size = 'md'
}) => {
  const { isDemoMode, toggleMode, switchReason } = useOperationMode();
  
  const handleToggle = () => {
    toggleMode();
    
    toast.info(
      isDemoMode ? 'Mode démonstration activé' : 'Mode réel activé',
      {
        description: isDemoMode 
          ? 'Utilisation de données simulées' 
          : 'Connexion à l\'API Notion',
        duration: 3000
      }
    );
  };
  
  // Déterminer les tailles en fonction du paramètre size
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs';
  const badgeSize = size === 'sm' ? 'px-1.5 py-0 text-xs' : '';
  
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
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
      
      {showToggle && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 px-2" 
          onClick={handleToggle}
        >
          Changer
        </Button>
      )}
    </div>
  );
};

export default OperationModeStatus;
