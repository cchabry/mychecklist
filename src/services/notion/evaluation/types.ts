
/**
 * Types pour le service d'évaluations
 */
import { ComplianceLevel } from '@/types/enums';
import { Attachment } from '@/types/domain';

/**
 * Type pour la création d'une évaluation
 */
export interface CreateEvaluationInput {
  auditId: string;
  pageId: string;
  exigenceId: string;
  score: ComplianceLevel;
  comment?: string;
  attachments?: Attachment[];
}

/**
 * Type pour la mise à jour d'une évaluation
 */
export interface UpdateEvaluationInput {
  id: string;
  score?: ComplianceLevel;
  comment?: string;
  attachments?: Attachment[];
}
