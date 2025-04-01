
/**
 * Hook pour connaître le mode de fonctionnement de l'application
 * Ce hook ne fait plus rien car nous avons supprimé les mentions au mode démo
 */
export const useOperationMode = () => {
  return {
    isDemoMode: false,
    isRealMode: true,
    mode: 'real',
    state: {
      mode: 'real',
      timestamp: Date.now(),
      source: 'system'
    },
    enableDemoMode: () => {},
    enableRealMode: () => {},
    reset: () => {}
  };
};
