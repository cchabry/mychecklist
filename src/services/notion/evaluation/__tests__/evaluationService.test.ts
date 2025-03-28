
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { evaluationService } from '../evaluationService';
import { notionClient } from '../../notionClient';
import { ComplianceLevel } from '@/types/enums';
import { Evaluation } from '@/types/domain';
import { NotionConfig } from '../../types';

// Mock du notionClient
vi.mock('../../notionClient', () => ({
  notionClient: {
    getConfig: vi.fn(),
    isMockMode: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}));

// Réactivation des tests précédemment désactivés
describe('EvaluationService', () => {
  const mockEvaluation: Evaluation = {
    id: 'eval-1',
    auditId: 'audit-123',
    pageId: 'page-123',
    exigenceId: 'exig-123',
    score: ComplianceLevel.Compliant,
    comment: 'Test comment',
    attachments: [],
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  };

  beforeEach(() => {
    // Réinitialiser tous les mocks avant chaque test
    vi.resetAllMocks();
    
    // Configuration par défaut pour les tests
    vi.mocked(notionClient.getConfig).mockReturnValue({ 
      apiKey: 'fake-key',
      evaluationsDbId: 'evaluations-db'
    } as NotionConfig);
    
    vi.mocked(notionClient.isMockMode).mockReturnValue(true);
  });

  describe('getEvaluations', () => {
    it('devrait retourner une erreur si la configuration est manquante', async () => {
      // Configuration du mock pour simuler l'absence de configuration
      vi.mocked(notionClient.getConfig).mockReturnValue(undefined as unknown as NotionConfig);
      
      const result = await evaluationService.getEvaluations('audit-123');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe("Configuration Notion non disponible");
    });

    it('devrait appeler notionClient.get avec les bons paramètres en mode réel', async () => {
      // Configurer pour le mode réel
      vi.mocked(notionClient.isMockMode).mockReturnValue(false);
      vi.mocked(notionClient.get).mockResolvedValue({
        success: true,
        data: { results: [{ properties: {} }] }
      });
      
      await evaluationService.getEvaluations('audit-123');
      
      expect(notionClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/evaluations-db/query'),
        expect.objectContaining({
          filter: expect.objectContaining({
            property: 'auditId',
            rich_text: { equals: 'audit-123' }
          })
        })
      );
    });

    it('devrait retourner des données simulées en mode mock', async () => {
      // Configuration du mock explicite
      vi.mocked(notionClient.isMockMode).mockReturnValue(true);
      
      const result = await evaluationService.getEvaluations('audit-123');
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBeGreaterThan(0);
      expect(result.data?.[0].auditId).toBe('audit-123');
    });

    it('devrait filtrer les évaluations par pageId quand spécifié', async () => {
      const result = await evaluationService.getEvaluations('audit-123', 'page-1');
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      if (result.data) {
        expect(result.data.every(evaluation => evaluation.pageId === 'page-1')).toBe(true);
      }
    });
  });

  describe('getEvaluationById', () => {
    it('devrait retourner une évaluation par son ID en mode mock', async () => {
      const result = await evaluationService.getEvaluationById('eval-1');
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('eval-1');
    });

    it('devrait appeler notionClient.get avec le bon ID en mode réel', async () => {
      // Configurer pour le mode réel
      vi.mocked(notionClient.isMockMode).mockReturnValue(false);
      vi.mocked(notionClient.get).mockResolvedValue({
        success: true,
        data: { properties: {} }
      });
      
      await evaluationService.getEvaluationById('eval-1');
      
      expect(notionClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/eval-1')
      );
    });

    it('devrait gérer les erreurs en mode réel', async () => {
      // Configurer pour le mode réel
      vi.mocked(notionClient.isMockMode).mockReturnValue(false);
      vi.mocked(notionClient.get).mockResolvedValue({
        success: false,
        error: { message: 'Erreur test' }
      });
      
      const result = await evaluationService.getEvaluationById('invalid-id');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Erreur test');
    });
  });

  describe('createEvaluation', () => {
    const createInput = {
      auditId: 'audit-123',
      pageId: 'page-123',
      exigenceId: 'exig-123',
      score: ComplianceLevel.Compliant,
      comment: 'Test comment',
      attachments: []
    };

    it('devrait créer une évaluation en mode mock', async () => {
      const result = await evaluationService.createEvaluation(createInput);
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
      expect(result.data?.auditId).toBe(createInput.auditId);
      expect(result.data?.pageId).toBe(createInput.pageId);
      expect(result.data?.score).toBe(createInput.score);
    });

    it('devrait appeler notionClient.post avec les bonnes données en mode réel', async () => {
      // Configurer pour le mode réel
      vi.mocked(notionClient.isMockMode).mockReturnValue(false);
      vi.mocked(notionClient.post).mockResolvedValue({
        success: true,
        data: { id: 'new-eval-id', properties: {} }
      });
      
      await evaluationService.createEvaluation(createInput);
      
      expect(notionClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/pages'),
        expect.objectContaining({
          parent: { database_id: 'evaluations-db' }
        })
      );
    });

    it('devrait assigner createdAt et updatedAt si non fournis', async () => {
      const result = await evaluationService.createEvaluation(createInput);
      
      expect(result.success).toBe(true);
      expect(result.data?.createdAt).toBeDefined();
      expect(result.data?.updatedAt).toBeDefined();
    });
  });

  describe('updateEvaluation', () => {
    it('devrait mettre à jour une évaluation en mode mock', async () => {
      const updatedEvaluation = { ...mockEvaluation, comment: 'Updated comment' };
      
      const result = await evaluationService.updateEvaluation(updatedEvaluation);
      
      expect(result.success).toBe(true);
      expect(result.data?.comment).toBe('Updated comment');
      expect(result.data?.updatedAt).not.toBe(mockEvaluation.updatedAt);
    });

    it('devrait appeler notionClient.patch avec les bonnes données en mode réel', async () => {
      // Configurer pour le mode réel
      vi.mocked(notionClient.isMockMode).mockReturnValue(false);
      vi.mocked(notionClient.patch).mockResolvedValue({
        success: true,
        data: { id: 'eval-1', properties: {} }
      });
      
      const updatedEvaluation = { ...mockEvaluation, comment: 'Updated comment' };
      
      await evaluationService.updateEvaluation(updatedEvaluation);
      
      expect(notionClient.patch).toHaveBeenCalledWith(
        expect.stringContaining('/eval-1'),
        expect.objectContaining({
          properties: expect.any(Object)
        })
      );
    });
  });

  describe('deleteEvaluation', () => {
    it('devrait supprimer une évaluation en mode mock', async () => {
      const result = await evaluationService.deleteEvaluation('eval-1');
      
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    it('devrait appeler notionClient.delete avec le bon ID en mode réel', async () => {
      // Configurer pour le mode réel
      vi.mocked(notionClient.isMockMode).mockReturnValue(false);
      vi.mocked(notionClient.delete).mockResolvedValue({
        success: true,
        data: { id: 'eval-1' }
      });
      
      await evaluationService.deleteEvaluation('eval-1');
      
      expect(notionClient.delete).toHaveBeenCalledWith(
        expect.stringContaining('/eval-1')
      );
    });

    it('devrait gérer les erreurs en mode réel', async () => {
      // Configurer pour le mode réel
      vi.mocked(notionClient.isMockMode).mockReturnValue(false);
      vi.mocked(notionClient.delete).mockResolvedValue({
        success: false,
        error: { message: 'Erreur de suppression' }
      });
      
      const result = await evaluationService.deleteEvaluation('invalid-id');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Erreur de suppression');
    });
  });
});
