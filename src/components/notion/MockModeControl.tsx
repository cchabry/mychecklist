
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import OperationModeControl from '@/components/OperationModeControl';

/**
 * @deprecated Ce composant est déprécié. Utilisez OperationModeControl à la place.
 * Composant de compatibilité qui redirige vers la nouvelle version.
 */
const MockModeControl: React.FC = () => {
  useEffect(() => {
    toast.warning(
      'Composant obsolète',
      {
        description: 'MockModeControl est déprécié. Veuillez utiliser OperationModeControl à la place.'
      }
    );
  }, []);

  return <OperationModeControl />;
};

export default MockModeControl;
