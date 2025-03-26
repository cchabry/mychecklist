
import { useState, useEffect } from 'react';
import { notionService } from '@/services/notion/notionService';

/**
 * Hook pour gérer le mode de fonctionnement (démo ou réel)
 */
export const useOperationMode = () => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  useEffect(() => {
    // Vérifier le mode actuel
    const isMockMode = notionService.isMockMode();
    setIsDemoMode(isMockMode);
  }, []);
  
  const enableDemoMode = (reason?: string) => {
    notionService.setMockMode(true);
    setIsDemoMode(true);
  };
  
  const enableRealMode = () => {
    notionService.setMockMode(false);
    setIsDemoMode(false);
  };
  
  // Pour compatibilité avec les tests existants
  return {
    isDemoMode,
    enableDemoMode,
    enableRealMode,
    // Propriétés pour la compatibilité avec les tests
    mode: isDemoMode ? 'demo' : 'real',
    isRealMode: !isDemoMode,
    state: {
      isDemoMode
    }
  };
};
