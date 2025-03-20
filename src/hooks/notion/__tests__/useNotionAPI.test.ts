
/**
 * Tests unitaires pour le hook useNotionAPI
 * 
 * Pour exécuter ces tests :
 * npm test -- -t "useNotionAPI"
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useNotionAPI } from '../useNotionAPI';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';

// Mock pour notionApi
jest.mock('@/lib/notionProxy', () => ({
  notionApi: {
    request: jest.fn(),
    mockMode: {
      isActive: jest.fn(() => false),
      activate: jest.fn(),
      deactivate: jest.fn()
    }
  }
}));

// Mock pour useNotion
jest.mock('@/contexts/NotionContext', () => ({
  useNotion: () => ({
    testConnection: jest.fn()
  })
}));

// Mock pour toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}));

// Mock pour handleNotionError
jest.mock('@/lib/notionProxy/errorHandling', () => ({
  handleNotionError: jest.fn()
}));

describe('useNotionAPI hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('should execute request successfully', async () => {
    const mockSuccessFn = jest.fn();
    const mockData = { success: true };
    const mockRequestFn = jest.fn().mockResolvedValue(mockData);
    
    const { result } = renderHook(() => useNotionAPI());
    
    await act(async () => {
      const response = await result.current.executeRequest(mockRequestFn, {
        onSuccess: mockSuccessFn,
        successMessage: 'Success'
      });
      
      expect(response).toEqual(mockData);
    });
    
    expect(mockRequestFn).toHaveBeenCalled();
    expect(mockSuccessFn).toHaveBeenCalledWith(mockData);
    expect(toast.success).toHaveBeenCalledWith('Success');
    expect(result.current.error).toBeNull();
  });
  
  test('should handle request error', async () => {
    const mockErrorFn = jest.fn();
    const mockError = new Error('Test error');
    const mockRequestFn = jest.fn().mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useNotionAPI());
    
    await act(async () => {
      const response = await result.current.executeRequest(mockRequestFn, {
        onError: mockErrorFn,
        errorMessage: 'Error message'
      });
      
      expect(response).toBeNull();
    });
    
    expect(mockRequestFn).toHaveBeenCalled();
    expect(mockErrorFn).toHaveBeenCalledWith(mockError);
    expect(result.current.error).toEqual(mockError);
  });
  
  test('should use mock data when in mock mode', async () => {
    // Set mock mode active
    (notionApi.mockMode.isActive as jest.Mock).mockReturnValue(true);
    
    const mockSuccessFn = jest.fn();
    const mockData = { mocked: true };
    const mockRequestFn = jest.fn().mockResolvedValue({ real: true });
    
    const { result } = renderHook(() => useNotionAPI());
    
    await act(async () => {
      const response = await result.current.executeRequest(mockRequestFn, {
        onSuccess: mockSuccessFn,
        successMessage: 'Success',
        mockData
      });
      
      expect(response).toEqual(mockData);
    });
    
    // Request function should not be called when mock data is provided
    expect(mockRequestFn).not.toHaveBeenCalled();
    expect(mockSuccessFn).toHaveBeenCalledWith(mockData);
    expect(toast.success).toHaveBeenCalledWith('Success');
  });
  
  test('should enable and disable mock mode', async () => {
    const { result } = renderHook(() => useNotionAPI());
    
    await act(async () => {
      result.current.enableMockMode();
    });
    
    expect(notionApi.mockMode.activate).toHaveBeenCalled();
    expect(toast.info).toHaveBeenCalled();
    
    await act(async () => {
      result.current.disableMockMode();
    });
    
    expect(notionApi.mockMode.deactivate).toHaveBeenCalled();
    expect(toast.info).toHaveBeenCalled();
  });
});
