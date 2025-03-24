
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useOperationMode } from '@/services/operationMode';

interface OperationModeActionsProps {
  simplified?: boolean;
  className?: string;
}

/**
 * Actions pour le mode opérationnel
 */
const OperationModeActions: React.FC<OperationModeActionsProps> = ({ 
  simplified = false,
  className = ''
}) => {
  const { 
    isDemoMode,
    enableRealMode,
    reset
  } = useOperationMode();

  const handleReturnToRealMode = () => {
    if (isDemoMode) {
      enableRealMode();
      toast.success('Mode réel activé', {
        description: 'L\'application est maintenant connectée à Notion'
      });
    }
  };

  const handleReset = () => {
    reset();
    toast.success('Réinitialisation effectuée', {
      description: 'Les paramètres et compteurs d\'erreurs ont été réinitialisés'
    });
  };
  
  if (simplified) {
    return (
      <div className={`flex gap-2 ${className}`}>
        {isDemoMode && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleReturnToRealMode}
          >
            <RefreshCw size={12} className="mr-1" />
            Mode réel
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {isDemoMode && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleReturnToRealMode}
          className="text-xs h-7"
        >
          <RefreshCw size={12} className="mr-1" />
          Revenir au mode réel
        </Button>
      )}
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleReset}
        className="text-xs h-7 ml-auto"
      >
        Réinitialiser
      </Button>
    </div>
  );
};

export default OperationModeActions;
