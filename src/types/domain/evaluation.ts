
/**
 * Types pour les évaluations d'exigences
 */

/**
 * Statut de conformité d'une évaluation
 */
export enum ComplianceStatus {
  NotEvaluated = 'not-evaluated',
  NonCompliant = 'non-compliant',
  PartiallyCompliant = 'partially-compliant',
  Compliant = 'compliant',
  NotApplicable = 'not-applicable'
}

/**
 * Évaluation d'une exigence sur une page
 */
export interface Evaluation {
  id: string;
  auditId: string;
  pageId: string;
  exigenceId: string;
  score: ComplianceStatus;
  comment?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}
