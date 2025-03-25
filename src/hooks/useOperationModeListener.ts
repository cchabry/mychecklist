
import { useState, useEffect } from 'react';
import { OperationMode } from '@/services/operationMode/types';
import { operationMode } from '@/services/operationMode';
import { useConnectionMode } from './useConnectionMode';

/**
 * Hook pour écouter les changements de mode opérationnel
 * Version simplifiée qui utilise la nouvelle interface
 */
export function useOperationModeListener() {
  const {
    isDemoMode,
    isRealMode,
    toggleMode,
    enableDemoMode,
    enableRealMode,
    mode
  } = useConnectionMode();
  
  return {
    isDemoMode,
    isRealMode,
    mode,
    toggleMode,
    enableDemoMode,
    enableRealMode
  };
}
