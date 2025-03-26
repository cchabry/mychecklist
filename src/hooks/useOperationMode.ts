
import { useState } from 'react';
import { OperationModeType, OperationModeState } from '@/types/operation';

/**
 * Hook pour déterminer le mode d'opération de l'application
 */
export const useOperationMode = () => {
  const [mode, setMode] = useState<OperationModeType>('demo');
  const [state, setState] = useState<OperationModeState>({
    mode: 'demo',
    timestamp: Date.now(),
    source: 'system'
  });

  // Pour l'instant, on est toujours en mode démo
  const isDemoMode = mode === 'demo';
  const isRealMode = mode === 'real';

  // Fonctions pour changer le mode
  const enableDemoMode = (reason?: string) => {
    setMode('demo');
    setState({
      mode: 'demo',
      reason,
      timestamp: Date.now(),
      source: 'user'
    });
  };

  const enableRealMode = (reason?: string) => {
    setMode('real');
    setState({
      mode: 'real',
      reason,
      timestamp: Date.now(),
      source: 'user'
    });
  };

  const reset = () => {
    setMode('demo');
    setState({
      mode: 'demo',
      timestamp: Date.now(),
      source: 'system'
    });
  };

  // Pour compatibilité avec l'ancienne API
  const setDemoMode = () => enableDemoMode();
  const setRealMode = () => enableRealMode();
  const toggleMode = () => (isDemoMode ? enableRealMode() : enableDemoMode());

  return {
    mode,
    state,
    isDemoMode,
    isRealMode,
    enableDemoMode,
    enableRealMode,
    reset,
    // Anciennes méthodes pour compatibilité
    setDemoMode,
    setRealMode,
    toggleMode
  };
};

export default useOperationMode;
