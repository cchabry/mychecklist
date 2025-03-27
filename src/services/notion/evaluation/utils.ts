
/**
 * Utilitaires pour le service d'évaluation
 */

import { Evaluation } from '@/types/domain';
import { ComplianceLevel } from '@/types/enums';

/**
 * Génère des évaluations fictives pour le mode démo
 * 
 * @param auditId - ID de l'audit 
 * @param pageId - Filtre par ID de page (optionnel)
 * @param exigenceId - Filtre par ID d'exigence (optionnel)
 * @returns Liste d'évaluations fictives
 */
export function generateMockEvaluations(auditId: string, pageId?: string, exigenceId?: string): Evaluation[] {
  const mockEvaluations: Evaluation[] = [
    {
      id: 'eval-1',
      auditId,
      pageId: 'page-1',
      exigenceId: 'exig-1',
      score: ComplianceLevel.Compliant,
      comment: "Cette page respecte parfaitement l'exigence",
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'eval-2',
      auditId,
      pageId: 'page-2',
      exigenceId: 'exig-1',
      score: ComplianceLevel.PartiallyCompliant,
      comment: "Cette page respecte partiellement l'exigence",
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'eval-3',
      auditId,
      pageId: 'page-1',
      exigenceId: 'exig-2',
      score: ComplianceLevel.NonCompliant,
      comment: "Cette page ne respecte pas l'exigence",
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  // Filtrer selon pageId et exigenceId si fournis
  return mockEvaluations.filter(evaluation => {
    if (pageId && evaluation.pageId !== pageId) {
      return false;
    }
    if (exigenceId && evaluation.exigenceId !== exigenceId) {
      return false;
    }
    return true;
  });
}
