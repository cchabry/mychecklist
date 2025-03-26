
/**
 * Interface pour l'API des actions correctives et des progrès
 */

import { CorrectiveAction, ActionProgress } from '@/types/domain';

export interface ActionApi {
  // Actions correctives
  getActions(evaluationId: string): Promise<CorrectiveAction[]>;
  getActionById(id: string): Promise<CorrectiveAction>;
  createAction(action: Omit<CorrectiveAction, 'id' | 'createdAt' | 'updatedAt'>): Promise<CorrectiveAction>;
  updateAction(action: CorrectiveAction): Promise<CorrectiveAction>;
  deleteAction(id: string): Promise<boolean>;
  
  // Progrès d'actions
  getActionProgress(actionId: string): Promise<ActionProgress[]>;
  getActionProgressById(id: string): Promise<ActionProgress>;
  createActionProgress(progress: Omit<ActionProgress, 'id'>): Promise<ActionProgress>;
  updateActionProgress(progress: ActionProgress): Promise<ActionProgress>;
  deleteActionProgress(id: string): Promise<boolean>;
}
