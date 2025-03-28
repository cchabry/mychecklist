
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useExigences } from '../useExigences';
import * as exigencesModule from '../..';

// Mock des dépendances
vi.mock('../..', () => ({
  getExigences: vi.fn()
}));

// Wrapper pour le QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useExigences', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('devrait récupérer les exigences pour un projet', async () => {
    // Mock de la réponse API
    const mockExigences = [
      { id: 'exig-1', projectId: 'project-123' },
      { id: 'exig-2', projectId: 'project-123' }
    ];
    vi.mocked(exigencesModule.getExigences).mockResolvedValue(mockExigences as any);
    
    // Rendu du hook
    const { result } = renderHook(() => useExigences('project-123'), {
      wrapper: createWrapper()
    });
    
    // Vérifier l'état initial
    expect(result.current.isLoading).toBe(true);
    
    // Attendre que la requête soit terminée
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Vérifier les résultats
    expect(result.current.data).toEqual(mockExigences);
    expect(exigencesModule.getExigences).toHaveBeenCalledWith('project-123');
  });

  it('ne devrait pas déclencher la requête si projectId est vide', async () => {
    // Rendu du hook avec un projectId vide
    const { result } = renderHook(() => useExigences(''), {
      wrapper: createWrapper()
    });
    
    // Vérifier que la requête n'a pas été déclenchée
    expect(result.current.isLoading).toBe(false);
    expect(exigencesModule.getExigences).not.toHaveBeenCalled();
  });
});
