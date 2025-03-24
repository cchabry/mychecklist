
import React from 'react';
import { Button } from '@/components/ui/button';
import { useOperationMode } from '@/services/operationMode';

/**
 * Composant temporaire pour remplacer l'ancien MockModeToggle
 * (à remplacer par OperationModeControl)
 */
const MockModeToggle = () => {
  const { isDemoMode, toggle } = useOperationMode();
  
  return (
    <Button 
      variant="outline"
      size="sm"
      onClick={toggle}
      className="text-xs"
    >
      {isDemoMode ? 'Mode Démo' : 'Mode Réel'}
    </Button>
  );
};

export default MockModeToggle;
