/**
 * Utilitaires pour générer des données mock d'actions correctives et de progrès
 */

import { 
  CorrectiveAction, 
  ActionProgress
} from '@/types/domain';
import { 
  ComplianceStatus, 
  ActionPriority, 
  ActionStatus,
  complianceStatusToLevel,
  actionPriorityToLevel,
  actionStatusToType
} from '@/types/domain/actionStatus';

/**
 * Génère un tableau d'actions correctives simulées pour une évaluation donnée
 * 
 * @param evaluationId - ID de l'évaluation pour laquelle générer des actions
 * @param count - Nombre d'actions à générer (défaut: 3)
 * @returns Tableau d'actions simulées
 */
export function generateMockActions(evaluationId: string, count: number = 3): CorrectiveAction[] {
  const actions: CorrectiveAction[] = [];
  
  for (let i = 1; i <= count; i++) {
    // Générer des statuts différents selon l'index pour la variété
    const priorityIndex = i % 4 as ActionPriority;
    const statusIndex = i % 3 as ActionStatus;
    
    // Créer une date d'échéance dans le futur
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7 * i);
    
    actions.push({
      id: `action-${evaluationId}-${i}`,
      evaluationId,
      targetScore: complianceStatusToLevel[ComplianceStatus.Compliant],
      priority: actionPriorityToLevel[priorityIndex],
      dueDate: dueDate.toISOString(),
      responsible: `Responsable ${i}`,
      comment: `Action corrective ${i} pour l'évaluation ${evaluationId}`,
      status: actionStatusToType[statusIndex]
    });
  }
  
  return actions;
}

/**
 * Génère un tableau de progrès simulés pour une action donnée
 * 
 * @param actionId - ID de l'action pour laquelle générer des progrès
 * @param count - Nombre de progrès à générer (défaut: 2)
 * @returns Tableau de progrès simulés
 */
export function generateMockProgress(actionId: string, count: number = 2): ActionProgress[] {
  const progress: ActionProgress[] = [];
  
  for (let i = 1; i <= count; i++) {
    // Générer des statuts différents selon l'index pour la variété
    const statusIndex = i % 3 as ActionStatus;
    const scoreIndex = i % 4 as ComplianceStatus;
    
    // Créer une date dans le passé
    const date = new Date();
    date.setDate(date.getDate() - (count - i) * 3);
    
    progress.push({
      id: `progress-${actionId}-${i}`,
      actionId,
      date: date.toISOString(),
      responsible: `Responsable ${i}`,
      comment: `Suivi ${i} pour l'action ${actionId}`,
      score: complianceStatusToLevel[scoreIndex],
      status: actionStatusToType[statusIndex]
    });
  }
  
  return progress;
}
