
/**
 * Hook pour déterminer le mode d'opération de l'application
 * En attendant l'implémentation complète, il retourne toujours le mode démo activé
 */
export const useOperationMode = () => {
  // Pour l'instant, on est toujours en mode démo
  return {
    isDemoMode: true,
    isRealMode: false,
    setDemoMode: () => {},
    setRealMode: () => {},
    toggleMode: () => {}
  };
};

export default useOperationMode;
