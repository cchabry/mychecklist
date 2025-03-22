
/**
 * Hook pour interagir avec le mode mock d'une façon compatible
 */

import { useState, useEffect } from 'react';
import { notionApi } from '@/lib/notionProxy';
import { isMockActive } from '@/lib/notionProxy/mock/utils';
import { operationMode } from '@/services/operationMode';

export function useMockMode() {
  const [isMockMode, setIsMockMode] = useState(isMockActive());
  
  useEffect(() => {
    const checkMockMode = () => {
      const active = isMockActive();
      setIsMockMode(active);
    };
    
    // Vérifier au montage
    checkMockMode();
    
    // S'abonner aux changements de mode
    const unsubscribe = operationMode.subscribe(() => {
      checkMockMode();
    });
    
    // Vérifier à intervalles réguliers pour compatibilité
    const interval = setInterval(checkMockMode, 1000);
    
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);
  
  return {
    isMockMode,
    toggleMockMode: () => {
      const newState = notionApi.mockMode.toggle();
      setIsMockMode(newState);
      return newState;
    },
    enableMockMode: () => {
      notionApi.mockMode.activate();
      setIsMockMode(true);
    },
    disableMockMode: () => {
      notionApi.mockMode.deactivate();
      setIsMockMode(false);
    }
  };
}
