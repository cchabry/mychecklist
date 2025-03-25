
import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useOperationModeListener } from '../../hooks/useOperationModeListener';
import { operationMode } from '../../services/operationMode';

// Mock de operationMode et useOperationMode
jest.mock('../../services/operationMode', () => ({
  operationMode: {
    isDemoMode: false,
    onModeChange: jest.fn(cb => {
      // Stocker le callback
      (operationMode as any)._modeChangeListeners = 
        (operationMode as any)._modeChangeListeners || [];
      (operationMode as any)._modeChangeListeners.push(cb);
      
      // Retourner la fonction de nettoyage
      return () => {
        (operationMode as any)._modeChangeListeners = 
          (operationMode as any)._modeChangeListeners.filter((l: Function) => l !== cb);
      };
    })
  }
}));

jest.mock('../../services/operationMode/hooks/useOperationMode', () => ({
  useOperationMode: () => ({
    toggle: jest.fn(),
    enableRealMode: jest.fn(),
    enableDemoMode: jest.fn(),
  })
}));

// Helper pour simuler un changement de mode
const triggerModeChange = (isDemoMode: boolean) => {
  // Mettre à jour le mock
  (operationMode.isDemoMode as boolean) = isDemoMode;
  
  // Notifier les listeners
  if ((operationMode as any)._modeChangeListeners) {
    (operationMode as any)._modeChangeListeners.forEach((cb: Function) => cb(isDemoMode));
  }
};

describe('useOperationModeListener Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (operationMode.isDemoMode as boolean) = false;
  });
  
  it('should return the current demo mode state', () => {
    const { result } = renderHook(() => useOperationModeListener());
    
    expect(result.current.isDemoMode).toBe(false);
    expect(typeof result.current.toggleMode).toBe('function');
    expect(typeof result.current.enableRealMode).toBe('function');
    expect(typeof result.current.enableDemoMode).toBe('function');
  });
  
  it('should update when the mode changes', () => {
    const { result } = renderHook(() => useOperationModeListener());
    
    // Initialement en mode réel
    expect(result.current.isDemoMode).toBe(false);
    
    // Simuler un changement vers le mode démo
    act(() => {
      triggerModeChange(true);
    });
    
    // Vérifier que le hook est mis à jour
    expect(result.current.isDemoMode).toBe(true);
    
    // Simuler un retour au mode réel
    act(() => {
      triggerModeChange(false);
    });
    
    // Vérifier que le hook est mis à jour
    expect(result.current.isDemoMode).toBe(false);
  });
  
  it('should unsubscribe on unmount', () => {
    const unsubscribeMock = jest.fn();
    (operationMode.onModeChange as jest.Mock).mockReturnValueOnce(unsubscribeMock);
    
    const { unmount } = renderHook(() => useOperationModeListener());
    
    // Vérifier que onModeChange a été appelé
    expect(operationMode.onModeChange).toHaveBeenCalled();
    
    // Démonter le hook
    unmount();
    
    // Vérifier que unsubscribe a été appelé
    expect(unsubscribeMock).toHaveBeenCalled();
  });
});
