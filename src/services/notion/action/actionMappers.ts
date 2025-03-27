
/**
 * Mappeurs pour transformer les données d'actions correctives
 */

import { 
  CorrectiveAction, 
  ComplianceStatus, 
  ActionPriority, 
  ActionStatus,
  complianceStatusToLevel,
  actionPriorityToLevel,
  actionStatusToType
} from '@/types/domain';
import { CreateActionInput } from './types';

/**
 * Classe utilitaire pour les transformations de données d'actions correctives
 */
class ActionMappers {
  /**
   * Transforme les données d'entrée en une action corrective
   */
  mapInputToAction(input: CreateActionInput): CorrectiveAction {
    return {
      ...input,
      id: `action-${Date.now()}`,
      targetScore: typeof input.targetScore === 'number' 
        ? complianceStatusToLevel[input.targetScore as ComplianceStatus] 
        : complianceStatusToLevel[input.targetScore],
      priority: typeof input.priority === 'number' 
        ? actionPriorityToLevel[input.priority as ActionPriority] 
        : actionPriorityToLevel[input.priority],
      status: typeof input.status === 'number' 
        ? actionStatusToType[input.status as ActionStatus] 
        : actionStatusToType[input.status]
    };
  }

  /**
   * Crée une action fictive pour les tests ou le mode démo
   */
  createMockAction(id: string): CorrectiveAction {
    return {
      id,
      evaluationId: 'mock-evaluation',
      targetScore: complianceStatusToLevel[ComplianceStatus.Compliant],
      priority: actionPriorityToLevel[ActionPriority.High],
      dueDate: new Date().toISOString(),
      responsible: 'John Doe',
      comment: "Action corrective prioritaire",
      status: actionStatusToType[ActionStatus.InProgress]
    };
  }
}

// Exporter une instance singleton
export const actionMappers = new ActionMappers();

// Export par défaut
export default actionMappers;
