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
    isMockMode: vi.fn()
  }
}));

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
  });

  describe('getEvaluations', () => {
    it('devrait retourner une erreur si la configuration est manquante', async () => {
      // Configuration du mock pour simuler l'absence de configuration
      vi.mocked(notionClient.getConfig).mockReturnValue(undefined as unknown as NotionConfig);
      
      const result = await evaluationService.getEvaluations('audit-123');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe("Configuration Notion non disponible");
    });

    it('devrait retourner des données simulées en mode mock', async () => {
      // Configuration des mocks
      vi.mocked(notionClient.getConfig).mockReturnValue({ apiKey: 'fake-key' });
      vi.mocked(notionClient.isMockMode).mockReturnValue(true);
      
      const result = await evaluationService.getEvaluations('audit-123');
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBeGreaterThan(0);
      expect(result.data?.[0].auditId).toBe('audit-123');
    });

    it('devrait filtrer les évaluations par pageId quand spécifié', async () => {
      // Configuration des mocks
      vi.mocked(notionClient.getConfig).mockReturnValue({ apiKey: 'fake-key' });
      vi.mocked(notionClient.isMockMode).mockReturnValue(true);
      
      const result = await evaluationService.getEvaluations('audit-123', 'page-1');
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      if (result.data) {
        expect(result.data.every(evaluation => evaluation.pageId === 'page-1')).toBe(true);
      }
    });

    it('devrait filtrer les évaluations par exigenceId quand spécifié', async () => {
      // Configuration des mocks
      vi.mocked(notionClient.getConfig).mockReturnValue({ apiKey: 'fake-key' });
      vi.mocked(notionClient.isMockMode).mockReturnValue(true);
      
      const result = await evaluationService.getEvaluations('audit-123', undefined, 'exig-1');
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      if (result.data) {
        expect(result.data.every(evaluation => evaluation.exigenceId === 'exig-1')).toBe(true);
      }
    });
  });

  describe('getEvaluationById', () => {
    it('devrait retourner une évaluation par son ID en mode mock', async () => {
      // Configuration des mocks
      vi.mocked(notionClient.isMockMode).mockReturnValue(true);
      
      const result = await evaluationService.getEvaluationById('eval-1');
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('eval-1');
    });

    it('devrait retourner une erreur si l\'évaluation n\'existe pas en mode mock', async () => {
      // Configuration des mocks
      vi.mocked(notionClient.isMockMode).mockReturnValue(true);
      
      const result = await evaluationService.getEvaluationById('non-existant');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('non trouvée');
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
      // Configuration des mocks
      vi.mocked(notionClient.isMockMode).mockReturnValue(true);
      
      const result = await evaluationService.createEvaluation(createInput);
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
      expect(result.data?.auditId).toBe(createInput.auditId);
      expect(result.data?.pageId).toBe(createInput.pageId);
      expect(result.data?.exigenceId).toBe(createInput.exigenceId);
      expect(result.data?.score).toBe(createInput.score);
      expect(result.data?.comment).toBe(createInput.comment);
    });

    it('devrait assigner createdAt et updatedAt si non fournis', async () => {
      // Configuration des mocks
      vi.mocked(notionClient.isMockMode).mockReturnValue(true);
      
      const result = await evaluationService.createEvaluation(createInput);
      
      expect(result.success).toBe(true);
      expect(result.data?.createdAt).toBeDefined();
      expect(result.data?.updatedAt).toBeDefined();
    });

    it('devrait respecter createdAt et updatedAt si fournis', async () => {
      // Configuration des mocks
      vi.mocked(notionClient.isMockMode).mockReturnValue(true);
      
      const customDate = '2022-01-01T00:00:00.000Z';
      const inputWithDates = { ...createInput, createdAt: customDate, updatedAt: customDate };
      
      const result = await evaluationService.createEvaluation(inputWithDates);
      
      expect(result.success).toBe(true);
      expect(result.data?.createdAt).toBe(customDate);
      expect(result.data?.updatedAt).toBe(customDate);
    });
  });

  describe('updateEvaluation', () => {
    it('devrait mettre à jour une évaluation en mode mock', async () => {
      // Configuration des mocks
      vi.mocked(notionClient.isMockMode).mockReturnValue(true);
      
      const updatedEvaluation = { ...mockEvaluation, comment: 'Updated comment' };
      
      const result = await evaluationService.updateEvaluation(updatedEvaluation);
      
      expect(result.success).toBe(true);
      expect(result.data?.comment).toBe('Updated comment');
      expect(result.data?.updatedAt).not.toBe(mockEvaluation.updatedAt);
    });
  });

  describe('deleteEvaluation', () => {
    it('devrait supprimer une évaluation en mode mock', async () => {
      // Configuration des mocks
      vi.mocked(notionClient.isMockMode).mockReturnValue(true);
      
      const result = await evaluationService.deleteEvaluation('eval-1');
      
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });
  });
});
