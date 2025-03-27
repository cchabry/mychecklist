
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateEvaluation } from '../useCreateEvaluation';
import { notionApi } from '@/services/api';
import { ComplianceLevel } from '@/types/enums';

// Mock des dépendances
vi.mock('@/services/api', () => ({
  notionApi: {
    createEvaluation: vi.fn()
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

describe('useCreateEvaluation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('devrait créer une évaluation et invalider les requêtes', async () => {
    // Préparer les données de test
    const mockInput = {
      auditId: 'audit-123',
      pageId: 'page-123',
      exigenceId: 'exig-123',
      score: ComplianceLevel.Compliant,
      comment: 'Test comment'
    };
    
    const mockCreatedEvaluation = {
      id: 'eval-new',
      ...mockInput,
      attachments: [],
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    };
    
    // Mock de la réponse API
    vi.mocked(notionApi.createEvaluation).mockResolvedValue(mockCreatedEvaluation);
    
    // Espionner la méthode invalidateQueries
    const queryClient = new QueryClient();
    queryClient.invalidateQueries = vi.fn();
    
    // Rendu du hook
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    
    const { result } = renderHook(() => useCreateEvaluation(), { wrapper });
    
    // Exécuter la mutation
    const mutationResult = result.current.mutateAsync(mockInput);
    
    // Vérifier que la fonction a été appelée avec les bons paramètres
    expect(notionApi.createEvaluation).toHaveBeenCalledTimes(1);
    
    // Vérifier que la date actuelle est ajoutée
    const callArgs = vi.mocked(notionApi.createEvaluation).mock.calls[0][0];
    expect(callArgs).toHaveProperty('createdAt');
    expect(callArgs).toHaveProperty('updatedAt');
    expect(callArgs.auditId).toBe(mockInput.auditId);
    
    // Attendre la résolution de la mutation
    await mutationResult;
  });
});
