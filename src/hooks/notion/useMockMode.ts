
/**
 * Hook pour interagir avec le mode mock d'une façon compatible
 * @deprecated Utilisez useOperationMode à la place
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { operationMode } from '@/services/operationMode';

export function useMockMode() {
  const [isMockMode, setIsMockMode] = useState(operationMode.isDemoMode);
  
  useEffect(() => {
    // Afficher un avertissement de dépréciation
    toast.warning(
      'Hook déprécié',
      {
        description: 'useMockMode est déprécié. Veuillez utiliser useOperationMode à la place.',
        duration: 5000
      }
    );
    
    const checkMockMode = () => {
      setIsMockMode(operationMode.isDemoMode);
    };
    
    // Vérifier au montage
    checkMockMode();
    
    // S'abonner aux changements de mode
    const unsubscribe = operationMode.subscribe(() => {
      checkMockMode();
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  return {
    isMockMode,
    toggleMockMode: () => {
      // Use the toggle method
      operationMode.toggle();
      setIsMockMode(operationMode.isDemoMode);
      return operationMode.isDemoMode;
    },
    enableMockMode: () => {
      operationMode.enableDemoMode('Appel via useMockMode déprécié');
      setIsMockMode(true);
    },
    disableMockMode: () => {
      operationMode.enableRealMode();
      setIsMockMode(false);
    }
  };
}

// Avertissement dans la console
console.warn(
  "[Deprecated] useMockMode est un hook déprécié qui sera supprimé dans une future version. " +
  "Veuillez utiliser useOperationMode à la place."
);
