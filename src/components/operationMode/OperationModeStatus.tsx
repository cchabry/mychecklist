
import React from 'react';
import { useOperationMode } from '@/services/operationMode';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import OperationModeStatusBadge from './OperationModeStatusBadge';

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
  const { isDemoMode, toggle, switchReason } = useOperationMode();
  
  const handleToggle = () => {
    toggle();
    
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
  
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <OperationModeStatusBadge 
        mode={isDemoMode ? 'demo' : 'real'}
        switchReason={switchReason}
        size={size}
        showLabel={showLabel}
      />
      
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
