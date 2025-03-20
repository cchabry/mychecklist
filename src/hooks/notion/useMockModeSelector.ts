
import { useState, useEffect } from 'react';
import { notionApi } from '@/lib/notionProxy';

export interface MockModeStatus {
  isMockModeV1Active: boolean;
  isMockModeV2Active: boolean;
  isRealMode: boolean;
}

/**
 * Hook pour gérer la sélection du mode mock (v1, v2 ou réel)
 */
export function useMockModeSelector() {
  const [status, setStatus] = useState<MockModeStatus>({
    isMockModeV1Active: notionApi.mockMode.isActive() && !notionApi.mockModeV2.isActive(),
    isMockModeV2Active: notionApi.mockModeV2.isActive(),
    isRealMode: !notionApi.mockMode.isActive() && !notionApi.mockModeV2.isActive()
  });
  
  // Mettre à jour le statut lorsque le mode mock change
  useEffect(() => {
    const checkMockMode = () => {
      setStatus({
        isMockModeV1Active: notionApi.mockMode.isActive() && !notionApi.mockModeV2.isActive(),
        isMockModeV2Active: notionApi.mockModeV2.isActive(),
        isRealMode: !notionApi.mockMode.isActive() && !notionApi.mockModeV2.isActive()
      });
    };
    
    // Vérifier tout de suite et à intervalle régulier
    checkMockMode();
    const interval = setInterval(checkMockMode, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Activer le mode mock v1
  const activateMockModeV1 = () => {
    notionApi.mockModeV2.deactivate();
    notionApi.mockMode.activate();
  };
  
  // Activer le mode mock v2
  const activateMockModeV2 = () => {
    notionApi.mockMode.deactivate();
    notionApi.mockModeV2.activate();
  };
  
  // Activer le mode réel
  const activateRealMode = () => {
    notionApi.mockMode.deactivate();
    notionApi.mockModeV2.deactivate();
  };
  
  return {
    status,
    activateMockModeV1,
    activateMockModeV2,
    activateRealMode
  };
}

// Exporter le hook
export default useMockModeSelector;
