
/**
 * Tests unitaires pour le module mockMode
 * 
 * Pour exécuter ces tests, vous pouvez utiliser :
 * npm test -- -t "mockMode"
 */

import { mockMode } from '../mockMode';
import { STORAGE_KEYS } from '../config';

// Mocks pour localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    store
  };
})();

// Mock pour window.location
const mockLocation = {
  search: ''
};

describe('mockMode module', () => {
  beforeAll(() => {
    // Setup mocks
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    Object.defineProperty(window, 'location', { value: mockLocation, writable: true });
  });
  
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    jest.clearAllMocks();
    // Reset URL params
    window.location.search = '';
  });
  
  test('isActive should return false by default', () => {
    expect(mockMode.isActive()).toBe(false);
  });
  
  test('activate should set localStorage value', () => {
    mockMode.activate();
    expect(localStorageMock.setItem).toHaveBeenCalledWith(STORAGE_KEYS.MOCK_MODE, 'true');
    expect(mockMode.isActive()).toBe(true);
  });
  
  test('deactivate should remove localStorage value', () => {
    // First activate
    mockMode.activate();
    expect(mockMode.isActive()).toBe(true);
    
    // Then deactivate
    mockMode.deactivate();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.MOCK_MODE);
    expect(mockMode.isActive()).toBe(false);
  });
  
  test('toggle should flip the state', () => {
    // Start with inactive
    expect(mockMode.isActive()).toBe(false);
    
    // Toggle to active
    let result = mockMode.toggle();
    expect(result).toBe(true);
    expect(mockMode.isActive()).toBe(true);
    
    // Toggle back to inactive
    result = mockMode.toggle();
    expect(result).toBe(false);
    expect(mockMode.isActive()).toBe(false);
  });
  
  test('forceReset should disable mock mode and set force_real flag', () => {
    // First activate mock mode
    mockMode.activate();
    expect(mockMode.isActive()).toBe(true);
    
    // Then force reset
    mockMode.forceReset();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.MOCK_MODE);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('notion_force_real', 'true');
    expect(mockMode.isActive()).toBe(false);
  });
  
  test('reset should remove all mock-related flags', () => {
    // Set up some mock state
    localStorageMock.setItem(STORAGE_KEYS.MOCK_MODE, 'true');
    localStorageMock.setItem('notion_force_real', 'true');
    
    // Reset everything
    mockMode.reset();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.MOCK_MODE);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('notion_force_real');
  });
  
  test('temporarilyForceReal should disable mock temporarily and provide restore function', () => {
    // First activate mock mode
    mockMode.activate();
    expect(mockMode.isActive()).toBe(true);
    
    // Then temporarily force real mode
    const restore = mockMode.temporarilyForceReal();
    expect(mockMode.isActive()).toBe(false);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('temp_was_mock', 'true');
    
    // Call restore function
    restore();
    expect(mockMode.isActive()).toBe(true);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('temp_was_mock');
  });
  
  test('isActive should respect URL parameters', () => {
    // Set URL parameter to activate mock mode
    window.location.search = '?mock=true';
    expect(mockMode.isActive()).toBe(true);
    
    // Set URL parameter to deactivate mock mode
    window.location.search = '?mock=false';
    expect(mockMode.isActive()).toBe(false);
  });
  
  test('isActive should respect force_real setting', () => {
    // Set mock mode but also force_real
    localStorageMock.setItem(STORAGE_KEYS.MOCK_MODE, 'true');
    localStorageMock.setItem('notion_force_real', 'true');
    
    // force_real should take precedence
    expect(mockMode.isActive()).toBe(false);
  });
});
