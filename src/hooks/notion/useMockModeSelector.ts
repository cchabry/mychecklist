
import { useState, useEffect } from 'react';
import { notionApi, MockVersion } from '@/lib/notionProxy';

export interface MockModeStatus {
  isV1Active: boolean;
  isV2Active: boolean;
  isRealMode: boolean;
}

/**
 * Hook pour gérer la sélection du mode mock (v1, v2 ou réel)
 */
export function useMockModeSelector() {
  const [status, setStatus] = useState<MockModeStatus>({
    isV1Active: notionApi.mockMode.isV1Active(),
    isV2Active: notionApi.mockMode.isV2Active(),
    isRealMode: !notionApi.mockMode.isActive()
  });
  
  // Mettre à jour le statut lorsque le mode mock change
  useEffect(() => {
    const checkMockMode = () => {
      setStatus({
        isV1Active: notionApi.mockMode.isV1Active(),
        isV2Active: notionApi.mockMode.isV2Active(),
        isRealMode: !notionApi.mockMode.isActive()
      });
    };
    
    // Vérifier tout de suite et à intervalle régulier
    checkMockMode();
    const interval = setInterval(checkMockMode, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Activer le mode mock v1
  const activateMockModeV1 = () => {
    notionApi.mockMode.activateV1();
  };
  
  // Activer le mode mock v2
  const activateMockModeV2 = () => {
    notionApi.mockMode.activateV2();
  };
  
  // Activer le mode réel
  const activateRealMode = () => {
    notionApi.mockMode.deactivate();
  };
  
  return {
    status,
    activateMockModeV1,
    activateMockModeV2,
    activateRealMode
  };
}

export default useMockModeSelector;
