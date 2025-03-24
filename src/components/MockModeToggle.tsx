
import React from 'react';
import { Button } from '@/components/ui/button';
import { useOperationModeListener } from '@/hooks/useOperationModeListener';

/**
 * Composant temporaire pour remplacer l'ancien MockModeToggle
 * (à remplacer par OperationModeControl)
 */
const MockModeToggle = () => {
  const { isDemoMode, toggleMode } = useOperationModeListener();
  
  return (
    <Button 
      variant="outline"
      size="sm"
      onClick={() => toggleMode()}
      className="text-xs"
    >
      {isDemoMode ? 'Mode Démo' : 'Mode Réel'}
    </Button>
  );
};

export default MockModeToggle;
