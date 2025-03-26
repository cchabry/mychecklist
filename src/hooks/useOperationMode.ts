
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
  
  const enableDemoMode = () => {
    notionService.setMockMode(true);
    setIsDemoMode(true);
  };
  
  const enableRealMode = () => {
    notionService.setMockMode(false);
    setIsDemoMode(false);
  };
  
  return {
    isDemoMode,
    enableDemoMode,
    enableRealMode
  };
};
