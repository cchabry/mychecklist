
import React from 'react';
import OperationModeStatus from '@/components/OperationModeStatus';

/**
 * Composant de compatibilité pour remplacer l'ancien MockModeToggle
 * @deprecated Utilisez directement OperationModeStatus ou OperationModeControl
 */
const MockModeToggle = () => {
  return (
    <OperationModeStatus showToggle={true} />
  );
};

export default MockModeToggle;
