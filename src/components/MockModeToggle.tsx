
import React, { useEffect } from 'react';
import OperationModeControl from './OperationModeControl';
import { toast } from 'sonner';

interface MockModeToggleProps {
  onToggle?: (isMockMode: boolean) => void;
}

/**
 * @deprecated Utilisez OperationModeControl à la place
 * Composant de compatibilité pour assurer la transition vers le nouveau système
 */
const MockModeToggle = ({ onToggle }: MockModeToggleProps) => {
  useEffect(() => {
    toast.warning(
      'Composant obsolète',
      {
        description: 'MockModeToggle est déprécié. Veuillez utiliser OperationModeControl à la place.'
      }
    );
  }, []);

  return <OperationModeControl onToggle={onToggle} simplified />;
};

export default MockModeToggle;
