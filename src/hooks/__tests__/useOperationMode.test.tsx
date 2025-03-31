
import { describe, it, expect, beforeEach } from 'vitest';
import { useOperationMode } from '../useOperationMode';
import { renderHook } from '@testing-library/react';

describe('useOperationMode', () => {
  beforeEach(() => {
    // Reset any mocks between tests
  });

  it('should always return isDemoMode as true', () => {
    const { result } = renderHook(() => useOperationMode());
    
    expect(result.current.isDemoMode).toBe(true);
    expect(result.current.mode).toBe('demo');
    expect(result.current.isRealMode).toBe(false);
  });

  it('should not change to real mode when enableRealMode is called', () => {
    const { result } = renderHook(() => useOperationMode());
    
    // Initial state
    expect(result.current.isDemoMode).toBe(true);
    
    // Try to enable real mode
    result.current.enableRealMode();
    
    // Check that mode did not change
    expect(result.current.mode).toBe('demo');
    expect(result.current.isRealMode).toBe(false);
    expect(result.current.state.reason).toContain('Mode de démonstration permanent');
  });

  it('should allow setting a custom reason in demo mode', () => {
    const { result } = renderHook(() => useOperationMode());
    
    // Set a custom reason
    result.current.enableDemoMode('Raison personnalisée');
    
    // Check that the reason is updated
    expect(result.current.mode).toBe('demo');
    
    // The state should contain our custom reason
    expect(result.current.state.reason).toBe('Raison personnalisée');
  });
});
