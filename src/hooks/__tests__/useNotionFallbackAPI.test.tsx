
import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useNotionFallbackAPI } from '../useNotionFallbackAPI';
import { operationMode } from '../../services/operationMode';
import { useOperationMode } from '../../services/operationMode';
import { toast } from 'sonner';
import { notionApi } from '../../lib/notionProxy';

// Mocks
jest.mock('../../services/operationMode', () => ({
  operationMode: {
    handleSuccessfulOperation: jest.fn(),
    handleConnectionError: jest.fn(),
    isRealMode: true
  },
  useOperationMode: jest.fn(() => ({
    isDemoMode: false
  }))
}));

jest.mock('../../lib/notionProxy', () => ({
  notionApi: {}
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}));

describe('useNotionFallbackAPI Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should return the initial state correctly', () => {
    const { result } = renderHook(() => useNotionFallbackAPI());
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toBe(null);
    expect(result.current.notionApi).toBe(notionApi);
  });
  
  it('should execute real request in real mode', async () => {
    const requestFn = jest.fn().mockResolvedValue({ success: true });
    const demoData = { demo: true };
    const successMessage = 'Success message';
    const onSuccess = jest.fn();
    
    const { result } = renderHook(() => useNotionFallbackAPI());
    
    let requestResult;
    await act(async () => {
      requestResult = await result.current.executeRequest(requestFn, {
        demoData,
        successMessage,
        onSuccess
      });
    });
    
    expect(requestFn).toHaveBeenCalled();
    expect(requestResult).toEqual({ success: true });
    expect(onSuccess).toHaveBeenCalledWith({ success: true });
    expect(operationMode.handleSuccessfulOperation).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith(successMessage);
  });
  
  it('should use demo data in demo mode', async () => {
    // Changer le mock pour simuler le mode démo
    (useOperationMode as jest.Mock).mockReturnValue({
      isDemoMode: true
    });
    
    const requestFn = jest.fn().mockResolvedValue({ success: true });
    const demoData = { demo: true };
    const onSuccess = jest.fn();
    
    const { result } = renderHook(() => useNotionFallbackAPI());
    
    let requestResult;
    await act(async () => {
      requestResult = await result.current.executeRequest(requestFn, {
        demoData,
        onSuccess
      });
    });
    
    // En mode démo, requestFn ne devrait pas être appelé
    expect(requestFn).not.toHaveBeenCalled();
    expect(requestResult).toEqual(demoData);
    expect(onSuccess).toHaveBeenCalledWith(demoData);
  });
  
  it('should handle errors and fallback to demo data', async () => {
    const mockError = new Error('Test error');
    const requestFn = jest.fn().mockRejectedValue(mockError);
    const demoData = { demo: true };
    const errorMessage = 'Error message';
    const onError = jest.fn();
    
    const { result } = renderHook(() => useNotionFallbackAPI());
    
    let requestResult;
    await act(async () => {
      requestResult = await result.current.executeRequest(requestFn, {
        demoData,
        errorMessage,
        onError
      });
    });
    
    expect(requestFn).toHaveBeenCalled();
    expect(operationMode.handleConnectionError).toHaveBeenCalledWith(
      mockError,
      'Requête API Notion'
    );
    expect(toast.error).toHaveBeenCalledWith(
      errorMessage,
      expect.objectContaining({
        description: mockError.message
      })
    );
    expect(onError).toHaveBeenCalledWith(mockError);
    
    // Vérifier que le fallback vers les données de démo a fonctionné
    expect(requestResult).toEqual(demoData);
    expect(toast.info).toHaveBeenCalled();
  });
  
  it('should work with function-based demo data', async () => {
    // Changer le mock pour simuler le mode démo
    (useOperationMode as jest.Mock).mockReturnValue({
      isDemoMode: true
    });
    
    const demoDataFn = jest.fn().mockReturnValue({ generated: true });
    const requestFn = jest.fn();
    
    const { result } = renderHook(() => useNotionFallbackAPI());
    
    let requestResult;
    await act(async () => {
      requestResult = await result.current.executeRequest(requestFn, {
        demoData: demoDataFn
      });
    });
    
    expect(demoDataFn).toHaveBeenCalled();
    expect(requestResult).toEqual({ generated: true });
  });
});
