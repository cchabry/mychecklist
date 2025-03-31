
/**
 * Statut de conformité pour une évaluation
 */
export enum ComplianceStatus {
  Compliant = "Conforme",
  PartiallyCompliant = "Partiellement conforme",
  NonCompliant = "Non conforme",
  NotApplicable = "Non applicable"
}

/**
 * Type représentant une évaluation
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
