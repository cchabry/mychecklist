
import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useOperationMode } from '../../hooks/useOperationMode';
import { operationMode } from '../../operationModeService';
import { OperationMode } from '../../types';

// Mock du service operationMode
jest.mock('../../operationModeService', () => ({
  operationMode: {
    getMode: jest.fn().mockReturnValue('REAL'),
    getSwitchReason: jest.fn().mockReturnValue(null),
    getConsecutiveFailures: jest.fn().mockReturnValue(0),
    getLastError: jest.fn().mockReturnValue(null),
    getSettings: jest.fn().mockReturnValue({
      autoSwitchOnFailure: true,
      maxConsecutiveFailures: 3,
      persistentModeStorage: false,
      showNotifications: true
    }),
    isDemoMode: false,
    isRealMode: true,
    enableDemoMode: jest.fn(),
    enableRealMode: jest.fn(),
    toggle: jest.fn(),
    handleConnectionError: jest.fn(),
    handleSuccessfulOperation: jest.fn(),
    updateSettings: jest.fn(),
    reset: jest.fn(),
    markOperationAsCritical: jest.fn(),
    unmarkOperationAsCritical: jest.fn(),
    isOperationCritical: jest.fn().mockReturnValue(false),
    temporarilyForceReal: jest.fn(),
    restorePreviousMode: jest.fn(),
    subscribe: jest.fn().mockImplementation(cb => {
      // Stocker le callback pour pouvoir le déclencher dans les tests
      (operationMode as any)._subscribers = (operationMode as any)._subscribers || [];
      (operationMode as any)._subscribers.push(cb);
      return () => {
        (operationMode as any)._subscribers = 
          (operationMode as any)._subscribers.filter((s: Function) => s !== cb);
      };
    })
  }
}));

// Helper pour simuler un changement de mode
const triggerModeChange = (mode: OperationMode, reason: string | null = null) => {
  // Mettre à jour les mocks
  (operationMode.getMode as jest.Mock).mockReturnValue(mode);
  (operationMode.getSwitchReason as jest.Mock).mockReturnValue(reason);
  (operationMode.isDemoMode as any) = mode === OperationMode.DEMO;
  (operationMode.isRealMode as any) = mode === OperationMode.REAL;
  
  // Notifier les subscribers
  if ((operationMode as any)._subscribers) {
    (operationMode as any)._subscribers.forEach((cb: Function) => cb(mode, reason));
  }
};

describe('useOperationMode Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should return the current operation mode', () => {
    const { result } = renderHook(() => useOperationMode());
    
    expect(result.current.mode).toBe(OperationMode.REAL);
    expect(result.current.isDemoMode).toBe(false);
    expect(result.current.isRealMode).toBe(true);
  });
  
  it('should update when the mode changes', () => {
    const { result } = renderHook(() => useOperationMode());
    
    // Initialement en mode réel
    expect(result.current.mode).toBe(OperationMode.REAL);
    
    // Simuler un changement vers le mode démo
    act(() => {
      triggerModeChange(OperationMode.DEMO, 'Test reason');
    });
    
    // Vérifier que le hook est mis à jour
    expect(result.current.mode).toBe(OperationMode.DEMO);
    expect(result.current.isDemoMode).toBe(true);
    expect(result.current.isRealMode).toBe(false);
    expect(result.current.switchReason).toBe('Test reason');
  });
  
  it('should call the service methods when actions are triggered', () => {
    const { result } = renderHook(() => useOperationMode());
    
    // Tester enableDemoMode
    act(() => {
      result.current.enableDemoMode('Test enable');
    });
    expect(operationMode.enableDemoMode).toHaveBeenCalledWith('Test enable');
    
    // Tester enableRealMode
    act(() => {
      result.current.enableRealMode();
    });
    expect(operationMode.enableRealMode).toHaveBeenCalled();
    
    // Tester toggle
    act(() => {
      result.current.toggle();
    });
    expect(operationMode.toggle).toHaveBeenCalled();
    
    // Tester handleConnectionError
    const testError = new Error('Test error');
    act(() => {
      result.current.handleConnectionError(testError, 'Test context');
    });
    expect(operationMode.handleConnectionError).toHaveBeenCalledWith(
      testError, 
      'Test context'
    );
    
    // Tester handleSuccessfulOperation
    act(() => {
      result.current.handleSuccessfulOperation();
    });
    expect(operationMode.handleSuccessfulOperation).toHaveBeenCalled();
  });
  
  it('should correctly handle critical operations', () => {
    const { result } = renderHook(() => useOperationMode());
    
    // Tester markOperationAsCritical
    act(() => {
      result.current.markOperationAsCritical('testOperation');
    });
    expect(operationMode.markOperationAsCritical).toHaveBeenCalledWith('testOperation');
    
    // Tester isOperationCritical
    expect(result.current.isOperationCritical('testOperation')).toBe(false);
    
    // Tester unmarkOperationAsCritical
    act(() => {
      result.current.unmarkOperationAsCritical('testOperation');
    });
    expect(operationMode.unmarkOperationAsCritical).toHaveBeenCalledWith('testOperation');
  });
  
  it('should manage temporary mode forcing', () => {
    const { result } = renderHook(() => useOperationMode());
    
    // Tester temporarilyForceReal
    act(() => {
      result.current.temporarilyForceReal();
    });
    expect(operationMode.temporarilyForceReal).toHaveBeenCalled();
    
    // Tester restorePreviousMode
    act(() => {
      result.current.restorePreviousMode();
    });
    expect(operationMode.restorePreviousMode).toHaveBeenCalled();
  });
  
  it('should handle settings management', () => {
    const { result } = renderHook(() => useOperationMode());
    
    // Tester updateSettings
    const newSettings = { autoSwitchOnFailure: false };
    act(() => {
      result.current.updateSettings(newSettings);
    });
    expect(operationMode.updateSettings).toHaveBeenCalledWith(newSettings);
    
    // Tester reset
    act(() => {
      result.current.reset();
    });
    expect(operationMode.reset).toHaveBeenCalled();
  });
  
  it('should unsubscribe on unmount', () => {
    const unsubscribeMock = jest.fn();
    (operationMode.subscribe as jest.Mock).mockReturnValueOnce(unsubscribeMock);
    
    const { unmount } = renderHook(() => useOperationMode());
    
    // Vérifier que subscribe a été appelé
    expect(operationMode.subscribe).toHaveBeenCalled();
    
    // Démonter le hook
    unmount();
    
    // Vérifier que unsubscribe a été appelé
    expect(unsubscribeMock).toHaveBeenCalled();
  });
});
