
import { useState, useEffect } from 'react';
import { OperationModeType, OperationModeState } from '@/types/operation/operationMode';

/**
 * Hook pour gérer le mode d'opération (démo ou réel)
 */
export const useOperationMode = () => {
  // État simple pour l'instant, sera enrichi dans les prochains sprints
  const [mode, setMode] = useState<OperationModeType>('real');
  
  // État détaillé du mode opérationnel
  const [state, setState] = useState<OperationModeState>({
    mode: 'real',
    timestamp: Date.now(),
    source: 'system'
  });
  
  // Fonctions pour changer le mode
  const enableRealMode = (reason?: string) => {
    setMode('real');
    setState({
      mode: 'real',
      reason,
      timestamp: Date.now(),
      source: 'user'
    });
  };
  
  const enableDemoMode = (reason?: string) => {
    setMode('demo');
    setState({
      mode: 'demo',
      reason,
      timestamp: Date.now(),
      source: 'user'
    });
  };
  
  const reset = () => {
    enableRealMode();
  };
  
  // Valeurs calculées
  const isDemoMode = mode === 'demo';
  const isRealMode = mode === 'real';
  
  return {
    mode,
    state,
    isDemoMode,
    isRealMode,
    enableRealMode,
    enableDemoMode,
    reset
  };
};
