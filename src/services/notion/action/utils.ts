
/**
 * Utilitaires pour les actions correctives
 */

import { CorrectiveAction, ActionProgress, ComplianceLevel, ActionPriority, ActionStatus } from '@/types/domain';

/**
 * Génère des actions correctives fictives pour le mode démo
 */
export function generateMockActions(evaluationId: string): CorrectiveAction[] {
  const now = new Date().toISOString();
  
  return [
    {
      id: 'action-1',
      evaluationId,
      targetScore: ComplianceLevel.Compliant,
      priority: ActionPriority.High,
      dueDate: getFutureDateString(7), // dans 1 semaine
      responsible: 'John Doe',
      comment: "Ajouter des attributs alt à toutes les images",
      status: ActionStatus.InProgress,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'action-2',
      evaluationId,
      targetScore: ComplianceLevel.Compliant,
      priority: ActionPriority.Medium,
      dueDate: getFutureDateString(14), // dans 2 semaines
      responsible: 'Jane Smith',
      comment: "Optimiser les images pour le web",
      status: ActionStatus.Todo,
      createdAt: now,
      updatedAt: now
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
      score: ComplianceLevel.PartiallyCompliant,
      status: ActionStatus.InProgress
    },
    {
      id: 'progress-2',
      actionId,
      date: yesterday.toISOString(),
      responsible: 'John Doe',
      comment: "50% des images corrigées",
      score: ComplianceLevel.PartiallyCompliant,
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
