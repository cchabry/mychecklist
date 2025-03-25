
import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useErrorReporter } from '../useErrorReporter';
import { useOperationMode } from '../../services/operationMode';
import { toast } from 'sonner';
import { NotionError } from '@/services/notion/types';

// Mock de useOperationMode
jest.mock('../../services/operationMode', () => ({
  useOperationMode: jest.fn(() => ({
    handleConnectionError: jest.fn(),
    handleSuccessfulOperation: jest.fn()
  }))
}));

// Mock de sonner (toast)
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}));

describe('useErrorReporter Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should report errors to operationMode and display toast', () => {
    const { result } = renderHook(() => useErrorReporter());
    const mockError = new Error('Test error');
    const mockContext = 'Test context';
    
    // Accéder aux mocks
    const handleConnectionErrorMock = 
      (useOperationMode() as ReturnType<typeof useOperationMode>).handleConnectionError;
    
    // Appeler reportError
    act(() => {
      result.current.reportError(mockError, mockContext);
    });
    
    // Vérifier que handleConnectionError a été appelé
    expect(handleConnectionErrorMock).toHaveBeenCalledWith(
      mockError, 
      mockContext
    );
    
    // Vérifier que toast.error a été appelé
    expect(toast.error).toHaveBeenCalled();
  });
  
  it('should handle non-Error objects correctly', () => {
    const { result } = renderHook(() => useErrorReporter());
    const errorString = 'String error';
    
    // Accéder aux mocks
    const handleConnectionErrorMock = 
      (useOperationMode() as ReturnType<typeof useOperationMode>).handleConnectionError;
    
    // Appeler reportError avec une chaîne
    act(() => {
      result.current.reportError(errorString);
    });
    
    // Vérifier que handleConnectionError a été appelé avec une Error
    expect(handleConnectionErrorMock).toHaveBeenCalled();
    const errorArg = (handleConnectionErrorMock as jest.Mock).mock.calls[0][0];
    expect(errorArg).toBeInstanceOf(Error);
    expect(errorArg.message).toBe(errorString);
  });
  
  it('should respect showToast option', () => {
    const { result } = renderHook(() => useErrorReporter());
    
    // Appeler reportError avec showToast = false
    act(() => {
      result.current.reportError(new Error('Silent error'), 'Context', { showToast: false });
    });
    
    // Vérifier que toast.error n'a PAS été appelé
    expect(toast.error).not.toHaveBeenCalled();
  });
  
  it('should report success and display toast', () => {
    const { result } = renderHook(() => useErrorReporter());
    const successMessage = 'Success message';
    
    // Accéder au mock
    const handleSuccessfulOperationMock = 
      (useOperationMode() as ReturnType<typeof useOperationMode>).handleSuccessfulOperation;
    
    // Appeler reportSuccess
    act(() => {
      result.current.reportSuccess(successMessage);
    });
    
    // Vérifier que handleSuccessfulOperation a été appelé
    expect(handleSuccessfulOperationMock).toHaveBeenCalled();
    
    // Vérifier que toast.success a été appelé
    expect(toast.success).toHaveBeenCalledWith(successMessage);
  });
});

