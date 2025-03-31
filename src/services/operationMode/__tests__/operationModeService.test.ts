
import { describe, it, expect, beforeEach } from 'vitest';
import { operationModeService } from '../operationModeService';

describe('operationModeService', () => {
  beforeEach(() => {
    operationModeService.reset();
  });

  it('should always be in demo mode', () => {
    expect(operationModeService.isDemoMode()).toBe(true);
    expect(operationModeService.isRealMode()).toBe(false);
    expect(operationModeService.getState().mode).toBe('demo');
  });

  it('should allow changing the demo reason', () => {
    operationModeService.enableDemoMode('Test reason');
    
    expect(operationModeService.isDemoMode()).toBe(true);
    expect(operationModeService.getState().reason).toBe('Test reason');
  });

  it('should not allow enabling real mode', () => {
    const result = operationModeService.enableRealMode();
    
    expect(result).toBe(false);
    expect(operationModeService.isDemoMode()).toBe(true);
    expect(operationModeService.isRealMode()).toBe(false);
  });

  it('should notify subscribers when state changes', () => {
    const mockCallback = vi.fn();
    const unsubscribe = operationModeService.subscribe(mockCallback);
    
    operationModeService.enableDemoMode('New reason');
    
    expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'demo',
      reason: 'New reason'
    }));
    
    unsubscribe();
  });
});
