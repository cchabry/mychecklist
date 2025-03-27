
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEvaluations } from '../useEvaluations';
import { notionApi } from '@/services/api';

// Mock des dépendances
vi.mock('@/services/api', () => ({
  notionApi: {
    getEvaluations: vi.fn()
  }
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

describe('useEvaluations', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('devrait récupérer les évaluations pour un audit', async () => {
    // Mock de la réponse API
    const mockEvaluations = [
      { id: 'eval-1', auditId: 'audit-123' },
      { id: 'eval-2', auditId: 'audit-123' }
    ];
    vi.mocked(notionApi.getEvaluations).mockResolvedValue(mockEvaluations as any);
    
    // Rendu du hook
    const { result } = renderHook(() => useEvaluations('audit-123'), {
      wrapper: createWrapper()
    });
    
    // Vérifier l'état initial
    expect(result.current.isLoading).toBe(true);
    
    // Attendre que la requête soit terminée
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Vérifier les résultats
    expect(result.current.data).toEqual(mockEvaluations);
    expect(notionApi.getEvaluations).toHaveBeenCalledWith('audit-123');
  });

  it('ne devrait pas déclencher la requête si auditId est vide', async () => {
    // Rendu du hook avec un auditId vide
    const { result } = renderHook(() => useEvaluations(''), {
      wrapper: createWrapper()
    });
    
    // Vérifier que la requête n'a pas été déclenchée
    expect(result.current.isLoading).toBe(false);
    expect(notionApi.getEvaluations).not.toHaveBeenCalled();
  });
});
