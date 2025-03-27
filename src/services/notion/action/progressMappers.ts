
/**
 * Mappeurs pour transformer les données de progrès d'actions correctives
 */

import { 
  ActionProgress, 
  ComplianceStatus, 
  ActionStatus,
  complianceStatusToLevel,
  actionStatusToType
} from '@/types/domain';
import { CreateProgressInput } from './types';

/**
 * Classe utilitaire pour les transformations de données de progrès d'actions
 */
class ProgressMappers {
  /**
   * Transforme les données d'entrée en un progrès d'action
   */
  mapInputToProgress(input: CreateProgressInput): ActionProgress {
    return {
      ...input,
      id: `progress-${Date.now()}`,
      score: typeof input.score === 'number' 
        ? complianceStatusToLevel[input.score as ComplianceStatus] 
        : complianceStatusToLevel[input.score],
      status: typeof input.status === 'number' 
        ? actionStatusToType[input.status as ActionStatus] 
        : actionStatusToType[input.status]
    };
  }

  /**
   * Crée un progrès fictif pour les tests ou le mode démo
   */
  createMockProgress(id: string): ActionProgress {
    return {
      id,
      actionId: 'mock-action',
      date: new Date().toISOString(),
      responsible: 'Jane Doe',
      comment: "Progrès sur l'action corrective",
      score: complianceStatusToLevel[ComplianceStatus.PartiallyCompliant],
      status: actionStatusToType[ActionStatus.InProgress]
    };
  }
}

// Exporter une instance singleton
export const progressMappers = new ProgressMappers();

// Export par défaut
export default progressMappers;
