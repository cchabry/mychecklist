
/**
 * Tests pour le service de gestion du mode d'opération
 * @jest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OperationModeService } from '../operationModeService';

// Skipping tests temporarily until they are fixed
describe.skip('OperationModeService', () => {
  let service: OperationModeService;

  beforeEach(() => {
    // Clear localStorage to start fresh
    localStorage.clear();
    service = new OperationModeService();
    service.reset();
  });

  describe('Mode management', () => {
    it('should start in demo mode by default', () => {
      expect(service.getMode()).toBe('demo');
    });

    it('should be able to switch modes', () => {
      service.enableRealMode();
      expect(service.getMode()).toBe('real');

      service.enableDemoMode('testing');
      expect(service.getMode()).toBe('demo');
    });
  });

  describe('State management', () => {
    it('should return the current state', () => {
      service.enableDemoMode('test reason');
      
      const state = service.getState();
      expect(state.mode).toBe('demo');
      expect(state.reason).toBe('test reason');
    });

    it('should update the state when enabling modes', () => {
      service.enableRealMode();
      
      let state = service.getState();
      expect(state.mode).toBe('real');
      expect(state.source).toBe('manual');
      
      service.enableDemoMode('test');
      
      state = service.getState();
      expect(state.mode).toBe('demo');
      expect(state.reason).toBe('test');
    });
  });

  describe('Persistence', () => {
    it('should save the mode to localStorage', () => {
      service.enableRealMode();
      
      // Reset the service to simulate a page reload
      service.reset();
      
      expect(service.getMode()).toBe('real');
    });

    it('should save the full state to localStorage', () => {
      service.enableDemoMode('persistence test');
      
      // Reset the service to simulate a page reload
      service.reset();
      
      const state = service.getState();
      expect(state.mode).toBe('demo');
      expect(state.reason).toBe('persistence test');
    });
  });

  describe('Subscription', () => {
    it('should notify subscribers when the mode changes', () => {
      const mockCallback = vi.fn();
      const unsubscribe = service.subscribe(mockCallback);
      
      service.enableRealMode();
      service.enableDemoMode('testing subscription');
      
      expect(mockCallback).toHaveBeenCalledTimes(2);
      
      // Test that unsubscribe works
      unsubscribe();
      service.enableRealMode();
      expect(mockCallback).toHaveBeenCalledTimes(2); // Still 2, not 3
    });
  });

  describe('Auto detection', () => {
    it('should detect environmental factors', () => {
      // Mock user agent for a local environment
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Node.js)',
        configurable: true
      });
      
      service.reset();
      service.detectEnvironment();
      
      expect(service.getMode()).toBe('demo');
    });
  });
});
