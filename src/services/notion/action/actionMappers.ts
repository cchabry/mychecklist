
/**
 * Mappeurs pour transformer les données d'actions correctives
 */

import { v4 as uuidv4 } from 'uuid';
import { CorrectiveAction } from '@/types/domain';
import { 
  ComplianceStatus, 
  ActionPriority, 
  ActionStatus,
  complianceStatusToLevel,
  actionPriorityToLevel,
  actionStatusToType
} from '@/types/domain/actionStatus';
import { CreateActionInput } from './types';
import { ComplianceLevel, PriorityLevel, StatusType } from '@/types/enums';

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
      id: `action-${uuidv4()}`,
      targetScore: typeof input.targetScore === 'string' 
        ? input.targetScore as ComplianceLevel
        : this.getComplianceLevelFromStatus(input.targetScore as ComplianceStatus), 
      priority: typeof input.priority === 'string'
        ? input.priority as PriorityLevel
        : this.getPriorityLevelFromStatus(input.priority as ActionPriority),
      status: typeof input.status === 'string'
        ? input.status as StatusType
        : this.getStatusTypeFromStatus(input.status as ActionStatus)
    };
  }

  /**
   * Crée une action fictive pour les tests ou le mode démo
   */
  createMockAction(id: string): CorrectiveAction {
    return {
      id,
      evaluationId: 'mock-evaluation',
      targetScore: ComplianceLevel.Compliant,
      priority: PriorityLevel.High,
      dueDate: new Date().toISOString(),
      responsible: 'John Doe',
      comment: "Action corrective prioritaire",
      status: StatusType.InProgress
    };
  }

  /**
   * Convertit un ComplianceStatus en ComplianceLevel
   */
  private getComplianceLevelFromStatus(status: ComplianceStatus): ComplianceLevel {
    return complianceStatusToLevel[status];
  }

  /**
   * Convertit un ActionPriority en PriorityLevel
   */
  private getPriorityLevelFromStatus(priority: ActionPriority): PriorityLevel {
    return actionPriorityToLevel[priority];
  }

  /**
   * Convertit un ActionStatus en StatusType
   */
  private getStatusTypeFromStatus(status: ActionStatus): StatusType {
    return actionStatusToType[status];
  }
}

// Exporter une instance singleton
export const actionMappers = new ActionMappers();

// Export par défaut
export default actionMappers;
