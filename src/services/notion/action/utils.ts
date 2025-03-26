
/**
 * Utilitaires pour les actions correctives
 */

import { CorrectiveAction, ActionProgress, ComplianceStatus, ActionPriority, ActionStatus } from '@/types/domain';

/**
 * Génère des actions correctives fictives pour le mode démo
 */
export function generateMockActions(evaluationId: string): CorrectiveAction[] {
  return [
    {
      id: 'action-1',
      evaluationId,
      targetScore: ComplianceStatus.Compliant,
      priority: ActionPriority.High,
      dueDate: getFutureDateString(7), // dans 1 semaine
      responsible: 'John Doe',
      comment: "Ajouter des attributs alt à toutes les images",
      status: ActionStatus.InProgress
    },
    {
      id: 'action-2',
      evaluationId,
      targetScore: ComplianceStatus.Compliant,
      priority: ActionPriority.Medium,
      dueDate: getFutureDateString(14), // dans 2 semaines
      responsible: 'Jane Smith',
      comment: "Optimiser les images pour le web",
      status: ActionStatus.Todo
    }
  ];
}

/**
 * Génère des suivis de progrès fictifs pour le mode démo
 */
export function generateMockActionProgress(actionId: string): ActionProgress[] {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  return [
    {
      id: 'progress-1',
      actionId,
      date: lastWeek.toISOString(),
      responsible: 'John Doe',
      comment: "Début des corrections",
      score: ComplianceStatus.PartiallyCompliant,
      status: ActionStatus.InProgress
    },
    {
      id: 'progress-2',
      actionId,
      date: yesterday.toISOString(),
      responsible: 'John Doe',
      comment: "50% des images corrigées",
      score: ComplianceStatus.PartiallyCompliant,
      status: ActionStatus.InProgress
    }
  ];
}

/**
 * Utilitaire pour générer une date future au format ISO
 */
export function getFutureDateString(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
}
