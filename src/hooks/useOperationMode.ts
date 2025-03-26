
import { useState, useEffect } from 'react';

/**
 * Hook pour gérer le mode d'opération (démo ou réel)
 */
export const useOperationMode = () => {
  // Pour l'instant, on considère que nous sommes toujours en mode démo
  // Sera implémenté dans les prochains sprints
  const [isDemoMode] = useState(true);
  
  return {
    isDemoMode
  };
};
