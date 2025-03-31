
import { nanoid } from 'nanoid';
import { 
  ActionPriority, 
  ActionStatus, 
  CorrectiveAction, 
  ActionProgress 
} from '@/types/domain/action';
import { ComplianceStatus } from '@/types/domain/evaluation';

/**
 * Génère une date future (pour les dates d'échéance)
 */
export function getFutureDateString(daysInFuture: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysInFuture);
  return date.toISOString().split('T')[0];
}

/**
 * Génère des actions correctives simulées pour une évaluation
 */
export function generateMockActions(evaluationId: string): CorrectiveAction[] {
  return [
    {
      id: `action-${nanoid(6)}`,
      evaluationId,
      targetScore: ComplianceStatus.Compliant,
      priority: ActionPriority.High,
      dueDate: getFutureDateString(14),
      responsible: 'John Doe',
      comment: 'Ajouter des attributs alt à toutes les images du site',
      status: ActionStatus.ToDo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `action-${nanoid(6)}`,
      evaluationId,
      targetScore: ComplianceStatus.PartiallyCompliant,
      priority: ActionPriority.Medium,
      dueDate: getFutureDateString(7),
      responsible: 'Jane Smith',
      comment: 'Améliorer les contrastes des textes sur fond coloré',
      status: ActionStatus.InProgress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `action-${nanoid(6)}`,
      evaluationId,
      targetScore: ComplianceStatus.Compliant,
      priority: ActionPriority.Critical,
      dueDate: getFutureDateString(3),
      responsible: 'Tech Team',
      comment: 'Réparer la navigation clavier dans le menu principal',
      status: ActionStatus.InProgress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];
}

/**
 * Génère des suivis de progrès simulés pour une action
 */
export function generateMockActionProgress(actionId: string): ActionProgress[] {
  return [
    {
      id: `progress-${nanoid(6)}`,
      actionId,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      comment: 'Action créée et assignée à l\'équipe',
      newStatus: ActionStatus.ToDo,
      author: 'System',
    },
    {
      id: `progress-${nanoid(6)}`,
      actionId,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      comment: 'Début des travaux sur cette action',
      newStatus: ActionStatus.InProgress,
      author: 'John Doe',
    },
    {
      id: `progress-${nanoid(6)}`,
      actionId,
      date: new Date().toISOString(),
      comment: 'Mise à jour: 60% des modifications effectuées',
      author: 'Jane Smith',
    }
  ];
}
